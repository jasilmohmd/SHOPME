const cartDb = require("../model/cartSchema");
const productDb = require("../model/productSchema");
const { ObjectId } = require("mongodb")

exports.addToCart = async (req,res) => {

  const uId = req.session.passport.user;
  const pId = req.params.pId;

  try{
    // find user cart
    let userCart = await cartDb.findOne({userId: uId});

    // create new user cart if none exists
    if(!userCart){
      userCart = new cartDb({
        userId: uId,
        cartItems: [
          {
            productId: pId,
            quantity: 1
          }
        ]
      })
    }
    else{
      //check item already in cart
      const existingUserItem = userCart.cartItems.find(item => item.productId.toString() === pId);

      //add quantity if item already exists
      if(existingUserItem){
        existingUserItem.quantity += 1;
      }
      else{
        // add item if its not in the cart
        userCart.cartItems.push({
          productId: pId,
          quantity: 1
        })
      }
    }

    

    await userCart.save();
    
    res.send(`Product added to cart`)
  } 
  catch(err){
    console.log(err);
    res.send("internal server error");
  }
  
} 


exports.showCart = async (req,res) => {
  const uId = req.params.uId;
  
  try{
    //find user cart
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
      console.log(userCart);
      res.send(userCart);
    }
    else{
      res.send(false)
    }

  }catch(err){
    console.log(err);
    res.send("internal server error");
  }
}

exports.removeFromCart = async (req,res) => {
  const uId = req.session.passport.user;
  const pId = req.params.pId;

  try{
    let userCart = await cartDb.findOne({userId: uId});


    const index = userCart.cartItems.findIndex((value) => {
      return value.productId.toString() === pId
    }) 

    if(index !== -1){

      userCart.cartItems.splice(index,1);

      await userCart.save();

      res.redirect("/cart_page")
    }

    

  }catch(err){
    res.send("internal server error")
  }
}

exports.updateCart = async (req,res) => {
  const uId = req.session.passport.user;
  const pId = req.params.pId;
  const qty = req.query.qty;

  try{
    

    const cart = await cartDb.findOneAndUpdate({userId: uId, "cartItems.productId": pId},{ $set:{"cartItems.$.quantity": qty}});

    console.log(cart);

    res.send(true);

  }catch(err){
    console.log(err);
    res.send(false);
  }
}