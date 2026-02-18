"use client";
import { Sprout, Camera, Satellite } from "lucide-react";

export default function FarmViewLanding({
  on3DViewClick,
  onDroneViewClick,
  onSatelliteViewClick,
}) {
  return (
    <div className="w-screen h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-950 flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/3 right-1/3 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "3s" }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="z-10 max-w-6xl mx-auto px-6 py-8 overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-300">
            Farm View Dashboard
          </h1>
          <p className="text-xl text-gray-400">
            Choose your preferred monitoring view
          </p>
        </div>

        {/* Top Row — 3D View & Drone View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* 3D Farm View Card */}
          <button
            onClick={on3DViewClick}
            className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-3xl p-8 border border-emerald-500/20 hover:border-emerald-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20 text-left"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-green-500/0 group-hover:from-emerald-500/10 group-hover:to-green-500/10 rounded-3xl transition-all duration-500"></div>

            <div className="relative">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-600/20 to-green-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Sprout className="w-12 h-12 text-emerald-400" />
              </div>

              <h2 className="text-3xl font-bold text-white mb-4">
                3D Farm View
              </h2>

              <p className="text-gray-400 mb-6 leading-relaxed">
                Interactive 3D visualization of your farm plots with real-time
                sensor data. Monitor temperature, humidity, and soil moisture in
                an immersive environment.
              </p>

              <ul className="text-sm text-gray-500 space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                  Real-time sensor integration
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                  Interactive 3D plot rotation
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                  Single plot & farm grid views
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                  Visual condition indicators
                </li>
              </ul>

              <div className="inline-flex items-center gap-2 text-emerald-400 font-semibold group-hover:text-emerald-300 transition-colors">
                <span>Launch 3D View</span>
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </div>
          </button>

          {/* Drone View Card */}
          <button
            onClick={onDroneViewClick}
            className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-3xl p-8 border border-blue-500/20 hover:border-blue-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 text-left"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 rounded-3xl transition-all duration-500"></div>

            <div className="relative">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Camera className="w-12 h-12 text-blue-400" />
              </div>

              <h2 className="text-3xl font-bold text-white mb-4">
                Drone View
              </h2>

              <p className="text-gray-400 mb-6 leading-relaxed">
                Aerial perspective of your entire farm with bird's eye view
                monitoring. Get a comprehensive overview of field conditions
                from above.
              </p>

              <ul className="text-sm text-gray-500 space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  Aerial farm surveillance
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  Wide-area monitoring
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  Thermal & visual imaging
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  Flight path tracking
                </li>
              </ul>

              <div className="inline-flex items-center gap-2 text-blue-400 font-semibold group-hover:text-blue-300 transition-colors">
                <span>Launch Drone View</span>
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Bottom Row — Satellite View (centered) */}
        <div className="flex justify-center">
          <button
            onClick={onSatelliteViewClick}
            className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-3xl p-8 border border-violet-500/20 hover:border-violet-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/20 text-left w-full md:w-[calc(50%-1rem)]"
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-purple-500/0 group-hover:from-violet-500/10 group-hover:to-purple-500/10 rounded-3xl transition-all duration-500"></div>

            {/* Orbit ring decoration */}
            <div className="absolute top-6 right-6 w-16 h-16 rounded-full border border-violet-500/20 group-hover:border-violet-500/40 transition-all duration-500">
              <div className="absolute inset-2 rounded-full border border-violet-400/10 group-hover:border-violet-400/30 transition-all duration-500"></div>
              <div
                className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 bg-violet-400/40 rounded-full group-hover:bg-violet-400/80 transition-all duration-500"
              ></div>
            </div>

            <div className="relative">
              {/* Icon */}
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-violet-600/20 to-purple-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Satellite className="w-12 h-12 text-violet-400" />
              </div>

              {/* Badge */}
              <div className="absolute top-0 right-0 px-3 py-1 bg-violet-500/20 border border-violet-500/30 rounded-full">
                <span className="text-xs text-violet-300 font-medium tracking-wider uppercase">
                  New
                </span>
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-white mb-4">
                Satellite View
              </h2>

              {/* Description */}
              <p className="text-gray-400 mb-6 leading-relaxed">
                High-resolution satellite imagery of your farm and surrounding
                area. Analyze crop health, land coverage, and seasonal changes
                with multi-spectral data.
              </p>

              {/* Features */}
              <ul className="text-sm text-gray-500 space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-violet-400 rounded-full"></div>
                  Multi-spectral NDVI imaging
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-violet-400 rounded-full"></div>
                  Historical imagery comparison
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-violet-400 rounded-full"></div>
                  Crop health & yield prediction
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-violet-400 rounded-full"></div>
                  Weather pattern overlays
                </li>
              </ul>

              {/* CTA */}
              <div className="inline-flex items-center gap-2 text-violet-400 font-semibold group-hover:text-violet-300 transition-colors">
                <span>Launch Satellite View</span>
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500">
            💡 All views provide real-time monitoring with live sensor data
          </p>
        </div>
      </div>
    </div>
  );
}