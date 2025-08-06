import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {FaUsers,
  FaTh, FaUserShield, FaDesktop, FaVial, FaCapsules,
  FaUserClock , FaListOl
} from "react-icons/fa";
const modules = [
  { name: "Frontdesk", icon: FaDesktop },
  { name: "Admin", icon: FaUserShield },
  { name: "Laboratory", icon: FaVial },
  { name: "Pharmacy", icon: FaCapsules },
  { name: "NewToken", icon: FaUserClock  },
  { name: "DisplayToken", icon: FaListOl },
  
  { name: "QueueStatus", icon: FaUsers  }
];

export default function ModulesMenu({ user }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const clickOutside = e => !menuRef.current?.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const basePath =
    user?.userType?.toLowerCase() === "doctor"
      ? "/doctordashboard"
      : user?.userType?.toLowerCase() === "hospital"
      ? "/hospitaldashboard"
      : "";

  const routes = {
    Admin: "/dr-admin",
    DisplayToken: "/tokendisplay",
    NewToken: "/queuetoken",
    Pharmacy: "/pharmacymodule",
    Laboratory: "/labmodule",
    Frontdesk: "/frontdesk",
    QueueStatus: "/queuemanagement"
  };

  const handleClick = name => {
    navigate(`${basePath}${routes[name] || ""}`);
    setOpen(false);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="p-3 bg-[var(--primary-color)] text-white rounded-full hover:bg-[var(--accent-color)] transition"
      >
        <FaTh size={20} />
      </button>

      {open && (
        <div className="absolute top-14 right-0 bg-white rounded-xl shadow-xl px-6 py-4 flex gap-6">
          {modules.map(({ name, icon: Icon }, i) => (
            <button
              key={name}
              onClick={() => handleClick(name)}
              className="flex flex-col items-center text-center group transition-all"
              style={{ animation: `slideUpFadeIn 0.5s ${i * 0.08}s both` }}
            >
              <div className="mb-2 w-14 h-14 flex items-center justify-center rounded-full 
                bg-gradient-to-br from-[#1CA4AC]/20 to-[#68C723]/20 text-[var(--primary-color)]
                group-hover:from-[#1CA4AC] group-hover:to-[#68C723] group-hover:text-white 
                shadow-md group-hover:scale-110 transition duration-300">
                <Icon className="text-2xl" />
              </div>
              <span className="text-sm font-medium text-[var(--primary-color)] group-hover:text-[var(--accent-color)]">
                {name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


