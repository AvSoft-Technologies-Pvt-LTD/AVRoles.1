import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, sendOTP } from "../context-api/authSlice";
import { Eye, EyeOff, Upload, FileText, X, Camera, ChevronDown } from 'lucide-react';

// File Upload Component with Base64 Handling
const NeatFileUpload = ({ name, accept, multiple = false, files, onFileChange, label, required = false, icon: Icon = Upload }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  const handlePreview = (file) => {
    setPreviewDoc(file);
    setIsModalOpen(true);
  };

  return (
    <div className="relative floating-input" data-placeholder={`${label}${required ? ' *' : ''}`}>
      <label className="block cursor-pointer">
        <div className="input-field flex items-center gap-2 peer">
          <Icon size={16} />
          <span className="truncate">{label}{required && ' *'}</span>
        </div>
        <input
          type="file"
          name={name}
          accept={accept}
          multiple={multiple}
          onChange={onFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer peer"
        />
      </label>
      {files?.length > 0 && (
        <div className="mt-2 space-y-1">
          {files.map((file, i) => (
            <div key={i} className="flex justify-between items-center p-2 border rounded-md">
              <span className="text-sm text-gray-700">{file.name}</span>
              <button type="button" onClick={() => handlePreview(file)} className="text-blue-500 hover:text-blue-700">
                <Eye size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      {isModalOpen && previewDoc && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="relative bg-white p-4 rounded-lg w-full max-w-2xl">
            <button
              className="absolute top-2 right-2 text-red-500"
              onClick={() => {
                setIsModalOpen(false);
                setPreviewDoc(null);
              }}
            >
              <X size={24} />
            </button>
            <h2 className="text-lg font-semibold mb-4">Preview</h2>
            {previewDoc.type?.startsWith("image/") ? (
              <img src={previewDoc.base64 || previewDoc} alt="Preview" className="max-h-[500px] w-full object-contain" />
            ) : previewDoc.type === "application/pdf" ? (
              <iframe src={previewDoc.base64 || previewDoc} className="w-full h-[500px]" title="PDF Preview" />
            ) : (
              <p className="text-gray-600">Preview not available for this file type.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Photo Upload Component with Base64 Handling
const PhotoUpload = ({ photoPreview, onPhotoChange, onPreviewClick }) => (
  <div className="relative floating-input" data-placeholder="Upload Photo *">
    <label className="block relative cursor-pointer">
      <div className="input-field flex items-center gap-2 peer">
        <Camera size={16} />
        <span className="truncate">Upload Photo *</span>
      </div>
      <input
        type="file"
        name="photo"
        accept="image/*"
        onChange={onPhotoChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </label>
    {photoPreview && (
      <div className="mt-2 flex items-center gap-2">
        <span className="text-sm text-gray-700">Photo Uploaded</span>
        <button type="button" onClick={onPreviewClick} className="text-blue-500 hover:text-blue-700">
          <Eye size={20} />
        </button>
      </div>
    )}
  </div>
);

const CompactDropdownCheckbox = ({
  label,
  options,
  selected,
  onChange,
  required = false,
  placeholder = "Select options",
  allowOther = false,
  otherValue = "",
  onOtherChange = () => {}
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCheckboxChange = (option, checked) => {
    if (checked) {
      onChange([...selected, option]);
    } else {
      onChange(selected.filter(item => item !== option));
    }
  };

  const displayText = selected.length > 0
    ? selected.length === 1
      ? selected[0]
      : `${selected.length} selected`
    : placeholder;

  return (
    <div className="floating-input relative w-full" data-placeholder={label + (required ? ' *' : '')}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="input-field peer w-full flex items-center justify-between text-left"
        >
          <span className={selected.length > 0 ? 'text-gray-900' : 'text-gray-400'}>
            {displayText}
          </span>
          <ChevronDown size={16} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {options.map((option) => (
              <label key={option} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={(e) => handleCheckboxChange(option, e.target.checked)}
                  className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
            {allowOther && (
              <div className="border-t border-gray-200 p-3">
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={selected.includes("Other")}
                    onChange={(e) => handleCheckboxChange("Other", e.target.checked)}
                    className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Other</span>
                </label>
                {selected.includes("Other") && (
                  <input
                    type="text"
                    placeholder="Specify other..."
                    value={otherValue}
                    onChange={(e) => onOtherChange(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const RegisterForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userType = location.state?.userType;
  const dispatch = useDispatch();
  const { loading, error, isOTPSent } = useSelector((state) => state.auth || {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [availableCities, setAvailableCities] = useState([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    email: '',
    aadhaar: '',
    gender: '',
    dob: '',
    occupation: '',
    temporaryAddress: '',
    permanentAddress: '',
    isSameAsPermanent: false,
    photo: null, // This will store base64 data
    password: '',
    confirmPassword: '',
    agreeDeclaration: false,
    pincode: '',
    city: '',
    district: '',
    state: '',
    // Hospital specific
    hospitalName: '',
    headCeoName: '',
    registrationNumber: '',
    location: '',
    hospitalType: [],
    gstNumber: '',
    nabhCertificate: null, // This will store base64 data
    inHouseLab: '',
    inHousePharmacy: '',
    labLicenseNo: '',
    pharmacyLicenseNo: '',
    otherHospitalType: '',
    // Lab specific
    centerType: '',
    centerName: '',
    ownerFullName: '',
    availableTests: [],
    scanServices: [],
    specialServices: [],
    licenseNumber: '',
    certificates: [], // These will store base64 data
    certificateTypes: [],
    otherCertificate: '',
    otherSpecialService: '',
    documents: [], // These will store base64 data
    // Doctor specific
    roleSpecificData: {
      registrationNumber: '',
      practiceType: '',
      specialization: '',
      qualification: '',
      location: '',
      agreeDeclaration: false
    }
  });

  const hospitalTypeOptions = ["General Hospital", "Multi-specialty Hospital", "Super-specialty Hospital", "Maternity/Nursing Home", "Dental Hospital", "Government", "Private"];
  const labTestOptions = ["CBC (Complete Blood Count)", "Blood Sugar (FBS, PPBS, HbA1c)", "Lipid Profile", "Liver Function Test (LFT)", "Kidney Function Test (KFT)", "Thyroid Profile (T3, T4, TSH)", "Urine Test", "Dengue, Malaria, etc."];
  const scanServiceOptions = ["X-Ray", "MRI", "CT Scan", "Ultrasound", "ECG", "2D Echo", "Mammography"];
  const specialServicesOptions = ["Home Sample Collection", "Emergency Diagnostic Services", "Tele-Radiology Services", "Mobile Diagnostic Units"];
  const ayushSpecializations = ["Ayurveda", "Homeopathy", "Unani", "Siddha", "Naturopathy", "Yoga"];
  const allopathySpecializations = ["General Medicine", "Pediatrics", "Cardiology", "Orthopedics", "Dermatology", "Gynecology", "ENT", "Ophthalmology", "Radiology"];

  const specializationToPracticeType = {
    Ayurveda: ["Ayush"], Homeopathy: ["Ayush"], Unani: ["Ayush"], Siddha: ["Ayush"], Naturopathy: ["Ayush"], Yoga: ["Ayush"],
    "General Medicine": ["Allopathy"], Pediatrics: ["Allopathy"], Cardiology: ["Allopathy"], Orthopedics: ["Allopathy"],
    Dermatology: ["Allopathy"], Gynecology: ["Allopathy"], ENT: ["Allopathy"], Ophthalmology: ["Allopathy"], Radiology: ["Allopathy"]
  };

  // Convert File to Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          base64: reader.result,
          name: file.name,
          type: file.type,
          size: file.size
        });
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === "radio") {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      if (name === "phone") {
        const formatted = value.replace(/\D/g, "").slice(0, 10);
        setFormData(prev => ({ ...prev, phone: formatted }));
        return;
      }
      if (name === "aadhaar") {
        const formatted = value
          .replace(/\D/g, "")
          .slice(0, 12)
          .replace(/(\d{4})(\d{4})(\d{0,4})/, (_, g1, g2, g3) => [g1, g2, g3].filter(Boolean).join("-"));
        setFormData(prev => ({ ...prev, aadhaar: formatted }));
        return;
      }
      if (name.startsWith("roleSpecificData.")) {
        const fieldName = name.replace("roleSpecificData.", "");
        if (fieldName === "specialization") {
          const possiblePracticeTypes = specializationToPracticeType[value] || [];
          setFormData(prev => ({
            ...prev,
            roleSpecificData: {
              ...prev.roleSpecificData,
              specialization: value,
              practiceType: possiblePracticeTypes.length === 1 ? possiblePracticeTypes[0] : ""
            }
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            roleSpecificData: { ...prev.roleSpecificData, [fieldName]: value }
          }));
        }
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    }
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = async (e) => {
    const { name, files } = e.target;

    if (name === "photo" && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        try {
          const base64Data = await fileToBase64(file);
          setPhotoPreview(base64Data.base64);
          setFormData(prev => ({ ...prev, photo: base64Data.base64 }));
        } catch (error) {
          console.error("Error converting photo to base64:", error);
          alert("Error processing image. Please try again.");
        }
      } else {
        alert("Please upload a valid image file.");
      }
    } else if (name === "nabhCertificate" && files.length > 0) {
      const file = files[0];
      try {
        const base64Data = await fileToBase64(file);
        setFormData(prev => ({ 
          ...prev, 
          nabhCertificate: [{
            ...base64Data,
            originalName: file.name
          }]
        }));
      } catch (error) {
        console.error("Error converting certificate to base64:", error);
        alert("Error processing file. Please try again.");
      }
    } else if (name === "certificates" && files.length > 0) {
      const validFiles = Array.from(files).filter(
        file => file.type === "application/pdf" || file.type.startsWith("image/")
      );
      if (validFiles.length > 0) {
        try {
          const base64Files = await Promise.all(
            validFiles.map(async (file) => {
              const base64Data = await fileToBase64(file);
              return {
                ...base64Data,
                originalName: file.name
              };
            })
          );
          setFormData(prev => ({ 
            ...prev, 
            certificates: [...(prev.certificates || []), ...base64Files] 
          }));
        } catch (error) {
          console.error("Error converting certificates to base64:", error);
          alert("Error processing files. Please try again.");
        }
      } else {
        alert("Only PDF or image files are allowed.");
      }
    } else if (name === "documents" && files.length > 0) {
      const validFiles = Array.from(files).filter(
        file => file.type === "application/pdf" || file.type.startsWith("image/")
      );
      if (validFiles.length > 0) {
        try {
          const base64Files = await Promise.all(
            validFiles.map(async (file) => {
              const base64Data = await fileToBase64(file);
              return {
                ...base64Data,
                originalName: file.name
              };
            })
          );
          setFormData(prev => ({ 
            ...prev, 
            documents: [...(prev.documents || []), ...base64Files] 
          }));
        } catch (error) {
          console.error("Error converting documents to base64:", error);
          alert("Error processing files. Please try again.");
        }
      } else {
        alert("Only PDF or image files are allowed.");
      }
    }
  };

  const handlePincodeChange = async (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, pincode: value }));
    
    if (value.length === 6) {
      setIsLoadingCities(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);
        const data = await res.json();
        if (data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
          // Extract unique cities from the response
          const cities = [...new Set(data[0].PostOffice.map(office => office.Name))];
          setAvailableCities(cities);
          
          // Set district and state from first office (they should be same for all)
          setFormData(prev => ({
            ...prev,
            city: '', // Reset city selection
            district: data[0].PostOffice[0].District,
            state: data[0].PostOffice[0].State
          }));
        } else {
          setAvailableCities([]);
          setFormData(prev => ({ ...prev, city: '', district: '', state: '' }));
        }
      } catch {
        setAvailableCities([]);
        setFormData(prev => ({ ...prev, city: '', district: '', state: '' }));
      } finally {
        setIsLoadingCities(false);
      }
    } else {
      setAvailableCities([]);
      setFormData(prev => ({ ...prev, city: '', district: '', state: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^\S+@\S+\.\S+$/;
    const phoneRegex = /^\d{10}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/;

    if (!(userType === "hospital" || userType === "lab")) {
      if (!formData.firstName?.trim()) newErrors.firstName = "First name is required";
      if (!formData.lastName?.trim()) newErrors.lastName = "Last name is required";
    }
    if (!formData.phone?.match(phoneRegex)) newErrors.phone = "Phone must be 10 digits";
    if (!formData.email || !emailRegex.test(formData.email)) newErrors.email = "Enter a valid email";
    if (!passwordRegex.test(formData.password)) {
      newErrors.password = "Password must include capital letters, numbers, and special characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.city?.trim()) newErrors.city = "City is required";

    if (userType === "patient") {
      if (!formData.aadhaar || formData.aadhaar.replace(/-/g, '').length !== 12) newErrors.aadhaar = "Aadhaar must be 12 digits";
      if (!formData.gender) newErrors.gender = "Gender is required";
      if (!formData.dob) newErrors.dob = "Date of birth is required";
      if (!formData.occupation?.trim()) newErrors.occupation = "Occupation is required";
      if (!formData.pincode || formData.pincode.length !== 6) newErrors.pincode = "Pincode must be 6 digits";
      if (!formData.photo) newErrors.photo = "Photo is required";
      if (!formData.agreeDeclaration) newErrors.agreeDeclaration = "Please accept the declaration";
    }

    if (userType === "hospital") {
      if (!formData.hospitalName?.trim()) newErrors.hospitalName = "Hospital name is required";
      if (!formData.headCeoName?.trim()) newErrors.headCeoName = "Head/CEO name is required";
      if (!formData.registrationNumber?.trim()) newErrors.registrationNumber = "Registration number is required";
      if (!formData.hospitalType?.length) newErrors.hospitalType = "Please select hospital type";
      if (!formData.gstNumber?.trim()) newErrors.gstNumber = "GST number is required";
      if (!formData.pincode || formData.pincode.length !== 6) newErrors.pincode = "Pincode must be 6 digits";
      if (!formData.inHouseLab) newErrors.inHouseLab = "Please specify if there is an in-house lab";
      if (!formData.inHousePharmacy) newErrors.inHousePharmacy = "Please specify if there is an in-house pharmacy";
      if (formData.inHouseLab === "yes" && !formData.labLicenseNo?.trim()) newErrors.labLicenseNo = "Lab license number is required";
      if (formData.inHousePharmacy === "yes" && !formData.pharmacyLicenseNo?.trim()) newErrors.pharmacyLicenseNo = "Pharmacy license number is required";
      if (!formData.agreeDeclaration) newErrors.agreeDeclaration = "Please accept the declaration";
    }

    if (userType === "lab") {
      if (!formData.centerType?.trim()) newErrors.centerType = "Center type is required";
      if (!formData.centerName?.trim()) newErrors.centerName = "Center name is required";
      if (!formData.ownerFullName?.trim()) newErrors.ownerFullName = "Owner's full name is required";
      if (!formData.registrationNumber?.trim()) newErrors.registrationNumber = "Registration number is required";
      if (!formData.availableTests?.length) newErrors.availableTests = "Please select available tests";
      if (!formData.scanServices?.length) newErrors.scanServices = "Please select scan services";
      if (!formData.licenseNumber?.trim()) newErrors.licenseNumber = "License number is required";
      if (!formData.pincode || formData.pincode.length !== 6) newErrors.pincode = "Pincode must be 6 digits";
      if (!formData.gstNumber?.trim()) newErrors.gstNumber = "GST number is required";
      if (!formData.agreeDeclaration) newErrors.agreeDeclaration = "Please accept the declaration";
    }

    if (userType === "doctor") {
      if (!formData.gender) newErrors.gender = "Gender is required";
      if (!formData.dob) newErrors.dob = "Date of birth is required";
      if (!formData.photo) newErrors.photo = "Photo is required";
      if (!formData.roleSpecificData.registrationNumber?.trim()) {
        newErrors.registrationNumber = "Registration number is required";
      }
      if (!formData.roleSpecificData.practiceType) newErrors.practiceType = "Practice type is required";
      if (!formData.roleSpecificData.specialization) newErrors.specialization = "Specialization is required";
      if (!formData.roleSpecificData.qualification?.trim()) newErrors.qualification = "Qualification is required";
      if (!formData.pincode || formData.pincode.length !== 6) newErrors.pincode = "Pincode must be 6 digits";
      if (!formData.roleSpecificData.agreeDeclaration) {
        newErrors.agreeDeclaration = "Please accept the declaration";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const dataToSubmit = { ...formData, userType };
      console.log("Submitting data with base64 images:", dataToSubmit);
      
      const resultAction = await dispatch(registerUser(dataToSubmit));
      if (registerUser.fulfilled.match(resultAction)) {
        if (userType === "patient" && !isOTPSent) {
          await dispatch(sendOTP(dataToSubmit.phone));
        }
        navigate("/verification", { state: { userType } });
      } else {
        setErrors({ global: resultAction.payload || "Registration failed" });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ global: "An error occurred during registration. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (name, type = "text", placeholder = "", required = false) => (
    <div className="floating-input relative w-full" data-placeholder={`${placeholder}${required ? " *" : ""}`}>
      <input
        type={type}
        name={name}
        placeholder=" "
        required={required}
        autoComplete="off"
        value={formData[name] || ""}
        onChange={handleInputChange}
        className={`input-field peer ${errors[name] ? "input-error" : ""}`}
      />
      <label htmlFor={name} className="sr-only">{placeholder}</label>
      {errors[name] && <p className="error-text">{errors[name]}</p>}
    </div>
  );

  if (!userType) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please select a user type first</h2>
          <button
            onClick={() => navigate("/register-select")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back to Selection
          </button>
        </div>
      </div>
    );
  }

  // User-type specific field rendering
  let userFields = null;
  if (userType === "patient") {
    userFields = (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderInput("firstName", "text", "First Name", true)}
          {renderInput("middleName", "text", "Middle Name")}
          {renderInput("lastName", "text", "Last Name", true)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInput("phone", "text", "Phone Number", true)}
          {renderInput("email", "email", "Email", true)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderInput("aadhaar", "text", "Aadhaar Number", true)}
          <div className="floating-input relative w-full" data-placeholder="Gender *">
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className={`input-field peer ${errors.gender ? "input-error" : ""}`}
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && <p className="error-text">{errors.gender}</p>}
          </div>
          {renderInput("dob", "date", "Date of Birth", true)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInput("occupation", "text", "Occupation", true)}
          <PhotoUpload
            photoPreview={photoPreview}
            onPhotoChange={handleFileChange}
            onPreviewClick={() => setIsModalOpen(true)}
          />
        </div>
      </>
    );
  } else if (userType === "hospital") {
    userFields = (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderInput("hospitalName", "text", "Hospital Name", true)}
          {renderInput("headCeoName", "text", "Head/CEO Name", true)}
          {renderInput("registrationNumber", "text", "Registration Number", true)}
                   {renderInput("phone", "text", "Phone Number", true)}
          {renderInput("email", "email", "Email", true)}
            {renderInput("gstNumber", "text", "GST Number", true)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
          <CompactDropdownCheckbox
            label="Hospital Type"
            required
            placeholder="Select Hospital Type"
            options={hospitalTypeOptions}
            selected={formData.hospitalType}
            onChange={(selected) => setFormData(prev => ({ ...prev, hospitalType: selected }))}
            allowOther
            otherValue={formData.otherHospitalType}
            onOtherChange={(value) => setFormData(prev => ({ ...prev, otherHospitalType: value }))}
          />
           <PhotoUpload
            photoPreview={photoPreview}
            onPhotoChange={handleFileChange}
            onPreviewClick={() => setIsModalOpen(true)}
          />
          <NeatFileUpload
            name="nabhCertificate"
            accept=".pdf,.jpg,.jpeg,.png"
            files={formData.nabhCertificate || []}
            onFileChange={handleFileChange}
            label="NABH Certificate"
            icon={FileText}
          />
        </div>
        {errors.hospitalType && <p className="error-text">{errors.hospitalType}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">In-House Lab *</label>
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="inHouseLab"
                  value="yes"
                  checked={formData.inHouseLab === "yes"}
                  onChange={handleInputChange}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="inHouseLab"
                  value="no"
                  checked={formData.inHouseLab === "no"}
                  onChange={handleInputChange}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2">No</span>
              </label>
            </div>
            {formData.inHouseLab === "yes" && (
              <div className="mt-2">
                {renderInput("labLicenseNo", "text", "Lab License Number", true)}
              </div>
            )}
            {errors.inHouseLab && <p className="error-text">{errors.inHouseLab}</p>}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">In-House Pharmacy *</label>
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="inHousePharmacy"
                  value="yes"
                  checked={formData.inHousePharmacy === "yes"}
                  onChange={handleInputChange}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="inHousePharmacy"
                  value="no"
                  checked={formData.inHousePharmacy === "no"}
                  onChange={handleInputChange}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2">No</span>
              </label>
            </div>
            {formData.inHousePharmacy === "yes" && (
              <div className="mt-2">
                {renderInput("pharmacyLicenseNo", "text", "Pharmacy License Number", true)}
              </div>
            )}
            {errors.inHousePharmacy && <p className="error-text">{errors.inHousePharmacy}</p>}
          </div>
        </div>
      </>
    );
  } else if (userType === "lab") {
    userFields = (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="floating-input relative w-full" data-placeholder="Center Type *">
            <select
              name="centerType"
              value={formData.centerType}
              onChange={handleInputChange}
              className={`input-field peer ${errors.centerType ? "input-error" : ""}`}
              required
            >
              <option value="">Select Center Type</option>
              <option value="Lab">Lab</option>
              <option value="Scan">Scan</option>
              <option value="Lab & Scan">Lab & Scan</option>
            </select>
            {errors.centerType && <p className="error-text">{errors.centerType}</p>}
          </div>
          {renderInput("centerName", "text", "Center Name", true)}
          {renderInput("ownerFullName", "text", "Owner's Full Name", true)}
                   {renderInput("phone", "text", "Phone Number", true)}
          {renderInput("email", "email", "Email", true)}
            {renderInput("registrationNumber", "text", "Registration Number", true)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
          {renderInput("gstNumber", "text", "GST Number", true)}
          <NeatFileUpload
        name="certificates"
        accept=".pdf,.jpg,.jpeg,.png"
        multiple
        files={formData.certificates || []}
        onFileChange={handleFileChange}
        label="Upload Certificates"
        icon={FileText}
      />
       
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          
          <PhotoUpload
            photoPreview={photoPreview}
            onPhotoChange={handleFileChange}
            onPreviewClick={() => setIsModalOpen(true)}
          />
        </div>
         </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CompactDropdownCheckbox
          label="Available Tests"
          options={labTestOptions}
          selected={formData.availableTests}
          onChange={(selected) => setFormData(prev => ({ ...prev, availableTests: selected }))}
          required
          placeholder="Select Available Tests"
        />
        <CompactDropdownCheckbox
          label="Scan Services"
          options={scanServiceOptions}
          selected={formData.scanServices}
          onChange={(selected) => setFormData(prev => ({ ...prev, scanServices: selected }))}
          placeholder="Select Scan Services"
        />
        <CompactDropdownCheckbox
          label="Special Services"
          options={specialServicesOptions}
          selected={formData.specialServices}
          onChange={(selected) => setFormData(prev => ({ ...prev, specialServices: selected }))}
          placeholder="Select Special Services"
        />
      </div>
      
      </>
    );
  } else if (userType === "doctor") {
    userFields = (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderInput("firstName", "text", "First Name", true)}
          {renderInput("middleName", "text", "Middle Name")}
          {renderInput("lastName", "text", "Last Name", true)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInput("phone", "text", "Phone Number", true)}
          {renderInput("email", "email", "Email", true)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderInput("aadhaar", "text", "Aadhaar Number")}
          <div className="floating-input relative w-full" data-placeholder="Gender *">
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className={`input-field peer ${errors.gender ? "input-error" : ""}`}
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && <p className="error-text">{errors.gender}</p>}
          </div>
          {renderInput("dob", "date", "Date of Birth", true)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="floating-input relative w-full" data-placeholder="Registration Number *">
            <input
              type="text"
              name="roleSpecificData.registrationNumber"
              placeholder=" "
              value={formData.roleSpecificData.registrationNumber}
              onChange={handleInputChange}
              className={`input-field peer ${errors.registrationNumber ? "input-error" : ""}`}
              required
            />
            {errors.registrationNumber && <p className="error-text">{errors.registrationNumber}</p>}
          </div>
          <div className="floating-input relative w-full" data-placeholder="Practice Type *">
            <select
              name="roleSpecificData.practiceType"
              value={formData.roleSpecificData.practiceType}
              onChange={handleInputChange}
              className={`input-field peer ${errors.practiceType ? "input-error" : ""}`}
              required
            >
              <option value="">Select Practice Type</option>
              <option value="Ayush">Ayush</option>
              <option value="Allopathy">Allopathy</option>
            </select>
            {errors.practiceType && <p className="error-text">{errors.practiceType}</p>}
          </div>
          <div className="floating-input relative w-full" data-placeholder="Specialization *">
            <select
              name="roleSpecificData.specialization"
              value={formData.roleSpecificData.specialization}
              onChange={handleInputChange}
              disabled={!formData.roleSpecificData.practiceType}
              className={`input-field peer ${errors.specialization ? "input-error" : ""}`}
              required
            >
              <option value="">Select Specialization</option>
              {(formData.roleSpecificData.practiceType === "Ayush" ? ayushSpecializations : allopathySpecializations).map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {errors.specialization && <p className="error-text">{errors.specialization}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="floating-input relative w-full" data-placeholder="Qualification *">
            <input
              type="text"
              name="roleSpecificData.qualification"
              placeholder=" "
              value={formData.roleSpecificData.qualification}
              onChange={handleInputChange}
              className={`input-field peer ${errors.qualification ? "input-error" : ""}`}
              required
            />
            {errors.qualification && <p className="error-text">{errors.qualification}</p>}
          </div>
          <PhotoUpload
            photoPreview={photoPreview}
            onPhotoChange={handleFileChange}
            onPreviewClick={() => setIsModalOpen(true)}
          />
        </div>
      </>
    );
  }

  // Address, password, declaration, and submit are common for all
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl bg-white p-8 sm:p-10 shadow-lg border rounded-xl">
        <h2 className="h2-heading text-center mb-1">Register as {userType}</h2>
        <p className="text-gray-600 text-center mb-6">Please fill in your details to create an account.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          {userFields}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="floating-input relative w-full" data-placeholder="Pincode *">
              <input
                name="pincode"
                type="text"
                maxLength="6"
                placeholder=" "
                value={formData.pincode || ""}
                onChange={handlePincodeChange}
                className={`input-field peer ${errors.pincode ? "input-error" : ""}`}
                required
              />
              {errors.pincode && <p className="error-text">{errors.pincode}</p>}
            </div>
            <div className="floating-input relative w-full" data-placeholder="City *">
              <select
                name="city"
                value={formData.city || ""}
                onChange={handleInputChange}
                disabled={!availableCities.length || isLoadingCities}
                className={`input-field peer ${errors.city ? "input-error" : ""} ${
                  !availableCities.length ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
                required
              >
                <option value="">
                  {isLoadingCities 
                    ? "Loading cities..." 
                    : availableCities.length 
                      ? "Select City" 
                      : "Enter pincode first"
                  }
                </option>
                {availableCities.map((city, index) => (
                  <option key={index} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {errors.city && <p className="error-text">{errors.city}</p>}
            </div>
            <div className="floating-input relative w-full" data-placeholder="District">
              <input
                name="district"
                type="text"
                value={formData.district || ""}
                readOnly
                className="input-field peer bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div className="floating-input relative w-full" data-placeholder="State">
              <input
                name="state"
                type="text"
                value={formData.state || ""}
                readOnly
                className="input-field peer bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="floating-input relative w-full" data-placeholder="Create Password *">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder=" "
                onChange={handleInputChange}
                className={`input-field peer pr-10 ${errors.password ? "input-error" : ""}`}
                value={formData.password}
                autoComplete="off"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-3 right-3 cursor-pointer text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
              {errors.password && <p className="error-text">{errors.password}</p>}
            </div>
            <div className="floating-input relative w-full" data-placeholder="Confirm Password *">
              <input
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder=" "
                onChange={handleInputChange}
                className={`input-field peer pr-10 ${errors.confirmPassword ? "input-error" : ""}`}
                value={formData.confirmPassword}
                autoComplete="off"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-3 right-3 cursor-pointer text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
              {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
            </div>
          </div>
          <div className="text-xs text-gray-600">Include Capital Letters, Numbers, and Special Characters</div>
          <label className="flex items-start">
            <div className="flex items-center">
              <input
                type="checkbox"
                name={userType === "doctor" ? "roleSpecificData.agreeDeclaration" : "agreeDeclaration"}
                checked={userType === "doctor" ? formData.roleSpecificData.agreeDeclaration : formData.agreeDeclaration}
                onChange={(e) => {
                  const checked = e.target.checked;
                  if (userType === "doctor") {
                    setFormData(prev => ({
                      ...prev,
                      roleSpecificData: { ...prev.roleSpecificData, agreeDeclaration: checked }
                    }));
                  } else {
                    setFormData(prev => ({ ...prev, agreeDeclaration: checked }));
                  }
                  setErrors(prev => ({ ...prev, agreeDeclaration: "" }));
                }}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 ml-2">
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => navigate("/terms-and-conditions")}
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  declaration / Privacy Policy
                </button>{" "}
                *
              </span>
            </div>
          </label>
          {errors.agreeDeclaration && <p className="error-text">{errors.agreeDeclaration}</p>}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className={`btn btn-primary w-full md:w-auto ${(isSubmitting || loading) ? 'btn-disabled' : ''}`}
            >
              {isSubmitting || loading ? "Submitting..." : "Verify & Proceed"}
            </button>
          </div>
          {(error || errors.global) && <p className="text-red-600 text-center mt-2">{error || errors.global}</p>}
          <div className="text-center mt-4 text-blue-900">
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-semibold hover:opacity-80 transition-opacity"
                style={{color: 'var(--accent-color)'}}
              >
                Login Here
              </button>
            </p>
          </div>
        </form>
        {isModalOpen && photoPreview && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded shadow-lg relative max-w-2xl max-h-[80vh] overflow-auto">
              <img src={photoPreview} alt="Preview" className="max-h-[60vh] max-w-full object-contain" />
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterForm;