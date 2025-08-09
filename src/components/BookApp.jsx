

import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaStethoscope, FaCalendarAlt, FaClock, FaUser, FaHospital } from 'react-icons/fa';

const symptomSpecialtyMap = {
  fever: ["General Physician", "Pediatrics", "Pathology", "Psychiatry", "Oncology"],
  cough: ["General Physician", "Pulmonology", "ENT", "Oncology", "Pathology"],
  chestpain: ["Cardiology", "Pulmonology", "Gastroenterology", "General Medicine", "Orthopedics"],
  acne: ["Dermatology", "Endocrinology", "Psychiatry", "Pathology"],
  skinrash: ["Dermatology", "Pediatrics", "Pathology", "Oncology"],
  headache: ["Neurology", "General Medicine", "Psychiatry", "ENT"],
  stomachache: ["Gastroenterology", "General Medicine", "Pediatrics", "Endocrinology"],
  toothache: ["Dentistry", "Pediatrics", "General Medicine"],
  pregnancy: ["Gynecology", "Pediatrics", "Nephrology"],
  anxiety: ["Psychiatry", "Endocrinology", "General Medicine"],
  bloodinurine: ["Nephrology", "Hematology", "Urology"],
  fatigue: ["General Medicine", "Endocrinology", "Oncology", "Psychiatry"],
  jointpain: ["Orthopedics", "General Medicine", "Endocrinology"]
};

const stateCityMap = {
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Amravati", "Kolhapur"],
  "Delhi": ["New Delhi", "Delhi"],
  "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga", "Dharwad"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut", "Varanasi", "Allahabad", "Bareilly"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
  "Haryana": ["Faridabad", "Gurgaon", "Panipat", "Ambala", "Yamunanagar"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Brahmapur"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama"],
  "Tripura": ["Agartala"],
  "Meghalaya": ["Shillong"],
  "Manipur": ["Imphal"],
  "Nagaland": ["Kohima", "Dimapur"],
  "Mizoram": ["Aizawl"],
  "Arunachal Pradesh": ["Itanagar"],
  "Sikkim": ["Gangtok"],
  "Andaman and Nicobar Islands": ["Port Blair"],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli": ["Silvassa"],
  "Daman and Diu": ["Daman"],
  "Lakshadweep": ["Kavaratti"],
  "Puducherry": ["Puducherry"]
};

const MultiStepForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);

  // Get preserved state from navigation or session storage
  const getInitialState = () => {
    // First check if state was passed from navigation (when coming back from doctor list)
    if (location.state?.preservedFormState) {
      return location.state.preservedFormState;
    }
    
    // Otherwise, get from session storage or use suggested values
    const suggestedValues = {
      location: sessionStorage.getItem('suggestedLocation') || "",
      specialty: sessionStorage.getItem('suggestedSpecialty') || "",
      doctorType: sessionStorage.getItem('suggestedDoctorType') || "All",
      symptoms: sessionStorage.getItem('suggestedSymptoms') || ""
    };

    return {
      consultationType: sessionStorage.getItem('formState_consultationType') || "Physical",
      symptoms: sessionStorage.getItem('formState_symptoms') || suggestedValues.symptoms,
      specialty: sessionStorage.getItem('formState_specialty') || suggestedValues.specialty,
      specialties: [],
      selectedDoctor: null,
      doctors: [],
      filteredDoctors: [],
      states: Object.keys(stateCityMap),
      selectedState: sessionStorage.getItem('formState_selectedState') || "",
      cities: [],
      location: sessionStorage.getItem('formState_location') || suggestedValues.location,
      pincode: sessionStorage.getItem('formState_pincode') || "",
      pincodeLoading: false,
      pincodeError: "",
      doctorType: sessionStorage.getItem('formState_doctorType') || suggestedValues.doctorType,
      hospitalName: sessionStorage.getItem('formState_hospitalName') || "",
      minPrice: sessionStorage.getItem('formState_minPrice') || "",
      maxPrice: sessionStorage.getItem('formState_maxPrice') || "",
      selectedDate: "",
      selectedTime: "",
      fullAddress: sessionStorage.getItem('formState_fullAddress') || "",
      showBookingModal: false,
      showConfirmationModal: false,
      isLoading: false,
      loadingCities: false,
      isCurrentLocation: sessionStorage.getItem('formState_isCurrentLocation') === 'true'
    };
  };

  const [state, setState] = useState(getInitialState);
  const [formSteps, setFormSteps] = useState([]);

  const updateState = (updates) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      
      // Save important form state to session storage
      const formStateKeys = [
        'consultationType', 'symptoms', 'specialty', 'selectedState', 
        'location', 'pincode', 'doctorType', 'hospitalName', 'minPrice', 'maxPrice',
        'fullAddress', 'isCurrentLocation'
      ];
      
      formStateKeys.forEach(key => {
        if (newState[key] !== undefined && newState[key] !== null) {
          sessionStorage.setItem(`formState_${key}`, newState[key].toString());
        }
      });
      
      return newState;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const doctorsRes = await axios.get("https://mocki.io/v1/27910480-af4b-4bb1-94e6-8f5ecfec5603");
        updateState({ doctors: doctorsRes.data || [], loadingCities: false });
        
        // Restore cities if selectedState exists
        if (state.selectedState) {
          const cities = stateCityMap[state.selectedState] || [];
          updateState({ cities });
        }
        
        if (state.specialty && state.doctorType === "AV Swasthya") {
          const filtered = (doctorsRes.data || []).filter(d => 
            d.specialty === state.specialty && 
            d.doctorType === "AV Swasthya" && 
            (state.location ? d.location === state.location : true)
          );
          updateState({ filteredDoctors: filtered });
        }
        
        if (state.symptoms) {
          const val = state.symptoms.toLowerCase().replace(/\s/g, "");
          updateState({ specialties: symptomSpecialtyMap[val] || [] });
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        updateState({ doctors: [], filteredDoctors: [] });
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    // Ensure we have doctors array before filtering
    if (!state.doctors || !Array.isArray(state.doctors)) {
      return;
    }

    const filtered = state.doctors.filter(d =>
      d.consultationType?.toLowerCase() === state.consultationType.toLowerCase() &&
      d.specialty === state.specialty &&
      (state.consultationType !== "Physical" || d.location === state.location) &&
      (state.minPrice === "" || parseInt(d.fees) >= parseInt(state.minPrice)) &&
      (state.maxPrice === "" || parseInt(d.fees) <= parseInt(state.maxPrice)) &&
      (state.hospitalName === "" || d.hospital?.toLowerCase().includes(state.hospitalName.toLowerCase())) &&
      (state.doctorType === "All" || d.doctorType === state.doctorType)
    );
    updateState({ filteredDoctors: filtered });
  }, [state.doctors, state.consultationType, state.specialty, state.location, state.minPrice, state.maxPrice, state.hospitalName, state.doctorType]);

  useEffect(() => {
    if (state.consultationType === "Virtual") {
      updateState({
        selectedState: "",
        location: "",
        pincode: "",
        cities: [],
        fullAddress: "",
        pincodeError: "",
        isCurrentLocation: false
      });
    }
  }, [state.consultationType]);

  // Function to fetch location data by pincode
  const fetchLocationByPincode = async (pincode) => {
    if (!pincode || pincode.length !== 6) {
      updateState({ pincodeError: "Please enter a valid 6-digit pincode" });
      return;
    }

    updateState({ pincodeLoading: true, pincodeError: "" });

    try {
      // Using India Post API for pincode lookup
      const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
      
      if (response.data && response.data[0] && response.data[0].Status === "Success") {
        const postOfficeData = response.data[0].PostOffice[0];
        const detectedState = postOfficeData.State;
        const detectedDistrict = postOfficeData.District;
        const detectedCity = postOfficeData.Name;
        
        // Find matching state in our stateCityMap
        let matchedState = "";
        let matchedCity = "";
        
        // First try to find exact state match
        for (const [stateName, cities] of Object.entries(stateCityMap)) {
          if (stateName.toLowerCase() === detectedState.toLowerCase()) {
            matchedState = stateName;
            
            // Try to find matching city
            const cityMatch = cities.find(city => 
              city.toLowerCase().includes(detectedDistrict.toLowerCase()) ||
              city.toLowerCase().includes(detectedCity.toLowerCase()) ||
              detectedDistrict.toLowerCase().includes(city.toLowerCase())
            );
            
            if (cityMatch) {
              matchedCity = cityMatch;
            } else {
              // If no exact city match, use the first city of the state
              matchedCity = cities[0] || "";
            }
            break;
          }
        }
        
      
        if (!matchedState) {
          for (const [stateName, cities] of Object.entries(stateCityMap)) {
            if (stateName.toLowerCase().includes(detectedState.toLowerCase()) ||
                detectedState.toLowerCase().includes(stateName.toLowerCase())) {
              matchedState = stateName;
              matchedCity = cities[0] || "";
              break;
            }
          }
        }
        
        if (matchedState) {
          updateState({
            selectedState: matchedState,
            cities: stateCityMap[matchedState] || [],
            location: matchedCity,
            fullAddress: `${postOfficeData.Name}, ${postOfficeData.District}, ${postOfficeData.State} - ${pincode}`,
            pincodeLoading: false,
            pincodeError: "",
            isCurrentLocation: false
          });
        } else {
          updateState({
            pincodeLoading: false,
            pincodeError: `Location found: ${detectedCity}, ${detectedState}, but not available in our service area`
          });
        }
      } else {
        updateState({
          pincodeLoading: false,
          pincodeError: "Invalid pincode or location not found"
        });
      }
    } catch (error) {
      console.error("Pincode lookup error:", error);
      updateState({
        pincodeLoading: false,
        pincodeError: "Failed to fetch location. Please try again."
      });
    }
  };

  // Handle pincode input change
  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      updateState({ 
        pincode: value,
        pincodeError: ""
      });
      
      // Auto-fetch when 6 digits are entered
      if (value.length === 6) {
        fetchLocationByPincode(value);
      }
    }
  };

  const handleStateChange = e => {
    const selectedState = e.target.value;
    const cities = selectedState ? stateCityMap[selectedState] || [] : [];
    updateState({
      selectedState,
      cities,
      location: "",
      pincode: "",
      pincodeError: "",
      isCurrentLocation: false
    });
  };

  const handleLocationChange = e => {
    if (e.target.value === "current-location") {
      if (!navigator.geolocation) return alert("Geolocation not supported");
      updateState({ isCurrentLocation: true });
      navigator.geolocation.getCurrentPosition(async position => {
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`);
          const data = await response.json();
          const detectedCity = data.address?.city || data.address?.town || data.address?.village || "";
          const detectedState = data.address?.state || "";
          let matchedState = "";
          for (const [stateName, cities] of Object.entries(stateCityMap)) {
            if (cities.some(city => city.toLowerCase().includes(detectedCity.toLowerCase()))) {
              matchedState = stateName;
              break;
            }
          }
          if (!matchedState && detectedState) {
            for (const stateName of Object.keys(stateCityMap)) {
              if (stateName.toLowerCase().includes(detectedState.toLowerCase()) || detectedState.toLowerCase().includes(stateName.toLowerCase())) {
                matchedState = stateName;
                break;
              }
            }
          }
          updateState({
            selectedState: matchedState,
            cities: matchedState ? stateCityMap[matchedState] : [],
            location: detectedCity,
            fullAddress: data.display_name || "",
            states: matchedState ? [matchedState] : Object.keys(stateCityMap),
            pincode: "",
            pincodeError: "",
            isCurrentLocation: true
          });
        } catch (error) {
          console.error("Location error:", error);
          alert("Failed to fetch location");
          updateState({ isCurrentLocation: false });
        }
      }, error => {
        console.error("Geolocation error:", error);
        alert("Failed to get your location");
        updateState({ isCurrentLocation: false });
      });
    } else {
      updateState({
        location: e.target.value,
        fullAddress: "",
        pincode: "",
        pincodeError: "",
        isCurrentLocation: false
      });
    }
  };

  const handleManualStateChange = e => {
    if (!state.isCurrentLocation) {
      updateState({ states: Object.keys(stateCityMap) });
    }
    handleStateChange(e);
  };

  const scrollRef = useRef(null);
  const [currentGroup, setCurrentGroup] = useState(0);

  const cardWidth = 300;
  const visibleCards = 3;
  
  // Safe calculation with null check
  const totalGroups = state.filteredDoctors && Array.isArray(state.filteredDoctors) 
    ? Math.ceil(state.filteredDoctors.length / visibleCards) 
    : 0;

  const scrollToGroup = groupIndex => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: groupIndex * cardWidth * visibleCards,
        behavior: "smooth"
      });
      setCurrentGroup(groupIndex);
    }
  };

  const scroll = (dir) => {
    let newGroup = currentGroup + dir;
    if (newGroup < 0) newGroup = 0;
    if (newGroup >= totalGroups) newGroup = totalGroups - 1;
    scrollToGroup(newGroup);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const container = scrollRef.current;
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        if (container.scrollLeft + 300 >= maxScrollLeft) {
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          container.scrollBy({ left: 300, behavior: "smooth" });
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSymptomsChange = e => {
    const val = e.target.value.toLowerCase().replace(/\s/g, "");
    updateState({
      symptoms: e.target.value,
      specialties: symptomSpecialtyMap[val] || [],
      specialty: ""
    });
  };

  const handlePayment = async () => {
    const userId = localStorage.getItem("userId");
    const payload = {
      userId,
      name: `${user?.firstName || "Guest"} ${user?.lastName || ""}`,
      phone: user?.phone || "N/A",
      email: user?.email,
      symptoms: state.symptoms,
      date: state.selectedDate,
      time: state.selectedTime,
      specialty: state.specialty,
      consultationType: state.consultationType,
      location: state.consultationType === "Virtual" ? "Online" : state.location,
      doctorId: state.selectedDoctor?.id || "N/A",
      doctorName: state.selectedDoctor?.name || "N/A",
      fees: state.selectedDoctor?.fees ?? '',
      status: "Upcoming",
      notification: {
        doctorId: state.selectedDoctor?.id || "N/A",
        message: `New appointment with ${user?.firstName || "a patient"} on ${state.selectedDate} at ${state.selectedTime}. Symptoms: ${state.symptoms || "None"}. ${state.consultationType === "Virtual" ? "Virtual consultation" : `Location: ${state.location || "Not specified"}`}.`
      }
    };
    
    updateState({
      isLoading: true,
      showBookingModal: false,
      showConfirmationModal: true
    });
    
    try {
      // First, try to book the appointment
      const bookingResponse = await axios.post("https://67e3e1e42ae442db76d2035d.mockapi.io/register/book", payload);
      
      // If booking is successful, try to send notification (but don't fail if this fails)
      try {
        await axios.post("https://67e631656530dbd3110f0322.mockapi.io/drnotifiy", payload.notification);
      } catch (notificationError) {
        console.warn("Notification failed but booking was successful:", notificationError);
        // Don't throw error here - booking was successful
      }
      
      // If we reach here, booking was successful
      console.log("Booking successful:", bookingResponse.data);
      
      setTimeout(() => {
        // Clear form state from session storage after successful booking
        const formStateKeys = [
          'consultationType', 'symptoms', 'specialty', 'selectedState', 
          'location', 'pincode', 'doctorType', 'hospitalName', 'minPrice', 'maxPrice',
          'fullAddress', 'isCurrentLocation'
        ];
        formStateKeys.forEach(key => {
          sessionStorage.removeItem(`formState_${key}`);
        });
        
        updateState({
          showConfirmationModal: false,
          selectedState: "",
          location: "",
          pincode: "",
          symptoms: "",
          selectedDate: "",
          selectedTime: "",
          specialty: "",
          specialties: [],
          selectedDoctor: null,
          consultationType: "Physical",
          states: Object.keys(stateCityMap),
          cities: [],
          pincodeError: "",
          isCurrentLocation: false,
          isLoading: false
        });
        navigate("/patientdashboard/app");
      }, 2000);
      
    } catch (error) {
      console.error("Booking failed:", error);
      
      // Close the confirmation modal and show error
      updateState({ 
        showConfirmationModal: false,
        isLoading: false 
      });
      
      // Show more specific error message
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Booking failed. Please check your internet connection and try again.";
      
      alert(`Booking Failed: ${errorMessage}`);
      
      // Reopen the booking modal so user can try again
      updateState({ showBookingModal: true });
    }
  };

  // Updated function to get times for selected date
  const getTimesForDate = (date) => {
    if (!state.selectedDoctor?.availability || !date) return [];
    
    const availabilitySlot = state.selectedDoctor.availability.find(slot => slot.date === date);
    return availabilitySlot ? availabilitySlot.times : [];
  };

  // Function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Function to handle navigation to doctor list with preserved state
  const handleViewAllDoctors = () => {
    const currentFormState = {
      consultationType: state.consultationType,
      symptoms: state.symptoms,
      specialty: state.specialty,
      selectedState: state.selectedState,
      location: state.location,
      pincode: state.pincode,
      doctorType: state.doctorType,
      hospitalName: state.hospitalName,
      minPrice: state.minPrice,
      maxPrice: state.maxPrice,
      fullAddress: state.fullAddress,
      isCurrentLocation: state.isCurrentLocation,
      cities: state.cities,
      specialties: state.specialties,
      doctors: state.doctors,
      filteredDoctors: state.filteredDoctors || []
    };

    navigate('/patientdashboard/alldoctors', {
      state: {
        filteredDoctors: state.filteredDoctors || [],
        preservedFormState: currentFormState
      }
    });
  };

  // Safe array access with default empty array
  const safeFilteredDoctors = state.filteredDoctors || [];
  const safeSpecialties = state.specialties || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-4 px-3">
      <div className="max-w-3xl mx-auto">
        {/* Compact Header */}
        <div className="text-center mb-6">
          
         
        </div>

        {/* Main Form Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 space-y-6">
          <div className="space-y-4">
             <h3 className="text-xl md:text-3xl text-center font-bold text-slate-800 mb-2">
            Book Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Appointment</span>
          </h3>
            <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              Consultation Type
            </p>
            <div className="flex gap-4">
              {["Physical", "Virtual"].map(type => (
                <button
                  key={type}
                  onClick={() => updateState({ consultationType: type })}
                  className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                    state.consultationType === type
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {state.consultationType === "Physical" && (
            <div className="space-y-4">
              {/* Pincode Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-emerald-500 text-xs" />
                  Enter Pincode for Quick Location Detection
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={state.pincode}
                    onChange={handlePincodeChange}
                    placeholder="Enter 6-digit pincode"
                    maxLength={6}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm bg-white"
                    disabled={state.isCurrentLocation}
                  />
                  {state.pincodeLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
                    </div>
                  )}
                </div>
                {state.pincodeError && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {state.pincodeError}
                  </p>
                )}
                {state.pincode && state.selectedState && state.location && !state.pincodeError && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Location detected: {state.location}, {state.selectedState}
                  </p>
                )}
              </div>

              <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span>OR</span>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* State Dropdown */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-emerald-500 text-xs" />
                    State
                    {state.isCurrentLocation && (
                      <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        Detected
                      </span>
                    )}
                    {state.pincode && state.selectedState && !state.isCurrentLocation && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        From Pincode
                      </span>
                    )}
                  </label>
                  <select
                    value={state.selectedState}
                    onChange={handleManualStateChange}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm bg-white"
                    disabled={state.isCurrentLocation || state.pincodeLoading}
                  >
                    <option value="">Select State</option>
                    {Array.isArray(state.states) &&
                      state.states.map((stateName) => (
                        <option key={stateName} value={stateName}>
                          {stateName}
                        </option>
                      ))}
                  </select>
                </div>

                {/* City Dropdown */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-emerald-500 text-xs" />
                    City
                    {state.isCurrentLocation && (
                      <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        Current
                      </span>
                    )}
                    {state.pincode && state.location && !state.isCurrentLocation && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        From Pincode
                      </span>
                    )}
                  </label>
                  <select
                    value={state.location}
                    onChange={handleLocationChange}
                    disabled={(!state.selectedState && !state.isCurrentLocation) || state.pincodeLoading}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select City</option>
                    <option value="current-location">📍 Use My Location</option>
                    {Array.isArray(state.cities) &&
                      state.cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                  </select>

                  {/* Selected City Info */}
                  {state.location && state.location !== "current-location" && (
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <FaMapMarkerAlt className="text-xs" />
                      {state.location}, {state.selectedState}
                      {state.isCurrentLocation ? " (Current Location)" : state.pincode ? ` (Pincode: ${state.pincode})` : ""}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {state.consultationType === "Virtual" && (
            <div className="bg-gradient-to-r from-green-50 to-indigo-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-green-800">Virtual Consultation Selected</h4>
                  <p className="text-sm text-green-600">You'll receive a video call link after booking confirmation</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4 w-full">
            {state.consultationType === "Physical" && (
              <div className="space-y-2 w-full md:w-1/2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <FaHospital className="text-emerald-500 text-xs" />
                  Hospital (Optional)
                </label>
                <input
                  type="text"
                  value={state.hospitalName}
                  onChange={e => updateState({ hospitalName: e.target.value })}
                  placeholder="Enter hospital name"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm bg-white"
                />
              </div>
            )}
            <div className={`space-y-2 w-full ${state.consultationType === "Physical" ? "md:w-1/2" : ""}`}>
              <label className="text-sm font-medium text-slate-700">Symptoms</label>
              <input
                type="text"
                value={state.symptoms}
                onChange={handleSymptomsChange}
                placeholder="Describe your symptoms"
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm bg-white"
              />
            </div>
          </div>

          {safeSpecialties.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-700">Suggested Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {safeSpecialties.map(spec => (
                  <button
                    key={spec}
                    onClick={() => updateState({ specialty: spec })}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 transform hover:scale-105 ${
                      state.specialty === spec
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-700">Doctor Panel</h3>
            <div className="flex flex-wrap gap-2">
              {["All", "Our Medical Expert", "Hospital Affiliated", "Consultant Doctor"].map(type => (
                <button
                  key={type}
                  onClick={() => updateState({ doctorType: type })}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 transform hover:scale-105 ${
                    state.doctorType === type
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 w-full">
              <label className="text-sm font-medium text-slate-700">Min Fees (₹)</label>
              <input
                type="number"
                value={state.minPrice}
                onChange={e => updateState({ minPrice: e.target.value })}
                placeholder="Minimum price"
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm bg-white"
              />
            </div>
            <div className="space-y-2 w-full">
              <label className="text-sm font-medium text-slate-700">Max Fees (₹)</label>
              <input
                type="number"
                value={state.maxPrice}
                onChange={e => updateState({ maxPrice: e.target.value })}
                placeholder="Maximum price"
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm bg-white"
              />
            </div>
          </div>

          <div className="space-y-4">
            {safeFilteredDoctors.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-800">Available Doctors ({safeFilteredDoctors.length})</h3>
                  <button
                    onClick={handleViewAllDoctors}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200"
                  >
                    View All →
                  </button>
                </div>
                <div className="relative">
                  <div ref={scrollRef} className="flex gap-4 overflow-x-hidden pb-4 scroll-smooth">
                    {safeFilteredDoctors.map(doc => (
                      <div
                        key={doc.id}
                        onClick={() => updateState({ selectedDoctor: doc, showBookingModal: true })}
                        className="min-w-[280px] p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105"
                      >
                        <div className="flex gap-3 items-start">
                          <div className="relative">
                            <img
                              src={doc.image || "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg"}
                              alt={doc.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-emerald-200"
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-800 text-sm truncate">{doc.name}</h4>
                            <p className="text-emerald-600 text-xs font-medium">{doc.specialty}</p>
                            <p className="text-slate-800 font-bold text-lg">₹{doc.fees}</p>
                            <p className="text-slate-500 text-xs flex items-center gap-1">
                              <FaMapMarkerAlt className="text-xs" />
                              {state.consultationType === "Virtual" ? "Online" : doc.location || "N/A"}
                            </p>
                            <p className="text-slate-500 text-xs">{doc.doctorType}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {totalGroups > 1 && (
                    <>
                      <button
                        onClick={() => scroll(-1)}
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-slate-200 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center hover:bg-emerald-50"
                      >
                        <FaChevronLeft className="text-slate-600 text-sm" />
                      </button>
                      <button
                        onClick={() => scroll(1)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-slate-200 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center hover:bg-emerald-50"
                      >
                        <FaChevronRight className="text-slate-600 text-sm" />
                      </button>
                      <div className="flex justify-center gap-2 mt-4">
                        {Array.from({ length: totalGroups }).map((_, index) => (
                          <button
                            key={index}
                            onClick={() => scrollToGroup(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                              currentGroup === index ? "bg-emerald-500 scale-125" : "bg-slate-300"
                            }`}
                          ></button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                  <FaUser className="text-slate-400 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No doctors found</h3>
                <p className="text-slate-600 text-sm">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Updated Booking Modal with Date Input */}
      {state.showBookingModal && state.selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl relative animate-slide-up">
            <button
              onClick={() => updateState({ showBookingModal: false })}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center mb-6">
              <img
                src={state.selectedDoctor.image || "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg"}
                alt={state.selectedDoctor.name}
                className="w-16 h-16 rounded-2xl object-cover mx-auto mb-3 border-2 border-emerald-200"
              />
              <h2 className="text-xl font-bold text-slate-800">{state.selectedDoctor.name}</h2>
              <p className="text-emerald-600 font-medium">{state.selectedDoctor.specialty}</p>
              <p className="text-slate-600 text-sm">{state.selectedDoctor.qualification}</p>
              <div className="flex items-center justify-center gap-4 mt-2 text-sm">
                <span className="text-slate-600">{state.selectedDoctor.experience} years exp</span>
                <span className="text-slate-400">•</span>
                <span className="text-2xl font-bold text-emerald-600">₹{state.selectedDoctor.fees}</span>
              </div>
              <div className="mt-3">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                  state.consultationType === "Virtual"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}>
                  {state.consultationType === "Virtual" ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <FaMapMarkerAlt className="w-3 h-3" />
                  )}
                  {state.consultationType} Consultation
                </span>
              </div>
            </div>
            <div className="space-y-4">
              {/* Date Input Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <FaCalendarAlt className="text-emerald-500 text-xs" />
                  Select Date
                </label>
                <input
                  type="date"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm"
                  value={state.selectedDate}
                  min={getTodayDate()}
                  onChange={(e) => updateState({ selectedDate: e.target.value, selectedTime: '' })}
                />
              </div>

              {/* Time Slots Section */}
              {state.selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <FaClock className="text-emerald-500 text-xs" />
                    Available Time Slots
                    {getTimesForDate(state.selectedDate).length > 0 && (
                      <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        {getTimesForDate(state.selectedDate).length} slots available
                      </span>
                    )}
                  </label>
                  
                  {getTimesForDate(state.selectedDate).length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {getTimesForDate(state.selectedDate).map(time => {
                        const isBooked = state.selectedDoctor.bookedSlots?.some(slot => 
                          slot.date === state.selectedDate && slot.time === time
                        );
                        const isSelected = state.selectedTime === time;
                        return (
                          <button
                            key={time}
                            disabled={isBooked}
                            onClick={() => updateState({ selectedTime: time })}
                            className={`py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 relative ${
                              isBooked
                                ? "bg-red-100 text-red-400 cursor-not-allowed border border-red-200"
                                : isSelected
                                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md transform scale-105"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                            }`}
                          >
                            {time}
                            {isBooked && (
                              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-200">
                      <FaClock className="text-slate-400 text-2xl mx-auto mb-2" />
                      <p className="text-slate-600 text-sm">No slots available for this date</p>
                      <p className="text-slate-500 text-xs mt-1">Please select a different date</p>
                    </div>
                  )}
                </div>
              )}

              {/* Booking Button */}
              <button
                onClick={handlePayment}
                disabled={!state.selectedDate || !state.selectedTime || state.isLoading || getTimesForDate(state.selectedDate).length === 0}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  !state.selectedDate || !state.selectedTime || state.isLoading || getTimesForDate(state.selectedDate).length === 0
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg transform hover:scale-105"
                }`}
              >
                {state.isLoading 
                  ? "Processing..." 
                  : !state.selectedDate 
                  ? 'Select Date First' 
                  : getTimesForDate(state.selectedDate).length === 0
                  ? 'No Slots Available'
                  : !state.selectedTime 
                  ? 'Select Time Slot' 
                  : 'Confirm Booking'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Updated Confirmation Modal with Auto-Close */}
      {state.showConfirmationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl animate-slide-up">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Booking Confirmed!</h3>
            <p className="text-slate-600 text-sm mb-4">Your appointment has been successfully scheduled.</p>
            
            {/* Auto-close indicator */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-emerald-500"></div>
              <span>Redirecting to patientdashboard...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiStepForm;