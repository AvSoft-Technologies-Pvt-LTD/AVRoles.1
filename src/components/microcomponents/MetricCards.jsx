import React from "react";

const MetricCard = ({ title, value, unit, status = "Normal", icon: Icon, color }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`${color} w-5 h-5`} />
          <span className="text-gray-600 text-sm">{title}</span>
        </div>
        <span className="text-xs text-cyan-600 bg-cyan-50 px-2 py-1 rounded-full">{status}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold">{value}</span>
        <span className="text-gray-500 text-sm">{unit}</span>
      </div>
      <div className="mt-4 h-12">
        <div className="w-full h-1 bg-cyan-100 rounded-full overflow-hidden">
          <div className="w-2/3 h-full bg-cyan-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
