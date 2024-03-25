const axios = require('axios');
const bcrypt = require('bcrypt');
const Userdb = require("../model/userSchema");
const sendOTPVerificationEmail = require('../controller/OTPVerification');
const userOTPVerification = require('../model/userOTPVerificationSchema');

const PORT = process.env.PORT;


//Login page
exports.login = (req, res) => {
  req.session.emailIsValid = false;
  res.render('user_login', { isValidate: req.session.isValidate });
};



//Home page
exports.home = (req, res) => {

  // Make a get request to /api/products
  axios.all([
    axios.get(`http://localhost:${PORT}/api/category`),
    axios.get(`http://localhost:${PORT}/api/products`),
    axios.get(`http://localhost:${PORT}/api/coupon/show`)
  ])
    .then(axios.spread((response1, response2, response3) => {
      res.render("home", { category: response1.data, product: response2.data, coupon: response3.data })
    }))
    .catch(err => {
      res.render("errorPage", { status: 500 });
    });

};

exports.productPage = (req, res) => {

  // Make a get request to /api/products
  axios.get(`http://localhost:${PORT}/api/products`, { params: { id: req.query.id } })
    .then(function (response) {
      res.render("product_page", { product: response.data });
    })
    .catch(err => {
      res.render("errorPage", { status: 500 });
    })

};

exports.productSearch = (req, res) => {
  let search = req.body.q
  axios.all([
    axios.get(`http://localhost:${PORT}/api/category`),
    axios.get(`http://localhost:${PORT}/api/search/products?search=${search}`)
  ])
    .then(axios.spread((response1, response2) => {
      search ? search : search = "All products"
      res.render("category", { category: response1.data, product: response2.data, search })
    }))
    .catch(err => {
      res.render("errorPage", { status: 500 });
    });
}

exports.categoryPage = (req, res) => {
  axios.all([
    axios.get(`http://localhost:${PORT}/api/category`),
    axios.get(`http://localhost:${PORT}/api/categoryProducts`, { params: { id: req.query?.id, sort: req.query?.sort, priceAbove: req.query?.priceAbove, priceBelow: req.query?.priceBelow } })
  ])
    .then(axios.spread((response1, response2) => {
      // console.log(response2.data);
      res.render("category", { category: response1.data, product: response2.data, search: false, req: req })
    }))
    .catch(err => {
      res.render("errorPage", { status: 500 });
    });
}

exports.myAccount = (req, res) => {
  const id = req.session.passport.user;
  axios.get(`http://localhost:${PORT}/api/user?id=${id}`)
    .then(function (response) {
      res.render("my_account", { user: response.data });
    })
    .catch(err => {
      res.render("errorPage", { status: 500 });
    })
}

exports.walletPage = (req, res) => {
  const uId = req.session.passport.user;
  axios.get(`http://localhost:${PORT}/api/showWallet?uId=${uId}`)
    .then(function (response) {
      // console.log(response.data);
      res.render("walletPage", { wallet: response.data });
    })
    .catch(err => {
      res.render("errorPage", { status: 500 });
    })

}

exports.addressPage = (req, res) => {
  const uId = req.session.passport.user;
  axios.get(`http://localhost:${PORT}/api/showAddresses/${uId}`,)
    .then(function (response) {
      res.render("address_page", { address: response.data });
    })
    .catch(err => {
      res.render("errorPage", { status: 500 });
    })

}

exports.addAddressPage = (req, res) => {
  try {

    res.render("add_address_page")

  } catch (err) {
    res.render("errorPage", { status: 500 });
  }
}

exports.updateAddress = (req, res) => {
  const uId = req.session.passport.user;
  const index = req.params.index;
  axios.get(`http://localhost:${PORT}/api/showAddresses/${uId}/${index}`,)
    .then(function (response) {
      res.render("update_address_page", { address: response.data, index });
    })
    .catch(err => {
      res.render("errorPage", { status: 500 });
    })
}

exports.cartPage = (req, res) => {
  const uId = req.session.passport.user;
  axios.get(`http://localhost:${PORT}/api/showCart/${uId}`,)
    .then(function (response) {
      res.render("cart_page", { cart: response.data });
    })
    .catch(err => {
      res.render("errorPage", { status: 500 });
    })

}

exports.checkoutPage = (req, res) => {

  try {
    const order = req.session.order;
    res.render("checkout_page", { cart: order });

  } catch (err) {
    res.render("errorPage", { status: 500 });
  }

}

exports.paymentPage = (req, res) => {
  const uId = req.session.passport.user;
  const order = req.session.order;
  axios.all([
    axios.post(`http://localhost:${PORT}/api/paymentSec?place=cart`, { order: order }),
    axios.get(`http://localhost:${PORT}/api/showAddresses/${uId}`,)
  ])
    .then(axios.spread((response1, response2) => {
      console.log(response1.data + "Hi");
      res.render("payment_page", { details: response1.data, address: response2.data });
    }))
    .catch(err => {
      console.log(err.message);
      res.render("errorPage", { status: 500 });
    })

}

exports.orderPlaced = (req, res) => {
  try {

    res.render("orderPlaced");

  } catch (err) {
    res.render("errorPage", { status: 500 });
  }
}

exports.walletError = (req, res) => {
  try {

    res.render("walletError", { message: req.query.message });

  } catch (err) {
    res.render("errorPage", { status: 500 });
  }
}

exports.ordersPage = (req, res) => {
  const uId = req.session.passport.user;
  axios.get(`http://localhost:${PORT}/api/showOrders/${uId}`,)
    .then(function (response) {
      console.log(response.data);
      res.render("orders_page", { orders: response.data });
    })
    .catch(err => {
      res.render("errorPage", { status: 500 });
    })

}

exports.orderDetails = (req, res) => {
  const uId = req.session.passport.user;
  const oId = req.query.oId;
  axios.get(`http://localhost:${PORT}/api/showOrders/${uId}/${oId}`,)
    .then(function (response) {
      console.log(response.data);
      res.render("orderDetails_page", { order: response.data });
    })
    .catch(err => {
      res.render("errorPage", { status: 500 });
    })

}

//Update Account details
exports.updateAccount = (req, res) => {

  try {

    const id = req.session.passport.user;
    axios.get(`http://localhost:${PORT}/api/user?id=${id}`)
      .then(function (response) {
        res.render("update_account", { user: response.data });
      })
      .catch(err => {
        res.render("errorPage", { status: 500 });
      })

  } catch (err) {
    res.render("errorPage", { status: 500 });
  }

}

exports.changePassword = (req,res) => {

  try{

    res.render("change_password");

  }catch(err){

    res.render("errorPage", { status: 500 });

  }

}


//Register verification user page
exports.registerVerify = (req, res) => {
  req.session.isValidate = false;
  res.render('user_verify', { emailIsValid: req.session.emailIsValid });
};

//Register verification 2 user page
exports.registerVerify2 = (req, res) => {
  let email = req.session.user;
  req.session.isValidate = false;
  res.render('user_verify2', { emailIsValid: req.session.emailIsValid, email });
};


//Register user page
exports.register = (req, res) => {

  try {

    req.session.isValidate = false;
    res.render('user_register', { emailIsValid: req.session.emailIsValid });

  } catch (err) {
    res.render("errorPage", { status: 500 });
  }
};

//Register user page POST
exports.registerPost = async (req, res) => {
  try {
    console.log(req.body);
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const user = new Userdb({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: hashedPassword
    })

    await user.save()
    res.redirect('/')
  } catch {
    res.render("errorPage", { status: 500 });
  }
};

//forgot password verify user page
exports.forgotPasswordVerify = (req, res) => {
  // req.session.isValidate = false;
  res.render('user_forgotPassword1');
};

//forgot password verify 2 user page
exports.forgotPasswordVerify2 = (req, res) => {
  let email = req.session.user;
  // req.session.isValidate = false;
  res.render('user_forgotPassword2', { email });
};

//forgot password verify 2 user page
exports.forgotPassword = (req, res) => {
  let email = req.session.user;
  // req.session.isValidate = false;
  res.render('user_forgotPassword3', { email });
};

exports.userBlocked = (req, res) => {
  try {

    res.render("user_blocked")

  } catch (err) {
    res.render("errorPage", { status: 500 });
  }
}

//User logout
exports.logoutUser = async (req, res) => {
  // req.logOut()  
  const id = req.session.passport.user;

  try {

    await Userdb.findByIdAndUpdate({ _id: id }, { $set: { status: "Inactive" } });
    delete req.session.passport.user;
    res.redirect('/')

  } catch (err) {
    res.render("errorPage", { status: 500 });
  }


}
