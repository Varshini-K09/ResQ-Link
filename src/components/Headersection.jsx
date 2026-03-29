import React from "react";
import "./Headersection.css";
import ambulance from "../images/amulance.jpeg";   // image inside same folder

export default function HeaderSection() {
  return (
    <div className="header-container">
      <img src={ambulance} alt="ambulance" className="ambulance-img" />
      <div className="title-wrapper">
        <span className="line"></span>
        <h2 className="title">ResQ-Link</h2>
        <span className="line"></span>
      </div>
    </div>
  );
}