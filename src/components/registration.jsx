// DriverRegistration.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./registration.css"; // create the CSS file shown below in the same folder
export default function DriverRegistration() {
  const navigate = useNavigate(); 
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    vehicleNumber: "",
    licenseNumber: "",
    licenseType: "",
    dob: "",
    licenseExpiry: "",
    password: "",
    confirmPassword: "",
  });
  const [licenseImage, setLicenseImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(null); // null | true | false
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }
  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setLicenseImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }
  // simple frontend validation
  function validate() {
    const err = {};
    if (!form.firstName.trim()) err.firstName = "First name required";
    if (!form.lastName.trim()) err.lastName = "Last name required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Invalid email";
    if (!/^\d{10}$/.test(form.phone)) err.phone = "Phone must be 10 digits";
    if (!form.licenseNumber.trim()) err.licenseNumber = "License number required";
    if (!form.password || form.password.length < 6) err.password = "Password min 6 chars";
    if (form.password !== form.confirmPassword) err.confirmPassword = "Passwords do not match";
    // license expiry check
    if (form.licenseExpiry && new Date(form.licenseExpiry) < new Date()) err.licenseExpiry = "License expired";
    setErrors(err);
    return Object.keys(err).length === 0;
  }
  // mock verification: checks license format and simulates server call
  function verifyLicense() {
    setVerified(null);
    if (!form.licenseNumber) {
      setErrors((e) => ({ ...e, licenseNumber: "Enter license number first" }));
      return;
    }
    // license format example: 2 letters + 2 digits + 11 alnum (this is just an example)
    const formatRegex = /^[A-Z]{2}\d{2}[A-Z0-9]{4,10}$/i;
    if (!formatRegex.test(form.licenseNumber)) {
      setVerified(false);
      return;
    }
    setVerifying(true);
    // simulate API call delay
    setTimeout(() => {
      // fake success condition: license number length > 7 (arbitrary)
      const ok = form.licenseNumber.replace(/\s+/g, "").length >= 8;
      setVerifying(false);
      setVerified(ok);
    }, 1200);
  }
  async function handleSubmit(e) {
  e.preventDefault();
  if (!validate()) return;
  const formData = new FormData();
  for (const key in form) formData.append(key, form[key]);
  if (licenseImage) formData.append("licenseImage", licenseImage);
  try {
  const res = await fetch("http://localhost:5050/api/register", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    throw new Error("Failed to register");
  }
  const data = await res.json();
  console.log("Registration successful:", data);
  alert("Registration successful!");
   navigate("/login");
} catch (error) {
  console.error("Error during registration:", error);
  alert("Something went wrong during registration. Please try again.");
}
}
  return (
    <div className="reg-page">
      <form className="reg-card" onSubmit={handleSubmit} noValidate>
        <h2 className="title">Driver Registration</h2>
        <div className="row">
          <label>
            First name
            <input name="firstName" value={form.firstName} onChange={handleChange} />
            {errors.firstName && <small className="err">{errors.firstName}</small>}
          </label>
          <label>
            Last name
            <input name="lastName" value={form.lastName} onChange={handleChange} />
            {errors.lastName && <small className="err">{errors.lastName}</small>}
          </label>
        </div>
        <label>
          Email
          <input name="email" value={form.email} onChange={handleChange} />
          {errors.email && <small className="err">{errors.email}</small>}
        </label>
        <label>
          Phone
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="10 digits" />
          {errors.phone && <small className="err">{errors.phone}</small>}
        </label>
        <label>
          Address
          <input name="address" value={form.address} onChange={handleChange} />
        </label>
        <div className="row">
          <label>
            Vehicle number
            <input name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange} />
          </label>
          <label>
            License type
            <select name="licenseType" value={form.licenseType} onChange={handleChange}>
              <option value="">-- select --</option>
              <option value="TwoWheeler">Two Wheeler</option>
              <option value="LightMotorVehicle">Light Motor Vehicle</option>
              <option value="Commercial">Commercial</option>
            </select>
          </label>
        </div>
        <div className="row">
          <label>
            Date of birth
            <input type="date" name="dob" value={form.dob} onChange={handleChange} />
          </label>
          <label>
            License expiry
            <input type="date" name="licenseExpiry" value={form.licenseExpiry} onChange={handleChange} />
            {errors.licenseExpiry && <small className="err">{errors.licenseExpiry}</small>}
          </label>
        </div>
        <label>
          License number
          <input name="licenseNumber" value={form.licenseNumber} onChange={handleChange} />
          {errors.licenseNumber && <small className="err">{errors.licenseNumber}</small>}
        </label>
        <div className="file-row">
          <label className="file-input">
            Upload license image
            <input type="file" accept="image/*,application/pdf" onChange={handleFile} />
          </label>
          <div className="preview">
            {previewUrl ? (
              <img src={previewUrl} alt="license preview" />
            ) : (
              <div className="placeholder">No file selected</div>
            )}
          </div>
        </div>
        <div className="verify-row">
          <button type="button" onClick={verifyLicense} className="btn-secondary">
            {verifying ? "Verifying..." : "Verify License"}
          </button>
          {verified === true && <span className="verified">✔ License verified</span>}
          {verified === false && <span className="not-verified">✖ Not verified</span>}
        </div>
        <label>
          Password
          <input type="password" name="password" value={form.password} onChange={handleChange} />
          {errors.password && <small className="err">{errors.password}</small>}
        </label>
        <label>
          Confirm password
          <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} />
          {errors.confirmPassword && <small className="err">{errors.confirmPassword}</small>}
        </label>
        <div className="actions">
          <button type="submit" className="btn-primary">Register</button>
          <button type="button" className="btn-ghost" onClick={() => { setForm({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            address: "",
            vehicleNumber: "",
            licenseNumber: "",
            licenseType: "",
            dob: "",
            licenseExpiry: "",
            password: "",
            confirmPassword: "",
          }); setLicenseImage(null); setPreviewUrl(null); setErrors({}); setVerified(null); }}>
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

