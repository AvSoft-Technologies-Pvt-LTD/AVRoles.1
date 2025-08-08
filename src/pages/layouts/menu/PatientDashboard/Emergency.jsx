import React, { useState, useEffect, useRef } from "react";
import {
MapContainer,
TileLayer,
Marker,
Popup,
useMapEvents,
} from "react-leaflet";
import axios from "axios";
import { format } from "date-fns";
import * as Lucide from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import PaymentGateway from "../../../../components/microcomponents/PaymentGatway";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
iconRetinaUrl:
"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
iconUrl:
"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
shadowUrl:
"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const Emergency = () => {
const [step, setStep] = useState(0);
const [type, setType] = useState("");
const [typeSearch, setTypeSearch] = useState("");
const [showTypeDropdown, setShowTypeDropdown] = useState(false);
const typeRef = useRef(null);

const [cat, setCat] = useState("");
const [catSearch, setCatSearch] = useState("");
const [showCatDropdown, setShowCatDropdown] = useState(false);
const catRef = useRef(null);

const [pickupSearch, setPickupSearch] = useState("");
const [showPickupDropdown, setShowPickupDropdown] = useState(false);
const pickupRef = useRef(null);

const [dropLocationSearch, setDropLocationSearch] = useState("");
const [showDropLocationDropdown, setShowDropLocationDropdown] = useState(false);
const dropLocationRef = useRef(null);
const [equip, setEquip] = useState([]);
const [date, setDate] = useState(new Date());
const [pickup, setPickup] = useState("");
const [dropLocation, setDropLocation] = useState("");
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
const [hasSearched, setHasSearched] = useState(false);

// Location popup states
const [showLocationPopup, setShowLocationPopup] = useState(false);
const [mapPosition, setMapPosition] = useState([15.3647, 75.124]);
const [markerPosition, setMarkerPosition] = useState([15.3647, 75.124]);
const [isSearching, setIsSearching] = useState(false);
const [mapSearchQuery, setMapSearchQuery] = useState("");
const [locationSuggestions, setLocationSuggestions] = useState([]);
const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
const mapSearchRef = useRef(null);
const [addressForm, setAddressForm] = useState({
type: "Other",
flatNo: "",
floor: "",
locality: "",
landmark: "",
name: "",
phone: "",
});

const equipRef = useRef(null);
const searchRef = useRef(null);
const BOOKING_API_URL =
"https://mocki.io/v1/b09096ff-e79e-4d5d-9cf9-28a3f7af4d09";

// Map click handler component
const MapClickHandler = () => {
useMapEvents({
click: (e) => {
setMarkerPosition([e.latlng.lat, e.latlng.lng]);
reverseGeocode(e.latlng.lat, e.latlng.lng);
},
});
return null;
};

const reverseGeocode = async (lat, lng) => {
try {
const res = await fetch(
`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
);
const data = await res.json();
if (data.display_name)
setAddressForm((p) => ({ ...p, locality: data.display_name }));
} catch (e) {
console.error("Reverse geocoding failed:", e);
}
};

const getCurrentLocation = () => {
if (navigator.geolocation) {
navigator.geolocation.getCurrentPosition(
({ coords }) => {
const pos = [coords.latitude, coords.longitude];
setMapPosition(pos);
setMarkerPosition(pos);
reverseGeocode(...pos);
},
(err) => {
console.error("Error:", err);
toast.error("Unable to get current location");
}
);
} else toast.error("Geolocation not supported");
};

// Generate location suggestions
const generateLocationSuggestions = async (query) => {
if (!query.trim()) {
setLocationSuggestions([]);
setShowLocationSuggestions(false);
return;
}

try {
const res = await fetch(
`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1`
);
const data = await res.json();

const suggestions = data.map((item, index) => ({
id: index,
display_name: item.display_name,
lat: parseFloat(item.lat),
lon: parseFloat(item.lon),
type: item.type || 'location',
address: item.address || {}
}));

setLocationSuggestions(suggestions);
setShowLocationSuggestions(suggestions.length > 0);
} catch (e) {
console.error("Failed to fetch location suggestions:", e);
setLocationSuggestions([]);
setShowLocationSuggestions(false);
}
};

// Handle location search input change
const handleLocationSearchInputChange = (value) => {
setMapSearchQuery(value);
if (value.trim().length > 2) {
generateLocationSuggestions(value);
} else {
setLocationSuggestions([]);
setShowLocationSuggestions(false);
}
};

// Handle location suggestion selection
const handleLocationSuggestionSelect = (suggestion) => {
setMapSearchQuery(suggestion.display_name);
setShowLocationSuggestions(false);
const pos = [suggestion.lat, suggestion.lon];
setMapPosition(pos);
setMarkerPosition(pos);
setAddressForm((p) => ({ ...p, locality: suggestion.display_name }));
};

const searchLocation = async () => {
if (!mapSearchQuery.trim()) return;
setIsSearching(true);
try {
const res = await fetch(
`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchQuery)}`
);
const data = await res.json();
if (data?.length) {
const pos = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
setMapPosition(pos);
setMarkerPosition(pos);
setAddressForm((p) => ({ ...p, locality: data[0].display_name }));
} else toast.error("Location not found");
} catch (e) {
console.error("Search failed:", e);
toast.error("Search failed");
} finally {
setIsSearching(false);
}
};

const saveAddress = () => {
if (!addressForm.name || !addressForm.phone)
return toast.error("Please fill in your name and phone number");
console.log("Saved address:", {
...addressForm,
coordinates: markerPosition,
});
toast.success("Address saved successfully!");
setShowLocationPopup(false);
};

useEffect(() => {
navigator.geolocation?.getCurrentPosition(
() => setCurrentLocation("Dharwad"),
(e) => {
console.log("Denied:", e);
setCurrentLocation("Dharwad");
}
);
}, []);

useEffect(() => {
(async () => {
try {
setLoading(true);
const res = await axios.get(BOOKING_API_URL);
setData(res.data);
} catch (e) {
console.error("Fetch error:", e);
toast.error("Failed to load booking data");
} finally {
setLoading(false);
}
})();
}, []);

// Updated click outside handler
useEffect(() => {
const handleClickOutside = (e) => {
if (showEquip && equipRef.current && !equipRef.current.contains(e.target))
setShowEquip(false);
if (showTypeDropdown && typeRef.current && !typeRef.current.contains(e.target))
setShowTypeDropdown(false);
if (showCatDropdown && catRef.current && !catRef.current.contains(e.target))
setShowCatDropdown(false);
if (showPickupDropdown && pickupRef.current && !pickupRef.current.contains(e.target))
setShowPickupDropdown(false);
if (showDropLocationDropdown && dropLocationRef.current && !dropLocationRef.current.contains(e.target))
setShowDropLocationDropdown(false);
// Hide suggestions when clicking outside the search container
if (
showSuggestions &&
searchRef.current &&
!searchRef.current.contains(e.target)
) {
setTimeout(() => {
setShowSuggestions(false);
}, 150);
}
// Hide location suggestions when clicking outside
if (
showLocationSuggestions &&
mapSearchRef.current &&
!mapSearchRef.current.contains(e.target)
) {
setTimeout(() => {
setShowLocationSuggestions(false);
}, 150);
}
};
document.addEventListener("mousedown", handleClickOutside);
return () => document.removeEventListener("mousedown", handleClickOutside);
}, [showEquip, showSuggestions, showTypeDropdown, showCatDropdown, showPickupDropdown, showDropLocationDropdown, showLocationSuggestions]);

useEffect(() => {
if (hasSearched && searchQuery) searchAmbulances(searchQuery);
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

// Enhanced suggestion generation with better location matching
const generateSuggestions = (query) => {
if (!data || !query.trim()) return [];

const queryLower = query.toLowerCase().trim();

// Enhanced location aliases for better matching
const locationAliases = {
  'hubli': ['hubli', 'hubballi', 'huballi'],
  'hubballi': ['hubli', 'hubballi', 'huballi'],
  'huballi': ['hubli', 'hubballi', 'huballi'],
  'dharwad': ['dharwad', 'dharwar'],
  'dharwar': ['dharwad', 'dharwar'],
  'bangalore': ['bangalore', 'bengaluru'],
  'bengaluru': ['bangalore', 'bengaluru']
};

// Get all possible variations for the query
const getLocationVariations = (query) => {
  const variations = [query];
  Object.entries(locationAliases).forEach(([key, aliases]) => {
    if (aliases.includes(query)) {
      variations.push(...aliases.filter(alias => alias !== query));
    }
  });
  return variations;
};

const queryVariations = getLocationVariations(queryLower);

const suggestions = [];

// Add ambulance service suggestions
data.ambulanceServices.forEach((ambulance) => {
  const nameMatches = ambulance.serviceName.toLowerCase().includes(queryLower);
  const locationMatches = queryVariations.some(variation => 
    ambulance.location.toLowerCase().includes(variation)
  );
  const typeMatches = ambulance.type.toLowerCase().includes(queryLower);
  const categoryMatches = ambulance.category.toLowerCase().includes(queryLower);
  
  if (nameMatches || locationMatches || typeMatches || categoryMatches) {
    suggestions.push({
      type: "ambulance",
      value: ambulance.serviceName,
      location: ambulance.location,
      ambulanceType: ambulance.type,
      category: ambulance.category,
      available: ambulance.available,
      id: ambulance.id
    });
  }
});

// Add unique location suggestions with counts
const locationCounts = {};
data.ambulanceServices.forEach((ambulance) => {
  const locationMatches = queryVariations.some(variation => 
    ambulance.location.toLowerCase().includes(variation)
  );
  
  if (locationMatches || ambulance.location.toLowerCase().includes(queryLower)) {
    if (!locationCounts[ambulance.location]) {
      locationCounts[ambulance.location] = 0;
    }
    locationCounts[ambulance.location]++;
  }
});

Object.entries(locationCounts).forEach(([location, count]) => {
  suggestions.push({
    type: "location",
    value: location,
    count: count,
    displayText: `${location} (${count} ambulances available)`
  });
});

// Add service type suggestions
const serviceTypes = ['BLS', 'ALS', 'ICU', 'Emergency', 'Non-Emergency'];
serviceTypes.forEach(serviceType => {
  if (serviceType.toLowerCase().includes(queryLower)) {
    const matchingServices = data.ambulanceServices.filter(ambulance =>
      ambulance.type.toLowerCase().includes(serviceType.toLowerCase())
    );
    
    if (matchingServices.length > 0) {
      suggestions.push({
        type: "service-type",
        value: serviceType,
        count: matchingServices.length,
        displayText: `${serviceType} Ambulances (${matchingServices.length} available)`
      });
    }
  }
});

// Remove duplicates and limit results
const uniqueSuggestions = suggestions
  .filter((v, i, self) =>
    i === self.findIndex((t) => t.value === v.value && t.type === v.type)
  )
  .slice(0, 8);

return uniqueSuggestions;
};

const handleSearchInputChange = (val) => {
setSearchQuery(val);
const suggest = generateSuggestions(val);
setShowSuggestions(val.length > 0 && suggest.length > 0);
setSuggestions(suggest);
};

// Handle suggestion selection
const handleSuggestionSelect = (suggestion) => {
setSearchQuery(suggestion.value);
setShowSuggestions(false);
// Automatically trigger search when suggestion is selected
setTimeout(() => {
searchAmbulances(suggestion.value);
}, 100);
};

const searchByCurrentLocation = () => setShowLocationPopup(true);

const searchAmbulances = (query = searchQuery) => {
if (!data || !query.trim()) {
toast.error("Please enter a search term");
return;
}

setSearchLoading(true);
setHasSearched(true);

setTimeout(() => {
  const queryLower = query.toLowerCase();
  
  // Enhanced location matching
  const locationAliases = {
    'hubli': ['hubli', 'hubballi', 'huballi'],
    'hubballi': ['hubli', 'hubballi', 'huballi'],
    'huballi': ['hubli', 'hubballi', 'huballi'],
    'dharwad': ['dharwad', 'dharwar'],
    'dharwar': ['dharwad', 'dharwar']
  };

  const getLocationVariations = (query) => {
    const variations = [query];
    Object.entries(locationAliases).forEach(([key, aliases]) => {
      if (aliases.includes(query)) {
        variations.push(...aliases.filter(alias => alias !== query));
      }
    });
    return variations;
  };

  const queryVariations = getLocationVariations(queryLower);
  
  let results = data.ambulanceServices.filter((ambulance) => {
    // Service name matching
    const nameMatch = ambulance.serviceName.toLowerCase().includes(queryLower);
    
    // Enhanced location matching with variations
    const locationMatch = queryVariations.some(variation =>
      ambulance.location.toLowerCase().includes(variation)
    ) || ambulance.location.toLowerCase().includes(queryLower);
    
    // Type matching
    const typeMatch = ambulance.type.toLowerCase().includes(queryLower);
    
    // Category matching
    const categoryMatch = ambulance.category.toLowerCase().includes(queryLower);
    
    // Phone matching
    const phoneMatch = ambulance.phone.includes(query);
    
    return nameMatch || locationMatch || typeMatch || categoryMatch || phoneMatch;
  });

  // Apply filters
  const filters = selectedFilter
    .split(",")
    .map((f) => f.trim())
    .filter((f) => f && f !== "all");
    
  if (filters.length) {
    results = results.filter((ambulance) =>
      filters.every((filter) => {
        if (filter === "available") return ambulance.available;
        if (["government", "private", "hospital", "ngo"].includes(filter))
          return ambulance.category.toLowerCase() === filter;
        if (["bls", "als", "icu"].includes(filter))
          return ambulance.type.toLowerCase().includes(filter);
        return true;
      })
    );
  }

  // Sort by distance
  results.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  
  setFilteredAmbulances(results);
  setSearchLoading(false);
  
  if (results.length === 0) {
    toast.info(`No ambulances found for "${query}". Try different search terms.`);
  } else {
    toast.success(`Found ${results.length} ambulances for "${query}"`);
  }
}, 500);
};

// Handle Enter key press in search
const handleSearchKeyPress = (e) => {
if (e.key === 'Enter') {
e.preventDefault();
setShowSuggestions(false);
searchAmbulances();
}
};

// Handle Enter key press in location search
const handleLocationSearchKeyPress = (e) => {
if (e.key === 'Enter') {
e.preventDefault();
setShowLocationSuggestions(false);
searchLocation();
}
};

const handleFilterChange = (f) => setSelectedFilter(f);

const getAmbulanceTypeIcon = (type) =>
({
ICU: <Lucide.Heart className="text-red-600" size={24} />,
ALS: <Lucide.HeartPulse className="text-blue-600" size={24} />,
BLS: <Lucide.Activity className="text-green-600" size={24} />,
}[type.split(" ")[0]] || (
<Lucide.Ambulance className="text-red-600" size={24} />
));

const getCategoryColor = (c) =>
({
government: "bg-blue-100 text-blue-700 border-blue-200",
private: "bg-green-100 text-green-700 border-green-200",
hospital: "bg-purple-100 text-purple-700 border-purple-200",
ngo: "bg-orange-100 text-orange-700 border-orange-200",
}[c.toLowerCase()] || "bg-gray-100 text-gray-700 border-gray-200");

const calculateEquipmentTotal = () =>
!data
? 0
: equip.reduce(
(t, id) => t + (data.equipment.find((e) => e.id === id)?.price || 0),
0
);

const buildBooking = () => ({
ambulanceType: data.ambulanceTypes.find((t) => t.id === type)?.name,
category: data.categories.find((c) => c.id === cat)?.name,
equipment: equip,
pickupLocation: data.locations.find((l) => l.id === pickup)?.name,
dropLocation: data.locations.find((l) => l.id === dropLocation)?.name,
date: format(date, "yyyy-MM-dd"),
totalAmount: calculateEquipmentTotal(),
});

const resetForm = () => {
setStep(0);
setType("");
setCat("");
setEquip([]);
setPickup("");
setDropLocation("");
setDate(new Date());
};

const handleSubmit = async () => {
if (!data) return;
const booking = buildBooking();
setBookingData(booking);
try {
await axios.post(BOOKING_API_URL, booking);
toast.success("Booking submitted successfully!");
resetForm();
} catch {
toast.error("Failed to submit booking.");
}
};

const handlePayNow = () => {
if (!data) return;
const booking = buildBooking();
setBookingData(booking);
booking.totalAmount > 0
? setShowPaymentGateway(true)
: toast.info(
"No equipment charges to pay. Please use Submit Booking instead."
);
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
resetForm();
setBookingData(null);
} catch {
toast.error("Failed to complete booking and payment.");
}
};

const handlePaymentFailure = () => {
toast.error("Payment failed. Please try again.");
setShowPaymentGateway(false);
};

const renderNearbyAmbulanceView = () => (
<div className="w-full min-h-screen bg-gray-50 py-8 px-4">
<div className="max-w-7xl mx-auto">
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
<div className="flex items-center justify-between mb-6">
<div className="flex items-center gap-4">
<div
className="w-12 h-12 rounded-lg flex items-center justify-center"
style={{ backgroundColor: "#01B07A", color: "white" }}
>
<Lucide.MapPin size={24} />
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
className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
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
                placeholder="Search by location (e.g., Hubli, Dharwad), ambulance name, service type..."
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setShowSuggestions(false);
                    setFilteredAmbulances([]);
                    setHasSearched(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 bg-white shadow-sm hover:shadow-md rounded-full w-5 h-5 flex items-center justify-center transition-all duration-200"
                >
                  ✕
                </button>
              )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.type}-${suggestion.value}-${index}`}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    {suggestion.type === "ambulance" && (
                      <Lucide.Ambulance className="text-red-500 flex-shrink-0" size={16} />
                    )}
                    {suggestion.type === "location" && (
                      <Lucide.MapPin className="text-blue-500 flex-shrink-0" size={16} />
                    )}
                    {suggestion.type === "service-type" && (
                      <Lucide.Activity className="text-green-500 flex-shrink-0" size={16} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{suggestion.value}</div>
                      {suggestion.location && (
                        <div className="text-sm text-gray-500 truncate">
                          {suggestion.location}
                          {suggestion.available !== undefined && (
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                              suggestion.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {suggestion.available ? 'Available' : 'Busy'}
                            </span>
                          )}
                        </div>
                      )}
                      {suggestion.displayText && suggestion.type !== "ambulance" && (
                        <div className="text-sm text-gray-500">{suggestion.displayText}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

       <button
onClick={searchByCurrentLocation}
style={{ backgroundColor: "var(--accent-color)" }}
className="px-4 py-3 text-white rounded-lg hover:brightness-90 flex items-center gap-2 whitespace-nowrap"

>
<Lucide.MapPin size={20} /> Current Location
</button>

          <select
            value={selectedFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 min-w-32"
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
onClick={() => searchAmbulances()}
disabled={searchLoading}
style={{ backgroundColor: "var(--accent-color)" }}
className={`px-4 py-3 text-white rounded-lg hover:brightness-90 flex items-center gap-2 whitespace-nowrap ${     searchLoading ? "opacity-50 cursor-not-allowed" : ""   }`}

>
{searchLoading ? (
<Lucide.Loader2 className="animate-spin" size={20} />
) : (
<Lucide.Search size={20} />
)}
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
          <div className="text-sm text-gray-600">
            Showing results for "{searchQuery}"
          </div>
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
                    <span className="font-semibold text-lg">{ambulance.phone}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(`tel:${ambulance.phone}`, "_self")}
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-sm"
                  >
                    <Lucide.Phone size={16} /> Call Now
                  </button>
                  <button
                    onClick={() =>
                      toast.success(
                        `Booking request sent to ${ambulance.serviceName}`
                      )
                    }
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"
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

    {!searchLoading && filteredAmbulances.length === 0 && hasSearched && searchQuery && (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <Lucide.AlertCircle
          className="mx-auto mb-4 text-gray-400"
          size={32}
        />
        <p className="text-gray-600 mb-4">
          No ambulances found for "<strong>{searchQuery}</strong>"
          {selectedFilter !== "all" && ` with filter "${selectedFilter}"`}.
        </p>
        <div className="text-sm text-gray-500">
          <p>Try:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Different search terms (e.g., "Hubli", "BLS", "Government")</li>
            <li>Removing filters</li>
            <li>Checking spelling</li>
          </ul>
        </div>
      </div>
    )}
  </div>
</div>
);

// Location Popup Modal
const renderLocationPopup = () => (
<div className="fixed inset-0 backdrop-blur-sm bg-white/10 z-50 overflow-y-auto p-4">
<div className="mx-auto max-w-4xl bg-white rounded-lg shadow-xl h-[90vh] flex flex-col mt-4">
<div className="flex items-center justify-between p-4 border-b border-gray-200">
<h2 className="text-xl font-semibold text-gray-800">Enter complete address</h2>
<button
onClick={() => setShowLocationPopup(false)}
className="p-2 hover:bg-gray-100 rounded-full transition-colors"
>
<Lucide.X className="w-5 h-5" />
</button>
</div>

    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 right-4 z-[9999] pointer-events-auto">
          <div className="bg-white rounded-lg shadow-lg p-3 w-full max-w-3xl mx-auto">
            <div className="flex gap-2" ref={mapSearchRef}>
              <div className="flex-1 relative">
                <Lucide.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search location..."
                  value={mapSearchQuery}
                  onChange={(e) => handleLocationSearchInputChange(e.target.value)}
                  onKeyPress={handleLocationSearchKeyPress}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                
                {/* Location Suggestions Dropdown */}
                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {locationSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleLocationSuggestionSelect(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <Lucide.MapPin className="text-blue-500 flex-shrink-0" size={16} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{suggestion.display_name}</div>
                          {suggestion.address && suggestion.address.country && (
                            <div className="text-sm text-gray-500 truncate">
                              {suggestion.type} • {suggestion.address.country}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={searchLocation}
                disabled={isSearching}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={getCurrentLocation}
          className="absolute bottom-4 left-4 z-10 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2 shadow-lg"
        >
          <Lucide.MapPin className="w-4 h-4" />
          Go to current location
        </button>

        <div className="h-full">
          <MapContainer
            center={mapPosition}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            key={`${mapPosition[0]}-${mapPosition[1]}`}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapClickHandler />
            {markerPosition && (
              <Marker position={markerPosition}>
                <Popup>
                  Selected Location
                  <br />
                  Lat: {markerPosition[0].toFixed(6)}
                  <br />
                  Lng: {markerPosition[1].toFixed(6)}
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>

      <div className="w-80 bg-gray-50 p-4 overflow-y-auto">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-2">Add New Address</p>

          <div>
            <input
              type="text"
              placeholder="Flat / House no / Building name *"
              value={addressForm.flatNo}
              onChange={(e) =>
                setAddressForm((prev) => ({
                  ...prev,
                  flatNo: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Floor (optional)"
              value={addressForm.floor}
              onChange={(e) =>
                setAddressForm((prev) => ({
                  ...prev,
                  floor: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Area / Sector / Locality *</p>
            <input
              type="text"
              value={addressForm.locality}
              onChange={(e) =>
                setAddressForm((prev) => ({
                  ...prev,
                  locality: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-100"
              readOnly
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Nearby landmark (optional)"
              value={addressForm.landmark}
              onChange={(e) =>
                setAddressForm((prev) => ({
                  ...prev,
                  landmark: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="border-t border-gray-200 my-4" />
          <p className="text-sm text-gray-600 mb-3">
            Enter your details for seamless delivery experience
          </p>

          <div>
            <input
              type="text"
              placeholder="Your name *"
              value={addressForm.name}
              onChange={(e) =>
                setAddressForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Your phone number *</p>
            <input
              type="tel"
              placeholder="9901341763"
              value={addressForm.phone}
              onChange={(e) =>
                setAddressForm((prev) => ({
                  ...prev,
                  phone: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={saveAddress}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
          >
            Save Address
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
);

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
        {/* Ambulance Type Dropdown */}
        <div className="w-full relative" ref={typeRef}>
          <label className="block text-sm font-medium mb-3 text-gray-700">Select Ambulance Type</label>
          <input
            type="text"
            placeholder="Search ambulance type"
            value={typeSearch}
            onChange={e => setTypeSearch(e.target.value)}
            onFocus={() => setShowTypeDropdown(true)}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            readOnly={!!type && !showTypeDropdown}
          />
          {showTypeDropdown && (
            <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
              {data.ambulanceTypes
                .filter((item) => item.name.toLowerCase().includes(typeSearch.toLowerCase()))
                .map((item) => (
                  <li
                    key={item.id}
                    onClick={() => {
                      setType(item.id);
                      setTypeSearch(item.name);
                      setShowTypeDropdown(false);
                    }}
                    className="px-4 py-2 cursor-pointer hover:bg-blue-100"
                  >
                    {item.name}
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="w-full relative" ref={catRef}>
          <label className="block text-sm font-medium mb-3 text-gray-700">Select Category</label>
          <input
            type="text"
            placeholder="Search category"
            value={catSearch}
            onChange={e => setCatSearch(e.target.value)}
            onFocus={() => setShowCatDropdown(true)}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            readOnly={!!cat && !showCatDropdown}
          />
          {showCatDropdown && (
            <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
              {data.categories
                .filter((item) => item.name.toLowerCase().includes(catSearch.toLowerCase()))
                .map((item) => (
                  <li
                    key={item.id}
                    onClick={() => {
                      setCat(item.id);
                      setCatSearch(item.name);
                      setShowCatDropdown(false);
                    }}
                    className="px-4 py-2 cursor-pointer hover:bg-blue-100"
                  >
                    {item.name}
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipment Requirements (unchanged) */}
        <div className="w-full relative" ref={equipRef}>
          <label className="block text-sm font-medium mb-3 text-gray-700">
            Select Equipment Requirements
          </label>
          <button
            type="button"
            className="w-full px-3 py-3 border border-gray-300 rounded-lg flex justify-between items-center cursor-pointer hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
          <label className="block text-sm font-medium mb-3 text-gray-700">Select Date</label>
          <ReactDatePicker
            selected={date}
            onChange={(selectedDate) => setDate(selectedDate)}
            minDate={new Date()}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            dateFormat="yyyy-MM-dd"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pickup Location Dropdown */}
        <div className="w-full relative" ref={pickupRef}>
          <label className="block text-sm font-medium mb-3 text-gray-700">Pickup Location</label>
          <input
            type="text"
            placeholder="Search pickup location"
            value={pickupSearch}
            onChange={e => setPickupSearch(e.target.value)}
            onFocus={() => setShowPickupDropdown(true)}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            readOnly={!!pickup && !showPickupDropdown}
          />
          {showPickupDropdown && (
            <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
              {data.locations
                .filter((item) => item.name.toLowerCase().includes(pickupSearch.toLowerCase()))
                .map((item) => (
                  <li
                    key={item.id}
                    onClick={() => {
                      setPickup(item.id);
                      setPickupSearch(item.name);
                      setShowPickupDropdown(false);
                    }}
                    className="px-4 py-2 cursor-pointer hover:bg-blue-100"
                  >
                    {item.name}
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Drop Location Dropdown */}
        <div className="w-full relative" ref={dropLocationRef}>
          <label className="block text-sm font-medium mb-3 text-gray-700">Drop Location</label>
          <input
            type="text"
            placeholder="Search drop location"
            value={dropLocationSearch}
            onChange={e => setDropLocationSearch(e.target.value)}
            onFocus={() => setShowDropLocationDropdown(true)}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            readOnly={!!dropLocation && !showDropLocationDropdown}
          />
          {showDropLocationDropdown && (
            <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
              {data.locations
                .filter((item) => item.name.toLowerCase().includes(dropLocationSearch.toLowerCase()))
                .map((item) => (
                  <li
                    key={item.id}
                    onClick={() => {
                      setDropLocation(item.id);
                      setDropLocationSearch(item.name);
                      setShowDropLocationDropdown(false);
                    }}
                    className="px-4 py-2 cursor-pointer hover:bg-blue-100"
                  >
                    {item.name}
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

return (
  <div className="space-y-6">
    <div className="bg-gradient-to-r from-[#01B07A] to-[#1A223F] rounded-xl p-6 mb-6 text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
          <Lucide.CheckCircle className="text-white" size={24} />
        </div>
        <div>
          <h3 className="text-white font-bold text-xl">
            Booking Confirmation
          </h3>
          <p className="text-white/90">
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
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600 font-medium">
              Drop Location:
            </span>
            <span className="font-semibold text-gray-800">
              {data.locations.find((l) => l.id === dropLocation)?.name || "Not specified"}
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
{showLocationPopup && renderLocationPopup()}
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
    currency="₹"
    onPaymentSuccess={handlePaymentSuccess}
    onPaymentFailure={handlePaymentFailure}
    customerDetails={{
      name: addressForm.name || "Customer",
      phone: addressForm.phone || "9901341763",
    }}
    description="Ambulance Equipment Payment"
    allowedMethods={["card", "upi", "wallet", "netbanking"]}
    theme={{
      primaryColor: "#0E1630",
      accentColor: "#01D48C",
      surfaceColor: "#FFFFFF",
    }}
  />

  {showLocationPopup && renderLocationPopup()}

  <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
    <div className="px-6 py-4 flex justify-between items-center bg-gray-800">
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#01B07A", color: "white" }}
        >
          <Lucide.Ambulance size={24} />
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
style={{ backgroundColor: "var(--accent-color)" }}
className="px-4 py-2 text-white rounded-lg hover:brightness-90 flex items-center gap-2"

>
<Lucide.MapPin size={20} />
<span>Near By Ambulance</span>
</button>

    </div>

  <div className="px-6 py-4 border-b border-gray-200">
<div className="flex justify-center items-center w-full max-w-md mx-auto"> {["Details", "Confirm"].map((stepName, index) => ( <React.Fragment key={index}> <div className="flex flex-col items-center"> <div className={`flex items-center justify-center w-10 h-10 rounded-full mb-2 transition-all ${ step === index || step > index ? "text-white shadow-lg" : "bg-gray-200 text-gray-600 border border-gray-300" }`} style={ step === index || step > index ? { backgroundColor: "var(--accent-color)" } : {} } > {step > index ? ( <Lucide.CheckCircle2 size={20} /> ) : ( <span className="font-semibold">{index + 1}</span> )} </div>

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
        className={`flex-1 h-1 mx-4 mb-6 rounded transition-colors`}
        style={
          step > index
            ? { backgroundColor: "var(--accent-color)" }
            : { backgroundColor: "#D1D5DB" } // Tailwind gray-300 fallback
        }
      />
    )}
  </React.Fragment>
))}
</div> </div>

    <div className="px-6 py-6">{renderStep()}</div>

    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
      {step > 0 && (
        <button
          onClick={() => setStep((prev) => prev - 1)}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Back
        </button>
      )}
      <div className={`flex gap-3 ${step === 0 ? "ml-auto" : ""}`}>
        {step === 1 ? (
          <>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Submit Booking
            </button>
            {calculateEquipmentTotal() > 0 && (
              <button
                onClick={handlePayNow}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Lucide.CreditCard size={16} /> Pay Now ₹
                {calculateEquipmentTotal()}
              </button>
            )}
          </>
        ) : (
          <button
            onClick={() => setStep((prev) => prev + 1)}
            disabled={!type || !cat || !pickup}
            className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 ${
              !type || !cat || !pickup
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
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