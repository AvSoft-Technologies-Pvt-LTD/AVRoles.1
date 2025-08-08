import React, { useState, useEffect } from "react";
import { Bell, Pill } from "lucide-react";
import { FaAmbulance } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import ModulesMenu from "../../components/microcomponents/ModulesMenu";
const HeaderWithNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
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
  const getRoleLabel = () => {
    if (!user) return null;
    switch (user?.userType?.toLowerCase()) {
      case "doctor":
        return "Hospital-Associated Doctor";
      case "freelancer":
        return "Freelancer Doctor";
      case "hospital":
        return "Hospital Admin";
      case "pharmacy":
        return "Pharmacy Manager";
      case "lab":
        return "Lab Technician";
      case "patient":
        return "Patient";
      case "superadmin":
        return "Super Admin";
      default:
        return "User";
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
      // Patient notifications API
      const fetch = async () => {
        try {
          const res = await axios.get('https://67e631656530dbd3110f0322.mockapi.io/notify');
          setNotifications(res.data.map(n => ({ ...n, unread: n.unread ?? true })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (e) { }
      };
      fetch();
      const i = setInterval(fetch, 10000);
      return () => clearInterval(i);
    } else {
      // Doctor/hospital notifications API
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
    <nav className="sticky top-0 mt-2 z-50 bg-gray-50 py-2 mx-4 shadow-md rounded-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {user && (
            <div className="text-[var(--primary-color)] font-bold text-xl">
              {getUserName()} / <span className="text-black">{getRoleLabel()}</span>
            </div>
          )}
          {/* Patient header layout */}
          {user?.userType?.toLowerCase() === "patient" ? (
            <div className="flex items-center gap-4 text-[#021630]">
              {showModalMenu && (
                <Modal onClose={() => setShowModalMenu(false)}>
                  <div className="p-6">
                    <h2 className="text-lg font-bold mb-4">Quick Menu</h2>
                    <ul className="space-y-2">
                      <li><button className="btn w-full" onClick={() => { setShowModalMenu(false); navigate('/patientdashboard/profile'); }}>Patient Profile</button></li>
                      <li><button className="btn w-full" onClick={() => { setShowModalMenu(false); navigate('/patientdashboard/pharmacy'); }}>Pharmacy</button></li>
                      <li><button className="btn w-full" onClick={() => { setShowModalMenu(false); navigate('/patientdashboard/ambulance'); }}>Ambulance</button></li>
                    </ul>
                  </div>
                </Modal>
              )}
              {/* Notifications (patient logic) */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative px-3 py-2 rounded-full border-none bg-gray-300 hover:bg-[var(--accent-color)] hover:text-white transition-all duration-300 transform hover:scale-110 shadow-sm hover:shadow-md"
                  title="Notifications"
                >
                  <Bell className="h-6 w-6 text-[var(--primary-color)] transition-all duration-300 group-hover:text-white hover:animate-[wiggle_0.3s_ease-in-out]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs animate-bounce shadow-md">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-[24rem] bg-white rounded-2xl shadow-2xl border max-h-[80vh] overflow-y-auto z-50">
                    <div className="sticky top-0 bg-[var(--primary-color)] px-5 py-4 border-b flex justify-between items-center rounded-t-2xl">
                      <h3 className="text-lg font-bold text-white">Notifications</h3>
                      {notifications.length > 0 && (
                        <Link to="/patientdashboard/notifications" className="text-sm font-medium text-[var(--accent-color)] hover:underline" onClick={() => { setShowNotifications(false); navigate('/patientdashboard/notifications'); }}>View All</Link>
                      )}
                    </div>
                    {displayNotifications.length === 0 ? (
                      <div className="px-5 py-6 text-center text-gray-500 text-sm">You're all caught up :tada:</div>
                    ) : (
                      displayNotifications.map(notification => (
                        <div key={notification.id} onClick={() => setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, unread: false } : n))} className={`group px-5 py-4 transition cursor-pointer border-b ${notification.unread ? 'bg-[var(--accent-color)]/20' : 'bg-white'} hover:bg-[var(--accent-color)]/10`}>
                          <div className="flex justify-between gap-3 items-start">
                            <div className="flex-1">
                              <p className="text-sm paraghraph">{notification.message}</p>
                              <span className="text-xs text-gray-500 mt-1 block">{getTimeAgo(notification.createdAt)}</span>
                            </div>
                            {notification.unread && <div className="w-2 h-2 mt-1 bg-[var(--accent-color)] rounded-full shrink-0 group-hover:opacity-80 transition-opacity" />}
                          </div>
                          {notification.showPayButton && (
                            <button onClick={e => { e.stopPropagation(); console.log('Pay now clicked for notification:', notification.id); }} className="mt-3 inline-block btn btn-primary text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm transition-colors">Pay Now</button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => navigate('/patientdashboard/pharmacy')}
                title="Pharmacy"
                className="group p-3 rounded-full bg-[var(--accent-color)]  hover:bg-[var(--primary-color)] transition-all duration-300 transform hover:scale-110 hover:shadow-md" >
                <Pill className="h-5 w-5 text-white transition-all duration-300 group-hover:rotate-12" />
              </button>
            <button
      onClick={() => navigate('/patientdashboard/ambulance')}
      title="Ambulance"
      className="group px-3 py-2 rounded-full  transition-all duration-300 transform hover:scale-110 bg-red-500"
    >
      <FaAmbulance className="h-6 w-6 text-white shine-blink" />
    </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 text-[#021630]">
              {/* Generate Button before menu */}
              {["doctor", "hospital"].includes(user?.userType?.toLowerCase()) && (
                <>
                  <button
  className="btn btn-primary flex items-center"
  onClick={() => {
    const specialization =
      localStorage.getItem("selectedSpecialization") || "General Physician";
    const specializationRoute = specialization.toLowerCase().replace(/\s+/g, "-");

    // Map user type to dashboard prefix
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
  Generate Template
</button>

                  <ModulesMenu user={user} />
                </>
              )}
              <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className="relative group">
                  <Bell className="h-6 w-6 group-hover:text-[var(--accent-color)] cursor-pointer" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-[24rem] bg-white rounded-2xl shadow-2xl border max-h-[80vh] overflow-y-auto z-50">
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
                          className="text-sm text-[var(--accent-color)] hover:underline"
                        >
                          View All
                        </Link>
                      )}
                    </div>
                    {displayNotifications.length === 0 ? (
                      <div className="px-5 py-6 text-center text-gray-500 text-sm">You're all caught up :tada:</div>
                    ) : (
                      displayNotifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() =>
                            setNotifications((prev) =>
                              prev.map((notif) => (notif.id === n.id ? { ...notif, unread: false } : notif))
                            )
                          }
                          className={`group px-5 py-4 border-b cursor-pointer transition ${n.unread ? "bg-[var(--accent-color)]/20" : "bg-white"
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
                              className="mt-3 bg-[var(--accent-color)] hover:bg-[#E0B320] text-[var(--primary-color)] text-xs px-4 py-1.5 rounded-full"
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
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
export default HeaderWithNotifications;