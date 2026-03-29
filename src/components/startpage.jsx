import React from "react";
import "./startpage.css";
import { useNavigate } from "react-router-dom"; // Import this
export default function Startpage() {
    const navigate = useNavigate();
    function loginpage(e) {
        e.preventDefault();
        navigate("/login"); // Navigate to login page
    }
    function emergencypage(e) {
        e.preventDefault();
        navigate("/emergency"); // Navigate to emergency page
    }
    function registration(e) {
        e.preventDefault();
        navigate("/registration"); // Navigate to emergency page
    }
    return (
        <div className="main-container">
            <h3 className="subtitle">GET AMBULANCE NOW</h3>
            <button className="login-btn" onClick={loginpage}>LOGIN</button>
            <button className="emergency-btn" onClick={emergencypage}>EMERGENCY</button>
             <button className="login-btn" onClick={registration}>REGISTRATION</button>
        </div>
    );
}
