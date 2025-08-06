

import React, { useState, useRef, useEffect } from 'react';
import { Pill, Save, Printer, Plus, Trash2, Edit, Check, X, Camera, Share2, Phone, Mail, Globe, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const defaultMedicine = {
  drugName: '',
  form: '',
  strength: '',
  dosage: 1,
  dosageUnit: 'Tablet',
  frequency: '',
  intake: 'Before Food',
  duration: 1,
};

const frequencyOptions = [
  'once a day',
  'twice a day',
  'three times a day',
  'every 6 hours',
  'every 8 hours',
];

const intakeOptions = ['Before Food', 'After Food'];

const localDrugList = [
  { id: 1, name: 'Dolo 650', strength: '650mg', form: 'Tablet' },
  { id: 2, name: 'Paracetamol', strength: '500mg', form: 'Tablet' },
  { id: 3, name: 'Ibuprofen', strength: '400mg', form: 'Tablet' },
  // ...add more medicines as needed
];

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

const PrescriptionForm = ({
  data,
  onSave,
  onPrint,
  patient,
  patientName,
  gender,
  age,
  email: propEmail,
  phone: propPhone,
  address,
  showShareModal,
  setShowShareModal,
}) => {
  const [prescriptions, setPrescriptions] = useState(
    data?.prescriptions || [{ ...defaultMedicine }]
  );
  const [drugSuggestions, setDrugSuggestions] = useState([]);
  const [activeInputIndex, setActiveInputIndex] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [prescriptionId, setPrescriptionId] = useState(data?.id || null);
  const [isEdit, setIsEdit] = useState(true);

  // Camera and Share functionality states
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [language, setLanguage] = useState('English');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [videoReady, setVideoReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedData, setTranslatedData] = useState({});

  // For medical report photo
  const [showReportCamera, setShowReportCamera] = useState(false);
  const [reportVideoReady, setReportVideoReady] = useState(false);
  const [reportCameraError, setReportCameraError] = useState('');
  const [reportImage, setReportImage] = useState(null);
  const reportVideoRef = useRef(null);
  const reportCanvasRef = useRef(null);
  const reportStreamRef = useRef(null);

  // Internal share modal state
  const [internalShowShareModal, setInternalShowShareModal] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Set email and phone from props/patient on mount or when patient changes
  useEffect(() => {
    setEmail(
      propEmail ||
      patient?.email ||
      ''
    );
    setPhone(
      propPhone ||
      patient?.phone ||
      patient?.mobileNo ||
      ''
    );
  }, [propEmail, propPhone, patient]);

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

  // Translate prescription data
  const translatePrescriptionData = async (targetLang) => {
    if (targetLang === 'en') {
      setTranslatedData({});
      return;
    }
    setIsTranslating(true);
    const translated = {};
    const translatedPrescriptions = await Promise.all(
      prescriptions.map(async (med) => {
        const translatedMed = {};
        for (const [key, value] of Object.entries(med)) {
          if (value && typeof value === 'string' && key !== 'dosage' && key !== 'duration') {
            translatedMed[key] = await translateText(value, targetLang);
          } else {
            translatedMed[key] = value;
          }
        }
        return translatedMed;
      })
    );
    translated.prescriptions = translatedPrescriptions;
    setTranslatedData(translated);
    setIsTranslating(false);
  };

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    const langCode = languageMap[newLanguage];
    translatePrescriptionData(langCode);
  };

  // Get display data (translated or original)
  const getDisplayPrescriptions = () => {
    if (language === 'English' || !translatedData.prescriptions) {
      return prescriptions;
    }
    return translatedData.prescriptions;
  };

  const handleChange = (i, field, val) => {
    setPrescriptions((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, [field]: val } : p))
    );
  };

  const addPrescription = () => {
    setPrescriptions((prev) => [...prev, { ...defaultMedicine }]);
  };

  const removePrescription = (i) => {
    setPrescriptions((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSave = async () => {
    try {
      const res = await axios.post(
        'https://684ac997165d05c5d35a5118.mockapi.io/digitalprescription',
        {
          prescriptions,
          date: new Date().toLocaleDateString(),
        }
      );
      setIsSaved(true);
      setPrescriptionId(res.data.id);
      setIsEdit(false);
      if (onSave) onSave('prescription', { prescriptions });
      toast.success('Prescription saved successfully!', {
        position: 'top-right',
        autoClose: 2000,
      });
    } catch (err) {
      toast.error('Failed to save prescription!', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `https://684ac997165d05c5d35a5118.mockapi.io/digitalprescription/${prescriptionId}`,
        {
          prescriptions,
          date: new Date().toLocaleDateString(),
        }
      );
      setIsEdit(false);
      if (onSave) onSave('prescription', { prescriptions });
      toast.success('Prescription updated successfully!', {
        position: 'top-right',
        autoClose: 2000,
      });
    } catch (err) {
      toast.error('Failed to update prescription!', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const fetchDrugSuggestions = async (q) => {
    if (q.length < 2) return setDrugSuggestions([]);
    try {
      const res = await axios.get(
        'https://mocki.io/v1/efc542df-dc4c-4b06-9e5b-32567facef11'
      );
      const drugs = res.data.length ? res.data : localDrugList;
      setDrugSuggestions(
        drugs.filter((drug) =>
          drug.name.toLowerCase().includes(q.toLowerCase())
        )
      );
    } catch (err) {
      setDrugSuggestions(
        localDrugList.filter((drug) =>
          drug.name.toLowerCase().includes(q.toLowerCase())
        )
      );
    }
  };

  // Camera functionality
  const startCamera = async () => {
    setCameraError('');
    setVideoReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          aspectRatio: 16 / 9
        }
      });
      streamRef.current = stream;
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setVideoReady(true);
          };
        }
      }, 100);
    } catch (error) {
      setCameraError('Unable to access camera. Please allow camera permissions and try again.');
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && video.videoWidth > 0 && video.videoHeight > 0) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageDataUrl);
      stopCamera();
      setTimeout(() => {
        setInternalShowShareModal(true);
      }, 500);
    } else {
      setCameraError('Camera not ready. Please wait a moment and try again.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  // For medical report photo
  const startReportCamera = async () => {
    setReportCameraError('');
    setReportVideoReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      reportStreamRef.current = stream;
      setShowReportCamera(true);
      setTimeout(() => {
        if (reportVideoRef.current) {
          reportVideoRef.current.srcObject = stream;
          reportVideoRef.current.onloadedmetadata = () => {
            reportVideoRef.current.play();
            setReportVideoReady(true);
          };
        }
      }, 100);
    } catch (error) {
      setReportCameraError('Unable to access camera. Please allow camera permissions and try again.');
      setShowReportCamera(false);
    }
  };

  const captureReportPhoto = () => {
    const video = reportVideoRef.current;
    const canvas = reportCanvasRef.current;
    if (video && canvas && video.videoWidth > 0 && video.videoHeight > 0) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setReportImage(imageDataUrl);
      stopReportCamera();
    } else {
      setReportCameraError('Camera not ready. Please wait a moment and try again.');
    }
  };

  const stopReportCamera = () => {
    if (reportStreamRef.current) {
      reportStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setShowReportCamera(false);
  };

  const generateWhatsAppMessage = () => {
    const displayPrescriptions = getDisplayPrescriptions();
    let message = `*Prescription from AV Hospital*\n`;
    message += `*Patient:* ${patientName || patient?.name || patient?.patientName || '---'}\n`;
    message += `*Date:* ${new Date().toLocaleDateString()}\n\n`;
    message += `*Prescribed Medicines:*\n`;

    displayPrescriptions.forEach((med, index) => {
      message += `${index + 1}. *${med.drugName || 'Medicine'}*\n`;
      message += `   Dosage: ${med.dosage} ${med.dosageUnit || 'Tablet'}\n`;
      message += `   Frequency: ${med.frequency || 'As directed'}\n`;
      message += `   Intake: ${med.intake}\n`;
      message += `   Duration: ${med.duration} days\n\n`;
    });

    return encodeURIComponent(message);
  };

  const whatsappLink = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${generateWhatsAppMessage()}`;

  // Use internal state or external prop
  const isShareModalOpen = internalShowShareModal || showShareModal;

  const closeShareModal = () => {
    setInternalShowShareModal(false);
    if (setShowShareModal) {
      setShowShareModal(false);
    }
  };

  const openShareModal = () => {
    setInternalShowShareModal(true);
    if (setShowShareModal) {
      setShowShareModal(true);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-slideIn">
        <div className="sub-heading px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Pill className="text-xl text-white" />
            <h3 className="text-white font-semibold">Prescription</h3>
          </div>
          <div className="flex items-center gap-3 text-white">
            <button
              onClick={startCamera}
              className="hover:bg-[var(--primary-color)] hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              title="Take Patient Photo"
            >
              <Camera className="w-5 h-5" />
            </button>
            <button
              onClick={startReportCamera}
              className="hover:bg-[var(--primary-color)] hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              title="Add Medical Report"
            >
              <FileText className="w-5 h-5" />
            </button>
            <button
              onClick={openShareModal}
              className="hover:bg-[var(--primary-color)] hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              title="Share Prescription"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => onPrint && onPrint('prescription')}
              className="hover:bg-[var(--primary-color)] hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <Printer className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {(capturedImage || reportImage) && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-sm font-semibold text-[#0E1630] mb-4">Attached Documents</h3>
              <div className="flex gap-6">
                {capturedImage && (
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-2">Patient Photo</p>
                    <img
                      src={capturedImage}
                      alt="Patient"
                      className="w-20 h-20 object-cover rounded border"
                    />
                    <button
                      onClick={() => setCapturedImage(null)}
                      className="text-xs text-red-600 hover:text-red-800 mt-1"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {reportImage && (
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-2">Medical Report</p>
                    <img
                      src={reportImage}
                      alt="Medical Report"
                      className="w-20 h-20 object-cover rounded border"
                    />
                    <button
                      onClick={() => setReportImage(null)}
                      className="text-xs text-red-600 hover:text-red-800 mt-1"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="rounded-lg p-6 mb-8 bg-white text-black">
            <table className="w-full border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-3 py-2">Medicine</th>
                  <th className="px-3 py-2">Dosage</th>
                  <th className="px-3 py-2">Frequency</th>
                  <th className="px-3 py-2">Intake</th>
                  <th className="px-3 py-2">Duration</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((med, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2 relative">
                      <input
                        type="text"
                        className="border-gray-300 shadow-sm rounded p-2 w-full"
                        placeholder="Search Drug..."
                        value={med.drugName}
                        onChange={(e) => {
                          handleChange(i, 'drugName', e.target.value);
                          fetchDrugSuggestions(e.target.value);
                          setActiveInputIndex(i);
                        }}
                        onFocus={() => setActiveInputIndex(i)}
                        onBlur={() =>
                          setTimeout(() => setDrugSuggestions([]), 200)
                        }
                        disabled={!isEdit}
                      />
                      {activeInputIndex === i && drugSuggestions.length > 0 && (
                        <ul className="absolute bg-white border z-10 rounded w-full shadow max-h-48 overflow-y-auto mt-1 text-sm">
                          {drugSuggestions.map((drug) => (
                            <li
                              key={drug.id}
                              onClick={() => {
                                handleChange(i, 'drugName', drug.name);
                                handleChange(i, 'form', drug.form || '');
                                handleChange(i, 'strength', drug.strength || '');
                                setDrugSuggestions([]);
                              }}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            >
                              {drug.name} ({drug.strength}, {drug.form})
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        className="border-gray-300 shadow-sm rounded p-2 w-20"
                        placeholder="Dosage"
                        min="1"
                        value={med.dosage}
                        onChange={(e) =>
                          handleChange(i, 'dosage', e.target.value)
                        }
                        disabled={!isEdit}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        className="border-gray-300 shadow-sm border rounded p-2"
                        value={med.frequency}
                        onChange={(e) =>
                          handleChange(i, 'frequency', e.target.value)
                        }
                        disabled={!isEdit}
                      >
                        <option value="">Frequency</option>
                        {frequencyOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        className="border-gray-300 shadow-sm rounded p-2 w-30"
                        value={med.intake}
                        onChange={(e) =>
                          handleChange(i, 'intake', e.target.value)
                        }
                        disabled={!isEdit}
                      >
                        {intakeOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        className="border-gray-300 shadow-sm rounded p-2 w-20"
                        placeholder="Duration"
                        min="1"
                        value={med.duration}
                        onChange={(e) =>
                          handleChange(i, 'duration', e.target.value)
                        }
                        disabled={!isEdit}
                      />
                    </td>
                    <td className="px-3 py-2">
                      {isEdit && (
                        <button
                          onClick={() => removePrescription(i)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {isEdit && (
              <div className="mt-4">
                <button
                  onClick={addPrescription}
                  className="btn btn-primary text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Medicine
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6 justify-end">
            {!isSaved ? (
              <button onClick={handleSave} className="btn btn-primary text-sm">
                <Save className="w-4 h-4" />
                Save
              </button>
            ) : isEdit ? (
              <>
                <button
                  onClick={handleUpdate}
                  className="btn btn-primary text-sm"
                >
                  <Check className="w-4 h-4" />
                  Update
                </button>
                <button
                  onClick={() => setIsEdit(false)}
                  className="btn-secondary text-sm"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEdit(true)}
                className="btn btn-primary text-sm"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Hidden canvases */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <canvas ref={reportCanvasRef} style={{ display: 'none' }} />
      </div>

      {/* Camera Modals - These are now outside the main container */}
      {showCamera && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4 ">
              <h3 className="text-lg font-semibold text-[#0E1630]">Take Patient Photo</h3>
              <button onClick={stopCamera} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg mb-4"
              style={{ maxHeight: '300px', objectFit: 'cover' }}
              onCanPlay={() => setVideoReady(true)}
            />
            {cameraError && (
              <p className="text-red-600 text-sm mb-4">{cameraError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={capturePhoto}
                disabled={!videoReady}
                className="flex-1 bg-gradient-to-r from-[#01D48C] to-[#0E1630] text-white py-2 px-4 rounded-lg disabled:opacity-50"
              >
                Capture Photo
              </button>
              <button
                onClick={stopCamera}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showReportCamera && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#0E1630]">Capture Medical Report</h3>
              <button onClick={stopReportCamera} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <video
              ref={reportVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg mb-4"
              style={{ maxHeight: '300px', objectFit: 'cover' }}
              onCanPlay={() => setReportVideoReady(true)}
            />
            {reportCameraError && (
              <p className="text-red-600 text-sm mb-4">{reportCameraError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={captureReportPhoto}
                disabled={!reportVideoReady}
                className="flex-1 bg-gradient-to-r from-[#01D48C] to-[#0E1630] text-white py-2 px-4 rounded-lg disabled:opacity-50"
              >
                Capture Report
              </button>
              <button
                onClick={stopReportCamera}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
     {isShareModalOpen && (
  <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 bg-opacity-50">
    <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-[#01D48C] to-[#0E1630] text-white">
        <h3 className="text-xl font-semibold ">Prescription Preview</h3>
        <button onClick={closeShareModal} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* LEFT SIDE */}
        <div className="p-4  rounded-lg  flex flex-col items-center">
          {capturedImage || reportImage ? (
            <>
              <h3 className="text-sm font-semibold text-[#0E1630] mb-4">Attached Documents</h3>
              <div className="flex flex-col gap-6 items-center">
                {capturedImage && (
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-2">Patient Photo</p>
                    <img
                      src={capturedImage}
                      alt="Patient"
                      className="w-40 h-40 object-cover rounded border"
                    />
                    <button
                      onClick={() => setCapturedImage(null)}
                      className="text-xs text-red-600 hover:text-red-800 mt-1"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {reportImage && (
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-2">Medical Report</p>
                    <img
                      src={reportImage}
                      alt="Medical Report"
                      className="w-40 h-40 object-cover rounded border"
                    />
                    <button
                      onClick={() => setReportImage(null)}
                      className="text-xs text-red-600 hover:text-red-800 mt-1"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
             // Replace your prescription preview div with this code for the image-like UI

<div
  className="bg-white border border-[#222] rounded-lg shadow-lg overflow-hidden p-8"
  style={{ fontFamily: "Arial, Helvetica, sans-serif", minWidth: 350, maxWidth: 700, margin: "auto" }}
>
  {/* Header */}
  <div className="flex justify-between items-start mb-2">
    <div>
      <h2 className="text-xl font-bold text-[#0E1630] mb-1">Dr. Sheetal S. Shelke</h2>
      <div className="text-xs text-gray-700 leading-tight">
        <div>MBBS, MD</div>
        <div>Neurologist</div>
      </div>
    </div>
    <img src="/logo.png" alt="AV Swasthya" className="h-10 w-auto" />
  </div>

  {/* Patient Info */}
  <div className="bg-gray-100 rounded px-4 py-2 mb-4 flex flex-wrap gap-4 items-center text-sm">
    <span>
      <b>Name:</b> {patientName || patient?.name || patient?.patientName || "N/A"}
    </span>
    <span>
      <b>Age:</b> {age || patient?.age || "N/A"}
    </span>
    <span>
      <b>Gender:</b> {gender || patient?.gender || patient?.sex || "N/A"}
    </span>
    <span>
      <b>Contact:</b> {phone || patient?.phone || patient?.mobileNo || "N/A"}
    </span>
  </div>

  {/* Prescription Table */}
  <div className="mb-4">
    <div className="text-[#0E1630] font-semibold mb-2">Prescription</div>
    <table className="w-full border border-gray-300 text-sm">
      <thead>
        <tr className="bg-gray-100">
          <th className="border border-gray-300 px-2 py-1">Medicine</th>
          <th className="border border-gray-300 px-2 py-1">Dosage</th>
          <th className="border border-gray-300 px-2 py-1">Frequency</th>
          <th className="border border-gray-300 px-2 py-1">Intake</th>
          <th className="border border-gray-300 px-2 py-1">Duration</th>
        </tr>
      </thead>
      <tbody>
        {getDisplayPrescriptions().map((med, index) => (
          <tr key={index}>
            <td className="border border-gray-300 px-2 py-1">{med.drugName || "-"}</td>
            <td className="border border-gray-300 px-2 py-1">{med.dosage || "-"} {med.dosageUnit || ""}</td>
            <td className="border border-gray-300 px-2 py-1">{med.frequency || "-"}</td>
            <td className="border border-gray-300 px-2 py-1">{med.intake || "-"}</td>
            <td className="border border-gray-300 px-2 py-1">{med.duration ? `${med.duration} day(s)` : "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Footer */}
  <div className="flex justify-between items-end border-t pt-4 mt-6">
    <div className="flex items-center gap-2">
      <img src="/logo.png" alt="AV Swasthya" className="h-10 w-auto" />
      <div className="text-xs text-gray-700">
        Dharwad, Karnataka, 580001<br />
        +12-345 678 9012
      </div>
    </div>
    <div className="text-xs text-gray-700 text-right" style={{ minWidth: 160 }}>
      <div className="border-b border-gray-400 mb-1"></div>
      Doctor's Signature
    </div>
  </div>
</div>
          )}
        </div>

        {/* RIGHT SIDE: Sharing Options */}
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-[#0E1630]">Share Options</h4>

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
              <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                Translating content...
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter patient's email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#01D48C]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter WhatsApp number"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#01D48C]"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={phone ? whatsappLink : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                phone ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none'
              }`}
            >
              <Phone size={16} /> WhatsApp
            </a>
            <button
              disabled={!email}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                email ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Mail size={16} /> Email
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              <Printer size={16} /> Print
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

    </>
  );
};

export default PrescriptionForm;