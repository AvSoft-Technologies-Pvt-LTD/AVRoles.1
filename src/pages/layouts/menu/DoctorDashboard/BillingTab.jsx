
// import React, { useState, useRef, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { CreditCard, Camera, Upload, X, Send, Globe, Phone, Mail, Printer, Share2 } from 'lucide-react';
// import DynamicTable from '../../../../components/microcomponents/DynamicTable';

// const languageMap = {
//   'English': 'en',
//   'Hindi': 'hi',
//   'Marathi': 'mr',
//   'Gujarati': 'gu',
//   'Tamil': 'ta',
//   'Telugu': 'te',
//   'Bengali': 'bn',
//   'Kannada': 'kn',
//   'Malayalam': 'ml',
//   'Punjabi': 'pa'
// };

// const BillingTab = ({
//   patientName,
//   gender,
//   age,
//   email,
//   phone,
//   address,
//   patientEmail,
//   isNewlyAdded,
//   pharmacyBills,
//   setPharmacyBills,
//   labBills,
//   setLabBills,
//   hospitalBills,
//   setHospitalBills,
//   extractedBilling,
//   setExtractedBilling
// }) =>  {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Tab and modal states
//   const [billingActiveTab, setBillingActiveTab] = useState("pharmacy");
//   const [billingModalOpen, setBillingModalOpen] = useState(false);
//   const [billingModalData, setBillingModalData] = useState({});
//   // Mail modal states
//   const [billingMailModalOpen, setBillingMailModalOpen] = useState(false);
//   const [billingMailFile, setBillingMailFile] = useState(null);
//   const [billingMailEmail, setBillingMailEmail] = useState(patientEmail || "");
//   const [billingMailSending, setBillingMailSending] = useState(false);
//   const [cameraModalOpen, setCameraModalOpen] = useState(false);
//   const [capturedImage, setCapturedImage] = useState(null);
//   const [cameraError, setCameraError] = useState("");
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const billingFileInputRef = useRef();

//   // Share modal states
//   const [isShareModalOpen, setIsShareModalOpen] = useState(false);
//   const [shareEmail, setShareEmail] = useState(patientEmail || "");
//   const [sharePhone, setSharePhone] = useState("");
//   const [language, setLanguage] = useState('English');
//   const [isTranslating, setIsTranslating] = useState(false);

//   // Handle new billing record from BillingForm
//   useEffect(() => {
//     if (location.state?.newBillingRecord && location.state?.success) {
//       const { newBillingRecord, billingType } = location.state;
      
//       // Add the new record to the appropriate state
//       if (billingType === 'pharmacy') {
//         setPharmacyBills(prev => [...prev, newBillingRecord]);
//         setBillingActiveTab('pharmacy');
//       } else if (billingType === 'labs') {
//         setLabBills(prev => [...prev, newBillingRecord]);
//         setBillingActiveTab('labs');
//       } else if (billingType === 'hospital') {
//         setHospitalBills(prev => [...prev, newBillingRecord]);
//         setBillingActiveTab('hospital');
//       }

//       // Clear the location state to prevent re-adding on re-renders
//       window.history.replaceState({}, document.title);
//     }
//   }, [location.state, setPharmacyBills, setLabBills, setHospitalBills]);

//   // Camera functions
//   const startCamera = async () => {
//     setCameraError("");
//     try {
//       const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
//       if (videoRef.current) {
//         videoRef.current.srcObject = mediaStream;
//       }
//     } catch (error) {
//       setCameraError("Unable to access camera. Please check permissions.");
//     }
//   };

//   const stopCamera = () => {
//     if (videoRef.current && videoRef.current.srcObject) {
//       videoRef.current.srcObject.getTracks().forEach(track => track.stop());
//       videoRef.current.srcObject = null;
//     }
//   };

//   const capturePhoto = () => {
//     if (videoRef.current && canvasRef.current) {
//       const video = videoRef.current;
//       const canvas = canvasRef.current;
//       const context = canvas.getContext("2d");
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;
//       context.drawImage(video, 0, 0, canvas.width, canvas.height);
//       canvas.toBlob(blob => {
//         setCapturedImage(blob);
//       }, "image/jpeg", 0.8);
//     }
//   };

//   const retakePhoto = () => {
//     setCapturedImage(null);
//     startCamera();
//   };

//   const useCapturedPhoto = () => {
//     if (capturedImage) {
//       const fileName = `billing_photo_${Date.now()}.jpg`;
//       const file = new File([capturedImage], fileName, { type: "image/jpeg" });
//       setBillingMailFile(file);
//       closeCameraModal();
//     }
//   };

//   const openCameraModal = () => {
//     setCameraModalOpen(true);
//     setCapturedImage(null);
//     setCameraError("");
//     setTimeout(startCamera, 100);
//   };

//   const closeCameraModal = () => {
//     stopCamera();
//     setCameraModalOpen(false);
//     setCapturedImage(null);
//     setCameraError("");
//   };

//   // Billing fields by tab
//   const billingFields = {
//     pharmacy: [
//       { name: "medicineName", label: "Medicine Name", type: "text" },
//       { name: "quantity", label: "Quantity", type: "number" },
//       { name: "unitPrice", label: "Unit Price (₹)", type: "number" },
//       { name: "totalPrice", label: "Total Price (₹)", type: "number" },
//       { name: "date", label: "Date", type: "date" }
//     ],
//     labs: [
//       { name: "testName", label: "Test Name", type: "text" },
//       { name: "cost", label: "Cost (₹)", type: "number" },
//       { name: "date", label: "Date", type: "date" },
//       { name: "paymentStatus", label: "Payment Status", type: "select", options: ["Paid", "Pending"] }
//     ],
//     hospital: [
//       { name: "billType", label: "Bill Type", type: "text" },
//       { name: "amount", label: "Amount (₹)", type: "number" },
//       { name: "paymentMode", label: "Payment Mode", type: "select", options: ["Insurance", "Cash"] },
//       { name: "status", label: "Status", type: "select", options: ["Paid", "Pending"] },
//       { name: "billDate", label: "Bill Date", type: "date" }
//     ]
//   };

//   // Column definitions
//   const pharmacyColumns = [
//     { header: "Medicine Name", accessor: "medicineName" },
//     { header: "Quantity", accessor: "quantity" },
//     { header: "Unit Price (₹)", accessor: "unitPrice" },
//     { header: "Total Price (₹)", accessor: "totalPrice" },
//     { header: "Date", accessor: "date" },
//     { header: "Invoice ID", accessor: "invoiceId" }
//   ];

//   const labBillColumns = [
//     { header: "Test Name", accessor: "testName" },
//     { header: "Cost (₹)", accessor: "cost" },
//     { header: "Date", accessor: "date" },
//     {
//       header: "Payment Status",
//       accessor: "paymentStatus",
//       cell: (row) => (
//         <span className={`status-badge ${row.paymentStatus === "Paid" ? "status-completed" : "status-pending"}`}>
//           {row.paymentStatus}
//         </span>
//       )
//     },
//     { header: "Invoice ID", accessor: "invoiceId" }
//   ];

//   const hospitalBillColumns = [
//     { header: "Bill Type", accessor: "billType" },
//     { header: "Amount (₹)", accessor: "amount" },
//     { header: "Payment Mode", accessor: "paymentMode" },
//     {
//       header: "Status",
//       accessor: "status",
//       cell: (row) => (
//         <span className={`status-badge ${row.status === "Paid" ? "status-completed" : "status-pending"}`}>
//           {row.status}
//         </span>
//       )
//     },
//     { header: "Bill Date", accessor: "billDate" },
//     { header: "Invoice ID", accessor: "invoiceId" }
//   ];

//   const billingTabs = [
//     { value: "pharmacy", label: "Pharmacy" },
//     { value: "labs", label: "Labs" },
//     { value: "hospital", label: "Hospital Bills" }
//   ];

//   const printContent = (contentId, title) => {
//     const WinPrint = window.open('', '', 'width=900,height=650');
//     WinPrint.document.write(`
//       <html>
//         <head>
//           <title>${title}</title>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 20px; }
//             table { width: 100%; border-collapse: collapse; }
//             th, td { padding: 8px 12px; border: 1px solid #ccc; text-align: left; }
//             h2 { margin-bottom: 20px; }
//           </style>
//         </head>
//         <body>${document.getElementById(contentId).innerHTML}</body>
//       </html>
//     `);
//     WinPrint.document.close();
//     WinPrint.focus();
//     WinPrint.print();
//     WinPrint.close();
//   };

//   // Handlers
//   const handleAddBillingRecord = (data) => {
//     if (billingActiveTab === "pharmacy") {
//       setPharmacyBills((prev) => [
//         ...prev,
//         { ...data, id: prev.length + 1 }
//       ]);
//     } else if (billingActiveTab === "labs") {
//       setLabBills((prev) => [
//         ...prev,
//         { ...data, id: prev.length + 1 }
//       ]);
//     } else if (billingActiveTab === "hospital") {
//       setHospitalBills((prev) => [
//         ...prev,
//         { ...data, id: prev.length + 1 }
//       ]);
//     }
//     setBillingModalOpen(false);
//     setBillingModalData({});
//   };

//   const handleSendBillingMail = async () => {
//     setBillingMailSending(true);
//     setTimeout(() => {
//       alert(`File sent to ${billingMailEmail}`);
//       setBillingMailModalOpen(false);
//       setBillingMailFile(null);
//       setBillingMailEmail("");
//       setBillingMailSending(false);
//     }, 1500);
//   };

//   const handleBillingUpload = () => {
//     billingFileInputRef.current?.click();
//   };

//   const handleBillingFileChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     if (file.type === 'text/plain') {
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         const text = event.target.result;
//         const rows = parseBillingText(text);
//         setExtractedBilling(rows);
//       };
//       reader.readAsText(file);
//     } else {
//       let placeholderRow = {};
//       if (billingActiveTab === "pharmacy") {
//         placeholderRow = {
//           medicineName: '[OCR extraction needed]',
//           quantity: 0,
//           unitPrice: 0,
//           totalPrice: 0,
//           date: new Date().toLocaleDateString()
//         };
//       } else if (billingActiveTab === "labs") {
//         placeholderRow = {
//           testName: '[OCR extraction needed]',
//           cost: 0,
//           date: new Date().toLocaleDateString(),
//           paymentStatus: 'Pending'
//         };
//       } else if (billingActiveTab === "hospital") {
//         placeholderRow = {
//           billType: '[OCR extraction needed]',
//           amount: 0,
//           paymentMode: 'Cash',
//           status: 'Pending',
//           billDate: new Date().toLocaleDateString()
//         };
//       }
//       setExtractedBilling([placeholderRow]);
//     }
//   };

//   const parseBillingText = (text) => {
//     const lines = text.split('\n').filter(line => line.trim());
//     const billingData = [];

//     lines.forEach(line => {
//       if (line.trim()) {
//         let row = {};

//         if (billingActiveTab === "pharmacy") {
//           row = {
//             medicineName: '',
//             quantity: 0,
//             unitPrice: 0,
//             totalPrice: 0,
//             date: new Date().toLocaleDateString()
//           };
//         } else if (billingActiveTab === "labs") {
//           row = {
//             testName: '',
//             cost: 0,
//             date: new Date().toLocaleDateString(),
//             paymentStatus: 'Pending'
//           };
//         } else if (billingActiveTab === "hospital") {
//           row = {
//             billType: '',
//             amount: 0,
//             paymentMode: 'Cash',
//             status: 'Pending',
//             billDate: new Date().toLocaleDateString()
//           };
//         }

//         const parts = line.split(/[,;]/);
//         if (billingActiveTab === "pharmacy" && parts.length > 0) {
//           row.medicineName = parts[0].trim();
//           if (parts.length > 1) row.quantity = parseInt(parts[1]) || 1;
//           if (parts.length > 2) row.unitPrice = parseFloat(parts[2]) || 0;
//           if (parts.length > 3) row.totalPrice = parseFloat(parts[3]) || row.quantity * row.unitPrice;
//         } else if (billingActiveTab === "labs" && parts.length > 0) {
//           row.testName = parts[0].trim();
//           if (parts.length > 1) row.cost = parseFloat(parts[1]) || 0;
//         } else if (billingActiveTab === "hospital" && parts.length > 0) {
//           row.billType = parts[0].trim();
//           if (parts.length > 1) row.amount = parseFloat(parts[1]) || 0;
//         }

//         billingData.push(row);
//       }
//     });

//     return billingData;
//   };

//   const getBillingData = () => {
//     switch (billingActiveTab) {
//       case "pharmacy": return pharmacyBills || [];
//       case "labs": return labBills || [];
//       case "hospital": return hospitalBills || [];
//       default: return [];
//     }
//   };

//   const getBillingColumns = () => {
//     switch (billingActiveTab) {
//       case "pharmacy": return pharmacyColumns;
//       case "labs": return labBillColumns;
//       case "hospital": return hospitalBillColumns;
//       default: return pharmacyColumns;
//     }
//   };

//   // Share modal handlers
//   const openShareModal = () => setIsShareModalOpen(true);
//   const closeShareModal = () => setIsShareModalOpen(false);

//   // WhatsApp link (dummy for now)
//   const whatsappLink = `https://wa.me/${sharePhone.replace(/[^0-9]/g, '')}?text=Billing%20details%20attached`;

//   if (isNewlyAdded) {
//     return (
//       <div className="space-y-6">
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
//           <h4 className="font-semibold text-blue-800 mb-4">Upload Billing Document</h4>
//           <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center">
//             <p>OCR Prescription Reader Component</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const billingManualRecords = getBillingData();
//   const hasManualRecords = billingManualRecords && billingManualRecords.length > 0;
//   const hasExtractedBilling = extractedBilling && extractedBilling.length > 0;

//   // Simple Add Billing Modal (no ReusableModal)
//   const [manualForm, setManualForm] = useState({});
//   const handleManualInput = (e) => {
//     const { name, value } = e.target;
//     setManualForm((prev) => ({ ...prev, [name]: value }));
//   };
//   const handleManualSubmit = (e) => {
//     e.preventDefault();
//     handleAddBillingRecord(manualForm);
//     setManualForm({});
//   };

//   // Go to BillingForm page with current tab context
// // ...existing code...

// const handleGoToAddBillingPage = () => {
//   navigate('/doctordashboard/add-billing', {
//     state: {
//       billingType: billingActiveTab,
//       patientName: patientName,
//       patientEmail: patientEmail,
//       phone: phone,
//       gender: gender,
//       age: age,
//       address: address
//     }
//   });
// };


// // ...existing code...

//   return (
//     <div className="space-y-6">
//       {/* Billing tabs */}
//       {billingTabs.length > 0 && (
//         <div className="flex items-center justify-between mb-4">
//           <div className="flex gap-4">
//             {billingTabs.map((tab) => (
//               <button
//                 key={tab.value}
//                 onClick={() => setBillingActiveTab(tab.value)}
//                 className={`relative cursor-pointer flex items-center gap-1 px-4 py-2 font-medium transition-colors duration-300
//                   ${billingActiveTab === tab.value
//                     ? "text-[var(--primary-color)] after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-[var(--primary-color)]"
//                     : "text-gray-500 hover:text-[var(--accent-color)] before:content-[''] before:absolute before:left-0 before:bottom-0 before:h-[2px] before:w-0 before:bg-[var(--accent-color)] before:transition-all before:duration-300 hover:before:w-full"
//                   }`}
//               >
//                 {tab.label}
//               </button>
//             ))}
//           </div>
//           <div className="flex gap-3">
           
//             <button
//               className="flex items-center gap-2 px-4 py-2 bg-[var(--primary-color)] text-white rounded hover:bg-[var(--accent-color)] rounded-full"
//               onClick={handleGoToAddBillingPage}
//               title="Add Manually"
//             >
//               + Add Bill
//             </button>
//             {/* Share Button */}
//             <button
//               className="flex items-center gap-2 px-4 py-2 bg-[#01D48C] rounded-full text-white rounded hover:bg-[#0E1630] transition"
//               onClick={openShareModal}
//               title="Share Billing"
//             >
//               <Share2 size={18} /> 
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
//         {/* Show extracted billing data */}
//         {hasExtractedBilling && (
//           <div className="mb-6">
//             <h5 className="font-semibold text-[var(--primary-color)] mb-3">Extracted Billing Data:</h5>
//             <div id="printable-billing-table">
//               <DynamicTable
//                 columns={getBillingColumns()}
//                 data={extractedBilling}
//               />
//             </div>
//           </div>
//         )}

//         {/* Show manually added billing records */}
//         {hasManualRecords && (
//           <div className="mb-6">
//             <h5 className="font-semibold text-[var(--primary-color)] mb-3">
//               {billingActiveTab.charAt(0).toUpperCase() + billingActiveTab.slice(1)} Records:
//             </h5>
//             <div id="printable-billing-table">
//               <DynamicTable
//                 columns={getBillingColumns()}
//                 data={getBillingData()}
//                 onTabChange={setBillingActiveTab}
//               />
//             </div>
//           </div>
//         )}

//         {/* Show message when no records */}
//         {!hasManualRecords && !hasExtractedBilling && (
//           <div className="text-center py-12">
//             <div className="text-gray-400 mb-4">
//               <CreditCard size={48} className="mx-auto" />
//             </div>
//             <h3 className="text-lg font-medium text-gray-600 mb-2">
//               No {billingActiveTab} records found
//             </h3>
//             <p className="text-gray-500 mb-4">
//               Start by adding a new billing record or uploading documents
//             </p>
//             <button
//               onClick={handleGoToAddBillingPage}
//               className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//             >
//               Add First Record
//             </button>
//           </div>
//         )}

//         {/* Billing Mail Modal */}
//         {billingMailModalOpen && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
//             <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8 animate-fadeIn transition-all">
//               <button
//                 className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
//                 onClick={() => setBillingMailModalOpen(false)}
//                 title="Close"
//               >
//                 <X size={22} />
//               </button>
//               <h2 className="text-2xl font-semibold text-blue-800 mb-6 text-center tracking-tight">
//                 📧 Send Billing via Email
//               </h2>
//               <div className="mb-5">
//                 <label className="block text-sm font-medium text-gray-600 mb-1">Patient Email</label>
//                 <input
//                   type="email"
//                   className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                   placeholder="Enter patient email"
//                   value={billingMailEmail}
//                   onChange={e => setBillingMailEmail(e.target.value)}
//                   required
//                   readOnly={!!patientEmail}
//                 />
//               </div>
//               <div className="mb-5">
//                 <label className="block text-sm font-medium text-gray-600 mb-1">Attach File</label>
//                 <div className="flex flex-wrap sm:flex-nowrap gap-2">
//                   <input
//                     type="file"
//                     accept=".pdf,.jpg,.jpeg,.png,.docx,.txt"
//                     className="flex-1 min-w-0 rounded-lg border border-gray-300 px-4 py-[9px] text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                     onChange={e => setBillingMailFile(e.target.files[0])}
//                   />
//                   <button
//                     onClick={openCameraModal}
//                     className="flex items-center gap-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm font-medium"
//                     title="Take a photo"
//                   >
//                     <Camera size={16} /> Take Photo
//                   </button>
//                 </div>
//                 {billingMailFile && (
//                   <div className="mt-2 text-sm text-blue-700 bg-blue-50 px-3 py-1 rounded-full inline-block">
//                     Selected: {billingMailFile.name}
//                   </div>
//                 )}
//               </div>
//               <button
//                 className={`w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-medium transition 
//                   ${billingMailEmail && billingMailFile && !billingMailSending
//                     ? "bg-blue-600 hover:bg-blue-700"
//                     : "bg-blue-300 cursor-not-allowed"}`}
//                 onClick={handleSendBillingMail}
//                 disabled={!billingMailEmail || !billingMailFile || billingMailSending}
//               >
//                 {billingMailSending ? (
//                   <>
//                     <span className="loader-mini" /> Sending...
//                   </>
//                 ) : (
//                   <>
//                     <Send size={18} /> Send
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Camera Modal for billing photo */}
//         {cameraModalOpen && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
//             <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden">
//               <button
//                 className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition"
//                 onClick={closeCameraModal}
//                 title="Close Camera"
//               >
//                 <X size={24} />
//               </button>
//               <h4 className="text-xl font-semibold text-gray-800 mb-4 text-center">📸 Capture Billing Photo</h4>
//               {cameraError && (
//                 <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
//                   <p className="text-red-700 text-sm text-center">{cameraError}</p>
//                 </div>
//               )}
//               <div className="relative bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
//                 {!capturedImage ? (
//                   <>
//                     <video
//                       ref={videoRef}
//                       autoPlay
//                       playsInline
//                       muted
//                       className="w-full h-full object-cover"
//                     />
//                   </>
//                 ) : (
//                   <>
//                     <img
//                       src={URL.createObjectURL(capturedImage)}
//                       alt="Captured"
//                       className="w-full h-full object-cover"
//                     />
//                     <div className="absolute top-4 left-4">
//                       <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
//                         ✓ Photo Captured
//                       </div>
//                     </div>
//                   </>
//                 )}
//                 <canvas ref={canvasRef} style={{ display: 'none' }} />
//               </div>
//               <div className="flex items-center justify-center gap-4 mt-6">
//                 {!capturedImage ? (
//                   <button
//                     onClick={capturePhoto}
//                     className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition font-medium text-lg shadow-lg"
//                   >
//                     <Upload size={20} /> 📸 Capture Photo
//                   </button>
//                 ) : (
//                   <div className="flex gap-4">
//                     <button
//                       onClick={retakePhoto}
//                       className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition font-medium shadow-lg"
//                     >
//                       <Upload size={20} /> Retake
//                     </button>
//                     <button
//                       onClick={useCapturedPhoto}
//                       className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition font-medium shadow-lg"
//                     >
//                       <Send size={20} /> ✓ Use Photo
//                     </button>
//                   </div>
//                 )}
//               </div>
//               {capturedImage && (
//                 <p className="text-xs text-green-600 text-center mt-2">
//                   ✓ Photo captured successfully! Click "✓ Use Photo" to attach it to your email.
//                 </p>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Simple Manual Add Modal */}
//       {billingModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-40">
//           <div className="relative bg-white rounded-xl shadow-lg p-6 min-w-[350px] max-w-[100vw] w-full md:w-[400px]">
//             <button
//               className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-200"
//               onClick={() => {
//                 setBillingModalOpen(false);
//                 setManualForm({});
//               }}
//               title="Close"
//             >
//               <X size={20} />
//             </button>
//             <h2 className="text-xl font-semibold mb-4">Add {billingActiveTab.charAt(0).toUpperCase() + billingActiveTab.slice(1)} Record</h2>
//             <form onSubmit={handleManualSubmit} className="space-y-4">
//               {(billingFields[billingActiveTab] || []).map(field => (
//                 <div key={field.name}>
//                   <label className="block text-sm font-medium mb-1">{field.label}</label>
//                   {field.type === "select" ? (
//                     <select
//                       name={field.name}
//                       value={manualForm[field.name] || ""}
//                       onChange={handleManualInput}
//                       className="w-full border border-gray-300 rounded px-3 py-2"
//                       required
//                     >
//                       <option value="">Select</option>
//                       {field.options.map(opt => (
//                         <option key={opt} value={opt}>{opt}</option>
//                       ))}
//                     </select>
//                   ) : (
//                     <input
//                       type={field.type}
//                       name={field.name}
//                       value={manualForm[field.name] || ""}
//                       onChange={handleManualInput}
//                       className="w-full border border-gray-300 rounded px-3 py-2"
//                       required={field.type !== "date"}
//                     />
//                   )}
//                 </div>
//               ))}
//               <div className="flex gap-2 justify-end">
//                 <button
//                   type="button"
//                   className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
//                   onClick={() => { setBillingModalOpen(false); setManualForm({}); }}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
//                 >
//                   Add Record
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Share Modal */}
//       {isShareModalOpen && (
//         <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 bg-opacity-50">
//           <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
//             <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-[#01D48C] to-[#0E1630] text-white">
//               <h3 className="text-xl font-semibold ">Billing Preview</h3>
//               <button onClick={closeShareModal} className="text-gray-200 hover:text-gray-400">
//                 <X size={24} />
//               </button>
//             </div>
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
//               {/* LEFT SIDE */}
//               <div className="p-4 rounded-lg flex flex-col items-center">
//                 <div className="bg-white border-2 border-black rounded-none shadow-lg overflow-hidden w-full" style={{ fontFamily: 'Times, serif' }}>
//                   <div className="border-b-2 border-black p-4 text-center">
//                     <h2 className="text-lg font-bold">AV Hospital</h2>
//                     <p className="text-sm">Billing Details</p>
//                   </div>
//                   <div className="p-4">
//                     <h3 className="text-sm font-bold mb-3">{billingTabs.find(t => t.value === billingActiveTab)?.label} Records:</h3>
//                     <table className="w-full border border-gray-300 text-xs">
//                       <thead>
//                         <tr className="bg-gray-100">
//                           {getBillingColumns().map(col => (
//                             <th key={col.header} className="border border-gray-300 px-2 py-1 text-left">{col.header}</th>
//                           ))}
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {(getBillingData() || []).map((row, idx) => (
//                           <tr key={idx}>
//                             {getBillingColumns().map(col => (
//                               <td key={col.header} className="border border-gray-300 px-2 py-1">
//                                 {typeof col.cell === 'function' ? col.cell(row) : row[col.accessor]}
//                               </td>
//                             ))}
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                   <div className="border-t-2 border-black p-4">
//                     <div className="flex justify-end">
//                       <div className="text-right text-xs">
//                         <p className="mb-8"><strong>Billing Officer Signature</strong></p>
//                         <p><strong>Date: {new Date().toLocaleDateString()}</strong></p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               {/* RIGHT SIDE: Sharing Options */}
//               <div className="space-y-6">
//                 <h4 className="text-lg font-semibold text-[#0E1630]">Share Options</h4>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//                     <Globe size={16} />
//                     Language
//                   </label>
//                   <select
//                     value={language}
//                     onChange={e => setLanguage(e.target.value)}
//                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#01D48C]"
//                   >
//                     {Object.keys(languageMap).map(lang => (
//                       <option key={lang} value={lang}>{lang}</option>
//                     ))}
//                   </select>
//                   {isTranslating && (
//                     <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
//                       <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
//                       Translating content...
//                     </p>
//                   )}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
//                   <input
//                     type="email"
//                     value={shareEmail}
//                     onChange={e => setShareEmail(e.target.value)}
//                     placeholder="Enter patient's email"
//                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#01D48C]"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
//                   <input
//                     type="tel"
//                     value={sharePhone}
//                     onChange={e => setSharePhone(e.target.value)}
//                     placeholder="Enter WhatsApp number"
//                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#01D48C]"
//                   />
//                 </div>
//                 <div className="flex flex-wrap gap-3">
//                   <a
//                     href={sharePhone ? whatsappLink : '#'}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
//                       sharePhone ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none'
//                     }`}
//                   >
//                     <Phone size={16} /> WhatsApp
//                   </a>
//                  <button
//                     disabled={!shareEmail}
//                     className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
//                       shareEmail ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                     }`}
//                   >
//                     <Mail size={16} /> Email
//                   </button>
//                   <button
//                     onClick={() => window.print()}
//                     className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
//                   >
//                     <Printer size={16} /> Print
//                </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BillingTab;





























import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Camera, Upload, X, Send, Globe, Phone, Mail, Printer, Share2 } from 'lucide-react';
import DynamicTable from '../../../../components/microcomponents/DynamicTable';

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

const BillingTab = ({
  patientName,
  gender,
  age,
  email,
  phone,
  address,
  patientEmail,
  isNewlyAdded,
  pharmacyBills,
  setPharmacyBills,
  labBills,
  setLabBills,
  hospitalBills,
  setHospitalBills,
  extractedBilling,
  setExtractedBilling
}) =>  {
  const navigate = useNavigate();
  const location = useLocation();

  // Tab and modal states
  const [billingActiveTab, setBillingActiveTab] = useState("pharmacy");
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [billingModalData, setBillingModalData] = useState({});
  // Mail modal states
  const [billingMailModalOpen, setBillingMailModalOpen] = useState(false);
  const [billingMailFile, setBillingMailFile] = useState(null);
  const [billingMailEmail, setBillingMailEmail] = useState(patientEmail || "");
  const [billingMailSending, setBillingMailSending] = useState(false);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const billingFileInputRef = useRef();

  // Share modal states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState(patientEmail || "");
  const [sharePhone, setSharePhone] = useState("");
  const [language, setLanguage] = useState('English');
  const [isTranslating, setIsTranslating] = useState(false);

  // Handle new billing record from BillingForm
  useEffect(() => {
    if (location.state?.newBillingRecord && location.state?.success && location.state?.timestamp) {
      const { newBillingRecord, billingType, message } = location.state;
      
      console.log('Received new billing record:', newBillingRecord, 'Type:', billingType);
      
      // Add the new record to the appropriate state with a unique ID
      const recordWithId = {
        ...newBillingRecord,
        id: `${billingType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Ensure unique ID
        createdAt: location.state.timestamp || new Date().toISOString()
      };

      if (billingType === 'pharmacy') {
        setPharmacyBills(prev => {
          const updated = [...prev, recordWithId];
          console.log('Updated pharmacy bills:', updated);
          return updated;
        });
        setBillingActiveTab('pharmacy');
      } else if (billingType === 'labs') {
        setLabBills(prev => {
          const updated = [...prev, recordWithId];
          console.log('Updated lab bills:', updated);
          return updated;
        });
        setBillingActiveTab('labs');
      } else if (billingType === 'hospital') {
        setHospitalBills(prev => {
          const updated = [...prev, recordWithId];
          console.log('Updated hospital bills:', updated);
          return updated;
        });
        setBillingActiveTab('hospital');
      }

      // Show success message with smooth animation
      if (message) {
        // Create a temporary success notification
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transition-all duration-300';
        successDiv.style.transform = 'translateY(-20px)';
        successDiv.style.opacity = '0';
        successDiv.textContent = message;
        document.body.appendChild(successDiv);
        
        // Animate in
        setTimeout(() => {
          successDiv.style.transform = 'translateY(0)';
          successDiv.style.opacity = '1';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
          successDiv.style.transform = 'translateY(-20px)';
          successDiv.style.opacity = '0';
          setTimeout(() => {
            if (document.body.contains(successDiv)) {
              document.body.removeChild(successDiv);
            }
          }, 300);
        }, 3000);
      }

      // Clear the location state to prevent re-adding on re-renders
      setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      }, 100);
    }
  }, [location.state, setPharmacyBills, setLabBills, setHospitalBills]);

  // Camera functions
  const startCamera = async () => {
    setCameraError("");
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      setCameraError("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        setCapturedImage(blob);
      }, "image/jpeg", 0.8);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const useCapturedPhoto = () => {
    if (capturedImage) {
      const fileName = `billing_photo_${Date.now()}.jpg`;
      const file = new File([capturedImage], fileName, { type: "image/jpeg" });
      setBillingMailFile(file);
      closeCameraModal();
    }
  };

  const openCameraModal = () => {
    setCameraModalOpen(true);
    setCapturedImage(null);
    setCameraError("");
    setTimeout(startCamera, 100);
  };

  const closeCameraModal = () => {
    stopCamera();
    setCameraModalOpen(false);
    setCapturedImage(null);
    setCameraError("");
  };

  // Billing fields by tab
  const billingFields = {
    pharmacy: [
      { name: "medicineName", label: "Medicine Name", type: "text" },
      { name: "quantity", label: "Quantity", type: "number" },
      { name: "unitPrice", label: "Unit Price (₹)", type: "number" },
      { name: "totalPrice", label: "Total Price (₹)", type: "number" },
      { name: "date", label: "Date", type: "date" }
    ],
    labs: [
      { name: "testName", label: "Test Name", type: "text" },
      { name: "cost", label: "Cost (₹)", type: "number" },
      { name: "date", label: "Date", type: "date" },
      { name: "paymentStatus", label: "Payment Status", type: "select", options: ["Paid", "Pending"] }
    ],
    hospital: [
      { name: "billType", label: "Bill Type", type: "text" },
      { name: "amount", label: "Amount (₹)", type: "number" },
      { name: "paymentMode", label: "Payment Mode", type: "select", options: ["Insurance", "Cash"] },
      { name: "status", label: "Status", type: "select", options: ["Paid", "Pending"] },
      { name: "billDate", label: "Bill Date", type: "date" }
    ]
  };

  // Updated Column definitions to match BillingForm data structure
  const pharmacyColumns = [
    { header: "Bill No", accessor: "billNo" },
    { header: "Patient Name", accessor: "patientName" },
    { header: "Doctor", accessor: "doctorName" },
    { header: "Medicines", accessor: "medicines", cell: (row) => (
      <div className="text-xs max-w-xs">
        {row.medicines?.map((med, idx) => (
          <div key={idx} className="mb-1">
            <span className="font-medium">{med.medicineName}</span>
            <br />
            <span className="text-gray-600">Qty: {med.quantity} × ₹{med.unitPrice} = ₹{med.total}</span>
          </div>
        )) || 'N/A'}
      </div>
    )},
    { header: "Grand Total (₹)", accessor: "grandTotal", cell: (row) => (
      <span className="font-semibold text-green-600">₹{row.grandTotal}</span>
    )},
    { header: "Payment Mode", accessor: "paymentMode" },
    { header: "Date", accessor: "prescriptionDate", cell: (row) => (
      row.prescriptionDate ? new Date(row.prescriptionDate).toLocaleDateString('en-GB') : 'N/A'
    )},
    { header: "Status", accessor: "status", cell: () => (
      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Completed</span>
    )}
  ];

  const labBillColumns = [
    { header: "Bill No", accessor: "labBillNo" },
    { header: "Patient Name", accessor: "patientName" },
    { header: "Doctor", accessor: "doctorName" },
    { header: "Tests", accessor: "tests", cell: (row) => (
      <div className="text-xs max-w-xs">
        {row.tests?.map((test, idx) => (
          <div key={idx} className="mb-1">
            <span className="font-medium">{test.testName}</span>
            <br />
            <span className="text-gray-600">₹{test.rate}</span>
            {test.remarks && <span className="text-gray-500"> - {test.remarks}</span>}
          </div>
        )) || 'N/A'}
      </div>
    )},
    { header: "Grand Total (₹)", accessor: "grandTotal", cell: (row) => (
      <span className="font-semibold text-green-600">₹{row.grandTotal}</span>
    )},
    { header: "Payment Mode", accessor: "paymentMode" },
    { header: "Date", accessor: "date", cell: (row) => (
      row.date ? new Date(row.date).toLocaleDateString('en-GB') : 'N/A'
    )},
    { header: "Status", accessor: "status", cell: () => (
      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Completed</span>
    )}
  ];

  const hospitalBillColumns = [
    { header: "Bill No", accessor: "billNo" },
    { header: "Patient Name", accessor: "patientName" },
    { header: "Room Type", accessor: "roomType" },
    { header: "Bed No", accessor: "bedNo" },
    { header: "Admission", accessor: "admissionDate", cell: (row) => (
      row.admissionDate ? new Date(row.admissionDate).toLocaleDateString('en-GB') : 'N/A'
    )},
    { header: "Discharge", accessor: "dischargeDate", cell: (row) => (
      row.dischargeDate ? new Date(row.dischargeDate).toLocaleDateString('en-GB') : 'N/A'
    )},
    { header: "Charges", accessor: "charges", cell: (row) => (
      <div className="text-xs max-w-xs">
        {row.charges?.filter(c => parseFloat(c.amount) > 0).map((charge, idx) => (
          <div key={idx} className="mb-1">
            <span className="font-medium">{charge.category}</span>
            <br />
            <span className="text-gray-600">{charge.description} - ₹{charge.amount}</span>
          </div>
        )) || 'N/A'}
      </div>
    )},
    { header: "Amount Payable (₹)", accessor: "amountPayable", cell: (row) => (
      <span className="font-semibold text-green-600">₹{row.amountPayable}</span>
    )},
    { header: "Payment Mode", accessor: "paymentMode" },
    { header: "Status", accessor: "status", cell: () => (
      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Completed</span>
    )}
  ];

  const billingTabs = [
    { value: "pharmacy", label: "Pharmacy" },
    { value: "labs", label: "Labs" },
    { value: "hospital", label: "Hospital Bills" }
  ];

  const printContent = (contentId, title) => {
    const WinPrint = window.open('', '', 'width=900,height=650');
    WinPrint.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px 12px; border: 1px solid #ccc; text-align: left; }
            h2 { margin-bottom: 20px; }
          </style>
        </head>
        <body>${document.getElementById(contentId).innerHTML}</body>
      </html>
    `);
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();
  };

  // Handlers
  const handleAddBillingRecord = (data) => {
    const recordWithId = {
      ...data,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };

    if (billingActiveTab === "pharmacy") {
      setPharmacyBills((prev) => [...prev, recordWithId]);
    } else if (billingActiveTab === "labs") {
      setLabBills((prev) => [...prev, recordWithId]);
    } else if (billingActiveTab === "hospital") {
      setHospitalBills((prev) => [...prev, recordWithId]);
    }
    setBillingModalOpen(false);
    setBillingModalData({});
  };

  const handleSendBillingMail = async () => {
    setBillingMailSending(true);
    setTimeout(() => {
      alert(`File sent to ${billingMailEmail}`);
      setBillingMailModalOpen(false);
      setBillingMailFile(null);
      setBillingMailEmail("");
      setBillingMailSending(false);
    }, 1500);
  };

  const handleBillingUpload = () => {
    billingFileInputRef.current?.click();
  };

  const handleBillingFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const rows = parseBillingText(text);
        setExtractedBilling(rows);
      };
      reader.readAsText(file);
    } else {
      let placeholderRow = {};
      if (billingActiveTab === "pharmacy") {
        placeholderRow = {
          medicineName: '[OCR extraction needed]',
          quantity: 0,
          unitPrice: 0,
          totalPrice: 0,
          date: new Date().toLocaleDateString()
        };
      } else if (billingActiveTab === "labs") {
        placeholderRow = {
          testName: '[OCR extraction needed]',
          cost: 0,
          date: new Date().toLocaleDateString(),
          paymentStatus: 'Pending'
        };
      } else if (billingActiveTab === "hospital") {
        placeholderRow = {
          billType: '[OCR extraction needed]',
          amount: 0,
          paymentMode: 'Cash',
          status: 'Pending',
          billDate: new Date().toLocaleDateString()
        };
      }
      setExtractedBilling([placeholderRow]);
    }
  };

  const parseBillingText = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const billingData = [];

    lines.forEach(line => {
      if (line.trim()) {
        let row = {};

        if (billingActiveTab === "pharmacy") {
          row = {
            medicineName: '',
            quantity: 0,
            unitPrice: 0,
            totalPrice: 0,
            date: new Date().toLocaleDateString()
          };
        } else if (billingActiveTab === "labs") {
          row = {
            testName: '',
            cost: 0,
            date: new Date().toLocaleDateString(),
            paymentStatus: 'Pending'
          };
        } else if (billingActiveTab === "hospital") {
          row = {
            billType: '',
            amount: 0,
            paymentMode: 'Cash',
            status: 'Pending',
            billDate: new Date().toLocaleDateString()
          };
        }

        const parts = line.split(/[,;]/);
        if (billingActiveTab === "pharmacy" && parts.length > 0) {
          row.medicineName = parts[0].trim();
          if (parts.length > 1) row.quantity = parseInt(parts[1]) || 1;
          if (parts.length > 2) row.unitPrice = parseFloat(parts[2]) || 0;
          if (parts.length > 3) row.totalPrice = parseFloat(parts[3]) || row.quantity * row.unitPrice;
        } else if (billingActiveTab === "labs" && parts.length > 0) {
          row.testName = parts[0].trim();
          if (parts.length > 1) row.cost = parseFloat(parts[1]) || 0;
        } else if (billingActiveTab === "hospital" && parts.length > 0) {
          row.billType = parts[0].trim();
          if (parts.length > 1) row.amount = parseFloat(parts[1]) || 0;
        }

        billingData.push(row);
      }
    });

    return billingData;
  };

  const getBillingData = () => {
    let data;
    switch (billingActiveTab) {
      case "pharmacy": 
        data = pharmacyBills || [];
        break;
      case "labs": 
        data = labBills || [];
        break;
      case "hospital": 
        data = hospitalBills || [];
        break;
      default: 
        data = [];
    }
    console.log(`Getting ${billingActiveTab} data:`, data);
    return data;
  };

  const getBillingColumns = () => {
    switch (billingActiveTab) {
      case "pharmacy": return pharmacyColumns;
      case "labs": return labBillColumns;
      case "hospital": return hospitalBillColumns;
      default: return pharmacyColumns;
    }
  };

  // Share modal handlers
  const openShareModal = () => setIsShareModalOpen(true);
  const closeShareModal = () => setIsShareModalOpen(false);

  // WhatsApp link (dummy for now)
  const whatsappLink = `https://wa.me/${sharePhone.replace(/[^0-9]/g, '')}?text=Billing%20details%20attached`;

  if (isNewlyAdded) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-blue-800 mb-4">Upload Billing Document</h4>
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center">
            <p>OCR Prescription Reader Component</p>
          </div>
        </div>
      </div>
    );
  }

  const billingManualRecords = getBillingData();
  const hasManualRecords = billingManualRecords && billingManualRecords.length > 0;
  const hasExtractedBilling = extractedBilling && extractedBilling.length > 0;

  // Simple Add Billing Modal (no ReusableModal)
  const [manualForm, setManualForm] = useState({});
  const handleManualInput = (e) => {
    const { name, value } = e.target;
    setManualForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleManualSubmit = (e) => {
    e.preventDefault();
    handleAddBillingRecord(manualForm);
    setManualForm({});
  };

  // Go to BillingForm page with current tab context
  const handleGoToAddBillingPage = () => {
    navigate('/doctordashboard/add-billing', {
      state: {
        billingType: billingActiveTab,
        patientName: patientName,
        patientId: `PT-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`, // Generate patient ID if not available
        patientEmail: patientEmail,
        phone: phone,
        gender: gender,
        age: age,
        address: address
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Billing tabs */}
      {billingTabs.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-4">
            {billingTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setBillingActiveTab(tab.value)}
                className={`relative cursor-pointer flex items-center gap-1 px-4 py-2 font-medium transition-colors duration-300
                  ${billingActiveTab === tab.value
                    ? "text-[var(--primary-color)] after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-[var(--primary-color)]"
                    : "text-gray-500 hover:text-[var(--accent-color)] before:content-[''] before:absolute before:left-0 before:bottom-0 before:h-[2px] before:w-0 before:bg-[var(--accent-color)] before:transition-all before:duration-300 hover:before:w-full"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-[var(--primary-color)] text-white rounded hover:bg-[var(--accent-color)] rounded-full"
              onClick={handleGoToAddBillingPage}
              title="Add Manually"
            >
              + Add Bill
            </button>
            {/* Share Button */}
            <button
              className="flex items-center gap-2 px-4 py-2 bg-[#01D48C] rounded-full text-white rounded hover:bg-[#0E1630] transition"
              onClick={openShareModal}
              title="Share Billing"
            >
              <Share2 size={18} /> 
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        {/* Show extracted billing data */}
        {hasExtractedBilling && (
          <div className="mb-6">
            <h5 className="font-semibold text-[var(--primary-color)] mb-3">Extracted Billing Data:</h5>
            <div id="printable-billing-table">
              <DynamicTable
                columns={getBillingColumns()}
                data={extractedBilling}
              />
            </div>
          </div>
        )}

        {/* Show manually added billing records */}
        {hasManualRecords && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-semibold text-[var(--primary-color)]">
                {billingActiveTab.charAt(0).toUpperCase() + billingActiveTab.slice(1)} Records
              </h5>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  {getBillingData().length} record{getBillingData().length !== 1 ? 's' : ''}
                </span>
                {/* Success indicator for newly added records */}
                {location.state?.success && (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    New record added
                  </div>
                )}
              </div>
            </div>
            <div id="printable-billing-table">
              <DynamicTable
                columns={getBillingColumns()}
                data={getBillingData()}
                onTabChange={setBillingActiveTab}
              />
            </div>
          </div>
        )}

        {/* Show message when no records */}
        {!hasManualRecords && !hasExtractedBilling && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <CreditCard size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              No {billingActiveTab} records found
            </h3>
            <p className="text-gray-500 mb-4">
              Start by adding a new billing record or uploading documents
            </p>
            <button
              onClick={handleGoToAddBillingPage}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Add First Record
            </button>
          </div>
        )}

        {/* Billing Mail Modal */}
        {billingMailModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8 animate-fadeIn transition-all">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
                onClick={() => setBillingMailModalOpen(false)}
                title="Close"
              >
                <X size={22} />
              </button>
              <h2 className="text-2xl font-semibold text-blue-800 mb-6 text-center tracking-tight">
                📧 Send Billing via Email
              </h2>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-600 mb-1">Patient Email</label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter patient email"
                  value={billingMailEmail}
                  onChange={e => setBillingMailEmail(e.target.value)}
                  required
                  readOnly={!!patientEmail}
                />
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-600 mb-1">Attach File</label>
                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.docx,.txt"
                    className="flex-1 min-w-0 rounded-lg border border-gray-300 px-4 py-[9px] text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={e => setBillingMailFile(e.target.files[0])}
                  />
                  <button
                    onClick={openCameraModal}
                    className="flex items-center gap-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm font-medium"
                    title="Take a photo"
                  >
                    <Camera size={16} /> Take Photo
                  </button>
                </div>
                {billingMailFile && (
                  <div className="mt-2 text-sm text-blue-700 bg-blue-50 px-3 py-1 rounded-full inline-block">
                    Selected: {billingMailFile.name}
                  </div>
                )}
              </div>
              <button
                className={`w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-medium transition 
                  ${billingMailEmail && billingMailFile && !billingMailSending
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-300 cursor-not-allowed"}`}
                onClick={handleSendBillingMail}
                disabled={!billingMailEmail || !billingMailFile || billingMailSending}
              >
                {billingMailSending ? (
                  <>
                    <span className="loader-mini" /> Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} /> Send
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Camera Modal for billing photo */}
        {cameraModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <button
                className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition"
                onClick={closeCameraModal}
                title="Close Camera"
              >
                <X size={24} />
              </button>
              <h4 className="text-xl font-semibold text-gray-800 mb-4 text-center">📸 Capture Billing Photo</h4>
              {cameraError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm text-center">{cameraError}</p>
                </div>
              )}
              <div className="relative bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                {!capturedImage ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  </>
                ) : (
                  <>
                    <img
                      src={URL.createObjectURL(capturedImage)}
                      alt="Captured"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        ✓ Photo Captured
                      </div>
                    </div>
                  </>
                )}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
              <div className="flex items-center justify-center gap-4 mt-6">
                {!capturedImage ? (
                  <button
                    onClick={capturePhoto}
                    className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition font-medium text-lg shadow-lg"
                  >
                    <Upload size={20} /> 📸 Capture Photo
                  </button>
                ) : (
                  <div className="flex gap-4">
                    <button
                      onClick={retakePhoto}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition font-medium shadow-lg"
                    >
                      <Upload size={20} /> Retake
                    </button>
                    <button
                      onClick={useCapturedPhoto}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition font-medium shadow-lg"
                    >
                      <Send size={20} /> ✓ Use Photo
                    </button>
                  </div>
                )}
              </div>
              {capturedImage && (
                <p className="text-xs text-green-600 text-center mt-2">
                  ✓ Photo captured successfully! Click "✓ Use Photo" to attach it to your email.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Simple Manual Add Modal */}
      {billingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-40">
          <div className="relative bg-white rounded-xl shadow-lg p-6 min-w-[350px] max-w-[100vw] w-full md:w-[400px]">
            <button
              className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-200"
              onClick={() => {
                setBillingModalOpen(false);
                setManualForm({});
              }}
              title="Close"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4">Add {billingActiveTab.charAt(0).toUpperCase() + billingActiveTab.slice(1)} Record</h2>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              {(billingFields[billingActiveTab] || []).map(field => (
                <div key={field.name}>
                  <label className="block text-sm font-medium mb-1">{field.label}</label>
                  {field.type === "select" ? (
                    <select
                      name={field.name}
                      value={manualForm[field.name] || ""}
                      onChange={handleManualInput}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      required
                    >
                      <option value="">Select</option>
                      {field.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      value={manualForm[field.name] || ""}
                      onChange={handleManualInput}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      required={field.type !== "date"}
                    />
                  )}
                </div>
              ))}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                  onClick={() => { setBillingModalOpen(false); setManualForm({}); }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Add Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-[#01D48C] to-[#0E1630] text-white">
              <h3 className="text-xl font-semibold ">Billing Preview</h3>
              <button onClick={closeShareModal} className="text-gray-200 hover:text-gray-400">
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {/* LEFT SIDE */}
              <div className="p-4 rounded-lg flex flex-col items-center">
                <div className="bg-white border-2 border-black rounded-none shadow-lg overflow-hidden w-full" style={{ fontFamily: 'Times, serif' }}>
                  <div className="border-b-2 border-black p-4 text-center">
                    <h2 className="text-lg font-bold">AV Hospital</h2>
                    <p className="text-sm">Billing Details</p>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold mb-3">{billingTabs.find(t => t.value === billingActiveTab)?.label} Records:</h3>
                    <table className="w-full border border-gray-300 text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          {getBillingColumns().map(col => (
                            <th key={col.header} className="border border-gray-300 px-2 py-1 text-left">{col.header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(getBillingData() || []).map((row, idx) => (
                          <tr key={idx}>
                            {getBillingColumns().map(col => (
                              <td key={col.header} className="border border-gray-300 px-2 py-1">
                                {typeof col.cell === 'function' ? col.cell(row) : row[col.accessor]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="border-t-2 border-black p-4">
                    <div className="flex justify-end">
                      <div className="text-right text-xs">
                        <p className="mb-8"><strong>Billing Officer Signature</strong></p>
                        <p><strong>Date: {new Date().toLocaleDateString()}</strong></p>
                      </div>
                    </div>
                  </div>
                </div>
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
                    onChange={e => setLanguage(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#01D48C]"
                  >
                    {Object.keys(languageMap).map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
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
                    value={shareEmail}
                    onChange={e => setShareEmail(e.target.value)}
                    placeholder="Enter patient's email"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#01D48C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={sharePhone}
                    onChange={e => setSharePhone(e.target.value)}
                    placeholder="Enter WhatsApp number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#01D48C]"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={sharePhone ? whatsappLink : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      sharePhone ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none'
                    }`}
                  >
                    <Phone size={16} /> WhatsApp
                  </a>
                 <button
                    disabled={!shareEmail}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      shareEmail ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
    </div>
  );
};

export default BillingTab;