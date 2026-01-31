"use client";
import { useState } from "react";
import FarmViewLanding from "./FarmViewLanding";
import FarmMonitor3D from "./FarmMonitor3D";
// import DroneView from "./DroneView"; // You'll create this later

export default function FarmViewPage() {
  const [currentView, setCurrentView] = useState("landing"); // "landing", "3d", "drone"

  const renderView = () => {
    switch (currentView) {
      case "landing":
        return (
          <FarmViewLanding
            on3DViewClick={() => setCurrentView("3d")}
            onDroneViewClick={() => setCurrentView("drone")}
          />
        );
      case "3d":
        return <FarmMonitor3D onBack={() => setCurrentView("landing")} />;
      case "drone":
        // When you create the drone view component, uncomment this:
        // return <DroneView onBack={() => setCurrentView("landing")} />;
        
        // Temporary placeholder for drone view
        return (
          <div className="w-screen h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">
                Drone View Coming Soon
              </h1>
              <button
                onClick={() => setCurrentView("landing")}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-300"
              >
                Back to Selection
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return <>{renderView()}</>;
}