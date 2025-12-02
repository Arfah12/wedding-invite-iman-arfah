import React, { useState } from "react";

const FloatingMenu = () => {
  const [activePopup, setActivePopup] = useState(null);

  const togglePopup = (popupName) => {
    setActivePopup(activePopup === popupName ? null : popupName);
  };

  return (
    <>
      <div className="floating-menu">
        <button onClick={() => togglePopup("location")} title="Location">📍</button>
        <button onClick={() => togglePopup("wishlist")} title="Wishlist">🎁</button>
        <button onClick={() => togglePopup("contact")} title="Contact">💌</button>
        <button onClick={() => togglePopup("money")} title="Money Gift">💰</button>
      </div>

      {/* LOCATION POPUP */}
      <div className={`popup ${activePopup === "location" ? "show" : ""}`}>
        <p><strong>Alamat:</strong><br/>
        Laman Pengantin<br/>
        Jalan Terusan, Titi Serong, Parit Buntar</p>
        <img src="/assets/laman-pengantin.jpg" alt="Laman Pengantin" />
        <p>
          <a href="https://www.google.com/maps/search/?api=1&query=Laman+Pengantin+Jalan+Terusan+Titi+Serong+Parit+Buntar" target="_blank" rel="noopener noreferrer">Google Maps</a> | 
          <a href="https://waze.com/ul?q=Laman+Pengantin+Jalan+Terusan+Titi+Serong+Parit+Buntar" target="_blank" rel="noopener noreferrer">Waze</a>
        </p>
      </div>

      {/* CONTACT POPUP */}
      <div className={`popup ${activePopup === "contact" ? "show" : ""}`}>
        <p><strong>Kontak Pengantin Perempuan:</strong><br/>
        Puan A: 012-3456789<br/>
        Puan B: 013-9876543</p>
        <p><strong>Kontak Pengantin Lelaki:</strong><br/>
        Encik A: 011-2233445<br/>
        Encik B: 019-5566778</p>
      </div>

      {/* MONEY GIFT POPUP */}
      <div className={`popup ${activePopup === "money" ? "show" : ""}`}>
        <p><strong>Money Gift</strong></p>
        <p>No Akaun: 098-765432-1 (Bank ABC)</p>
        <img src="/assets/qr-code.png" alt="QR Code" />
      </div>

      {/* WISHLIST POPUP */}
      <div className={`popup ${activePopup === "wishlist" ? "show" : ""}`}>
        <h6>Senarai Wishlist</h6>
        <ul>
          <li>Peralatan Dapur</li>
          <li>Hiasan Rumah</li>
          <li>Gift Card</li>
        </ul>
      </div>
    </>
  );
};

export default FloatingMenu;
