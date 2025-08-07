import { useState, useEffect } from "react";
import { QrCode, Heart, Pill, Syringe, User, Calendar, HeartPulse, IdCard } from "lucide-react";
import { motion } from "framer-motion";

const AVCard = ({ initialName, initialCardNumber, initialGender, imageUrl, initialDob }) => {
  const [formData, setFormData] = useState({
    name: initialName,
    cardNumber: initialCardNumber,
    gender: initialGender,
    dob: initialDob,
    imageUrl
  });

  useEffect(() => {
    setFormData({
      name: initialName,
      cardNumber: initialCardNumber,
      gender: initialGender,
      dob: initialDob,
      imageUrl
    });
  }, [initialName, initialCardNumber, initialGender, initialDob, imageUrl]);

  // Extract just the day from DOB
  const getDobDay = (dob) => {
    if (!dob) return "";
    return dob.split("-")[2]; // returns "16" from "2025-08-16"
  };

  const generateAvAddress = (name, dob) => {
    const day = getDobDay(dob);
    const cleaned = name?.split(" ")[0]?.toLowerCase() || "user";
    return `${cleaned}${day}@avswasthya.in`;
  };

  const bgIcons = [
    { Icon: Heart, pos: "top-4 right-28" },
    { Icon: Pill, pos: "bottom-8 left-12" },
    { Icon: Syringe, pos: "bottom-22 right-26" }
  ];

  return (
    <motion.div
      style={{ fontFamily: "var(--font-family)" }}
      initial={{ opacity: 0.85, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative w-[380px] h-[250px] rounded-2xl overflow-hidden shadow-2xl hover:shadow-[var(--primary-color)]/20 transition-shadow duration-300"
    >
      <motion.div
        animate={{
          background: [
            "linear-gradient(135deg, rgb(1, 212, 140) 0%, rgba(14, 22, 48, 0.95) 50%, rgba(14, 22, 48, 0.9) 100%)"
          ]
        }}
        className="absolute inset-0"
      />
      <div className="absolute inset-0 overflow-hidden">
        {bgIcons.map(({ Icon, pos }, i) => (
          <motion.div
            key={i}
            className={`absolute ${pos}`}
            animate={{ scale: [1, 1.2, 1], rotate: [0, 360, 0], opacity: [0.12, 0.12, 0.16] }}
            transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.8 }}
          >
            <Icon size={24} className="text-[var(--accent-color)]" />
          </motion.div>
        ))}
      </div>

      <div className="relative h-full p-6 flex flex-col justify-between">
        {/* Top Section */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.1 }} className="w-auto h-auto rounded-full  border-2 border-[var(--accent-color)] shadow-md">
              <motion.img
                src={
                  formData.imageUrl ||
                  "https://img.freepik.com/vecteurs-premium/icone-profil-avatar-par-defaut-image-utilisateur-medias-sociaux-icone-avatar-gris-silhouette-profil-vide-illustration-vectorielle_561158-3383.jpg"
                }
                alt="User Avatar"
                className="w-16 h-16 object-cover"
                initial={{ opacity: 0.9 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              />
            </motion.div>
            <div >
              <input
                type="text"
                name="name"
                value={formData.name}
                readOnly
                className="bg-transparent text-[15px] font-semibold text-white tracking-wide w-full"
                placeholder="Enter Name"
              />
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                readOnly
                className="bg-transparent text-sm text-[var(--accent-color)] tracking-wider font-medium w-full"
                placeholder="Health ID"
              />
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} className="p-2.5 rounded-xl bg-[var(--accent-color)]/10 hover:bg-[var(--accent-color)]/20 transition-colors duration-300">
            <QrCode className="w-8 h-8 text-[var(--accent-color)]" />
          </motion.div>
        </div>

        {/* Middle Info Section with Labels */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <motion.div whileHover={{ scale: 1.02 }} className="flex flex-col bg-[var(--accent-color)]/10 p-2 rounded-lg hover:bg-[var(--accent-color)]/20">

            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[var(--accent-color)]" />
              <label className="text-[10px] text-white/70 whitespace-nowrap">Gender</label>
              <input
                type="text"
                name="gender"
                value={formData.gender}
                readOnly
                className="w-full bg-transparent text-sm text-white"
              />
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="flex flex-col bg-[var(--accent-color)]/10 p-2 rounded-lg hover:bg-[var(--accent-color)]/20">  
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--accent-color)]" />
               <label className="text-[10px] text-white/70 whitespace-nowrap">DOB</label>
            <input
              type="text"
              name="dob"
              value={formData.dob}
              readOnly
              className="w-full bg-transparent text-sm text-white"
              placeholder="DOB"
            />
            </div>
          </motion.div>
        </div>

        {/* AV Address Section with Label */}
        {/* <motion.div className="mt-2" whileHover={{ scale: 1.02 }}>
          <div className="flex flex-col bg-[var(--accent-color)]/10 p-2 rounded-lg hover:bg-[var(--accent-color)]/20">
            
   <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--accent-color)]/20">
  <IdCard className="w-4 h-4 text-[var(--accent-color)]" />
  <span className="text-[10px] text-white/70 whitespace-nowrap">AV Address:</span>
  <input
    type="text"
    value={generateAvAddress(formData.name, formData.dob)}
    readOnly
    className="bg-transparent text-xs text-white tracking-wide w-full"
  />
</div>


          </div>
        </motion.div> */}

        {/* Branding Section */}
        <motion.div className="flex justify-end mt-3" whileHover={{ scale: 1.02 }}>
          <div className="text-right">
            <div className="text-[var(--accent-color)] font-bold text-xl tracking-wider flex items-center gap-2">
              AV SWASTHYA
              <motion.div animate={{ scale: [1, 1.3, 1, 0.9, 1], transition: { duration: 1, repeat: Infinity } }}>
                <HeartPulse className="w-5 h-5 text-[var(--accent-color)]" />
              </motion.div>
            </div>
            <div className="text-xs text-white/80 tracking-wider mt-0.5">Healthcare Solutions</div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AVCard;