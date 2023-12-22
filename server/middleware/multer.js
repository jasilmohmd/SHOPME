const multer = require("multer");
const path = require("path");

//set storage
var storage = multer.diskStorage({
  destination: ( req, file, cb)=>{
    const assetsFolder = path.join(__dirname,"../..","assets");
    const destinationPath = path.join(assetsFolder,"img")
    cb(null,destinationPath)
  },
  filename: (req, file, cb)=>{
    var ext = file.originalname.substring(file.originalname.lastIndexOf('.'));

    cb(null, file.fieldname + '-' + Date.now() + ext)
  }
});

module.exports = store = multer({storage: storage})