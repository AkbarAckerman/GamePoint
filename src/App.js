import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import IDPage from "./components/IDPage";
import QRPage from "./components/QRPage";
import ClickQr from "./components/ClickQr";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IDPage />} />
        <Route path="/qr" element={<QRPage />} />
        <Route path="/clickqr" element={<ClickQr />} />
      </Routes>
    </Router>
  );
};

export default App;
