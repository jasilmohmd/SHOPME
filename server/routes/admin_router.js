const express = require('express');
const route = express.Router()
const passport = require("passport")

const services = require('../services/admin_render');
const product = require("../controller/product");
const category = require("../controller/category");
const user = require("../controller/user");
const order = require("../controller/order");
const coupon = require("../controller/coupon");
const store = require("../middleware/multer");
const middleware = require("../middleware/middleware");



//Admin panel

//admin login
route.get("/",middleware.checkNotAuthenticatedAdmin, services.adminLogin)

//admin login post
route.post("/admin-login", middleware.checkNotAuthenticatedAdmin, services.adminloginPost)

//admin dash
route.get("/admin-dash", middleware.checkAuthenticatedAdmin,services.adminDash);

//admin product management
route.get("/product-manage", middleware.checkAuthenticatedAdmin, services.productManage);

//admin add product
route.get("/add-product", middleware.checkAuthenticatedAdmin, services.addProduct);

//admin add product post
route.post("/add-product", middleware.checkAuthenticatedAdmin, store.array("pImage", 6) , product.saveProduct );

//admin edit product
route.get("/update-product" , middleware.checkAuthenticatedAdmin, services.updateProduct )

//admin unlisted products
route.get("/unlist-product", middleware.checkAuthenticatedAdmin, services.unlistProduct)

//admin category management
route.get("/category-manage", middleware.checkAuthenticatedAdmin, services.categoryManage);

//admin add category
route.get("/add-category", middleware.checkAuthenticatedAdmin, services.addCategory);

//admin add category post
route.post("/add-category", middleware.checkAuthenticatedAdmin, store.single("cImage"), category.categorySave);

//admin edit category
route.get("/update-category", middleware.checkAuthenticatedAdmin, services.updateCategory );

//admin unlisted category
route.get("/unlist-category", middleware.checkAuthenticatedAdmin, services.unlistCategory);

//admin user management
route.get("/user-manage", middleware.checkAuthenticatedAdmin, services.userManage);

//admin order management
route.get("/order-manage", middleware.checkAuthenticatedAdmin, services.orderManage);

//admin order page render
route.get("/order-page", middleware.checkAuthenticatedAdmin, services.orderPage);

//admin order item render
route.get("/order-item", middleware.checkAuthenticatedAdmin, services.orderItem);

//admin Coupon management render
route.get("/coupon-manage", middleware.checkAuthenticatedAdmin, services.couponManage);

//admin add Coupon render
route.get("/add-coupon", middleware.checkAuthenticatedAdmin, services.addCoupon);

//admin add coupon post
route.post("/add-coupon", middleware.checkAuthenticatedAdmin, coupon.addCoupon);

//admin add Coupon render
route.get("/update-coupon", middleware.checkAuthenticatedAdmin, services.updateCoupon);

//admin logout
route.get("/admin-logout", services.logoutAdmin)



//api
//get products
route.get("/api/products", product.find );
//edit products
route.post("/api/products/update",store.array("pImage", 6), product.update)
//unlist products
route.get("/api/products/unlist", product.unlist)
//get unlist products
route.get("/api/products/findUnlist", product.findUnlist)
//restore products
route.get("/api/products/restore", product.restore)
//delete images
route.get("/api/products/deleteImage" , product.deleteImage)
//delete products
route.get("/api/products/delete", product.delete);


//get category
route.get("/api/category", category.find);
//unlist category
route.get("/api/category/unlist", category.unlist);
//get unlist category
route.get("/api/category/findUnlist", category.findUnlist);
//edit category
route.post("/api/category/update", store.single("cImage"), category.update)
//restore category
route.get("/api/category/restore", category.restore);
//delete category
route.get("/api/category/delete", category.delete);


//get users
route.get("/api/users", user.find);
//block 
route.get("/api/users/block", user.block);
//unblock
route.get("/api/users/unblock", user.unblock);



//get orders
route.get("/api/orders", order.find);

//get order items
route.get("/api/orderItem", order.findItem); 

//update order status
route.post("/api/updateOrder", order.update);

// chart
route.get("/api/ordersreportforgraph", order.ordersreportforgraph);

//top products
route.get("/api/topProducts", order.topProducts);

//top Categories
route.get("/api/topCategories", order.topCategories);

//top Brands
route.get("/api/topBrands", order.topBrands);


//get coupons
route.get("/api/coupons", coupon.find);

//update coupon 
route.post("/api/updateCoupon", coupon.updateCoupon );

//delee coupon
route.get("/api/coupon/delete", coupon.deleteCoupon);

module.exports = route