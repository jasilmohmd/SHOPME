const Userdb = require("../model/userSchema");

exports.checkAuthenticated = (req, res, next)=>{

  try{
    
    if(req.isAuthenticated()){
      return next()
    }
    res.redirect('/')

  }catch(err){
    res.render("errorPage", { status: 500 });
  }

}

exports.checkNotAuthenticated = (req,res,next)=>{

  try{
    
    if(req.isAuthenticated()){
      return res.redirect('/home')
    }
    next()

  }catch(err){
    res.render("errorPage", { status: 500 });
  }

}

exports.checkAuthenticatedAdmin = (req,res,next)=>{
  try{
    
    if(req.session.isAdminLoggedIn){
      return next();
    }
    res.redirect("/admin")

  }catch(err){
    res.render("errorPage", { status: 500 });
  }
}

exports.checkNotAuthenticatedAdmin=(req,res,next)=>{
  try{
    
    if(req.session.isAdminLoggedIn){
      res.redirect("/admin/admin-dash")
    }
    return next();

  }catch(err){
    res.render("errorPage", { status: 500 });
  }
}

exports.isBlocked = async (req,res,next) => {

  try{
    
    const id = req.session?.passport?.user
    
    const user = await Userdb.findById(id)
  
    const status = user?.isBlocked
  
    if( status === true){
      return res.redirect("/user-blocked")
    } 
    next();

  }catch(err){
    res.render("errorPage", { status: 500 });
  }
  
}