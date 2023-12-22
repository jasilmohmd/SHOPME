const express = require("express");
const dotenv = require("dotenv")
const morgan = require("morgan");
const path = require("path");
const session = require('express-session');
const flash = require("express-flash");
const passport = require('./passport-config');
const methodOverride = require('method-override');


const connectDB = require("./server/database/connection");


const app = express();

dotenv.config({ path: "config.env" })
const PORT = process.env.PORT;

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

//log requests
app.use(morgan("dev"));

//mongodb connection
connectDB();

app.use(passport.initialize())

app.use(passport.session())
app.use(methodOverride('_method'))

//parse request
app.use(express.urlencoded({ extended: false }));
app.use(flash())


//clear cache
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next()
});



//set view engine
app.set("view engine", "ejs")

//load assets
app.use("/css", express.static(path.resolve(__dirname, "assets/css")))
app.use("/img", express.static(path.resolve(__dirname, "assets/img")))
app.use("/js", express.static(path.resolve(__dirname, "assets/js")))

//load routers
app.use("/", require("./server/routes/user_router"));
app.use("/admin", require("./server/routes/admin_router"));

app.listen(PORT, () => { console.log(`Server is running on http://localhost:${PORT}`) })