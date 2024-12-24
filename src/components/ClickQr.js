import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";
import sha1 from "sha1"; // Install this using npm: `npm install sha1`

const ClickQr = () => {
  const location = useLocation();
  const { amount } = location.state || {};
  const [transactionParam, setTransactionParam] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generate a unique transaction parameter
  useEffect(() => {
    const generateTransactionParam = () => {
      return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    };
    setTransactionParam(generateTransactionParam());
  }, []);

  // Construct the payment URL
  const paymentURL = `https://my.click.uz/services/pay?service_id=39903&merchant_id=30020&amount=${amount}&transaction_param=${transactionParam}`;

  console.log("paymentURL is:", paymentURL);

  // Generate dynamic Auth header
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
    setError(null);

    const authHeader = generateAuth();
    const currentDate = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
    const url = `https://api.click.uz/v2/merchant/payment/status_by_mti/39903/${transactionParam}/${currentDate}`;

    console.log("get request url is:", url);
    console.log("THE AUTH IS:", authHeader);

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      setPaymentStatus(response.data);
    } catch (err) {
      setError("Failed to fetch payment status. Please try again.");
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
          {paymentStatus && (
            <div className="payment-status">
              <h3>Payment Status:</h3>
              <p>Error Code: {paymentStatus.error_code}</p>
              <p>Message: {paymentStatus.error_note}</p>
              <p>Payment ID: {paymentStatus.payment_id}</p>
              <p>Payment Status: {paymentStatus.payment_status}</p>
            </div>
          )}
          {error && <p className="error">{error}</p>}
        </>
      ) : (
        <p>Generating QR code...</p>
      )}
    </div>
  );
};

export default ClickQr;
