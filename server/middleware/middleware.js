const Userdb = require("../model/userSchema");

exports.checkAuthenticated = (req, res, next)=>{
  if(req.isAuthenticated()){
    return next()
  }
  res.redirect('/')
}

exports.checkNotAuthenticated = (req,res,next)=>{
  if(req.isAuthenticated()){
    return res.redirect('/home')
  }
  next()
}

exports.checkAuthenticatedAdmin = (req,res,next)=>{
  if(req.session.isAdminLoggedIn){
    return next();
  }
  res.redirect("/admin")
}

exports.checkNotAuthenticatedAdmin=(req,res,next)=>{
  if(req.session.isAdminLoggedIn){
    res.redirect("/admin/admin-dash")
  }
  return next();
}

exports.isBlocked = async (req,res,next) => {
  
  const id = req.session?.passport?.user
  
  const user = await Userdb.findById(id)

  const status = user?.isBlocked

  if( status === true){
    return res.redirect("/user-blocked")
  } 
  next();
}