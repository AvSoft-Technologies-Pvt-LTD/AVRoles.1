import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaDownload,FaArrowRight  } from "react-icons/fa";
import AVCard from "./microcomponents/AVCard";
import { useSelector } from "react-redux";
import axios from "axios";

const API_BASE_URL = "https://6801242781c7e9fbcc41aacf.mockapi.io/api/AV1";
const CARD_API_URL = "https://6810972027f2fdac2411f6a5.mockapi.io/healthcard";

function Healthcard() {
  const [userData, setUserData] = useState(null);
  const [healthId, setHealthId] = useState("");
  const [isCardGenerated, setIsCardGenerated] = useState(false);
  const cardRef = useRef();

  const navigate = useNavigate();
  const userEmail = useSelector((state) => state.auth.user?.email);

  // Simulated address fetch function — replace with real Aadhaar address API
  useEffect(() => {
  const autoGenerateCard = async () => {
    if (!userData?.aadhaar || isCardGenerated) return;

    try {
      const { state, city, country, pincode } = userData;

      const genId = generateHealthId(userData.gender, state, city, userData.dob);
      if (!genId) return;

      const { data } = await axios.get(CARD_API_URL);
      const existing = data.find((c) => c.aadhaar === userData.aadhaar);

      if (existing) {
        setHealthId(existing.healthId);
        localStorage.setItem("healthId", existing.healthId);
        return setIsCardGenerated(true);
      }

      await axios.post(CARD_API_URL, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        gender: userData.gender,
        phone: userData.phone,
        dob: userData.dob,
        aadhaar: userData.aadhaar,
        state,
        city,
        country,
        pincode,
        email: userData.email || "",
        healthId: genId,
      });

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


  const generateHealthId = (gender, state, city, dob) =>
    !gender || !state || !city || !dob
      ? ""
      : `AV${gender.charAt(0).toUpperCase()}${state.slice(0, 2).toUpperCase()}${city.slice(0, 2).toUpperCase()}${dob.replace(/-/g, "")}`;

  useEffect(() => {
    if (!userEmail) {
      alert("No logged-in user found. Please log in.");
      navigate("/login");
      return;
    }

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
  }, [userEmail, navigate]);



  if (!userData) return <div className="text-center p-10">Loading user profile...</div>;

  if (isCardGenerated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[var(--color-surface)] p-10 print:bg-[var(--color-surface)]">
        <div className="max-w-md w-full flex flex-col items-center ">
          <AVCard
            initialName={`${userData.firstName} ${userData.lastName}`}
            initialCardNumber={healthId}
            initialGender={userData.gender}
            initialPhoneNumber={userData.phone}
            imageUrl={userData?.photo || "/default-avatar.png"}
            initialDob={userData.dob}
            isReadOnly
            ref={cardRef}
          />
          <div className="w-full flex justify-center gap-4 mt-4">
            <button
              onClick={() => {
                const prevTitle = document.title;
                document.title = "AV Health Card";
                window.print();
                document.title = prevTitle;
              }}
              className="flex items-center gap-2 bg-[var(--primary-color)] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#123456]"
            >
              <FaDownload /> Download 
            </button>
             <button type="button" className="flex px-2 view-btn" onClick={() => navigate("/login")}>Login <FaArrowRight className="m-1" /></button>
          </div>
        </div>
      </div>
    );
  }

  // return (
  //   <div className="min-h-screen flex items-center justify-center text-center text-lg text-gray-600 p-10">
  //     <p>Generating your Health Card...</p>
  //   </div>
  // );
}

export default Healthcard;