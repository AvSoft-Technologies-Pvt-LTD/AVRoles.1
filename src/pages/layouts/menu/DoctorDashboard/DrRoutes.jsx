import React from "react";
import { Route, Routes } from "react-router-dom";
import Appointments from "./Appointments";
import PatientList from "./PatientList";
import Settings from "./Settings";
import Payments from "./Payments";
import Overview from "./Overview";
import FormsPage from "./Form";
// import StaffManagement from "./AdminModule";
import QuickLinksPanel from "./QuickLinksPanel";
import NotificationPage from "../../../../components/NotificationPage"; // Adjust the import path as needed
import MedicalRecordsTemplate from "./MedicalRecordsTemplate";
import BillingForm from "./BillingForm";
import MedicalRecordDetails from "./MedicalRecordDetails";
import MedicalRecords from "./ MedicalRecords";
import SecondOpinion from "./SecondOpinion";const DrRoutes = () => {
  return (
    <Routes>
      <Route index element={<Overview />} /> {/* renders at /doctordashboard */}
      <Route path="appointments" element={<Appointments />} />
      <Route path="patients" element={<PatientList />} />
        <Route path="/notifications" element={<NotificationPage />} />
       <Route path="form" element={<FormsPage />} />
       <Route path="second-opinion" element={<SecondOpinion/>} />
      <Route path="medical-record" element={<MedicalRecords/>} />



<Route path="medical-record-details" element={<MedicalRecordDetails/>} />
      <Route path="quicklinks" element={<QuickLinksPanel />} />
       {/* <Route path="dr-admin" element={<StaffManagement />} /> */}
     <Route path="billing" element={<Payments />} />
      <Route path="settings" element={<Settings />} />
      <Route path="MedicalRecordsTemplate" element={<MedicalRecordsTemplate/>} />
            <Route path="add-billing" element={<BillingForm/>} />


    </Routes>
  );
};
export default DrRoutes;