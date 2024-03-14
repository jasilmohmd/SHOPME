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
const wallet = require("../controller/wallet");
const coupon = require("../controller/coupon");
const address = require("../controller/addresses");
const checkout = require("../controller/checkout");
const order = require("../controller/order");


//Login Page render
route.get('/login', middleware.checkNotAuthenticated, services.login);


//Login Post
route.post('/login', middleware.checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

//Home page render
route.get('/', middleware.isBlocked, services.home);

//product page render
route.get("/product_page", middleware.isBlocked, services.productPage );

//searching products
route.post("/search",middleware.isBlocked, services.productSearch)

//category pages render
route.get("/category_page", middleware.isBlocked, services.categoryPage);

//my account page render
route.get("/my_account", middleware.isBlocked, middleware.checkAuthenticated, services.myAccount);

//addresses page render
route.get("/address_page",middleware.isBlocked, middleware.checkAuthenticated, services.addressPage);

//add address page render
route.get("/add-address-page",middleware.isBlocked, middleware.checkAuthenticated, services.addAddressPage);

//update address page render
route.get("/update-address/:index" ,middleware.isBlocked, middleware.checkAuthenticated, services.updateAddress)

//wallet page
route.get("/wallet_page",middleware.isBlocked, middleware.checkAuthenticated, services.walletPage)

//cart page render
route.get("/cart_page", middleware.isBlocked, middleware.checkAuthenticated, services.cartPage);

//checkout page render
route.get("/checkout_page", middleware.isBlocked, middleware.checkAuthenticated, services.checkoutPage);

//payment page render
route.get("/payment_page", middleware.isBlocked, middleware.checkAuthenticated, services.paymentPage);

//order placed
route.get("/orderPlaced",middleware.isBlocked, middleware.checkAuthenticated, services.orderPlaced);

//wallet payment error
route.get("/walletError",middleware.isBlocked, middleware.checkAuthenticated, services.walletError) 

//orders page render
route.get("/orders_page",middleware.isBlocked, middleware.checkAuthenticated, services.ordersPage);

//order details page render
route.get("/orderDetails_page",middleware.isBlocked, middleware.checkAuthenticated, services.orderDetails);

//Register verify render
route.get("/register_verify", middleware.checkNotAuthenticated, services.registerVerify);

//Register verify post
route.post("/register_verify", middleware.checkNotAuthenticated, OTPVerification.otp);

//Register verify 2 render
route.get("/register_verify2", middleware.checkNotAuthenticated, services.registerVerify2);

//Register verify 2 post
route.post("/register_verify2", middleware.checkNotAuthenticated, OTPVerification.otpVerification );

//Register page render
route.get("/register", middleware.checkNotAuthenticated, services.register);

//Register Post
route.post('/register', middleware.checkNotAuthenticated, services.registerPost);

//user blocked render
route.get("/user-blocked", services.userBlocked)

//User logout
route.get("/logout", services.logoutUser);



//api

//resend otp verification
route.get("/api/resendOTP",middleware.checkNotAuthenticated, OTPVerification.resendOtp)

//search products
route.get("/api/search/products",product.search);

//get products
route.get("/api/products", product.find);


//get category
route.get("/api/category", category.find);

//get products of a category
route.get("/api/categoryProducts", category.findProducts);

//get user
route.get("/api/user", user.find);

//get transactions in wallet
route.get("/api/showWallet", wallet.showWallet);

//add money to wallet
route.post("/api/wallet/addMoney", wallet.addMoney);

//add money to wallet razorpay handler
route.post("/api/razorpay/wallet", wallet.rzpHandler);

//add to cart
route.post("/api/addToCart/:pId",middleware.checkAuthenticated, cart.addToCart);

//show items in cart
route.get("/api/showCart/:uId", cart.showCart);

//remove from cart
route.get("/api/removeFromCart/:pId",  cart.removeFromCart);

//update quantity of products in cart
route.post("/api/updateCart/:pId", cart.updateCart);

//show coupons available
route.get("/api/coupon/show", coupon.find);

//apply coupon in cart
route.post("/api/coupon/apply", coupon.applyCoupon);

//delete coupon from cart
route.get("/api/coupon/remove", coupon.removeCoupon);

//check stock before checkout
route.post("/api/checkStock", checkout.checkStock);

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
route.post("/api/placeOrder", order.placeOrder);

//razorpay handler
route.post("/api/razorpay", order.rzpHandler)

//show all orders
route.get("/api/showOrders/:uId", order.showOrders);

//show an order
route.get("/api/showOrders/:uId/:oId", order.showOrders);

//cancel order
route.get("/api/order/cancel", order.cancelOrder);

module.exports = route