import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import axios from 'axios';
import { addToCart } from '../../../../context-api/cartSlice';
import { FaClock, FaFlask, FaStar, FaCheck, FaFileMedicalAlt, FaMicroscope, FaArrowLeft } from 'react-icons/fa';

const TestDetail = () => {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const navigate = useNavigate();
  const iconColor = "text-[var(--primary-color)]";

  useEffect(() => { axios.get('https://mocki.io/v1/819026ae-4da2-46a6-9acb-2e9e2c99e019').then((res) => { const found = Array.isArray(res.data) ? res.data.find((i) => i.id.toString() === id) : null; setTest(found); }).catch((err) => console.error('API Error:', err)); }, [id]);

  if (!test) return <div className="min-h-screen flex items-center justify-center p-4"><div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--primary-color)] mx-auto mb-4"></div><p className="text-gray-600 text-sm sm:text-base">Loading test details...</p></div></div>;

  return (
    <div className="min-h-screen  py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <button onClick={() => window.history.back()} className="text-[var(--primary-color)] flex items-center gap-1 text-sm sm:text-base"><FaArrowLeft className={`${iconColor} h-4 w-4 sm:h-5 sm:w-5`} />Back</button>
          <div className="relative cursor-pointer flex items-center text-gray-700 hover:text-[var(--primary-color)]" onClick={() => navigate('/patientdashboard/cart')}><ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 mr-1" /><span className="hidden sm:inline">Cart</span>{cart.length > 0 && <span className="absolute -top-2 -right-2 bg-[var(--primary-color)] text-white text-[10px] sm:text-xs w-5 h-5 flex items-center justify-center rounded-full">{cart.length}</span>}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2"><FaFileMedicalAlt className={`${iconColor} h-5 w-5 sm:h-6 sm:w-6`} />{test.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mb-4"><p className="text-xs sm:text-sm text-gray-500">Code: {test.code}</p><span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-[10px] sm:text-xs rounded">{test.category}</span></div>
          <p className="text-sm sm:text-base text-gray-600 mb-4">{test.description}</p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="mb-3 sm:mb-0"><p className="text-lg sm:text-xl font-semibold text-[var(--primary-color)]">₹{test.price}</p>{test.originalPrice && <p className="text-sm sm:text-base line-through text-gray-400">₹{test.originalPrice}</p>}</div>
            <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[var(--primary-color)] text-white rounded-lg text-sm sm:text-base font-medium hover:bg-[var(--primary-dark)] transition-colors" onClick={() => dispatch(addToCart(test))}>Add to Cart</button>
          </div>
          <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-3 sm:space-y-0 text-sm text-gray-600">
            <div className="flex items-center gap-1.5"><FaClock className={`${iconColor} h-4 w-4`} /><span>Report: {test.reportTime || '24 hours'}</span></div>
            <div className="flex items-center gap-1.5"><FaFlask className={`${iconColor} h-4 w-4`} /><span>{test.fasting ? 'Fasting required' : 'No fasting required'}</span></div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
            <div className="mb-3 sm:mb-0">
              <p className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Find the best labs for {test.title}</p>
              <p className="text-xs sm:text-sm text-gray-600">Compare prices, check availability, and book appointments.</p>
            </div>
            <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-200 text-gray-800 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-300 transition-colors" onClick={() => navigate(`/patientdashboard/available-labs/${test.id}`, { state: { test } })}>View Available Labs</button>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2"><FaMicroscope className={`${iconColor} h-5 w-5 sm:h-6 sm:w-6`} />About {test.title}</h2>
          <div className="space-y-3">
            <p className="flex items-start gap-2 text-sm sm:text-base"><FaCheck className={`${iconColor} h-4 w-4 mt-0.5`} /><span><strong>What is it?</strong> {test.about}</span></p>
            <p className="flex items-start gap-2 text-sm sm:text-base"><FaCheck className={`${iconColor} h-4 w-4 mt-0.5`} /><span><strong>Why is it done?</strong> {test.why}</span></p>
            <p className="flex items-start gap-2 text-sm sm:text-base"><FaCheck className={`${iconColor} h-4 w-4 mt-0.5`} /><span><strong>Preparation Required:</strong> {test.fasting ? 'Fasting required' : 'No fasting required'}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDetail;
