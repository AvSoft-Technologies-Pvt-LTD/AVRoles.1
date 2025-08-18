import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../../../context-api/cartSlice';
import axios from 'axios';
import { ShoppingCart, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const performSearch = data => !searchQuery.trim() ? data : data.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));
  return { searchQuery, setSearchQuery, performSearch };
};

const LabHome = () => {
  const [activeTab, setActiveTab] = useState('tests');
  const [tests, setTests] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState(new Set());
  const dispatch = useDispatch();
  const cart = useSelector(state => state.cart);
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, performSearch } = useSearch();
  const cartRef = useRef(null);
  const btnRefs = useRef({});
  const MOCK_API_URL = 'https://mocki.io/v1/0aeb8233-e477-46f8-9713-373a90796139';

  useEffect(() => { setLoading(true); axios.get(MOCK_API_URL).then(res => { const data = res.data[activeTab] || []; setTests(performSearch(data)); setPackages(res.data.packages || []); }).finally(() => setLoading(false)); }, [activeTab, searchQuery]);

  const animateFly = sourceEl => {
    if (!sourceEl || !cartRef.current) return;
    const src = sourceEl.getBoundingClientRect();
    const dst = cartRef.current.getBoundingClientRect();
    const clone = sourceEl.cloneNode(true);
    Object.assign(clone.style, { position: 'fixed', top: `${src.top}px`, left: `${src.left}px`, width: `${src.width}px`, height: `${src.height}px`, pointerEvents: 'none', zIndex: 9999, opacity: 1, boxShadow: '0 0 15px rgba(255, 165, 0, 0.7)', borderRadius: '8px', transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1), opacity 1s ease', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' });
    document.body.appendChild(clone);
    const startX = src.left + src.width / 2;
    const startY = src.top + src.height / 2;
    const endX = dst.left + dst.width / 2;
    const endY = dst.top + dst.height / 2;
    clone.animate([{ offset: 0, transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 }, { offset: 0.5, transform: `translate(${(endX - startX) / 2}px, -150px) scale(0.6) rotate(180deg)`, opacity: 0.8 }, { offset: 1, transform: `translate(${endX - startX}px, ${endY - startY}px) scale(0.2) rotate(360deg)`, opacity: 0 }], { duration: 1000, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }).onfinish = () => { clone.remove(); cartRef.current.classList.add('cart-bounce'); setTimeout(() => cartRef.current.classList.remove('cart-bounce'), 400); };
  };

  const handleAdd = (item, key, pushToCart = false) => { if (!addedIds.has(key)) { dispatch(addToCart(item)); animateFly(btnRefs.current[key]); setAddedIds(prev => new Set(prev).add(key)); if (pushToCart) navigate('/patientdashboard/cart'); } };

  const renderButton = (item, prefix, pushToCart = false) => {
    const key = `${prefix}${item.id}`;
    const label = addedIds.has(key) ? 'Added' : pushToCart ? 'Book Now' : 'Add';
    const cls = pushToCart ? 'bg-[var(--primary-color)] text-white hover:bg-[var(--primary-dark)]' : 'bg-gray-200 text-gray-800 hover:bg-gray-300';
    return <button ref={el => (btnRefs.current[key] = el)} className={`${cls} px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors`} onClick={() => handleAdd(item, key, pushToCart)}>{label}</button>;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
          <form className="w-full sm:max-w-xl relative">
            <input type="text" className="w-full pl-10 pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent" placeholder="Search for tests, scans..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            <button disabled className="absolute top-2.5 left-3"><Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" /></button>
          </form>
          <div ref={cartRef} onClick={() => navigate('/patientdashboard/cart')} className="relative cursor-pointer p-2 sm:p-2.5 rounded-full border-2 border-[var(--primary-color)] bg-white shadow-sm hover:shadow-md transition group">
            <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--primary-color)] group-hover:scale-110 transition-transform duration-200" />
            {cart.length > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">{cart.length}</span>}
          </div>
        </div>
        <div className="flex overflow-x-auto pb-1 mb-4 sm:mb-6">{['tests', 'scans'].map(tab => <button key={tab} className={`py-2 px-3 sm:px-4 whitespace-nowrap border-b-2 text-sm sm:text-base font-medium ${activeTab === tab ? 'border-[var(--primary-color)] text-[var(--primary-color)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab(tab)}>{tab[0].toUpperCase() + tab.slice(1)}</button>)}</div>
        <div className="mb-8 sm:mb-12">
          {loading ? <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--primary-color)] mx-auto mb-4"></div><p className="text-gray-600 text-sm sm:text-base">Loading tests...</p></div> :
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tests.map(t => <div key={t.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">{t.title}</h2>
                <p className="text-xs sm:text-sm text-gray-500 mb-1">Code: {t.code}</p>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{t.description}</p>
                <p className="text-[var(--primary-color)] font-bold text-sm sm:text-base">₹{t.price}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => navigate(`/patientdashboard/lab-tests/test/${t.id}`)} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white text-[var(--primary-color)] border border-[var(--primary-color)] rounded-lg text-xs sm:text-sm font-medium hover:bg-[var(--primary-color)] hover:text-white transition-colors">View</button>
                  {renderButton(t, 't')}
                  {renderButton(t, 'tb', true)}
                </div>
              </div>)}
            </div>}
        </div>
        <div className="mt-8 sm:mt-12">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Popular Health Packages</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map(p => <div key={p.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">{p.title}</h3>
                <span className="bg-blue-100 text-[10px] sm:text-xs px-2 py-1 rounded-full text-[var(--primary-color)]">{p.testsCount} Tests</span>
              </div>
              <div className="mb-3">
                <span className="text-[var(--primary-color)] font-bold text-sm sm:text-base">₹{p.price}</span>
                {p.originalPrice && <span className="ml-2 text-xs sm:text-sm text-gray-400 line-through">₹{p.originalPrice}</span>}
              </div>
              {renderButton(p, 'p', true)}
            </div>)}
          </div>
        </div>
      </div>
      <style jsx>{`.cart-bounce { animation: cart-bounce-glow 0.4s ease; } @keyframes cart-bounce-glow { 0%, 100% { transform: scale(1); box-shadow: none; } 50% { transform: scale(1.2); box-shadow: 0 0 10px 3px rgba(255, 165, 0, 0.7); } }`}</style>
    </div>
  );
};

export default LabHome;
