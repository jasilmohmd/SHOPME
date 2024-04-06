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

// exports.showWallet = async (req, res) => {
//   const uId = req.query.uId;
//   try {
//     const wallet = await walletDb.findOne({ userId: uId });

//     // console.log(wallet);

//     if (wallet) {

//       // Manually format the transaction dates
//       wallet.transactions.forEach(transaction => {
//         transaction.formattedDate = moment(transaction.date).tz("Asia/Kolkata").format("DD/MM/YYYY - hh:mm A");
//       });

//       res.send(wallet);
//     } else {
//       res.send(false);
//     }

//   } catch (err) {
//     console.log(err);
//     res.render("errorPage", { status: 500 });
//   }
// }

exports.showWallet = async (req, res) => {
  const uId = req.query.uId;
  const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
  const pageSize = 5; // Default page size to 10 if not specified

  try {
    const wallet = await walletDb.findOne({ userId: uId });

    if (wallet) {

      // Reverse transactions to show the latest transactions first
      const reversedTransactions = wallet.transactions.slice().reverse();

      // Paginate transactions
      const startIndex = (page - 1) * pageSize;
      const endIndex = page * pageSize;
      const paginatedTransactions = reversedTransactions.slice(startIndex, endIndex);
      const balance = wallet.balance;
      // Manually format the transaction dates
      paginatedTransactions.forEach(transaction => {
        transaction.formattedDate = moment(transaction.date).tz("Asia/Kolkata").format("DD/MM/YYYY - hh:mm A");
      });

      // Calculate total number of pages
      const totalPages = Math.ceil(wallet.transactions.length / pageSize);

      res.send({
        transactions: paginatedTransactions,
        totalPages: totalPages,
        currentPage: page,
        balance: balance
      });
    } else {
      res.send(false);
    }
  } catch (err) {
    console.log(err);
    res.render("errorPage", { status: 500 });
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

  
  try {
    const userDb = await Userdb.findById( uId );
  
    const user = {
      userName : userDb.name,
      phone : userDb.phone
    }

    const orders = await razorpayInstance.orders.create(options);

    // console.log(orders);

    res.json({ orders, key_id: RAZORPAY_ID_KEY , user });
  } catch (err) {
    console.log(err);
    res.send(false);
    res.render("errorPage", { status: 500 });
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
              amount: amount,
              source: "Wallet Topup"
            }
          ]
        })
      }
      else {
        await walletDb.findOneAndUpdate({ userId: uId }, { $inc: { balance: amount } });
        wallet.transactions.push({ transactType: true, amount: amount, source: "Wallet Topup" });
      }

      await wallet.save();

      res.send(`${amount} added to your wallet`)

    }
    else {
      res.send("Payment failed")
    }

  } catch (err) {
    console.log(err);
    res.render("errorPage", { status: 500 });
  }
}