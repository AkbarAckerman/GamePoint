import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./IDPage.css";
import axios from "axios";

const ICAFE_MEMBERS_API =
  "https://api.icafecloud.com/api/v2/cafe/78949/members/action/suggestMembers";
const ICAFE_AUTH_TOKEN =
  "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNjlhZTIyNDNjZjRiYTlmMmRlYzAxYWQ4MjNjNTBjYWE2NGNiZWU5NjkzMGQ5ZmEyZTY0MWM2MDZmOTdkZjE5NDY5YWFkMGJmNTVkZGFmNjciLCJpYXQiOjE3MzQ0MjI4NzUuOTYwMDg1LCJuYmYiOjE3MzQ0MjI4NzUuOTYwMDg3LCJleHAiOjE3NjU5NTg4NzUuOTU4MDc5LCJzdWIiOiIzODQxMTkwMTI4Nzg5NDkiLCJzY29wZXMiOltdfQ.JTuAqQibEtsSGZcbk5adaA-SeY2sOlMy69A7bEcrA-McUg2a5zdxJZTwIPTm9pzaPQIzsiXZMffgXYUA5Zf23RYJTqGErb6vkWeaYXMQLdn6tzownZhzKD-SpCbsoHK5BGYpqpDLMnPevxgJ43bOBKYkIzuraxsip1qcuSdvjtcrfK4avU02XP2KQq7qMLWasZ5QM12rgghQIX0fahwwK7FOtzeylgzqCGC38mnxuaj6-p3G_V5A_enoPgUDtJm58-0xCVg9aI3i-Cer5S9D6pfnMVXYeuss6BJm2clg1QAvJx9Z5nHJX2zrOJUq5W017bwWYY2NRRSu1OT0HBN3me63FRRdT9TJOMeR1Wcm0ppCZihDWkLmuQ00nnq09LijRIKg5US68Tyg8Hni58oyKbjf90X1FHIzYzxA7vkmXc3h_2q7PAAD7_OQlVyBiaXMg8pS3N-uxIuoLUMbQlx9MYxeQk1A0iTggzHGlTD2TohWE0yW2LNjdTUah9J9Oi7ifY_BO7jrKQlxpJTq_KMJ6NApcukECZTO-Oe9i__54qYgWIMlCkl39ibtfJe3R9_8zX9uhgK3vLgDYgP5Z_Y_wuz0uj3FgE7lI55tGB4UVJuyW8S0R0Dx77UV_ue5Gr-RkXcGB5-eV7okJqX5TujUp5Jur-vN5-JWrJanga-jwIE";

const IDPage = () => {
  
  const [userID, setUserID] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState(false);
  const [amountError, setAmountError] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [memberError, setMemberError] = useState("");
  const navigate = useNavigate();

  // useEffect(() => {
  //   const fetchServerIP = async () => {
  //     try {
  //       const response = await axios.get("https://httpbin.org/ip");
  //       console.log("Server IP Response:", response.data);
  //     } catch (error) {
  //       console.error("Error fetching server IP:", error);
  //     }
  //   };

  //   fetchServerIP();
  // }, []);

  const generateUniqueId = () => {
    return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  };

  const fetchICafeMember = async (memberId) => {
    const url = `${ICAFE_MEMBERS_API}?search_text=${memberId}`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: ICAFE_AUTH_TOKEN,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (data.code === 200 && data.data.length > 0) {
        console.log("Member Found:", data.data[0]);
        return true;
      } else {
        console.error("No member found with ID:", memberId);
        return false;
      }
    } catch (error) {
      console.error("Error fetching member:", error);
      return false;
    }
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

    const memberExists = await fetchICafeMember(userID);
    if (!memberExists) {
      setMemberError("Пользователь с таким ID не найден");
      return;
    }

    setMemberError("");

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
      {memberError && <p className="error-message">{memberError}</p>}
      {error && !amountError && !memberError && (
        <p className="error-message">Пожалуйста, введите свой ID и сумму</p>
      )}

      <div className="buttons">
        <button className="btn" onClick={() => navigate("/clickqr", { state: { amount } })}>
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
