"use client";
import { useState } from "react";
import FarmViewLanding from "./FarmViewLanding";
import FarmMonitor3D from "./FarmMonitor3D";
import DroneView from "./DroneView";
import SatelliteView from "./SatelliteView";

export default function FarmViewPage() {
  const [currentView, setCurrentView] = useState("landing"); // "landing", "3d", "drone", "satellite"

  const renderView = () => {
    switch (currentView) {
      case "landing":
        return (
          <FarmViewLanding
            on3DViewClick={() => setCurrentView("3d")}
            onDroneViewClick={() => setCurrentView("drone")}
            onSatelliteViewClick={() => setCurrentView("satellite")}
          />
        );
      case "3d":
        return <FarmMonitor3D onBack={() => setCurrentView("landing")} />;
      case "drone":
        return <DroneView onBack={() => setCurrentView("landing")} />;
      case "satellite":
        return <SatelliteView onBack={() => setCurrentView("landing")} />;
      default:
        return null;
    }
  };

  return <>{renderView()}</>;
}