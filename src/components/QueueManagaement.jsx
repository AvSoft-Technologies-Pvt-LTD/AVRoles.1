import React, { useState, useEffect } from 'react';
import { Users, Clock, AlertCircle, CheckCircle, XCircle, MessageSquare, RotateCcw, UserCheck, Pause, Play, Bell, Activity, Filter, X, Volume2 } from 'lucide-react';
const TOKENS_KEY = 'hospital_tokens';
const QueueManagement = ({ tokens, onTokensUpdate }) => {
  const [allTokens, setAllTokens] = useState(tokens || []);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ department: '', status: '', priority: '' });
  const [queueStats, setQueueStats] = useState({});
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  useEffect(() => {
    if (tokens && tokens.length > 0) setAllTokens(tokens);
    else {
      const stored = localStorage.getItem(TOKENS_KEY);
      if (stored) {
        try { setAllTokens(JSON.parse(stored).map(t => ({ ...t, generatedAt: new Date(t.generatedAt) }))); }
        catch { setAllTokens([]); }
      } else setAllTokens([]);
    }
  }, [tokens]);
  const announcePatient = (token) => {
    if (!voiceEnabled) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`Token ${token.tokenNumber}, ${token.patientName}, please come inside`);
      utterance.rate = 0.8; utterance.pitch = 1; utterance.volume = 1;
      const voices = window.speechSynthesis.getVoices();
      utterance.voice = voices.find(v => v.lang === 'en-IN') || voices.find(v => v.lang.includes('en'));
      window.speechSynthesis.speak(utterance);
    }
  };
  useEffect(() => {
    const now = new Date();
    const todayTokens = allTokens.filter(token => new Date(token.generatedAt).toDateString() === now.toDateString());
    const stats = {
      total: todayTokens.length,
      waiting: todayTokens.filter(t => t.status === 'waiting').length,
      called: todayTokens.filter(t => t.status === 'called').length,
      completed: todayTokens.filter(t => t.status === 'completed').length,
      cancelled: todayTokens.filter(t => t.status === 'cancelled').length,
      emergency: todayTokens.filter(t => t.priority === 'emergency').length,
      normal: todayTokens.filter(t => t.priority === 'normal').length,
      avgWaitTime: calculateAverageWaitTime(todayTokens),
      peakHour: calculatePeakHour(todayTokens)
    };
    setQueueStats(stats);
  }, [allTokens]);
  const calculateAverageWaitTime = (tokens) => {
    const completed = tokens.filter(t => t.status === 'completed');
    if (completed.length === 0) return '0 min';
    const total = completed.reduce((acc, t) => acc + (new Date().getTime() - new Date(t.generatedAt).getTime()), 0);
    return `${Math.round(total / completed.length / 60000)} min`;
  };
  const calculatePeakHour = (tokens) => {
    const hours = {};
    tokens.forEach(t => { const hr = new Date(t.generatedAt).getHours(); hours[hr] = (hours[hr] || 0) + 1; });
    const peak = Object.entries(hours).reduce((a, b) => a[1] > b[1] ? a : b, ['0', 0]);
    return `${peak[0]}:00`;
  };
  const handleStatusChange = (tokenId, newStatus) => {
    const updated = allTokens.map(t => t.id === tokenId ? { ...t, status: newStatus } : t), token = updated.find(t => t.id === tokenId);
    setAllTokens(updated), localStorage.setItem(TOKENS_KEY, JSON.stringify(updated)), onTokensUpdate && onTokensUpdate(updated), newStatus === 'called' && token && setTimeout(() => announcePatient(token), 200);
  };
  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const clearFilter = (key) => setFilters(prev => ({ ...prev, [key]: '' }));
  const filteredTokens = allTokens.filter(token => {
    const matchesSearch = Object.values(token).some(val => val?.toString().toLowerCase().includes(search.toLowerCase()));
    const matchesFilters = Object.entries(filters).every(([key, value]) => !value || token[key] === value);
    return matchesSearch && matchesFilters;
  });
  const departments = [
    { value: 'general', label: 'General Medicine' }, { value: 'cardiology', label: 'Cardiology' }, { value: 'orthopedic', label: 'Orthopedic' }, { value: 'pediatrics', label: 'Pediatrics' }, { value: 'gynecology', label: 'Gynecology' }, { value: 'emergency', label: 'Emergency' }, { value: 'dermatology', label: 'Dermatology' }, { value: 'neurology', label: 'Neurology' }
  ];
  const statusOptions = [
    { value: 'waiting', label: 'Waiting' }, { value: 'called', label: 'Called' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }
  ];
  const priorityOptions = [
    { value: 'normal', label: 'Normal' }, { value: 'emergency', label: 'Emergency' }
  ];
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="h3-heading">Queue Management System</h1>
            <p className="paragraph mt-2">Manage and monitor patient queue status</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Voice Announcements:</label>
              <button onClick={() => setVoiceEnabled(!voiceEnabled)} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${voiceEnabled ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                <Volume2 size={16} />{voiceEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="card-stat card-border-primary">
            <div className="flex items-center justify-between">
              <div>
                <div className="card-stat-label">Total Today</div>
                <div className="card-stat-count">{queueStats.total || 0}</div>
              </div>
              <Users className="text-[var(--primary-color)]" size={24} />
            </div>
          </div>
          <div className="card-stat card-border-accent">
            <div className="flex items-center justify-between">
              <div>
                <div className="card-stat-label">Waiting</div>
                <div className="card-stat-count">{queueStats.waiting || 0}</div>
              </div>
              <Clock className="text-[var(--accent-color)]" size={24} />
            </div>
          </div>
          <div className="card-stat card-border-primary">
            <div className="flex items-center justify-between">
              <div>
                <div className="card-stat-label">Called</div>
                <div className="card-stat-count">{queueStats.called || 0}</div>
              </div>
              <Bell className="text-blue-500" size={24} />
            </div>
          </div>
          <div className="card-stat card-border-accent">
            <div className="flex items-center justify-between">
              <div>
                <div className="card-stat-label">Completed</div>
                <div className="card-stat-count">{queueStats.completed || 0}</div>
              </div>
              <CheckCircle className="text-green-500" size={24} />
            </div>
          </div>
          <div className="card-stat card-border-primary">
            <div className="flex items-center justify-between">
              <div>
                <div className="card-stat-label">Emergency</div>
                <div className="card-stat-count">{queueStats.emergency || 0}</div>
              </div>
              <AlertCircle className="text-red-500" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="h3-heading mb-4">Token Queue</h3>
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center">
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tokens, patients, departments..." className="input-field w-64" />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-[var(--primary-color)] text-base" />Department:
                <select value={filters.department} onChange={(e) => handleFilterChange('department', e.target.value)} className="input-field w-40">
                  <option value="">All</option>
                  {departments.map((dept) => (<option key={dept.value} value={dept.value}>{dept.label}</option>))}
                </select>
                {filters.department && (<button onClick={() => clearFilter('department')} className="text-red-500 hover:text-red-700" title="Clear filter"><X size={16} /></button>)}
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-[var(--primary-color)] text-base" />Status:
                <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="input-field w-32">
                  <option value="">All</option>
                  {statusOptions.map((status) => (<option key={status.value} value={status.value}>{status.label}</option>))}
                </select>
                {filters.status && (<button onClick={() => clearFilter('status')} className="text-red-500 hover:text-red-700" title="Clear filter"><X size={16} /></button>)}
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-[var(--primary-color)] text-base" />Priority:
                <select value={filters.priority} onChange={(e) => handleFilterChange('priority', e.target.value)} className="input-field w-32">
                  <option value="">All</option>
                  {priorityOptions.map((priority) => (<option key={priority.value} value={priority.value}>{priority.label}</option>))}
                </select>
                {filters.priority && (<button onClick={() => clearFilter('priority')} className="text-red-500 hover:text-red-700" title="Clear filter"><X size={16} /></button>)}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="table-container w-full">
              <thead>
                <tr className="table-head text-left">
                  <th className="px-4 py-3">Token</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Assigned Doctor</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Generated At</th>
                  <th className="px-4 py-3">Reason</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredTokens.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No tokens found matching your criteria</td>
                  </tr>
                ) : (
                  filteredTokens.map((token) => (
                    <tr key={token.id} className="border-t hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3"><span className="font-bold text-[var(--primary-color)]">{token.tokenNumber}</span></td>
                      <td className="px-4 py-3"><div><div className="font-medium">{token.patientName}</div><div className="text-xs text-gray-500">{token.phoneNumber}</div></div></td>
                      <td className="px-4 py-3"><span className="capitalize">{departments.find(d => d.value === token.department)?.label || token.department}</span></td>
                      <td className="px-4 py-3"><span className="text-sm text-gray-700">{token.doctorName || '-'}</span></td>
                      <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${token.priority === 'emergency' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{token.priority}</span></td>
                      <td className="px-4 py-3">
                        <select value={token.status} onChange={(e) => handleStatusChange(token.id, e.target.value)} className={`border rounded px-2 py-1 text-sm font-medium ${token.status === 'waiting' ? 'border-yellow-300 bg-yellow-50 text-yellow-800' : token.status === 'called' ? 'border-blue-300 bg-blue-50 text-blue-800' : token.status === 'completed' ? 'border-green-300 bg-green-50 text-green-800' : 'border-red-300 bg-red-50 text-red-800'}`}>
                          <option value="waiting">Waiting</option>
                          <option value="called">Called</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-4 py-3"><div className="text-sm"><div>{new Date(token.generatedAt).toLocaleTimeString()}</div><div className="text-xs text-gray-500">{new Date(token.generatedAt).toLocaleDateString()}</div></div></td>
                      <td className="px-4 py-3"><span className="text-sm text-gray-600 truncate max-w-32 block">{token.reason}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Showing {filteredTokens.length} of {allTokens.length} tokens</span>
              <div className="flex items-center gap-4">
                <span className="text-gray-600">Last updated: {new Date().toLocaleTimeString()}</span>
                {voiceEnabled && (<span className="flex items-center gap-1 text-green-600"><Volume2 size={14} />Voice Active</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default QueueManagement;