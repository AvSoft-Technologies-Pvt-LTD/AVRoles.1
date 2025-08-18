import React, { useState, useEffect } from "react";
import { Bell, Pill, Menu, X } from "lucide-react";
import { FaAmbulance, FaFileAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import ModulesMenu from "../../components/microcomponents/ModulesMenu";

const HeaderWithNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showModalMenu, setShowModalMenu] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const getUserName = () => {
    if (!user) return null;
    switch (user?.userType?.toLowerCase()) {
      case "doctor":
      case "freelancer":
        return `Dr. ${user.firstName || "Sheetal"} ${user.lastName || "S. Shelke"}`;
      case "hospital":
        return user.hospitalName || "City Hospital";
      case "lab":
        return user.labName || "ABC Lab";
      case "pharmacy":
        return user.pharmacyName || "AV Pharmacy";
      case "patient":
        return `${user.firstName || "Anjali"} ${user.lastName || "Mehra"}`;
      case "superadmin":
        return `${user.firstName || "Dr.Shrinivas"} ${user.lastName || "Shelke"}`;
      default:
        return `${user.firstName || "Anjali"} ${user.lastName || "Mehra"}`;
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("https://67e631656530dbd3110f0322.mockapi.io/drnotifiy");
      const sorted = res.data
        .map((n) => ({
          ...n,
          createdAt: n.createdAt && !isNaN(new Date(n.createdAt)) ? n.createdAt : new Date().toISOString(),
          unread: n.unread ?? true,
          message: n.message || "You have a new notification",
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(sorted);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    if (user?.userType?.toLowerCase() === "patient") {
      const fetch = async () => {
        try {
          const res = await axios.get("https://67e631656530dbd3110f0322.mockapi.io/notify");
          setNotifications(
            res.data
              .map((n) => ({ ...n, unread: n.unread ?? true }))
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          );
        } catch (e) {}
      };
      fetch();
      const i = setInterval(fetch, 10000);
      return () => clearInterval(i);
    } else {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const displayNotifications = notifications.slice(0, 2);

  const getTimeAgo = (time) => {
    const date = new Date(time);
    if (isNaN(date)) return "Unknown time";
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr${Math.floor(diff / 3600) > 1 ? "s" : ""} ago`;
    return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? "s" : ""} ago`;
  };

  return (
    <nav className="sticky top-0 mt-2 z-50 bg-gray-50 py-2 mx-2 sm:mx-4 rounded-lg sm:rounded-xl shadow-md">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12 sm:h-16">
          {user && (
            <div className="text-[var(--primary-color)] font-bold text-lg sm:text-xl">
              {getUserName()}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowDrawer(!showDrawer)}
            className="sm:hidden p-2 rounded-md text-gray-700 hover:bg-gray-200"
          >
            {showDrawer ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Desktop View */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-4 text-[#021630]">
            {user?.userType?.toLowerCase() === "patient" ? (
              <>
                <button
                  onClick={() => navigate("/patientdashboard/pharmacy")}
                  title="Pharmacy"
                  className="flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[var(--primary-color)] hover:bg-[var(--accent-color)] transition-all duration-300 group"
                >
                  <Pill className="h-4 w-4 sm:h-6 sm:w-6 text-white transition-all duration-300 group-hover:text-white" />
                </button>
                <button
                  onClick={() => navigate("/patientdashboard/ambulance")}
                  title="Ambulance"
                  className="flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[var(--primary-color)] hover:bg-[var(--accent-color)] transition-all duration-300 group"
                >
                  <FaAmbulance className="h-4 w-4 sm:h-6 sm:w-6 text-white transition-all duration-300 group-hover:text-white" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[var(--primary-color)] hover:bg-[var(--accent-color)] transition-all duration-300 group"
                  >
                    <Bell className="h-4 w-4 sm:h-6 sm:w-6 text-white transition-all duration-300 group-hover:text-white" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-red-500 text-white w-4 h-4 sm:w-5 sm:h-5 text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-[24rem] bg-white rounded-2xl shadow-2xl border max-h-[80vh] overflow-y-auto z-50">
                      <div className="sticky top-0 bg-[var(--primary-color)] px-5 py-4 border-b flex justify-between items-center rounded-t-2xl">
                        <h3 className="text-lg font-bold text-white">Notifications</h3>
                        {notifications.length > 2 && (
                          <Link
                            to="/patientdashboard/notifications"
                            onClick={() => setShowNotifications(false)}
                            className="text-sm font-medium text-[var(--accent-color)] hover:underline"
                          >
                            View All
                          </Link>
                        )}
                      </div>
                      {displayNotifications.length === 0 ? (
                        <div className="px-5 py-6 text-center text-gray-500 text-sm">
                          You're all caught up :tada:
                        </div>
                      ) : (
                        displayNotifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() =>
                              setNotifications((prev) =>
                                prev.map((notif) => (notif.id === n.id ? { ...notif, unread: false } : notif))
                              )
                            }
                            className={`group px-5 py-4 border-b cursor-pointer transition ${
                              n.unread ? "bg-[var(--accent-color)]/20" : "bg-white"
                            } hover:bg-[var(--accent-color)]/10`}
                          >
                            <div className="flex justify-between gap-3">
                              <div className="flex-1">
                                <p className="text-sm">{n.message}</p>
                                <span className="text-xs text-gray-500 block mt-1">{getTimeAgo(n.createdAt)}</span>
                              </div>
                              {n.unread && (
                                <div className="w-2 h-2 mt-1 bg-[var(--accent-color)] rounded-full group-hover:opacity-80" />
                              )}
                            </div>
                            {n.showPayButton && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log("Pay now clicked for", n.id);
                                }}
                                className="mt-3 bg-[var(--accent-color)] hover:bg-[#E0B320] text-[var(--primary-color)] text-xs px-4 py-1 rounded-full"
                              >
                                Pay Now
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              ["doctor", "hospital"].includes(user?.userType?.toLowerCase()) && (
                <>
                  <button
                    className="flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[var(--primary-color)] hover:bg-[var(--accent-color)] transition-all duration-300 group"
                    onClick={() => {
                      const specialization =
                        localStorage.getItem("selectedSpecialization") || "General Physician";
                      const specializationRoute = specialization.toLowerCase().replace(/\s+/g, "-");
                      const dashboardPrefix = {
                        doctor: "doctordashboard",
                        hospital: "hospitaldashboard",
                        freelancer: "freelancerdashboard",
                      }[user?.userType?.toLowerCase()] || "";
                      navigate(`/${dashboardPrefix}/specialization`, {
                        state: { specialization, uploadedFiles: [] },
                      });
                    }}
                  >
                    <FaFileAlt className="h-4 w-4 sm:h-6 sm:w-6 text-white transition-all duration-300 group-hover:text-white" />
                  </button>
                  <ModulesMenu user={user} />
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[var(--primary-color)] hover:bg-[var(--accent-color)] transition-all duration-300 group"
                    >
                      <Bell className="h-4 w-4 sm:h-6 sm:w-6 text-white transition-all duration-300 group-hover:text-white" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-red-500 text-white w-4 h-4 sm:w-5 sm:h-5 text-xs rounded-full flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-[24rem] bg-white rounded-2xl shadow-2xl border max-h-[80vh] overflow-y-auto z-50">
                        <div className="sticky top-0 bg-[var(--primary-color)] px-5 py-4 border-b flex justify-between items-center rounded-t-2xl">
                          <h3 className="text-lg font-bold text-white">Notifications</h3>
                          {notifications.length > 2 && (
                            <Link
                              to={
                                user?.userType?.toLowerCase() === "hospital"
                                  ? "/hospitaldashboard/notifications"
                                  : "/doctordashboard/notifications"
                              }
                              onClick={() => setShowNotifications(false)}
                              className="text-sm font-medium text-[var(--accent-color)] hover:underline"
                            >
                              View All
                            </Link>
                          )}
                        </div>
                        {displayNotifications.length === 0 ? (
                          <div className="px-5 py-6 text-center text-gray-500 text-sm">
                            You're all caught up :tada:
                          </div>
                        ) : (
                          displayNotifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() =>
                                setNotifications((prev) =>
                                  prev.map((notif) => (notif.id === n.id ? { ...notif, unread: false } : notif))
                                )
                              }
                              className={`group px-5 py-4 border-b cursor-pointer transition ${
                                n.unread ? "bg-[var(--accent-color)]/20" : "bg-white"
                              } hover:bg-[var(--accent-color)]/10`}
                            >
                              <div className="flex justify-between gap-3">
                                <div className="flex-1">
                                  <p className="text-sm">{n.message}</p>
                                  <span className="text-xs text-gray-500 block mt-1">{getTimeAgo(n.createdAt)}</span>
                                </div>
                                {n.unread && (
                                  <div className="w-2 h-2 mt-1 bg-[var(--accent-color)] rounded-full group-hover:opacity-80" />
                                )}
                              </div>
                              {n.showPayButton && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log("Pay now clicked for", n.id);
                                  }}
                                  className="mt-3 bg-[var(--accent-color)] hover:bg-[#E0B320] text-[var(--primary-color)] text-xs px-4 py-1 rounded-full"
                                >
                                  Pay Now
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </>
              )
            )}
          </div>

          {/* Mobile Drawer */}
          {showDrawer && (
            <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm sm:hidden">
              <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-xl p-4 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-800">{getUserName()}</h2>
                  <button onClick={() => setShowDrawer(false)}>
                    <X className="h-5 w-5 text-gray-600" />
                  </button>
                </div>

                {/* Patient Mobile Menu */}
                {user?.userType?.toLowerCase() === "patient" ? (
                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        setShowDrawer(false);
                        navigate("/patientdashboard/profile");
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
                    >
                      <FaFileAlt className="h-5 w-5 text-gray-600" />
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowDrawer(false);
                        navigate("/patientdashboard/pharmacy");
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
                    >
                      <Pill className="h-5 w-5 text-gray-600" />
                      <span>Pharmacy</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowDrawer(false);
                        navigate("/patientdashboard/ambulance");
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
                    >
                      <FaAmbulance className="h-5 w-5 text-gray-600" />
                      <span>Ambulance</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowDrawer(false);
                        navigate("/patientdashboard/notifications");
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
                    >
                      <Bell className="h-5 w-5 text-gray-600" />
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  </div>
                ) : (
                  // Doctor/Hospital Mobile Menu
                  ["doctor", "hospital"].includes(user?.userType?.toLowerCase()) && (
                    <div className="space-y-4">
                      <button
                        onClick={() => {
                          const specialization =
                            localStorage.getItem("selectedSpecialization") || "General Physician";
                          const dashboardPrefix = {
                            doctor: "doctordashboard",
                            hospital: "hospitaldashboard",
                            freelancer: "freelancerdashboard",
                          }[user?.userType?.toLowerCase()] || "";
                          setShowDrawer(false);
                          navigate(`/${dashboardPrefix}/specialization`, {
                            state: { specialization, uploadedFiles: [] },
                          });
                        }}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
                      >
                        <FaFileAlt className="h-5 w-5 text-gray-600" />
                        <span>Specialization</span>
                      </button>
                      <ModulesMenu user={user} mobileView={true} />
                      <button
                        onClick={() => {
                          setShowDrawer(false);
                          navigate(
                            user?.userType?.toLowerCase() === "hospital"
                              ? "/hospitaldashboard/notifications"
                              : "/doctordashboard/notifications"
                          );
                        }}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
                      >
                        <Bell className="h-5 w-5 text-gray-600" />
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default HeaderWithNotifications;
