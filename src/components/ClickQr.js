import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";
import sha1 from "sha1";

const ClickQr = () => {
  const location = useLocation();
  const { amount } = location.state || {};
  const [transactionParam, setTransactionParam] = useState("");
  const [loading, setLoading] = useState(false);

  // Generate a unique transaction parameter
  useEffect(() => {
    const generateTransactionParam = () => {
      return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    };
    setTransactionParam(generateTransactionParam());
  }, []);

  const paymentURL = `https://my.click.uz/services/pay?service_id=39903&merchant_id=30020&amount=${amount}&transaction_param=${transactionParam}`;

  console.log("paymentURL is:", paymentURL);

  const generateAuth = () => {
    const merchantId = "49285";
    const secretKey = "JE000r78qw";
    const timestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds
    console.log("TIMESTAMP IS:", timestamp);
    const hash = sha1(`${timestamp}${secretKey}`); // SHA-1 encryption
    return `${merchantId}:${hash}:${timestamp}`;
  };

  // Handle payment status check
  const checkPaymentStatus = async () => {
    setLoading(true);

    const authHeader = generateAuth();
    const currentDate = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
    const url = `/v2/merchant/payment/status_by_mti/39903/${transactionParam}/${currentDate}`;

    console.log("get request url is:", url);
    console.log("THE AUTH IS:", authHeader);

    try {
      const response = await axios.get(url, {
        headers: {
          Auth: authHeader,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      console.log("Response Data:", response.data); // Log the response data in the console
    } catch (err) {
      console.error("Error fetching payment status:", err.response?.data || err); // Log the error in the console
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qr-page">
      <h1>Scan QR to Pay</h1>
      {transactionParam ? (
        <>
          <QRCodeCanvas value={paymentURL} size={256} />
          <p>Amount: {amount}</p>
          <p>Transaction ID: {transactionParam}</p>
          <button onClick={checkPaymentStatus} disabled={loading}>
            {loading ? "Checking..." : "Проверить оплату"}
          </button>
        </>
      ) : (
        <p>Generating QR code...</p>
      )}
    </div>
  );
};

export default ClickQr;
