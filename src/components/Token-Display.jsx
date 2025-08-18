import React, { useState, useEffect } from 'react';
import { Monitor, Clock, AlertCircle } from 'lucide-react';

const TOKENS_KEY = 'hospital_tokens';

const DisplayBoard = ({ tokens }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [allTokens, setAllTokens] = useState(tokens || []);

  useEffect(() => {
    if (tokens && tokens.length > 0) {
      setAllTokens(tokens);
    } else {
      const stored = localStorage.getItem(TOKENS_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored).map(t => ({
            ...t,
            generatedAt: new Date(t.generatedAt),
          }));
          setAllTokens(parsed);
        } catch (e) {
          console.error("Failed to parse stored tokens:", e);
          setAllTokens([]);
        }
      } else {
        setAllTokens([]);
      }
    }
  }, [tokens]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter tokens: only waiting (normal + emergency) and called
  const waitingTokens = allTokens.filter(token => token.status === 'waiting');
  const calledTokens = allTokens.filter(token => token.status === 'called').slice(0, 3);
  const displayTokens = [...waitingTokens, ...calledTokens];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0E1630] to-[#1a2847] text-white p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-[var(--accent-color)]">
          Hospital Queue Management
        </h1>
        <div className="flex items-center justify-center gap-2 sm:gap-4 text-lg sm:text-xl">
          <Clock size={20} className="sm:size-6" />
          <span>{currentTime.toLocaleTimeString()}</span>
          <span className="mx-2 sm:mx-4">|</span>
          <span>{currentTime.toLocaleDateString()}</span>
        </div>
      </div>

      {/* Table for Waiting and Called Tokens */}
      <div className="max-w-6xl mx-auto bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-[var(--accent-color)]">
          Waiting and Recently Called Tokens
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white/5 rounded-lg overflow-hidden">
            <thead className="bg-white/10">
              <tr>
                <th className="py-2 px-4 text-left text-sm sm:text-base font-medium">Token Number</th>
                <th className="py-2 px-4 text-left text-sm sm:text-base font-medium">Patient Name</th>
                <th className="py-2 px-4 text-left text-sm sm:text-base font-medium">Department</th>
                <th className="py-2 px-4 text-left text-sm sm:text-base font-medium">Doctor</th>
                <th className="py-2 px-4 text-left text-sm sm:text-base font-medium">Priority</th>
                <th className="py-2 px-4 text-left text-sm sm:text-base font-medium">Status</th>
                <th className="py-2 px-4 text-left text-sm sm:text-base font-medium">Estimated Time</th>
              </tr>
            </thead>
            <tbody>
              {displayTokens.map((token) => (
                <tr key={token.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="py-2 px-4 text-sm sm:text-base">{token.tokenNumber}</td>
                  <td className="py-2 px-4 text-sm sm:text-base">{token.patientName}</td>
                  <td className="py-2 px-4 text-sm sm:text-base">{token.department}</td>
                  <td className="py-2 px-4 text-sm sm:text-base">{token.doctorName}</td>
                  <td className="py-2 px-4 text-sm sm:text-base">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      token.priority === 'emergency' ? 'bg-red-500' : 'bg-green-500'
                    }`}>
                      <AlertCircle size={12} />
                      {token.priority}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-sm sm:text-base">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      token.status === 'called' ? 'bg-blue-500' : 'bg-gray-500'
                    }`}>
                      {token.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-sm sm:text-base">{token.estimatedTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DisplayBoard;