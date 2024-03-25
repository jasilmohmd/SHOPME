const cartDb = require("../model/cartSchema");
const { ObjectId } = require("mongodb");
const productDb = require("../model/productSchema");

exports.checkStock = async (req, res) => {
  try {

    const uId = req.session.passport.user;

    const { 'pId[]': pIdArray } = req.body;

    // Convert pIdArray to an array of ObjectId if needed
    const pIds = Array.isArray(pIdArray) ? pIdArray : [pIdArray];

    console.log(pIds);

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
      }

    ]);

    const products = await productDb.find({ _id: { $in: pIds } });

    const outOfStockProducts = products.filter(product => product.inStock <= 0);

    if (outOfStockProducts.length === 0) {

      req.session.order = userCart

      // If all products are in stock, proceed to the next middleware
      res.send({ allProductsInStock: true })
    } else {
      res.send({ allProductsInStock: false })
    }

  } catch (err) {
    res.render("errorPage", { status: 500 });
  }
}

exports.orderItems = async (req, res) => {
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
        }

      ]);

      req.session.order = userCart

      // res.redirect("/checkout_page");

    }


  } catch (err) {
    console.log(err);
    res.render("errorPage", { status: 500 });
  }

}

exports.paymentSec = async (req, res) => {


  try {

    const place = req.query.place;

    let order = req.body.order;

    if (place === "cart") {

      if (order) {

        let price = 0;
        let mrp = 0;
        let discount = 0;
        let count = 0;

        let total, mrpTotal, totalDiscount, totalCount;

        let couponDiscount = 0

        if (order.length > 0) {
          couponDiscount = order.reduce((sum, product) => {
            if (product.productDetails[0].couponDiscount) {
              sum += product.productDetails[0].couponDiscount
              console.log(product.productDetails[0].couponDiscount);
            }
            return sum;
          }, 0)
        }

        order.forEach((product) => {
          for (let i = 0; i < product.cartItems.quantity; i++) {
            const priceElement = product.productDetails[0].lastPrice;
            price += priceElement;
            const mrpElement = product.productDetails[0].firstPrice;
            mrp += mrpElement;

            count++;
          }

        })

        mrpTotal = mrp;
        totalDiscount = mrp - price;
        total = price - couponDiscount;
        totalCount = count;

        details = { mrpTotal, totalDiscount, couponDiscount, total, totalCount }

        if (order.length > 0) {
          res.send(details);
        }
        else {
          res.send(false)
        }
      }
      else{
        res.send(false);
      }
    }


  } catch (err) {
    console.log(err);
    res.render("errorPage", { status: 500 });
  }

}