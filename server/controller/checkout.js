const cartDb = require("../model/cartSchema");
const { ObjectId } = require("mongodb");
const productDb = require("../model/productSchema");

exports.checkStock = async (req,res) => {
  try{
    
    const { 'pId[]': pIdArray } = req.body;
    
    // Convert pIdArray to an array of ObjectId if needed
    const pIds = Array.isArray(pIdArray) ? pIdArray : [pIdArray];

    console.log(pIds);
    
    const products = await productDb.find({_id: {$in: pIds}});

    const outOfStockProducts = products.filter(product => product.inStock <= 0);

    if (outOfStockProducts.length === 0) {
      // If all products are in stock, proceed to the next middleware
      res.send({allProductsInStock:true})
    } else {
      res.send({allProductsInStock:false})
    }

  }catch(err){
    res.render("errorPage", { status: 500 });
  }
}

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
        }
        
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
    res.render("errorPage", { status: 500 });
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
        }
        
      ]);

      console.log(userCart);

      let price = 0;
      let mrp = 0;
      let discount = 0;
      let count = 0; 

      let total,mrpTotal,totalDiscount,totalCount;
      
      let couponDiscount = 0

      if(userCart.length>0){
        couponDiscount = userCart[0].couponDiscount
      }

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
      total = price-couponDiscount;
      totalCount = count;

      details = {mrpTotal,totalDiscount,couponDiscount,total,totalCount}

      if(userCart.length>0){
        res.send(details);
      }
      else{
        res.send(false)
      }

    }
    

  }catch(err){
    console.log(err);
    res.render("errorPage", { status: 500 });
  }

}