import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaMapMarkerAlt, FaPhoneAlt, FaDownload, FaPrint, FaShareAlt } from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const TrackAppointment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const printRef = useRef();

  useEffect(() => { fetchAppointment(); const interval = setInterval(fetchAppointment, 10000); return () => clearInterval(interval); }, [bookingId]);

  const fetchAppointment = async () => {
    try { const res = await axios.get("https://680b3642d5075a76d98a3658.mockapi.io/Lab/payment"); const found = res.data.find((item) => item.bookingId === bookingId); if (!found) throw new Error("Appointment not found"); setAppointment(found); }
    catch (error) { console.error("Error fetching appointment:", error); alert("Failed to fetch appointment details. Please try again later."); }
  };

  const handleDownloadReport = async () => {
    const input = printRef.current; const canvas = await html2canvas(input); const imgData = canvas.toDataURL("image/png"); const pdf = new jsPDF("p", "mm", "a4"); const imgProps = pdf.getImageProperties(imgData); const pdfWidth = pdf.internal.pageSize.getWidth(); const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width; pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight); pdf.save(`${appointment?.testTitle || "Lab_Report"}.pdf`);
  };

  const handlePrintReceipt = () => {
    const printContent = printRef.current; const printWindow = window.open("", "", "width=900,height=650"); printWindow.document.write('<html><head><title>Print Receipt</title><style>body{font-family:sans-serif;padding:20px} h1{margin-bottom:20px}</style></head><body>'); printContent.querySelectorAll("button").forEach((btn) => btn.remove()); printWindow.document.write(printRef.current.innerHTML); printWindow.document.close(); printWindow.print();
  };

  const handleShareDetails = () => navigator.share ? navigator.share({ title: "Track Your Appointment", text: `Appointment for ${appointment?.patientName} at ${appointment?.labName}`, url: window.location.href }) : alert("Sharing not supported in this browser.");

  const steps = ["Appointment Confirmed", "Technician On the Way", "Sample Collected", "Test Processing", "Report Ready"];
  const getCurrentStep = (status) => ({ "Appointment Confirmed": 0, "Technician On the Way": 1, "Sample Collected": 2, "Test Processing": 3, "Report Ready": 4 }[status] || 0);
  const currentStep = appointment ? getCurrentStep(appointment?.status) : 0;

  if (!appointment) return <div className="paragraph text-center mt-20">Loading appointment details...</div>;

  return (
    <div className="p-4 sm:p-6 rounded-2xl mt-4 sm:mt-6">
      <button className="paragraph mb-4 sm:mb-6 hover:underline transition-all duration-300 flex items-center gap-1" onClick={() => navigate("/patientdashboard/app", { state: { activeTab: "lab" } })}>← Back to Home</button>
      <h1 className="h4-heading text-center sm:text-left">Appointment Summary</h1>
      <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8" ref={printRef}>
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <div className="space-y-6 sm:space-y-10 mt-2">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 sm:gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div className={`mt-1 w-5 h-5 sm:mt-2 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-all duration-700 ease-in-out ${idx < currentStep ? "bg-[var(--primary-color)] text-white" : idx === currentStep ? "bg-[var(--accent-color)] text-[#0e1630] animate-pulse" : "bg-[var(--color-surface)] border-2 border-gray-300"}`}><span className={`w-1.5 h-1.5 rounded-full ${idx <= currentStep ? "bg-[var(--color-surface)]" : "bg-gray-300"}`} /></div>
                    {idx < steps.length - 1 && <div className={`w-0.5 flex-1 ${idx < currentStep ? "bg-[#0e1630]" : "bg-gray-300"} transition-all duration-700 ease-in-out`} />}
                  </div>
                  <div className="pt-1">
                    <p className={`paragraph font-semibold ${idx === currentStep ? "text-[#0e1630]" : "text-gray-700"}`}>{step}</p>
                    {idx === currentStep && <p className="paragraph text-sm sm:text-base">{new Date(appointment?.date).toDateString()}</p>}
                  </div>
                </div>
              ))}
            </div>
            <div className="card-stat card-border-primary p-4 sm:p-6">
              <h2 className="h4-heading mb-4 sm:mb-6">Appointment Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h3 className="h4-heading mb-2">Test Information</h3>
                  <p className="paragraph"><strong>Test Name:</strong> {appointment?.testTitle}</p>
                  <p className="paragraph"><strong>Test Code:</strong> {appointment?.testCode || "N/A"}</p>
                  <p className="paragraph"><strong>Category:</strong> {appointment?.category || "N/A"}</p>
                  <p className="paragraph"><strong>Report Time:</strong> {appointment?.reportTime || "24-48 hours"}</p>
                </div>
                <div>
                  <h3 className="h4-heading mb-2">Appointment Information</h3>
                  <p className="paragraph"><strong>Date:</strong> {new Date(appointment?.date).toDateString()}</p>
                  <p className="paragraph"><strong>Time:</strong> {appointment?.time}</p>
                  <p className="paragraph"><strong>Type:</strong> {appointment?.appointmentType || "Lab Visit"}</p>
                  <p className="paragraph"><strong>Payment:</strong> {appointment?.paymentStatus}</p>
                </div>
              </div>
              <hr className="my-3 sm:my-4" />
              <div>
                <h3 className="h4-heading mb-2">Patient Information</h3>
                <p className="paragraph"><strong>Name:</strong> {appointment?.patientName}</p>
                <p className="paragraph"><strong>Phone:</strong> {appointment?.phone}</p>
              </div>
            </div>
          </div>
          <div className="space-y-6 sm:space-y-8">
            <div className="card-stat card-border-accent p-4 sm:p-6">
              <h3 className="h4-heading mb-3 sm:mb-4">Lab Information</h3>
              <p className="paragraph font-semibold">{appointment?.labName}</p>
              <p className="paragraph flex items-center gap-1 mt-1 sm:mt-2"><FaMapMarkerAlt /> {appointment?.location}</p>
              <p className="paragraph flex items-center gap-1 mt-1"><FaPhoneAlt /> {appointment?.labPhone || "+91 98765 43210"}</p>
              <div className="border-t my-3 sm:my-4"></div>
              <p className="paragraph"><strong>Amount Paid:</strong> ₹{appointment?.amountPaid}</p>
              <p className="paragraph"><strong>Payment Status:</strong> {appointment?.paymentStatus}</p>
            </div>
            <div className="card-stat card-border-primary space-y-3 sm:space-y-4 p-4 sm:p-6">
              <h3 className="h4-heading mb-3 sm:mb-4">Actions</h3>
              <button onClick={handleDownloadReport} className="btn btn-primary w-full flex items-center justify-center gap-2"><FaDownload /> <span className="text-white">Download Report</span></button>
              <button onClick={handlePrintReceipt} className="btn btn-secondary w-full flex items-center justify-center gap-2"><FaPrint /> <span className="paragraph">Print Receipt</span></button>
              <button onClick={handleShareDetails} className="btn btn-secondary w-full flex items-center justify-center gap-2"><FaShareAlt /> <span className="paragraph">Share Details</span></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackAppointment;
