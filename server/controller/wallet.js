const walletDb = require("../model/walletSchema");
const { ObjectId } = require("mongodb");
const moment = require("moment-timezone");

const Razorpay = require("razorpay");
const Userdb = require("../model/userSchema");
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_ID_KEY,
  key_secret: RAZORPAY_SECRET_KEY
});

exports.showWallet = async (req, res) => {
  const uId = req.query.uId;
  try {
    const wallet = await walletDb.findOne({ userId: uId });

    // console.log(wallet);

    if (wallet) {

      // Manually format the transaction dates
      wallet.transactions.forEach(transaction => {
        transaction.formattedDate = moment(transaction.date).tz("Asia/Kolkata").format("DD/MM/YYYY - hh:mm A");
      });

      res.send(wallet);
    } else {
      res.send(false);
    }

  } catch (err) {
    console.log(err);
    res.send("internal server error");
  }
}

exports.addMoney = async (req, res) => {

  const uId = req.session.passport.user;
  
  const amount = req.body.amount * 100;
  const options = {
    amount: amount,
    currency: "INR",
    receipt: "admin@gmail.com"
  }

  const userDb = await Userdb.findById( uId );

  const user = {
    userName : userDb.name,
    phone : userDb.phone
  }

  try {
    const orders = await razorpayInstance.orders.create(options);

    // console.log(orders);

    res.json({ orders, key_id: RAZORPAY_ID_KEY , user });
  } catch (err) {
    console.log(err);
    res.send(false)
  }

}

exports.rzpHandler = async (req, res) => {
  const uId = req.session.passport.user;
  const amount = req.query.amount;
  try {

    const crypto = require("crypto");

    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY);
    hmac.update(
      req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id
    );

    if (hmac.digest("hex") === req.body.razorpay_signature) {

      let wallet = await walletDb.findOne({ userId: uId });

      if (!wallet) {
        wallet = new walletDb({
          userId: uId,
          balance: amount,
          transactions: [
            {
              transactType: true,
              amount: amount
            }
          ]
        })
      }
      else {
        await walletDb.findOneAndUpdate({ userId: uId }, { $inc: { balance: amount } });
        wallet.transactions.push({ transactType: true, amount: amount });
      }

      await wallet.save();

      res.send(`${amount} added to your wallet`)

    }
    else {
      res.send("Payment failed")
    }

  } catch (err) {
    console.log(err);
  }
}