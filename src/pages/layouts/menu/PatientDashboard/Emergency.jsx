import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { format } from "date-fns";
import * as Lucide from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PaymentGateway from "../../../../components/microcomponents/PaymentGatway";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Emergency = () => {
  const [step, setStep] = useState(0);
  const [type, setType] = useState("");
  const [cat, setCat] = useState("");
  const [equip, setEquip] = useState([]);
  const [date, setDate] = useState(new Date());
  const [pickup, setPickup] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [data, setData] = useState(null);
  const [showEquip, setShowEquip] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNearbyView, setShowNearbyView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAmbulances, setFilteredAmbulances] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [hasSearched, setHasSearched] = useState(false); // Track if user has searched

  const equipRef = useRef(null);
  const searchRef = useRef(null);
  const BOOKING_API_URL =
    "https://mocki.io/v1/b09096ff-e79e-4d5d-9cf9-28a3f7af4d09";

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (position) => setCurrentLocation("Dharwad"),
      (error) => {
        console.log("Location access denied:", error);
        setCurrentLocation("Dharwad");
      }
    );
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(BOOKING_API_URL);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load booking data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showEquip && equipRef.current && !equipRef.current.contains(e.target))
        setShowEquip(false);
      if (
        showSuggestions &&
        searchRef.current &&
        !searchRef.current.contains(e.target)
      )
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEquip, showSuggestions]);

  // Auto-trigger search when filter changes (only if user has already searched)
  useEffect(() => {
    if (hasSearched && searchQuery) {
      searchAmbulances(searchQuery);
    }
  }, [selectedFilter]);

  const getIcon = (name, size = 20) => {
    const icons = {
      Activity: Lucide.Activity,
      Ambulance: Lucide.Ambulance,
      Heart: Lucide.Heart,
      HeartPulse: Lucide.HeartPulse,
      Cylinder: Lucide.Cylinder,
      Bed: Lucide.Bed,
      Lungs: Lucide.Settings,
      Wheelchair: Lucide.Armchair,
      ActivitySquare: Lucide.ActivitySquare,
      Zap: Lucide.Zap,
    };
    return React.createElement(icons[name] || Lucide.Activity, { size });
  };

  const generateSuggestions = (query) => {
    if (!data || !query.trim()) return [];
    const allSuggestions = [
      ...data.ambulanceServices.map((amb) => ({
        type: "ambulance",
        value: amb.serviceName,
        location: amb.location,
      })),
      ...data.ambulanceServices.map((amb) => ({
        type: "location",
        value: amb.location,
        count: data.ambulanceServices.filter((a) => a.location === amb.location)
          .length,
      })),
    ];
    return allSuggestions
      .filter(
        (item, index, self) =>
          index ===
          self.findIndex((t) => t.value === item.value && t.type === item.type)
      )
      .filter((item) => item.value.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  };

  const handleSearchInputChange = (value) => {
    setSearchQuery(value);
    setShowSuggestions(
      value.length > 0 && generateSuggestions(value).length > 0
    );
    setSuggestions(generateSuggestions(value));
  };

  const searchByCurrentLocation = () => {
    setSearchQuery(currentLocation);
    setShowSuggestions(false);
    searchAmbulances(currentLocation);
  };

  const searchAmbulances = (query = searchQuery) => {
    if (!data || !query.trim()) {
      toast.error("Please enter a search term");
      return;
    }
    setSearchLoading(true);
    setHasSearched(true); // Mark that user has performed a search

    setTimeout(() => {
      let results = [...data.ambulanceServices].filter((ambulance) =>
        [
          ambulance.serviceName,
          ambulance.location,
          ambulance.type,
          ambulance.category,
          ambulance.phone,
        ].some((field) => field.toLowerCase().includes(query.toLowerCase()))
      );

      // Combined filter logic
      let filters = selectedFilter
        .split(",")
        .map((f) => f.trim())
        .filter((f) => f && f !== "all");

      if (filters.length > 0) {
        results = results.filter((amb) => {
          let match = true;
          filters.forEach((filter) => {
            if (filter === "available") {
              if (!amb.available) match = false;
            } else if (
              ["government", "private", "hospital", "ngo"].includes(filter)
            ) {
              if (amb.category.toLowerCase() !== filter) match = false;
            } else if (["bls", "als", "icu"].includes(filter)) {
              if (!amb.type.toLowerCase().includes(filter)) match = false;
            }
          });
          return match;
        });
      }

      setFilteredAmbulances(
        results.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
      );
      setSearchLoading(false);
    }, 500);
  };

  // Handle filter change
  const handleFilterChange = (filterValue) => {
    setSelectedFilter(filterValue);
    // If user has already searched, automatically apply the new filter
    if (hasSearched && searchQuery) {
      // Don't call searchAmbulances here as it will be called by useEffect
    }
  };

  const getAmbulanceTypeIcon = (type) => {
    const icons = {
      ICU: <Lucide.Heart className="text-red-600" size={24} />,
      ALS: <Lucide.HeartPulse className="text-blue-600" size={24} />,
      BLS: <Lucide.Activity className="text-green-600" size={24} />,
    };
    return (
      icons[type.split(" ")[0]] || (
        <Lucide.Ambulance className="text-red-600" size={24} />
      )
    );
  };

  const getCategoryColor = (category) => {
    const colors = {
      government: "bg-blue-100 text-blue-700 border-blue-200",
      private: "bg-green-100 text-green-700 border-green-200",
      hospital: "bg-purple-100 text-purple-700 border-purple-200",
      ngo: "bg-orange-100 text-orange-700 border-orange-200",
    };
    return (
      colors[category.toLowerCase()] ||
      "bg-gray-100 text-gray-700 border-gray-200"
    );
  };

  const calculateEquipmentTotal = () => {
    if (!data) return 0;
    return equip.reduce(
      (total, equipId) =>
        total + (data.equipment.find((e) => e.id === equipId)?.price || 0),
      0
    );
  };

  const renderNearbyAmbulanceView = () => (
    <div className="w-full min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--accent-color)" }}
              >
                <Lucide.MapPin className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Search Ambulances
                </h1>
                <p className="text-gray-600">
                  Find ambulances by location, name, or service type
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowNearbyView(false)}
              className="btn btn-secondary"
            >
              <Lucide.X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 max-w-xl relative" ref={searchRef}>
                <div className="relative">
                  <Lucide.Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search by location, ambulance name, service type..."
                    value={searchQuery}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    onKeyPress={(e) => e.key === "Enter" && searchAmbulances()}
                  />
                </div>
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchQuery(suggestion.value);
                          setShowSuggestions(false);
                          searchAmbulances(suggestion.value);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                      >
                        {suggestion.type === "ambulance" ? (
                          <Lucide.Ambulance
                            className="text-red-500"
                            size={16}
                          />
                        ) : (
                          <Lucide.MapPin className="text-blue-500" size={16} />
                        )}
                        <div>
                          <div className="font-medium">{suggestion.value}</div>
                          {suggestion.location && (
                            <div className="text-sm text-gray-500">
                              {suggestion.location}
                            </div>
                          )}
                          {suggestion.count && (
                            <div className="text-sm text-gray-500">
                              {suggestion.count} ambulances
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={searchByCurrentLocation}
                className="btn view-btn"
              >
                <Lucide.MapPin size={20} /> Current Location
              </button>
              <select
                value={selectedFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg outline-none transition-colors focus:border-blue-500"
              >
                <option value="all">All Filters</option>
                <option value="available">Available Only</option>
                <option value="government">Government</option>
                <option value="private">Private</option>
                <option value="hospital">Hospital</option>
                <option value="bls">BLS Ambulance</option>
                <option value="als">ALS Ambulance</option>
                <option value="icu">ICU Ambulance</option>
              </select>
              <button
                onClick={searchAmbulances}
                disabled={searchLoading}
                className={`btn view-btn${
                  searchLoading ? " btn-disabled" : ""
                }`}
              >
                {searchLoading ? (
                  <Lucide.Loader2 className="animate-spin" size={20} />
                ) : (
                  <Lucide.Search size={20} />
                )}{" "}
                Search
              </button>
            </div>
          </div>
        </div>
        {filteredAmbulances.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                Found {filteredAmbulances.length} Ambulances
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAmbulances.map((ambulance) => (
                <div
                  key={ambulance.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getAmbulanceTypeIcon(ambulance.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold mb-1 truncate text-gray-800">
                          {ambulance.serviceName}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Lucide.MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{ambulance.location}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
                          ambulance.category
                        )}`}
                      >
                        {ambulance.category}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                        {ambulance.type}
                      </span>
                      {ambulance.available && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-700 border-green-200">
                          Available
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Lucide.Navigation className="w-4 h-4" />
                        <span>{ambulance.distance} km</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Lucide.Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{ambulance.rating}</span>
                      </div>
                    </div>
                    <div className="border rounded-lg p-3 mb-4 bg-green-50 border-green-200">
                      <div className="flex items-center gap-2 text-green-600">
                        <Lucide.Phone className="w-4 h-4" />
                        <span className="font-semibold text-lg">
                          {ambulance.phone}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          window.open(`tel:${ambulance.phone}`, "_self")
                        }
                        className="btn view-btn flex-1 text-sm"
                      >
                        <Lucide.Phone size={16} /> Call Now
                      </button>
                      <button
                        onClick={() =>
                          toast.success(
                            `Booking request sent to ${ambulance.serviceName}`
                          )
                        }
                        className="btn btn-secondary flex-1 text-sm"
                      >
                        <Lucide.Calendar size={16} /> Book
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {searchLoading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Lucide.Loader2
              className="animate-spin mx-auto mb-4 text-green-500"
              size={32}
            />
            <p className="text-gray-600">Searching ambulances...</p>
          </div>
        )}
        {!searchLoading && filteredAmbulances.length === 0 && searchQuery && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Lucide.AlertCircle
              className="mx-auto mb-4 text-gray-400"
              size={32}
            />
            <p className="text-gray-600">
              No ambulances found for "{searchQuery}"
              {selectedFilter !== "all" && ` with filter "${selectedFilter}"`}.
              Try different search terms or remove filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const handleSubmit = async () => {
    if (!data) return;
    const booking = {
      ambulanceType: data.ambulanceTypes.find((t) => t.id === type)?.name,
      category: data.categories.find((c) => c.id === cat)?.name,
      equipment: equip,
      pickupLocation: data.locations.find((l) => l.id === pickup)?.name,
      date: format(date, "yyyy-MM-dd"),
      totalAmount: calculateEquipmentTotal(),
    };
    setBookingData(booking);
    try {
      await axios.post(BOOKING_API_URL, booking);
      toast.success("Booking submitted successfully!");
      setStep(0);
      setType("");
      setCat("");
      setEquip([]);
      setPickup("");
      setDate(new Date());
    } catch {
      toast.error("Failed to submit booking.");
    }
  };

  const handlePayNow = () => {
    if (!data) return;
    const booking = {
      ambulanceType: data.ambulanceTypes.find((t) => t.id === type)?.name,
      category: data.categories.find((c) => c.id === cat)?.name,
      equipment: equip,
      pickupLocation: data.locations.find((l) => l.id === pickup)?.name,
      date: format(date, "yyyy-MM-dd"),
      totalAmount: calculateEquipmentTotal(),
    };
    setBookingData(booking);
    if (booking.totalAmount > 0) {
      setShowPaymentGateway(true);
    } else {
      toast.info(
        "No equipment charges to pay. Please use Submit Booking instead."
      );
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      await axios.post(BOOKING_API_URL, {
        ...bookingData,
        paymentId: paymentData.paymentId,
        paymentMethod: paymentData.method,
      });
      toast.success("Booking and payment completed successfully!");
      setShowPaymentGateway(false);
      setStep(0);
      setType("");
      setCat("");
      setEquip([]);
      setPickup("");
      setDate(new Date());
      setBookingData(null);
    } catch {
      toast.error("Failed to complete booking and payment.");
    }
  };

  const handlePaymentFailure = () => {
    toast.error("Payment failed. Please try again.");
    setShowPaymentGateway(false);
  };

  const renderStep = () => {
    if (!data) {
      return (
        <div className="text-center py-10">
          <Lucide.Loader2
            className="animate-spin mx-auto mb-4 text-blue-500"
            size={32}
          />
          <p className="text-gray-600">Loading booking data...</p>
        </div>
      );
    }
    if (step === 0) {
      return (
        <div className="w-full space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="w-full">
              <label className="block text-sm font-medium mb-3 text-gray-700">
                Select Ambulance Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select ambulance type</option>
                {data.ambulanceTypes.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium mb-3 text-gray-700">
                Select Category
              </label>
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select category</option>
                {data.categories.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="w-full relative" ref={equipRef}>
              <label className="block text-sm font-medium mb-3 text-gray-700">
                Select Equipment Requirements
              </label>
              <button
                type="button"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg outline-none flex justify-between items-center cursor-pointer transition-colors hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                onClick={() => setShowEquip((prev) => !prev)}
              >
                <span>
                  {equip.length === 0
                    ? "Select equipment"
                    : `${equip.length} items selected`}
                </span>
                <Lucide.ChevronDown size={16} />
              </button>
              {showEquip && (
                <div className="absolute z-[9999] mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-auto">
                  {data.equipment.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={equip.includes(item.id)}
                          onChange={() =>
                            setEquip((prev) =>
                              prev.includes(item.id)
                                ? prev.filter((id) => id !== item.id)
                                : [...prev, item.id]
                            )
                          }
                          className="mr-2"
                        />
                        <span className="flex items-center gap-2">
                          {getIcon(item.icon, 16)}
                          <span>{item.name}</span>
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-green-600">
                        ₹{item.price}
                      </span>
                    </label>
                  ))}
                </div>
              )}
              {equip.length > 0 && (
                <div className="mt-2 p-3 border rounded-lg bg-green-50 border-green-200">
                  <span className="font-semibold text-green-600">
                    Total: ₹{calculateEquipmentTotal()}
                  </span>
                </div>
              )}
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium mb-3 text-gray-700">
                Pickup Location
              </label>
              <select
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select pickup location</option>
                {data.locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="w-full">
              <label className="block text-sm font-medium mb-3 text-gray-700">
                Select Date
              </label>
              <ReactDatePicker
                selected={date}
                onChange={(selectedDate) => setDate(selectedDate)}
                minDate={new Date()}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                dateFormat="yyyy-MM-dd"
              />
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#01B07A] to-[#1A223F] rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--surfaceColor)" }}
            >
              <Lucide.CheckCircle className="text-white" size={24} />
            </div>
            <div>
              <h3 style={{ color: "var(--surfaceColor)", fontWeight: 700 }}>
                Booking Confirmation
              </h3>
              <p style={{ color: "var(--surfaceColor)" }}>
                Please review your booking details below
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lucide.Ambulance className="text-red-600" size={24} />
              <h4 className="text-lg font-semibold text-gray-800">
                Service Details
              </h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">
                  Ambulance Type:
                </span>
                <span className="font-semibold text-gray-800">
                  {data.ambulanceTypes.find((t) => t.id === type)?.name}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Category:</span>
                <span className="font-semibold text-gray-800">
                  {data.categories.find((c) => c.id === cat)?.name}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 font-medium">
                  Pickup Location:
                </span>
                <span className="font-semibold text-gray-800">
                  {data.locations.find((l) => l.id === pickup)?.name}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lucide.Calendar className="text-blue-600" size={24} />
              <h4 className="text-lg font-semibold text-gray-800">
                Schedule & Location
              </h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Booking Date:</span>
                <span className="font-semibold text-gray-800">
                  {format(date, "dd MMM yyyy")}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Day:</span>
                <span className="font-semibold text-gray-800">
                  {format(date, "EEEE")}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 font-medium">Status:</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Confirmed
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lucide.Package className="text-purple-600" size={24} />
            <h4 className="text-lg font-semibold text-gray-800">
              Equipment & Billing
            </h4>
          </div>
          {equip.length > 0 ? (
            <div className="space-y-3">
              {equip.map((eqId) => {
                const equipment = data.equipment.find((e) => e.id === eqId);
                return equipment ? (
                  <div
                    key={eqId}
                    className="flex items-center justify-between py-2 border-b border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getIcon(equipment.icon, 16)}
                      </div>
                      <span className="text-gray-700 font-medium">
                        {equipment.name}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-800">
                      ₹{equipment.price}
                    </span>
                  </div>
                ) : null;
              })}
              <div className="border-t-2 border-gray-200 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">
                    Total Equipment Cost:
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-green-600">
                      ₹{calculateEquipmentTotal()}
                    </span>
                    <p className="text-sm text-gray-500">
                      Including all equipment
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Lucide.Package
                className="mx-auto mb-3 text-gray-400"
                size={32}
              />
              <p className="text-gray-500">No additional equipment selected</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (showNearbyView) {
    return (
      <>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        {renderNearbyAmbulanceView()}
      </>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 py-8 px-4">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <PaymentGateway
        isOpen={showPaymentGateway}
        onClose={() => setShowPaymentGateway(false)}
        amount={calculateEquipmentTotal()}
        bookingId={`AMB_${Date.now()}`}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailure={handlePaymentFailure}
        description="Ambulance Equipment Payment"
        theme={{
          primaryColor: "#1f2937",
          accentColor: "#10b981",
          surfaceColor: "#ffffff",
        }}
      />
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 flex justify-between items-center bg-gray-800">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--accent-color)" }}
            >
              <Lucide.Ambulance className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white mb-0">
                Ambulance Booking
              </h1>
              <p className="text-sm text-gray-200 mb-0">
                Book an ambulance from AV Swasthya's trusted network
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowNearbyView(true)}
            className="btn view-btn flex items-center gap-2"
          >
            <Lucide.MapPin size={20} />
            <span>Near By Ambulance</span>
          </button>
        </div>
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-center items-center w-full max-w-md mx-auto">
            {["Details", "Confirm"].map((stepName, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full mb-2 transition-all ${
                      step === index
                        ? "shadow-lg"
                        : step > index
                        ? ""
                        : "bg-gray-200 text-gray-600 border border-gray-300"
                    }`}
                    style={
                      step === index
                        ? {
                            backgroundColor: "var(--accent-color)",
                            color: "#fff",
                          }
                        : step > index
                        ? {
                            backgroundColor: "var(--accent-color)",
                            color: "#fff",
                          }
                        : {}
                    }
                  >
                    {step > index ? (
                      <Lucide.CheckCircle2 size={20} />
                    ) : (
                      <span className="font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <p
                    className={`text-sm font-medium transition-colors ${
                      step === index || step > index
                        ? "font-semibold"
                        : "text-gray-500"
                    }`}
                    style={
                      step === index || step > index
                        ? { color: "var(--accent-color)" }
                        : {}
                    }
                  >
                    {stepName}
                  </p>
                </div>
                {index < ["Details", "Confirm"].length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 mb-6 rounded transition-colors"}`}
                    style={
                      step > index
                        ? { backgroundColor: "var(--accent-color)" }
                        : { backgroundColor: "#e5e7eb" }
                    }
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="px-6 py-6">{renderStep()}</div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
          {step > 0 && (
            <button
              onClick={() => setStep((prev) => prev - 1)}
              className="btn btn-secondary"
            >
              Back
            </button>
          )}
          <div className={`flex gap-3 ${step === 0 ? "ml-auto" : ""}`}>
            {step === 1 ? (
              <>
                <button onClick={handleSubmit} className="btn view-btn">
                  Submit Booking
                </button>
                {calculateEquipmentTotal() > 0 && (
                  <button
                    onClick={handlePayNow}
                    className="btn view-btn flex items-center gap-2"
                  >
                    <Lucide.CreditCard size={16} /> Pay Now ₹
                    {calculateEquipmentTotal()}
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => setStep((prev) => prev + 1)}
                className="btn view-btn"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Emergency;