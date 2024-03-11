const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const userOTPdb = require("../model/userOTPVerificationSchema");

//node mailer stuff
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  }
})


//send otp verification email
const sendOTPVerificationEmail = async (req, res) => {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: req.session.user,
      subject: "Verify your email",
      html: `<p>Enter <b>${otp}</b> in the app to verify your email address and continue with changing your password.</p>
      <p>this code expires in 1 minute.</p>`
    };

    //hash otp
    const hashedOTP = await bcrypt.hash(otp, 10);


    const newOTPVerification = new userOTPdb({
      email: req.session.user,
      otp: hashedOTP,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 60000),
    });

    //save otp record
    const data = await newOTPVerification.save();

    req.session.otpId = data._id;

    email = req.session.user

    await transporter.sendMail(mailOptions);


    res.render("user_forgotPassword2", { email })

  } catch (err) {
    console.log(err);
    res.render("errorPage", { status: 500 });
  }
}

exports.otp = (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "you left the field empty" })
    return
  }
  req.session.user = req.body.email

  sendOTPVerificationEmail(req, res);
}

exports.otpVerification = async (req, res) => {

  try {

    if (!req.body) {
      res.status(400).send({ message: "you left the field empty" });
      return
    }
    const otpUser = await userOTPdb.findOne({ _id: req.session.otpId });

    if (!otpUser) {
      res.send({ message: "otp expired" });
    }
    else {

      email = req.session.user

      const { expiresAt } = otpUser

      if (expiresAt < Date.now()) {
        await userOTPdb.deleteMany({ _id: req.session.otpId });
        res.send({ message: "OTP expired.please try again" })
      }
      else {
        const otp = req.body.otp;

        const validOTP = await bcrypt.compare(otp, otpUser.otp);

        if (!validOTP) {
          res.send({ message: "invalid otp" })
        }
        else {
          res.render("user_forgotPassword3", { email });
        }
      }
    }

  } catch (err) {

    res.render("errorPage", { status: 500 });

  }

}