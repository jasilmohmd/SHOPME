const cartDb = require("../model/cartSchema");
const productDb = require("../model/productSchema");
const { ObjectId } = require("mongodb")

exports.addToCart = async (req, res) => {

  
  const uId = req.session.passport.user;
  const pId = req.params.pId;
  
  try {
    const product = await productDb.findById(pId)

    if (product.inStock > 0) {

      // find user cart
      let userCart = await cartDb.findOne({ userId: uId });

      // create new user cart if none exists
      if (!userCart) {
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
      else {
        //check item already in cart
        const existingUserItem = userCart.cartItems.find(item => item.productId.toString() === pId);

        //add quantity if item already exists
        if (existingUserItem) {
          const message = { info: "Product already in cart" };
          req.flash('message', message);

          res.redirect(`/product_page?id=${pId}`);

        }
        else {
          // add item if its not in the cart
          userCart.cartItems.push({
            productId: pId,
            quantity: 1
          })
        }
      }



      await userCart.save();

      const message = { success: 'Product added to cart' };
      req.flash('message', message);

      res.redirect(`/product_page?id=${pId}`);

    }
    else{
      const message = { error: `Product Out of stock` };
      req.flash('message', message);
      res.redirect(`/product_page?id=${pId}`);
    }

  }
  catch (err) {
    console.log(err);
    res.render("errorPage", { status: 500 });
  }

}


exports.showCart = async (req, res) => {
  const uId = req.params.uId;

  try {
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
          foreignField: "_id",
          as: "productDetails"
        }
      },

    ]);

    if (userCart.length > 0) {
      res.send(userCart);
    }
    else {
      res.send(false)
    }

  } catch (err) {
    console.log(err);
    res.render("errorPage", { status: 500 });
  }
}

exports.removeFromCart = async (req, res) => {
  const uId = req.session.passport.user;
  const pId = req.params.pId;

  try {
    let userCart = await cartDb.findOne({ userId: uId });


    const index = userCart.cartItems.findIndex((value) => {
      return value.productId.toString() === pId
    })

    if (index !== -1) {

      userCart.cartItems.splice(index, 1);

      await userCart.save();

      res.redirect("/cart_page")
    }



  } catch (err) {
    res.render("errorPage", { status: 500 });
  }
}

exports.updateCart = async (req, res) => {
  const uId = req.session.passport.user;
  const pId = req.params.pId;
  const qty = req.query.qty;

  try {


    const cart = await cartDb.findOneAndUpdate({ userId: uId, "cartItems.productId": pId }, { $set: { "cartItems.$.quantity": qty } });

    console.log(cart);

    res.send(true);

  } catch (err) {
    console.log(err);
    res.send(false);
  }
}