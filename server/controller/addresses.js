const addressDb = require("../model/addressSchema");


exports.addAddress = async (req,res) => {
  const uId = req.session.passport.user;
  const main = req.query.main;

  // console.log(uId);

  try{

    let user = await addressDb.findOne({userId: uId});

    // console.log(user);

    const address = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      district: req.body.district,
      pincode: req.body.pincode,
      default: true
    }

    const addressF = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      district: req.body.district,
      pincode: req.body.pincode,
      default: false
    }

    if(!user){
      user = new addressDb({
        userId: uId,
        addresses:[
          address
        ]
      })

    }
    else{
      if (user.addresses.length<1){
        user.addresses.push(address)
      }else{
        if(main==="true"){
          user.addresses.push(addressF)
        }
        else{

          // Update the default field of the matching address to false
          await addressDb.updateMany({ userId: uId, "addresses.default": true }, { $set: { "addresses.$.default": false } });

          user.addresses.push(address)
        }
        
      }
      
    }

    await user.save();

    if(main==="true"){
      res.redirect("/address_page");
    }
    else{
      res.redirect("/payment_page");
    }
    
  }catch(err){
    console.log(err);
    res.render("errorPage",{ status: 500 });
  }
}

exports.showAddresses = async (req,res) => {
  const uId = req.params.uId;
  const index = req.params.index;

  

    try{

      if(index){

        const user = await addressDb.findOne({ userId: uId });
    
        const address = user.addresses[index];
    
        res.send(address);
    
      } else {

        let user = await addressDb.findOne({userId: uId});
        
        let address

        if(user===null){
          res.send(false);
        }else {
          address = user.addresses;
          res.send(address);
        }

      
      }
      
  
    }catch(err){
      console.log(err.message);
      res.render("errorPage",{ status: 500 });
    }

  

  
}

exports.removeAddress = async (req,res) => {
  const uId = req.session.passport.user;
  const index = req.params.index

  try{

    let user = await addressDb.findOne({userId: uId});

    console.log(user.addresses[index].default);

    
    if(user.addresses[index].default===true){

      user.addresses.splice(index,1);


      if (user.addresses.length > 0) {
        const newDefaultIndex = 0;
        user.addresses[newDefaultIndex].default = true;
      }

      await addressDb.updateOne({userId: uId },{ $set: { addresses: user.addresses } });

      await user.save();
      return res.redirect("/address_page");

    }
    
    user.addresses.splice(index,1);
    

    await user.save();

    res.redirect("/address_page");

  }catch(err){
    console.log(err);
    res.render("errorPage",{ status: 500 });

  }
}

exports.makeDefault = async (req,res) => {

  const uId = req.session.passport.user;
  const index = req.params.index;

  try{
    
    // Update the default field of the matching address to false
    await addressDb.updateOne({userId: uId, "addresses.default": true},{$set:{"addresses.$.default": false}});
    
    // Update the default field of the specified index to true
    await addressDb.updateOne(
      { userId: uId, [`addresses.${index}.default`]: { $ne: true } }, // Add a condition to avoid unnecessary updates
      { $set: { [`addresses.${index}.default`]: true } }
    );


    res.redirect("/address_page");

  }catch(err){
    console.log(err);
    res.render("errorPage",{ status: 500 });
  }
  
}

exports.updateAddress = async (req,res) => {
  const uId = req.session.passport.user;
  const index = req.params.index;

  try{

    let user = await addressDb.findOne({userId: uId});

    let value = user.addresses[index].default;
    
    await addressDb.updateOne({ userId: uId, 'addresses._id': user.addresses[index]._id }, 
    { $set: 
      { 
        'addresses.$.name': req.body.name,
        'addresses.$.phone': req.body.phone,
        'addresses.$.address': req.body.address,
        'addresses.$.district': req.body.district,
        'addresses.$.pincode': req.body.pincode,
        'addresses.$.default': value
      } 
    });

    res.redirect("/address_page");


  }catch(err){
    console.log(err);
    res.render("errorPage",{ status: 500 });
  }
}

exports.changeAddress = async (req,res) => {

  const uId = req.session.passport.user;
  const address = req.body.addressid;
  console.log(req.body);
  console.log(address);

  try{
    
    // Update the default field of the matching address to false
    await addressDb.updateOne({userId: uId, "addresses.default": true},{$set:{"addresses.$.default": false}});
    
    // Update the default field of the specified address id to true
    await addressDb.updateOne(
      { userId: uId , 'addresses._id': address }, // Add a condition to avoid unnecessary updates
      { $set: { [`addresses.$.default`]: true } }
    );


    res.redirect("/payment_page");

  }catch(err){
    console.log(err);
    res.render("errorPage",{ status: 500 });
  }
  
}