

import React, { useState, useRef, useEffect } from 'react';
import { Share2, Printer, Mail, Phone, Camera, X, FileText, Globe } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { openWhatsAppChat, formatPhoneNumber, sendWhatsAppMessage, generateWhatsAppMessage } from './whatsappAPI';

const MedicalRecordsTemplate = ({ patientData }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const medicalRecordRef = useRef(null);

  // Add navigation state support for patientName, etc.
  const navState = location.state || {};

  // Extract all patient data from navigation state with proper fallbacks
  const extractedPatientData = {
    patientName: navState.patientName || navState.name || params.get('name') || '',
    email: navState.email || params.get('email') || patientData?.email || '',
    phone: navState.phone || navState.mobileNo || params.get('phone') || patientData?.phone || patientData?.mobileNo || '',
    gender: navState.gender || navState.sex || params.get('gender') || '',
    temporaryAddress: navState.temporaryAddress || navState.address || navState.addressTemp || '',
    address: navState.address || navState.temporaryAddress || navState.addressTemp || '',
    addressTemp: navState.addressTemp || navState.temporaryAddress || navState.address || '',
    dob: navState.dob || '',
    age: navState.age || '',
    bloodType: navState.bloodType || navState.bloodGroup || '',
    regNo: navState.regNo || '2025/072/0032722',
    mobileNo: navState.mobileNo || navState.phone || '',
    department: navState.department || 'Ophthalmology',
    patientType: navState.patientType || 'NON MLC',
    occupation: navState.occupation || 'OTHER',
    CMO: navState.CMO || '',
    consultant: navState.consultant || '',
    sex: navState.sex || navState.gender || ''
  };

  // If patientData is provided, use it as initial formData, else use query params or navState
  const [formData, setFormData] = useState(() => {
    if (patientData) {
      return {
        ...patientData,
        ...extractedPatientData,
        patientName: patientData.name || patientData.patientName || extractedPatientData.patientName,
        email: patientData.email || extractedPatientData.email,
        phone: patientData.phone || patientData.mobileNo || extractedPatientData.phone,
        gender: patientData.gender || patientData.sex || extractedPatientData.gender,
      };
    }
    return {
      chiefComplaint: '', pastHistory: '', initialAssessment: '',
      systematicExamination: '', investigations: '', treatmentAdvice: '',
      treatmentGiven: '', diagnosis: '', doctorsNotes: '',
      doctorName: '',
      ...extractedPatientData
    };
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      ...(patientData || {}),
      ...extractedPatientData,
      patientName: (patientData && (patientData.name || patientData.patientName)) || extractedPatientData.patientName || prev.patientName,
      email: (patientData && patientData.email) || extractedPatientData.email || prev.email,
      phone: (patientData && (patientData.phone || patientData.mobileNo)) || extractedPatientData.phone || prev.phone,
      gender: (patientData && (patientData.gender || patientData.sex)) || extractedPatientData.gender || prev.gender,
    }));
  }, [patientData, extractedPatientData]);

  // State variables
  const [translatedData, setTranslatedData] = useState({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAssessmentCamera, setShowAssessmentCamera] = useState(false);
  const [assessmentImages, setAssessmentImages] = useState([]);
  const [language, setLanguage] = useState('English');
  const [email, setEmail] = useState(() => {
    return (patientData && patientData.email) || 
           extractedPatientData.email || 
           navState.email || 
           '';
  });
  const [phone, setPhone] = useState(() => {
    return (patientData && (patientData.phone || patientData.mobileNo)) || 
           extractedPatientData.phone || 
           navState.phone || 
           navState.mobileNo || 
           '';
  });
  
  // Auto-format phone number when it changes
  useEffect(() => {
    if (phone) {
      const formatted = formatPhoneNumber(phone);
      if (formatted !== phone) {
        setPhone(formatted);
      }
    }
  }, []);

  const [assessmentVideoReady, setAssessmentVideoReady] = useState(false);
  const [assessmentCameraError, setAssessmentCameraError] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  // Camera refs for assessment papers
  const assessmentVideoRef = useRef(null);
  const assessmentCanvasRef = useRef(null);
  const assessmentStreamRef = useRef(null);

  // Language mapping for Google Translate API
  const languageMap = {
    'English': 'en',
    'Hindi': 'hi',
    'Marathi': 'mr',
    'Gujarati': 'gu',
    'Tamil': 'ta',
    'Telugu': 'te',
    'Bengali': 'bn',
    'Kannada': 'kn',
    'Malayalam': 'ml',
    'Punjabi': 'pa'
  };

  // Translation function using Google Translate API
  const translateText = async (text, targetLang) => {
    if (!text || targetLang === 'en') return text;
    try {
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
      const data = await response.json();
      return data.responseData.translatedText || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  // Translate all form data
  const translateFormData = async (targetLang) => {
    if (targetLang === 'en') {
      setTranslatedData({});
      return;
    }
    setIsTranslating(true);
    const translated = {};
    for (const [key, value] of Object.entries(formData)) {
      if (value && typeof value === 'string') {
        translated[key] = await translateText(value, targetLang);
      }
    }
    setTranslatedData(translated);
    setIsTranslating(false);
  };

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    const langCode = languageMap[newLanguage];
    translateFormData(langCode);
  };

  // Get display data (translated or original)
  const getDisplayData = () => {
    if (language === 'English' || Object.keys(translatedData).length === 0) {
      return formData;
    }
    return { ...formData, ...translatedData };
  };

  const renderInput = (label, name, rows = 1) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-[#0E1630] mb-2">{label}</label>
      {rows === 1 ? (
        <input
          type="text"
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01D48C] focus:border-transparent bg-white"
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      ) : (
        <textarea
          name={name}
          value={formData[name]}
          onChange={handleChange}
          rows={rows}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01D48C] focus:border-transparent bg-white resize-none"
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      )}
    </div>
  );

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleShare = (e) => {
    e.preventDefault();
    setShowShareModal(true);
  };

  // Assessment paper camera functions
  const startAssessmentCamera = async () => {
    setAssessmentCameraError('');
    setAssessmentVideoReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera for documents
          width: { ideal: 1920, max: 4096 },
          height: { ideal: 1080, max: 2160 },
          aspectRatio: 16 / 9
        }
      });
      assessmentStreamRef.current = stream;
      setShowAssessmentCamera(true);
      setTimeout(() => {
        if (assessmentVideoRef.current) {
          assessmentVideoRef.current.srcObject = stream;
          assessmentVideoRef.current.onloadedmetadata = () => {
            assessmentVideoRef.current.play();
            setAssessmentVideoReady(true);
          };
        }
      }, 100);
    } catch (error) {
      setAssessmentCameraError('Unable to access camera. Please allow camera permissions and try again.');
      setShowAssessmentCamera(false);
    }
  };

  const captureAssessmentPhoto = () => {
    const video = assessmentVideoRef.current;
    const canvas = assessmentCanvasRef.current;
    if (video && canvas && video.videoWidth > 0 && video.videoHeight > 0) {
      const context = canvas.getContext('2d');
      
      // Set canvas to A4 aspect ratio (210:297 ≈ 0.707)
      const aspectRatio = 210 / 297; // A4 aspect ratio
      const videoAspectRatio = video.videoWidth / video.videoHeight;
      
      let sourceWidth, sourceHeight, sourceX, sourceY;
      
      if (videoAspectRatio > aspectRatio) {
        // Video is wider than A4, crop horizontally
        sourceHeight = video.videoHeight;
        sourceWidth = sourceHeight * aspectRatio;
        sourceX = (video.videoWidth - sourceWidth) / 2;
        sourceY = 0;
      } else {
        // Video is taller than A4, crop vertically
        sourceWidth = video.videoWidth;
        sourceHeight = sourceWidth / aspectRatio;
        sourceX = 0;
        sourceY = (video.videoHeight - sourceHeight) / 2;
      }
      
      // Set canvas dimensions to maintain A4 aspect ratio
      const canvasWidth = 800; // Fixed width
      const canvasHeight = canvasWidth / aspectRatio;
      
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      // Draw the cropped video frame to canvas
      context.drawImage(
        video,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, canvasWidth, canvasHeight
      );
      
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      // Add the new image to the array
      setAssessmentImages(prev => [...prev, {
        id: Date.now(),
        dataUrl: imageDataUrl,
        timestamp: new Date().toLocaleString()
      }]);
      
      stopAssessmentCamera();
      
      // Show success message briefly
      setAssessmentCameraError('');
      setTimeout(() => {
        setShowShareModal(true);
      }, 500);
    } else {
      setAssessmentCameraError('Camera not ready. Please wait a moment and try again.');
    }
  };

  const stopAssessmentCamera = () => {
    if (assessmentStreamRef.current) {
      assessmentStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setShowAssessmentCamera(false);
  };

  const retakeAssessmentPhoto = () => {
    startAssessmentCamera();
  };

  const removeAssessmentImage = (imageId) => {
    setAssessmentImages(prev => prev.filter(img => img.id !== imageId));
  };

  const generateWhatsAppMessage = () => {
    const displayData = getDisplayData();
    const { patientName, gender, doctorName } = displayData;
    let message = `*AV Hospital Medical Record*\n`;
    message += `*Patient:* ${patientName || '---'}\n`;
    message += `*Gender:* ${gender || '---'}\n`;
    message += `*Doctor:* ${doctorName || '---'}\n`;
    message += `*Date:* ${new Date().toLocaleDateString()}\n\n`;

    for (let key in displayData) {
      if (!['patientName', 'gender', 'doctorName'].includes(key)) {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
        const value = displayData[key] || 'Not provided';
        message += `*${label}:* ${value}\n`;
      }
    }

    return encodeURIComponent(message);
  };

  const handleWhatsAppClick = () => {
    const phoneValue = formatPhoneNumber(phone);
    if (phoneValue && phoneValue.trim()) {
      // Generate message with medical record data
      const message = generateWhatsAppMessage(patientData || formData, getDisplayData());
      sendWhatsAppMessage(phoneValue, message);
    } else {
      alert('Please enter a WhatsApp number first');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Hospital Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          {/* Hospital Letterhead */}
          <div className="bg-gradient-to-r from-[#01D48C] to-[#0E1630] text-white px-8 py-6 rounded-t-lg">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold mb-1">Initial Assessment</h1>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={startAssessmentCamera}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  title="Capture Initial Assessment Paper"
                >
                  <FileText size={18} />
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  title="Share Record"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Medical Record Form */}
          <div className="p-8">
            {/* Assessment Images Display */}
            {assessmentImages.length > 0 && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
                <h3 className="text-sm font-semibold text-[#0E1630] mb-4">Initial Assessment Papers</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {assessmentImages.map((image, index) => (
                    <div key={image.id} className="text-center">
                      <p className="text-xs text-gray-600 mb-2">Paper {index + 1}</p>
                      <div className="relative">
                        <img
                          src={image.dataUrl}
                          alt={`Assessment Paper ${index + 1}`}
                          className="w-full h-auto object-cover rounded border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                          style={{ aspectRatio: '210/297' }} // A4 aspect ratio
                          onClick={() => {
                            // Open image in new tab for full view
                            const newWindow = window.open();
                            newWindow.document.write(`<img src="${image.dataUrl}" style="max-width:100%;height:auto;" />`);
                          }}
                        />
                      </div>
                      <div className="mt-2 flex gap-2 justify-center">
                        <button
                          onClick={retakeAssessmentPhoto}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                        >
                          Retake
                        </button>
                        <button
                          onClick={() => removeAssessmentImage(image.id)}
                          className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleShare} className="space-y-8">
              {/* Clinical Assessment */}
              <div className="border-l-4 border-[#01D48C] pl-4">
                <h3 className="text-lg font-semibold text-[#0E1630] mb-4">Clinical Assessment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput('Chief Complaint', 'chiefComplaint', 2)}
                  {renderInput('Past Medical History', 'pastHistory', 2)}
                  {renderInput('Initial Assessment', 'initialAssessment', 2)}
                  {renderInput('Systematic Examination', 'systematicExamination', 2)}
                </div>
              </div>

              {/* Investigations & Treatment */}
              <div className="border-l-4 border-[#01D48C] pl-4">
                <h3 className="text-lg font-semibold text-[#0E1630] mb-4">Investigations & Treatment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput('Investigations Ordered', 'investigations', 2)}
                  {renderInput('Treatment Advice', 'treatmentAdvice', 2)}
                  {renderInput('Treatment Given', 'treatmentGiven', 2)}
                  {renderInput('Diagnosis', 'diagnosis', 2)}
                </div>
              </div>

              {/* Doctor's Notes */}
              <div className="border-l-4 border-[#01D48C] pl-4">
                <h3 className="text-lg font-semibold text-[#0E1630] mb-4">Doctor's Notes</h3>
                {renderInput("Additional Notes & Observations", 'doctorsNotes', 3)}
              </div>
            </form>
          </div>
        </div>

        {/* Assessment Camera Modal */}
        {showAssessmentCamera && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <div className="bg-white rounded-lg shadow-xl p-4 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-[#0E1630]">Capture Assessment Paper</h3>
                <button onClick={stopAssessmentCamera} className="text-gray-500 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>
              <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  📄 Position the assessment paper clearly in the rectangular frame. Ensure good lighting and the entire document is visible.
                </p>
              </div>
              
              {/* A4 Rectangular Video Container */}
              <div className="relative mx-auto mb-4" style={{ maxWidth: '300px' }}>
                <div 
                  className="relative overflow-hidden rounded-lg border-4 border-blue-500 shadow-lg"
                  style={{ aspectRatio: '210/297' }} // A4 aspect ratio
                >
                  <video
                    ref={assessmentVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    onCanPlay={() => setAssessmentVideoReady(true)}
                  />
                  
                  {/* Overlay guide lines */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Corner guides */}
                    <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-white opacity-70"></div>
                    <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-white opacity-70"></div>
                    <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-white opacity-70"></div>
                    <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-white opacity-70"></div>
                    
                    {/* Center guide */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-6 h-6 border-2 border-white rounded-full opacity-50"></div>
                    </div>
                  </div>
                  
                  {/* Document frame indicator */}
                  <div className="absolute inset-2 border-2 border-dashed border-white opacity-30 rounded"></div>
                </div>
                
                {/* A4 size indicator */}
                <div className="text-center mt-2">
                  <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded shadow">
                    📄 A4 Document Frame
                  </span>
                </div>
              </div>
              
              {assessmentCameraError && (
                <p className="text-red-600 text-sm mb-4">{assessmentCameraError}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={captureAssessmentPhoto}
                  disabled={!assessmentVideoReady}
                  className="flex-1 bg-gradient-to-r from-[#01D48C] to-[#0E1630] text-white py-2 px-3 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  <Camera size={16} />
                  Capture Paper
                </button>
                <button
                  onClick={stopAssessmentCamera}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-50">
            <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-[#01D48C] to-[#0E1630] text-white">
                <h3 className="text-xl font-semibold">Medical Record Preview</h3>
                <button onClick={() => setShowShareModal(false)} className="text-white hover:text-gray-200">
                  <X size={24} />
                </button>
              </div>

              {/* Body Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                {/* LEFT COLUMN - Medical Record Preview */}
                <div>
                  <div 
                    ref={medicalRecordRef}
                    className="bg-white border-1 border-gray-400 rounded-lg shadow-lg overflow-hidden text-xs" 
                    style={{ fontFamily: 'Times, serif' }}
                  >
                    {/* Show captured images if available, otherwise show form data */}
                    {assessmentImages.length > 0 ? (
                      // Display captured assessment papers
                      <div className="p-4">
                        <div className="border-b-2 border-black pb-4 mb-4">
                          <div className="text-center">
                            <h2 className="text-lg font-bold">District Hospital Dharwad Karnataka</h2>
                            <p className="text-sm">Govt of Karnataka - Initial Assessment Papers</p>
                          </div>
                        </div>
                        
                        <div className="space-y-6">
                          {assessmentImages.map((image, index) => (
                            <div key={image.id} className="text-center">
                              <h4 className="text-sm font-semibold mb-2">Assessment Paper {index + 1}</h4>
                              <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                                <img
                                  src={image.dataUrl}
                                  alt={`Assessment Paper ${index + 1}`}
                                  className="w-full h-auto"
                                  style={{ aspectRatio: '210/297' }} // Maintain A4 aspect ratio
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-2">Captured: {image.timestamp}</p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-6 pt-4 border-t-2 border-gray-400">
                          <div className="text-right">
                            <p className="mb-8"><strong></strong></p>
                            <p>Dr. Shital S Shelke</p>
                            <p><strong>Signature </strong></p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Display form data when no images are captured
                      <>
                        <div className="border-b-2 border-black p-4">
                          <div className="text-center">
                            <h2 className="text-lg font-bold">District Hospital Dharwad Karnataka</h2>
                            <p className="text-sm">Govt of Karnataka</p>
                          </div>
                          <div className="border border-1 border-gray-400 rounded-lg p-2 mt-4 grid grid-cols-2 gap-4">
                            <div className="space-y-1 text-left">
                              {(() => {
                                const safeData = getDisplayData();
                                const current = patientData || navState || {};
                                const name = safeData.patientName || safeData.name || current.patientName || '[No Name]';
                                const gender = safeData.gender || current.gender || safeData.sex || '[No Gender]';
                                const regNo = safeData.regNo || current.regNo || '2025/072/0032722';
                                const dob = safeData.dob || current.dob || '[No DOB]';
                                const age = safeData.age || current.age || safeData.youAge || '[No Age]';
                                const blood = safeData.bloodType || safeData.bloodGroup || current.bloodType || '[No Blood Type]';
                                const phone = safeData.phone || safeData.mobileNo || current.phone || '[No Phone]';
                                return (
                                  <>
                                    <p><strong>Name:</strong> {name}</p>
                                    <p><strong>Reg No:</strong> {regNo}</p>
                                    <p><strong>Date of Registration:</strong> {new Date().toLocaleDateString()}</p>
                                    <p><strong>DOB:</strong> {dob}</p>
                                    <p><strong>Age:</strong> {age}Y</p>
                                    <p><strong>Blood Type:</strong> {blood}</p>
                                    <p><strong>Phone:</strong> {phone}</p>
                                  </>
                                );
                              })()}
                            </div>
                            <div className="space-y-1">
                              <p><strong>Fee:</strong> 20.00</p>
                              <p><strong>Sex:</strong> {getDisplayData().gender || '[No Sex]'}</p>
                              <p><strong>W/O:</strong> {getDisplayData().CMO || 'SOMAYYA'}</p>
                              <p><strong>Consultant:</strong> {getDisplayData().consultant || 'Dr. [No Consultant]'}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Medical Notes */}
                        <div className="p-4 space-y-4">
                          <div>
                            <strong>Chief Complaint:</strong>
                            <p>{getDisplayData().chiefComplaint || '-'}</p>
                          </div>
                          <div>
                            <strong>Past Medical History:</strong>
                            <p>{getDisplayData().pastHistory || '-'}</p>
                          </div>
                          <div>
                            <strong>Initial Assessment:</strong>
                            <p>{getDisplayData().initialAssessment || '-'}</p>
                          </div>
                          <div>
                            <strong>Systematic Examination:</strong>
                            <p>{getDisplayData().systematicExamination || '-'}</p>
                          </div>
                          <div>
                            <strong>Investigations Ordered:</strong>
                            <p>{getDisplayData().investigations || '-'}</p>
                          </div>
                          <div>
                            <strong>Treatment Advice:</strong>
                            <p>{getDisplayData().treatmentAdvice || '-'}</p>
                          </div>
                          <div>
                            <strong>Treatment Given:</strong>
                            <p>{getDisplayData().treatmentGiven || '-'}</p>
                          </div>
                          <div>
                            <strong>Diagnosis:</strong>
                            <p>{getDisplayData().diagnosis || '-'}</p>
                          </div>
                          <div>
                            <strong>Additional Notes & Observations:</strong>
                            <p>{getDisplayData().doctorsNotes || '-'}</p>
                          </div>
                        </div>
                        
                        <div className="p-4 border-t-2 border-gray-400">
                          <div className="text-right">
                            <p className="mb-8"><strong></strong></p>
                            <p>Dr. Shital S Shelke</p>
                            <p><strong>Signature </strong></p>
                          </div>
                        </div>
                      </>
                    )}
                    
                    <div className="border-t border-gray-400 p-2 bg-gray-50 text-center">
                      <p className="text-xs" style={{ fontFamily: 'serif' }}>
                        "Any kind of monetary transaction is prohibited in this hospital. Please contact the superintendent for any issues."
                      </p>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN - Share Options */}
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-[#0E1630]">Share Options</h4>

                  {/* Language Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Globe size={16} />
                      Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#01D48C]"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">हिंदी (Hindi)</option>
                      <option value="Marathi">मराठी (Marathi)</option>
                      <option value="Gujarati">ગુજરાતી (Gujarati)</option>
                      <option value="Tamil">தமிழ் (Tamil)</option>
                      <option value="Telugu">తెలుగు (Telugu)</option>
                      <option value="Bengali">বাংলা (Bengali)</option>
                      <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                      <option value="Malayalam">മലയാളം (Malayalam)</option>
                      <option value="Punjabi">ਪੰਜਾਬੀ (Punjabi)</option>
                    </select>
                    {isTranslating && (
                      <p className="text-xs text-blue-600 mt-1 flex items-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                        Translating content...
                      </p>
                    )}
                  </div>

                  {/* Phone Number Input with Auto-formatting */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        setPhone(formatted);
                      }}
                      placeholder="Enter phone number (e.g., 9876543210)"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#01D48C]"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Phone number will be auto-formatted with +91 country code
                    </p>
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={email || formData.email || extractedPatientData.email || ''}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter patient's email"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#01D48C]"
                    />
                  </div>

                  {/* Traditional Share Buttons */}
                  <div className="grid grid-cols-3 gap-3 mt-6 text-center">
                    {/* WhatsApp */}
                    <button
                      onClick={handleWhatsAppClick}
                      disabled={!phone.trim()}
                      className="flex flex-col items-center p-3 rounded-lg border border-gray-300 text-center hover:bg-green-50 transition-transform duration-300 hover:scale-105 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                        alt="WhatsApp"
                        className="w-8 h-8 mb-1"
                      />
                      <span className="text-xs font-medium">WhatsApp</span>
                    </button>

                    {/* Email */}
                    <a
                      href={email ? `mailto:${email}?subject=Medical Record - ${getDisplayData().patientName || 'Patient'}&body=${generateWhatsAppMessage()}` : '#'}
                      className={`flex flex-col items-center p-3 rounded-lg border border-gray-300 text-center ${
                        email ? 'hover:bg-red-50' : 'opacity-50 pointer-events-none'
                      } transition-transform duration-300 hover:scale-105`}
                    >
                      <img
                        src="https://img.icons8.com/color/48/gmail--v1.png"
                        alt="Email"
                        className="w-8 h-8 mb-1"
                      />
                      <span className="text-xs font-medium">Email</span>
                    </a>

                    {/* Print */}
                    <button
                      onClick={() => window.print()}
                      className="flex flex-col items-center p-3 rounded-lg border border-gray-300 text-center hover:bg-gray-50 transition-transform duration-300 hover:scale-105"
                    >
                      <img
                        src="https://img.icons8.com/ios-filled/50/000000/print.png"
                        alt="Print"
                        className="w-8 h-8 mb-1"
                      />
                      <span className="text-xs font-medium">Print</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hidden canvas for image capture */}
        <canvas ref={assessmentCanvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default MedicalRecordsTemplate;