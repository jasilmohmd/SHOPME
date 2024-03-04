const couponDb = require("../model/couponSchema");

exports.addCoupon = async (req,res)=> {
  const priceAbove = req.body?.priceAbove || 1;
  const start = req.body.start || Date.now();
  try{
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

  }catch(err){
    console.log(err);
    res.send("internal server error")
  }
}

exports.find = async (req,res)=> {
  try{
    if(req.query.id){

    }else {
      let coupons = await couponDb.find();

      console.log(coupons);

      res.send(coupons);
    }
  }catch(err){
    console.log(err);
    res.send(false)
  }
}