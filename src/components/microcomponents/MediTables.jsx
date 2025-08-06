import React, { useState } from "react";

const MedicalRecords = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(Object.keys(tabs)[0]);

  const statusColors = {
    Active: "bg-green-200 text-green-800",
    Pending: "bg-yellow-200 text-yellow-800",
    Completed: "bg-blue-200 text-blue-800",
    Canceled: "bg-red-200 text-red-800",
    Ongoing: "bg-purple-200 text-purple-400",
    All: "bg-gray-300 text-gray-800",
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6">
      {/* Tabs Navigation */}
      <div className="flex pb-2 space-x-4">
        {Object.keys(tabs).map((tab) => (
          <button
            key={tab}
            className={`py-2 px-5 text-sm font-medium transition-all duration-300 rounded-t-lg ${
              activeTab === tab
                ? "border-b-4 border-cyan-600 text-cyan-600 font-semibold"
                : "text-gray-500 hover:text-cyan-600"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tabs[tab].label}
          </button>
        ))}
      </div>

      {/* Table Content */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full rounded-lg shadow-sm">
          <thead>
            <tr className="bg-cyan-600 text-white text-sm uppercase tracking-wide">
              {tabs[activeTab].columns.map((col, index) => (
                <th key={index} className="p-3 text-left">{col.label}</th>
              ))}
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tabs[activeTab].data.length > 0 ? (
              tabs[activeTab].data.map((row, rowIndex) => (
                <tr key={rowIndex} className={`${rowIndex % 2 === 0 ? "bg-cyan-50" : "bg-white"}`}>
                  {tabs[activeTab].columns.map((col, colIndex) => (
                    <td key={colIndex} className="p-3 text-gray-900">
                      {col.key === "status" ? (
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            statusColors[row[col.key]] || "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {row[col.key]}
                        </span>
                      ) : (
                        row[col.key]
                      )}
                    </td>
                  ))}
                  <td className="p-3">
                    <button className="bg-cyan-600 text-white px-4 py-1 rounded-md text-sm font-medium shadow hover:bg-cyan-700 transition-all">
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={tabs[activeTab].columns.length + 1}
                  className="text-center p-6 text-gray-500"
                >
                  No records available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MedicalRecords;
