const axios = require('axios');


const PORT = process.env.PORT;

admincred = {
  adminemail: "admin@gmail.com",
  adminpass: '123'
}

//Admin Panel

//Admin Login page render
exports.adminLogin = (req, res) => {
  req.session.emailIsValid = false;
  res.render('admin_login', { isValidate: req.session.isValidate });
};

//Admin Login Post
exports.adminloginPost = (req, res) => {
  try {
    if (admincred.adminemail == req.body.email && admincred.adminpass == req.body.password) {
      req.session.isAdminLoggedIn = true;
      res.redirect("/admin/admin-dash");
    } else {
      content = {
        error: true,
        value: "Invalid Admin credentials"
      }
      // console.log(req.body.email,req.body.password);
      res.render("admin_login", { content })
    }
  } catch {
    res.render("admin_login")
  }
}

//admin dash
exports.adminDash = (req, res) => {

  axios.all([
    axios.get(`http://localhost:${PORT}/admin/api/topProducts`),
    axios.get(`http://localhost:${PORT}/admin/api/topCategories`),
    axios.get(`http://localhost:${PORT}/admin/api/topBrands`)
  ])
    .then(axios.spread((response1, response2,response3) => {
      console.log(response3.data);
      res.render("admin_dash", { topProducts: response1.data, topCategories: response2.data, topBrands: response3.data });
    }))
    .catch(err => {
      res.send(err);
    });

}

exports.productManage = (req, res) => {
  // Make a get request to /api/products
  axios.get(`http://localhost:${PORT}/admin/api/products`)
    .then(function (response) {
      res.render("admin_productManage", { product: response.data });
    })
    .catch(err => {
      res.send(err);
    })

}

exports.addProduct = (req, res) => {
  // Make a get request to /api/category
  axios.get(`http://localhost:${PORT}/admin/api/category`)
    .then(function (response) {
      res.render("admin_addProduct", { category: response.data });
    })
    .catch(err => {
      res.send(err);
    })
}

exports.updateProduct = (req, res) => {

  // Make a get request to /api/category
  axios.all([
    axios.get(`http://localhost:${PORT}/admin/api/category`),
    axios.get(`http://localhost:${PORT}/admin/api/products`, { params: { id: req.query.id } })
  ])
    .then(axios.spread((response1, response2) => {
      res.render("admin_updateProduct", { category: response1.data, product: response2.data })
    }))
    .catch(err => {
      res.send(err);
    });

}

exports.unlistProduct = (req, res) => {
  // Make a get request to /api/products/unlist
  axios.get(`http://localhost:${PORT}/admin/api/products/findUnlist`)
    .then(function (response) {
      res.render("admin_unlistedProducts", { product: response.data });
    })
    .catch(err => {
      res.send(err);
    })

}

exports.categoryManage = (req, res) => {
  // Make a get request to /api/category
  axios.get(`http://localhost:${PORT}/admin/api/category`)
    .then(function (response) {
      res.render("admin_categoryManage", { category: response.data });
    })
    .catch(err => {
      res.send(err);
    })

}

exports.updateCategory = (req, res) => {
  axios.get(`http://localhost:${PORT}/admin/api/category`, { params: { id: req.query.id } })
    .then(function (response) {
      res.render("admin_updateCategory", { category: response.data });
    })
    .catch(err => {
      res.send(err);
    })
}

exports.addCategory = (req, res) => {
  res.render("admin_addCategory")
}

exports.unlistCategory = (req, res) => {
  // Make a get request to /api/products/unlist
  axios.get(`http://localhost:${PORT}/admin/api/category/findUnlist`)
    .then(function (response) {
      res.render("admin_unlistedCategory", { category: response.data });
    })
    .catch(err => {
      res.send(err);
    })

}

exports.userManage = (req, res) => {
  // Make a get request to /api/users
  axios.get(`http://localhost:${PORT}/admin/api/users`)
    .then(function (response) {
      res.render("admin_userManage", { user: response.data });
    })
    .catch(err => {
      res.send(err);
    })

}

exports.orderManage = (req, res) => {
  // Make a get request to /api/orders
  axios.get(`http://localhost:${PORT}/admin/api/orders`)
    .then(function (response) {
      res.render("admin_orderManage", { order: response.data });
    })
    .catch(err => {
      res.send(err);
    })
}

exports.orderPage = (req, res) => {
  const id = req.query.id;
  // Make a get request to /api/orders
  axios.get(`http://localhost:${PORT}/admin/api/orders?id=${id}`)
    .then(function (response) {
      res.render("admin_orderPage", { order: response.data });
    })
    .catch(err => {
      res.send(err);
    })
}

exports.orderItem = (req, res) => {
  const id = req.query.id;
  const pId = req.query.pId;
  // Make a get request to /api/orders
  axios.all([
    axios.get(`http://localhost:${PORT}/admin/api/orderItem?id=${id}&pId=${pId}`),
    axios.get(`http://localhost:${PORT}/admin/api/orders?id=${id}`)
  ])
    .then(axios.spread((response1, response2) => {
      console.log(response2.data);
      res.render("admin_orderItem", { items: response1.data, order: response2.data, id });
    }))
    .catch(err => {
      res.send(err);
    })
}

exports.couponManage = (req, res) => {
  // Make a get request to /api/users
  axios.get(`http://localhost:${PORT}/admin/api/coupons`)
    .then(function (response) {
      res.render("admin_couponManage", { coupon: response.data });
    })
    .catch(err => {
      res.send(err);
    })

}

exports.addCoupon = (req, res) => {
  // Make a get request to /api/category
  axios.get(`http://localhost:${PORT}/admin/api/category`)
    .then(function (response) {
      res.render("admin_addCoupon", { category: response.data });
    })
    .catch(err => {
      res.send(err);
    })
}

exports.updateCoupon = (req, res) => {
  const id = req.query.id;
  // Make a get request to /api/category
  axios.all([
    axios.get(`http://localhost:${PORT}/admin/api/category`),
    axios.get(`http://localhost:${PORT}/admin/api/coupons?id=${id}`)
  ])
    .then(axios.spread((response1, response2) => {
      console.log(response2.data);
      res.render("admin_updateCoupon", { category: response1.data, coupon: response2.data });
    }))
    .catch(err => {
      res.send("hi");
    })
}

exports.logoutAdmin = (req, res) => {
  req.session.destroy();
  res.redirect('/admin')
}