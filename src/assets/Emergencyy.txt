
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { Ambulance, Activity, Heart, HeartPulse, Cylinder, Bed, Settings as Lungs, Armchair as Wheelchair, ActivitySquare, Zap, ChevronLeft, ChevronRight, Phone, CheckCircle2 } from 'lucide-react';

const Emergency = () => {
  const [currentStep, setCurrentStep] = useState(0), [selectedType, setSelectedType] = useState(''), [selectedCategory, setSelectedCategory] = useState(''), [selectedEquipment, setSelectedEquipment] = useState([]), [selectedDate, setSelectedDate] = useState(new Date()), [selectedTimeSlot, setSelectedTimeSlot] = useState(''), [pickupLocation, setPickupLocation] = useState(''), [dropLocation, setDropLocation] = useState(''), [phoneNumber, setPhoneNumber] = useState(''), [alternatePhone, setAlternatePhone] = useState(''), [currentMonth, setCurrentMonth] = useState(new Date()), [emergencyData, setEmergencyData] = useState(null), [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://mocki.io/v1/20345d29-5a36-4fcd-9c2e-018fca665549');
        setEmergencyData(response.data);
      } catch {
        setEmergencyData({
          ambulanceTypes: [{ id: 'government', name: 'Government', description: 'Public ambulance services' }, { id: 'private', name: 'Private', description: 'Private ambulance providers' }],
          categories: [{ id: 'icu', name: 'ICU', description: 'Intensive Care Unit', icon: 'Activity' }, { id: 'non-icu', name: 'Non-ICU', description: 'Basic Patient transport', icon: 'Ambulance' }, { id: 'bls', name: 'BLS', description: 'Basic Life Support', icon: 'Heart' }, { id: 'als', name: 'ALS', description: 'Advanced Life Support', icon: 'HeartPulse' }],
          equipment: [{ id: 'oxygen', name: 'Oxygen Cylinder', icon: 'Cylinder' }, { id: 'stretcher', name: 'Stretcher', icon: 'Bed' }, { id: 'ventilator', name: 'Ventilator', icon: 'Lungs' }, { id: 'wheelchair', name: 'Wheelchair', icon: 'Wheelchair' }, { id: 'ecg', name: 'ECG Monitor', icon: 'ActivitySquare' }, { id: 'defibrillator', name: 'Defibrillator', icon: 'Zap' }],
          locations: [{ id: 'home', name: 'Private Residence' }, { id: 'hospital1', name: 'City General Hospital' }, { id: 'hospital2', name: 'Railway Hospital' }, { id: 'hospital3', name: 'Central Medical Center' }, { id: 'clinic1', name: 'Community Health Clinic' }, { id: 'other', name: 'Other Location' }],
          timeSlots: Array.from({ length: 24 }, (_, i) => ({ id: `ts${i + 1}`, time: `${String(Math.floor(i / 2) + 9).padStart(2, '0')}:${i % 2 ? '30' : '00'}-${String(Math.floor((i + 1) / 2) + 9).padStart(2, '0')}:${(i + 1) % 2 ? '30' : '00'}`, available: Math.random() > 0.3 }))
        });
      }
    };
    fetchData();
  }, []);

  const getIcon = (iconName, size = 20) => {
    const icons = { Activity: <Activity size={size} />, Ambulance: <Ambulance size={size} />, Heart: <Heart size={size} />, HeartPulse: <HeartPulse size={size} />, Cylinder: <Cylinder size={size} />, Bed: <Bed size={size} />, Lungs: <Lungs size={size} />, Wheelchair: <Wheelchair size={size} />, ActivitySquare: <ActivitySquare size={size} />, Zap: <Zap size={size} /> };
    return icons[iconName] || <Activity size={size} />;
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth), monthEnd = endOfMonth (currentMonth), days = eachDayOfInterval({ start: monthStart, end: monthEnd }), daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-lg p-4 z-50">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setCurrentMonth(prev => addDays(prev, -30))} className="p-1 hover:bg-gray-100 rounded">
            <ChevronLeft size={20} />
          </button>
          <span className="font-medium">{format(currentMonth, 'MMMM yyyy')}</span>
          <button onClick={() => setCurrentMonth(prev => addDays(prev, 30))} className="p-1 hover:bg-gray-100 rounded">
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-1">{day}</div>
          ))}
          {days.map(day => (
            <button key={day.toString()} onClick={() => { setSelectedDate(day); setShowCalendar(false); }} className={`p-2 text-sm rounded hover:bg-blue-50 ${isSameDay(day, selectedDate) ? 'bg-yellow-500 text-white' : ''}`}>
              {format(day, 'd')}
            </button>
          ))}
        </div>
        <button onClick={() => { setSelectedDate(new Date()); setShowCalendar(false); }} className="mt-2 w-full py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">Clear</button>
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Select Ambulance Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emergencyData?.ambulanceTypes.map(type => (
                  <div key={type.id} className={`border rounded-lg p-4 cursor-pointer shadow-lg transition-all duration-200 hover:shadow-md flex items-center gap-3 ${selectedType === type.id ? 'border-yellow-500 bg-blue-50' : 'border-gray-200'}`} onClick={() => setSelectedType(type.id)}>
                    <div className="p-2 rounded-full bg-blue-100 text-[#0E1630]"><Ambulance size={20} /></div>
                    <div>
                      <h4 className="font-medium">{type.name}</h4>
                      <p className="text-sm text-gray-500">{type.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Select Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emergencyData?.categories.map(category => (
                  <div key={category.id} className={`border rounded-lg p-4 cursor-pointer shadow-lg transition-all duration-200 hover:shadow-md flex items-center gap-3 ${selectedCategory === category.id ? 'border-yellow-500 bg-blue-50' : 'border-gray-200'}`} onClick={() => setSelectedCategory(category.id)}>
                    <div className="p-2 rounded-full bg-blue-100 text-[#0E1630]">{getIcon(category.icon)}</div>
                    <div>
                      <h4 className="font-medium">{category.name}</h4>
                      <p className="text-sm text-gray-500">{category.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Select Equipment Requirements</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {emergencyData?.equipment.map(item => (
                  <div key={item.id} className={`border rounded-lg p-3 cursor-pointer shadow-lg transition-all duration-200 hover:shadow-md flex items-center gap-2 ${selectedEquipment.includes(item.id) ? 'border-yellow-500 bg-blue-50' : 'border-gray-200'}`} onClick={() => setSelectedEquipment(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id])}>
                    <div className="p-1.5 rounded-full bg-blue-100 text-[#0E1630]">{getIcon(item.icon)}</div>
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                <select value={pickupLocation} onChange={e => setPickupLocation(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-yellow-500 focus:ring-yellow-500">
                  <option value="">Select pickup location</option>
                  {emergencyData?.locations.map(location => (
                    <option key={location.id} value={location.id}>{location.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Drop Location</label>
                <select value={dropLocation} onChange={e => setDropLocation(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-yellow-500 focus:ring-yellow-500">
                  <option value="">Select drop location</option>
                  {emergencyData?.locations.map(location => (
                    <option key={location.id} value={location.id}>{location.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Select Date & Time</h3>
              <div className="relative">
                <div className="border rounded-md p-2 cursor-pointer flex items-center justify-between" onClick={() => setShowCalendar(!showCalendar)}>
                  <span>{format(selectedDate, 'dd/MM/yyyy')}</span>
                  <ChevronRight size={20} />
                </div>
                {showCalendar && renderCalendar()}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Available Time Slots</h4>
              <div className="grid grid-cols-3 gap-2">
                {emergencyData?.timeSlots.map(slot => (
                  <button key={slot.id} disabled={!slot.available} onClick={() => setSelectedTimeSlot(slot.id)} className={`p-2 text-sm rounded-md text-center transition-colors ${!slot.available ? 'bg-red-50 text-red-500 cursor-not-allowed' : selectedTimeSlot === slot.id ? 'bg-[#0E1630] text-white' : 'bg-gray-50 text-green-700 hover:bg-gray-100'}`}>
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone size={16} className="text-gray-400" /></div>
                  <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="pl-10 w-full border-gray-300 rounded-md shadow-sm focus:border-yellow-500 focus:ring-yellow-500" placeholder="Enter your phone number" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Phone Number (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone size={16} className="text-gray-400" /></div>
                  <input type="tel" value={alternatePhone} onChange={e => setAlternatePhone(e.target.value)} className="pl-10 w-full border-gray-300 rounded-md shadow-sm focus:border-yellow-500 focus:ring-yellow-500" placeholder="Enter alternate phone number" />
                </div>
              </div>
            </div>
            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-start gap- 3">
                <div className="p-1 rounded-full bg-blue-100"><Phone size={16} className="text-[#0E1630]" /></div>
                <p className="text-sm text-yellow-500">After submitting, our call center will contact you to confirm booking details and process payment.</p>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Confirm Booking Details</h3>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Ambulance Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium">{emergencyData?.ambulanceTypes.find(t => t.id === selectedType)?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium">{emergencyData?.categories.find(c => c.id === selectedCategory)?.name}</p>
                  </div>
                </div>
              </div>
              <div className="border-b pb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Equipment</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedEquipment.map(eqId => {
                    const equipment = emergencyData?.equipment.find(e => e.id === eqId);
                    return equipment ? (
                      <div key={eqId} className="bg-blue-50 text-yellow-500 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {getIcon(equipment.icon, 16)}<span>{equipment.name}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
              <div className="border-b pb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Location</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Pickup</p>
                    <p className="font-medium">{emergencyData?.locations.find(l => l.id === pickupLocation)?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Drop</p>
                    <p className="font-medium">{emergencyData?.locations.find(l => l.id === dropLocation)?.name}</p>
                  </div>
                </div>
              </div>
              <div className="border-b pb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Schedule</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{format(selectedDate, 'dd/MM/yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time Slot</p>
                    <p className="font-medium">{emergencyData?.timeSlots.find(t => t.id === selectedTimeSlot)?.time}</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Contact</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2"><Phone size={16} className="text-gray-400" /><p className="font-medium">{phoneNumber}</p></div>
                  {alternatePhone && (
                    <div className="flex items-center gap-2"><Phone size={16} className="text-gray-400" /><p className="font-medium">{alternatePhone}</p></div>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
              <p className="text-sm text-yellow-700">By submitting, you will be connected to our call center for final confirmation and payment processing.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    try {
      const bookingData = {
        ambulanceType: selectedType,
        category: selectedCategory, 
        equipment: selectedEquipment,
        pickupLocation,
        dropLocation,
        date: format(selectedDate, 'yyyy-MM-dd'),
        timeSlot: selectedTimeSlot,
        phoneNumber,
        alternatePhone
      };

      await axios.post('https://mocki.io/v1/20345d29-5a36-4fcd-9c2e-018fca665549', bookingData);
      alert('Booking submitted successfully! Our call center will contact you shortly.');
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Connecting....');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-[#0E1630] px-6 py-4">
          <div className="flex items-center gap-3">
            <Ambulance className="text-white" size={24} />
            <div>
              <h1 className="text-xl font-semibold text-white">Ambulance Booking</h1>
              <p className="text-blue-100 text-sm">Book an ambulance from AV Swasthya's trusted network</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-b">
          <div className="flex justify-between items-center w-full">
            {['Details', 'Date & Time', 'Contact', 'Confirm'].map((step, index) => (
              <div key={index} className="flex flex-col items-center w-1/4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full mb-1 ${currentStep === index ? 'bg-[#0E1630] text-white' : currentStep > index ? 'bg-yellow-500 text-white' : 'bg-white text-gray-400 border border-gray-300'}`}>
                  {currentStep > index ? <CheckCircle2 size={20} /> : <span>{index + 1}</span>}
                </div>
                <p className={`text-xs ${currentStep === index || currentStep > index ? 'text-[#0E1630] font-medium' : 'text-gray-500'}`}>{step}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 py-6">{renderStep()}</div>
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
          {currentStep > 0 && (
            <button onClick={() => setCurrentStep(prev => prev - 1)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">Back</button>
          )}
          <button onClick={() => { if (currentStep === 3) handleSubmit(); else setCurrentStep(prev => prev + 1); }} className="ml-auto px-6 py-2 bg-[#0E1630] text-white rounded-md hover:bg-yellow-500 transition-colors">
            {currentStep === 3 ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Emergency;