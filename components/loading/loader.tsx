'use client'

import React, { useState, useEffect } from 'react';

const Loader = () => {

  const [progress, setProgress] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  const loadingMessages = [
    "We're building it ready for you",
    "Adding some magic touches",
    "Making final adjustments",
    "Almost there...",
    "Okay here we gooo!"
  ];

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setIsLoading(false);
            setTimeout(() => setShowContent(true), 300);
          }, 500);
          return 100;
        }
        return prev + Math.random() * 3 + 1;
      });
    }, 100);

    // Change messages based on progress
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(prev => {
        const progressThresholds = [0, 20, 40, 60, 85];
        for (let i = progressThresholds.length - 1; i >= 0; i--) {
          if (progress >= progressThresholds[i]) {
            return i;
          }
        }
        return 0;
      });
    }, 50);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [progress]);



  return (
    <div>

      <div className=" mt-[25%] text-center text-lg text-[#FFF]">

        {/* Progress bar */}
        <div className="w-80 mx-auto mb-4">
          <div className="bg-[#007EFF]  rounded-full h-2 backdrop-blur-sm">
            <div
              className="bg-[#FFFF] h-2 rounded-full transition-all duration-600 ease-in"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Percentage */}
        <div className="text-lg">
          {/* {Math.round(progress)}% */}
          <p>
            Loading messages....
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.1); }
          50% { transform: scale(1.2); }
          75% { transform: scale(1.1); }
        }
        
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-heartbeat {
          animation: heartbeat 1.5s ease-in-out infinite;
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Loader