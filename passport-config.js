const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt');
var Userdb = require("./server/model/userSchema");
const passport = require("passport");

passport.use(
    new LocalStrategy({ usernameField: 'email' },async (email, password, done) => {

      try {

        const user = await Userdb.findOne({email: email});

        if (!user) {
          return done(null, false, { message: 'No user with that email' })
        }

        if (await bcrypt.compare(password, user.password)) {
          await Userdb.findByIdAndUpdate({_id: user._id},{$set:{status: "Active"}});
          return done(null, user)
        }
        else {
          return done(null, false, { message: 'Password incorrect' })
        }

      } catch (e) {
        return done(e)
      }
    })
  );


  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id, done) => {
    try{
      const user = await Userdb.findById(id);
      done(null, user);
    }catch(err){
      done(err)
    }
  });


module.exports = passport

