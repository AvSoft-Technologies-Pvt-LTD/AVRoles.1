

import React, { useState, useEffect, useRef } from "react";
import {
  Camera, Eye, EyeOff, Edit2, Check, Save, X, User, MapPin, Lock,
} from "lucide-react";
import { useSelector } from "react-redux";

const formFields = {
  personal: [
    { id: "firstName", label: "First Name", type: "text", readOnly: true },
    { id: "middleName", label: "Middle Name", type: "text", readOnly: true },
    { id: "lastName", label: "Last Name", type: "text", readOnly: true },
    { id: "aadhaar", label: "Aadhaar Number", type: "text", readOnly: true },
    { id: "dob", label: "Date of Birth", type: "date" },
    { id: "gender", label: "Gender", type: "text", readOnly: true },
    { id: "email", label: "Email", type: "email" },
    { id: "phone", label: "Phone Number", type: "tel" },
    { id: "alternatePhone", label: "Alternate Phone Number", type: "tel" },
    { id: "bloodGroup", label: "Blood Group", type: "select", options: ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"] },
    { id: "height", label: "Height (cm)", type: "number" },
    { id: "weight", label: "Weight (kg)", type: "number" },
    { id: "occupation", label: "Occupation", type: "select", options: ["Doctor", "Engineer", "Student", "Other"] },
  ],
  address: [
    { id: "permanentAddress", label: "Permanent Address", type: "textarea" },
    { id: "temporaryAddress", label: "Temporary Address", type: "textarea" },
    { id: "state", label: "State", type: "select", options: ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu"] },
    { id: "city", label: "City", type: "select", options: ["Mumbai", "Pune", "Bangalore", "Chennai", "Delhi"] },
    { id: "pinCode", label: "Pin Code", type: "text" },
  ],
  password: [
    { id: "currentPassword", label: "Current Password", type: "password", toggleVisibility: true },
    { id: "newPassword", label: "New Password", type: "password", toggleVisibility: true },
    { id: "confirmPassword", label: "Confirm Password", type: "password", toggleVisibility: true },
  ],
};

const Settings = () => {
  const user = useSelector((state) => state.auth.user);
  const fileInputRef = useRef(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [profileImage, setProfileImage] = useState("");
  const [passwordVisibility, setPasswordVisibility] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");

  

  useEffect(() => {
    if (user) {
      setFormData({ ...user, currentPassword: "", newPassword: "", confirmPassword: "" });
      setProfileImage(user.profileImage || "");
      setIsLoading(false);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
    if (saveSuccess) setSaveSuccess(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setProfileImage(e.target.result.toString());
          setIsDirty(true);
          if (saveSuccess) setSaveSuccess(false);
        }
      };
      reader.readAsDataURL(file );
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Saved data:", formData);
      setSaveSuccess(true);
      setIsEditMode(false);
      setIsDirty(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setError("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (!user) return;
    setFormData({ ...user, currentPassword: "", newPassword: "", confirmPassword: "" });
    setProfileImage(user.profileImage || "");
    setIsEditMode(false);
    setIsDirty(false);
  };

  const renderField = ({ id, label, type, readOnly, options, toggleVisibility }) => {
    const value = formData[id] || "";
    const baseClasses = `w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none ${readOnly ? "bg-gray-50 text-gray-500 border border-gray-200 cursor-not-allowed" : "bg-white border border-gray-300 focus:ring-2 focus:ring-[#F4C430] focus:border-purple-300"}`;

    let field;
    if (type === "textarea") {
      field = <textarea name={id} value={value} onChange={handleInputChange} className={`${baseClasses} resize-none`} rows={3} readOnly={!isEditMode} />;
    } else if (type === "select") {
      field = (
        <select name={id} value={value} onChange={handleInputChange} className={baseClasses} disabled={!isEditMode}>
          <option value="">Select {label}</option>
          {(options || []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    } else if (type === "password") {
      field = isEditMode ? (
        <div className="relative">
          <input type={passwordVisibility[id] ? "text" : "password"} name={id} value={value} onChange={handleInputChange} className={baseClasses} />
          {toggleVisibility && (
            <button type="button" onClick={() => setPasswordVisibility((prev) => ({ ...prev, [id]: !prev[id] }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#F4C430]">
              {passwordVisibility[id] ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      ) : null;
    } else {
      field = <input type={type} name={id} value={value} onChange={handleInputChange} className={baseClasses} readOnly={readOnly || !isEditMode} />;
    }

    if (type === "password" && !isEditMode) return null;

    return (
      <div key={id} className="md:col-span-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {readOnly && <span className="text-xs text-gray-400 font-normal">(Non-editable)</span>}
        </label>
        {isEditMode ? field : (
          <div className="py-3 px-4 bg-gray-50 rounded-xl text-gray-700 border border-gray-200">
            {value || <span className="text-gray-400 italic">Not provided</span>}
          </div>
        )}
      </div>
    );
  };

  const getTabIcon = (tab) => {
    switch (tab) {
      case "personal": return <User  size={16} />;
      case "address": return <MapPin size={16} />;
      case "password": return <Lock size={16} />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-32 h-32 bg-[#F4C430] rounded-full mb-4"></div>
          <div className="h-6 w-48 bg-[#F4C430] rounded-lg"></div>
          <div className="mt-8 w-72 h-10 bg-[#F4C430] rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className ="w-full min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-200 text-red-600 max-w-md">
          <div className="text-2xl font-bold mb-4">Error</div>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors">
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto relative pb-20">
      <div className="relative">
        <div className="h-48 bg-[#0E1630] rounded-3xl shadow-md overflow-hidden">
          <div className="absolute inset-0 opacity-30 bg-pattern"></div>
        </div>
        <div className="absolute top-6 left-0 right-0 px-6 flex flex-col sm:flex-row justify-between items-center">
          <h2 className="text-3xl font-bold text-white mb-4 sm:mb-0">Profile Settings</h2>
          {!isEditMode ? (
            <button onClick={() => setIsEditMode(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[#F4C430] backdrop-blur-sm text-white rounded-xl shadow-lg hover:bg-white/30 transition-all duration-300 transform hover:-translate-y-1">
              <Edit2 size={18} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <span className="text-sm text-white">Editing mode</span>
              <div className="w-3 h-3 rounded-full bg-[#F4C430] animate-pulse"></div>
            </div>
          )}
        </div>
      </div>
      <div className="relative -mt-16 z-10 flex justify-center">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white shadow-lg transition-all duration-300 group-hover:shadow-xl">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-purple-50 text-purple-300">
                <Camera size={32} />
              </div>
            )}
          </div>
          {isEditMode && (
            <div className="absolute bottom-0 right-0 w-10 h-10 bg-[#F4C430] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#F4C430]/90 hover:shadow-lg transition-all duration-300 transform hover:scale-110" onClick={() => fileInputRef.current?.click()}>
              <Camera size={18} className="text-white" />
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </div>
          )}
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 -mt-16 pt-20 pb-8 px-6 md:px-8">
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-1 rounded-full bg-purple-50 text-[#F4C430] text-sm mb-2">
            {formData.occupation || "User  "}
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">
            {formData.firstName} {formData.lastName}
          </h3>
          <p className="text-gray-500">{formData.email}</p>
        </div>
        <div className="mb-6 bg-gray-50 rounded-2xl p-2 border border-gray-200 flex flex-wrap gap-2">
          {["personal", "address", ...(isEditMode ? ["password"] : [])].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-2 px-5 py-3 rounded-xl capitalize transition-all duration-300 ${activeTab === tab ? "bg-[#F4C430] text-white" : "text-gray-600 hover:bg-gray-100"}`}>
              <span>{getTabIcon (tab)}</span>
              <span className="font-medium">{tab}</span>
            </button>
          ))}
        </div>
        <form onSubmit={handleSaveChanges}>
          {["personal", "address", ...(isEditMode ? ["password"] : [])].map((tab) => (
            <div key={tab} className={`transition-all duration-500 ${activeTab === tab ? "opacity-100 transform translate-y-0" : "hidden opacity-0 transform translate-y-8"}`}>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
                  <span className="mr-2">{tab.charAt(0).toUpperCase() + tab.slice(1)} Information</span>
                  {isEditMode && <span className="text-xs py-1 px-3 bg-purple-50 text-[#F4C430] rounded-full font-medium">Editing</span>}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formFields[tab].map(renderField)}
                </div>
              </div>
            </div>
          ))}
          {isEditMode && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 flex justify-end gap-4 z-10">
              <button type="button" onClick={handleCancelEdit} className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all">
                <X size={18} />
                <span>Cancel</span>
              </button>
              <button type="submit" disabled={!isDirty || isSaving} className={`px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 ${!isDirty || isSaving ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#F4C430] text-white shadow-md hover:bg-[#F4C430] hover:shadow-lg hover:-translate-y-1"}`}>
                {isSaving ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <Save size={18} />}
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          )}
        </form>
      </div>
      {saveSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in-up z-20">
          <div className="bg-white/20 p-1 rounded-full">
            <Check size={18} />
          </div>
          <span>Changes saved successfully!</span>
        </div>
      )}
    </div>
  );
};

export default Settings; 

