const cartDb = require("../model/cartSchema");
const { ObjectId } = require("mongodb");

exports.orderItems = async (req,res) => {
  const uId = req.params.uId;
  const place = req.query.place; 
  
  try{
    if(place === "cart"){
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
            foreignField:"_id",
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

      if(userCart.length>0){
        console.log(userCart[0].productDetails[0]);
        res.send(userCart);
      }
      else{
        res.send(false)
      }

    }
    

  }catch(err){
    console.log(err);
    req.send("internal server error")
  }

}

exports.paymentSec = async (req,res) => {
  const uId = req.params.uId;
  const place = req.query.place; 
  
  try{
    if(place === "cart"){
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
            foreignField:"_id",
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

      console.log(userCart);

      let price = 0;
      let mrp = 0;
      let discount = 0;
      let count = 0; 

      let total,mrpTotal,totalDiscount,totalCount;

      userCart.forEach((product)=> {
        for(let i=0 ; i< product.cartItems.quantity; i++){
          const priceElement = product.productDetails[0].lastPrice;
          price += priceElement;
          const mrpElement = product.productDetails[0].firstPrice;
          mrp += mrpElement;

          count++;
        }

      })

      mrpTotal = mrp;
      totalDiscount = mrp - price;
      total = price;
      totalCount = count;

      details = {mrpTotal,totalDiscount,total,totalCount}

      if(userCart.length>0){
        res.send(details);
      }
      else{
        res.send(false)
      }

    }
    

  }catch(err){
    console.log(err);
    req.send("internal server error")
  }

}