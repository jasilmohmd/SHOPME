const categoryDb = require("../model/categorySchema");
const fs = require("fs");
const path = require("path");
const productDb = require("../model/productSchema");

exports.categorySave = async (req, res) => {
  try {

    const categorydb = await categoryDb.find({ cName: req.body.cName });

    if (categorydb) {

      const message = { error: "Category alredy exists!" };
      req.flash('message', message);
      res.redirect("/admin/add-category");

      return
    }

    const file = req.file;

    const image = "/img/" + file.filename

    const category = new categoryDb({
      cName: req.body.cName,
      image: image,
    });

    await category.save();
    res.redirect("/admin/category-manage")
  }
  catch (err) {
    res.render("errorPage", { status: 500 });
  }
}

exports.find = (req, res) => {
  if (req.query.id) {
    const id = req.query.id;

    categoryDb.findById(id)
      .then(data => {
        if (!data) {
          res.render("errorPage", { status: 404 });
        }
        else {
          res.send(data)
        }
      })
      .catch(err => {
        res.render("errorPage", { status: 500 });
      })
  }
  else {
    //retrieve all products
    categoryDb.find({ unlist: false })
      .then(category => {
        // console.log(category);
        res.send(category)
      })
      .catch(err => {
        res.render("errorPage", { status: 500 });
      })
  }
}

exports.update = async (req, res) => {

  
  try {
    
    const id = req.query.id;
    
    const categorydb = await categoryDb.find({
      $and: [
        { _id: { $ne: id } },  // _id should not match the specified id
        { cName: req.body.cName }  // cName should match req.body.cName
      ]
    });
  
    console.log(categorydb);

    if (categorydb.length > 0) {
  
      const message = { error: "Category alredy exists!" };
      req.flash('message', message);
      res.redirect("/admin/add-category");
  
      return
    }
  
  
    const file = req.file;
  
    // console.log(file);
  
    let image;

    if (file) {
      image = "/img/" + file.filename;

      const category = await categoryDb.findById(id)

      const img = category.image;

      const imgFilePath = path.join(__dirname, "../..", "assets" + img);

      console.log(imgFilePath);

      fs.unlink(imgFilePath, (err) => {
        if (err) {
          console.log(err);
        }
      })

    }

    const updatedCategoryData = {
      cName: req.body.cName,
      image: image
    }

    await categoryDb.findByIdAndUpdate({ _id: id }, { $set: updatedCategoryData }, { new: true })

    res.redirect("/admin/category-manage")

  }
  catch (err) {

    res.render("errorPage", { status: 500 });

  }

}

exports.unlist = async (req, res) => {
  const id = req.query.id;

  try {

    await categoryDb.updateOne({ _id: id }, { $set: { unlist: true } });
    res.redirect("/admin/category-manage")

  } catch (err) {
    res.render("errorPage", { status: 500 });
  }
}

exports.restore = async (req, res) => {
  const id = req.query.id;

  try {

    await categoryDb.updateOne({ _id: id }, { $set: { unlist: false } });
    res.redirect("/admin/unlist-category")

  } catch (err) {

    res.render("errorPage", { status: 500 });

  }

}

exports.findUnlist = (req, res) => {
  try {

    //retrieve all unlisted products
    categoryDb.find({ unlist: true })
      .then(category => {
        res.send(category)
      })
      .catch(err => {
        res.status(500).send({ message: err.message })
      })

  } catch (err) {
    res.render("errorPage", { status: 500 });
  }
}

exports.delete = async (req, res) => {
  const id = req.query.id;

  try {

    categoryDb.findByIdAndDelete(id)
      .then(data => {
        if (!data) {
          res.status(404).send({ message: `Cannot delete product with id ${id}.Maybe id is wrong` })
        }
        else {
          res.redirect("/admin/unlist-category")
        }
      })
      .catch(err => {
        res.status(500).send({ message: err.message })
      })

    const category = await categoryDb.findById(id)

    const img = category.image;

    const imgFilePath = path.join(__dirname, "../..", "assets" + img);

    console.log(imgFilePath);

    fs.unlink(imgFilePath, (err) => {
      if (err) {
        console.log(err);
      }
    })

  } catch (err) {

    res.render("errorPage", { status: 500 });

  }

}

exports.findProducts = async (req, res) => {

  try {

    if (req.query.sort) {

      const id = req.query.id;

      console.log(id);

      let { sort, priceAbove, priceBelow } = req.query;

      priceAbove ? priceAbove = Number(priceAbove) : priceAbove = 0;
      priceBelow ? priceBelow = Number(priceBelow) : priceBelow = Infinity;

      console.log(priceBelow);

      if (id === "all") {

        if (sort === "lowestToHighest") {

          //retrieve all products
          productDb.find({ unlist: false, lastPrice: { $gte: priceAbove, $lte: priceBelow } }).sort({ lastPrice: 1 })
            .then(product => {
              console.log(product);
              res.send(product)
            })
            .catch(err => {
              res.status(500).send({ message: err.message })
            })


        } else {

          //retrieve all products
          productDb.find({ unlist: false, lastPrice: { $gte: priceAbove, $lte: priceBelow } }).sort({ lastPrice: -1 })
            .then(product => {
              res.send(product)
            })
            .catch(err => {
              res.status(500).send({ message: err.message })
            })

        }


      } else {

        const category = await categoryDb.findById(id)

        cName = category.cName;

        if (sort === "lowestToHighest") {

          //retrieve products of that category
          productDb.find({ unlist: false, category: cName, lastPrice: { $gte: priceAbove, $lte: priceBelow } }).sort({ lastPrice: 1 })
            .then(product => {
              res.send(product)
            })
            .catch(err => {
              res.status(500).send({ message: err.message })
            })


        } else {

          //retrieve products of that category
          productDb.find({ unlist: false, category: cName, lastPrice: { $gte: priceAbove, $lte: priceBelow } }).sort({ lastPrice: -1 })
            .then(product => {
              res.send(product)
            })
            .catch(err => {
              res.status(500).send({ message: err.message })
            })

        }


      }

    } else {

      const id = req.query.id;

      req.session.category = id;

      console.log(req.session.category);

      let cName;

      if (id === "all") {

        //retrieve all products
        productDb.find({ unlist: false })
          .then(product => {
            res.send(product)
          })
          .catch(err => {
            res.status(500).send({ message: err.message })
          })

      } else {

        const category = await categoryDb.findById(id)

        cName = category.cName;

        //retrieve products of that category
        productDb.find({ unlist: false, category: cName })
          .then(product => {
            res.send(product)
          })
          .catch(err => {
            res.status(500).send({ message: err.message })
          })

      }

    }



  } catch (err) {

    res.render("errorPage", { status: 500 });

  }

}
