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
      let userCart = await cartDb.aggregate([
        {
          $match: { userId: new ObjectId(uId) }
        },
        {
          $unwind: "$cartItems"
        },
        {
          $lookup: {
            from: "productdbs",
            localField: "cartItems.productId",
            foreignField: "_id",
            as: "productDetails"
          }
        },
        {
          $project: {
            userId: 1,
            cartItems: 1,
            productDetails: 1
          }
        },

      ]);



      let products = [];

      userCart.forEach((product) => {
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
        address: address
      }

      req.session.order = order;

      if (req.body.payMethod === "COD") {
        const newOrder = new orderDb(order);
        await newOrder.save();

        userCart.forEach(async (product) => {
          await productDb.updateMany({ _id: product.cartItems.productId }, { $inc: { inStock: -product.cartItems.quantity } })
        })

        await cartDb.updateOne(
          { userId: req.session.passport.user },
          { $set: { cartItems: [] } }
        );

        res.json({ response: true, method: "COD" });
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

          console.log(orders);

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

            const newOrder = new orderDb(order);
            await newOrder.save();


            await walletDb.findOneAndUpdate({ userId: uId }, { $inc: { balance: -amount } });

            wallet.transactions.push({ transactType: false, amount: amount, source: `payed for order id ${newOrder._id}` });

            wallet.save();

            userCart.forEach(async (product) => {
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

        }else{
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

      const order = req.session.order;

      const newOrder = new orderDb(order);
      await newOrder.save();

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
  const id = req.query.id;
  const pId = req.query.pId;

  try {
    await orderDb.updateOne({ _id: id, "orderItems.productId": pId }, {
      $set:
      {
        "orderItems.$.orderStatus": req.body.status
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
  const id = req.query.id;
  const pId = req.query.pId;

  try {
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


exports.showOrders = async (req, res) => {
  const uId = req.params.uId;
  const oId = req.params.oId;

  try {

    if (oId) {

      const order = await orderDb.findOne({ userId: uId, _id: oId });

      res.send(order);

    } else {

      let orders = await orderDb.find({ userId: uId });

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