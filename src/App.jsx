import React, { useState, useRef, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import "./App.css";
// NOTE: Make sure the 'wallpaper' image is subtle enough not to clash with text!
import wallpaper from "./assets/wallpaper.png"; 

// Firebase Config (Keep this as is)
const firebaseConfig = {
    apiKey: "AIzaSyCMllnEAzc8Cc3WqUBrg3IeKcKjS_BFNh4",
    authDomain: "wedding-card-65c68.firebaseapp.com",
    projectId: "wedding-card-65c68",
    storageBucket: "wedding-card-65c68.firebasestorage.app",
    messagingSenderId: "820287179156",
    appId: "1:820287179156:web:0428b8e57202421792e781"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===== Guestbook Component (Dikekalkan) =====
// ===== Guestbook Component (DENGAN AUTOPLAY) =====
function Guestbook() {
    const sliderRef = useRef(null); // Ref untuk mengakses DOM slider
    const [name, setName] = useState("");
    const [wish, setWish] = useState("");
    const [list, setList] = useState([]); // Senarai ucapan dari Firebase
    const [showForm, setShowForm] = useState(false);
    
    // State untuk mengawal indeks autoplay
    const [activeIndex, setActiveIndex] = useState(0); 
    
    // --- 1. AMBIL DATA DARI FIREBASE (Dikekalkan) ---
    React.useEffect(() => {
        // Order by 'desc' (terbaru dahulu), yang bagus untuk Guestbook
        const q = query(collection(db, "wishes"), orderBy("timestamp", "desc"));
        const unsub = onSnapshot(q, snap => setList(snap.docs.map(d => ({ 
            id: d.id, 
            ...d.data(),
            name: d.data().name || 'Anonymous',
            wish: d.data().wish || 'No message provided'
        }))));
        return () => unsub();
    }, []);

    // --- 2. LOGIK AUTOPLAY / AUTOSCROLL ---
    useEffect(() => {
        // Pastikan ada ucapan dalam senarai sebelum cuba autoplay
        if (list.length === 0) return; 

        const interval = setInterval(() => {
            // Logik untuk mengira indeks seterusnya
            const nextIndex = (activeIndex + 1) % list.length;
            setActiveIndex(nextIndex);
            
            // Logik untuk menatal secara automatik
            if (sliderRef.current) {
                // Lebar kad: 280px (min-width) + 20px (gap) = 300px
                const cardWidth = 300; 
                sliderRef.current.scrollLeft = nextIndex * cardWidth;
            }
        }, 5000); // Bergerak setiap 5 saat

        return () => clearInterval(interval);
    }, [activeIndex, list.length]); // Dependencies: activeIndex dan saiz senarai

    // --- 3. LOGIK HANTAR UCAPAN (Dikekalkan) ---
    const sendWish = async e => {
        e.preventDefault();
        if (!name.trim() || !wish.trim()) return; 
        
        await addDoc(collection(db, "wishes"), { 
            name: name.trim(), 
            wish: wish.trim(), 
            timestamp: serverTimestamp() 
        });
        setName(""); setWish(""); setShowForm(false);
        // Tetapkan activeIndex kembali ke 0 supaya ucapan baru (yang berada di hadapan) dapat dilihat
        setActiveIndex(0); 
        if (sliderRef.current) sliderRef.current.scrollLeft = 0;
    };

    return (
        <div className="guestbook-container">
            <button onClick={() => setShowForm(true)} className="btn-open-form"> Tulis Ucapan / Wish</button>
            {showForm && (
                <div className="guestbook-form-overlay" onClick={() => setShowForm(false)}>
                    <form className="guestbook-form" onSubmit={sendWish} onClick={e => e.stopPropagation()}>
                        <h3>Tulis Ucapan Anda</h3>
                        <input type="text" placeholder="Nama Penuh" value={name} onChange={e => setName(e.target.value)} required />
                        <textarea placeholder="Tuliskan ucapan dan doa anda di sini..." value={wish} onChange={e => setWish(e.target.value)} required rows="4" />
                        <button type="submit">Hantar Ucapan</button>
                    </form>
                </div>
            )}
            
            {/* Lampirkan sliderRef ke elemen div ini */}
            <div className="guestbook-slider" ref={sliderRef}> 
                {list.map(w => (
                    <div key={w.id} className="guestbook-card">
                        <p className="guestbook-message">"{w.wish}"</p>
                        <p className="guestbook-author">- {w.name}</p>
                    </div>
                ))}
            </div>
            {/* Tambah fallback jika tiada ucapan */}
            {list.length === 0 && <p style={{fontStyle: 'italic', color: '#888'}}>Belum ada ucapan. Jadilah yang pertama!</p>}
        </div>
    );
}
// ===== Main App (Lengkap) =====
export default function App() {
    const [showWelcome, setShowWelcome] = useState(true);
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // --- LOGIK SCROLL REVEAL MENGGUNAKAN IntersectionObserver ---
    useEffect(() => {
        // Hanya jalankan observer apabila Welcome Screen hilang
        if (showWelcome) return;
        
        const sections = document.querySelectorAll('.section');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Tambah kelas untuk mencetuskan CSS transition
                    entry.target.classList.add('is-visible'); 
                    observer.unobserve(entry.target); // Hentikan pemerhatian selepas muncul
                }
            });
        }, {
            // threshold: 0.1 bermakna seksyen akan muncul apabila 10% daripadanya kelihatan
            threshold: 0.1 
        });

        sections.forEach(section => {
            observer.observe(section);
        });

        // Cleanup function (penting untuk React)
        return () => observer.disconnect();
    }, [showWelcome]); // Jalankan kesan ini setiap kali showWelcome berubah

    // --- LOGIK KAWALAN MUZIK ---
    const toggleMusic = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(error => console.log("Music auto-play blocked:", error));
        }
        setIsPlaying(!isPlaying);
    };
    
    // --- LOGIK BUKA KAD JEMPUTAN (Mula Muzik) ---
    const handleOpenInvitation = () => {
        setShowWelcome(false);
        // Cuba mainkan muzik sebaik sahaja pengguna berinteraksi
        audioRef.current.play().catch(error => {
            console.log("Music play failed after click, user will need to use button:", error);
        });
        setIsPlaying(true);
    };

 
// Pastikan anda import useState jika anda belum lakukannya di bahagian atas fail App.jsx

// --- Fungsi Butang Aksi Utama (Menu Terapung) ---
function ActionMenu({ toggleMusic, isPlaying }) {
    const [isOpen, setIsOpen] = useState(false); // State mengawal menu utama (☰ / ❌)
    const [showContactChoices, setShowContactChoices] = useState(false); // State mengawal pilihan Contact (📞 / 🤵👰)

    // Nombor Contact Baharu (DIPERLUKAN: Kod Negara 60, tanpa tanda hubung)
    const contactMale = "601112367384"; // Azzam (Lelaki)
    const contactFemale = "601124186129"; // Amir (Perempuan)
    
    // Gantikan dengan URL yang sebenar
    const locationLink = "https://maps.app.goo.gl/fcuVpxMMyqGbbtxr9"; 
    const giftLink = "https://www.maybank2u.com.my/account-details"; 
    
    // Fungsi untuk menutup menu contact apabila menu utama dibuka/ditutup
    const toggleMenu = () => {
        setIsOpen(!isOpen);
        if (isOpen) {
            // Tutup contact choices apabila menu utama ditutup
            setShowContactChoices(false); 
        }
    };

    return (
        <div className={`fab-menu-container ${isOpen ? 'open' : ''}`}>
            
            {/* Butang Aksi Kecil (di sebelah kiri butang utama) */}

            {/* Butang Mute/Unmute Lagu */}
            <button 
                onClick={toggleMusic} 
                className="fab-action-button music-btn"
                aria-label={isPlaying ? "Mute Music" : "Unmute Music"}
            >
                {isPlaying ? "♪" : "🔇"}
            </button>
            
            {/* Butang Hadiah/E-Angpau */}
            <a href={giftLink} target="_blank" rel="noopener noreferrer" className="fab-action-button gift-btn">
                🎁
            </a>
            
            {/* Butang Lokasi/Maps */}
            <a href={locationLink} target="_blank" rel="noopener noreferrer" className="fab-action-button location-btn">
                📍
            </a>

            {/* --- BUTANG CONTACT BARU --- */}
            
            {/* 1. Butang Contact Pihak Lelaki (Azzam) - Tampil apabila showContactChoices = true */}
            <a 
                href={`https://wa.me/${contactMale}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`fab-action-button contact-male-btn ${showContactChoices ? 'show-choice' : ''}`}
                title="Pihak Lelaki (Azzam)"
            >
                🤵
            </a>
            
            {/* 2. Butang Contact Pihak Perempuan (Amir) - Tampil apabila showContactChoices = true */}
            <a 
                href={`https://wa.me/${contactFemale}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`fab-action-button contact-female-btn ${showContactChoices ? 'show-choice' : ''}`}
                title="Pihak Perempuan (Amir)"
            >
                👰
            </a>
            
            {/* 3. Butang Contact Induk (Toggle Pilihan 📞) - SENTIASA TAMPIL apabila Menu Utama terbuka */}
            <button 
                className="fab-action-button contact-btn"
                onClick={(e) => {
                    e.preventDefault(); 
                    if (isOpen) { // Hanya berfungsi apabila menu utama terbuka
                        setShowContactChoices(!showContactChoices);
                    }
                }}
            >
                📞
            </button>
            {/* ----------------------------- */}

            {/* Butang Utama (Toggle Menu ☰ / ❌) */}
            <button 
                className="fab-main-button" 
                onClick={toggleMenu}
                aria-label="Open Action Menu"
            >
                {isOpen ? '❌' : '☰'} 
            </button>
        </div>
    );
}


    return (
        <div className="app">
            {/* Audio - Sumber fail dari folder public */}
            <audio 
                ref={audioRef} 
                src="/music.mp3" 
                loop 
                preload="auto" 
            />

            {/* Welcome Screen */}
            {showWelcome && (
                <div className="welcome-screen" style={{ backgroundImage: `url(${wallpaper})` }}>
                    <span className="welcome-tagline">Walimatulurus</span>
                    <h1>Iman & Arfah</h1>
                    <p>Meraikan cinta pada Sabtu, 17 Januari 2026</p>
                    <button onClick={handleOpenInvitation}className="shiny-gold-btn" 
    style={{ position: 'relative', zIndex: 2 }}>💌 Buka Kad Jemputan</button>
                </div>
            )}

            {/* Main Content Sections */}
    
{!showWelcome && (
    <>
        <section className="section section-jemputan section-bg-overlay">
            <h2 className="metallic-gold-text">Jemputan Khas</h2>
            <p>Dengan penuh rasa kesyukuran, kami menjemput Dato'/Datin/Tuan/Puan ke majlis perkahwinan kami. Kehadiran anda adalah doa terindah buat kami.</p>
        </section>

        <section className="section section-time">
            <h2>Aturcara Majlis</h2>
            <p>Laman Pengantin Titi Serong</p>
            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                <p style={{ fontWeight: 'bold', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>Majlis Resepsi</p>
                <p>11:00 AM - Ketibaan Tetamu</p>
                <p>12:30 PM - Perarakan Masuk Pengantin</p>
                <p>01:00 PM - Jamuan Makan Tengah Hari</p>
                <p>04:00 PM - Majlis Berakhir</p>
            </div>
        </section>

        {/* --- TAMBAH PEMBAHAGI KLASIK DI SINI --- */}
                    <div className="classic-divider">
                        <span className="divider-icon">⚜️</span> 
                    </div>
                    {/* ------------------------------------------ */}
        
        <section className="section section-ucapan">
            <h2>Ucapan & Doa</h2>
            <p>Sila tinggalkan ucapan manis anda sebagai tanda ingatan dan doa restu buat kami.</p>
            <Guestbook />
        </section>

        {/* --- 1. SEKSYEN DO'A KINI BERADA DI ATAS --- */}
        <section className="section section-doa section-bg-overlay">
            <h2 className="metallic-gold-text">Doa Pengantin</h2>
            
            {/* Tukar kepada kelas fade-in yang baru, buang data-text */}
            <p className="slow-fade-text">
                Ya Allah, satukan hati mereka, kurniakan kebahagiaan, kesabaran, dan keberkatan dalam setiap langkah kehidupan bersama. Aamiin.
            </p>
           
        </section>
        {/* ------------------------------------------------------------------- */}

        {/* --- 2. SEKSYEN AYAT AL-QURAN KINI BERADA DI BAWAH --- */}
<section className="section section-ayat">
    <p className="arabic-text">وَخَلَقْنَاكُمْ أَزْوَاجًا</p>
    <p className="malay-text">"Dan Kami menciptakan kamu berpasang-pasangan,"</p>
    <p className="reference-text">(Surah An-Naba': 8)</p>
</section>
{/* -------------------------------------------------------- */}

{/* ===== FOOTER DENGAN HASHTAG ===== */}
<footer className="app-footer">
    <p>#OfficiallyIA | Walimatulurus Iman & Arfah</p>
</footer>
{/* ================================== */}
        
    </>
)}

            {/* Floating Action Menu */}
            {!showWelcome && <ActionMenu toggleMusic={toggleMusic} isPlaying={isPlaying} />}
        </div>
        
    );
}