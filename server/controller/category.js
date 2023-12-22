const categoryDb = require("../model/categorySchema");
const fs = require("fs");
const path = require("path");
const productDb = require("../model/productSchema");

exports.categorySave = async (req,res)=>{
  try{

    const file = req.file;

    console.log(file);

    const image = "/img/"+ file.filename

    const category = new categoryDb({
      cName: req.body.cName,
      image: image,
    });

    await category.save();
    res.redirect("/admin/category-manage")
  }
  catch(err){
    res.redirect("/admin/add-category")
  }
}

exports.find = (req,res)=>{
  if(req.query.id){
    const id = req.query.id;

    categoryDb.findById(id)
      .then( data => {
        if(!data){
          res.status(404).send({message:"category not found with id "+ id })
        }
        else{
          res.send(data)
        }
      })
      .catch(err =>{
        res.status(500).send({message: "Error retrieving category with id "+ id })
      })
  }
  else{
    //retrieve all products
    categoryDb.find({unlist: false})
      .then(category=>{
        res.send(category)
      })
      .catch(err =>{
        res.status(500).send({message: err.message})
      })
  }
}

exports.update = async (req,res) => {

  const id = req.query.id;

  const file = req.file;

  // console.log(file);

  let image;

  if(file){
    image = "/img/" + file.filename;

    const category = await categoryDb.findById(id)

    const img = category.image;

    const imgFilePath = path.join(__dirname,"../..","assets"+img);

    console.log(imgFilePath);

    fs.unlink(imgFilePath, (err)=>{
      if(err){
        console.log(err);
      }
    })

  }

  const updatedCategoryData = {
    cName: req.body.cName,
    image: image
  }

  await categoryDb.findByIdAndUpdate({_id: id},{$set:updatedCategoryData},{new:true})

  res.redirect("/admin/category-manage")
}

exports.unlist = async (req,res) => {
  const id = req.query.id;

  await categoryDb.updateOne({_id: id},{$set:{unlist: true}});
  res.redirect("/admin/category-manage")
}

exports.restore = async (req,res)=>{
  const id = req.query.id;

  await categoryDb.updateOne({_id: id},{$set:{unlist: false}});
  res.redirect("/admin/unlist-category")

}

exports.findUnlist = (req,res) => {
  //retrieve all unlisted products
  categoryDb.find({unlist: true})
  .then(category=>{
    res.send(category)
  })
  .catch(err =>{
    res.status(500).send({message: err.message})
  })
}

exports.delete = async (req,res) => {
  const id = req.query.id;

  categoryDb.findByIdAndDelete(id)
    .then(data => {
      if(!data){
        res.status(404).send({ message: `Cannot delete product with id ${id}.Maybe id is wrong`})
      }
      else{
        res.redirect("/admin/unlist-category")
      }
    })
    .catch(err => {
      res.status(500).send({message: err.message})
    })

    const category = await categoryDb.findById(id)

    const img = category.image;

    const imgFilePath = path.join(__dirname,"../..","assets"+img);

    console.log(imgFilePath);

    fs.unlink(imgFilePath, (err)=>{
      if(err){
        console.log(err);
      }
    })
}

exports.findProducts = async (req,res) => {
  const id = req.query.id;

  const category = await categoryDb.findById(id)

  const cName = category.cName;

  //retrieve products of that category
  productDb.find({unlist: false,category: cName})
  .then(product=>{
    res.send(product)
  })
  .catch(err =>{
    res.status(500).send({message: err.message})
  })
}
