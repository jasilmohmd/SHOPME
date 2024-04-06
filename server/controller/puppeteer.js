const puppeteer = require("puppeteer");
const fs = require("fs-extra");
const path = require("path");
const ejs = require("ejs");
const orderDb = require("../model/orderSchema");

const compile = async function (template, data) {
  try {
    const filePath = path.join(__dirname, "../..", "views", "templates", `${template}.ejs`);
    const html = await fs.readFile(filePath, "utf-8");
    return ejs.render(html, data);
  } catch (err) {
    throw new Error(`Error compiling EJS template: ${err.message}`);
  }
}


async function generatePdf(template, data, browser) {
  try {
    const page = await browser.newPage();

    const content = await compile(template, data );

    await page.setContent(content);

    const pdfBuffer = await page.pdf({
      path: "invoice.pdf",
      format: "A4",
      printBackground: true
    });

    return pdfBuffer;

  } catch (err) {

    console.log(err);

  }
}

exports.invoice = async (req, res) => {

  try {
    const browser = await puppeteer.launch();

    const id = req.query.id;

    const order = await orderDb.findOne({ _id: id });
    const data = { order };
    const pdfBuffer = await generatePdf("invoice", data, browser);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");

    res.end(pdfBuffer);

    await browser.close();

  } catch (err) {
    console.log(err);
  }


}

exports.salesReport = async (req, res) => {
  try {
    const browser = await puppeteer.launch();
    
    // Fetch orders with status "delivered" only
    const orders = await orderDb.find({ 'orderItems.orderStatus': 'delivered' });

    let totalDeliveredOrders = 0;
    let totalAmountDelivered = 0;

    orders.forEach(order => {
      totalDeliveredOrders++;
      totalAmountDelivered += calculateTotalAmount(order);
    });

    
    const data = {
      orders,
      totalDeliveredOrders,
      totalAmountDelivered
    }
    
    console.log(data);
    
    const pdfBuffer = await generatePdf("salesReport", data, browser);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=sales_report.pdf");

    res.end(pdfBuffer);

    await browser.close();
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred while generating the sales report.");
  }
};


function calculateTotalAmount(order) {
  let total = 0;
  order.orderItems.forEach(item => {
      // Calculate the total amount for each item including coupon discount
      total += (item.price - item.couponDiscount) * item.quantity;
  });
  return total;
}