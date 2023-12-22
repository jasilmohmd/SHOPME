const express = require('express');
const route = express.Router()
const passport = require("passport")

const services = require('../services/user_render');
const OTPVerification = require("../controller/OTPVerification");
const middleware = require("../middleware/middleware")
const product = require("../controller/product");
const category = require("../controller/category");
const user = require("../controller/user");
const cart = require("../controller/cart");
const address = require("../controller/addresses");
const checkout = require("../controller/checkout");
const order = require("../controller/order");


//Login Page render
route.get('/', middleware.checkNotAuthenticated, services.login);


//Login Post
route.post('/login', middleware.checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/',
  failureFlash: true
}));

//Home page render
route.get('/home', middleware.isBlocked, middleware.checkAuthenticated , services.home);

//product page render
route.get("/product_page", middleware.isBlocked, middleware.checkAuthenticated, services.productPage );

//category pages render
route.get("/category_page", middleware.isBlocked, middleware.checkAuthenticated, services.categoryPage);

//my account page render
route.get("/my_account", middleware.isBlocked, middleware.checkAuthenticated, services.myAccount);

//addresses page render
route.get("/address_page", services.addressPage);

//add address page render
route.get("/add-address-page", services.addAddressPage);

//update address page render
route.get("/update-address/:index" , services.updateAddress)

//cart page render
route.get("/cart_page", middleware.isBlocked, middleware.checkAuthenticated, services.cartPage);

//checkout page render
route.get("/checkout_page", middleware.isBlocked, middleware.checkAuthenticated, services.checkoutPage);

//payment page render
route.get("/payment_page", middleware.isBlocked, middleware.checkAuthenticated, services.paymentPage);

//order placed
route.get("/orderPlaced",middleware.isBlocked, middleware.checkAuthenticated, services.orderPlaced)

//Register verify render
route.get("/register_verify", middleware.checkNotAuthenticated, services.registerVerify);

//Register verify post
route.post("/register_verify", middleware.checkNotAuthenticated, OTPVerification.otp);

//Register verify 2 render
route.get("/register_verify2", middleware.checkNotAuthenticated, services.registerVerify2);

//Register verify 2 post
route.post("/register_verify2", middleware.checkNotAuthenticated, OTPVerification.otpVerification );

//resend otp verification
route.post("/resendOTP",middleware.checkNotAuthenticated, services.resendOTP)

//Register page render
route.get("/register", middleware.checkNotAuthenticated, services.register);

//Register Post
route.post('/register', middleware.checkNotAuthenticated, services.registerPost);

//user blocked render
route.get("/user-blocked", services.userBlocked)

//User logout
route.get("/logout", services.logoutUser);



//api

//get products
route.get("/api/products", product.find);


//get category
route.get("/api/category", category.find);

//get products of a category
route.get("/api/categoryProducts", category.findProducts);

//get user
route.get("/api/user", user.find);

//add to cart
route.post("/api/addToCart/:pId", cart.addToCart);

//show items in cart
route.get("/api/showCart/:uId", cart.showCart);

//remove from cart
route.get("/api/removeFromCart/:pId",  cart.removeFromCart);

//update quantity of products in cart
route.post("/api/updateCart/:pId", cart.updateCart);

//show items in checkout
route.get("/api/checkout/:uId", checkout.orderItems);

//show order details in payment section
route.get("/api/paymentSec/:uId", checkout.paymentSec);

//change address
route.post("/api/changeAddress", address.changeAddress);

//add address
route.post("/api/addAddress/", address.addAddress);

//show all address
route.get("/api/showAddresses/:uId", address.showAddresses);

//show single address
route.get("/api/showAddresses/:uId/:index", address.showAddresses);

//remove address
route.get("/api/removeAddress/:index", address.removeAddress)

//make address default
route.get("/api/makeDefault/:index", address.makeDefault)

//update address
route.post("/api/updateAddress/:index", address.updateAddress)

//place order
route.post("/api/placeOrder", order.placeOrder)

module.exports = route