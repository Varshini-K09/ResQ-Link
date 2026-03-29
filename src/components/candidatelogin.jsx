import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import this
import loginimage from "../images/login_image.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import "./candidatelogin.css";
function Candidatelogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Hook to navigate
  const userlogin = async (e) => {
  e.preventDefault();
  if (!email || !password) {
    alert("Please enter both email and password");
    return;
  }
  try {
    const response = await fetch("http://localhost:5050/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (response.ok) {
      alert(data.message || "Login successful!");
        navigate(`/track?role=driver&id=${data.id || "driver1"}`);
    } else {
      alert(data.message || "Invalid email or password");
    }
  } catch (error) {
    console.error("Error connecting to server:", error);
    alert("Server error. Please try again later.");
  }
};
  return (
    <div className="container">
      <div className="login-box">
        <h2>
          ResQ-Link <span className="highlight">LOGIN</span>
        </h2>
        <form onSubmit={userlogin}>
          <div className="input-container">
            <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
            <input
              type="email"
              placeholder="Email"
              className="input-box"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-container">
            <FontAwesomeIcon icon={faLock} className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="input-box"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </span>
          </div>
          <button type="submit" className="login-btn">
            LOGIN
          </button>
        </form>
        <div className="login-footer">
          <h4 className="google">
            <FontAwesomeIcon icon={faGoogle} /> Continue with Google
          </h4>
          <h4 className="password">Forgot password?</h4>
        </div>
      </div>
      <div className="image-box">
        <img src={loginimage} alt="Hospital" />
      </div>
    </div>
  );
}
export default Candidatelogin;
