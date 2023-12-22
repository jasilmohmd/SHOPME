const axios = require('axios');
const bcrypt = require('bcrypt');
const Userdb = require("../model/userSchema");
const sendOTPVerificationEmail = require('../controller/OTPVerification');
const userOTPVerification = require('../model/userOTPVerificationSchema');

const PORT = process.env.PORT;


//Login page
exports.login = (req,res)=>{
  req.session.emailIsValid = false;
  res.render('user_login',{ isValidate: req.session.isValidate });
};



//Home page
exports.home = (req,res) => {

  // Make a get request to /api/products
  axios.all([
    axios.get(`http://localhost:${PORT}/api/category`),
    axios.get(`http://localhost:${PORT}/api/products`,)
  ])
  .then(axios.spread((response1,response2)=>{
    res.render("home",{category: response1.data, product: response2.data})
  }))
  .catch(err =>{
    res.send(err);
});

};

exports.productPage = (req,res) => {

  // Make a get request to /api/products
  axios.get(`http://localhost:${PORT}/api/products`,{ params: { id: req.query.id}})
  .then(function(response){
    res.render("product_page",{product: response.data});
  })
  .catch(err =>{
      res.send(err);
  })

};

exports.categoryPage = (req,res) => {
  axios.all([
    axios.get(`http://localhost:${PORT}/api/category`),
    axios.get(`http://localhost:${PORT}/api/categoryProducts`, { params: { id: req.query.id } })
  ])
    .then(axios.spread((response1, response2) => {
      res.render("category", { category: response1.data, product: response2.data })
    }))
    .catch(err => {
      res.send(err);
    });
}

exports.myAccount = (req,res) => {

  axios.get(`http://localhost:${PORT}/api/user`,{ params: { id: req.query.id}})
  .then(function(response){
    res.render("my_account",{user: response.data});
  })
  .catch(err =>{
      res.send(err);
  })
}

exports.addressPage = (req,res) => {
  const uId = req.session.passport.user;
  axios.get(`http://localhost:${PORT}/api/showAddresses/${uId}`,)
  .then(function(response){
    res.render("address_page",{address: response.data});
  })
  .catch(err =>{
      res.send(err);
  })

}

exports.addAddressPage = (req,res) => {
  res.render("add_address_page")
}

exports.updateAddress = (req,res) => {
  const uId = req.session.passport.user;
  const index = req.params.index;
  axios.get(`http://localhost:${PORT}/api/showAddresses/${uId}/${index}`,)
  .then(function(response){
    res.render("update_address_page",{address: response.data, index});
  })
  .catch(err =>{
      res.send(err);
  })
}

exports.cartPage = (req,res) => {
  const uId = req.session.passport.user;
  axios.get(`http://localhost:${PORT}/api/showCart/${uId}`,)
  .then(function(response){
    res.render("cart_page",{cart: response.data});
  })
  .catch(err =>{
      res.send(err);
  })
  
}

exports.checkoutPage = (req,res) => {
  const uId = req.session.passport.user;
  axios.get(`http://localhost:${PORT}/api/checkout/${uId}?place=cart`)
  .then(function(response){
    res.render("checkout_page",{cart: response.data});
  })
  .catch(err =>{
      res.send(err);
  })
  
}

exports.paymentPage = (req,res) => {
  const uId = req.session.passport.user;
  axios.all([
    axios.get(`http://localhost:${PORT}/api/paymentSec/${uId}?place=cart`),
    axios.get(`http://localhost:${PORT}/api/showAddresses/${uId}`,)
  ])
  .then(axios.spread((response1,response2) => {
    res.render("payment_page",{details: response1.data, address: response2.data });
  }))
  .catch(err =>{
    console.log(err.message);
      res.send(err);
  })

}

exports.orderPlaced = (req,res) => {
  res.render("orderPlaced")
}

//Register verification user page
exports.registerVerify = (req,res)=>{
  req.session.isValidate = false;
  res.render('user_verify', { emailIsValid: req.session.emailIsValid });
};

//Register verification 2 user page
exports.registerVerify2 = (req,res)=>{
  req.session.isValidate = false;
  res.render('user_verify2', { emailIsValid: req.session.emailIsValid });
};


//resend otp
exports.resendOTP = async (req,res)=>{
  try{
    let{userId,email} = req.body;

    if ( !userId || !email ){
      throw Error("Empty user details are not allowed")
    }
    else{
      //delete existing records and resend
      await userOTPVerification.deleteMany({ userId });
      sendOTPVerificationEmail({ _id: userId, email }, res);
    }

  }
  catch(err){
    res.json({
      status: "FAILED",
      message: err.message
    })
  }
}

//Register user page
exports.register = (req,res)=>{
  req.session.isValidate = false;
  res.render('user_register', { emailIsValid: req.session.emailIsValid });
};

//Register user page POST
exports.registerPost = async (req,res)=>{
  try{
    console.log(req.body);
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const user= new Userdb({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: hashedPassword
    })

    await user.save()
    res.redirect('/')
  }catch {
    res.redirect('/register')
  }
};

exports.userBlocked = (req,res) => {
  res.render("user_blocked")
}

//User logout
exports.logoutUser = async (req, res) => {
  // req.logOut()  
  const id = req.session.passport.user;

  await Userdb.findByIdAndUpdate({_id: id},{$set:{status:"Inactive"}});
  delete req.session.passport.user;
  res.redirect('/')

}
