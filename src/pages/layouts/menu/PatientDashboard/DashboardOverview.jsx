import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaHeartbeat, FaThermometerHalf, FaTint, FaStethoscope, FaPlusCircle, FaCalendarAlt, FaClock, FaUserMd, FaChevronRight } from "react-icons/fa";
import { Activity, Droplets, Mic, MicOff } from "lucide-react";
import { useSelector } from "react-redux";
import ReusableModal from "../../../../components/microcomponents/Modal";


// Voice Input Hook and vital parsing utilities
const useVoiceInput = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "en-US";
      setRecognition(recognitionInstance);
      setIsSupported(true);
    }
  }, []);
  const startListening = () => {
    if (recognition && !isListening) {
      setTranscript("");
      recognition.start();
      setIsListening(true);
    }
  };
  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };
  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };
  const resetTranscript = () => setTranscript("");
  useEffect(() => {
    if (recognition) {
      recognition.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        }
        if (finalTranscript) setTranscript(finalTranscript);
      };
      recognition.onerror = (event) => {
        setIsListening(false);
      };
      recognition.onend = () => {
        setIsListening(false);
      };
    }
  }, [recognition]);
  return { isListening, transcript, startListening, stopListening, toggleListening, isSupported, resetTranscript };
};
const parseVitalFromSpeech = (transcript, vitalType) => {
  const text = transcript.toLowerCase().trim();
  const patterns = {
    heartRate: { regex: /(?:heart rate|pulse|bpm).*?(\d{2,3})/i, fallback: /(\d{2,3})\s*(?:bpm|beats)/i, simple: /^(\d{2,3})$/ },
    temperature: { regex: /(?:temperature|temp|fever).*?(\d{1,2}\.\d?)/i, fallback: /(\d{1,2}\.\d?)\s*(?:degrees|celsius|°c)/i, simple: /^(\d{1,2}\.\d?)$/ },
    bloodSugar: { regex: /(?:blood sugar|glucose|sugar).*?(\d{2,3})/i, fallback: /(\d{2,3})\s*(?:mg\/dl|mg|milligrams)/i, simple: /^(\d{2,3})$/ },
    bloodPressure: { regex: /(?:blood pressure|bp).*?(\d{2,3})\s*(?:over|\/)\s*(\d{2,3})/i, fallback: /(\d{2,3})\s*(?:over|\/)\s*(\d{2,3})/i, simple: /^(\d{2,3})\s*\/\s*(\d{2,3})$/ },
    respiratoryRate: { regex: /(?:respiratory rate|breathing rate|respiration).*?(\d{1,2})/i, fallback: /(\d{1,2})\s*(?:breaths|respirations)/i, simple: /^(\d{1,2})$/ },
    spo2: { regex: /(?:spo2|oxygen|o2|saturation).*?(\d{2,3})/i, fallback: /(\d{2,3})\s*(?:percent|%)/i, simple: /^(\d{2,3})$/ },
    steps: { regex: /(?:steps|walked).*?(\d{1,6})/i, fallback: /(\d{1,6})\s*steps/i, simple: /^(\d{1,6})$/ }
  };
  const vitalPattern = patterns[vitalType];
  if (!vitalPattern) return null;
  for (const patternType of ["regex", "fallback", "simple"]) {
    const match = text.match(vitalPattern[patternType]);
    if (match) {
      if (vitalType === "bloodPressure" && match[2]) return `${match[1]}/${match[2]}`;
      return match[1];
    }
  }
  return null;
};
const parseMultipleVitals = (transcript) => {
  const vitals = {};
  const vitalTypes = ["heartRate", "temperature", "bloodSugar", "bloodPressure", "respiratoryRate", "spo2", "steps"];
  vitalTypes.forEach((vitalType) => {
    const value = parseVitalFromSpeech(transcript, vitalType);
    if (value) vitals[vitalType] = value;
  });
  return vitals;
};

const DashboardOverview = () => {
  const userEmail = useSelector((s) => s.auth?.user?.email);
  const [appointments, setAppointments] = useState([]);
  const [healthSummary, setHealthSummary] = useState({});
  const [summaryId, setSummaryId] = useState(null);
  const [isNew, setIsNew] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  // Voice input for vitals
  const voiceInput = useVoiceInput();
  const [modalFormVals, setModalFormVals] = useState({});
  const [modalErrors, setModalErrors] = useState({});
  const vitalFields = [
    { name: "heartRate", label: "Heart Rate", type: "number", unit: "bpm", min: 30, max: 200, normalRange: "60-100 bpm" },
    { name: "temperature", label: "Temperature", type: "number", unit: "°C", step: "0.1", min: 30, max: 45, normalRange: "36.1-37.2 °C" },
    { name: "bloodSugar", label: "Blood Sugar", type: "number", unit: "mg/dL", min: 50, max: 500, normalRange: "70-140 mg/dL" },
    { name: "bloodPressure", label: "Blood Pressure", type: "text", unit: "mmHg", normalRange: "120/80 mmHg" },
    { name: "respiratoryRate", label: "Respiratory Rate", type: "number", unit: "breaths/min", min: 8, max: 40, normalRange: "12-20 breaths/min" },
    { name: "spo2", label: "SpO₂", type: "number", unit: "%", min: 50, max: 100, normalRange: ">= 95%" },
    { name: "steps", label: "Steps", type: "number", unit: "steps", min: 0, max: 100000, normalRange: "Varies" },
  ];
  useEffect(() => {
    if (showModal) {
      setModalFormVals(healthSummary && !isNew ? healthSummary : {});
      setModalErrors({});
    }
  }, [showModal, healthSummary, isNew]);
  useEffect(() => {
    if (voiceInput.transcript && !voiceInput.isListening) {
      const parsedVitals = parseMultipleVitals(voiceInput.transcript);
      if (Object.keys(parsedVitals).length > 0) {
        setModalFormVals((prev) => ({ ...prev, ...parsedVitals }));
        const clearedErrors = { ...modalErrors };
        Object.keys(parsedVitals).forEach((key) => { delete clearedErrors[key]; });
        setModalErrors(clearedErrors);
        setTimeout(() => { voiceInput.resetTranscript(); }, 1000);
      }
    }
  }, [voiceInput.transcript, voiceInput.isListening]);
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  useEffect(() => { 
    (async () => {
      try {
        const email = localStorage.getItem("email")?.trim().toLowerCase();
        const userId = localStorage.getItem("userId")?.trim();
        if (!email || !userId) return;
        const res = await axios.get("https://67e3e1e42ae442db76d2035d.mockapi.io/register/book");
        setAppointments(res.data.filter(a => a.email?.trim().toLowerCase() === email || a.userId?.trim() === userId).reverse());
      } catch (err) { 
        console.error("Error fetching doctor appointments:", err); 
      }
      setLoading(false);
    })(); 
  }, []);

  useEffect(() => { 
    if (!userEmail) return; 
    (async () => {
      try {
        const res = await axios.get("https://6808fb0f942707d722e09f1d.mockapi.io/health-summary");
        const userSummary = res.data.find(e => e.email === userEmail);
        if (userSummary) {
          setHealthSummary(userSummary);
          setSummaryId(userSummary.id);
          setIsNew(false);
        } else { 
          setHealthSummary({}); 
          setIsNew(true); 
        }
      } catch (error) { 
        console.error("Health summary fetch error", error); 
      }
    })(); 
  }, [userEmail]);

  const saveHealthSummary = async (formVals) => {
    const vitals = { ...formVals, email: userEmail, lastUpdated: new Date().toLocaleString() };
    try {
      const response = isNew
        ? await axios.post("https://6808fb0f942707d722e09f1d.mockapi.io/health-summary", vitals)
        : await axios.put(`https://6808fb0f942707d722e09f1d.mockapi.io/health-summary/${summaryId}`, vitals);
      setHealthSummary(response.data);
      setSummaryId(response.data.id);
      setIsNew(false);
      setShowModal(false);
    } catch (error) {
      console.error("Health summary save error", error);
    }
  };

  const summaryCards = [
    { label: "Heart Rate", value: healthSummary.heartRate, unit: "bpm", icon: <FaHeartbeat className="text-xl" />, color: "card-icon-primary card-icon-white" },
    { label: "Temperature", value: healthSummary.temperature, unit: "°C", icon: <FaThermometerHalf className="text-xl" />, color: "card-icon-accent card-icon-white" },
    { label: "Blood Sugar", value: healthSummary.bloodSugar, unit: "mg/dL", icon: <FaTint className="text-xl" />, color: "card-icon-accent card-icon-white" },
    { label: "Blood Pressure", value: healthSummary.bloodPressure, unit: "mmHg", icon: <FaStethoscope className="text-xl" />, color: "card-icon-primary card-icon-white" },
    { label: "Respiratory Rate", value: healthSummary.respiratoryRate, unit: "breaths/min", icon: <Activity className="w-5 h-5" />, color: "card-icon-accent card-icon-white" },
    { label: "SpO₂", value: healthSummary.spo2, unit: "%", icon: <Droplets className="w-5 h-5" />, color: "card-icon-primary card-icon-white" },
  ];

  const getStatusBadge = (status, rejectReason) => status === "Confirmed"
    ? <span className="bg-[var(--primary-color)] text-white px-3 py-1 rounded-full text-xs font-medium">Confirmed</span>
    : status?.toLowerCase() === "rejected"
      ? <div className="space-y-2"><span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">Rejected</span>{rejectReason && (<p className="text-xs paragraph mt-1"><strong>Reason:</strong> {rejectReason}</p>)}</div>
      : <span className="paragraph text-sm">Waiting for Confirmation</span>;

  if (loading) return (
    <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-rotate-move relative w-32 h-32 mx-auto mb-8">
          <div className="dot bg-[var(--primary-color)] animate-dot-1"></div>
          <div className="dot bg-[var(--accent-color)] animate-dot-2"></div>
          <div className="dot bg-[var(--primary-color)] animate-dot-3"></div>
        </div>
        <p className="paragraph text-lg">Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-[var(--color-surface)] text-[var(--primary-color)] min-h-screen pt-6 ">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 overflow-x-auto rounded-2xl shadow-xl p-6 slide-in-up bg-white">
            <div className="flex justify-between items-center mb-6">
              <h4 className="h4-heading flex items-center gap-3"><FaCalendarAlt className="text-[var(--accent-color)]" />Recent Appointments</h4>
              <Link to="/patientdashboard/app" className="text-[var(--primary-color)] font-medium hover:text-[var(--accent-color)] transition-colors duration-200 flex items-center space-x-1 text-sm"><span>View All</span><FaChevronRight className="text-xs" /></Link>
            </div>
            <div className="table-container">
              <table className="min-w-full">
                <thead className="table-head">
                  <tr>
                    <th className="px-6 py-4 text-left">Date</th>
                    <th className="px-6 py-4 text-left">Time</th>
                    <th className="px-6 py-4 text-left">Doctor</th>
                    <th className="px-6 py-4 text-left">Specialty</th>
                    <th className="px-6 py-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {appointments.length > 0 ? appointments.slice(0, 3).map((a) => (
                    <tr key={a.id} className="tr-style hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4"><div className="flex items-center space-x-2"><FaCalendarAlt className="text-[var(--accent-color)] text-sm" /><span>{a.date || "N/A"}</span></div></td>
                      <td className="px-6 py-4"><div className="flex items-center space-x-2"><FaClock className="text-[var(--primary-color)] text-sm" /><span>{a.time || "N/A"}</span></div></td>
                      <td className="px-6 py-4"><div className="flex items-center space-x-2"><FaUserMd className="text-[var(--accent-color)] text-sm" /><span className="font-medium">{a.doctorName || "Dr. Unknown"}</span></div></td>
                      <td className="px-6 py-4"><span className="paragraph">{a.specialty || "General Medicine"}</span></td>
                      <td className="px-6 py-4">{getStatusBadge(a.status, a.rejectReason)}</td>
                    </tr>
                  )) : (<tr><td colSpan={5} className="text-center px-6 py-12 paragraph text-lg">😴 No appointments found.</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
          <div className="w-full lg:w-1/2 bg-white rounded-2xl shadow-xl p-6 slide-in-up">
            <div className="flex justify-between items-center mb-6">
              <h4 className="h4-heading flex items-center gap-3"><FaHeartbeat className="text-[var(--accent-color)]" />Health Summary</h4>
              <button className="btn-secondary animate-bounce-gentle" onClick={handleOpenModal}><FaPlusCircle />{isNew ? "Add Vital" : "Update Vital"}</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {summaryCards.map((item, idx) => {
                const theme = item.color.match(/card-icon-(primary|accent)/)?.[1] || "primary";
                const hasData = item.value !== undefined && item.value !== null && item.value !== "" && item.value !== "N/A";
                return (
                  <div key={idx} className={`card-stat card-border-${theme} card-animate-pulse hover:shadow-lg transition-all duration-300 p-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`card-icon ${item.color} shadow-lg`}>{item.icon}</div>
                        <div>
                          <h5 className="card-stat-label font-semibold text-sm">{item.label}</h5>
                          {hasData ? (
                            <div className="flex items-baseline space-x-1">
                              <span className="card-stat-count text-lg">{item.value}</span>
                              <span className="text-xs paragraph">{item.unit}</span>
                            </div>
                          ) : (
                            <button onClick={handleOpenModal} className="text-xs mt-1 px-2 py-1 bg-gray-100 paragraph hover:bg-[var(--accent-color)] hover:text-white rounded-full transition-all duration-200">
                              + Add
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {healthSummary.lastUpdated && (<div className="mt-6 pt-4 border-t border-gray-100"><p className="text-xs paragraph text-center">Last updated: {healthSummary.lastUpdated}</p></div>)}
          </div>
        </div>
      </div>
      
      <ReusableModal
        isOpen={showModal}
        onClose={handleCloseModal}
        mode={isNew ? "add" : "edit"}
        title={isNew ? "Add Vital Details" : "Update Vital Details"}
        fields={vitalFields}
        data={modalFormVals}
        saveLabel={isNew ? "Save" : "Update"}
        cancelLabel="Cancel"
        onSave={saveHealthSummary}
        extraContent={voiceInput.isSupported && (
          <div className="mb-4">
            <button
              type="button"
              onClick={voiceInput.toggleListening}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg border-none focus:outline-none ${voiceInput.isListening ? "bg-red-500 text-white animate-pulse ring-4 ring-red-200" : "bg-[var(--accent-color)] text-white hover:bg-[var(--accent-color)]/80"}`}
              title={voiceInput.isListening ? "Stop voice input" : "Start voice input"}
            >
              {voiceInput.isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            <span className="ml-3 text-sm font-medium text-gray-700 align-middle">
              {voiceInput.isListening ? "Listening..." : "Voice Input"}
            </span>
            {voiceInput.transcript && (
              <div className="mt-2 text-blue-700 text-sm">Heard: <span className="font-semibold">{voiceInput.transcript}</span></div>
            )}
            <p className="text-xs text-gray-500 mt-1">Say vitals like: "Heart rate 72, temperature 98.6, blood pressure 120 over 80"</p>
          </div>
        )}
      />
    </div>
  );
};

export default DashboardOverview;