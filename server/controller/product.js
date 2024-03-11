const productDb = require("../model/productSchema");
const categoryDb = require("../model/categorySchema");
const fs = require("fs");
const path = require("path");

exports.saveProduct = async (req, res) => {
  try {

    const files = req.files;

    console.log(files);

    const image = files.map((file) => {
      return "/img/" + file.filename
    })

    const product = new productDb({
      pName: req.body.pName,
      bName: req.body.bName,
      category: req.body.category,
      subTitle: req.body.subTitle,
      descriptionHead: req.body.descriptionHead,
      description: req.body.description,
      firstPrice: req.body.firstPrice,
      lastPrice: req.body.lastPrice,
      discount: req.body.discount,
      colour: req.body.colour,
      inStock: req.body.inStock,
      image: image,
      new: req.body.new
    });

    await product.save();
    res.redirect("/admin/product-manage")
  }
  catch (err) {
    console.log(err);
    res.render("errorPage", { status: 500 });
  }
}

exports.find = (req, res) => {
  if (req.query.id) {
    const id = req.query.id;

    console.log(id);

    productDb.findById(id)
      .then(data => {
        if (!data) {
          res.status(404).send({ message: "product not found with id " + id })
        }
        else {
          console.log(data);
          res.send(data)
        }
      })
      .catch(err => {
        res.render("errorPage", { status: 500 });
      })
  }
  else {
    console.log("hi");
    //retrieve all products
    productDb.find({ unlist: false })
      .then(product => {
        res.send(product)
      })
      .catch(err => {
        console.log(err);
        res.render("errorPage", { status: 500 });
      })
  }
}

exports.update = async (req, res) => {

  try {

    const id = req.query.id;

    const files = req.files;

    // console.log(files);

    let image;

    if (files) {
      image = files.map((file) => {
        return "/img/" + file.filename
      })
    }


    const updatedProductData = {
      pName: req.body.pName,
      bName: req.body.bName,
      category: req.body.category,
      subTitle: req.body.subTitle,
      descriptionHead: req.body.descriptionHead,
      description: req.body.description,
      firstPrice: req.body.firstPrice,
      lastPrice: req.body.lastPrice,
      discount: req.body.discount,
      colour: req.body.colour,
      inStock: req.body.inStock,
      new: req.body.new
    }

    // console.log(image);
    // console.log(updatedProductData);

    if (image && image.length > 0) {
      await productDb.findByIdAndUpdate({ _id: id }, { $push: { image: image } })
    }

    await productDb.findByIdAndUpdate({ _id: id }, { $set: updatedProductData }, { new: true })

    res.redirect("/admin/product-manage");

  } catch (err) {

    res.render("errorPage", { status: 500 });

  }

}

exports.unlist = async (req, res) => {
  const id = req.query.id;

  try{

    await productDb.updateOne({ _id: id }, { $set: { unlist: true } });
  
    res.redirect("/admin/product-manage")

  }catch(err){

    res.render("errorPage", { status: 500 });

  }


}

exports.restore = async (req, res) => {
  const id = req.query.id;

  try{

    await productDb.updateOne({ _id: id }, { $set: { unlist: false } });
    res.redirect("/admin/unlist-product")

  }catch(err){

    res.render("errorPage", { status: 500 });

  }


}

exports.findUnlist = (req, res) => {
  //retrieve all unlisted products
  productDb.find({ unlist: true })
    .then(product => {
      res.send(product)
    })
    .catch(err => {
      res.render("errorPage", { status: 500 });
    })
}

exports.deleteImage = async (req, res) => {
  const id = req.query.id;

  const index = req.query.index;

  try {
    const product = await productDb.findById(id);

    const img = product.image[index];

    product.image.splice(index, 1)

    const imgFilePath = path.join(__dirname, "../..", "assets" + img);

    console.log(imgFilePath);

    fs.unlink(imgFilePath, (err) => {
      if (err) {
        console.log(err);
      }
    })

    const updatedProduct = await product.save();
    const category = await categoryDb.find({ unlist: false });

    res.render("admin_updateProduct", { product: updatedProduct, category: category })

  } catch (err) {
    console.log(err);
    res.render("errorPage", { status: 500 });
  }

}

exports.delete = (req, res) => {
  const id = req.query.id;

  productDb.findByIdAndDelete(id)
    .then(data => {
      if (!data) {
        res.status(404).send({ message: `Cannot delete product with id ${id}.Maybe id is wrong` })
      }
      else {
        res.redirect("/admin/unlist-product")
      }
    })
    .catch(err => {
      res.render("errorPage", { status: 500 });
    })
}

exports.search = (req, res) => {

  if (req.query.search) {
    const searchQuery = req.query.search;
    const regex = new RegExp(searchQuery, 'i'); // 'i' flag for case-insensitive search

    productDb.find({ pName: { $regex: regex }, unlist: false })
      .then(products => {
        res.send(products);
      })
      .catch(err => {
        res.render("errorPage", { status: 500 });
      });
  } else {
    console.log("hi");
    // Retrieve all products
    productDb.find({ unlist: false })
      .then(products => {
        res.send(products);
      })
      .catch(err => {
        res.render("errorPage", { status: 500 });
      });
  }
}