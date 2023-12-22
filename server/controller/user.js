const Userdb = require("../model/userSchema");

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
        res.status(500).send({ message: "Error retrieving user with id " + id })
      })
  }
  else {
    //retrieve all products
    Userdb.find()
      .then(users => {
        res.status(200).send(users)
      })
      .catch(err => {
        res.status(500).send({ message: err.message })
      })
  }
}

exports.block = async (req, res) => {
  const id = req.query.id;

  await Userdb.updateOne({ _id: id }, { $set: { isBlocked: true } });

  res.redirect("/admin/user-manage")

}

exports.unblock = async (req, res) => {
  const id = req.query.id;

  await Userdb.updateOne({ _id: id }, { $set: { isBlocked: false } });

  res.redirect("/admin/user-manage")
}