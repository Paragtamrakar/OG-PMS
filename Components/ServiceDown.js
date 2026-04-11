import React from 'react';

export default function App() {
  return (
    <>
      {/* Inline styles for smooth, staggered Apple-like entrance animations.
        In a full Next.js project, you could move these to your global.css 
        or tailwind.config.js, but keeping them here ensures this component 
        is completely plug-and-play.
      */}
      <style>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
      `}</style>

      <div className="min-h-screen w-full flex items-center justify-center bg-[#FAFAFA] text-gray-900 p-4 sm:p-6 md:p-8 font-sans antialiased selection:bg-red-100 selection:text-red-900">
        
        {/* Main Card Container */}
        <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 sm:p-10 md:p-12 overflow-hidden">
          
          {/* Subtle Red Top Accent Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-red-500 opacity-80" />

          {/* Status Badge */}
          <div className="animate-slide-up flex items-center justify-start mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold tracking-wide uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Pending Settlement
            </span>
          </div>

          {/* Icon & Header Section */}
          <div className="animate-slide-up delay-100 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-red-50 text-red-500 border border-red-100 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                  <path d="M12 9v4"/>
                  <path d="M12 17h.01"/>
                </svg>
              </div>
              <h1 className="text-6xl sm:text-7xl font-bold tracking-tighter text-gray-900">
                503
              </h1>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-800">
              Service Temporarily Unavailable
            </h2>
          </div>

          {/* Message Content */}
          <div className="animate-slide-up delay-200 mb-10">
            <p className="text-base sm:text-lg text-gray-500 leading-relaxed max-w-sm">
              This service has been temporarily paused due to a pending settlement. 
              Please contact your developer to restore access.
            </p>
          </div>

          {/* Action Button */}
          <div className="animate-slide-up delay-300">
            <p
             
              className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all duration-200 ease-out active:scale-[0.98] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 shadow-sm hover:shadow-md"
            >
              Contact Developer
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
              >
                <path d="M5 12h14"/>
                <path d="m12 5 7 7-7 7"/>
              </svg>
            </p>
          </div>

        </div>
      </div>
    </>
  );
}