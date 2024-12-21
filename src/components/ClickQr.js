import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useLocation } from "react-router-dom";
import "./ClickQr.css";

const ClickQr = () => {
  const location = useLocation();
  const { userID, amount, transactionId } = location.state || {};

  const service_id = "12345";
  const merchant_id = "67890";
  const transaction_param = transactionId || "defaultTransaction";
  const return_url = encodeURIComponent("https://yourwebsite.com/return");
  const card_type = "uzcard";

  const paymentURL = `https://my.click.uz/services/pay?service_id=${service_id}&merchant_id=${merchant_id}&amount=${amount}&transaction_param=${transaction_param}&return_url=${return_url}&card_type=${card_type}`;

  return (
    <div className="id-page">
      <h1>QR Code for CLICK Payment</h1>
      <QRCodeCanvas value={paymentURL} size={256} />
      <p>Scan the QR Code to proceed with the payment</p>
      <div className="payment-details">
        <p><strong>User ID:</strong> {userID}</p>
        <p><strong>Amount:</strong> {amount}</p>
      </div>
    </div>
  );
};

export default ClickQr;
