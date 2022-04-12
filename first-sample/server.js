require('dotenv').config();

const { VoucherifyServerSide } = require('@voucherify/sdk')

const client = VoucherifyServerSide({
    applicationId: `${process.env.API_KEY}`,
    secretKey: `${process.env.SECRET_KEY}`,
    // apiUrl: 'https://<region>.api.voucherify.io'
})

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

app.use((req, res, next) => {
  res.append("Access-Control-Allow-Origin", ["*"]);
  res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.append("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + '/public/index.html');
});


app.post("/check-voucher", (req, res) => {
  let voucherCode = req.body.voucherCode;
  if (!req.body.voucherCode) {
    res.status(400).send({
      message: "Voucher code is required",
    });
   }

  client.validations.validateVoucher(voucherCode)
  .then(response => {
    if (response.valid) {
      console.log(response)
      res.status(200).send({
        status: "success",
        message: "Voucher granted",
        amount: response.discount.amount_off,
        campaign: response.campaign ? response.campaign : null
      })
    } else {
      res.send({
        status: "error",
        message: "Voucher incorrect"
      })
    }
  })
  .catch(() => {
    res.send({
      status: "error",
      message: "Voucher incorrect"
    })
  })
});

app.post("/redeem-voucher", (req, res) => {
  let voucherCode = req.body.voucherCode;
  if (!req.body.voucherCode) {
    res.status(400).send({
      message: "Voucher code is required",
    });
   }
   client.redemptions.redeem(voucherCode)
   .then(response => {
     console.log(response)
     if (response.result) {
       console.log(response.result)
       res.status(200).send({
        status: "success",
        message: "Voucher granted",
        amount: response.voucher.discount.amount_off,
        campaign: response.campaign ? response.campaign : null
       })
     }
   })
   .catch(() => {
    res.send({
      status: "error",
      message: "Voucher incorrect"
    });
  })
});

app.listen(3000, () => {
  console.log(`Hot beans app listening on port 3000`);
});
