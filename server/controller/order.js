const cartDb = require("../model/cartSchema");
const orderDb = require("../model/orderSchema");
const addressDb = require("../model/addressSchema");
const { ObjectId } = require("mongodb");

const Razorpay = require("razorpay");
const { RAZORPAY_ID_KEY , RAZORPAY_SECRET_KEY } = process.env;

const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_ID_KEY,
  key_secret: RAZORPAY_SECRET_KEY
});

exports.placeOrder = async (req,res) => {
  const uId = req.session.passport.user;
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


      let order = new orderDb({
        userId: uId,
        orderItems: products,
        paymentMethod: req.body.payMethod,
        address: address
      })

      await order.save();

      if(req.body.payMethod === "COD"){
        res.render("orderPlaced");
      }
      else{

        const amount = req.body.amount * 100;
        const options = {
          amount: amount,
          currency: "INR",
          receipt: "admin@gmail.com"
        }

        try{
          const orders = await razorpayInstance.orders.create(options);

          console.log(orders);

          res.json({orders, key_id: RAZORPAY_ID_KEY , orderId: order._id });
        }catch(err){
          console.log(err);
          res.send(false)
        }
        

        
      }
      

    }
  }catch(err){
    console.log(err);
    res.send("internal server error")
  }
}

exports.find = (req,res) => {
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
        if(!data){
          res.status(404).send({ message: "user not found with id "+ id })
        }
        else{
          console.log(data);
          res.send(data)
        }
      })
      .catch(err => {
        res.status(500).send({message: "Error retrieving user with id "+id})
      })

  }
  else{
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

exports.findItem = async (req,res) => {
  const id = req.query.id;
  const pId = req.query.pId;

    try{
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

    }catch(err){
      res.status(500).send({ message: err.message })
    }
      

}

exports.update = async (req,res) => {
  const id = req.query.id;
  const pId = req.query.pId;

  try{
    await orderDb.updateOne({_id: id, "orderItems.productId": pId},{$set: 
      {
        "orderItems.$.orderStatus": req.body.status
      }
    });

    const referer = req.get("Referer")

    res.redirect(referer);

  }catch(err){
    console.log(err);
    res.send("internal server error")
  }
}


exports.showOrders = async (req,res)=>{
  const uId = req.params.uId;
  const oId = req.params.oId;

  try{

    if(oId){

      const order = await orderDb.findOne({ userId: uId, _id: oId });
  
      res.send(order);
  
    } else {

      let orders = await orderDb.find({userId: uId});

      if(orders===null){
        res.send(false);
      }else {
        res.send(orders);
      }

    
    }
    

  }catch(err){
    console.log(err.message);
    res.send("internal server error")
  }
}