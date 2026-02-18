"use client";
import { useState, useEffect } from "react";
import {
  Camera,
  Signal,
  Wifi,
  WifiOff,
  RefreshCw,
  ArrowLeft,
  Maximize2,
  Radio,
  Activity,
} from "lucide-react";

export default function DroneView({ onBack }) {
  const [isLive, setIsLive] = useState(true);
  const [streamError, setStreamError] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [viewMode, setViewMode] = useState("normal"); // normal, fullscreen
  const [droneStats, setDroneStats] = useState({
    altitude: 125,
    battery: 87,
    signalStrength: 92,
    temperature: 24,
  });

  const [sprayActive, setSprayActive] = useState(false);
  const [sprayLoading, setSprayLoading] = useState(false);

  // ESP32-CAM stream URL
  const ESP32_IP = "10.189.120.55"; // Your ESP32 IP
  const SPRAY_CONTROL_IP = "10.189.120.218"; // Spray control ESP32
  const STREAM_PATHS = [
    `http://${ESP32_IP}/stream`,      // Most common ESP32-CAM path (port 80)
    `http://${ESP32_IP}:81/stream`,   // Alternative port 81
    `http://${ESP32_IP}/`,            // Root path
    `http://${ESP32_IP}:81/`,         // Root with port 81
  ];
  
  const [streamUrl, setStreamUrl] = useState(STREAM_PATHS[0]);
  const [streamAttempt, setStreamAttempt] = useState(0);
  const [useIframe, setUseIframe] = useState(false);

  useEffect(() => {
    // Simulate drone stats updates
    const interval = setInterval(() => {
      setDroneStats((prev) => ({
        altitude: prev.altitude + (Math.random() - 0.5) * 5,
        battery: Math.max(0, prev.battery - 0.1),
        signalStrength: 85 + Math.random() * 15,
        temperature: 22 + Math.random() * 4,
      }));
      setLastUpdate(new Date());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    console.log("Refreshing stream from:", streamUrl);
    setStreamError(false);
    setLastUpdate(new Date());
    
    // Force reload the stream with cache busting
    const img = document.getElementById("drone-stream");
    if (img) {
      const cacheBuster = "?t=" + new Date().getTime();
      img.src = streamUrl + cacheBuster;
      console.log("Loading stream:", streamUrl + cacheBuster);
    }
  };

  const tryNextStreamUrl = () => {
    const nextAttempt = (streamAttempt + 1) % STREAM_PATHS.length;
    setStreamAttempt(nextAttempt);
    setStreamUrl(STREAM_PATHS[nextAttempt]);
    setStreamError(false);
    setUseIframe(false);
    console.log("Trying next stream URL:", STREAM_PATHS[nextAttempt]);
  };

  const toggleIframeMode = () => {
    setUseIframe(!useIframe);
    setStreamError(false);
    console.log("Toggling iframe mode:", !useIframe);
  };

const handleSprayControl = async (action) => {
  setSprayLoading(true);
  try {
    const posValue = action === 'on' ? '90' : '0';
    
    // ✅ FIXED: Use GET method with /servo endpoint
    const response = await fetch(`http://${SPRAY_CONTROL_IP}/servo?pos=${posValue}`, {
      method: 'GET',  // Changed from POST to GET
      // No headers or body needed for GET
    });
    
    if (response.ok) {
      setSprayActive(action === 'on');
      console.log(`Spray turned ${action} (pos=${posValue})`);
    } else {
      console.error('Failed to control spray:', response.status);
      alert(`Failed to turn spray ${action}. Check connection.`);
    }
  } catch (error) {
    console.error('Error controlling spray:', error);
    alert(`Error: Unable to connect to spray controller at ${SPRAY_CONTROL_IP}\n${error.message}`);
  } finally {
    setSprayLoading(false);
  }
};
  return (
    <div className="w-screen h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-950 flex overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Sidebar */}
      <div className="w-96 bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl border-r border-emerald-500/20 p-6 flex flex-col gap-6 z-10 overflow-y-auto">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300 mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to View Selection</span>
          </button>
        )}

        {/* Connection Status */}
        <div
          className={`backdrop-blur-xl rounded-2xl p-5 border transition-all duration-300 ${
            isLive && !streamError
              ? "bg-gradient-to-br from-emerald-900/20 to-green-900/20 border-emerald-500/30"
              : "bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-500/30"
          }`}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              {isLive && !streamError ? (
                <Wifi className="w-5 h-5 text-emerald-400" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-400" />
              )}
              <span
                className={`text-base font-semibold ${
                  isLive && !streamError ? "text-emerald-300" : "text-red-300"
                }`}
              >
                {isLive && !streamError ? "Drone Connected" : "Connection Lost"}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              className="p-2 bg-gray-700/50 hover:bg-gray-700/70 rounded-lg transition-all duration-300"
              title="Refresh stream"
            >
              <RefreshCw className="w-4 h-4 text-gray-300" />
            </button>
          </div>

          {/* Live Indicator */}
          {isLive && !streamError && (
            <div className="flex items-center gap-2 mb-4">
              <div className="relative">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
              </div>
              <span className="text-sm font-semibold text-red-400 tracking-wider">
                LIVE STREAMING
              </span>
            </div>
          )}

          {/* Drone Stats */}
          <div className="space-y-3">
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-emerald-500/15 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-gray-400">Altitude</span>
                </div>
                <span className="text-lg font-bold text-white">
                  {droneStats.altitude.toFixed(1)}
                  <span className="text-xs text-gray-500 ml-1">m</span>
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-emerald-500/15 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Signal className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-gray-400">Signal Strength</span>
                </div>
                <span className="text-lg font-bold text-white">
                  {droneStats.signalStrength.toFixed(0)}
                  <span className="text-xs text-gray-500 ml-1">%</span>
                </span>
              </div>
              <div className="h-1.5 bg-gray-700/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500"
                  style={{ width: `${droneStats.signalStrength}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-emerald-500/15 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-gray-400">Battery</span>
                </div>
                <span className="text-lg font-bold text-white">
                  {droneStats.battery.toFixed(0)}
                  <span className="text-xs text-gray-500 ml-1">%</span>
                </span>
              </div>
              <div className="h-1.5 bg-gray-700/30 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    droneStats.battery > 50
                      ? "bg-gradient-to-r from-emerald-500 to-green-400"
                      : droneStats.battery > 20
                      ? "bg-gradient-to-r from-orange-500 to-yellow-400"
                      : "bg-gradient-to-r from-red-500 to-orange-400"
                  }`}
                  style={{ width: `${droneStats.battery}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 text-center mt-4">
            Last update: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>

        {/* Flight Information */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl p-5 border border-emerald-500/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            Flight Information
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
              <span className="text-sm text-gray-400">Drone ID</span>
              <span className="text-sm font-medium text-white">
                DRN-2024-001
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
              <span className="text-sm text-gray-400">Flight Mode</span>
              <span className="text-sm font-medium text-emerald-400">
                Autonomous
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
              <span className="text-sm text-gray-400">GPS Status</span>
              <span className="text-sm font-medium text-emerald-400">
                Locked (12 Sats)
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-400">Temperature</span>
              <span className="text-sm font-medium text-white">
                {droneStats.temperature.toFixed(1)}°C
              </span>
            </div>
          </div>
        </div>

        {/* System Alert */}
        <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 backdrop-blur-xl rounded-2xl p-4 border border-cyan-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Camera className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-cyan-300">
              Camera Info
            </span>
          </div>
          <p className="text-xs text-gray-300">
            ESP32-CAM • MJPEG Stream • 30 FPS
          </p>
        </div>

        {/* Spray Control */}
        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-xl rounded-2xl p-5 border border-purple-500/30">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${sprayActive ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
            Spray Control
          </h3>

          <div className="space-y-3">
            {/* Status Indicator */}
            <div className="bg-gray-800/60 rounded-xl p-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Status</span>
                <span className={`text-sm font-semibold ${sprayActive ? 'text-green-400' : 'text-gray-400'}`}>
                  {sprayActive ? '💧 ACTIVE' : '⭕ INACTIVE'}
                </span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSprayControl('on')}
                disabled={sprayLoading || sprayActive}
                className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  sprayActive
                    ? 'bg-green-600/50 text-green-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/40'
                } ${sprayLoading ? 'opacity-50 cursor-wait' : ''}`}
              >
                {sprayLoading && !sprayActive ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  '💧'
                )}
                <span>Turn ON</span>
              </button>

              <button
                onClick={() => handleSprayControl('off')}
                disabled={sprayLoading || !sprayActive}
                className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  !sprayActive
                    ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/40'
                } ${sprayLoading ? 'opacity-50 cursor-wait' : ''}`}
              >
                {sprayLoading && sprayActive ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  '⭕'
                )}
                <span>Turn OFF</span>
              </button>
            </div>

            {/* Warning Message */}
            {sprayActive && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 mt-3">
                <p className="text-xs text-yellow-400 text-center">
                  ⚠️ Spray system is active
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Video Stream */}
      <div className="flex-1 flex flex-col p-6 z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl p-5 mb-6 border border-emerald-500/20 shadow-xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              🚁 Drone Live Monitoring
            </h2>
            <p className="text-sm text-gray-400">
              Real-time aerial farm surveillance
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <button
              onClick={() =>
                setViewMode(viewMode === "normal" ? "fullscreen" : "normal")
              }
              className="px-4 py-2 bg-gray-800/60 hover:bg-gray-700/60 rounded-xl font-semibold text-sm text-gray-300 hover:text-white transition-all duration-300 flex items-center gap-2 border border-emerald-500/20"
            >
              <Maximize2 className="w-4 h-4" />
              {viewMode === "normal" ? "Expand" : "Normal"}
            </button>

            {/* Live Badge */}
            {isLive && !streamError && (
              <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 rounded-xl px-4 py-2">
                <div className="relative">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                </div>
                <span className="text-sm font-bold text-red-400 tracking-wider">
                  LIVE
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Video Stream Container */}
        <div className="flex-1 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-emerald-500/20 shadow-2xl shadow-emerald-500/10 relative">
          {/* Stream */}
          <div className="w-full h-full bg-black">
            {!streamError ? (
              <div className="relative w-full h-full">
                {useIframe ? (
                  // Iframe mode - bypasses CORS
                  <iframe
                    id="drone-stream-iframe"
                    src={streamUrl}
                    className="w-full h-full border-0"
                    title="Drone Camera Feed"
                    onError={(e) => {
                      console.error("Iframe error:", streamUrl);
                      setStreamError(true);
                    }}
                  />
                ) : (
                  // Image mode - standard MJPEG - FULL COVER
                  <img
                    id="drone-stream"
                    src={streamUrl}
                    alt="Drone Camera Feed"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error("Stream error:", streamUrl);
                      console.error("Error type:", e.type);
                      setStreamError(true);
                    }}
                    onLoad={() => {
                      console.log("Stream loaded successfully:", streamUrl);
                      setStreamError(false);
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center max-w-2xl px-6">
                <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  Camera Feed Unavailable
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  Unable to connect to ESP32 camera stream
                </p>
                <p className="text-xs text-gray-600 mb-1 font-mono">
                  Current URL: {streamUrl}
                </p>
                <p className="text-xs text-gray-600 mb-4">
                  Mode: {useIframe ? "Iframe (CORS bypass)" : "Image (MJPEG)"}
                </p>
                
                {/* Troubleshooting tips */}
                <div className="bg-gray-800/50 rounded-xl p-4 mb-4 text-left">
                  <h4 className="text-sm font-semibold text-emerald-400 mb-2">💡 Troubleshooting Tips:</h4>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Check if ESP32 is on the same network</li>
                    <li>• Verify ESP32 IP: {ESP32_IP}</li>
                    <li>• Test stream in browser: <a href={streamUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{streamUrl}</a></li>
                    <li>• Try different URLs using the button below</li>
                    <li>• If CORS error, try Iframe mode</li>
                  </ul>
                </div>

                <div className="flex gap-3 justify-center flex-wrap">
                  <button
                    onClick={handleRefresh}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                  </button>
                  <button
                    onClick={tryNextStreamUrl}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 flex items-center gap-2"
                  >
                    Try URL {streamAttempt + 1}/{STREAM_PATHS.length}
                  </button>
                  <button
                    onClick={toggleIframeMode}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 flex items-center gap-2"
                  >
                    {useIframe ? "Use Image" : "Use Iframe"}
                  </button>
                </div>
              </div>
                        </div>
            )}

          {/* Stream Overlay Info */}
          {!streamError && (
            <>
              {/* Top Left - Stream Info */}
              <div className="absolute top-5 left-5 bg-gray-900/95 backdrop-blur-xl border border-emerald-500/20 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <div>
                    <div className="text-xs text-gray-400">Stream Quality</div>
                    <div className="text-sm font-semibold text-white">
                      HD • 30 FPS
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Right - Timestamp */}
              <div className="absolute top-5 right-5 bg-gray-900/95 backdrop-blur-xl border border-emerald-500/20 rounded-xl px-4 py-3">
                <div className="text-xs text-gray-400">Local Time</div>
                <div className="text-sm font-semibold text-white">
                  {new Date().toLocaleTimeString()}
                </div>
              </div>

              {/* Bottom - Camera Info */}
              <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gray-900/95 backdrop-blur-xl border border-emerald-500/20 rounded-xl px-6 py-3">
                <p className="text-sm text-gray-300 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  Powered by ESP32-CAM • MJPEG Stream
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}