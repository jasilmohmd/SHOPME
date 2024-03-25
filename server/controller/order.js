const productDb = require("../model/productSchema")
const cartDb = require("../model/cartSchema");
const orderDb = require("../model/orderSchema");
const addressDb = require("../model/addressSchema");
const { ObjectId } = require("mongodb");

const Razorpay = require("razorpay");
const walletDb = require("../model/walletSchema");
const { error } = require("console");
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_ID_KEY,
  key_secret: RAZORPAY_SECRET_KEY
});

exports.placeOrder = async (req, res) => {
  const uId = req.session.passport.user;
  const place = req.query.place;

  try {
    if (place === "cart") {
      let items = req.session.order;

      let products = [];

      items.forEach((product) => {
        products.push({
          productId: product.cartItems.productId,
          quantity: product.cartItems.quantity,
          pName: product.productDetails[0].pName,
          bName: product.productDetails[0].bName,
          category: product.productDetails[0].category,
          subTitle: product.productDetails[0].subTitle,
          descriptionHead: product.productDetails[0].descriptionHead,
          description: product.productDetails[0].description,
          price: product.productDetails[0].lastPrice,
          couponDiscount: product.productDetails[0].couponDiscount,
          mrp: product.productDetails[0].firstPrice,
          discount: product.productDetails[0].discount,
          colour: product.productDetails[0].colour,
          image: product.productDetails[0].image
        })
      })

      const aId = req.body.aId;

      const adb = await addressDb.aggregate([
        { $match: { userId: new ObjectId(uId) } },
        { $unwind: "$addresses" },
        { $match: { "addresses._id": new ObjectId(aId) } }
      ])


      console.log(aId);
      const address = adb[0].addresses;


      let order = {
        userId: uId,
        orderItems: products,
        paymentMethod: req.body.payMethod,
        appliedCoupon: items[0].couponCode,
        address: address
      }

      const newOrder = new orderDb(order);
      await newOrder.save();

      await cartDb.updateOne(
        { userId: req.session.passport.user },
        { $set: { cartItems: [] } }
      );

      req.session.order = null;

      if (req.body.payMethod === "COD") {

        if (req.body.amount <= 100000) {

          const oId = newOrder._id;

          await orderDb.findOneAndUpdate({ _id: oId }, { $set: { "orderItems.$[].orderStatus": "ordered" } });

          items.forEach(async (product) => {
            await productDb.updateMany({ _id: product.cartItems.productId }, { $inc: { inStock: -product.cartItems.quantity } })
          })

          res.json({ response: true, method: "COD" });

        } else {

          res.json({ response: false, method: "COD", message: "COD is only applicable for Orders below 1 Lakh" });

        }

      }
      else if (req.body.payMethod === "OP") {

        const amount = req.body.amount * 100;
        const options = {
          amount: amount,
          currency: "INR",
          receipt: "admin@gmail.com"
        }

        try {
          const orders = await razorpayInstance.orders.create(options);

          req.session.orderId = newOrder._id

          res.json({ orders, key_id: RAZORPAY_ID_KEY, order: order });
        } catch (err) {
          console.log(err);
          res.send(false)
        }

      } else {

        const uId = req.session.passport.user;
        const amount = req.body.amount;

        let wallet = await walletDb.findOne({ userId: uId })

        if (wallet) {

          if (wallet.balance >= amount) {


            await walletDb.findOneAndUpdate({ userId: uId }, { $inc: { balance: -amount } });

            const oId = newOrder._id;

            await orderDb.findOneAndUpdate({ _id: oId }, { paymentStatus: "payed" });

            wallet.transactions.push({ transactType: false, amount: amount, source: `payed for order id ${newOrder._id}` });

            wallet.save();

            await orderDb.findOneAndUpdate({ _id: oId }, { $set: { "orderItems.$[].orderStatus": "ordered" } });

            items.forEach(async (product) => {
              await productDb.updateMany({ _id: product.cartItems.productId }, { $inc: { inStock: -product.cartItems.quantity } })
            })

            await cartDb.updateOne(
              { userId: uId },
              { $set: { cartItems: [] } }
            );

            res.json({ response: true, method: "wallet" });

          }
          else {

            res.json({ response: false, method: "wallet", message: "insuficient funds in your wallet" });

          }

        } else {
          res.json({ response: false, method: "wallet", message: "Topup your wallet" });
        }
      }


    }
  } catch (err) {
    console.log(err);
    res.render("errorPage", { status: 500 });
  }
}

exports.rzpHandler = async (req, res) => {
  try {

    const crypto = require("crypto");

    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY);
    hmac.update(
      req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id
    );

    if (hmac.digest("hex") === req.body.razorpay_signature) {

      const oId = req.session.orderId;

      const order = await orderDb.findById(oId);

      await orderDb.findOneAndUpdate({ _id: oId }, { paymentStatus: "payed" })

      await orderDb.findOneAndUpdate({ _id: oId }, { $set: { "orderItems.$[].orderStatus": "ordered" } });

      order.orderItems.forEach(async (product) => {
        await productDb.updateMany({ _id: product.productId }, { $inc: { inStock: -product.quantity } })
      })

      await cartDb.updateOne(
        { userId: req.session.passport.user },
        { $set: { cartItems: [] } }
      );
      res.redirect("/orderPlaced")
    }
    else {
      res.send("order failed")
    }

  } catch (err) {
    console.log(err);
  }
}

exports.continuePayment = async (req, res) => {

  const id = req.body.id;

  const order = await orderDb.findOne({ _id: id })

  let amount = order.orderItems.reduce((total, item) => {
    if (item.orderStatus !== "cancelled") {
      return total += item.price
    } else {
      return total
    }
  }, 0);

  if (req.body.payMethod === "OP") {

    amount = amount * 100;

    const options = {
      amount: amount,
      currency: "INR",
      receipt: "admin@gmail.com"
    }

    try {

      const orders = await razorpayInstance.orders.create(options);


      req.session.orderId = id

      res.json({ orders, key_id: RAZORPAY_ID_KEY, order: order });
    } catch (err) {
      console.log(err);
      res.send(err)
    }

  } else if (req.body.payMethod === "wallet") {

    const uId = req.session.passport.user;

    let wallet = await walletDb.findOne({ userId: uId })

    if (wallet) {

      if (wallet.balance >= amount) {


        await walletDb.findOneAndUpdate({ userId: uId }, { $inc: { balance: -amount } });

        await orderDb.findOneAndUpdate({ _id: id }, { paymentStatus: "payed" });

        wallet.transactions.push({ transactType: false, amount: amount, source: `payed for order id ${id}` });

        wallet.save();

        order.orderItems.forEach(async (product) => {
          await productDb.updateMany({ _id: product.productId }, { $inc: { inStock: -product.quantity } })
        })

        res.json({ response: true, method: "wallet" });

      }
      else {

        res.json({ response: false, method: "wallet", message: "insuficient funds in your wallet" });

      }

    } else {
      res.json({ response: false, method: "wallet", message: "Topup your wallet" });
    }

  }
  else if (req.body.payMethod === "COD") {

    if (amount <= 100000) {

      order.orderItems.forEach(async (product) => {
        await productDb.updateMany({ _id: product.productId }, { $inc: { inStock: -product.quantity } })
      })

      await orderDb.findOneAndUpdate({ _id: id }, { paymentStatus: "payed" });

      res.json({ response: true, method: "COD" });

    } else {

      res.json({ response: false, method: "COD", message: "COD is only applicable for Orders below 1 Lakh" });

    }

  }

}

exports.find = (req, res) => {
  if (req.query.id) {
    const id = req.query.id;

    console.log(id);

    orderDb.aggregate([

      {
        $lookup: {
          from: "userdbs",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $match: {
          _id: new ObjectId(id)
        }
      }
    ])
      .then(data => {
        if (!data) {
          res.status(404).send({ message: "user not found with id " + id })
        }
        else {
          console.log(data);
          res.send(data)
        }
      })
      .catch(err => {
        res.status(500).send({ message: "Error retrieving user with id " + id })
      })

  }
  else {
    orderDb.aggregate([
      {
        $lookup: {
          from: "userdbs",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $sort: { orderDate: - 1 }
      }
    ])
      .then(order => {
        res.status(200).send(order)
      })
      .catch(err => {
        res.status(500).send({ message: err.message })
      })
  }
}

exports.findItem = async (req, res) => {
  const id = req.query.id;
  const pId = req.query.pId;

  try {
    const order = await orderDb.aggregate([
      {
        $match: {
          _id: new ObjectId(id)
        }
      },
      {
        $unwind: "$orderItems"
      },
      {
        $match: {
          "orderItems.productId": new ObjectId(pId)
        }
      }
    ])

    console.log(id);

    const product = order[0].orderItems;

    console.log(product);

    res.status(200).send(product);

  } catch (err) {
    res.status(500).send({ message: err.message })
  }


}

exports.update = async (req, res) => {

  try {

    const id = req.query.id;
    const pId = req.query.pId;
    const status = req.body.status;

    const order = await orderDb.findOne({ _id: id, "orderItems.productId": pId });

    const uId = order.userId;

    if (status === "delivered") {

      await orderDb.findOneAndUpdate({ _id: id }, { paymentStatus: "payed" });

    }

    if (status === "pickedup") {


      const amount = order.orderItems[0].price;

      let wallet = await walletDb.findOne({ userId: uId });

      await walletDb.findOneAndUpdate({ userId: uId }, { $inc: { balance: amount } });

      wallet.transactions.push({ transactType: true, amount: amount, source: `refund for order id ${id} ` });

      await wallet.save();

      await orderDb.updateOne({ _id: id }, { paymentStatus: "refunded" });

    }

    await orderDb.updateOne({ _id: id, "orderItems.productId": pId }, {
      $set:
      {
        "orderItems.$.orderStatus": status
      }
    });


    const referer = req.get("Referer")

    res.redirect(referer);

  } catch (err) {
    console.log(err);
    res.render("errorPage", { status: 500 });
  }
}

exports.cancelOrder = async (req, res) => {

  try {
    const uId = req.session.passport.user;
    const id = req.query.id;
    const pId = req.query.pId;

    const order = await orderDb.findOne({ _id: id, "orderItems.productId": pId });


    console.log(order);

    if (order.paymentStatus === "payed") {

      const amount = order.orderItems[0].price;

      let wallet = await walletDb.findOne({ userId: uId });

      await walletDb.findOneAndUpdate({ userId: uId }, { $inc: { balance: amount } });

      wallet.transactions.push({ transactType: true, amount: amount, source: `refund for order id ${id} ` });

      await wallet.save();

      await orderDb.updateOne({ _id: id }, { paymentStatus: "refunded" });

      res.send(`refund amound of ${amount} added to your wallet`)

    }

    await orderDb.updateOne({ _id: id, "orderItems.productId": pId }, {
      $set:
      {
        "orderItems.$.orderStatus": "cancelled"
      }
    });

    const referer = req.get("Referer")

    res.redirect(referer);

  } catch (err) {
    console.log(err);
    res.render("errorPage", { status: 500 });
  }
}

exports.returnProduct = async (req, res) => {

  try {

    const id = req.query.id;
    const pId = req.query.pId;

    await orderDb.updateOne({ _id: id, "orderItems.productId": pId }, {
      $set:
      {
        "orderItems.$.orderStatus": "returned"
      }
    });

    const referer = req.get("Referer")

    res.redirect(referer);

  } catch (err) {

  }

}


exports.showOrders = async (req, res) => {
  const uId = req.params.uId;
  const oId = req.params.oId;

  try {

    if (oId) {

      const order = await orderDb.findOne({ userId: uId, _id: oId });

      res.send(order);

    } else {

      let orders = await orderDb.find({ userId: uId }).sort({ orderDate: -1 });

      if (orders === null) {
        res.send(false);
      } else {
        res.send(orders);
      }


    }


  } catch (err) {
    console.log(err.message);
    res.render("errorPage", { status: 500 });
  }
}

exports.ordersreportforgraph = async (req, res) => {
  const orders = await orderDb.aggregate([
    {
      $group: {
        _id: "$orderDate",
        count: { $sum: 1 },
      }
    },

  ])
  res.send(orders)
}

exports.topProducts = async (req, res) => {
  try {
    const orders = await orderDb.find({}).lean(); // Retrieve all orders
    const productCounts = {}; // Object to store product counts

    // Loop through each order and count products
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        const productId = item.productId.toString(); // Convert ObjectId to string
        const quantity = item.quantity; // Get quantity
        if (!productCounts[productId]) {
          productCounts[productId] = quantity; // If brand not in counts, initialize with quantity
        } else {
          productCounts[productId]+=quantity; // Increment count by quantity if brand already exists
        }
      });
    });

    // Sort product counts in descending order
    const sortedProducts = Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1]) // Sort by count in descending order
      .slice(0, 10); // Get top 10 products

    // Retrieve product names for top products
    const topProducts = await Promise.all(sortedProducts.map(async ([productId, count]) => {
      const product = await productDb.findById(productId, 'pName').lean(); // Retrieve only the product name
      return { productName: product.pName, count }; // Return only product name and count
    }));

    res.json(topProducts); // Send product counts as JSON response
  } catch (error) {
    console.error('Error retrieving product counts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.topCategories = async (req, res) => {
  try {
    const orders = await orderDb.find({}).lean(); // Retrieve all orders
    const categoryCounts = {}; // Object to store category counts

    // Loop through each order and count categories
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        const category = item.category; // Get category
        const quantity = item.quantity; // Get quantity
        if (!categoryCounts[category]) {
          categoryCounts[category] = quantity; // If brand not in counts, initialize with quantity
        } else {
          categoryCounts[category] += quantity; // Increment count by quantity if brand already exists
        }
      });
    });

    // Sort category counts in descending order
    const sortedCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1]) // Sort by count in descending order
      .slice(0, 10); // Get top 10 categories

    const topCategories = sortedCategories.map(([category, count]) => ({
      category,
      count
    }));

    res.json(topCategories); // Send top 10 categories as JSON response
  } catch (error) {
    console.error('Error retrieving top categories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.topBrands = async (req, res) => {
  try {
    const orders = await orderDb.find({}).lean(); // Retrieve all orders
    const brandCounts = {}; // Object to store brand counts

    // Loop through each order and count brands
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        const brand = item.bName; // Get brand
        const quantity = item.quantity; // Get quantity
        if (!brandCounts[brand]) {
          brandCounts[brand] = quantity; // If brand not in counts, initialize with quantity
        } else {
          brandCounts[brand] += quantity; // Increment count by quantity if brand already exists
        }
      });
    });

    // Sort brand counts in descending order
    const sortedBrands = Object.entries(brandCounts)
      .sort((a, b) => b[1] - a[1]) // Sort by count in descending order
      .slice(0, 10); // Get top 10 brands

    const topBrands = sortedBrands.map(([brand, count]) => ({
      brand,
      count
    }));

    res.json(topBrands); // Send top 10 brands as JSON response
  } catch (error) {
    console.error('Error retrieving top brands:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}