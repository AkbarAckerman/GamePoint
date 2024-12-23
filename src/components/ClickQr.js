import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";
import CryptoJS from "crypto-js";

const ClickQr = () => {
  const location = useLocation();
  const { amount } = location.state || {};
  const [transactionParam, setTransactionParam] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(null); // For storing payment status
  const [loading, setLoading] = useState(false); // For button loading state

  // Generate a unique transaction parameter
  useEffect(() => {
    const generateTransactionParam = () => {
      return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    };
    setTransactionParam(generateTransactionParam());
  }, []);

  // Construct the payment URL
  const paymentURL = `https://my.click.uz/services/pay?service_id=39903&merchant_id=30020&amount=${amount}&transaction_param=${transactionParam}`;

  console.log("The link for QRCode is:", paymentURL);

  // Function to generate the Auth header
  const generateAuthHeader = () => {
    const timestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds
    const secretKey = "+JE000r78qw";
    const concatenatedString = `${timestamp}${secretKey}`;

    // Generate SHA1 hash
    const hashedString = CryptoJS.SHA1(concatenatedString).toString(CryptoJS.enc.Hex);

    // Construct the Auth header
    return `49285:${hashedString}:${timestamp}`;
  };

  // Function to check payment status
  const checkPaymentStatus = async () => {
    setLoading(true); // Set loading state to true
    try {
      const currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
      const url = `https://api.click.uz/v2/merchant/payment/status_by_mti/39903/${transactionParam}/${currentDate}`;
      const authHeader = generateAuthHeader();

      console.log("GET URL IS:", url);
      console.log("generateAuthHeader", authHeader);

      const response = await axios.get(url, {
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      console.log("Payment Status:", response.data);
      setPaymentStatus(response.data); // Update payment status state
    } catch (error) {
      console.error("Error fetching payment status:", error);
      setPaymentStatus({ error: "Failed to fetch payment status" });
    } finally {
      setLoading(false); // Reset loading state
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
        </>
      ) : (
        <p>Generating QR code...</p>
      )}
      <button onClick={checkPaymentStatus} disabled={loading}>
        {loading ? "Checking..." : "Проверить оплату"}
      </button>
      {paymentStatus && (
        <div className="payment-status">
          <h2>Payment Status</h2>
          <pre>{JSON.stringify(paymentStatus, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ClickQr;
