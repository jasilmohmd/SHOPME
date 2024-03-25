const Userdb = require("../model/userSchema");
const bcrypt = require("bcrypt");

exports.find = (req, res) => {
  if (req.query.id) {
    const id = req.query.id;

    Userdb.findById(id)
      .then(data => {
        if (!data) {
          res.status(404).send({ message: "user not found with id " + id })
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
    Userdb.find()
      .then(users => {
        res.status(200).send(users)
      })
      .catch(err => {
        res.render("errorPage", { status: 500 });
      })
  }
}

exports.block = async (req, res) => {
  const id = req.query.id;

  try{

    await Userdb.updateOne({ _id: id }, { $set: { isBlocked: true } });
  
    res.redirect("/admin/user-manage")

  }catch(err){

    res.render("errorPage", { status: 500 });

  }


}

exports.unblock = async (req, res) => {
  const id = req.query.id;

  try{
    
    await Userdb.updateOne({ _id: id }, { $set: { isBlocked: false } });
  
    res.redirect("/admin/user-manage")

  }catch(err){

    res.render("errorPage", { status: 500 });

  }

}

exports.update = async (req,res)=> {

  try{

    const id = req.session.passport.user;
    const {name,phone} = req.body;

    await Userdb.updateOne({ _id: id }, { $set: { name: name, phone: phone } });

    res.send("details updated");

  }catch(err){
    res.render("errorPage", { status: 500 });
  }

}

exports.changePassword = async (req,res) => {

  try{

    const id = req.session.passport.user;
    const {oldPassword,password} = req.body;

    const user = await Userdb.findById(id);

    if(await bcrypt.compare(oldPassword,user.password)){

      const hashedPassword = await bcrypt.hash(password, 10);

      await Userdb.findOneAndUpdate({_id: id},{$set:{password: hashedPassword}});

      res.send("password changed");

    }
    else{

      res.send("old password doesnt match");

    }


  }catch(err){

    res.render("errorPage", { status: 500 });

  }

}