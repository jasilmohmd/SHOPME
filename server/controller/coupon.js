const cartDb = require("../model/cartSchema");
const couponDb = require("../model/couponSchema");
const orderDb = require("../model/orderSchema");
const { ObjectId } = require("mongodb")

exports.addCoupon = async (req, res) => {
  const priceAbove = req.body?.priceAbove || 1;
  const start = req.body.start || Date.now();
  try {
    const coupon = new couponDb({
      couponCode: req.body.couponCode,
      couponDiscount: req.body.discount,
      couponStart: start,
      couponExpiry: req.body.end,
      offerType: {
        category: req.body.category,
        priceAbove: priceAbove
      }
    })

    await coupon.save();

    res.redirect("/admin/coupon-manage");

  } catch (err) {
    console.log(err);
    res.render("errorPage", { status: 500 });
  }
}

exports.find = async (req, res) => {
  try {
    if (req.query.id) {
      const id = req.query.id;

      let coupon = await couponDb.findById(id)
      console.log(coupon);
      res.send(coupon);

    } else {
      let coupons = await couponDb.find();

      // console.log(coupons);

      res.send(coupons);
    }
  } catch (err) {
    console.log(err);
    res.send(false)
  }
}

exports.updateCoupon = async (req, res) => {
  const id = req.query.id;
  const priceAbove = req.body?.priceAbove || 1;
  const start = req.body.start || Date.now();
  try {
    await couponDb.findByIdAndUpdate({ _id: id }, {
      couponCode: req.body.couponCode,
      couponDiscount: req.body.discount,
      couponStart: start,
      couponExpiry: req.body.end,
      offerType: {
        category: req.body.category,
        priceAbove: priceAbove
      }
    })

    res.redirect("/admin/coupon-manage");

  } catch (err) {
    console.log(err);
    res.render("errorPage", { status: 500 });
  }
}

exports.deleteCoupon = async (req, res) => {
  const id = req.query.id;

  try {
    await couponDb.findByIdAndDelete(id);
    res.redirect("/admin/coupon-manage");
  } catch (err) {
    console.log(err);
    res.render("errorPage", { status: 500 });
  }
}

exports.applyCoupon = async (req, res) => {

  try {
    // const uId = req.session.passport.user;

    const couponCode = req.body.couponCode;

    // console.log(couponCode);


    const order = req.session.order;

    console.log(order);

    const cartTotal = order.reduce((total, value) => {
      total += value.productDetails[0].lastPrice
      return total;
    }, 0)

    const isCoupon = await couponDb.findOne({ couponCode });

    // Code for Invalid Coupon
    if (!isCoupon) {
      return res.json({ error: "Invalid Coupon" })
    }

    const couponCategory = isCoupon.offerType.category;
    const couponDiscount = isCoupon.couponDiscount;
    const orderAbove = isCoupon.offerType.priceAbove;

    const couponExpiryDate = new Date(isCoupon.couponExpiry);
    const couponStartDate = new Date(isCoupon.couponStart);

    // Checking Coupon Expiry
    if (couponExpiryDate < Date.now()) {
      res.json({ error: "Coupon Expired" })
    }

    // Checking Coupon Start
    else if (couponStartDate > Date.now()) {
      res.json({ error: "Coupon not Available" })
    }

    else if (couponCategory != "all") {
      const findCategory = order.some((item) => {
        if (item.productDetails[0].category == couponCategory) {
          return true
        }
      })

      if (!findCategory) {
        res.json({ error: "Cannot be applied" })
      }
      else {

        let totalCouponDiscount = 0

        order.forEach((product) => {
          if (product.productDetails[0].category == couponCategory) {
            let discount = product.productDetails[0].lastPrice * (couponDiscount / 100);
            product.productDetails[0].couponDiscount = discount
            totalCouponDiscount+=discount
          }

        });

        // Checking Orders above ..if ordervalue is less than the specified amount then cannot be applied
        if (cartTotal < orderAbove) {
          return res.json({ error: "Cannot be applied" })
        }

        order[0].couponCode = couponCode;
        order[0].totalCouponDiscount = totalCouponDiscount;

        req.session.order = order;

        console.log(order);

        res.json({ message: "Coupon Applied" })

      }

    }
    else {

      let totalCouponDiscount = 0

      order.forEach((product) => {

        let discount = product.productDetails[0].lastPrice * (couponDiscount / 100);
        product.productDetails[0].couponDiscount = discount
        totalCouponDiscount+=discount

      });

      // Checking Orders above ..if ordervalue is less than the specified amount then cannot be applied
      if (cartTotal < orderAbove) {
        return res.json({ error: "Cannot be applied" })
      }

      order[0].couponCode = couponCode;
      order[0].totalCouponDiscount = totalCouponDiscount;

      req.session.order = order;

      console.log(order);

      res.json({ message: "Coupon Applied" })

    }


  } catch (err) {
    console.log(err);
    res.render("errorPage", { status: 500 });
  }

}

exports.removeCoupon = async (req, res) => {

  try {

    let order = req.session.order;

    order[0].couponCode = null;
    order[0].totalCouponDiscount= 0;

    order.forEach( product => {
      product.productDetails[0].couponDiscount?product.productDetails[0].couponDiscount=0:"";
    })
    
    res.json({message: "coupon removed"})

  } catch (err) {

    console.log(err);
    res.render("errorPage", { status: 500 });

  }

}