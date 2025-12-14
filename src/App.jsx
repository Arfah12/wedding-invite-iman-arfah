import React, { useState, useRef, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import "./App.css";
import wallpaper from "./assets/wallpaper.png";

// =================== FIREBASE CONFIG ===================
const firebaseConfig = {
    apiKey: "AIzaSyCMllnEAzc8Cc3WqUBrg3IeKcKjS_BFNh4",
    authDomain: "wedding-card-65c68.firebaseapp.com",
    projectId: "wedding-card-65c68",
    storageBucket: "wedding-card-65c68.appspot.com",
    messagingSenderId: "820287179156",
    appId: "1:820287179156:web:0428b8e57202421792e781"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =================== UTILITY FUNCTIONS ===================
function truncateWords(text, limit = 10) {
    const words = text.split(" ");
    if (words.length <= limit) return text;
    return words.slice(0, limit).join(" ") + "...";
}

// =================== GUESTBOOK ===================
function Guestbook() {
    const sliderRef = useRef(null);
    const [name, setName] = useState("");
    const [wish, setWish] = useState("");
    const [list, setList] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    // 🔥 POPUP STATE
    const [selectedWish, setSelectedWish] = useState(null);
    const [showThanksPopup, setShowThanksPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // ================= FIRESTORE LISTENER =================
    useEffect(() => {
        const q = query(collection(db, "wishes"), orderBy("timestamp", "desc"));
        const unsub = onSnapshot(q, snapshot => {
            setList(snapshot.docs.map(d => ({
                id: d.id,
                name: d.data().name || "Anonymous",
                wish: d.data().wish || "No message provided"
            })));
        });
        return () => unsub();
    }, []);

    // ================= SLIDER AUTOPLAY =================
    useEffect(() => {
        if (!list.length) return;
        const interval = setInterval(() => {
            setActiveIndex(prev => {
                const next = (prev + 1) % list.length;
                if (sliderRef.current) {
                    sliderRef.current.scrollLeft = next * 300;
                }
                return next;
            });
        }, 5000);
        return () => clearInterval(interval);
    }, [list]);

    // ================= SEND WISH =================
    const sendWish = async e => {
        e.preventDefault();
        if (!name.trim() || !wish.trim()) return;

        setIsLoading(true); // start loading
        try {
            await addDoc(collection(db, "wishes"), {
                name: name.trim(),
                wish: wish.trim(),
                timestamp: serverTimestamp()
            });

            // reset form
            setName("");
            setWish("");
            setShowForm(false);

            // show thank you popup
            setShowThanksPopup(true);
            setTimeout(() => setShowThanksPopup(false), 3000);

            // scroll slider ke awal
            setActiveIndex(0);
            if (sliderRef.current) sliderRef.current.scrollLeft = 0;
        } catch (err) {
            console.error("Gagal hantar ucapan:", err);
            alert("Maaf, ucapan tidak dapat dihantar. Sila cuba lagi.");
        } finally {
            setIsLoading(false); // stop loading
        }
    };

    return (
        <div className="guestbook-container">

            {/* ===== BUTTON OPEN FORM ===== */}
            <button onClick={() => setShowForm(true)} className="btn-open-form">
                Tulis Ucapan / Wish
            </button>

            {/* ===== FORM POPUP ===== */}
            {showForm && (
                <div className="guestbook-form-overlay" onClick={() => setShowForm(false)}>
                    <form
                        className="guestbook-form"
                        onSubmit={sendWish}
                        onClick={e => e.stopPropagation()}
                    >
                        <h3>Tulis Ucapan Anda</h3>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Nama Penuh"
                            required
                        />
                        <textarea
                            value={wish}
                            onChange={e => setWish(e.target.value)}
                            placeholder="Ucapan & Doa..."
                            rows="4"
                            required
                        />
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? "Sedang menghantar..." : "Hantar"}
                        </button>
                    </form>
                </div>
            )}

            {/* ===== THANK YOU POPUP ===== */}
            {showThanksPopup && (
                <div className="guestbook-form-overlay">
                    <div className="guestbook-form">
                        <h3>Terima Kasih atas ucapan & doa ❤️</h3>
                    </div>
                </div>
            )}

            {/* ===== SLIDER ===== */}
            <div className="guestbook-slider" ref={sliderRef}>
                {list.map(w => (
                    <div key={w.id} className="guestbook-card">
                        <p className="guestbook-message">
                            "{truncateWords(w.wish, 10)}"
                            {w.wish.split(" ").length > 10 && (
                                <span
                                    className="read-more"
                                    onClick={() => setSelectedWish(w)}
                                >
                                    (baca penuh)
                                </span>
                            )}
                        </p>
                        <small className="guestbook-author">- {w.name}</small>
                    </div>
                ))}
            </div>

            {/* ===== EMPTY STATE ===== */}
            {list.length === 0 && (
                <p style={{ fontStyle: "italic", color: "#888" }}>
                    Belum ada ucapan. Jadilah yang pertama!
                </p>
            )}

            {/* ===== FULL WISH POPUP ===== */}
            {selectedWish && (
                <div className="guestbook-form-overlay" onClick={() => setSelectedWish(null)}>
                    <div className="guestbook-form" onClick={e => e.stopPropagation()}>
                        <h3 style={{ color: "#800020" }}>Ucapan Tetamu</h3>
                        <p style={{ fontStyle: "italic", lineHeight: "1.8", marginBottom: "20px", color: "#333" }}>
                            "{selectedWish.wish}"
                        </p>
                        <p style={{ textAlign: "right", fontWeight: "700", color: "#800020" }}>
                            – {selectedWish.name}
                        </p>
                        <button onClick={() => setSelectedWish(null)}>Tutup</button>
                    </div>
                </div>
            )}
        </div>
    );
}


// =================== CONTACT MODAL ===================
function ContactModal({ isOpen, onClose, contactMale, contactFemale, nameMale, nameFemale }) {
    if (!isOpen) return null;

    return (
        <div className="guestbook-form-overlay" onClick={onClose}>
            <div className="guestbook-form" onClick={e => e.stopPropagation()}>
                <h3>Hubungi Pengantin</h3>

                <div className="contact-group">
                    <p className="contact-label">Pihak Lelaki:</p>
                    <div className="contact-item">
                        <a href={`https://wa.me/${contactMale}`} target="_blank" rel="noreferrer">
                            {nameMale} <span>📱</span>
                        </a>
                        <span>{contactMale}</span>
                    </div>
                </div>

                <div className="contact-group">
                    <p className="contact-label">Pihak Perempuan:</p>
                    <div className="contact-item">
                        <a href={`https://wa.me/${contactFemale}`} target="_blank" rel="noreferrer">
                            {nameFemale} <span>📱</span>
                        </a>
                        <span>{contactFemale}</span>
                    </div>
                </div>

                <button onClick={onClose}>Tutup</button>
            </div>
        </div>
    );
}

// =================== LOCATION MODAL ===================
function LocationModal({ isOpen, onClose, address }) {
    if (!isOpen) return null;

    return (
       <div className="guestbook-form-overlay" onClick={onClose}>
    <div className="guestbook-form" onClick={e => e.stopPropagation()}>
        <h3 style={{ color: "#000", fontWeight: "700" }}>Laman Pengantin</h3>
        <p style={{ color: "#000", fontWeight: "500" }}>{address}</p>
        <a 
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} 
            target="_blank" 
            rel="noreferrer"
            style={{ color: "#25D366", fontWeight: "500" }}
        >
            📍 Buka di Google Maps
        </a>
        <br /><br />
        <button onClick={onClose}>Tutup</button>
    </div>
</div>


    );
}

// =================== COUNTDOWN ===================
function Countdown({ targetDate }) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const diff = targetDate - now;

            if (diff <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                clearInterval(interval);
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            setTimeLeft({ days, hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    return (
        <section className="section section-countdown">
            <h2 className="metallic--text">Hari Menuju Majlis</h2>
            <div className="countdown-cards">
                <div className="countdown-card">
                    <span>{timeLeft.days}</span>
                    <small>Hari</small>
                </div>
                <div className="countdown-card">
                    <span>{timeLeft.hours}</span>
                    <small>Jam</small>
                </div>
                <div className="countdown-card">
                    <span>{timeLeft.minutes}</span>
                    <small>Minit</small>
                </div>
                <div className="countdown-card">
                    <span>{timeLeft.seconds}</span>
                    <small>Saat</small>
                </div>
            </div>
        </section>
    );
}


// =================== FAB MENU ===================
function ActionMenu({ toggleMusic, isPlaying, onOpenContactModal, onOpenLocationModal }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`fab-menu-container ${isOpen ? 'open' : ''}`}>
            <button onClick={toggleMusic} className="fab-action-button music-btn">
                {isPlaying ? "♪" : "🔇"}
            </button>

            <button className="fab-action-button location-btn" onClick={() => { onOpenLocationModal(); setIsOpen(false); }}>
                📍
            </button>

            <button className="fab-action-button contact-btn" onClick={() => { onOpenContactModal(); setIsOpen(false); }}>
                📞
            </button>

            <button className="fab-main-button" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? "❌" : "☰"}
            </button>
        </div>
    );
}

// =================== MAIN APP ===================
export default function App() {
    const [showWelcome, setShowWelcome] = useState(true);
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false); 
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

    const weddingAddress = "F271, Jalan Terusan, Simpang 5, 34300 Parit Buntar, Perak";
    const contactMale = "601112367384";
    const nameMale = "Azzam";
    const contactFemale = "601124186129";
    const nameFemale = "Amir";

    const toggleMusic = () => {
        if (!audioRef.current) return;
        if (isPlaying) audioRef.current.pause();
        else audioRef.current.play().catch(() => {});
        setIsPlaying(!isPlaying);
    };

    const handleOpenInvitation = () => {
        setShowWelcome(false);
        audioRef.current?.play().catch(() => {});
        setIsPlaying(true);
    };

    useEffect(() => {
        if (showWelcome) return;
        const observer = new IntersectionObserver(
            entries => entries.forEach(e => e.isIntersecting && e.target.classList.add("is-visible")),
            { threshold: 0.1 }
        );
        document.querySelectorAll(".section").forEach(s => observer.observe(s));
        return () => observer.disconnect();
    }, [showWelcome]);

    return (
        <div className="app">
            <audio ref={audioRef} src="/music.mp3" loop preload="auto" />

            {showWelcome ? (
                <div className="welcome-screen" style={{ backgroundImage: `url(${wallpaper})` }}>
                    <span className="welcome-tagline">Walimatulurus</span>
                    <h1>Iman & Arfah</h1>
                    <p>Meraikan cinta pada Sabtu, 17 Januari 2026</p>
                    <button onClick={handleOpenInvitation} className="shiny-gold-btn">💌 Buka Kad Jemputan</button>
                </div>
            ) : (
                <>
                    <section className="section section-jemputan section-bg-overlay">
                        <div className="section-content">
                            <h2 className="metallic-gold-text">Jemputan Khas</h2>
                            <p>
                                Dengan izin Allah dan penuh kesyukuran, kami sekeluarga ingin menjemput tuan/puan ke majlis walimatulurus anak kami, bagi memeriahkan hari bahagia ini dan berkongsi kegembiraan bersama-sama.
                            </p>
                        </div>
                    </section>

                    <section className="section section-time">
                        <h2>Aturcara Majlis</h2>
                        <p>Laman Pengantin Titi Serong</p>
                        <p>11:00 AM - Ketibaan Tetamu</p>
                        <p>12:30 PM - Perarakan Pengantin</p>
                        <p>01:00 PM - Jamuan Makan</p>
                        <p>04:00 PM - Majlis Berakhir</p>
                    </section>

                    <div className="classic-divider"><span>⚜️</span></div>

                    <section className="section section-ucapan">
                        <h2>Ucapan & Doa</h2>
                        <p>Sila tinggalkan ucapan manis anda sebagai tanda ingatan dan doa restu buat kami.</p>
                        <Guestbook />
                    </section>

                    <section className="section section-doa section-bg-overlay">
                        <h2 className="metallic-gold-text">Doa Pengantin</h2>
                        <p className="slow-fade-text"> Ya Allah, satukan hati mereka, kurniakan kebahagiaan, kesabaran, dan keberkatan dalam setiap langkah kehidupan bersama. Aamiin.</p>
                    </section>


<div className="classic-divider"><span>⚜️</span></div>
{/* Tambah Countdown di sini */}
<Countdown targetDate={new Date("2026-01-17T00:00:00")} />
                    <div className="classic-divider"><span>⚜️</span></div>

                    <footer className="app-footer">
                        <p>#OfficiallyIA | Iman & Arfah</p>
                    </footer>

                    <ActionMenu
                        toggleMusic={toggleMusic}
                        isPlaying={isPlaying}
                        onOpenContactModal={() => setIsContactModalOpen(true)}
                        onOpenLocationModal={() => setIsLocationModalOpen(true)}
                    />

                    <ContactModal
                        isOpen={isContactModalOpen}
                        onClose={() => setIsContactModalOpen(false)}
                        contactMale={contactMale}
                        nameMale={nameMale}
                        contactFemale={contactFemale}
                        nameFemale={nameFemale}
                    />

                    <LocationModal
                        isOpen={isLocationModalOpen}
                        onClose={() => setIsLocationModalOpen(false)}
                        address={weddingAddress}
                    />
                </>
            )}
        </div>
    );
}
