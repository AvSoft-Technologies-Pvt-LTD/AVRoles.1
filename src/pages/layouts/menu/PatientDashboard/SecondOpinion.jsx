import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";emailjs
import html2pdf from "html2pdf.js";
import emailjs from "emailjs-com";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import {
  ArrowLeft, User, Stethoscope, ChevronDown, X, Printer, CheckCircle, FileText, Pill, TestTube, Mail, MessageCircle, Send, Phone, AtSign,
} from "lucide-react";

const PrintContent = ({ requestData, selectedRecord, formData }) => (
  <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
    <div className="header" style={{ textAlign: "center", borderBottom: "2px solid #333", paddingBottom: "20px", marginBottom: "30px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: "0 0 10px 0", textTransform: "uppercase" }}>SECOND OPINION REQUEST</h1>
      <p style={{ fontSize: "16px", color: "#666", margin: "0" }}>Expert Medical Consultation Form</p>
    </div>
    <div className="request-info" style={{ marginBottom: "25px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
      <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px", color: "#333" }}>Request Information</h3>
      <p><strong>Request ID:</strong> {requestData.id}</p>
      <p><strong>Date of Request:</strong> {requestData.requestDate}</p>
      <p><strong>Status:</strong> Pending Review</p>
    </div>
    <div className="medical-records-attached" style={{ marginBottom: "25px", padding: "15px", backgroundColor: "#e8f5e8", borderRadius: "8px", border: "1px solid #4caf50" }}>
      <h4 style={{ fontSize: "16px", fontWeight: "bold", color: "#2e7d32", marginBottom: "10px" }}>✓ Medical Records Attached</h4>
      <p style={{ margin: "0", color: "#2e7d32" }}>Complete patient medical history, vitals, prescriptions, and lab reports are included with this request.</p>
    </div>
    <div className="patient-section" style={{ marginBottom: "25px" }}>
      <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px", color: "#333", borderBottom: "1px solid #ddd", paddingBottom: "5px" }}>Patient Information</h3>
      <div className="patient-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "15px" }}>
        {Object.entries(requestData.patientInfo).map(([key, value]) => (
          <div key={key} className="patient-item" style={{ padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "6px" }}>
            <strong>{key.replace(/([A-Z])/g, " $1") + ":"}</strong>
            <span style={{ marginLeft: "10px" }}>{value}</span>
          </div>
        ))}
        <div className="patient-item" style={{ padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "6px" }}>
          <strong>K/C/O:</strong>
          <span style={{ marginLeft: "10px" }}>{selectedRecord["K/C/O"] ?? "--"}</span>
        </div>
      </div>
    </div>
    <div className="request-details" style={{ marginBottom: "30px" }}>
      <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px", color: "#333", borderBottom: "1px solid #ddd", paddingBottom: "5px" }}>Consultation Request Details</h3>
      {Object.entries(formData).filter(([key]) => !["contactEmail", "contactPhone"].includes(key)).map(([key, value]) => (
        <div key={key} className="detail-item" style={{ marginBottom: "15px", padding: "10px", border: "1px solid #e0e0e0", borderRadius: "6px" }}>
          <div className="detail-label" style={{ fontWeight: "bold", color: "#555", marginBottom: "5px" }}>{key.replace(/([A-Z])/g, " $1") + ":"}</div>
          <div className="detail-value" style={{ color: "#333" }}>{value || "Not specified"}</div>
        </div>
      ))}
    </div>
    <div className="footer" style={{ borderTop: "1px solid #ddd", paddingTop: "20px", textAlign: "center", color: "#666", fontSize: "14px" }}>
      <p style={{ margin: "5px 0" }}>This is an official second opinion request generated on {new Date().toLocaleString()}</p>
      <p style={{ margin: "5px 0" }}>For any queries, please contact the medical records department.</p>
    </div>
  </div>
);

const MedicalRecordsDetailsPreview = ({ selectedRecord, onClose }) => {
  if (!selectedRecord) return null;
  const [detailsActiveTab, setDetailsActiveTab] = useState("medical-records");
  const renderTabContent = () => {
    const tabContentMap = {
      "medical-records": (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <FileText size={24} className="text-blue-600" />
              <h3 className="text-xl font-semibold">Medical Information</h3>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">View Original</button>
          </div>
          <section className="mb-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-4">Medical Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(selectedRecord?.medicalDetails || {}).map(([label, value]) => (
                <div key={label} className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="font-bold text-sm text-gray-600 mb-2">{label.replace(/([A-Z])/g, " $1")}</div>
                  <div className="text-gray-800 text-sm">{value || "N/A"}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ),
      prescriptions: (
        <DynamicTable
          columns={[
            { header: "Date", accessor: "date" },
            { header: "Doctor Name", accessor: "doctorName" },
            { header: "Medicines", accessor: "medicines" },
            { header: "Instructions", accessor: "instructions" },
          ]}
          data={selectedRecord?.prescriptionsData || []}
        />
      ),
      "lab-tests": (
        <DynamicTable
          columns={[
            { header: "Date", accessor: "date" },
            { header: "Test Name", accessor: "testName" },
            { header: "Result", accessor: "result" },
            { header: "Normal Range", accessor: "normalRange" },
            {
              header: "Status",
              accessor: "status",
              cell: (row) => (
                <span className={`text-sm font-semibold px-2 py-1 rounded-full ${row.status === "Normal" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {row.status}
                </span>
              ),
            },
          ]}
          data={selectedRecord?.labTestsData || []}
        />
      ),
    };
    return tabContentMap[detailsActiveTab] || null;
  };

  const detailsTabs = [
    { id: "medical-records", label: "Medical Records", icon: FileText },
    { id: "prescriptions", label: "Prescriptions", icon: Pill },
    { id: "lab-tests", label: "Lab Tests", icon: TestTube },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-auto m-4">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Medical Records Preview</h2>
              <p className="text-gray-600">Complete patient medical information</p>
            </div>
            <button onClick={onClose} className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-gray-100">
              <X size={20} />
              Close
            </button>
          </div>
          <div className="flex border-gray-200 mb-6">
            {detailsTabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button key={tab.id} onClick={() => setDetailsActiveTab(tab.id)} className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors duration-300 ${detailsActiveTab === tab.id ? "border-b-2 text-blue-600 border-blue-600" : "text-gray-500 hover:text-blue-600"}`}>
                  <IconComponent size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="animate-slide-fade-in">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
};

const SecondOpinion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const printContentRef = useRef();
  const selectedRecord = location.state?.selectedRecord || {
    patientName: "John Doe", age: "45", sex: "Male", id: "P001", hospitalName: "General Hospital", diagnosis: "Chest Pain", dateOfVisit: "2024-01-15", "K/C/O": "Hypertension", vitals: { bp: "140/90", pulse: "80", temp: "98.6" }, medicalDetails: {
      chiefComplaint: "Chest pain since 2 days", pastHistory: "Hypertension for 5 years", examination: "Tenderness over chest",
    }, prescriptionsData: [{ date: "2024-01-15", doctorName: "Dr. Smith", medicines: "Aspirin 75mg", instructions: "Once daily", }], labTestsData: [{ date: "2024-01-15", testName: "ECG", result: "Normal", normalRange: "Normal", status: "Normal", }],
  };

  const [formData, setFormData] = useState({ selectedDoctor: "", urgencyLevel: "", preferredMode: "", additionalNotes: "", contactEmail: "", contactPhone: "", });
  const [showMedicalRecords, setShowMedicalRecords] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSending, setIsSending] = useState({ whatsapp: false, email: false });

  const doctors = ["Dr. Rajesh Kumar (Cardiologist)", "Dr. Priya Sharma (Physician)", "Dr. Amit Patel (Neurologist)", "Dr. Sunita Reddy (Gastroenterologist)"];
  const urgencyLevels = [{ label: "Normal (3-5 days)", value: "normal" }, { label: "Urgent (1-2 days)", value: "urgent" }, { label: "Critical (Same day)", value: "critical" }];
  const consultationModes = [{ label: "In-person Visit", value: "in-person" }, { label: "Teleconsultation", value: "teleconsultation" }, { label: "Email Report", value: "email" }, { label: "Phone Consultation", value: "phone" }];

  const handleInputChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));
  const handleDoctorSelect = (doctor) => { setFormData((prev) => ({ ...prev, selectedDoctor: doctor })); setIsDropdownOpen(false); };
  const handleBack = () => navigate(-1);
  const generateRequestData = () => ({ id: `SO-${Date.now()}`, requestDate: new Date().toLocaleDateString("en-GB"), patientInfo: { name: selectedRecord.patientName, age: selectedRecord.age, sex: selectedRecord.sex, patientId: selectedRecord.id, hospitalName: selectedRecord.hospitalName, diagnosis: selectedRecord.diagnosis, visitDate: selectedRecord.dateOfVisit || selectedRecord.dateOfAdmission || selectedRecord.dateOfConsultation, }, });
  const generateMessageContent = () => {
    const requestData = generateRequestData();
    return { subject: `Second Opinion Request - ${requestData.patientInfo.name} (${requestData.id})`, body: `SECOND OPINION REQUEST\n\nRequest Details:\n• Request ID: ${requestData.id}\n• Date: ${requestData.requestDate}\n• Status: Pending Review\n\nPatient Information:\n• Name: ${requestData.patientInfo.name}\n• Age: ${requestData.patientInfo.age}\n• Gender: ${requestData.patientInfo.sex}\n• Hospital: ${requestData.patientInfo.hospitalName}\n• Diagnosis: ${requestData.patientInfo.diagnosis}\n• Visit Date: ${requestData.patientInfo.visitDate}\n• K/C/O: ${selectedRecord["K/C/O"] ?? "--"}\n\nConsultation Request Details:\n• Selected Doctor: ${formData.selectedDoctor || "Not specified"}\n• Urgency Level: ${formData.urgencyLevel || "Not specified"}\n• Preferred Mode: ${formData.preferredMode || "Not specified"}\n• Additional Notes: ${formData.additionalNotes || "Not specified"}\n\nMedical Records: Complete patient medical history, vitals, prescriptions, and lab reports are included with this request.\n\nGenerated on: ${new Date().toLocaleString()}\nFor queries, please contact the medical records department.` };
  };

  const generatePDF = async () => {
    const element = document.createElement("div");
    element.innerHTML = `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 10px 0; text-transform: uppercase;">SECOND OPINION REQUEST</h1>
        <p style="font-size: 16px; color: #666; margin: 0;">Expert Medical Consultation Form</p>
      </div>
      <div style="margin-bottom: 25px; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
        <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333;">Request Information</h3>
        <p><strong>Request ID:</strong> ${generateRequestData().id}</p>
        <p><strong>Date of Request:</strong> ${generateRequestData().requestDate}</p>
        <p><strong>Status:</strong> Pending Review</p>
      </div>
      <div style="margin-bottom: 25px; padding: 15px; background-color: #e8f5e8; border-radius: 8px; border: 1px solid #4caf50;">
        <h4 style="font-size: 16px; font-weight: bold; color: #2e7d32; margin-bottom: 10px;">✓ Medical Records Attached</h4>
        <p style="margin: 0; color: #2e7d32;">Complete patient medical history, vitals, prescriptions, and lab reports are included with this request.</p>
      </div>
      <div style="margin-bottom: 25px;">
        <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Patient Information</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
          <div style="padding: 10px; background-color: #f8f9fa; border-radius: 6px;"><strong>Name:</strong> ${selectedRecord.patientName}</div>
          <div style="padding: 10px; background-color: #f8f9fa; border-radius: 6px;"><strong>Age:</strong> ${selectedRecord.age}</div>
          <div style="padding: 10px; background-color: #f8f9fa; border-radius: 6px;"><strong>Gender:</strong> ${selectedRecord.sex}</div>
          <div style="padding: 10px; background-color: #f8f9fa; border-radius: 6px;"><strong>Patient ID:</strong> ${selectedRecord.id}</div>
          <div style="padding: 10px; background-color: #f8f9fa; border-radius: 6px;"><strong>Hospital:</strong> ${selectedRecord.hospitalName}</div>
          <div style="padding: 10px; background-color: #f8f9fa; border-radius: 6px;">< strong>Diagnosis:</strong> ${selectedRecord.diagnosis}</div>
          <div style="padding: 10px; background-color: #f8f9fa; border-radius: 6px;"><strong>K/C/O:</strong> ${selectedRecord["K/C/O"] ?? "--"}</div>
        </div>
      </div>
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Consultation Request Details</h3>
        <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #e0e0e0; border-radius: 6px;">
          <div style="font-weight: bold; color: #555; margin-bottom: 5px;">Selected Doctor:</div>
          <div style="color: #333;">${formData.selectedDoctor || "Not specified"}</div>
        </div>
        <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #e0e0e0; border-radius: 6px;">
          <div style="font-weight: bold; color: #555; margin-bottom: 5px;">Urgency Level:</div>
          <div style="color: #333;">${formData.urgencyLevel || "Not specified"}</div>
        </div>
        <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #e0e0e0; border-radius: 6px;">
          <div style="font-weight: bold; color: #555; margin-bottom: 5px;">Preferred Mode:</div>
          <div style="color: #333;">${formData.preferredMode || "Not specified"}</div>
        </div>
        <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #e0e0e0; border-radius: 6px;">
          <div style="font-weight: bold; color: #555; margin-bottom: 5px;">Additional Notes:</div>
          <div style="color: #333;">${formData.additionalNotes || "Not specified"}</div>
        </div>
      </div>
      <div style="border-top: 1px solid #ddd; padding-top: 20px; text-align: center; color: #666; font-size: 14px;">
        <p style="margin: 5px 0;">This is an official second opinion request generated on ${new Date().toLocaleString()}</p>
        <p style="margin: 5px 0;">For any queries, please contact the medical records department.</p>
      </div>
    </div>`;

    const opt = {
      margin: 1,
      filename: `second-opinion-${generateRequestData().id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    try {
      const pdfBlob = await html2pdf().set(opt).from(element).outputPdf("blob");
      return pdfBlob;
    } catch (error) {
      console.error("PDF generation error:", error);
      throw error;
    }
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const sendWhatsAppMessage = async () => {
    if (!formData.contactPhone) {
      toast.error("Please enter a WhatsApp number");
      return;
    }

    setIsSending((prev) => ({ ...prev, whatsapp: true }));

    try {
      toast.info("Generating PDF...");
      const pdfBlob = await generatePDF();
      const messageContent = generateMessageContent();
      const whatsappMessage = `${messageContent.subject}\n\n${messageContent.body}\n\nPDF document has been generated and is ready for download.`;

      const response = await axios.get(`https://api.callmebot.com/whatsapp.php`, {
        params: {
          phone: `+91${formData.contactPhone}`,
          text: whatsappMessage,
          apikey: "YOUR_API_KEY",
        },
        timeout: 15000,
      });

      console.log("✅ WhatsApp API Response:", response.data);
      toast.success(`WhatsApp message sent successfully to +91${formData.contactPhone}!`);

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `second-opinion-${generateRequestData().id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("❌ WhatsApp send error:", error);
      try {
        const pdfBlob = await generatePDF();
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `second-opinion-${generateRequestData().id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.warning("WhatsApp service unavailable. PDF downloaded instead. Please share manually to WhatsApp.");
      } catch (pdfError) {
        toast.error("Failed to generate PDF: " + pdfError.message);
      }
    } finally {
      setIsSending((prev) => ({ ...prev, whatsapp: false }));
    }
  };

  const sendEmail = async () => {
    if (!formData.contactEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSending((prev) => ({ ...prev, email: true }));

    try {
      toast.info("Generating PDF...");
      const pdfBlob = await generatePDF();
      const pdfBase64 = await blobToBase64(pdfBlob);
      const messageContent = generateMessageContent();

      emailjs.init("YOUR_USER_ID");

      const templateParams = {
        to_email: formData.contactEmail,
        to_name: selectedRecord.patientName,
        subject: messageContent.subject,
        message: messageContent.body,
        pdf_attachment: pdfBase64,
        filename: `second-opinion-${generateRequestData().id}.pdf`,
      };

      const response = await emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", templateParams);

      if (response.status === 200) {
        console.log("✅ Email sent successfully:", response);
        toast.success(`Email with PDF sent successfully to ${formData.contactEmail}!`);
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      console.error("❌ Email send error:", error);
      try {
        const pdfBlob = await generatePDF();
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `second-opinion-${generateRequestData().id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.warning("Email service unavailable. PDF downloaded instead. Please email manually.");
      } catch (pdfError) {
        toast.error("Failed to generate PDF: " + pdfError.message);
      }
    } finally {
      setIsSending((prev) => ({ ...prev, email: false }));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (showMedicalRecords) {
    return (
      <MedicalRecordsDetailsPreview
        selectedRecord={selectedRecord}
        onClose={() => setShowMedicalRecords(false)}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <button onClick={handleBack} className="flex items-center gap-2 hover:text-blue-600 transition-colors text-gray-600">
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Medical Record Details</span>
      </button>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3">
          <Stethoscope size={32} className="text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Second Opinion Request</h1>
        </div>
        <p className="text-sm text-gray-600 mt-2">Get expert consultation for your medical condition</p>
      </div>
      <div className="bg-gradient-to-r from-[#01B07A] to-[#1A223F] rounded-xl p-6 mb-8 text-white">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <User  size={20} />
          Patient Information (Auto-attached)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p><span className="font-semibold">Patient Name:</span> {selectedRecord.patientName}</p>
            <p><span className="font-semibold">Age:</span> {selectedRecord.age}</p>
            <p><span className="font-semibold">Gender:</span> {selectedRecord.sex}</p>
            <p><span className="font-semibold">K/C/O:</span> {selectedRecord["K/C/O"] ?? "--"}</p>
          </div>
          <div className="space-y-2">
            <p><span className="font-semibold">Hospital:</span> {selectedRecord.hospitalName}</p>
            <p><span className="font-semibold">Visit Date:</span> {selectedRecord.dateOfVisit || selectedRecord.dateOfAdmission || selectedRecord.dateOfConsultation}</p>
            <p><span className="font-semibold">Diagnosis:</span> {selectedRecord.diagnosis}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Consulting Doctor <span className="text-red-500">*</span></label>
            <div className="relative">
              <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full p-3 border border-gray-300 rounded-lg bg-white flex items-center justify-between">
                <span className={formData.selectedDoctor ? "text-gray-900" : "text-gray-500"}>{formData.selectedDoctor || "Select a doctor..."}</span>
                <ChevronDown size={18} className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {doctors.map((doctor) => (
                    <button key={doctor} type="button" onClick={() => handleDoctorSelect(doctor)} className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors">{doctor}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Urgency Level</label>
            <select value={formData.urgencyLevel} onChange={(e) => handleInputChange("urgencyLevel", e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg">
              <option value="">Select urgency level</option>
              {urgencyLevels.map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Consultation Mode</label>
            <select value={formData.preferredMode} onChange={(e) => handleInputChange("preferredMode", e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg">
              <option value="">Select consultation mode</option>
              {consultationModes.map((mode) => (
                <option key={mode.value} value={mode.value}>{mode.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Attach Additional Reports (Optional)</label>
            <div>
              <button type="button" onClick={() => document.getElementById("fileUpload").click()} className="w-full p-3 border border-gray-300 rounded-lg flex items-center justify-center text-gray-500 cursor-pointer text-sm">Attach Document</button>
              <input id="fileUpload" type="file" className="hidden" onChange={(e) => handleInputChange("uploadedFile", e.target.files[0])} />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes (Optional)</label>
          <textarea value={formData.additionalNotes} onChange={(e) => handleInputChange("additionalNotes", e.target.value)} rows={3} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Any additional information for the consulting doctor..." />
        </div>
      </div>
      <div className="flex justify-center items-center pt-6">
        <div className="flex gap-3">
          <button onClick={() => setShowPrintPreview(true)} className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            <Printer size={18} />
            Print Preview & Send
          </button>
        </div>
      </div>
      {showPrintPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-[#01B07A] to-[#1A223F] text-white rounded-t-2xl">
              <h3 className="text-xl font-semibold">Second Opinion Request Preview</h3>
              <button onClick={() => setShowPrintPreview(false)} className="text-white hover:text-gray-200 transition-colors"><X size={24} /></button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              <div>
                <div className="bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden text-sm" style={{ fontFamily: "Times, serif" }}>
                  <PrintContent requestData={generateRequestData()} selectedRecord={selectedRecord} formData={formData} />
                </div>
              </div>
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-800">Send PDF Options</h4>
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2"><Phone size={16} className="inline mr-2" />WhatsApp Number</label>
                      <input type="tel" value={formData.contactPhone} onChange={(e) => handleInputChange("contactPhone", e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2"><AtSign size={16} className="inline mr-2" />Email Address</label>
                      <input type="email" value={formData.contactEmail} onChange={(e) => handleInputChange("contactEmail", e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={sendWhatsAppMessage} disabled={!formData.contactPhone || isSending.whatsapp} className={`flex flex-col items-center p-4 rounded-lg border transition-all ${formData.contactPhone && !isSending.whatsapp ? "border-green-300 hover:bg-green-50 hover:scale-105" : "border-gray-300 opacity-50 cursor-not-allowed"}`}>
                    {isSending.whatsapp ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div> : <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-8 h-8 mb-2" />}
                    <span className="text-xs font-medium text-center">{isSending.whatsapp ? "Sending..." : "Send to WhatsApp"}</span>
                  </button>
                  <button onClick={sendEmail} disabled={!formData.contactEmail || isSending.email} className={`flex flex-col items-center p-4 rounded-lg border transition-all ${formData.contactEmail && !isSending.email ? "border-red-300 hover:bg-red-50 hover:scale-105" : "border-gray-300 opacity-50 cursor-not-allowed"}`}>
                    {isSending.email ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div> : <img src="https://img.icons8.com/color/48 /gmail--v1.png" alt="Email" className="w-7 h-7 mb-2" />}
                    <span className="text-xs font-medium text-center">{isSending.email ? "Sending..." : "Send Email"}</span>
                  </button>
                  <button onClick={async () => {
                    try {
                      const pdfBlob = await generatePDF();
                      const url = URL.createObjectURL(pdfBlob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `second-opinion-${generateRequestData().id}.pdf`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                      toast.success("PDF downloaded successfully!");
                    } catch (error) {
                      toast.error("Failed to generate PDF");
                    }
                  }} className="flex flex-col items-center p-4 rounded-lg border border-gray-300 hover:bg-gray-50 hover:scale-105 transition-all">
                    <img src="https://img.icons8.com/ios-filled/50/000000/print.png" alt="Download" className="w-6 h-6 mb-2" />
                    <span className="text-xs font-medium text-center">Download PDF</span>
                  </button>
                </div>
                {!formData.contactPhone && !formData.contactEmail && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm"><strong>Note:</strong> Please provide WhatsApp number or email address to send the PDF document.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecondOpinion;