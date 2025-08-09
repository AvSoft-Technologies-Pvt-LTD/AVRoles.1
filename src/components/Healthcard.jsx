import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import QRCode from "qrcode";
import { Download, Phone, User, Calendar, Mail, X } from "lucide-react";
import logo from "../assets/logo.png";

const API_BASE_URL = "https://6801242781c7e9fbcc41aacf.mockapi.io/api/AV1";
const CARD_API_URL = "https://6810972027f2fdac2411f6a5.mockapi.io/healthcard";

function Healthcard({ hideLogin }) {
  const [userData, setUserData] = useState(null);
  const [healthId, setHealthId] = useState("");
  const [isCardGenerated, setIsCardGenerated] = useState(false);
  const [rtoData, setRtoData] = useState({ states: {}, districts: {} });
  const [qrImage, setQrImage] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("otp"); // 'otp' or 'info'

  const navigate = useNavigate();
  const userEmail = useSelector((state) => state.auth.user?.email);
  const cardRef = useRef(null);

  useEffect(() => {
    if (healthId) {
      QRCode.toDataURL(healthId, { width: 128, margin: 2 }, (err, url) => {
        if (err) return console.error("QR generation failed:", err);
        setQrImage(url);
      });
    }
  }, [healthId]);

  useEffect(() => {
  axios
    .get(`${API_BASE_URL}/users?email=${encodeURIComponent(userEmail)}`)
    .then((res) => {
      if (res.data.length > 0) setUserData(res.data[0]);
      else alert("User not found.");
    })
    .catch((err) => {
      console.error("Error loading user profile:", err);
      alert("Error loading user profile.");
    });
}, [userEmail]);

  useEffect(() => {
    axios
      .get("https://mocki.io/v1/ebea6c46-479d-40cf-9d3e-245975459b93")
      .then((res) => setRtoData(res.data))
      .catch((err) => console.error("Failed to fetch RTO data", err));
  }, []);

  const generateHealthId = (userData) => {
    const now = new Date();
    const datePart = String(now.getFullYear()).slice(-2) +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0");
    const stateCode = rtoData.states[userData.state] || "XX";
    const districtCode = rtoData.districts[userData.city] || "00";
    const gender = userData.gender?.charAt(0).toUpperCase() || "X";
    const aadhaar = userData.aadhaar?.slice(-4) || "0000";
    const serial = Math.floor(Math.random() * 9) + 1;
    return `${datePart}-${stateCode}${districtCode}${gender}-${aadhaar}${serial}`;
  };

  useEffect(() => {
    const autoGenerateCard = async () => {
      if (!userData?.aadhaar || isCardGenerated) return;
      try {
        const genId = generateHealthId(userData);
        const { data } = await axios.get(CARD_API_URL);
        const existing = data.find((c) => c.aadhaar === userData.aadhaar);
        if (existing) {
          setHealthId(existing.healthId);
          localStorage.setItem("healthId", existing.healthId);
          return setIsCardGenerated(true);
        }
        await axios.post(CARD_API_URL, { ...userData, healthId: genId });
        setHealthId(genId);
        localStorage.setItem("healthId", genId);
        setIsCardGenerated(true);
      } catch (e) {
        console.error("Auto generation failed", e);
        alert("Could not auto-generate Health Card.");
      }
    };
    autoGenerateCard();
  }, [userData, isCardGenerated]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const handleScan = () => {
    setShowModal(true);
    setModalContent("otp");
    alert(`Dummy OTP sent to ${userData.phone}: 123456`);
  };

  const handleVerifyOTP = () => {
    if (otp === "123456") {
      setModalContent("info");
    } else {
      alert("Invalid OTP. Please try again.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setOtpSent(false);
    setOtp("");
  };

  if (!userData) return null;

  return (
    <div className="flex flex-col items-center justify-center min-w-xl rounded-2xl bg-white px-4 py-10 gap-4">
      <div ref={cardRef} className="relative w-[400px] h-[260px] rounded-2xl overflow-hidden shadow-xl hover:shadow-[var(--primary-color)]/20 transition-shadow duration-300 bg-gray-300">
        <div className="flex justify-between items-center px-4 border-b border-white/20 bg-[var(--primary-color)]">
          <img src={logo} alt="Logo" className="h-15 w-auto rounded-full" />
          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <h1 className="text-lg mr-4 font-extrabold bg-gradient-to-br from-[#01D48C] via-[#01D48C]/90 to-[#01D48C] bg-clip-text text-transparent">
                AV SWASTHYA
              </h1>
            </div>
            <p className="text-xs ml-6 text-gray-300">Healthcare Solutions</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-start p-4">
          <div className="flex items-end justify-center p-1 mt-4 h-full">
<img
  src={
    userData.photo?.url ||
    "https://img.freepik.com/vecteurs-premium/icone-profil-avatar-par-defaut-image-utilisateur-medias-sociaux-icone-avatar-gris-silhouette-profil-vide-illustration-vectorielle_561158-3383.jpg"
  }
  alt="User"
  className="w-16 h-16 sm:w-20 sm:h-20 object-cover border-2 border-white"
/>
          </div>
          <div className="flex-1 text-[var(--primary-color)] text-[13px] p-2 flex flex-col items-center sm:items-start">
            <div className="font-bold leading-tight whitespace-nowrap">
              {userData.firstName} {userData.lastName}
            </div>
            <div className="mt-1 flex items-center gap-1">
              <span className="text-xs text-[var(--primary-color)]/70">Mobile: </span>
              {userData.phone || "N/A"}
            </div>
            <div className="mt-1">
              <span className="text-[var(--primary-color)]/70">DOB: </span>
              {formatDate(userData.dob)}
            </div>
            <div>
              <span className="text-xs text-[var(--primary-color)]/70">Gender: </span>
              {userData.gender}
            </div>
          </div>
          <div className="flex items-center justify-center mt-4">
            {qrImage && (
              <img
                src={qrImage}
                alt="QR Code"
                className="w-16 h-16 sm:w-20 sm:h-20"
                onClick={handleScan}
              />
            )}
          </div>
        </div>
        <div className="absolute bottom-4 ml-10 flex flex-col items-start gap-1 px-3 text-[var(--primary-color)] text-lg">
          <div className="text-[#089164] font-semibold">Health ID: {healthId}</div>
          <div className="flex items-center justify-center ml-12 gap-2 text-xs text-gray-600 mt-1">
            <Phone className="w-3 h-3 text-[var(--primary-color)]" />
            <span>Helpline: <span className="font-semibold text-[#089164]">1800-123-4567</span></span>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {modalContent === "otp" ? "Enter OTP" : "Health Card Information"}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X />
              </button>
            </div>
            {modalContent === "otp" ? (
              <div className="flex items-center gap-8">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="border rounded p-2"
                />
                <button
                  onClick={handleVerifyOTP}
                  className="px-4 py-2 bg-[var(--primary-color)] text-white rounded"
                >
                  Verify OTP
                </button>
              </div>
            ) : (
              <>
               <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
      <h2 className="text-xl font-bold mb-4 text-center text-[var(--accent-color)]">Health Id: {healthId}</h2>
      <div className="space-y-4">
        <div className="flex items-center p-4 bg-gray-50 rounded-lg shadow-sm">
          <User className="text-gray-600 mr-3" />
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-semibold text-[var(--primary-color)]">{userData.firstName} {userData.lastName}</p>
          </div>
        </div>
        <div className="flex items-center p-4 bg-gray-50 rounded-lg shadow-sm">
          <Calendar className="text-gray-600 mr-3" />
          <div>
            <p className="text-sm text-gray-500">Date of Birth</p>
            <p className="font-semibold text-[var(--primary-color)]">{formatDate(userData.dob)}</p>
          </div>
        </div>
        <div className="flex items-center p-4 bg-gray-50 rounded-lg shadow-sm">
          <Mail className="text-gray-600 mr-3" />
          <div>
            <p className="text-sm text-gray-500">Gender</p>
            <p className="font-semibold text-[var(--primary-color)]">{userData.gender}</p>
          </div>
        </div>
        <div className="flex items-center p-4 bg-gray-50 rounded-lg shadow-sm">
          <Phone className="text-gray-600 mr-3" />
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-semibold text-[var(--primary-color)]">{userData.phone}</p>
          </div>
        </div>
      </div>
    </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={() => {
            const t = document.title;
            document.title = "AV Health Card";
            window.print();
            document.title = t;
          }}
          className="flex items-center gap-2 bg-[var(--primary-color)] text-[var(--color-surface)] font-semibold py-2 px-4 rounded-lg hover:bg-[#123456]"
        >
          <Download /> Download
        </button>
        {!hideLogin && (
          <button onClick={() => navigate("/login")} className="px-4 py-2 view-btn">
            Login
          </button>
        )}
      </div>
    </div>
  );
}

export default Healthcard;