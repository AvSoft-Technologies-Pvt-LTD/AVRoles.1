import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiExternalLink, FiVideo } from "react-icons/fi";
import { FaPhone, FaVideo, FaUser, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import Pagination from "../../../../components/Pagination";
import ReusableModal from "../../../../components/microcomponents/Modal";
import axios from "axios";
import { createPortal } from "react-dom";
import toastHot from "react-hot-toast";
import Videocall from "../../../../assets/videocalling.avif";

const API = {
  HD: "https://680cc0c92ea307e081d4edda.mockapi.io/personalHealthDetails",
  FD: "https://6808fb0f942707d722e09f1d.mockapi.io/FamilyData",
  HS: "https://6808fb0f942707d722e09f1d.mockapi.io/health-summary",
};

const VIEW_VIRTUAL_PATIENT_FIELDS = [
  { key: "name", label: "Patient Name", titleKey: true },
  { key: "id", label: "Patient ID", subtitleKey: true },
  { key: "name", label: "Full Name", initialsKey: true },
  { key: "consultationType", label: "Consultation Type" },
  { key: "scheduledDateTime", label: "Scheduled Date & Time" },
  { key: "consultationStatus", label: "Status" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "duration", label: "Duration (minutes)" },
  { key: "notes", label: "Notes" },
];

// --- Modal Components ---
const Modal = ({ show, onClose, children, large, showEndButton }) =>
  show
    ? createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div onClick={onClose} className="absolute inset-0" />
          <div
            className={`relative bg-white p-6 rounded-xl z-10 shadow-lg animate-fadeInUp ${
              large ? "w-[90%] max-w-4xl" : "w-full max-w-md"
            }`}
          >
            {showEndButton && (
              <button
                onClick={onClose}
                className="absolute top-2 right-3 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                End Consultation
              </button>
            )}
            {children}
          </div>
        </div>,
        document.body
      )
    : null;

const Timer = () => {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, []);
  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return <p className="text-sm text-gray-600">Duration: {formatTime(seconds)}</p>;
};

const VideoModal = ({ show, onClose, videoBlob, patientName }) =>
  show
    ? createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative bg-white p-6 rounded-xl w-[90%] max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Consultation Recording - {patientName}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="bg-black rounded-lg overflow-hidden mb-4">
              <video
                controls
                className="w-full h-96 object-contain"
                src={videoBlob ? URL.createObjectURL(videoBlob) : undefined}
              >
                <p className="text-center text-white p-8">
                  Unable to load video recording.
                </p>
              </video>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                onClick={() => {
                  if (videoBlob) {
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(videoBlob);
                    a.download = `consult_${patientName}_${Date.now()}.webm`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    toastHot.success("Video download started");
                  }
                }}
              >
                Download Video
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

// --- TeleConsultFlow Component ---
const TeleConsultFlow = ({ phone, patientName }) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [callType, setCallType] = useState("");
  const [amount, setAmount] = useState("");
  const [stream, setStream] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [error, setError] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [showRecordedVideo, setShowRecordedVideo] = useState(false);
  const chunks = useRef([]);

  const reset = () => {
    setStep(1);
    setCallType("");
    setAmount("");
    setAudioEnabled(true);
    setError("");
    setOpen(false);
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setParticipants([]);
    chunks.current = [];
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
  };

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);
      setParticipants([{ id: "You", stream: mediaStream }]);
      const recorder = new MediaRecorder(mediaStream);
      recorder.ondataavailable = (e) => chunks.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: "video/webm" });
        setRecordedBlob(blob);
        toastHot.success("Consultation recorded successfully!");
      };
      recorder.start();
      setMediaRecorder(recorder);
    } catch (err) {
      setError("Camera or microphone access denied.");
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setAudioEnabled(audioTrack.enabled);
    }
  };

  const handleEndConsultation = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    toastHot.success("Consultation Ended");
    reset();
  };

  const floatLabel =
    "absolute left-3 text-gray-400 transition-all duration-200 bg-white px-1 pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-[-0.6rem] peer-focus:text-xs peer-focus:text-[var(--primary-color)] top-[-0.6rem] text-xs";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-[var(--accent-color)] hover:text-[var(--primary-color)] transition"
      >
        <FaPhone className="rotate-[100deg] text-xl" />
      </button>
      {recordedBlob && (
        <button
          onClick={() => setShowRecordedVideo(true)}
          className="ml-2 text-green-600 hover:text-green-800"
          title="View Recorded Consultation"
        >
          <FiVideo />
        </button>
      )}
      <Modal
        show={open}
        onClose={handleEndConsultation}
        large={step === 3 && callType === "video"}
        showEndButton={step === 3 && callType === "video"}
      >
        <h2 className="h4-heading font-semibold mb-2">Tele Consult</h2>
        <img src={Videocall} alt="Consultation" className="w-54 h-54 m-4 mx-auto" />
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <p className="paragraph">Consultation Type</p>
              <div className="flex gap-4">
                {["Consultation", "Followup"].map((t) => (
                  <label key={t} className="flex items-center gap-2">
                    <input type="radio" name="type" /> {t}
                  </label>
                ))}
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
                className="peer w-full rounded-lg p-2 pb-3 border shadow-sm placeholder-transparent focus:outline-none focus:border-[var(--primary-color)]"
                required
              />
              <label htmlFor="amount" className={floatLabel}>
                Amount
              </label>
            </div>
            <select className="w-full border border-gray-300 p-2 rounded-md">
              <option>Select Payment Mode</option>
              {[
                "Cash",
                "GPay",
                "Paytm",
                "PhonePe",
                "Credit Card",
                "Debit Card",
              ].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
            <button
              onClick={() => setStep(2)}
              className="relative w-full mt-2 px-6 py-2 font-semibold text-white bg-[var(--primary-color)] rounded-lg group overflow-hidden"
            >
              <span className="absolute inset-0 bg-[var(--accent-color)] transform translate-y-full group-hover:translate-y-0 transition duration-300 ease-in-out z-0" />
              <span className="relative z-10 group-hover:opacity-0 transition duration-300">
                Create Online Consultation
              </span>
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-white font-bold z-10 transition duration-300">
                Booking Ready!
              </span>
            </button>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4 text-center">
            <div className="relative">
              <input
                type="text"
                id="patientPhone"
                value={phone}
                readOnly
                placeholder="Patient Phone Number"
                className="peer w-full rounded-lg p-2 pb-3 border shadow-sm placeholder-transparent focus:outline-none focus:border-[var(--primary-color)]"
                required
              />
              <label htmlFor="patientPhone" className={floatLabel}>
                Patient Phone Number
              </label>
            </div>
            <div className="flex justify-center gap-4">
              {[
                {
                  type: "voice",
                  icon: <FaPhone className="rotate-[100deg]" />,
                  label: "Phone Call",
                },
                { type: "video", icon: <FaVideo />, label: "Video Call" },
              ].map(({ type, icon, label }) => (
                <button
                  key={type}
                  onClick={() => {
                    setCallType(type);
                    setStep(3);
                    if (type === "video") setTimeout(openCamera, 1000);
                  }}
                  className="relative overflow-hidden px-5 py-2 rounded-lg text-white font-semibold bg-[var(--primary-color)] group"
                >
                  <span className="absolute inset-0 bg-[var(--accent-color)] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out z-0" />
                  <span className="relative z-10 flex items-center gap-2">
                    {icon} <span>{label}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 3 && callType === "voice" && (
          <div className="text-center space-y-4">
            <FaUser className="text-5xl mx-auto text-gray-500" />
            <p className="paragraph">
              You will get a call from our system to connect you to the patient.
              Your number will not be shared.
            </p>
            <button className="mt-4 px-5 py-2 bg-[var(--accent-color)] text-white rounded-lg">
              Connecting a call...
            </button>
          </div>
        )}
        {step === 3 && callType === "video" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="font-semibold text-lg">Consultation in Progress</p>
              <Timer />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {participants.map((p) => (
                <div key={p.id} className="rounded-lg overflow-hidden shadow">
                  <video
                    ref={(el) => el && p.stream && (el.srcObject = p.stream)}
                    autoPlay
                    playsInline
                    className="w-full h-64 object-cover"
                  />
                  <p className="text-center text-sm mt-1 font-semibold">
                    {p.id} (Doctor)
                  </p>
                </div>
              ))}
              <div className="rounded-lg overflow-hidden shadow flex items-center justify-center h-64 bg-gray-100">
                <p className="text-gray-500 text-sm">
                  Waiting for patient to connect...
                </p>
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={toggleAudio}
                className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition"
              >
                {audioEnabled ? (
                  <FaMicrophone className="text-green-600" />
                ) : (
                  <FaMicrophoneSlash className="text-red-600" />
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
      <VideoModal
        show={showRecordedVideo}
        onClose={() => setShowRecordedVideo(false)}
        videoBlob={recordedBlob}
        patientName={patientName}
      />
    </>
  );
};

// --- VirtualTab Component ---
export default function VirtualTab({ patients, loading, newPatientId }) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [personalDetails, setPersonalDetails] = useState(null);
  const [family, setFamily] = useState([]);
  const [vitals, setVitals] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modals, setModals] = useState({ viewPatient: false });
  const pageSize = 6;
  const totalPages = Math.ceil(patients.length / pageSize);
  const paginatedPatients = patients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const virtualColumns = [
    { header: "ID", accessor: "id" },
    {
      header: "Name",
      accessor: "name",
      clickable: true,
      cell: (row) => (
        <button
          className={`cursor-pointer text-[var(--primary-color)] hover:text-[var(--accent-color)] ${
            row.id === newPatientId
              ? "font-bold bg-yellow-100 px-2 py-1 rounded"
              : ""
          }`}
          onClick={() => viewVirtualPatientDetails(row)}
        >
          {row.name}
        </button>
      ),
    },
    {
      header: "Consultation Type",
      cell: (row) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
          {row.consultationType || "Video Call"}
        </span>
      ),
    },
    { header: "Scheduled", accessor: "scheduledDateTime" },
    {
      header: "Status",
      cell: (row) => (
        <span
          className={`status-badge ${
            row.consultationStatus === "Scheduled"
              ? "status-admitted"
              : row.consultationStatus === "In Progress"
              ? "status-pending"
              : row.consultationStatus === "Completed"
              ? "status-discharged"
              : "status-pending"
          }`}
        >
          {row.consultationStatus || "Scheduled"}
        </span>
      ),
    },
    { header: "Duration", cell: (row) => `${row.duration || 30} min` },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <TeleConsultFlow phone={row.phone} patientName={row.name} />
          <button
            title="View Patient Records"
            onClick={() => {
              let age = "";
              if (row.dob) {
                const dobDate = new Date(row.dob);
                const today = new Date();
                age = today.getFullYear() - dobDate.getFullYear();
                const m = today.getMonth() - dobDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
                  age--;
                }
              }
              navigate("/doctordashboard/medical-record", {
                state: {
                  patientName: row.name,
                  email: row.email || "",
                  phone: row.phone || "",
                  gender: row.gender || row.sex || "",
                  temporaryAddress:
                    row.temporaryAddress ||
                    row.addressTemp ||
                    row.address ||
                    "",
                  address:
                    row.address ||
                    row.temporaryAddress ||
                    row.addressTemp ||
                    "",
                  addressTemp:
                    row.addressTemp ||
                    row.temporaryAddress ||
                    row.address ||
                    "",
                  dob: row.dob,
                  age: age,
                  consultationType: row.consultationType || "Virtual",
                },
              });
            }}
            className="text-blue-600 hover:text-blue-800"
            style={{ display: "flex", alignItems: "center" }}
          >
            <FiExternalLink />
          </button>
        </div>
      ),
    },
  ];

  const virtualFilters = [
    {
      key: "consultationStatus",
      label: "Status",
      options: [
        { value: "Scheduled", label: "Scheduled" },
        { value: "In Progress", label: "In Progress" },
        { value: "Completed", label: "Completed" },
        { value: "Cancelled", label: "Cancelled" },
      ],
    },
    {
      key: "consultationType",
      label: "Type",
      options: [
        { value: "Video Call", label: "Video Call" },
        { value: "Voice Call", label: "Voice Call" },
        { value: "Chat", label: "Chat" },
      ],
    },
  ];

  const openModal = (modalName, data = null) => {
    setModals((prev) => ({ ...prev, [modalName]: true }));
    if (modalName === "viewPatient" && data) {
      setSelectedPatient(data);
    }
  };

  const closeModal = (modalName) => {
    setModals((prev) => ({ ...prev, [modalName]: false }));
    if (modalName === "viewPatient") {
      setSelectedPatient(null);
    }
  };

  const handleStartConsultation = (patient) => {
    toast.info(
      `Starting ${
        patient.consultationType?.toLowerCase() || "video call"
      } with ${patient.name}...`
    );
  };

  const viewVirtualPatientDetails = async (patient) => {
    openModal("viewPatient", patient);
    try {
      const { data: personalData } = await axios.get(API.HD);
      const p = personalData.find(
        (p) =>
          (p.email || "").trim().toLowerCase() ===
          (patient.email || "").trim().toLowerCase()
      );
      if (p) {
        setPersonalDetails({
          height: p.height,
          weight: p.weight,
          bloodGroup: p.bloodGroup,
          surgeries: p.surgeries,
          allergies: p.allergies,
          isSmoker: p.isSmoker,
          isAlcoholic: p.isAlcoholic,
        });
      }
      const { data: familyData } = await axios.get(API.FD);
      setFamily(
        familyData.filter(
          (f) =>
            (f.email || "").trim().toLowerCase() ===
            (patient.email || "").trim().toLowerCase()
        )
      );
      const { data: vitalsData } = await axios.get(API.HS);
      const v = vitalsData.find(
        (v) =>
          (v.email || "").trim().toLowerCase() ===
          (patient.email || "").trim().toLowerCase()
      );
      setVitals(
        v
          ? {
              bloodPressure: v.bloodPressure || "Not recorded",
              heartRate: v.heartRate || "Not recorded",
              temperature: v.temperature || "Not recorded",
              bloodSugar: v.bloodSugar || "Not recorded",
            }
          : null
      );
    } catch (error) {
      console.error("Error fetching patient details:", error);
    }
  };

  const handleCellClick = (row, column) => {
    if (column.accessor === "name") {
      viewVirtualPatientDetails(row);
    }
  };

  return (
    <div className="space-y-4">
      <DynamicTable
        columns={virtualColumns}
        data={paginatedPatients}
        onCellClick={handleCellClick}
        filters={virtualFilters}
        tabs={[]}
        tabActions={[]}
        activeTab=""
        onTabChange={() => {}}
      />
      <div className="w-full flex justify-end mt-4">
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
      <ReusableModal
        isOpen={modals.viewPatient}
        onClose={() => closeModal("viewPatient")}
        mode="viewProfile"
        title="Virtual Patient Details"
        viewFields={VIEW_VIRTUAL_PATIENT_FIELDS}
        data={selectedPatient || {}}
        extraContent={
          <div className="space-y-4">
            {personalDetails && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">
                  Health Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Height: {personalDetails.height || "—"} cm</div>
                  <div>Weight: {personalDetails.weight || "—"} kg</div>
                  <div>
                    Blood Group: {personalDetails.bloodGroup || "Not recorded"}
                  </div>
                  <div>Allergies: {personalDetails.allergies || "None"}</div>
                </div>
              </div>
            )}
            {vitals && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Latest Vital Signs
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>BP: {vitals.bloodPressure}</div>
                  <div>HR: {vitals.heartRate}</div>
                  <div>Temp: {vitals.temperature}</div>
                  <div>Sugar: {vitals.bloodSugar}</div>
                </div>
              </div>
            )}
            {family && family.length > 0 && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">
                  Family History
                </h4>
                <div className="space-y-2">
                  {family.map((member, i) => (
                    <div key={i} className="text-sm">
                      <strong>{member.name}</strong> ({member.relation}) -{" "}
                      {member.diseases?.join(", ") || "No diseases"}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}
