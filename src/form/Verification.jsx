import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
const OtpVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userType = location.state?.userType;
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);
  const handleChange = (el, i) => {
    const val = el.value.replace(/\D/, "");
    if (!val) return;
    const newOtp = [...otp];
    newOtp[i] = val;
    setOtp(newOtp);
    if (i < 5) inputRefs.current[i + 1].focus();
  };
  const handleBackspace = (e, i) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      newOtp[i] = "";
      setOtp(newOtp);
      if (i > 0) inputRefs.current[i - 1].focus();
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
    } else alert("Please enter a 6-digit OTP");
  };
  const handleResend = () => { setResendTimer(60); alert("OTP has been resent!"); };
  return (
    <div  className=" flex items-center justify-center min-h-screen bg-[#F5F9FC]">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-4xl flex items-center p-8 border border-gray-200">
        <div className="flex-1 space-y-6">
          <h2 className="h2-heading text-center">OTP Verification</h2>
          <p className="paragraph text-center">Enter the 6-digit OTP sent to your registered number</p>
          <div className="flex justify-between gap-2 mb-6">{otp.map((d, i) => (
            <input key={i} ref={el => (inputRefs.current[i] = el)} type="text" maxLength="1" value={d} onChange={e => handleChange(e.target, i)} onKeyDown={e => handleBackspace(e, i)} className="input-field text-center text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] w-12 h-12" />
          ))}</div>
          <button onClick={handleVerify} disabled={loading} className={`btn btn-primary w-full${loading ? " btn-disabled" : ""}`}>
            {loading ? "Verifying..." : "Verify & Proceed"}
          </button>
          <div className="text-center text-sm text-gray-600">
            {resendTimer > 0 ? <p>Resend OTP in {resendTimer} seconds</p> :
              <button onClick={handleResend} className="text-[var(--accent-color)] hover:underline font-medium">Resend OTP</button>}
          </div>
        </div>
        <div className="flex-1 hidden lg:block">
          <img src="https://img.freepik.com/premium-vector/doctor-examines-report-disease-medical-checkup-annual-doctor-health-test-appointment-tiny-person-concept-preventive-examination-patient-consults-hospital-specialist-vector-illustration_419010-581.jpg?ga=GA1.1.587832214.1744916073&semt=ais_hybrid&w=740" alt="Login illustration" className="w-full h-auto rounded-blob" />
        </div>
      </div>
    </div>
  );
};
export default OtpVerification;