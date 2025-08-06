import React, { useState } from "react"; 
import axios from "axios"; 
import { IoClose } from "react-icons/io5"; 
import { BiErrorCircle } from "react-icons/bi"; 

const Insurance = () => { 
  const [insuranceInfo, setInsuranceInfo] = useState(null); 
  const [mobileNumber, setMobileNumber] = useState(""); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(""); 
  const [message, setMessage] = useState(""); 
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false); 
  const [formData, setFormData] = useState({ 
    fullName: "", 
    Phonenumber: "", 
    InsuranceType: "", 
    insuranceProvider: "", 
    years: "", 
    sumAssured: "", 
  }); 

  const insuranceProviders = [ 
    "Aditya Birla Health Insurance", 
    "HDFC ERGO Health Insurance", 
    "Star Health Insurance", 
  ]; 
  const policyTypes = [ 
    "Individual Health Insurance", 
    "Family Health Insurance", 
    "Critical Illness Insurance", 
    "Senior Citizen Health Insurance", 
  ]; 

  const fetchInsuranceData = async (mobile) => { 
    if (!mobile) return; 
    setLoading(true); 
    setError(""); 
    try { 
      const response = await axios.get("https://mocki.io/v1/ffcd66b8-6e2d-40cd-9e08-c130e2137be5"); 
      const apiData = response.data; 
      if (apiData && apiData[mobile]) { 
        setInsuranceInfo(apiData[mobile]); 
        setMessage(""); 
      } else { 
        setInsuranceInfo(null); 
        setMessage("No insurance found for this number. You can enroll for a new policy."); 
      } 
    } catch (err) { 
      console.error("Error fetching insurance data:", err); 
      setError("Unable to fetch insurance data. Please try again later."); 
      setInsuranceInfo(null); 
    } finally { 
      setLoading(false); 
    } 
  }; 

  const handleSearch = (e) => { 
    e.preventDefault(); 
    if (mobileNumber) { 
      fetchInsuranceData(mobileNumber); 
      setShowEnrollmentForm(false); 
    } 
  }; 

  const handleEnrollNew = () => { 
    setShowEnrollmentForm(true); 
    setInsuranceInfo(null); 
  }; 

  // UPDATED: Show alert instead of enrolling
  const handleEnrollmentSubmit = (e) => { 
    e.preventDefault(); 
    alert("Connecting..."); 
  }; 

  const renderInsuranceDetails = () => { 
    if (!insuranceInfo || !insuranceInfo.policies || insuranceInfo.policies.length === 0) return null; 
    return ( 
      <div className="backdrop-blur-md bg-white/30 rounded-xl shadow-lg p-6 mb-6 border border-white/40"> 
        <h2 className="text-xl font-medium mb-4">Insurance Details</h2> 
        <div className="overflow-x-auto"> 
          <table className="min-w-full bg-white border border-gray-200"> 
            <thead className="bg-gray-50"> 
              <tr> 
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insurance Name</th> 
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policy Name</th> 
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validity Period</th> 
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th> 
              </tr> 
            </thead> 
            <tbody className="divide-y divide-gray-200"> 
              {insuranceInfo.policies.map((policy) => ( 
                <tr key={policy.id}> 
                  <td className="px-6 py-4 whitespace-nowrap">{policy.insuranceName}</td> 
                  <td className="px-6 py-4 whitespace-nowrap">{policy.policyName}</td> 
                  <td className="px-6 py-4 whitespace-nowrap">{policy.validityPeriod}</td> 
                  <td className="px-6 py-4 whitespace-nowrap">{policy.amount}</td> 
                </tr> 
              ))} 
            </tbody> 
          </table> 
        </div> 
      </div> 
    ); 
  }; 

  const renderClaimsHistory = () => { 
    if (!insuranceInfo?.claims?.length) return null; 
    return ( 
      <div className="backdrop-blur-md bg-white/30 rounded-xl shadow-lg p-6 border border-white/40"> 
        <h2 className="text-xl font-medium mb-4">Claims History</h2> 
        <div className="overflow-x-auto"> 
          <table className="min-w-full bg-white border border-gray-200"> 
            <thead className="bg-gray-50"> 
              <tr> 
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim ID</th> 
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Treatment</th> 
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th> 
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th> 
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th> 
              </tr> 
            </thead> 
            <tbody> 
              {insuranceInfo.claims.map((claim) => ( 
                <tr key={claim.claimId} className="hover:bg-gray-50"> 
                  <td className="px-6 py-4 whitespace-nowrap">{claim.claimId}</td> 
                  <td className="px-6 py-4 whitespace-nowrap">{claim.treatmentType}</td> 
                  <td className="px-6 py-4 whitespace-nowrap">{claim.hospitalName}</td> 
                  <td className="px-6 py-4 whitespace-nowrap">{claim.claimAmount}</td> 
                  <td className="px-6 py-4 whitespace-nowrap"> 
                    <span className={`px-2 py-1 rounded-full text-sm ${claim.status === "Approved" ? "bg-green-100 text-green-800" : claim.status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>{claim.status}</span> 
                  </td> 
                </tr> 
              ))} 
            </tbody> 
          </table> 
        </div> 
      </div> 
    ); 
  }; 

  return ( 
    <div className="space-y-6 animate-fadeIn"> 
      <div className="bg-white rounded-lg shadow-md p-6"> 
        <h2 className="text-xl font-medium mb-4">Find Your Insurance</h2> 
        <div className="flex flex-col sm:flex-row gap-3"> 
          <div className="flex-grow"> 
            <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label> 
            <input id="mobileNumber" type="text" placeholder="+91 9901341764" className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} /> 
          </div> 
          <div className="flex items-end gap-2"> 
            <button onClick={handleSearch} className="bg-[#0E1630]  text-white px-4 py-2 rounded-md hover:bg-slate-700 transition-colors">Fetch Insurance</button> 
            <button onClick={handleEnrollNew} className="bg-[#F4C430]  text-white px-4 py-2 rounded-md hover:bg-slate-600 transition-colors">New Enrollment</button> 
          </div> 
        </div> 
      </div> 

      {loading && ( 
        <div className="flex justify-center my-8"> 
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-600"></div> 
        </div> 
      )} 

      {error && ( 
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md flex items-start"> 
          <BiErrorCircle className="text-red-500 mr-2 flex-shrink-0 text-xl" /> 
          <div> 
            <p className="text-red-700">{error}</p> 
          </div> 
        </div> 
      )} 

      {message && ( 
        <div className="p-4 bg-blue-50 text-blue-700 rounded-md animate-fadeIn"> 
          {message} 
        </div> 
      )} 

      {insuranceInfo && !showEnrollmentForm && ( 
        <div className="space-y-6"> 
          {renderInsuranceDetails()} 
          {renderClaimsHistory()} 
        </div> 
      )} 

      {showEnrollmentForm && ( 
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50"> 
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative"> 
            <button onClick={() => setShowEnrollmentForm(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"> 
              <IoClose className="w-5 h-5" /> 
            </button> 

            <h2 className="text-xl font-semibold mb-4">Enroll for New Insurance</h2> 

            <form onSubmit={handleEnrollmentSubmit}> 
              <div className="grid grid-cols-2 gap-4 mb-4"> 
                <div> 
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label> 
                  <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full p-2 border rounded-md" required /> 
                </div> 
                <div> 
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label> 
                  <input type="text" value={formData.Phonenumber} onChange={(e) => setFormData({ ...formData, Phonenumber: e.target.value })} className="w-full p-2 border rounded-md" required /> 
                </div> 
              </div> 

              <div className="grid grid-cols-2 gap-4 mb-4"> 
                <div> 
                  <label className="block text-sm font-medium text-gray-700 mb-1">Policy Type</label> 
                  <select value={formData.policyType} onChange={(e) => setFormData({ ...formData, policyType: e.target.value })} className="w-full p-2 border rounded-md" required> 
                    <option value="">Select Policy</option> 
                    {policyTypes.map((type, index) => ( 
                      <option key={index} value={type}>{type}</option> 
                    ))} 
                  </select> 
                </div> 
                <div> 
                  <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider</label> 
                  <select value={formData.insuranceProvider} onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })} className="w-full p-2 border rounded-md" required> 
                    <option value="">Select Provider</option> 
                    {insuranceProviders.map((provider, index) => ( 
                      <option key={index} value={provider}>{provider}</option> 
                    ))} 
                  </select> 
                </div> 
              </div> 

              <div className="grid grid-cols-2 gap-4 mb-6"> 
                <div> 
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Years)</label> 
                  <input type="number" value={formData.years} onChange={(e) => setFormData({ ...formData, years: e.target.value })} className="w-full p-2 border rounded-md" min="1" max="30" required /> 
                </div> 
                <div> 
                  <label className="block text -sm font-medium text-gray-700 mb-1">Sum Assured</label> 
                  <input type="text" value={formData.sumAssured} onChange={(e) => setFormData({ ...formData, sumAssured: e.target.value })} className="w-full p-2 border rounded-md" required /> 
                </div> 
              </div> 

              <button type="submit" className="w-full bg-slate-600 text-white py-2 rounded-md hover:bg-slate-700 transition-colors">Contact Us</button> 
            </form> 
          </div> 
        </div> 
      )} 
    </div> 
  ); 
}; 

export default Insurance;
