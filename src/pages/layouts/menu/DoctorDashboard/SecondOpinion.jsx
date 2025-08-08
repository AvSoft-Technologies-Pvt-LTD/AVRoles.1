import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import html2pdf from "html2pdf.js";
import emailjs from "emailjs-com";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import {
  ArrowLeft, User, Stethoscope, ChevronDown, X, Printer, CheckCircle, FileText, Pill, TestTube, Mail, MessageCircle, Send, Phone, AtSign, UserCheck, Clock, AlertTriangle,
} from "lucide-react";

const PrintContent = ({ referralData, selectedRecord, formData, currentDoctor }) => (
  <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
    <div className="header" style={{ textAlign: "center", borderBottom: "2px solid #333", paddingBottom: "20px", marginBottom: "30px" }}>
      <h1 className="h4-heading">MEDICAL REFERRAL FOR SECOND OPINION</h1>
      <p style={{ fontSize: "16px", color: "#666", margin: "0" }}>Expert Medical Consultation Referral</p>
    </div>

    <div className="referral-info" style={{ marginBottom: "25px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
      <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px", color: "#333" }}>Referral Information</h3>
      <p><strong>Referral ID:</strong> {referralData.id}</p>
      <p><strong>Date of Referral:</strong> {referralData.referralDate}</p>
      <p><strong>Referring Doctor:</strong> {currentDoctor.name} ({currentDoctor.specialization})</p>
      <p><strong>Status:</strong> Pending Consultation</p>
    </div>

    <div className="medical-records-attached" style={{ marginBottom: "25px", padding: "15px", backgroundColor: "#e8f5e8", borderRadius: "8px", border: "1px solid #4caf50" }}>
      <h4 style={{ fontSize: "16px", fontWeight: "bold", color: "#2e7d32", marginBottom: "10px" }}>✓ Complete Medical Records Attached</h4>
      <p style={{ margin: "0", color: "#2e7d32" }}>Patient medical history, examination findings, diagnostic reports, current treatment plan, and all relevant documentation included.</p>
    </div>

    <div className="patient-section" style={{ marginBottom: "25px" }}>
      <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px", color: "#333", borderBottom: "1px solid #ddd", paddingBottom: "5px" }}>Patient Information</h3>
      <div className="patient-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "15px" }}>
        {Object.entries(referralData.patientInfo).map(([key, value]) => (
          <div key={key} className="patient-item" style={{ padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "6px" }}>
            <strong>{key.replace(/([A-Z])/g, " $1") + ":"}</strong>
            <span style={{ marginLeft: "10px" }}>{value}</span>
          </div>
        ))}
        <div className="patient-item" style={{ padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "6px" }}>
          <strong>Medical History:</strong>
          <span style={{ marginLeft: "10px" }}>{selectedRecord["K/C/O"] ?? "--"}</span>
        </div>
      </div>
    </div>

    <div className="referral-details" style={{ marginBottom: "30px" }}>
      <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px", color: "#333", borderBottom: "1px solid #ddd", paddingBottom: "5px" }}>Referral Details</h3>
      {Object.entries(formData).filter(([key]) => !["consultantEmail", "consultantPhone"].includes(key)).map(([key, value]) => (
        <div key={key} className="detail-item" style={{ marginBottom: "15px", padding: "10px", border: "1px solid #e0e0e0", borderRadius: "6px" }}>
          <div className="detail-label" style={{ fontWeight: "bold", color: "#555", marginBottom: "5px" }}>{key.replace(/([A-Z])/g, " $1") + ":"}</div>
          <div className="detail-value" style={{ color: "#333" }}>{value || "Not specified"}</div>
        </div>
      ))}
    </div>

    <div className="clinical-summary" style={{ marginBottom: "25px", padding: "15px", backgroundColor: "#fff3cd", borderRadius: "8px", border: "1px solid #ffc107" }}>
      <h4 style={{ fontSize: "16px", fontWeight: "bold", color: "#856404", marginBottom: "10px" }}>Clinical Summary & Reason for Referral</h4>
      <p style={{ margin: "0", color: "#856404" }}>{formData.clinicalSummary || "Detailed clinical summary and specific questions for consultation are documented in the attached medical records."}</p>
    </div>
  </div>
);

const MedicalRecordsDetailsPreview = ({ selectedRecord, onClose }) => {
  if (!selectedRecord) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-auto m-4">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Patient Medical Records</h2>
              <p className="text-gray-600">Complete medical documentation for referral</p>
            </div>
            <button onClick={onClose} className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-gray-100">
              <X size={20} />
              Close
            </button>
          </div>

          <div className="bg-gradient-to-r from-[#01B07A] to-[#1A223F] rounded-xl p-6 mb-6 text-white">
            <h3 className="text-2xl font-bold mb-4">{selectedRecord.patientName}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-6 text-sm">
              <div>Age: {selectedRecord.age}</div>
              <div>Gender: {selectedRecord.sex}</div>
              <div>Hospital: {selectedRecord.hospitalName}</div>
              <div>Current Diagnosis: {selectedRecord.diagnosis}</div>
              <div>Medical History: {selectedRecord["K/C/O"] ?? "--"}</div>
            </div>
          </div>

          <section className="mb-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-4">Current Vitals</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {Object.entries(selectedRecord.vitals || {}).map(([key, value]) => (
                <div key={key} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-600 mb-1">{key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}</div>
                  <div className="text-sm font-semibold text-gray-800">{value}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-4">Clinical Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(selectedRecord?.medicalDetails || {}).map(([label, value]) => (
                <div key={label} className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="font-bold text-sm text-gray-600 mb-2">{label.replace(/([A-Z])/g, " $1")}</div>
                  <div className="text-gray-800 text-sm">{value || "N/A"}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-4">Current Prescriptions</h4>
            <DynamicTable
              columns={[
                { header: "Date", accessor: "date" },
                { header: "Prescribed By", accessor: "doctorName" },
                { header: "Medications", accessor: "medicines" },
                { header: "Instructions", accessor: "instructions" },
              ]}
              data={selectedRecord.prescriptionsData || []}
            />
          </section>

          <section className="mb-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-4">Diagnostic Reports</h4>
            <DynamicTable
              columns={[
                { header: "Date", accessor: "date" },
                { header: "Test/Investigation", accessor: "testName" },
                { header: "Result", accessor: "result" },
                { header: "Reference Range", accessor: "normalRange" },
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
              data={selectedRecord.labTestsData || []}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

const SecondOpinionReferral = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const printContentRef = useRef();
  
  // Current doctor information (would come from auth context in real app)
  const currentDoctor = {
    name: "Dr. Sarah Johnson",
    specialization: "Internal Medicine",
    hospitalId: "H001",
    doctorId: "D001"
  };

  const selectedRecord = location.state?.selectedRecord || {
    patientName: "John Doe", 
    age: "45", 
    sex: "Male", 
    id: "P001", 
    hospitalName: "General Hospital", 
    diagnosis: "Chest Pain - Rule out Cardiac Cause", 
    dateOfVisit: "2024-01-15", 
    "K/C/O": "Hypertension, Diabetes Mellitus", 
    vitals: { 
      bp: "140/90", 
      pulse: "80", 
      temp: "98.6°F",
      rr: "18",
      spo2: "98%",
      weight: "75kg",
      height: "170cm"
    }, 
    medicalDetails: {
      chiefComplaint: "Chest pain radiating to left arm since 2 days",
      presentIllness: "Patient presents with substernal chest pain, worse on exertion",
      pastHistory: "Hypertension for 5 years, Diabetes Mellitus Type 2 for 3 years",
      examination: "Tenderness over precordium, no murmurs heard",
      provisionalDiagnosis: "Unstable Angina vs NSTEMI",
      currentTreatment: "Aspirin, Atorvastatin, Metformin"
    }, 
    prescriptionsData: [
      { 
        date: "2024-01-15", 
        doctorName: "Dr. Sarah Johnson", 
        medicines: "Aspirin 75mg, Atorvastatin 20mg, Metformin 500mg", 
        instructions: "Aspirin once daily, Atorvastatin at bedtime, Metformin twice daily"
      }
    ], 
    labTestsData: [
      { 
        date: "2024-01-15", 
        testName: "ECG", 
        result: "T-wave inversion in V4-V6", 
        normalRange: "Normal", 
        status: "Abnormal"
      },
      { 
        date: "2024-01-15", 
        testName: "Troponin I", 
        result: "0.8 ng/mL", 
        normalRange: "<0.04 ng/mL", 
        status: "Elevated"
      }
    ],
  };

  const [formData, setFormData] = useState({ 
    consultantDoctor: "", 
    urgencyLevel: "", 
    consultationType: "", 
    clinicalSummary: "",
    additionalDocuments: "",
    consultantEmail: "", 
    consultantPhone: "",
  });

  const [showMedicalRecords, setShowMedicalRecords] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSending, setIsSending] = useState({ whatsapp: false, email: false });

  // Specialist doctors for referral
  const consultantDoctors = [
    "Dr. Rajesh Kumar - Cardiologist (Apollo Hospital)",
    "Dr. Priya Sharma - Interventional Cardiologist (Max Hospital)", 
    "Dr. Amit Patel - Cardiac Surgeon (Fortis Hospital)",
    "Dr. Sunita Reddy - Cardiothoracic Surgeon (AIIMS)",
    "Dr. Vikram Singh - Electrophysiologist (Medanta Hospital)"
  ];

  const urgencyLevels = [
    { label: "Routine (7-10 days)", value: "routine" }, 
    { label: "Semi-urgent (3-5 days)", value: "semi-urgent" }, 
    { label: "Urgent (24-48 hours)", value: "urgent" }, 
    { label: "Emergency (Same day)", value: "emergency" }
  ];

  const consultationTypes = [
    { label: "In-person Consultation", value: "in-person" }, 
    { label: "Telemedicine Consultation", value: "telemedicine" }, 
    { label: "Case Discussion", value: "case-discussion" }, 
    { label: "Procedure Opinion", value: "procedure-opinion" },
    { label: "Treatment Plan Review", value: "treatment-review" }
  ];

  const handleInputChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));
  const handleDoctorSelect = (doctor) => { 
    setFormData((prev) => ({ ...prev, consultantDoctor: doctor })); 
    setIsDropdownOpen(false); 
  };
  const handleBack = () => navigate(-1);

  const generateReferralData = () => ({ 
    id: `REF-${Date.now()}`, 
    referralDate: new Date().toLocaleDateString("en-GB"), 
    referringDoctor: currentDoctor,
    patientInfo: { 
      name: selectedRecord.patientName, 
      age: selectedRecord.age, 
      sex: selectedRecord.sex, 
      patientId: selectedRecord.id, 
      hospitalName: selectedRecord.hospitalName, 
      currentDiagnosis: selectedRecord.diagnosis, 
      visitDate: selectedRecord.dateOfVisit || selectedRecord.dateOfAdmission || selectedRecord.dateOfConsultation,
    }, 
  });

  const generateMessageContent = () => {
    const referralData = generateReferralData();
    return { 
      subject: `Medical Referral - ${referralData.patientInfo.name} (${referralData.id})`, 
      body: `MEDICAL REFERRAL FOR SECOND OPINION\n\nReferral Details:\n• Referral ID: ${referralData.id}\n• Date: ${referralData.referralDate}\n• Referring Doctor: ${currentDoctor.name} (${currentDoctor.specialization})\n• Status: Pending Consultation\n\nPatient Information:\n• Name: ${referralData.patientInfo.name}\n• Age: ${referralData.patientInfo.age}\n• Gender: ${referralData.patientInfo.sex}\n• Hospital: ${referralData.patientInfo.hospitalName}\n• Current Diagnosis: ${referralData.patientInfo.currentDiagnosis}\n• Visit Date: ${referralData.patientInfo.visitDate}\n• Medical History: ${selectedRecord["K/C/O"] ?? "--"}\n\nReferral Request Details:\n• Consultant Doctor: ${formData.consultantDoctor || "Not specified"}\n• Urgency Level: ${formData.urgencyLevel || "Not specified"}\n• Consultation Type: ${formData.consultationType || "Not specified"}\n• Clinical Summary: ${formData.clinicalSummary || "Not specified"}\n• Additional Documents: ${formData.additionalDocuments || "Not specified"}\n\nMedical Records: Complete patient medical history, examination findings, diagnostic reports, current treatment plan, and all relevant documentation are attached.\n\nGenerated on: ${new Date().toLocaleString()}\nFor queries, please contact: ${currentDoctor.name}` 
    };
  }

  const generatePrintTemplate = () => {
    const referralData = generateReferralData();
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 10px 0; text-transform: uppercase;">MEDICAL REFERRAL FOR SECOND OPINION</h1>
          <p style="font-size: 16px; color: #666; margin: 0;">Expert Medical Consultation Referral</p>
        </div>
        
        <div style="margin-bottom: 25px; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
          <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333;">Referral Information</h3>
          <p style="margin: 5px 0;"><strong>Referral ID:</strong> ${referralData.id}</p>
          <p style="margin: 5px 0;"><strong>Date of Referral:</strong> ${referralData.referralDate}</p>
          <p style="margin: 5px 0;"><strong>Referring Doctor:</strong> ${currentDoctor.name} (${currentDoctor.specialization})</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> Pending Consultation</p>
        </div>
        
        <div style="margin-bottom: 25px; padding: 15px; background-color: #e8f5e8; border-radius: 8px; border: 1px solid #4caf50;">
          <h4 style="font-size: 16px; font-weight: bold; color: #2e7d32; margin-bottom: 10px;">✓ Complete Medical Records Attached</h4>
          <p style="margin: 0; color: #2e7d32;">Patient medical history, examination findings, diagnostic reports, current treatment plan, and all relevant documentation included.</p>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Patient Information</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
            <div style="padding: 10px; background-color: #f8f9fa; border-radius: 6px;"><strong>Name:</strong> ${referralData.patientInfo.name}</div>
            <div style="padding: 10px; background-color: #f8f9fa; border-radius: 6px;"><strong>Age:</strong> ${referralData.patientInfo.age}</div>
            <div style="padding: 10px; background-color: #f8f9fa; border-radius: 6px;"><strong>Gender:</strong> ${referralData.patientInfo.sex}</div>
            <div style="padding: 10px; background-color: #f8f9fa; border-radius: 6px;"><strong>Patient ID:</strong> ${referralData.patientInfo.patientId}</div>
            <div style="padding: 10px; background-color: #f8f9fa; border-radius: 6px;"><strong>Hospital:</strong> ${referralData.patientInfo.hospitalName}</div>
            <div style="padding: 10px; background-color: #f8f9fa; border-radius: 6px;"><strong>Current Diagnosis:</strong> ${referralData.patientInfo.currentDiagnosis}</div>
            <div style="padding: 10px; background-color: #f8f9fa; border-radius: 6px;"><strong>Visit Date:</strong> ${referralData.patientInfo.visitDate}</div>
            <div style="padding: 10px; background-color: #f8f9fa; border-radius: 6px;"><strong>Medical History:</strong> ${selectedRecord["K/C/O"] ?? "--"}</div>
          </div>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Referral Details</h3>
          <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #e0e0e0; border-radius: 6px;">
            <div style="font-weight: bold; color: #555; margin-bottom: 5px;">Consultant Doctor:</div>
            <div style="color: #333;">${formData.consultantDoctor || "Not specified"}</div>
          </div>
          <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #e0e0e0; border-radius: 6px;">
            <div style="font-weight: bold; color: #555; margin-bottom: 5px;">Urgency Level:</div>
            <div style="color: #333;">${formData.urgencyLevel || "Not specified"}</div>
          </div>
          <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #e0e0e0; border-radius: 6px;">
            <div style="font-weight: bold; color: #555; margin-bottom: 5px;">Consultation Type:</div>
            <div style="color: #333;">${formData.consultationType || "Not specified"}</div>
          </div>
          <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #e0e0e0; border-radius: 6px;">
            <div style="font-weight: bold; color: #555; margin-bottom: 5px;">Clinical Summary:</div>
            <div style="color: #333;">${formData.clinicalSummary || "Not specified"}</div>
          </div>
          <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #e0e0e0; border-radius: 6px;">
            <div style="font-weight: bold; color: #555; margin-bottom: 5px;">Additional Documents:</div>
            <div style="color: #333;">${formData.additionalDocuments || "Not specified"}</div>
          </div>
        </div>
        
        <div style="margin-bottom: 25px; padding: 15px; background-color: #fff3cd; border-radius: 8px; border: 1px solid #ffc107;">
          <h4 style="font-size: 16px; font-weight: bold; color: #856404; margin-bottom: 10px;">Clinical Summary & Reason for Referral</h4>
          <p style="margin: 0; color: #856404;">${formData.clinicalSummary || "Detailed clinical summary and specific questions for consultation are documented in the attached medical records."}</p>
        </div>
      </div>
    `;
  };

  const generatePDF = async () => {
    const element = document.createElement("div");
    element.innerHTML = generatePrintTemplate();

    const opt = {
      margin: 1,
      filename: `medical-referral-${generateReferralData().id}.pdf`,
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
    if (!formData.consultantPhone) {
      toast.error("Please enter consultant's WhatsApp number");
      return;
    }

    setIsSending((prev) => ({ ...prev, whatsapp: true }));

    try {
      toast.info("Generating referral PDF...");
      const pdfBlob = await generatePDF();
      const messageContent = generateMessageContent();
      const whatsappMessage = `${messageContent.subject}\n\n${messageContent.body}\n\nReferral document has been generated and is ready for review.`;

      const response = await axios.get(`https://api.callmebot.com/whatsapp.php`, {
        params: {
          phone: `+91${formData.consultantPhone}`,
          text: whatsappMessage,
          apikey: "YOUR_API_KEY",
        },
        timeout: 15000,
      });

      console.log("✅ WhatsApp API Response:", response.data);
      toast.success(`Referral sent successfully to +91${formData.consultantPhone}!`);

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `medical-referral-${generateReferralData().id}.pdf`;
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
        link.download = `medical-referral-${generateReferralData().id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.warning("WhatsApp service unavailable. PDF downloaded instead. Please share manually.");
      } catch (pdfError) {
        toast.error("Failed to generate PDF: " + pdfError.message);
      }
    } finally {
      setIsSending((prev) => ({ ...prev, whatsapp: false }));
    }
  };

  const sendEmail = async () => {
    if (!formData.consultantEmail.trim()) {
      toast.error("Please enter consultant's email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.consultantEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSending((prev) => ({ ...prev, email: true }));

    try {
      toast.info("Generating referral PDF...");
      const pdfBlob = await generatePDF();
      const pdfBase64 = await blobToBase64(pdfBlob);
      const messageContent = generateMessageContent();

      emailjs.init("YOUR_USER_ID");

      const templateParams = {
        to_email: formData.consultantEmail,
        to_name: formData.consultantDoctor.split(' - ')[0] || "Doctor",
        from_name: currentDoctor.name,
        subject: messageContent.subject,
        message: messageContent.body,
        pdf_attachment: pdfBase64,
        filename: `medical-referral-${generateReferralData().id}.pdf`,
      };

      const response = await emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", templateParams);

      if (response.status === 200) {
        console.log("✅ Email sent successfully:", response);
        toast.success(`Referral sent successfully to ${formData.consultantEmail}!`);
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
        link.download = `medical-referral-${generateReferralData().id}.pdf`;
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

  const handlePrintOnly = () => {
    const printContent = generatePrintTemplate();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Medical Referral - ${generateReferralData().id}</title>
          <style>
            body { margin: 0; padding: 0; }
            @media print {
              body { print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
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
        <span className="font-medium">Back to Patient Records</span>
      </button>

      <div className="text-left mb-8">
        <div className="inline-flex items-center gap-3">
          <UserCheck size={32} className="primary-color" />
          <h1 className="h3-heading">Medical Referral for Second Opinion</h1>
        </div>
        <p className="text-gray-600 mt-2">Refer patient to specialist consultant for expert opinion</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} className="text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-800">Complete Medical Records Ready</h3>
              <p className="text-sm text-blue-700">Patient's complete medical documentation will be attached to the referral</p>
            </div>
          </div>
          <button onClick={() => setShowMedicalRecords(true)} className="view-btn">Review Medical Records</button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#01B07A] to-[#1A223F] rounded-xl p-6 mb-8 text-white">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <User size={20} />
          Patient Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p><span className="font-semibold">Patient Name:</span> {selectedRecord.patientName}</p>
            <p><span className="font-semibold">Age:</span> {selectedRecord.age}</p>
            <p><span className="font-semibold">Gender:</span> {selectedRecord.sex}</p>
            <p><span className="font-semibold">Medical History:</span> {selectedRecord["K/C/O"] ?? "--"}</p>
          </div>
          <div className="space-y-2">
            <p><span className="font-semibold">Hospital:</span> {selectedRecord.hospitalName}</p>
            <p><span className="font-semibold">Visit Date:</span> {selectedRecord.dateOfVisit || selectedRecord.dateOfAdmission || selectedRecord.dateOfConsultation}</p>
            <p><span className="font-semibold">Current Diagnosis:</span> {selectedRecord.diagnosis}</p>
            <p><span className="font-semibold">Referring Doctor:</span> {currentDoctor.name} ({currentDoctor.specialization})</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Referral Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Consultant Doctor <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button 
                type="button" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                className="w-full p-3 border border-gray-300 rounded-lg bg-white flex items-center justify-between"
              >
                <span className={formData.consultantDoctor ? "text-gray-900" : "text-gray-500"}>
                  {formData.consultantDoctor || "Select consultant doctor..."}
                </span>
                <ChevronDown size={18} className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {consultantDoctors.map((doctor) => (
                    <button 
                      key={doctor} 
                      type="button" 
                      onClick={() => handleDoctorSelect(doctor)} 
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors"
                    >
                      {doctor}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Urgency Level <span className="text-red-500">*</span>
            </label>
            <select 
              value={formData.urgencyLevel} 
              onChange={(e) => handleInputChange("urgencyLevel", e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">Select urgency level</option>
              {urgencyLevels.map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Consultation Type</label>
            <select 
              value={formData.consultationType} 
              onChange={(e) => handleInputChange("consultationType", e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">Select consultation type</option>
              {consultationTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Documents</label>
            <textarea
              value={formData.additionalDocuments}
              onChange={(e) => handleInputChange("additionalDocuments", e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="List any additional documents, reports, or files being sent with this referral..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Clinical Summary & Reason for Referral <span className="text-red-500">*</span>
          </label>
          <textarea 
            value={formData.clinicalSummary} 
            onChange={(e) => handleInputChange("clinicalSummary", e.target.value)} 
            rows={4} 
            className="w-full p-3 border border-gray-300 rounded-lg" 
            placeholder="Provide detailed clinical summary, current treatment, and specific reason for referral..."
          />
        </div>
      </div>

      <div className="flex justify-end items-center pt-6">
        <div className="flex gap-3">
          <button 
            onClick={() => setShowPrintPreview(true)} 
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            disabled={!formData.consultantDoctor || !formData.urgencyLevel || !formData.clinicalSummary}
          >
            <Printer size={18} />
            Generate Referral & Send
          </button>
        </div>
      </div>

      {(!formData.consultantDoctor || !formData.urgencyLevel || !formData.clinicalSummary) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800 text-sm">
            <AlertTriangle size={16} className="inline mr-2" />
            Please fill in all required fields (marked with *) to generate the referral
          </p>
        </div>
      )}

      {showPrintPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-[#01B07A] to-[#1A223F] text-white rounded-t-2xl">
              <h3 className="text-xl font-semibold">Medical Referral Preview</h3>
              <button onClick={() => setShowPrintPreview(false)} className="text-white hover:text-gray-200 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              <div>
                <div className="bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden text-sm" style={{ fontFamily: "Times, serif" }}>
                  <PrintContent 
                    referralData={generateReferralData()} 
                    selectedRecord={selectedRecord} 
                    formData={formData} 
                    currentDoctor={currentDoctor}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-800">Send Referral Options</h4>
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Consultant Contact Information</h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Phone size={16} className="inline mr-2" />
                        Consultant WhatsApp Number
                      </label>
                      <input 
                        type="tel" 
                        value={formData.consultantPhone} 
                        onChange={(e) => handleInputChange("consultantPhone", e.target.value)} 
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="Enter consultant's WhatsApp number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <AtSign size={16} className="inline mr-2" />
                        Consultant Email Address
                      </label>
                      <input 
                        type="email" 
                        value={formData.consultantEmail} 
                        onChange={(e) => handleInputChange("consultantEmail", e.target.value)} 
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="Enter consultant's email address"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={sendWhatsAppMessage} 
                    disabled={!formData.consultantPhone || isSending.whatsapp} 
                    className={`flex flex-col items-center p-4 rounded-lg border transition-all ${
                      formData.consultantPhone && !isSending.whatsapp 
                        ? "border-green-300 hover:bg-green-50 hover:scale-105" 
                        : "border-gray-300 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    {isSending.whatsapp ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    ) : (
                      <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-8 h-8 mb-2" />
                    )}
                    <span className="text-xs font-medium text-center">
                      {isSending.whatsapp ? "Sending..." : "WhatsApp"}
                    </span>
                  </button>

                  <button 
                    onClick={sendEmail} 
                    disabled={!formData.consultantEmail || isSending.email} 
                    className={`flex flex-col items-center p-4 rounded-lg border transition-all ${
                      formData.consultantEmail && !isSending.email 
                        ? "border-red-300 hover:bg-red-50 hover:scale-105" 
                        : "border-gray-300 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    {isSending.email ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                    ) : (
                      <img src="https://img.icons8.com/color/48/gmail--v1.png" alt="Email" className="w-7 h-7 mb-2" />
                    )}
                    <span className="text-xs font-medium text-center">
                      {isSending.email ? "Sending..." : "Email"}
                    </span>
                  </button>

                  <button 
                    onClick={handlePrintOnly} 
                    className="flex flex-col items-center p-4 rounded-lg border border-gray-300 hover:bg-gray-50 hover:scale-105 transition-all"
                  >
                    <img src="https://img.icons8.com/ios-filled/50/000000/print.png" alt="Print" className="w-6 h-6 mb-2" />
                    <span className="text-xs font-medium text-center">Print PDF</span>
                  </button>
                </div>

                {!formData.consultantPhone && !formData.consultantEmail && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm">
                      <strong>Note:</strong> Please provide consultant's WhatsApp number or email address to send the referral document.
                    </p>
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

export default SecondOpinionReferral;


