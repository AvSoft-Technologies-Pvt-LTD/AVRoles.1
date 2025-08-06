import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  RiUserSettingsLine, RiBarChart2Line, RiDashboardFill, RiCalendarCheckFill, RiShoppingBagFill,
  RiShieldCheckFill, RiAlarmWarningFill, RiSettings3Fill, RiLogoutBoxRFill, RiArrowLeftSLine,
  RiArrowRightSLine, RiTestTubeFill, RiMicroscopeFill, RiCapsuleFill, RiFileList3Fill,
  RiHospitalFill, RiUserSettingsFill, RiStethoscopeFill, RiUser3Fill, RiArrowDownSLine,
  RiArrowUpSLine, 
} from "react-icons/ri";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [openSubmenuIndex, setOpenSubmenuIndex] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  useEffect(() => {
    const userMenus = menuItemsMap[user?.userType] || [];
    const matchedSubIndex = userMenus.findIndex(
      (item) =>
        item.isSubmenu &&
        item.submenu.some((sub) => location.pathname.startsWith(sub.path))
    );
    setOpenSubmenuIndex(matchedSubIndex !== -1 ? matchedSubIndex : null);
  }, [location.pathname, user]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleSubmenuToggle = (index) => {
    setOpenSubmenuIndex(openSubmenuIndex === index ? null : index);
  };

  const roleDisplayNames = {
    doctor: "Doctor",
    freelancer: "Freelancer Doctor",
    lab: "Lab Technician",
    hospital: "Hospital Admin",
    patient: "Patient",
    superadmin: "Superadmin"
  };

  const menuItemsMap = {
    doctor: [
      { icon: RiDashboardFill, label: "Dashboard", path: "/doctordashboard" },
      { icon: RiCalendarCheckFill, label: "Appointments", path: "/doctordashboard/appointments" },
      { icon: RiShoppingBagFill, label: "Patients", path: "/doctordashboard/patients" },
      { icon: RiShieldCheckFill, label: "Payments", path: "/doctordashboard/billing" },
      { icon: RiAlarmWarningFill, label: "Messages", path: "/doctordashboard/messages" },
      { icon: RiSettings3Fill, label: "Settings", path: "/doctordashboard/settings" }
    ],
    freelancer: [
      { icon: RiDashboardFill, label: "Dashboard", path: "/freelancerdashboard" },
      { icon: RiCalendarCheckFill, label: "Appointments", path: "/freelancerdashboard/appointments" },
      { icon: RiShoppingBagFill, label: "Patients", path: "/freelancerdashboard/patients" },
      { icon: RiShieldCheckFill, label: "Payments", path: "/freelancerdashboard/billing" },
      { icon: RiSettings3Fill, label: "Settings", path: "/freelancerdashboard/settings" }
    ],
    lab: [
      { icon: RiDashboardFill, label: "Dashboard", path: "/labdashboard" },
      { icon: RiFileList3Fill, label: "Test Requests", path: "/labdashboard/requests" },
      { icon: RiFileList3Fill, label: "Patients List", path: "/labdashboard/patientlist" },
      { icon: RiFileList3Fill, label: "Test Catalogs", path: "/labdashboard/testcatalogs" },
      { icon: RiTestTubeFill, label: "Billing", path: "/labdashboard/billing" },
      { icon: RiUserSettingsFill, label: "Settings", path: "/labdashboard/settings" }
    ],
 hospital: [
      { icon: RiDashboardFill, label: "Dashboard", path: "/hospitaldashboard" },
      { icon: RiStethoscopeFill, label: "OPD", path: "/hospitaldashboard/opd-list" },
      { icon: RiHospitalFill, label: "IPD", path: "/hospitaldashboard/Ipd" },
      { icon: RiShieldCheckFill, label: "Billing & Payments", path: "/hospitaldashboard/billing-payments" },
      { icon: RiAlarmWarningFill, label: "Emergency", path: "/hospitaldashboard/emergency" },
      { icon: RiUserSettingsFill, label: "Settings", path: "/hospitaldashboard/settings" }
    ],
    superadmin: [
      { icon: RiDashboardFill, label: "Dashboard", path: "/superadmindashboard" },
      { icon: RiUser3Fill, label: "Manage Patients", path: "/superadmindashboard/managepatients" },
      {
        icon: RiStethoscopeFill,
        label: "Manage Doctors",
        isSubmenu: true,
        submenu: [
          { label: "Freelancer Doctors", path: "/superadmindashboard/manage-doctors" },
          { label: "AV Swasthya Doctors", path: "/superadmindashboard/manage-doctors/avswasthya" }
        ]
      },
      { icon: RiHospitalFill, label: "Manage Hospitals", path: "/superadmindashboard/manage-hospitals" },
      { icon: RiMicroscopeFill, label: "Manage Labs", path: "/superadmindashboard/manage-labs" },
      { icon: RiCapsuleFill, label: "Manage Pharmacies", path: "/superadmindashboard/manage-pharmacies" },
      { icon: RiUserSettingsLine, label: "Roles", path: "/superadmindashboard/manage-roles" },
      { icon: RiBarChart2Line, label: "Reports", path: "/superadmindashboard/manage-reports" },
      { icon: RiShieldCheckFill, label: "Payments", path: "/superadmindashboard/payments" },
      { icon: RiSettings3Fill, label: "Settings", path: "/superadmindashboard/settings" }
    ],
    patient: [
      { icon: RiDashboardFill, label: "Dashboard", path: "/patientdashboard" },
      { icon: RiCalendarCheckFill, label: "My Appointments", path: "/patientdashboard/app" },
      { icon: RiShoppingBagFill, label: "Medical Records", path: "/patientdashboard/medical-records" },
       { icon: RiShoppingBagFill, label: "Online Shopping", path: "/patientdashboard/shopping" },
      { icon: RiShieldCheckFill, label: "Insurance", path: "/patientdashboard/insurance" },
      { icon: RiShieldCheckFill, label: "Billing", path: "/patientdashboard/billing" },
      { icon: RiSettings3Fill, label: "Settings", path: "/patientdashboard/settings" }
    ]
  };

  const getDisplayName = () => {
    if (!user) return "Loading...";
    if (["doctor", "freelancer"].includes(user.userType)) return `Dr. ${user.firstName || "Sheetal "} ${user.lastName || "S. Shelke"}`;
    if (user.userType === "hospital") return user.hospitalName || "City Hospital";
    if (user.userType === "lab") return user.labName || "ABC Lab";
    if (user.userType === "superadmin") return user.SuperadminName || "Dr.Shrinivas Shelke";
    return `${user.firstName || "Sheetal"} ${user.lastName || "S Shelake"}`;
  };

  const menuItems = menuItemsMap[user?.userType] || [];

  return (
    <div className={`h-screen bg-[var(--primary-color)] text-white p-4 flex flex-col rounded-xl shadow-xl transition-all duration-300 mx-4 ${isCollapsed ? "w-20" : "w-60"}`}>
      <div className="flex items-center justify-between mb-6">
        <div className={`flex items-center ${isCollapsed ? "justify-center w-full" : ""}`}>
          {!isCollapsed && <div className="text-[var(--primary-color)] text-lg bg-[var(--accent-color)] p-2 rounded-full font-bold">AV</div>}
          {!isCollapsed && <h3 className="ml-3 font-bold">AV Swasthya</h3>}
        </div>
        <button onClick={toggleSidebar} className="text-white hover:bg-slate-500 p-1 rounded-full">
          {isCollapsed ? <RiArrowRightSLine size={24} /> : <RiArrowLeftSLine size={24} />}
        </button>
      </div>

      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-[var(--accent-color)] text-[var(--primary-color)] flex items-center justify-center rounded-full text-xl">
          <RiUser3Fill />
        </div>
        {!isCollapsed && (
          <div className="ml-3">
            <p className="text-sm font-semibold">{getDisplayName()}</p>
            <span className="text-xs text-gray-300">{roleDisplayNames[user?.userType] || "User"}</span>
          </div>
        )}
      </div>

      <hr className="border-gray-700 mb-4" />
      <ul className="flex-1 text-sm overflow-y-auto space-y-1">
        {menuItems.map((item, idx) =>
          item.isSubmenu ? (
            <li key={idx}>
              <button
                onClick={() => handleSubmenuToggle(idx)}
                className="flex items-center justify-between w-full py-2 px-3 rounded-lg hover:bg-[var(--accent-color)] hover:text-[var(--primary-color)] transition"
              >
                <div className="flex items-center gap-4">
                  <item.icon size={20} />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>
                {!isCollapsed && (openSubmenuIndex === idx ? <RiArrowUpSLine /> : <RiArrowDownSLine />)}
              </button>
              {openSubmenuIndex === idx && !isCollapsed && (
                <ul className="ml-6 mt-1 space-y-1 text-sm">
                  {item.submenu.map((sub, subIdx) => (
                    <li key={subIdx}>
                      <NavLink to={sub.path} className={({ isActive }) =>
                        `block px-3 py-1 rounded-md ${isActive ? "bg-[var(--accent-color)] text-[var(--primary-color)]" : "hover:bg-gray-700"}`}>{sub.label}</NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ) : (
            <li key={idx}>
              <NavLink to={item.path} end={item.path === "/" || item.label === "Dashboard"} className={({ isActive }) =>
                `flex items-center gap-4 px-3 py-2 rounded-lg transition ${isActive ? "bg-[var(--accent-color)] text-[var(--primary-color)]" : "hover:bg-gray-700"}`}>
                <item.icon size={20} /> {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          )
        )}
      </ul>
      <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-red-500 bg-red-400 rounded-md mt-4">
        <RiLogoutBoxRFill size={20} /> {!isCollapsed && <span>Logout</span>}
      </button>
    </div>
  );
};

export default Sidebar;