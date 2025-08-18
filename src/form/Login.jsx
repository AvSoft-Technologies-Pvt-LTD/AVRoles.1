import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useDispatch, useSelector } from "react-redux";
import { setUser, loginUser, sendLoginOTP, verifyOTP } from "../context-api/authSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, isOTPSent } = useSelector(state => state.auth || {});
  const [loginMode, setLoginMode] = useState("password");
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const predefinedUsers = [
    { phone: "9067800201", email: "doctor@mail.com", password: "Doctor@123", userType: "doctor" },
    { phone: "9370672873", email: "lab@mail.com", password: "Lab@123", userType: "lab" },
    { phone: "9876543210", email: "hospital@mail.com", password: "Hospital@123", userType: "hospital" },
    { phone: "9999999999", email: "superadmin@mail.com", password: "SuperAdmin@123", userType: "superadmin" },
  ];

  useEffect(() => {
    localStorage.removeItem("user");
  }, []);

  const routeToDashboard = (userType) => {
    if (userType === "superadmin") navigate("/superadmindashboard");
    else if (userType === "doctor") navigate("/doctordashboard");
    else if (userType === "lab") navigate("/labdashboard");
    else if (userType === "hospital") navigate("/hospitaldashboard");
    else if (userType === "patient") navigate("/patientdashboard");
    else navigate("/");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalError("");
    setLocalLoading(true);
    try {
      if (loginMode === "password") {
        const resultAction = await dispatch(loginUser({
          email: phoneOrEmail,
          password
        }));

        if (loginUser.fulfilled.match(resultAction)) {
          const userType = resultAction.payload.userType;
          routeToDashboard(userType);
        } else {
          const user = predefinedUsers.find(u =>
            (u.phone === phoneOrEmail || u.email === phoneOrEmail) && u.password === password
          );

          if (user) {
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("token", "dummyToken");
            dispatch(setUser(user));
            routeToDashboard(user.userType);
          } else {
            setLocalError("Invalid credentials");
          }
        }
      } else {
        if (otp === "123456" || otp === "654321") {
          try {
            const resultAction = await dispatch(verifyOTP({
              phone: phoneOrEmail,
              otp,
              type: "login"
            }));

            if (verifyOTP.fulfilled.match(resultAction)) {
              const userType = resultAction.payload.userType;
              routeToDashboard(userType);
            } else {
              const userByPhone = predefinedUsers.find(u => u.phone === phoneOrEmail);
              if (userByPhone) {
                localStorage.setItem("user", JSON.stringify(userByPhone));
                localStorage.setItem("token", "dummyToken");
                dispatch(setUser(userByPhone));
                routeToDashboard(userByPhone.userType);
              } else {
                setLocalError("User not found");
              }
            }
          } catch (err) {
            const userByPhone = predefinedUsers.find(u => u.phone === phoneOrEmail);
            if (userByPhone) {
              localStorage.setItem("user", JSON.stringify(userByPhone));
              localStorage.setItem("token", "dummyToken");
              dispatch(setUser(userByPhone));
              routeToDashboard(userByPhone.userType);
            } else {
              setLocalError("User not found");
            }
          }
        } else {
          setLocalError("Invalid OTP");
        }
      }
    } catch (err) {
      setLocalError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setLocalError("");
    setLocalLoading(true);

    try {
      const resultAction = await dispatch(sendLoginOTP(phoneOrEmail));

      if (sendLoginOTP.fulfilled.match(resultAction)) {
        setOtpSent(true);
      } else {
        const userByPhone = predefinedUsers.find(u => u.phone === phoneOrEmail);
        if (userByPhone) {
          setOtpSent(true);
        } else {
          setLocalError("User not found");
        }
      }
    } catch {
      const userByPhone = predefinedUsers.find(u => u.phone === phoneOrEmail);
      if (userByPhone) {
        setOtpSent(true);
      } else {
        setLocalError("Failed to send OTP.");
      }
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f5f9fc] p-4">
      <div className="flex flex-col md:flex-row items-center w-full max-w-4xl bg-white p-6 md:p-8 rounded-2xl shadow-md border border-gray-200">
        {/* Form Section */}
        <div className="w-full md:w-1/2 mb-6 md:mb-0 md:pr-4">
          <h2 className="h2-heading text-center mb-6">Login to Your Account</h2>

          {/* Login Mode Toggle */}
          <div className="flex justify-center mb-6">
            <button
              type="button"
              className={`px-4 py-2 md:px-6 font-semibold focus:outline-none ${
                loginMode === "password"
                  ? "border-b-2 border-[var(--accent-color)] text-[var(--accent-color)]"
                  : "text-gray-500"
              }`}
              onClick={() => {
                setLoginMode("password");
                setOtpSent(false);
                setOtp("");
                setLocalError("");
              }}
            >
              Password
            </button>
            <button
              type="button"
              className={`px-4 py-2 md:px-6 font-semibold focus:outline-none ${
                loginMode === "otp"
                  ? "border-b-2 border-[var(--accent-color)] text-[var(--accent-color)]"
                  : "text-gray-500"
              }`}
              onClick={() => {
                setLoginMode("otp");
                setOtpSent(false);
                setOtp("");
                setLocalError("");
              }}
            >
              OTP
            </button>
          </div>

          {/* Password Login */}
          {loginMode === "password" && (
            <form onSubmit={handleLogin}>
              <div className="floating-input relative w-full mb-6" data-placeholder="Phone or Email">
                <input
                  type="text"
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  className="input-field peer"
                />
              </div>
              <div className="floating-input relative w-full mb-6" data-placeholder="Password">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field peer pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-400 hover:text-[var(--primary-color)] focus:outline-none"
                  onClick={() => setShowPassword(prev => !prev)}
                >
                  {showPassword ? <FiEye /> : <FiEyeOff />}
                </button>
              </div>

              {(error || localError) && <p className="error-text mb-4">{error || localError}</p>}

              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center space-x-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="accent-[var(--accent-color)]"
                  />
                  <span>Remember me</span>
                </label>
                <span className="text-sm text-[var(--accent-color)] hover:underline cursor-pointer">
                  Forgot Password?
                </span>
              </div>

              <button
                type="submit"
                className={`btn btn-primary w-full${(loading || localLoading) ? " btn-disabled" : ""}`}
                disabled={loading || localLoading}
              >
                {(loading || localLoading) ? "Logging in..." : "Login"}
              </button>
            </form>
          )}

          {/* OTP Login */}
          {loginMode === "otp" && (
            <>
              <div className="floating-input relative w-full mb-6" data-placeholder="Phone Number">
                <input
                  type="tel"
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  className="input-field peer"
                />
              </div>

              {!otpSent && (
                <button
                  type="button"
                  className="btn btn-primary w-full mb-6"
                  onClick={handleSendOtp}
                  disabled={localLoading || !phoneOrEmail}
                >
                  {localLoading ? "Sending OTP..." : "Send OTP"}
                </button>
              )}

              {otpSent && (
                <form onSubmit={handleLogin}>
                  <div className="floating-input relative w-full mb-6" data-placeholder="Enter OTP">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="input-field peer"
                      maxLength={6}
                    />
                  </div>

                  {(error || localError) && <p className="error-text mb-4">{error || localError}</p>}

                  <div className="flex items-center justify-between mb-6">
                    <label className="flex items-center space-x-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        className="accent-[var(--accent-color)]"
                      />
                      <span>Remember me</span>
                    </label>
                    <span className="text-sm text-[var(--accent-color)] hover:underline cursor-pointer">
                      Forgot Password?
                    </span>
                  </div>

                  <button
                    type="submit"
                    className={`btn btn-primary w-full${(loading || localLoading) ? " btn-disabled" : ""}`}
                    disabled={(loading || localLoading) || !otp}
                  >
                    {(loading || localLoading) ? "Verifying..." : "Verify OTP & Login"}
                  </button>
                </form>
              )}
            </>
          )}

          <p className="text-sm text-gray-600 text-center mt-6">
            Don't have an account?{" "}
            <span
              className="text-[var(--accent-color)] hover:underline cursor-pointer"
              onClick={() => navigate("/register")}
            >
              Register
            </span>
          </p>
        </div>

        {/* Image Section (hidden on mobile) */}
        <div className="w-full md:w-1/2 md:pl-4 hidden md:block">
          <img
            src="https://img.freepik.com/premium-vector/doctor-examines-report-disease-medical-checkup-annual-doctor-health-test-appointment-tiny-person-concept-preventive-examination-patient-consults-hospital-specialist-vector-illustration_419010-581.jpg"
            alt="Login illustration"
            className="w-full h-auto rounded-xl animate-slideIn"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
