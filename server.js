const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

// 🔐 REPLACE THESE
const consumerKey = "1BQnYUarvsdUYpMTSb0XsOkIrNJmhjomSFf0NudztmuXY0Zu";
const consumerSecret = "5grfyRzmNXemSuyYbkZC9CkXOk7wb9I6kGm5elaPYB4fwgbMwC8CA8Veh86NCKZh";

const shortcode = "174379";
const passkey = "const passkey = "bfb279f9aa9bdbcf158c4e97ddbf3a383d9c8cbe4f0d7f3c9b9e2d5f1c7e3a8f9";"; // use full passkey

// Generate access token
async function getAccessToken() {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const res = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );

  return res.data.access_token;
}

// STK Push
app.post("/stkpush", async (req, res) => {
  const { phone, amount } = req.body;

  const token = await getAccessToken();

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, "")
    .slice(0, 14);

  const password = Buffer.from(shortcode + passkey + timestamp).toString("base64");

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phone,
    PartyB: shortcode,
    PhoneNumber: phone,
    CallBackURL: "https://ruby-pos-mpesa.onrender.com/callback",
    AccountReference: "Ruby POS",
    TransactionDesc: "Subscription Payment",
  };

  try {
    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json(err.response?.data || err.message);
  }
});

// Callback
app.post("/callback", (req, res) => {
  console.log("M-Pesa Callback:", JSON.stringify(req.body, null, 2));

  res.sendStatus(200);
});

app.listen(3000, () => console.log("Server running on port 3000"));
app.get("/test", async (req, res) => {
  const phone = "254796594295";
  const amount = 10;

  try {
    const token = await getAccessToken();

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:.TZ]/g, "")
      .slice(0, 14);

    const password = Buffer.from(shortcode + passkey + timestamp).toString("base64");

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: "https://ruby-pos-mpesa.onrender.com/callback",
      AccountReference: "Ruby POS",
      TransactionDesc: "Test Payment",
    };

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json(err.response?.data || err.message);
  }
});
