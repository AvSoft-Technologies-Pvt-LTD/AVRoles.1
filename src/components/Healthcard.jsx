import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import QRCode from "qrcode";
import { Download, Phone, X } from "lucide-react";
import logo from "../assets/logo.png";

const API_BASE_URL = "https://6801242781c7e9fbcc41aacf.mockapi.io/api/AV1";
const CARD_API_URL = "https://681075c727f2fdac24116e70.mockapi.io/user/healthcard";

function Healthcard({ hideLogin }) {
  const [userData, setUserData] = useState(null);
  const [healthId, setHealthId] = useState("");
  const [isCardGenerated, setIsCardGenerated] = useState(false);
  const [rtoData, setRtoData] = useState({ states: {}, districts: {} });
  const [qrImage, setQrImage] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("otp");
  const navigate = useNavigate();
  const userEmail = useSelector((state) => state.auth.user?.email);
  const cardRef = useRef(null);

  useEffect(() => {
    if (healthId)
      QRCode.toDataURL(
        healthId,
        { width: 128, margin: 2, color: { dark: "#01D48C", light: "#FFFFFF" } },
        (err, url) => {
          if (err) return console.error("QR generation failed:", err);
          setQrImage(url);
        }
      );
  }, [healthId]);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/users?email=${encodeURIComponent(userEmail)}`)
      .then((res) => {
        if (res.data.length > 0) {
          setUserData(res.data[0]);
        } else {
          alert("User not found.");
        }
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
    const datePart =
      String(now.getFullYear()).slice(-2) +
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
        const cardData = {
          firstName: userData.firstName,
          lastName: userData.lastName,
          gender: userData.gender,
          phone: userData.phone,
          dob: userData.dob,
          aadhaar: userData.aadhaar,
          state: userData.state,
          city: userData.city,
          healthId: genId,
          email: userData.email,
          id: userData.id,
          photo: userData.photo || "",
        };
        await axios.post(CARD_API_URL, cardData);
        setHealthId(genId);
        localStorage.setItem("healthId", genId);
        setIsCardGenerated(true);
      } catch (e) {
        console.error("Auto generation failed", e.response || e.message || e);
        alert("Could not auto-generate Health Card.");
      }
    };
    autoGenerateCard();
  }, [userData, isCardGenerated]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}/${d.getFullYear()}`;
  };

  const handleScan = () => {
    setShowModal(true);
    setModalContent("otp");
    alert(`OTP sent to ${userData.phone}: 123456`);
  };

  const handleVerifyOTP = () => {
    if (otp === "123456") {
      navigate("/medical-records", { state: { userData: userData, healthId: healthId } });
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
    <div className="flex flex-col items-center justify-center min-w-full p-2 sm:p-4">
      {/* Health Card */}
      <div
        ref={cardRef}
        className="relative w-full max-w-[320px] sm:max-w-[380px] mx-auto rounded-2xl overflow-hidden shadow-xl hover:shadow-[var(--primary-color)]/20 transition-shadow duration-300 bg-gradient-to-r from-[#0E1630] to-[#01D48C] min-h-[220px] sm:min-h-[260px]"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-2 border-b border-white/20">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-8 sm:h-10 w-auto rounded-full" />
            <div className="text-left">
              <h1 className="text-base sm:text-lg font-extrabold text-[var(--accent-color)]">
                DigiHealth
              </h1>
              <p className="text-[10px] sm:text-xs font-semibold ml-2 sm:ml-3 text-gray-300">
                Healthcare Solutions
              </p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="flex flex-row items-center justify-start p-2 sm:p-4">
          <div className="flex items-end justify-center p-1 mt-2 sm:mt-4 h-full">
            <img
              src={
                userData.photo ||
                "https://img.freepik.com/vecteurs-premium/icone-profil-avatar-par-defaut-image-utilisateur-medias-sociaux-icone-avatar-gris-silhouette-profil-vide-illustration-vectorielle_561158-3383.jpg"
              }
              alt="User"
              className="w-12 h-12 sm:w-16 sm:h-16 object-cover border-2 border-white"
            />
          </div>
          <div className="flex-1 text-[var(--color-surface)] text-xs sm:text-sm p-1 sm:p-2 pl-2 sm:pl-4 flex flex-col items-start">
            <div className="font-bold leading-tight whitespace-nowrap text-left">
              {userData.firstName} {userData.lastName}
            </div>
            <div className="mt-1 flex items-center gap-1">
              <strong className="text-[10px] sm:text-xs text-[var(--color-surface)]">Mobile:</strong>
              <span className="text-[10px] sm:text-xs">{userData.phone || "N/A"}</span>
            </div>
            <div className="mt-1">
              <strong className="text-[var(--color-surface)] text-[10px] sm:text-xs">DOB: </strong>
              <span className="text-[10px] sm:text-xs">{formatDate(userData.dob)}</span>
            </div>
            <div>
              <strong className="text-[10px] sm:text-xs text-[var(--color-surface)]">Gender:</strong>
              <span className="text-[10px] sm:text-xs">{userData.gender}</span>
            </div>
          </div>
          <div className="flex items-center justify-center mt-2 sm:mt-4">
            {qrImage && (
              <img
                src={qrImage}
                alt="QR Code"
                className="w-14 h-14 sm:w-16 sm:h-16 cursor-pointer"
                onClick={handleScan}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center gap-1 px-4 text-[var(--color-surface)] text-[10px] sm:text-[13px]">
          <div className="text-[var(--color-surface)] font-semibold text-[10px] sm:text-sm">
            Health ID: {healthId}
          </div>
          <div className="flex items-center gap-1 sm:gap-2 mt-1 text-[8px] sm:text-xs">
            <Phone className="w-3 h-3 sm:w-3 sm:h-3 text-[var(--color-surface)]" />
            <span>
              Helpline:{" "}
              <span className="font-semibold text-[var(--color-surface)]">1800-123-4567</span>
            </span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 sm:gap-4 mt-2 sm:mt-4 justify-center w-full">
        <button
          onClick={() => {
            const t = document.title;
            document.title = "AV Health Card";
            window.print();
            document.title = t;
          }}
          className="flex items-center gap-1 sm:gap-2 bg-[var(--primary-color)] text-[var(--color-surface)] font-semibold py-1 sm:py-2 px-2 sm:px-4 rounded-lg hover:bg-[#123456] text-xs sm:text-base"
        >
          <Download className="w-3 h-3 sm:w-4 sm:h-4" />
          Download
        </button>
        {!hideLogin && (
          <button
            onClick={() => navigate("/login")}
            className="px-2 sm:px-4 py-1 sm:py-2 view-btn bg-gray-500 text-white rounded text-xs sm:text-base"
          >
            Login
          </button>
        )}
      </div>

      {/* OTP Verification Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Verify OTP</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              An OTP has been sent to {userData.phone}. Please enter it below.
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOTP}
                className="px-4 py-2 bg-[var(--primary-color)] text-white rounded hover:bg-[#123456]"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Healthcard;
