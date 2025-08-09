import React, { useState } from "react";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import { BiErrorCircle } from "react-icons/bi";
import { FaShieldAlt, FaFileMedical, FaMoneyBillWave, FaCalendarAlt, FaUserShield, FaBuilding, FaIdCard, FaHospital, FaUserFriends, FaRupeeSign, FaExclamationCircle, FaChartLine, FaChevronDown, FaChevronUp } from "react-icons/fa";

const Insurance = () => {
  const [state, setState] = useState({
    insuranceInfo: null, 
    mobileNumber: "", 
    loading: false, 
    error: "", 
    message: "",
    showEnrollmentForm: false, 
    showInsuranceModal: false, 
    showAllDetails: false,
    formData: { diagnosis: "", sumAssured: "", policyType: "", duration: "" }
  });

  const policyTypes = [
    "Individual Health Insurance", 
    "Family Health Insurance", 
    "Critical Illness Insurance", 
    "Senior Citizen Health Insurance"
  ];

  const insuranceProviders = [
    "HDFC ERGO Health Insurance",
    "ICICI Lombard Health Insurance", 
    "Star Health Insurance",
    "Bajaj Allianz Health Insurance",
    "Max Bupa Health Insurance",
    "Care Health Insurance",
    "Niva Bupa Health Insurance",
    "Aditya Birla Health Insurance"
  ];

  const diagnoses = [
    "Diabetes", "Hypertension", "Heart Disease", "Asthma", 
    "Arthritis", "Thyroid", "Kidney Disease", "Cancer",
    "Stroke", "COPD", "Liver Disease", "None"
  ];

  const coverageTypes = [
    "Individual", "Family Floater", "Senior Citizen", 
    "Critical Illness", "Maternity", "Pre & Post Hospitalization"
  ];

  const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));
  const updateFormData = (updates) => setState(prev => ({ ...prev, formData: { ...prev.formData, ...updates } }));

  // Generate insurance data based on mobile number for demo purposes
  const generateInsuranceData = (mobile) => {
    const seed = mobile.split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    
    const policyTypeIndex = seed % policyTypes.length;
    const providerIndex = seed % insuranceProviders.length;
    const diagnosisIndex = seed % diagnoses.length;
    const coverageIndex = seed % coverageTypes.length;
    
    const baseAmount = 100000 + (seed * 50000);
    const sumAssured = Math.min(baseAmount, 2000000);
    const premium = Math.floor(sumAssured * 0.03 + (seed * 100));
    const claimLimit = Math.floor(sumAssured * 0.8);
    
    const currentYear = new Date().getFullYear();
    const enrolledYear = currentYear - (seed % 5 + 1);
    const duration = seed % 10 + 1;
    
    return {
      policyNumber: `POL${mobile.slice(-6)}${seed}`,
      policyType: policyTypes[policyTypeIndex],
      insurerName: insuranceProviders[providerIndex],
      sumAssured: sumAssured.toLocaleString(),
      premiumAmount: premium.toLocaleString(),
      coverageType: coverageTypes[coverageIndex],
      diagnosis: diagnoses[diagnosisIndex],
      duration: duration,
      enrolledDate: `${enrolledYear}-${String((seed % 12) + 1).padStart(2, '0')}-${String((seed % 28) + 1).padStart(2, '0')}`,
      nominee: `Nominee ${mobile.slice(-2)}`,
      preExistingCover: seed % 2 === 0 ? "Covered after 2 years" : "Covered after 4 years",
      claimLimit: claimLimit.toLocaleString(),
      status: "Active",
      renewalDate: `${currentYear + 1}-${String((seed % 12) + 1).padStart(2, '0')}-${String((seed % 28) + 1).padStart(2, '0')}`
    };
  };

  const fetchInsuranceData = async (mobile) => {
    if (!mobile || mobile.length !== 10) {
      updateState({ error: "Please enter a valid 10-digit mobile number" });
      return;
    }

    updateState({ loading: true, error: "", message: "" });
    
    try {
      // First try to fetch from real API
      const response = await axios.get(`https://jsonplaceholder.typicode.com/users/${mobile.slice(-1) || 1}`);
      
      if (response.data) {
        // Transform the API response to insurance data format
        const apiUser = response.data;
        const insuranceData = {
          policyNumber: `POL${mobile.slice(-6)}${apiUser.id}`,
          policyType: policyTypes[apiUser.id % policyTypes.length],
          insurerName: insuranceProviders[apiUser.id % insuranceProviders.length],
          sumAssured: (500000 + (apiUser.id * 100000)).toLocaleString(),
          premiumAmount: (15000 + (apiUser.id * 2000)).toLocaleString(),
          coverageType: coverageTypes[apiUser.id % coverageTypes.length],
          diagnosis: diagnoses[apiUser.id % diagnoses.length],
          duration: (apiUser.id % 10) + 1,
          enrolledDate: "2022-01-15",
          nominee: apiUser.name.split(' ')[0],
          preExistingCover: apiUser.id % 2 === 0 ? "Covered after 2 years" : "Covered after 4 years",
          claimLimit: (400000 + (apiUser.id * 80000)).toLocaleString(),
          status: "Active",
          renewalDate: "2025-01-15",
          holderName: apiUser.name,
          email: apiUser.email,
          phone: apiUser.phone,
          address: `${apiUser.address.street}, ${apiUser.address.city}`,
          company: apiUser.company.name
        };
        
        updateState({ 
          insuranceInfo: insuranceData, 
          message: "", 
          showInsuranceModal: true, 
          showAllDetails: false 
        });
      }
      
    } catch (err) {
      console.log("API failed, using fallback data generation");
      // Fallback to generated data if API fails
      const insuranceData = generateInsuranceData(mobile);
      
      updateState({ 
        insuranceInfo: insuranceData, 
        message: "", 
        showInsuranceModal: true, 
        showAllDetails: false 
      });
      
    } finally {
      updateState({ loading: false });
    }
  };

  const InsuranceDetailCard = ({ icon: Icon, title, value, className = "" }) => (
    <div className={`flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-all duration-300 ${className}`}>
      <div className="p-2 rounded-lg bg-[var(--primary-color)]/5">
        <Icon className="text-[var(--primary-color)] text-lg" />
      </div>
      <div>
        <h4 className="paragraph text-sm font-medium text-gray-600">{title}</h4>
        <p className="paragraph text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="pt-6 mt-6 bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="h3-heading mb-4">Insurance Management</h2>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <form 
          onSubmit={(e) => { 
            e.preventDefault(); 
            if (state.mobileNumber) { 
              fetchInsuranceData(state.mobileNumber); 
              updateState({ showEnrollmentForm: false }); 
            } 
          }} 
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-grow">
            <div className="floating-input relative w-full" data-placeholder="Enter Mobile Number">
              <input
                type="tel"
                placeholder=" "
                className="input-field peer"
                value={state.mobileNumber}
                onChange={e => updateState({ mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                maxLength="10"
              />
            </div>
          </div>
          <div className="flex gap-2 self-end">
            <button 
              type="submit" 
              className="btn btn-primary get-details-animate"
              disabled={state.loading || state.mobileNumber.length !== 10}
            >
              {state.loading ? (
                <>
                  <div className="loader-spinner"></div>
                  Fetching...
                </>
              ) : (
                "Fetch Insurance"
              )}
            </button>
            <button 
              type="button" 
              onClick={() => updateState({ showEnrollmentForm: true, insuranceInfo: null })} 
              className="btn btn-secondary"
            >
              New Enrollment
            </button>
          </div>
        </form>
      </div>

  {/* Loading spinner removed as per request */}

      {state.error && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
          <BiErrorCircle className="text-red-500 mr-3 text-xl flex-shrink-0 mt-0.5" />
          <p className="paragraph text-red-700">{state.error}</p>
        </div>
      )}

      {state.message && (
        <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
          <p className="paragraph text-blue-700">{state.message}</p>
        </div>
      )}

      {/* Insurance Details Modal */}
      {state.showInsuranceModal && state.insuranceInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-fadeIn">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative modal-slideUp">
            <button 
              onClick={() => updateState({ showInsuranceModal: false })} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors animated-cancel-btn"
            >
              <IoClose size={24} />
            </button>
            
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="h4-heading">{state.insuranceInfo.policyType}</h3>
                  <p className="paragraph">{state.insuranceInfo.insurerName}</p>
                  {state.insuranceInfo.holderName && (
                    <p className="paragraph text-sm">Holder: {state.insuranceInfo.holderName}</p>
                  )}
                  <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium status-badge status-completed">
                    {state.insuranceInfo.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="paragraph text-sm">Policy Number</p>
                  <p className="paragraph font-bold">{state.insuranceInfo.policyNumber}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: "Sum Assured", value: `₹${state.insuranceInfo.sumAssured}`, icon: FaShieldAlt },
                { label: "Annual Premium", value: `₹${state.insuranceInfo.premiumAmount}`, icon: FaMoneyBillWave },
                { label: "Coverage Type", value: state.insuranceInfo.coverageType, icon: FaUserFriends }
              ].map((item, i) => (
                <div key={i} className="card-stat card-border-primary">
                  <div className="card-content">
                    <div className="card-info">
                      <p className="card-stat-label">{item.label}</p>
                      <p className="card-stat-count text-lg">{item.value}</p>
                    </div>
                    <div className="card-icon card-icon-primary">
                      <item.icon className="card-icon-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <button 
                onClick={() => updateState({ showAllDetails: !state.showAllDetails })} 
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span className="paragraph font-medium">View All Details</span>
                {state.showAllDetails ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
              </button>
              
              {state.showAllDetails && (
                <div className="mt-4 detail-grid">
                  {[
                    { icon: FaFileMedical, title: "Diagnosis", value: state.insuranceInfo.diagnosis },
                    { icon: FaCalendarAlt, title: "Policy Duration", value: `${state.insuranceInfo.duration} Years` },
                    { icon: FaUserShield, title: "Enrolled Date", value: state.insuranceInfo.enrolledDate },
                    { icon: FaUserFriends, title: "Nominee", value: state.insuranceInfo.nominee },
                    { icon: FaExclamationCircle, title: "Pre-existing Cover", value: state.insuranceInfo.preExistingCover },
                    { icon: FaChartLine, title: "Claim Limit", value: `₹${state.insuranceInfo.claimLimit}` },
                    ...(state.insuranceInfo.email ? [
                      { icon: FaIdCard, title: "Email", value: state.insuranceInfo.email },
                      { icon: FaBuilding, title: "Address", value: state.insuranceInfo.address }
                    ] : [])
                  ].map((item, i) => (
                    <InsuranceDetailCard key={i} {...item} />
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => updateState({ showInsuranceModal: false })} 
                className="btn btn-secondary animated-cancel-btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enrollment Form Modal */}
      {state.showEnrollmentForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-fadeIn">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md relative modal-slideUp">
            <button 
              onClick={() => updateState({ showEnrollmentForm: false })} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors animated-cancel-btn"
            >
              <IoClose size={20} />
            </button>
            
            <div className="mb-6">
              <h3 className="h4-heading">New Insurance Enrollment</h3>
              <p className="paragraph">Fill in your details to get started</p>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Enrollment submitted successfully! We'll contact you shortly.");
                updateState({
                  showEnrollmentForm: false,
                  formData: { diagnosis: "", sumAssured: "", policyType: "", duration: "" }
                });
              }}
              className="space-y-4"
            >
              <div className="floating-input relative w-full" data-placeholder="Select Policy Type">
                <select
                  value={state.formData.policyType}
                  onChange={e => updateFormData({ policyType: e.target.value })}
                  className="input-field peer"
                  required
                  placeholder=" "
                >
                  <option value="">Select Policy</option>
                  {policyTypes.map((type, i) => (
                    <option key={i} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {[
                { label: "Medical Diagnosis", field: "diagnosis", type: "text", placeholder: "Enter your medical condition" },
                { label: "Required Sum Assured", field: "sumAssured", type: "text", placeholder: "e.g., 5,00,000" },
                { label: "Policy Duration (Years)", field: "duration", type: "number", placeholder: "1-30 years", props: { min: "1", max: "30" } }
              ].map((item, i) => (
                <div className="floating-input relative w-full" data-placeholder={item.label} key={i}>
                  <input
                    type={item.type}
                    placeholder=" "
                    value={state.formData[item.field]}
                    onChange={e => updateFormData({ [item.field]: e.target.value })}
                    className="input-field peer"
                    required
                    {...item.props}
                  />
                </div>
              ))}
              
              <button 
                type="submit" 
                className="btn btn-primary w-full animate-pulse-save"
              >
                Submit Enrollment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Insurance;