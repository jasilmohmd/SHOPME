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
    res.send("internal server error")
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
    res.send("internal server error")
  }
}

exports.deleteCoupon = async (req, res) => {
  const id = req.query.id;

  try {
    await couponDb.findByIdAndDelete(id);
    res.redirect("/admin/coupon-manage");
  } catch (err) {
    console.log(err);
    res.send("internal server error")
  }
}

exports.applyCoupon = async (req, res) => {

  try {
    const uId = req.session.passport.user;

    const couponCode = req.body.couponCode;

    // console.log(couponCode);


    const order = await cartDb.aggregate([
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
      
    ])

    
    const cartTotal = order.reduce((total, value) => {
      total+= value.productDetails[0].lastPrice
      return total;
    },0)
    
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

        const totalapplied = order.reduce((sum, product) => {
          if (product.productDetails[0].category == couponCategory) {
            sum += product.productDetails[0].lastPrice
          }
          return sum;
        
        }, 0);

        const totalDiscount = totalapplied * (couponDiscount / 100);
        console.log(totalapplied);

        // Checking Orders above ..if ordervalue is less than the specified amount then cannot be applied
        if (cartTotal < orderAbove) {
          return res.json({ error: "Cannot be applied" })
        }

        await applyCouponinOrder(couponCode, totalDiscount, res)

      }

    }
    else {

      const totalDiscount = cartTotal * (couponDiscount / 100);

      // Checking Orders above ..if ordervalue is less than the specified amount then cannot be applied
      if (cartTotal < orderAbove) {
        return res.json({ error: "Cannot be applied" })
      }

      await applyCouponinOrder(couponCode, totalDiscount, res)

    }

    // Function for applying coupon in the cartdb 
    async function applyCouponinOrder(couponCode, totalDiscount, res) {
      await cartDb.findOneAndUpdate({ userId: uId }, { $set: { appliedCoupon: couponCode , couponDiscount: totalDiscount} })
      res.json({ message: "Coupon applied" })
    }


  } catch (err) {
    console.log(err);
  }

}

exports.removeCoupon = async (req, res) => {

  try {

    const uId = req.session.passport.user;

    // const order = await cartDb.findById(uId)

    await cartDb.findOneAndUpdate({ userId: uId }, { $set: { appliedCoupon: null, couponDiscount: 0 } });
    res.json({ message: "Coupon removed" })

  } catch (err) {

    console.log(err);

  }

}