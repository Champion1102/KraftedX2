import React from 'react';

const History = ({ history, clearHistory, deleteHistoryItem, useCalculation, onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="max-w-md mx-auto bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <button 
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-gray-800">Calculation History</h2>
          </div>
          {history.length > 0 && (
            <button 
              onClick={clearHistory}
              className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        <div className="space-y-3">
          {history.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No calculations yet</p>
          ) : (
            history.map(entry => (
              <div 
                key={entry.id} 
                className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">
                      {entry.calculation} = {entry.result}
                    </p>
                    <p className="text-gray-500 text-sm">{entry.timestamp}</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => useCalculation(entry.result)}
                      className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                    >
                      Use
                    </button>
                    <button 
                      onClick={() => deleteHistoryItem(entry.id)}
                      className="text-red-500 hover:text-red-600 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
