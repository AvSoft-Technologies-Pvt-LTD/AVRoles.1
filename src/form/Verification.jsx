import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const OtpVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userType = location.state?.userType;
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (el, i) => {
    const val = el.value.replace(/\D/, "");
    if (!val) return;
    const newOtp = [...otp];
    newOtp[i] = val;
    setOtp(newOtp);
    if (i < 5 && inputRefs.current[i + 1]) {
      inputRefs.current[i + 1].focus();
    }
  };

  const handleBackspace = (e, i) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      const newOtp = [...otp];
      newOtp[i - 1] = "";
      setOtp(newOtp);
      inputRefs.current[i - 1].focus();
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length === 6) {
      setLoading(true);
      setTimeout(() => {
        if (userType === "patient") {
          navigate("/healthcard");
        } else {
          navigate("/login");
        }
        setLoading(false);
      }, 2000);
    } else {
      alert("Please enter a 6-digit OTP");
    }
  };

  const handleResend = () => {
    setResendTimer(60);
    alert("OTP has been resent!");
  };

  return (
    <div className="min-h-screen bg-[#F5F9FC] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-4xl flex flex-col md:flex-row overflow-hidden">
        {/* Image (hidden on mobile, visible on tablet+) */}
        <div className="md:w-1/2 p-4 hidden md:block">
          <img
            src="https://img.freepik.com/premium-vector/doctor-examines-report-disease-medical-checkup-annual-doctor-health-test-appointment-tiny-person-concept-preventive-examination-patient-consults-hospital-specialist-vector-illustration_419010-581.jpg?ga=GA1.1.587832214.1744916073&semt=ais_hybrid&w=740"
            alt="OTP illustration"
            className="w-full h-auto object-cover rounded-lg"
          />
        </div>

        {/* Form */}
        <div className="md:w-1/2 p-6 sm:p-8 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">OTP Verification</h2>
          <p className="text-center text-sm sm:text-base text-gray-600">
            Enter the 6-digit OTP sent to your registered number
          </p>
          <div className="flex justify-between gap-2 mb-6">
            {otp.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                maxLength="1"
                value={d}
                onChange={(e) => handleChange(e.target, i)}
                onKeyDown={(e) => handleBackspace(e, i)}
                className="w-10 sm:w-12 h-10 sm:h-12 text-center text-lg sm:text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
              />
            ))}
          </div>
          <button
            onClick={handleVerify}
            disabled={loading}
            className={`w-full py-2 sm:py-3 rounded-lg text-white font-medium transition-all ${loading ? "bg-gray-400" : "bg-[var(--accent-color)] hover:bg-opacity-90"}`}
          >
            {loading ? "Verifying..." : "Verify & Proceed"}
          </button>
          <div className="text-center text-sm text-gray-600">
            {resendTimer > 0 ? (
              <p>Resend OTP in {resendTimer} seconds</p>
            ) : (
              <button
                onClick={handleResend}
                className="text-[var(--accent-color)] hover:underline font-medium"
              >
                Resend OTP
              </button>
            )}
          </div>
        </div>

        {/* Image (visible only on mobile) */}
        <div className="md:hidden p-4">
          <img
            src="https://img.freepik.com/premium-vector/doctor-examines-report-disease-medical-checkup-annual-doctor-health-test-appointment-tiny-person-concept-preventive-examination-patient-consults-hospital-specialist-vector-illustration_419010-581.jpg?ga=GA1.1.587832214.1744916073&semt=ais_hybrid&w=740"
            alt="OTP illustration"
            className="w-full h-48 object-contain mx-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
