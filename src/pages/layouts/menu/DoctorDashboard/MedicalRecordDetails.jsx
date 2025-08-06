

// import React, { useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { 
//   ArrowLeft, FileText, Pill, TestTube, CreditCard, Upload
// } from "lucide-react";

// // Import tab components
// import MedicalRecordsTab from "./MedicalRecordsTab";
// import LabTestsTab from "./LabResultsForm";
// import BillingTab from "./BillingTab";
// import PrescriptionForm from "./PrescriptionForm";

// const MedicalRecordDetails = ({ recordData, onBack, isNewlyAdded, patientEmail }) => {
//   const [activeTab, setActiveTab] = useState("medical-records");
//   const [showShareModal, setShowShareModal] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();
  
//   const [uploadedFiles, setUploadedFiles] = useState({
//     knownCaseFiles: [],
//     vitalsFiles: [],
//     dischargeSummaryFiles: [],
//     prescriptionFiles: [],
//     labTestFiles: [],
//     pharmacyBillingFiles: [],
//     labBillingFiles: [],
//     hospitalBillingFiles: []
//   });

//   // Provide safe fallback for recordData
//   const safeRecordData = recordData || {};
//   const navState = location.state || {};

//   // State for all tabs
//   const [knownCaseRecords, setKnownCaseRecords] = useState([]);
//   const [vitalsRecords, setVitalsRecords] = useState([]);
//   const [dischargeRecords, setDischargeRecords] = useState([]);
//   const [prescriptions, setPrescriptions] = useState([]);
//   const [labTestsData, setLabTestsData] = useState([]);
//   const [pharmacyBills, setPharmacyBills] = useState([]);
//   const [labBills, setLabBills] = useState([]);
//   const [hospitalBills, setHospitalBills] = useState([]);

//   // Extracted data states
//   const [extractedKnownCase, setExtractedKnownCase] = useState([]);
//   const [extractedVitals, setExtractedVitals] = useState([]);
//   const [extractedDischarge, setExtractedDischarge] = useState([]);
//   const [extractedPrescriptions, setExtractedPrescriptions] = useState([]);
//   const [extractedLabTests, setExtractedLabTests] = useState([]);
//   const [extractedBilling, setExtractedBilling] = useState([]);

//   // Patient data extraction
//   let patientName = safeRecordData.patientName || navState.patientName || 'Unknown Patient';
//   let gender = safeRecordData.gender || navState.gender || safeRecordData.sex || navState.sex || '';
//   let address =
//     safeRecordData.temporaryAddress ||
//     safeRecordData.address ||
//     safeRecordData.addressTemp ||
//     navState.temporaryAddress ||
//     navState.address ||
//     navState.addressTemp ||
//     '';

//   let dob = safeRecordData.dob || navState.dob || '';
//   let youAge = safeRecordData.youAge || navState.youAge || '';
//   let email = safeRecordData.email || navState.email || '[No Email]';
//   let phone = safeRecordData.phone || safeRecordData.mobileNo || navState.phone || navState.mobileNo || '[No Phone]';

//   // Calculate age from DOB only if no age is directly provided
//   function calculateAgeFromDOB(dobString) {
//     if (!dobString || dobString === "1753177031") return '';
//     const birthDate = new Date(dobString);
//     if (birthDate.toString() === 'Invalid Date') return '';

//     const today = new Date();
//     let years = today.getFullYear() - birthDate.getFullYear();
//     const hasHadBirthdayThisYear =
//       today.getMonth() > birthDate.getMonth() ||
//       (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

//     if (!hasHadBirthdayThisYear) {
//       years--;
//     }
//     return `${years} years`;
//   }

//   // Prefer direct age > calculated DOB age > nothing
//   let age = safeRecordData.age || navState.age || calculateAgeFromDOB(dob) || '';

//   const handleFileUpload = (event, section) => {
//     const files = Array.from(event.target.files);

//     const validFiles = files.filter(file => {
//       const validTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
//       return validTypes.includes(file.type);
//     });

//     if (validFiles.length !== files.length) {
//       alert('Some files were not uploaded. Only .jpg, .png, .pdf, .docx, and .txt files are allowed.');
//     }

//     setUploadedFiles(prev => ({
//       ...prev,
//       [section]: [...prev[section], ...validFiles]
//     }));
//   };

//   const handleRemoveFile = (section, fileIndex) => {
//     setUploadedFiles(prev => ({
//       ...prev,
//       [section]: prev[section].filter((_, index) => index !== fileIndex)
//     }));
//   };

//   const renderUploadSection = (sectionKey, title) => {
//     if (!isNewlyAdded) return null;

//     const files = uploadedFiles[sectionKey] || [];
//     return (
//       <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
//         <h4 className="font-semibold text-blue-800 mb-4">{title}</h4>
//         <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center">
//           DocsReader
//         </div>
//         {files.length > 0 && (
//           <div className="mt-4 space-y-2">
//             {files.map((file, index) => (
//               <div key={index} className="flex items-center justify-between bg-white rounded-lg border border-blue-200 p-2">
//                 <span className="text-sm font-medium text-blue-800">{file.name}</span>
//                 <button
//                   onClick={() => handleRemoveFile(sectionKey, index)}
//                   className="text-red-600 hover:text-red-800"
//                   title="Remove"
//                 >
//                   ×
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     );
//   };

//   const getInitials = (name) => {
//     if (!name || typeof name !== 'string') return 'NA';
//     return name.split(' ').map(n => n[0]).join('').toUpperCase();
//   };

//   const renderTabContent = () => {
//     if (isNewlyAdded) {
//       switch (activeTab) {
//         case "medical-records":
//           return (
//             <div>
//               {renderUploadSection("knownCaseFiles", "Upload Patient Case Files")}
//               {renderUploadSection("vitalsFiles", "Upload Vital Signs Records")}
//               {renderUploadSection("dischargeSummaryFiles", "Upload Discharge Summary")}
//             </div>
//           );
//         case "prescriptions":
//           // Directly render PrescriptionForm instead of PrescriptionsTab
//           return (
//             <PrescriptionForm
//               data={recordData?.prescriptionData}
//               patient={recordData}
//               showShareModal={false}
//               setShowShareModal={() => {}}
//               onSave={() => {}}
//               onPrint={() => {}}
//             />
//           );
//         case "lab-tests":
//           return (
//             <LabTestsTab
//               patientEmail={patientEmail}
//               isNewlyAdded={isNewlyAdded}
//               labTestsData={labTestsData}
//               setLabTestsData={setLabTestsData}
//               extractedLabTests={extractedLabTests}
//               setExtractedLabTests={setExtractedLabTests}
//             />
//           );
//         case "billing":
//           return (
//             <BillingTab
//               patientEmail={patientEmail}
//               isNewlyAdded={isNewlyAdded}
//               pharmacyBills={pharmacyBills}
//               setPharmacyBills={setPharmacyBills}
//               labBills={labBills}
//               setLabBills={setLabBills}
//               hospitalBills={hospitalBills}
//               setHospitalBills={setHospitalBills}
//               extractedBilling={extractedBilling}
//               setExtractedBilling={setExtractedBilling}
//             />
//           );
//         default:
//           return null;
//       }
//     }

//     switch (activeTab) {
//       case "medical-records":
//         return (
//           <MedicalRecordsTab
//             patientName={patientName}
//             patientEmail={patientEmail}
//             patientData={{ patientName, gender, address, dob, age, ...safeRecordData, ...navState }}
//             knownCaseRecords={knownCaseRecords}
//             setKnownCaseRecords={setKnownCaseRecords}
//             vitalsRecords={vitalsRecords}
//             setVitalsRecords={setVitalsRecords}
//             dischargeRecords={dischargeRecords}
//             setDischargeRecords={setDischargeRecords}
//             extractedKnownCase={extractedKnownCase}
//             setExtractedKnownCase={setExtractedKnownCase}
//             extractedVitals={extractedVitals}
//             setExtractedVitals={setExtractedVitals}
//             extractedDischarge={extractedDischarge}
//             setExtractedDischarge={setExtractedDischarge}
//           />
//         );
//       case "prescriptions":
//         // For non-newly added, you can keep the tab or also use PrescriptionForm if needed
//         return (
//           <PrescriptionForm
//   data={recordData?.prescriptionData}
//   patient={recordData}
//   patientName={patientName}
//   gender={gender}
//   age={age}
//   email={email}
//   phone={phone}
//   address={address}
//   showShareModal={false}
//   setShowShareModal={() => {}}
//   onSave={() => {}}
//   onPrint={() => {}}
// />
//         );
//       case "lab-tests":
//         return (
//           <LabTestsTab
//             patientEmail={patientEmail}
//             isNewlyAdded={isNewlyAdded}
//             labTestsData={labTestsData}
//             setLabTestsData={setLabTestsData}
//             extractedLabTests={extractedLabTests}
//             setExtractedLabTests={setExtractedLabTests}
//           />
//         );
//       case "billing":
//         return (
//           <BillingTab
//             patientEmail={patientEmail}
//             isNewlyAdded={isNewlyAdded}
//             pharmacyBills={pharmacyBills}
//             setPharmacyBills={setPharmacyBills}
//             labBills={labBills}
//             setLabBills={setLabBills}
//             hospitalBills={hospitalBills}
//             setHospitalBills={setHospitalBills}
//             extractedBilling={extractedBilling}
//             setExtractedBilling={setExtractedBilling}
//           />
//         );
//       default:
//         return null;
//     }
//   };

//   const tabs = [
//     { id: "medical-records", label: "Medical Records", icon: FileText },
//     { id: "prescriptions", label: "Prescriptions", icon: Pill },
//     { id: "lab-tests", label: "Lab Tests", icon: TestTube },
//     { id: "billing", label: "Billing", icon: CreditCard }
//   ];

//   return (
//     <div className="p-6 space-y-6">
//       <button 
//         onClick={onBack}
//         className="flex items-center gap-2 hover:text-[var(--accent-color)] transition-colors"
//         style={{ color: 'var(--primary-color)' }}
//       >
//         <ArrowLeft size={20} />
//         <span className="font-medium">Back to Medical Records</span>
//       </button>
      
//       {isNewlyAdded && (
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
//           <div className="flex items-center gap-2 text-blue-800">
//             <Upload size={20} />
//             <span className="font-medium">New Hospital Record</span>
//           </div>
//           <p className="text-sm text-blue-700 mt-1">
//             This is a newly added hospital record. You can upload files in the relevant sections below.
//           </p>
//         </div>
//       )}
      
//       <div className="bg-gradient-to-r from-[#01B07A] to-[#1A223F] rounded-xl p-6 mb-6 text-white">
//         <div className="flex flex-col md:flex-row md:items-start gap-6">
//           <div className="relative h-20 w-20 shrink-0">
//             <div
//               className="flex h-full w-full items-center justify-center rounded-full bg-white text-2xl font-bold uppercase shadow-inner ring-4 ring-white ring-offset-2"
//               style={{ color: 'var(--primary-color)' }}
//             >
//               {getInitials(patientName)}
//             </div>
//             <div
//               className="absolute bottom-1 right-1 w-3 h-3 rounded-full animate-pulse"
//               style={{ backgroundColor: 'var(--accent-color)' }}
//             />
//           </div>
//           <div className="flex-1">
//             <h3 className="text-2xl font-bold mb-4">{patientName}</h3>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-6 text-sm">
//               <div className="space-y-1">
//                 <div>Age: {age ? age + ' years' : '—'}</div>
//                 <div>Gender: {gender || '—'}</div>
//                 <div>Email: {email}</div>
//               </div>
//               <div className="space-y-1">
//                 <div>Address: {address || '—'}</div>
//                 <div>Phone: {phone}</div>
//                 <div>CMO: {safeRecordData.CMO || navState.CMO || '—'}</div>
//               </div>
//               <div className="space-y-1">
//                 <div>Sex: {safeRecordData.sex || navState.sex || gender || '—'}</div>
//                 <div>Consultant: {safeRecordData.consultant || navState.consultant || '—'}</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       <div className="flex border-b border-gray-200 mb-6">
//         {tabs.map((tab) => {
//           const IconComponent = tab.icon;
//           return (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors duration-300 ${
//                 activeTab === tab.id
//                   ? "border-b-2"
//                   : "text-gray-500 hover:text-[var(--accent-color)]"
//               }`}
//               style={activeTab === tab.id ? { 
//                 color: 'var(--primary-color)', 
//                 borderBottomColor: 'var(--primary-color)' 
//               } : {}}
//             >
//               <IconComponent size={18} />
//               {tab.label}
//             </button>
//           );
//         })}
//       </div>
      
//       <div className="animate-fadeIn">
//         {renderTabContent()}
//       </div>
//     </div>
//   );
// };

// export default MedicalRecordDetails;
















import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft, FileText, Pill, TestTube, CreditCard, Upload
} from "lucide-react";

// Import tab components
import MedicalRecordsTab from "./MedicalRecordsTab";
import LabResultsForm from "./LabResultsForm";
import BillingTab from "./BillingTab";
import PrescriptionForm from "./PrescriptionForm";

const MedicalRecordDetails = ({ recordData, onBack, isNewlyAdded, patientEmail }) => {
  const [activeTab, setActiveTab] = useState("medical-records");
  const [showShareModal, setShowShareModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [uploadedFiles, setUploadedFiles] = useState({
    knownCaseFiles: [],
    vitalsFiles: [],
    dischargeSummaryFiles: [],
    prescriptionFiles: [],
    labTestFiles: [],
    pharmacyBillingFiles: [],
    labBillingFiles: [],
    hospitalBillingFiles: []
  });

  // Provide safe fallback for recordData
  const safeRecordData = recordData || {};
  const navState = location.state || {};

  // State for all tabs
  const [knownCaseRecords, setKnownCaseRecords] = useState([]);
  const [vitalsRecords, setVitalsRecords] = useState([]);
  const [dischargeRecords, setDischargeRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labTestsData, setLabTestsData] = useState([]);
  const [pharmacyBills, setPharmacyBills] = useState([]);
  const [labBills, setLabBills] = useState([]);
  const [hospitalBills, setHospitalBills] = useState([]);

  // Extracted data states
  const [extractedKnownCase, setExtractedKnownCase] = useState([]);
  const [extractedVitals, setExtractedVitals] = useState([]);
  const [extractedDischarge, setExtractedDischarge] = useState([]);
  const [extractedPrescriptions, setExtractedPrescriptions] = useState([]);
  const [extractedLabTests, setExtractedLabTests] = useState([]);
  const [extractedBilling, setExtractedBilling] = useState([]);

  // Patient data extraction
  let patientName = safeRecordData.patientName || navState.patientName || 'Unknown Patient';
  let gender = safeRecordData.gender || navState.gender || safeRecordData.sex || navState.sex || '';
  let address =
    safeRecordData.temporaryAddress ||
    safeRecordData.address ||
    safeRecordData.addressTemp ||
    navState.temporaryAddress ||
    navState.address ||
    navState.addressTemp ||
    '';

  let dob = safeRecordData.dob || navState.dob || '';
  let youAge = safeRecordData.youAge || navState.youAge || '';
  let email = safeRecordData.email || navState.email || '[No Email]';
  let phone = safeRecordData.phone || safeRecordData.mobileNo || navState.phone || navState.mobileNo || '[No Phone]';

  // Calculate age from DOB only if no age is directly provided
  function calculateAgeFromDOB(dobString) {
    if (!dobString || dobString === "1753177031") return '';
    const birthDate = new Date(dobString);
    if (birthDate.toString() === 'Invalid Date') return '';

    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    const hasHadBirthdayThisYear =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

    if (!hasHadBirthdayThisYear) {
      years--;
    }
    return `${years} years`;
  }

  // Prefer direct age > calculated DOB age > nothing
  let age = safeRecordData.age || navState.age || calculateAgeFromDOB(dob) || '';

  const handleFileUpload = (event, section) => {
    const files = Array.from(event.target.files);

    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      return validTypes.includes(file.type);
    });

    if (validFiles.length !== files.length) {
      alert('Some files were not uploaded. Only .jpg, .png, .pdf, .docx, and .txt files are allowed.');
    }

    setUploadedFiles(prev => ({
      ...prev,
      [section]: [...prev[section], ...validFiles]
    }));
  };

  const handleRemoveFile = (section, fileIndex) => {
    setUploadedFiles(prev => ({
      ...prev,
      [section]: prev[section].filter((_, index) => index !== fileIndex)
    }));
  };

  const renderUploadSection = (sectionKey, title) => {
    if (!isNewlyAdded) return null;

    const files = uploadedFiles[sectionKey] || [];
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h4 className="font-semibold text-blue-800 mb-4">{title}</h4>
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center">
          DocsReader
        </div>
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-white rounded-lg border border-blue-200 p-2">
                <span className="text-sm font-medium text-blue-800">{file.name}</span>
                <button
                  onClick={() => handleRemoveFile(sectionKey, index)}
                  className="text-red-600 hover:text-red-800"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'NA';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const renderTabContent = () => {
    if (isNewlyAdded) {
      switch (activeTab) {
        case "medical-records":
          return (
            <div>
              {renderUploadSection("knownCaseFiles", "Upload Patient Case Files")}
              {renderUploadSection("vitalsFiles", "Upload Vital Signs Records")}
              {renderUploadSection("dischargeSummaryFiles", "Upload Discharge Summary")}
            </div>
          );
        case "prescriptions":
          // Directly render PrescriptionForm instead of PrescriptionsTab
          return (
            <PrescriptionForm
              data={recordData?.prescriptionData}
              patient={recordData}
              showShareModal={false}
              setShowShareModal={() => {}}
              onSave={() => {}}
              onPrint={() => {}}
            />
          );
        case "lab-tests":
          // Directly render LabResultsForm instead of LabTestsTab
          return (
            <LabResultsForm
              data={recordData?.labResultsData}
              onSave={() => {}}
              onPrint={() => {}}
            />
          );
        case "billing":
          return (
            <BillingTab
              patientEmail={patientEmail}
              isNewlyAdded={isNewlyAdded}
              pharmacyBills={pharmacyBills}
              setPharmacyBills={setPharmacyBills}
              labBills={labBills}
              setLabBills={setLabBills}
              hospitalBills={hospitalBills}
              setHospitalBills={setHospitalBills}
              extractedBilling={extractedBilling}
              setExtractedBilling={setExtractedBilling}
            />
          );
        default:
          return null;
      }
    }

    switch (activeTab) {
      case "medical-records":
        return (
          <MedicalRecordsTab
            patientName={patientName}
            patientEmail={patientEmail}
            patientData={{ patientName, gender, address, dob, age, ...safeRecordData, ...navState }}
            knownCaseRecords={knownCaseRecords}
            setKnownCaseRecords={setKnownCaseRecords}
            vitalsRecords={vitalsRecords}
            setVitalsRecords={setVitalsRecords}
            dischargeRecords={dischargeRecords}
            setDischargeRecords={setDischargeRecords}
            extractedKnownCase={extractedKnownCase}
            setExtractedKnownCase={setExtractedKnownCase}
            extractedVitals={extractedVitals}
            setExtractedVitals={setExtractedVitals}
            extractedDischarge={extractedDischarge}
            setExtractedDischarge={setExtractedDischarge}
          />
        );
      case "prescriptions":
        // For non-newly added, you can keep the tab or also use PrescriptionForm if needed
        return (
          <PrescriptionForm
            data={recordData?.prescriptionData}
            patient={recordData}
            patientName={patientName}
            gender={gender}
            age={age}
            email={email}
            phone={phone}
            address={address}
            showShareModal={false}
            setShowShareModal={() => {}}
            onSave={() => {}}
            onPrint={() => {}}
          />
        );
      case "lab-tests":
        // Directly render LabResultsForm instead of LabTestsTab
        return (
          <LabResultsForm
            data={recordData?.labResultsData}
            onSave={() => {}}
            onPrint={() => {}}
          />
        );
      case "billing":
        return (
          <BillingTab
  patientName={patientName}
  gender={gender}
  age={age}
  email={email}
  phone={phone}
  address={address}
  patientEmail={patientEmail}
  isNewlyAdded={isNewlyAdded}
  pharmacyBills={pharmacyBills}
  setPharmacyBills={setPharmacyBills}
  labBills={labBills}
  setLabBills={setLabBills}
  hospitalBills={hospitalBills}
  setHospitalBills={setHospitalBills}
  extractedBilling={extractedBilling}
  setExtractedBilling={setExtractedBilling}
/>

        );
      default:
        return null;
    }
  };

  const tabs = [
    { id: "medical-records", label: "Medical Records", icon: FileText },
    { id: "prescriptions", label: "Prescriptions", icon: Pill },
    { id: "lab-tests", label: "Lab Tests", icon: TestTube },
    { id: "billing", label: "Billing", icon: CreditCard }
  ];

  return (
    <div className="p-6 space-y-6">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 hover:text-[var(--accent-color)] transition-colors"
        style={{ color: 'var(--primary-color)' }}
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Medical Records</span>
      </button>
      
      {isNewlyAdded && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-blue-800">
            <Upload size={20} />
            <span className="font-medium">New Hospital Record</span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            This is a newly added hospital record. You can upload files in the relevant sections below.
          </p>
        </div>
      )}
      
      <div className="bg-gradient-to-r from-[#01B07A] to-[#1A223F] rounded-xl p-6 mb-6 text-white">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="relative h-20 w-20 shrink-0">
            <div
              className="flex h-full w-full items-center justify-center rounded-full bg-white text-2xl font-bold uppercase shadow-inner ring-4 ring-white ring-offset-2"
              style={{ color: 'var(--primary-color)' }}
            >
              {getInitials(patientName)}
            </div>
            <div
              className="absolute bottom-1 right-1 w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--accent-color)' }}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-4">{patientName}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-6 text-sm">
              <div className="space-y-1">
                <div>Age: {age ? age + ' years' : '—'}</div>
                <div>Gender: {gender || '—'}</div>
                <div>Email: {email}</div>
              </div>
              <div className="space-y-1">
                <div>Address: {address || '—'}</div>
                <div>Phone: {phone}</div>
                <div>CMO: {safeRecordData.CMO || navState.CMO || '—'}</div>
              </div>
              <div className="space-y-1">
                <div>Sex: {safeRecordData.sex || navState.sex || gender || '—'}</div>
                <div>Consultant: {safeRecordData.consultant || navState.consultant || '—'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors duration-300 ${
                activeTab === tab.id
                  ? "border-b-2"
                  : "text-gray-500 hover:text-[var(--accent-color)]"
              }`}
              style={activeTab === tab.id ? { 
                color: 'var(--primary-color)', 
                borderBottomColor: 'var(--primary-color)' 
              } : {}}
            >
              <IconComponent size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>
      
      <div className="animate-fadeIn">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default MedicalRecordDetails;