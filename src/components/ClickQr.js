import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

const ClickQr = () => {
  const location = useLocation();
  const { amount } = location.state || {};
  const [transactionParam, setTransactionParam] = useState("");

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
    </div>
  );
};

export default ClickQr;
