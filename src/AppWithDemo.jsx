import React, { useState } from 'react';
import App from './App';
import NepaliConverterPreview from './components/NepaliConverterPreview';

function MainApp() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <>
      {/* Demo Toggle Button - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setShowDemo(!showDemo)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-lg"
        >
          {showDemo ? '← Back to Letter Generator' : 'View Converter Demo →'}
        </button>
      </div>

      {/* Content */}
      {showDemo ? <NepaliConverterPreview /> : <App />}
    </>
  );
}

export default MainApp;
