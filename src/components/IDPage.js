import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./IDPage.css";
import axios from "axios";

const IDPage = () => {
  const [userID, setUserID] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState(false);
  const [amountError, setAmountError] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const navigate = useNavigate();

  // Automatically fetch server IP when the component mounts
  useEffect(() => {
    const fetchServerIP = async () => {
      try {
        const response = await axios.get("https://vm4983125.25ssd.had.wf:5000/test_ip");
        console.log("Server IP Response:", response.data);
      } catch (error) {
        console.error("Error fetching server IP:", error);
      }
    };

    fetchServerIP();
  }, []); // Empty dependency array to run only once

  const generateUniqueId = () => {
    return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  };

  const handlePayment = async () => {
    if (!userID.trim() || !amount.trim()) {
      setError(true);
      return;
    }

    if (parseInt(amount) < 1000) {
      setAmountError("Сумма должна быть не менее 1000");
      return;
    }
    setAmountError("");
    setError(false);

    const generatedId = generateUniqueId();
    const generatedOrderId = generateUniqueId();

    const amountInCents = parseInt(amount) * 100;

    const payload = {
      id: generatedId,
      method: "receipts.create",
      params: {
        amount: amountInCents,
        account: {
          order_id: generatedOrderId,
        },
      },
    };

    try {
      const response = await fetch("https://checkout.paycom.uz/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Auth": "675ac1ca47f4e3e488ef4791:krd&yymqu#mU1K4Uo%3o28trTEwB5E@T2XCP",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data?.result?.receipt?._id) {
        const transactionId = data.result.receipt._id;
        setTransactionId(transactionId);
        console.log("Payment Response:", data);

        navigate("/qr", { state: { userID, amount, transactionId, generatedId } });
      } else {
        console.error("Failed to get transaction ID from response:", data);
      }
    } catch (error) {
      console.error("Error during payment:", error);
    }
  };

  const handleNavigation = (route) => {
    if (!userID.trim() || !amount.trim()) {
      setError(true);
    } else {
      setError(false);
      navigate(route, { state: { userID, amount, transactionId } });
    }
  };

  return (
    <div className="id-page">
      <img src="./cyberclub.svg" alt="Game Point Logo" className="logo" />

      <input
        type="text"
        className="input-id"
        placeholder="Напишите свой ID"
        value={userID}
        onChange={(e) => setUserID(e.target.value)}
      />

      <input
        type="number"
        className="input-id"
        placeholder="Введите сумму (не меньше 1000)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        min="1000"
      />

      {amountError && <p className="error-message">{amountError}</p>}

      {error && !amountError && (
        <p className="error-message">Пожалуйста, введите свой ID и сумму</p>
      )}

      <div className="buttons">
        <button className="btn" onClick={() => handleNavigation("/clickqr")}>
          CLICK
        </button>
        <button className="btn" onClick={handlePayment}>
          PAYME
        </button>
      </div>
    </div>
  );
};

export default IDPage;
