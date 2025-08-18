import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "./context-api/authSlice";

// Public Pages
import Login from "./form/Login";
import RegisterSelect from "./form/RegisterSelect";
import Registration from "./form/Registration";
import Verification from "./form/Verification";
import Healthcard from "./components/Healthcard";
import BookApp from "./components/BookApp";
import Home from "./pages/Home";
import MedicalRecords from "./pages/layouts/menu/PatientDashboard/MedicalRecord"
import MedicalRecordDetails from "./pages/layouts/menu/PatientDashboard/MedicalRecordDetails";

// Layouts & Dashboards
import DashboardLayout from "./pages/layouts/DashboardLayout";
import PdashboardRoutes from "./pages/layouts/menu/PatientDashboard/PdashboardRoutes";
import AdminRoutes from "./pages/layouts/menu/SuperAdminDashboard/AdminRoute";
import AdminDashboard from "./pages/layouts/menu/SuperAdminDashboard/Dashboard";
import DrRoutes from "./pages/layouts/menu/DoctorDashboard/DrRoutes";
import Overview from "./pages/layouts/menu/DoctorDashboard/Overview";
import LabRoutes from "./pages/layouts/menu/LabDashboard/Ldroutes";
import LabDashboard from "./pages/layouts/menu/LabDashboard/LabDashboard";
import HospitalRoutes from "./pages/layouts/menu/HospitalDashboard/Hdroutes";
import HospitalDashboard from "./pages/layouts/menu/HospitalDashboard/Dashboard";

// Shared Components
import StaffManagement from "./components/AdminModule";
import PharmacyManagement from "./components/PharmacyModule";
import LabManagement from "./components/LabModule";
import QueueManagement from "./components/QueueManagaement";
import QueueToken from "./components/Queue-Token";
import Frontdesk from "./components/FrontendDesk";
import TokenDisplay from "./components/Token-Display";

// Toast
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InitialAssessmentForm from "./components/InitialAssesment";
// import PaymentGatewayPage from "./components/microcomponents/PaymentGatway";

// ---------------------- Helpers ----------------------

// ✅ Parse user from localStorage
const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// ✅ PrivateRoute with allowed userType
const PrivateRoute = ({ allowedType }) => {
  const user = getUser();
  if (!user) return <Navigate to="/login" />;
  if (allowedType && user.userType !== allowedType) return <Navigate to="/redirect" />;
  return <Outlet />;
};

// ✅ Redirect to correct dashboard based on role
const RoleRedirect = () => {
  const user = getUser();
  if (!user) return <Navigate to="/login" />;

  switch (user.userType) {
    case "doctor":
      return <Navigate to="/doctordashboard" />;
    case "lab":
      return <Navigate to="/labdashboard" />;
    case "hospital":
      return <Navigate to="/hospitaldashboard" />;
    case "freelancer":
      return <Navigate to="/freelancerdashboard" />;
    case "superadmin":
      return <Navigate to="/superadmindashboard" />;
    case "patient":
      return <Navigate to="/patientdashboard" />;
    default:
      return <Navigate to="/" />;
  }
};

const App = () => {
  const [tokens, setTokens] = useState([]);

  const handleTokenGenerated = (newToken) =>
    setTokens((prev) => [...prev, newToken]);
  const handleTokenUpdate = (updatedTokens) => setTokens(updatedTokens);
  const getNextTokenNumber = () => tokens.length + 1;

  const dispatch = useDispatch();

  // ✅ Redux state
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ On app load, restore user from localStorage (for all roles)
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      dispatch(setUser(JSON.parse(storedUser))); // ✅ rehydrate Redux for patient
    }
    setLoading(false);
  }, [dispatch]);

  // ✅ Common wrapper for requiring authentication
  const RequireAuth = ({ children }) =>
    !getUser() ? <Navigate to="/login" replace /> : children;

  if (loading)
    return <div className="text-center mt-20 text-lg">Loading...</div>;

  // ✅ Shared module routes for all dashboards
  const sharedRoutes = (
    <>
   <Route
      path="specialization"
      element={<InitialAssessmentForm />}
    />
      <Route path="dr-admin" element={<StaffManagement />} />
      <Route path="pharmacymodule" element={<PharmacyManagement />} />
      <Route path="labmodule" element={<LabManagement />} />
      <Route path="frontdesk" element={<Frontdesk />} />
      <Route
        path="queuemanagement"
        element={
          <QueueManagement
            tokens={tokens}
            onTokensUpdate={handleTokenUpdate}
          />
        }
      />
      <Route
        path="queuetoken"
        element={
          <QueueToken
            onTokenGenerated={handleTokenGenerated}
            currentTokenNumber={getNextTokenNumber()}
          />
        }
      />
      <Route
        path="tokendisplay"
        element={<TokenDisplay tokens={tokens} />}
      />
    </>
  );

  return (
    <Router>
      <Routes>
        {/* ✅ Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterSelect />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/login" element={<Login />} />
        <Route path="/healthcard" element={<Healthcard />} />
        <Route path="/bookconsultation" element={<BookApp />} />
         {/* <Route path="/paymentgateway" element={<PaymentGatewayPage />} /> */}
        <Route path="/medical-records" element={<MedicalRecords />} />
        <Route path="/medical-record-details" element={<MedicalRecordDetails />} />


        {/* ✅ Redirect Based on Role */}
        <Route path="/redirect" element={<RoleRedirect />} />

        {/* ✅ Patient Dashboard (any authenticated patient) */}
        <Route
          path="/patientdashboard/*"
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route path="*" element={<PdashboardRoutes />} />
        </Route>

        {/* ✅ Doctor Dashboard */}
        <Route element={<PrivateRoute allowedType="doctor" />}>
          <Route path="/doctordashboard" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            {sharedRoutes}
            <Route path="*" element={<DrRoutes />} />
          </Route>
        </Route>

        {/* ✅ Hospital Dashboard */}
        <Route element={<PrivateRoute allowedType="hospital" />}>
          <Route path="/hospitaldashboard" element={<DashboardLayout />}>
            <Route index element={<HospitalDashboard />} />
            {sharedRoutes}
            <Route path="*" element={<HospitalRoutes />} />
          </Route>
        </Route>

        {/* ✅ Lab Dashboard */}
        <Route element={<PrivateRoute allowedType="lab" />}>
          <Route path="/labdashboard" element={<DashboardLayout />}>
            <Route index element={<LabDashboard />} />
            <Route path="*" element={<LabRoutes />} />
          </Route>
        </Route>

        {/* ✅ Super Admin Dashboard */}
        <Route element={<PrivateRoute allowedType="superadmin" />}>
          <Route
            path="/superadmindashboard"
            element={<DashboardLayout />}
          >
            <Route index element={<AdminDashboard />} />
            <Route path="*" element={<AdminRoutes />} />
          </Route>
        </Route>

        {/* ✅ Fallback Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
};

export default App;