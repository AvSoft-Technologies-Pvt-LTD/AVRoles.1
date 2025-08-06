import React, { useState, useEffect } from 'react';
import { Monitor, Volume2, Clock, AlertCircle } from 'lucide-react';

const TOKENS_KEY = 'hospital_tokens';

const DisplayBoard = ({ tokens }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [allTokens, setAllTokens] = useState(tokens || []);

  // On mount or when tokens prop changes, load from localStorage if no tokens prop
  useEffect(() => {
    if (tokens && tokens.length > 0) {
      setAllTokens(tokens);
    } else {
      const stored = localStorage.getItem(TOKENS_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored).map(t => ({ ...t, generatedAt: new Date(t.generatedAt) }));
          setAllTokens(parsed);
        } catch {
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

  const calledTokens = (allTokens || []).filter(token => token.status === 'called').slice(0, 3);
  const emergencyWaitingTokens = (allTokens || []).filter(token => token.status === 'waiting' && token.priority === 'emergency');
  const normalWaitingTokens = (allTokens || []).filter(token => token.status === 'waiting' && token.priority === 'normal');
  // No urgent priority used

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0E1630] to-[#1a2847] text-white p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 text-[var(--accent-color)]">
          Hospital Queue Management
        </h1>
        <div className="flex items-center justify-center gap-4 text-xl">
          <Clock size={24} />
          <span>{currentTime.toLocaleTimeString()}</span>
          <span className="mx-4">|</span>
          <span>{currentTime.toLocaleDateString()}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Recently Called - Horizontal Row */}
        <div className="flex-1">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-8">
            <h3 className="text-2xl font-bold mb-6 text-[var(--accent-color)] flex items-center gap-3">
              <Monitor size={28} /> Recently Called
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-center">
              {calledTokens.length > 0 ? (
                calledTokens.map(token => (
                  <div key={token.id} className="space-y-4 bg-white/10 rounded-xl p-6 border border-white/20 text-center">
                    <div className="text-6xl font-black text-[var(--accent-color)] animate-pulse">{token.tokenNumber}</div>
                    <div className="text-xl font-semibold">{token.patientName}</div>
                    <div className="text-md text-gray-300">{token.department}- {token.doctorName}</div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${token.priority === 'emergency' ? 'bg-red-500' : 'bg-green-500'}`}>
                      <AlertCircle size={16} />
                      {token.priority === 'emergency' ? 'EMERGENCY' : 'NORMAL'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-4xl font-bold text-gray-400">No tokens called yet.</div>
              )}
            </div>
          </div>
        </div>
        {/* Emergency & Normal Waiting List - Right Side */}
        <div className="w-full lg:w-96 flex-shrink-0 space-y-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold mb-4 text-red-500">Emergency Waiting ({emergencyWaitingTokens.length})</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {emergencyWaitingTokens.length > 0 ? emergencyWaitingTokens.map((token, index) => (
                <div key={token.id} className={`p-4 rounded-lg border ${index === 0 ? 'bg-red-100/20 border-red-400/50' : 'bg-white/10 border-white/20'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-red-500">{token.tokenNumber}</span>
                      <div>
                        <div className="font-medium">{token.patientName}</div>
                        <div className="text-sm text-gray-300">{token.department}</div>
                      </div>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">Est. Time: {token.estimatedTime}</div>
                </div>
              )) : (
                <div className="text-center text-gray-400">No emergency waiting tokens.</div>
              )}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold mb-4 text-green-500">Normal Waiting ({normalWaitingTokens.length})</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {normalWaitingTokens.length > 0 ? normalWaitingTokens.map((token, index) => (
                <div key={token.id} className={`p-4 rounded-lg border ${index === 0 ? 'bg-green-100/20 border-green-400/50' : 'bg-white/10 border-white/20'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-green-500">{token.tokenNumber}</span>
                      <div>
                        <div className="font-medium">{token.patientName}</div>
                        <div className="text-sm text-gray-300">{token.department}</div>
                      </div>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">Est. Time: {token.estimatedTime}</div>
                </div>
              )) : (
                <div className="text-center text-gray-400">No normal waiting tokens.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayBoard;