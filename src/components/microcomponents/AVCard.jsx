import { useState } from "react";
import { QrCode, Heart, Pill, Syringe, Phone } from "lucide-react";
import { motion } from "framer-motion";
import logo from "../../assets/logo.png";

const AVCard = () => {
  const [formData] = useState({
    name: "Enter Your Name",
    mobile: "Enter Your Mobile No.",
    dob: "Date of birth",
    gender: "Gender",
    healthId: "250810-MH00F-99271",
    helpline: "1800-123-4567",
    imageUrl:
      "https://img.freepik.com/vecteurs-premium/icone-profil-avatar-par-defaut-image-utilisateur-medias-sociaux-icone-avatar-gris-silhouette-profil-vide-illustration-vectorielle_561158-3383.jpg",
  });

  const bgIcons = [
    { Icon: Heart, pos: "top-4 right-20" },
    { Icon: Pill, pos: "bottom-12 left-12" },
    { Icon: Syringe, pos: "bottom-20 right-20" },
  ];

  return (
    <motion.div
      style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
      initial={{ opacity: 0.85, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative w-full max-w-[320px] md:max-w-[350px] h-[220px] md:h-[240px] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-green-600 to-green-800 text-white mx-auto"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#0E1630] to-[#01D48C] opacity-90"></div>

      {/* Background icons */}
      <div className="absolute inset-0 overflow-hidden">
        {bgIcons.map(({ Icon, pos }, i) => (
          <motion.div
            key={i}
            className={`absolute ${pos}`}
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 360, 0],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{
              duration: 8 + i,
              repeat: Infinity,
              delay: i * 0.8,
            }}
          >
            <Icon size={24} className="text-green-200" />
          </motion.div>
        ))}
      </div>

      {/* Card content */}
      <div className="relative h-full p-4 flex flex-col">
        {/* Logo & Title */}
        <div className="flex justify-start items-center gap-2 mb-1">
          <img src={logo} alt="AV Logo" className="w-10 h-10" />
          <div className="text-left">
            <h1 className="text-lg font-extrabold text-[#01D48C]">DigiHealth</h1>
            <p className="text-xs font-semibold text-gray-300">
              Healthcare Solutions
            </p>
          </div>
        </div>

        {/* User Info and QR Code */}
        <div className="flex justify-between items-center flex-grow mt-1">
          <div className="flex items-center gap-3">
            <img
              src={formData.imageUrl}
              alt="User"
              className="w-14 h-14 md:w-16 md:h-16  object-cover border-2 border-white"
            />
            <div className="text-sm">
              <p className="font-semibold">{formData.name}</p>
              <div className="mt-1 flex items-center gap-1">
                <strong className="text-xs text-gray-300">Mobile:</strong>
                <span className="text-xs">{formData.mobile}</span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <strong className="text-xs text-gray-300">DOB:</strong>
                <span className="text-xs">{formData.dob}</span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <strong className="text-xs text-gray-300">Gender:</strong>
                <span className="text-xs">{formData.gender}</span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-white p-1 rounded">
              <QrCode size={55} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Footer: Health ID & Helpline */}
        <div className="flex flex-col items-center justify-center mt-2  text-gray-300">
          <div className="text-sm font-semibold">
            Health ID: {formData.healthId}
          </div>
          <div className="flex items-center gap-2 text-xs mt-1">
            <Phone className="w-3 h-3" />
            <span>
              Helpline:{" "}
              <span className="font-semibold">{formData.helpline}</span>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AVCard;
