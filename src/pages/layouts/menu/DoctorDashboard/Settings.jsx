

import React, { useState, useRef, useEffect } from "react";
import { Camera, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import avtarImg from '../../../../assets/avtar.jpg';
import { useSelector } from 'react-redux';

const tabOptions = ["Basic Information", "Professional Details", "Address", "Change Password"];

const DoctorProfileSettings = () => {
  const user = useSelector((state) => state.auth.user); // Get logged-in user from Redux
  const [activeTab, setActiveTab] = useState("Basic Information");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    roles: [],
    accountStatus: "",
    storageUsed: 0,
    qualification: "",
    specialization: "",
    experience: "",
    licenseNo: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [userId, setUserId] = useState(null);
  const fileInputRef = useRef(null);

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Fetch user data from API using the logged-in user's email
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`https://6801242781c7e9fbcc41aacf.mockapi.io/api/AV1/users?email=${encodeURIComponent(user?.email)}`);
        const users = response.data;
        if (users.length === 0) {
          throw new Error("User not found");
        }
        const userData = users[0];
        setUserId(userData.id);
        setFormData({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          username: userData.email.split('@')[0],
          roles: userData.userType ? [userData.userType.charAt(0).toUpperCase() + userData.userType.slice(1)] : [],
          accountStatus: userData.isVerified ? "active" : "inactive",
          storageUsed: 0,
          qualification: userData.roleSpecificData?.qualification || "",
          specialization: userData.roleSpecificData?.specialization || "",
          experience: userData.roleSpecificData?.experience || "",
          licenseNo: userData.roleSpecificData?.registrationNumber || "",
          address: userData.permanentAddress || "",
          city: userData.city || "",
          state: userData.state || "",
          pincode: userData.pincode || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        if (userData.photo) {
          setAvatar(userData.photo);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    if (user?.email) {
      fetchUserData();
    }
  }, [user?.email]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        username: formData.username,
        userType: formData.roles[0]?.toLowerCase(),
        isVerified: formData.accountStatus === "active",
        roleSpecificData: {
          qualification: formData.qualification,
          specialization: formData.specialization,
          experience: formData.experience,
          registrationNumber: formData.licenseNo,
        },
        permanentAddress: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        photo: avatar,
      };
      if (activeTab === "Change Password") {
        if (formData.newPassword !== formData.confirmPassword) {
          setError("New password and confirm password do not match.");
          return;
        }
        payload.password = formData.newPassword;
      }
      await axios.put(`https://6801242781c7e9fbcc41aacf.mockapi.io/api/AV1/users/${userId}`, payload);
      setIsEditMode(false);
    } catch (err) {
      console.error("Error updating user data:", err);
      setError("Failed to update user data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-color)]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="h2-heading">
          Profile: {formData.firstName} {formData.lastName}
        </h2>
        {activeTab !== "Change Password" && (
          <div className="flex gap-2">
            {isEditMode ? (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditMode(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditMode(true)}
                className="btn btn-secondary"
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-6 mb-6 border-b border-gray-200">
        {tabOptions.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-2 text-sm font-semibold bg-transparent border-none outline-none border-b-4 transition-all duration-200
              ${
                activeTab === tab
                  ? "border-[var(--accent-color)] text-[var(--accent-color)]"
                  : "border-transparent text-gray-500 hover:text-[var(--primary-color)] hover:border-[var(--accent-color)]"
              }
            `}
            style={{ background: "none" }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Basic Information" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-xl p-6 shadow-lg animate-slideIn">
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "First Name", name: "firstName" },
                { label: "Last Name", name: "lastName" },
                { label: "Email Address", name: "email", type: "email" },
                { label: "Username", name: "username" },
              ].map((field) => (
                <Input
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                  type={field.type || "text"}
                />
              ))}
            </div>
            <div className="mt-2 flex gap-6 items-center">
              <label className="block text-sm font-medium">Roles:</label>
              {["Admin", "User", "Doctor"].map((role) => (
                <label key={role} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.roles.includes(role)}
                    readOnly
                    className="accent-[var(--primary-color)]"
                    disabled
                  />
                  {role}
                </label>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 mt-4">Account Status</label>
              <select
                name="accountStatus"
                value={formData.accountStatus}
                onChange={handleInputChange}
                disabled={!isEditMode}
                className="input-field"
              >
                {["active", "inactive"].map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-6 text-sm text-gray-600">
              <strong>Storage:</strong> {formData.storageUsed}MB of 1900MB used
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-28 h-28 rounded-full overflow-hidden ring-2 ring-[var(--primary-color)]">
              <img src={avatar || avtarImg} alt="Profile" className="w-full h-full object-cover" />
            </div>
            {isEditMode && (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-primary text-sm px-4 py-2"
                >
                  Upload New Photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === "Professional Details" && (
        <div className="bg-white rounded-xl p-6 shadow-lg space-y-4 animate-slideIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Qualification", name: "qualification" },
              { label: "Specialization", name: "specialization" },
              { label: "Experience (in years)", name: "experience" },
              { label: "License No", name: "licenseNo" },
            ].map((field) => (
              <Input
                key={field.name}
                label={field.label}
                name={field.name}
                value={formData[field.name]}
                onChange={handleInputChange}
                disabled={!isEditMode}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === "Address" && (
        <div className="bg-white rounded-xl p-6 shadow-lg space-y-4 animate-slideIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Address", name: "address" },
              { label: "City", name: "city" },
              { label: "State", name: "state" },
              { label: "Pincode", name: "pincode" },
            ].map((field) => (
              <Input
                key={field.name}
                label={field.label}
                name={field.name}
                value={formData[field.name]}
                onChange={handleInputChange}
                disabled={!isEditMode}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === "Change Password" && (
        <div className="bg-white rounded-xl p-6 shadow-lg space-y-4 max-w-xl animate-slideIn">
          {[
            { label: "Current Password", name: "currentPassword", type: "password" },
            { label: "New Password", name: "newPassword", type: "password" },
            { label: "Confirm Password", name: "confirmPassword", type: "password" },
          ].map((field) => (
            <PasswordInput
              key={field.name}
              label={field.label}
              name={field.name}
              value={formData[field.name] || ""}
              onChange={handleInputChange}
              showPassword={showPassword[field.name]}
              togglePasswordVisibility={() => togglePasswordVisibility(field.name)}
            />
          ))}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditMode(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Input = ({ label, name, value, onChange, disabled = false, type = "text" }) => (
  <div className="relative floating-input" data-placeholder={label}>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`input-field peer ${disabled ? "bg-gray-100" : "bg-white"}`}
      placeholder=" "
      autoComplete="off"
    />
  </div>
);

const PasswordInput = ({ label, name, value, onChange, showPassword, togglePasswordVisibility }) => (
  <div className="relative floating-input" data-placeholder={label}>
    <input
      type={showPassword ? "text" : "password"}
      name={name}
      value={value}
      onChange={onChange}
      className="input-field peer bg-white"
      placeholder=" "
      autoComplete="off"
    />
    <button
      type="button"
      onClick={togglePasswordVisibility}
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>
);

export default DoctorProfileSettings;
