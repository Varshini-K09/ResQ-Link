import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Candidatelogin from "./components/candidatelogin";
import Mainsection from "./components/MainSection";
import HeaderSection from "./components/Headersection";
import Registration from "./components/registration";
import Startpage from "./components/startpage";
import Track from "./components/track";


function AppWrapper() {
  const location = useLocation();

  // Show header only on "/" and "/MainSection"
  const showHeader = location.pathname === "/" || location.pathname === "/emergency";

  return (
    <>
      {showHeader && <HeaderSection />}
      <Routes>
        <Route path="/" element={<Startpage />} />
        <Route path="/emergency" element={<Mainsection />} />
        <Route path="/login" element={<Candidatelogin />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/track" element={<Track />} />  {/* Add this */}
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}

export default App;
