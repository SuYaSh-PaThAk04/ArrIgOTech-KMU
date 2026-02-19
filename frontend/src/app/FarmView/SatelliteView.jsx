"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CONFIG = {
  FARM_LAT:  29.89304,
  FARM_LNG:  77.96205,
  FARM_NAME: "Uttarakhand Plot α-1",
  FARM_AREA: "0.98 ha",

  OWM_API_KEY: "YOUR_OPENWEATHER_API_KEY",

  GEE_TILE_URL: "YOUR_GEE_TILE_URL",

  // Polling intervals (ms)
  WEATHER_POLL_MS: 10 * 60 * 1000,   // 10 minutes
  NDVI_POLL_MS:    30 * 60 * 1000,   // 30 minutes
  WS_TICK_MS:      3000,             // mock WebSocket heartbeat
};

function getNDVIHealth(val) {
  if (val >= 0.7) return { label: "Excellent", color: "#22c55e", rec: "Crop is thriving. Maintain current irrigation schedule." };
  if (val >= 0.5) return { label: "Moderate",  color: "#eab308", rec: "Moderate vegetation density. Monitor irrigation — consider a top-up within 3 days." };
  if (val >= 0.3) return { label: "Low",        color: "#f97316", rec: "Stress detected. Inspect for water deficit or pest pressure. Irrigate immediately." };
  return           { label: "Critical",  color: "#ef4444", rec: "Severe vegetation stress. Urgent agronomist review recommended." };
}

// Dynamic health score: NDVI (60%) + weather bonus (40%)
function computeHealthScore(ndvi, weather) {
  let score = ndvi * 60;
  if (weather) {
    const temp   = weather.main?.temp     ?? 25;
    const hum    = weather.main?.humidity ?? 50;
    const clouds = weather.clouds?.all    ?? 50;
    const tempScore = temp >= 20 && temp <= 30 ? 20 : temp >= 15 && temp <= 35 ? 12 : 5;
    const humScore  = hum  >= 40 && hum  <= 70 ? 12 : hum  >= 30 && hum  <= 80 ? 7  : 3;
    const cloudAdj  = clouds > 80 ? -5 : 0;
    score += tempScore + humScore + cloudAdj;
  } else {
    score += 20;
  }
  return Math.min(Math.round(score), 100);
}

/* ══════════════════════════════════════════════════════════
   STAGE CONSTANTS
══════════════════════════════════════════════════════════ */
const STAGES = [
  { phase: "globe",    label: "Acquiring satellite lock…" },
  { phase: "zoom",     label: "Zooming to farm coordinates…" },
  { phase: "ndvi",     label: "Loading NDVI spectral layer…" },
  { phase: "insights", label: "Live monitoring active" },
];

/* ══════════════════════════════════════════════════════════
   MOCK WebSocket — simulates a live data stream
══════════════════════════════════════════════════════════ */
function useMockWebSocket(active) {
  const [stream, setStream] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const tick = () => {
      setStream({
        ts:             new Date().toISOString(),
        ndviDelta:      (Math.random() - 0.5) * 0.008,
        signalStrength: 85 + Math.floor(Math.random() * 14),
        packetsRx:      Math.floor(Math.random() * 6) + 1,
      });
    };
    tick();
    timerRef.current = setInterval(tick, CONFIG.WS_TICK_MS);
    return () => clearInterval(timerRef.current);
  }, [active]);

  return stream;
}

/* ══════════════════════════════════════════════════════════
   WEATHER HOOK — polls OpenWeatherMap every 10 min
══════════════════════════════════════════════════════════ */
function useWeather() {
  const [weather,     setWeather]     = useState(null);
  const [weatherTime, setWeatherTime] = useState(null);
  const [weatherErr,  setWeatherErr]  = useState(false);
  const [loading,     setLoading]     = useState(false);

  const doFetch = useCallback(async () => {
    // Demo mode — realistic fake weather when no API key provided
    if (CONFIG.OWM_API_KEY === "YOUR_OPENWEATHER_API_KEY") {
      setWeather({
        main:    { temp: 24 + (Math.random() - 0.5) * 4, humidity: 52 + Math.floor(Math.random() * 10) },
        wind:    { speed: 2.4 + Math.random() * 2 },
        clouds:  { all: 18 + Math.floor(Math.random() * 15) },
        weather: [{ description: "few clouds", icon: "02d" }],
      });
      setWeatherTime(new Date());
      return;
    }
    setLoading(true);
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${CONFIG.FARM_LAT}&lon=${CONFIG.FARM_LNG}&units=metric&appid=${CONFIG.OWM_API_KEY}`;
      const res  = await fetch(url);
      if (!res.ok) throw new Error("OWM error");
      const data = await res.json();
      setWeather(data);
      setWeatherTime(new Date());
      setWeatherErr(false);
    } catch {
      setWeatherErr(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    doFetch();
    const t = setInterval(doFetch, CONFIG.WEATHER_POLL_MS);
    return () => clearInterval(t);
  }, [doFetch]);

  return { weather, weatherTime, weatherErr, loading, refresh: doFetch };
}

/* ══════════════════════════════════════════════════════════
   NDVI HOOK — manages tile URL + 30-min refresh
══════════════════════════════════════════════════════════ */
function useNDVI(weather) {
  const [ndviValue,     setNdviValue]   = useState(0.58);
  const [ndviTime,      setNdviTime]    = useState(null);
  const [ndviRefreshing,setRefreshing]  = useState(false);
  const wsStream = useMockWebSocket(true);

  // Apply WebSocket micro-drift to NDVI
  useEffect(() => {
    if (!wsStream) return;
    setNdviValue(prev => {
      const next = prev + wsStream.ndviDelta;
      return Math.max(0.1, Math.min(0.95, next));
    });
  }, [wsStream]);

  const refreshNDVI = useCallback(async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 2000));
    // In production: call your GEE endpoint to get a fresh mapId + token,
    // then call geeLayerRef.current.setUrl(newUrl)
    setNdviValue(prev => Math.max(0.1, Math.min(0.95, prev + (Math.random() - 0.5) * 0.04)));
    setNdviTime(new Date());
    setRefreshing(false);
  }, []);

  useEffect(() => {
    setNdviTime(new Date());
    const t = setInterval(refreshNDVI, CONFIG.NDVI_POLL_MS);
    return () => clearInterval(t);
  }, [refreshNDVI]);

  const healthScore = computeHealthScore(ndviValue, weather);
  const health      = getNDVIHealth(ndviValue);

  return { ndviValue, ndviTime, ndviRefreshing, refreshNDVI, healthScore, health, wsStream };
}

/* ══════════════════════════════════════════════════════════
   GLOBE CANVAS
══════════════════════════════════════════════════════════ */
function GlobeCanvas({ phase }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const rotRef    = useRef(0);
  const zoomRef   = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W   = canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
    const H   = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    const cx  = W / 2, cy = H / 2;
    const lerp = (a, b, t) => a + (b - a) * t;

    function drawGlobe(rot, zoom) {
      ctx.clearRect(0, 0, W, H);
      const maxR = Math.min(W, H) * 0.38;
      const minR = maxR * 0.18;
      const r    = lerp(maxR, minR, zoom);
      const fade = lerp(1, 0, Math.min(zoom * 1.4, 1));

      const glow = ctx.createRadialGradient(cx, cy, r*0.6, cx, cy, r*1.6);
      glow.addColorStop(0,   `rgba(139,92,246,${0.25*fade})`);
      glow.addColorStop(0.5, `rgba(109,40,217,${0.12*fade})`);
      glow.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = glow; ctx.fillRect(0,0,W,H);

      const atmo = ctx.createRadialGradient(cx, cy, r*0.9, cx, cy, r*1.15);
      atmo.addColorStop(0,   `rgba(139,92,246,${0.4*fade})`);
      atmo.addColorStop(0.6, `rgba(79,70,229,${0.15*fade})`);
      atmo.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.beginPath(); ctx.arc(cx, cy, r*1.15, 0, Math.PI*2);
      ctx.fillStyle = atmo; ctx.fill();

      const ocean = ctx.createRadialGradient(cx-r*0.2, cy-r*0.2, r*0.1, cx, cy, r);
      ocean.addColorStop(0, "#1e3a5f"); ocean.addColorStop(1, "#0f172a");
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
      ctx.fillStyle = ocean; ctx.fill();

      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.clip();
      ctx.strokeStyle = `rgba(139,92,246,${0.18*fade})`; ctx.lineWidth = 0.8;
      for (let lat = -80; lat <= 80; lat += 20) {
        const y  = cy + (lat/90)*r;
        const rx = Math.sqrt(Math.max(0, r*r-(y-cy)*(y-cy)));
        ctx.beginPath(); ctx.ellipse(cx, y, rx, rx*0.2, 0, 0, Math.PI*2); ctx.stroke();
      }
      for (let lng = 0; lng < 360; lng += 20) {
        const angle = ((lng+rot)%360)*Math.PI/180;
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);
        ctx.beginPath(); ctx.ellipse(0, 0, r*0.18, r, 0, 0, Math.PI*2); ctx.stroke();
        ctx.restore();
      }
      const blobs = [
        {a:0.3, b:0.18, dx: 0.15, dy:-0.05},
        {a:0.35,b:0.22, dx:-0.28, dy:-0.04},
        {a:0.28,b:0.17, dx: 0.45, dy: 0.0 },
        {a:0.12,b:0.08, dx: 0.55, dy: 0.28},
      ];
      ctx.fillStyle = `rgba(34,85,34,${0.6*fade})`;
      blobs.forEach(({a,b,dx,dy}) => {
        ctx.beginPath();
        ctx.ellipse(cx+dx*r+Math.cos(rot*Math.PI/180)*r*0.05, cy+dy*r, a*r, b*r, rot*0.01, 0, Math.PI*2);
        ctx.fill();
      });
      ctx.restore();

      const spec = ctx.createRadialGradient(cx-r*0.3, cy-r*0.3, 0, cx, cy, r);
      spec.addColorStop(0, `rgba(255,255,255,${0.14*fade})`);
      spec.addColorStop(0.5, "rgba(255,255,255,0)");
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
      ctx.fillStyle = spec; ctx.fill();

      if (zoom > 0.05) {
        const alpha = Math.min((zoom-0.05)/0.3, 1);
        const pulse = 0.5+0.5*Math.sin(Date.now()/400);
        const px = cx+(zoom>0.5?0:(CONFIG.FARM_LNG-78)*r*0.012);
        const py = cy-(CONFIG.FARM_LAT-20)*r*0.018;
        for (let i=1;i<=3;i++) {
          ctx.beginPath();
          ctx.arc(px, py, (8+i*10)*(0.4+pulse*0.6)*(r/maxR), 0, Math.PI*2);
          ctx.strokeStyle = `rgba(167,139,250,${(0.6-i*0.15)*alpha})`;
          ctx.lineWidth=1.5; ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(px, py, 5*r/maxR, 0, Math.PI*2);
        ctx.fillStyle = `rgba(250,220,100,${alpha})`; ctx.fill();
      }
    }

    function animate() {
      const targetZoom = phase !== "globe" ? 1 : 0;
      zoomRef.current  = lerp(zoomRef.current, targetZoom, 0.018);
      rotRef.current  += lerp(0.4, 0.02, zoomRef.current);
      drawGlobe(rotRef.current, zoomRef.current);
      rafRef.current   = requestAnimationFrame(animate);
    }
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{display:"block"}} />;
}

/* ══════════════════════════════════════════════════════════
   NDVI MAP (Leaflet)
══════════════════════════════════════════════════════════ */
function NDVIMap({ visible, ndviRefreshing }) {
  const mapRef     = useRef(null);
  const leafletRef = useRef(null);
  const geeRef     = useRef(null);

  useEffect(() => {
    if (!visible || leafletRef.current) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload = () => {
      const L   = window.L;
      const map = L.map(mapRef.current, {
        center: [CONFIG.FARM_LAT, CONFIG.FARM_LNG],
        zoom: 14, zoomControl: false, attributionControl: false,
      });

      // ── Esri World Imagery — free, no API key required ──
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19, attribution: "Esri, Maxar, Earthstar Geographics" }
      ).addTo(map);
      // ────────────────────────────────────────────────────

      // ── Real GEE NDVI tile layer (v1 API — urlFormat, no token needed) ───
      if (CONFIG.GEE_TILE_URL !== "YOUR_GEE_TILE_URL") {
        geeRef.current = L.tileLayer(CONFIG.GEE_TILE_URL, {
          opacity: 0.75,
          maxZoom: 18,
        }).addTo(map);
      }
      // ────────────────────────────────────────────

      // NDVI polygon — higher contrast colours for satellite background
      const bounds = [[29.888,77.957],[29.888,77.967],[29.898,77.967],[29.898,77.957]];
      // outer glow ring
      L.polygon(bounds, { color:"#ffffff", weight:10, opacity:0.08, fill:false }).addTo(map);
      // main boundary — bright so it pops on green/brown satellite tiles
      L.polygon(bounds, {
        color:"#facc15", weight:2.5, opacity:1,
        fillColor:"#84cc16", fillOpacity:0.25,
        dashArray:"7 4",
      }).addTo(map);
      // inner highlight
      L.polygon(bounds, { color:"#facc15", weight:5, opacity:0.2, fill:false }).addTo(map);

      // Centre pin — white outer ring so it stands out on any satellite background
      L.marker([CONFIG.FARM_LAT, CONFIG.FARM_LNG], {
        icon: L.divIcon({
          html:`
            <div style="position:relative;width:24px;height:24px;">
              <div style="position:absolute;inset:0;border-radius:50%;background:rgba(250,204,21,0.25);animation:outerPulse 1.8s ease-out infinite;"></div>
              <div style="position:absolute;inset:4px;border-radius:50%;background:#facc15;border:2.5px solid #fff;box-shadow:0 0 0 2px rgba(0,0,0,0.5),0 0 12px rgba(250,204,21,0.9);"></div>
            </div>
            <style>
              @keyframes outerPulse{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.2);opacity:0}}
            </style>`,
          className:"", iconAnchor:[12,12],
        })
      }).addTo(map);

      leafletRef.current = map;
    };
    document.head.appendChild(script);
  }, [visible]);

  // Refresh GEE tile layer on each NDVI refresh cycle
  // Note: GEE v1 tile URLs expire ~1hr. Re-run GEE script to get a fresh URL and update CONFIG.GEE_TILE_URL
  useEffect(() => {
    if (!ndviRefreshing || !geeRef.current) return;
    // Bust cache by appending timestamp (tile URL itself does not change, just forces re-fetch)
    const busted = CONFIG.GEE_TILE_URL + (CONFIG.GEE_TILE_URL.includes("?") ? "&" : "?") + "_t=" + Date.now();
    geeRef.current.setUrl(busted);
  }, [ndviRefreshing]);

  return <div ref={mapRef} className="w-full h-full rounded-2xl overflow-hidden" style={{minHeight:320}} />;
}

/* ══════════════════════════════════════════════════════════
   WEATHER OVERLAY  (map corner)
══════════════════════════════════════════════════════════ */
function WeatherOverlay({ weather, weatherTime, loading, onRefresh }) {
  if (!weather) return null;
  const temp   = weather.main?.temp?.toFixed(1) ?? "--";
  const hum    = weather.main?.humidity          ?? "--";
  const wind   = weather.wind?.speed?.toFixed(1) ?? "--";
  const clouds = weather.clouds?.all             ?? "--";
  const desc   = weather.weather?.[0]?.description ?? "";
  const ago    = weatherTime ? Math.round((Date.now()-weatherTime.getTime())/60000) : null;

  return (
    <motion.div
      initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.6}}
      className="absolute top-4 right-4 z-20 bg-black/75 border border-blue-500/25 rounded-xl p-4 backdrop-blur-sm w-52">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400"
            style={{animation:"blink 1.5s ease-in-out infinite"}}/>
          <span className="text-xs text-blue-400 uppercase tracking-widest">Live Weather</span>
        </div>
        <button onClick={onRefresh}
          className={`text-gray-500 hover:text-blue-400 transition-colors ${loading?"animate-spin":""}`}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          {icon:"🌡️",label:"Temp",    val:`${temp}°C`  },
          {icon:"💧",label:"Humidity",val:`${hum}%`    },
          {icon:"💨",label:"Wind",    val:`${wind} m/s`},
          {icon:"☁️",label:"Cloud",   val:`${clouds}%` },
        ].map(({icon,label,val}) => (
          <div key={label} className="bg-gray-900/60 rounded-lg px-2 py-1.5">
            <p className="text-xs text-gray-500">{icon} {label}</p>
            <p className="text-white text-sm font-bold">{val}</p>
          </div>
        ))}
      </div>

      {desc && <p className="text-xs text-gray-500 capitalize mt-2">{desc}</p>}
      {ago !== null && (
        <p className="text-xs text-gray-600 mt-1">
          Updated {ago < 1 ? "just now" : `${ago}m ago`}
        </p>
      )}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   LIVE SIGNAL HUD
══════════════════════════════════════════════════════════ */
function LiveSignalHUD({ wsStream, ndviRefreshing }) {
  const [dots, setDots] = useState("•");
  useEffect(() => {
    const t = setInterval(() =>
      setDots(d => d.length >= 3 ? "•" : d + "•"), 500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex items-center gap-3 text-xs font-mono">
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-green-500"
          style={{boxShadow:"0 0 6px #22c55e",animation:"blink 1s ease-in-out infinite"}}/>
        <span className="text-green-400 uppercase tracking-widest">Live</span>
      </div>
      <div className="w-px h-3 bg-gray-700"/>
      {wsStream && (
        <span className="text-gray-500">
          Signal <span className="text-violet-400">{wsStream.signalStrength}%</span>
        </span>
      )}
      <div className="w-px h-3 bg-gray-700"/>
      <span className={ndviRefreshing ? "text-yellow-400" : "text-gray-500"}>
        {ndviRefreshing ? `NDVI refreshing${dots}` : "NDVI synced"}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   NDVI LEGEND
══════════════════════════════════════════════════════════ */
function NDVILegend() {
  const stops = ["#1a1a2e","#7f1d1d","#ef4444","#f97316","#eab308","#84cc16","#22c55e","#14532d"];
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-gray-400 font-mono uppercase tracking-widest mb-1">NDVI Scale</p>
      <div className="flex rounded overflow-hidden h-3">
        {stops.map((c,i) => <div key={i} className="flex-1" style={{background:c}}/>)}
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-gray-500 font-mono">0</span>
        <span className="text-xs text-gray-500 font-mono">0.5</span>
        <span className="text-xs text-gray-500 font-mono">1.0</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   HEALTH GAUGE  (live-animated)
══════════════════════════════════════════════════════════ */
function HealthGauge({ ndviValue, healthScore, health }) {
  const [animScore, setAnimScore] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimScore(healthScore), 300);
    return () => clearTimeout(t);
  }, [healthScore]);

  return (
    <div className="bg-gray-900/70 border border-violet-500/20 rounded-xl p-5 space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 uppercase tracking-widest font-mono">NDVI Value</span>
          <motion.span
            key={ndviValue.toFixed(3)}
            initial={{scale:1.25}} animate={{scale:1}}
            transition={{duration:0.3}}
            className="font-bold text-xl text-white">
            {ndviValue.toFixed(3)}
          </motion.span>
        </div>
        <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            animate={{width:`${ndviValue*100}%`}}
            transition={{duration:0.6, ease:"easeOut"}}
            style={{background:`linear-gradient(90deg,#ef4444,#eab308,${health.color})`,
                    boxShadow:`0 0 10px ${health.color}88`}}/>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-600 font-mono">0</span>
          <span className="text-xs font-semibold" style={{color:health.color}}>{health.label}</span>
          <span className="text-xs text-gray-600 font-mono">1.0</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 uppercase tracking-widest font-mono">Health Score</span>
          <span className="font-bold text-xl" style={{color:health.color}}>{healthScore}/100</span>
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            animate={{width:`${animScore}%`}}
            transition={{duration:1.0, ease:"easeOut"}}
            style={{background:health.color, boxShadow:`0 0 8px ${health.color}66`}}/>
        </div>
        <p className="text-xs text-gray-600 mt-1 font-mono">NDVI 60% + Weather 40%</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   INSIGHT CARD
══════════════════════════════════════════════════════════ */
function InsightCard({ icon, label, value, sub, color, delay=0, live=false }) {
  return (
    <motion.div
      initial={{opacity:0,x:30}} animate={{opacity:1,x:0}}
      transition={{duration:0.5, delay}}
      className="bg-gray-900/70 border rounded-xl p-4 flex items-start gap-3"
      style={{borderColor:color+"40"}}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
        style={{background:color+"22"}}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">{label}</p>
          {live && <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"
            style={{animation:"blink 1s ease-in-out infinite"}}/>}
        </div>
        <p className="text-white font-bold text-base leading-tight truncate">{value}</p>
        {sub && <p className="text-xs mt-0.5 truncate" style={{color}}>{sub}</p>}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   STAGE PROGRESS BAR
══════════════════════════════════════════════════════════ */
function StageBar({ phase }) {
  const idx = STAGES.findIndex(s => s.phase === phase);
  return (
    <div className="flex items-center gap-2">
      {STAGES.map((s,i) => (
        <div key={s.phase} className="flex items-center gap-2">
          <div className="h-1.5 rounded-full transition-all duration-700"
            style={{width:i<=idx?32:20, background:i<=idx?"#a78bfa":"#374151", opacity:i<=idx?1:0.4}}/>
          {i < STAGES.length-1 && (
            <div className="w-1.5 h-1.5 rounded-full"
              style={{background:i<idx?"#a78bfa":"#374151"}}/>
          )}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CSS KEYFRAMES
══════════════════════════════════════════════════════════ */
function GlobalStyles() {
  return (
    <style>{`
      @keyframes blink     { 0%,100%{opacity:1}   50%{opacity:.3}  }
      @keyframes orbitPing { 0%{transform:scale(1);opacity:.8} 100%{transform:scale(2.4);opacity:0} }
      .sat-blink { animation: blink 1.2s ease-in-out infinite; }
    `}</style>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function SatelliteView({ onBack }) {
  const [phase,       setPhase]       = useState("globe");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { weather, weatherTime, weatherErr, loading: wxLoading, refresh: refreshWeather } = useWeather();
  const { ndviValue, ndviTime, ndviRefreshing, refreshNDVI, healthScore, health, wsStream } = useNDVI(weather);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("zoom"),                              2200);
    const t2 = setTimeout(() => setPhase("ndvi"),                              5000);
    const t3 = setTimeout(() => { setPhase("insights"); setSidebarOpen(true); }, 7500);
    return () => [t1,t2,t3].forEach(clearTimeout);
  }, []);

  const ndviAgo      = ndviTime ? Math.round((Date.now()-ndviTime.getTime())/60000) : null;
  const currentStage = STAGES.find(s => s.phase === phase);

  return (
    <>
      <GlobalStyles/>
      <div className="w-screen h-screen bg-black flex flex-col overflow-hidden"
        style={{fontFamily:"'IBM Plex Mono','Courier New',monospace"}}>

        {/* ── TOP BAR ── */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-violet-900/40 bg-gray-950/90 backdrop-blur-sm z-30 gap-4">
          <div className="flex items-center gap-4 flex-shrink-0">
            {onBack && (
              <button onClick={onBack}
                className="text-gray-500 hover:text-white transition-colors text-xs uppercase tracking-widest flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                </svg>
                Back
              </button>
            )}
            <div className="w-px h-5 bg-gray-800"/>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-500 sat-blink"
                style={{boxShadow:"0 0 8px #a78bfa"}}/>
              <span className="text-violet-300 text-xs uppercase tracking-widest">AgriSense · Satellite</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <StageBar phase={phase}/>
            {phase === "insights"
              ? <LiveSignalHUD wsStream={wsStream} ndviRefreshing={ndviRefreshing}/>
              : <span className="text-xs text-gray-500 sat-blink hidden md:block">{currentStage?.label}</span>
            }
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500 flex-shrink-0">
            <span className="hidden md:block">{CONFIG.FARM_LAT.toFixed(3)}°N · {CONFIG.FARM_LNG.toFixed(3)}°E</span>
            <div className="px-2 py-0.5 rounded border border-violet-500/30 text-violet-400">S2-SR</div>
            {weatherErr && <span className="text-red-400">⚠ Weather offline</span>}
          </div>
        </div>

        {/* ── MAIN AREA ── */}
        <div className="flex flex-1 min-h-0 relative">

          {/* Globe */}
          <AnimatePresence>
            {(phase === "globe" || phase === "zoom") && (
              <motion.div key="globe"
                initial={{opacity:0}} animate={{opacity:1}}
                exit={{opacity:0,scale:0.95}} transition={{duration:0.8}}
                className="absolute inset-0 flex items-center justify-center bg-black z-10">
                <div className="absolute inset-0 overflow-hidden">
                  {Array.from({length:120}).map((_,i) => (
                    <div key={i} className="absolute rounded-full bg-white"
                      style={{width:Math.random()>.9?2:1, height:Math.random()>.9?2:1,
                               top:`${Math.random()*100}%`, left:`${Math.random()*100}%`,
                               opacity:0.1+Math.random()*0.6,
                               animation:`blink ${2+Math.random()*4}s ease-in-out infinite`,
                               animationDelay:`${Math.random()*3}s`}}/>
                  ))}
                </div>
                <div className="relative" style={{width:420,height:420}}>
                  <GlobeCanvas phase={phase}/>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="rounded-full border"
                      style={{width:phase==="zoom"?80:0, height:phase==="zoom"?80:0,
                               borderColor:"rgba(167,139,250,0.6)",
                               boxShadow:"0 0 30px rgba(167,139,250,0.4)",
                               transition:"all 1.5s ease",
                               animation:phase==="zoom"?"orbitPing 1.5s ease-out infinite":"none"}}/>
                  </div>
                </div>
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center">
                  <p className="text-violet-300 text-sm tracking-widest uppercase sat-blink">
                    {phase==="globe" ? "Establishing orbital link…" : `Targeting · ${CONFIG.FARM_NAME}`}
                  </p>
                  {phase==="zoom" && (
                    <p className="text-gray-500 text-xs mt-1">
                      {CONFIG.FARM_LAT.toFixed(4)}°N, {CONFIG.FARM_LNG.toFixed(4)}°E
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Map */}
          <AnimatePresence>
            {(phase === "ndvi" || phase === "insights") && (
              <motion.div key="map"
                initial={{opacity:0}} animate={{opacity:1}} transition={{duration:1.2}}
                className="flex-1 relative min-h-0">
                <div className="absolute inset-0">
                  <NDVIMap visible={true} ndviRefreshing={ndviRefreshing}/>
                </div>

                {/* Farm label */}
                <div className="absolute top-4 left-4 z-20 space-y-2">
                  <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} transition={{delay:0.5}}
                    className="px-3 py-1.5 bg-black/70 border border-violet-500/30 rounded-lg backdrop-blur-sm">
                    <p className="text-violet-300 text-xs uppercase tracking-widest">{CONFIG.FARM_NAME}</p>
                    <p className="text-gray-400 text-xs">Sentinel-2 · 10m resolution</p>
                  </motion.div>

                  <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} transition={{delay:0.8}}
                    className="px-3 py-1.5 bg-black/70 border border-yellow-500/20 rounded-lg backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <p className="text-yellow-400 text-xs uppercase tracking-widest">NDVI Active</p>
                      {ndviRefreshing && <div className="w-2 h-2 rounded-full border border-yellow-400 border-t-transparent animate-spin"/>}
                    </div>
                    <p className="text-gray-400 text-xs">
                      {ndviAgo !== null ? (ndviAgo < 1 ? "Just refreshed" : `${ndviAgo}m ago`) : "Feb 2026"} · Cloud &lt;20%
                    </p>
                  </motion.div>

                  {phase === "insights" && (
                    <motion.button
                      initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.2}}
                      onClick={refreshNDVI} disabled={ndviRefreshing}
                      className="px-3 py-1.5 bg-black/70 border border-violet-500/30 rounded-lg backdrop-blur-sm
                                 text-xs text-violet-400 hover:text-white hover:border-violet-400
                                 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
                      <svg className={`w-3 h-3 ${ndviRefreshing?"animate-spin":""}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                      {ndviRefreshing ? "Refreshing…" : "Refresh NDVI"}
                    </motion.button>
                  )}
                </div>

                {/* Live weather (top-right of map) */}
                {phase === "insights" && (
                  <WeatherOverlay weather={weather} weatherTime={weatherTime}
                    loading={wxLoading} onRefresh={refreshWeather}/>
                )}

                {/* NDVI legend */}
                <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:1}}
                  className="absolute bottom-4 left-4 z-20 bg-black/75 border border-violet-500/20 rounded-xl p-4 backdrop-blur-sm w-56">
                  <NDVILegend/>
                </motion.div>

                {/* scan line */}
                <AnimatePresence>
                  {phase === "ndvi" && (
                    <motion.div
                      initial={{top:"20%",opacity:0.8}} animate={{top:"80%",opacity:0}}
                      transition={{duration:2.5,ease:"linear"}} exit={{opacity:0}}
                      className="absolute left-0 right-0 z-20 pointer-events-none"
                      style={{height:2,
                               background:"linear-gradient(90deg,transparent,rgba(167,139,250,0.8),transparent)",
                               boxShadow:"0 0 12px rgba(167,139,250,0.5)"}}/>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── INSIGHTS SIDEBAR ── */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.aside key="sidebar"
                initial={{x:"100%",opacity:0}} animate={{x:0,opacity:1}}
                exit={{x:"100%",opacity:0}}
                transition={{type:"spring",stiffness:260,damping:28}}
                className="w-80 flex-shrink-0 bg-gray-950/95 border-l border-violet-900/40 backdrop-blur-xl flex flex-col overflow-y-auto z-20">

                {/* header */}
                <div className="px-5 pt-5 pb-4 border-b border-gray-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-violet-400 uppercase tracking-widest">Live Analysis</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"
                        style={{animation:"blink 1s ease-in-out infinite"}}/>
                      <span className="text-xs text-green-400">Streaming</span>
                    </div>
                  </div>
                  <p className="text-white font-bold text-lg leading-tight">{CONFIG.FARM_NAME}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{CONFIG.FARM_AREA} · Uttarakhand, India</p>
                </div>

                {/* live health gauge */}
                <div className="px-5 pt-4">
                  <HealthGauge ndviValue={ndviValue} healthScore={healthScore} health={health}/>
                </div>

                {/* insight cards */}
                <div className="px-5 pt-4 space-y-3 pb-4">
                  <InsightCard icon="🌱" label="Crop Health" live
                    value={health.label}
                    sub={`NDVI ${ndviValue.toFixed(3)} · updating live`}
                    color={health.color} delay={0.1}/>

                  <InsightCard icon="🌡️" label="Temperature" live
                    value={weather ? `${weather.main?.temp?.toFixed(1)}°C` : "—"}
                    sub={weather?.weather?.[0]?.description ?? "Fetching…"}
                    color="#f97316" delay={0.2}/>

                  <InsightCard icon="💧" label="Humidity" live
                    value={weather ? `${weather.main?.humidity}%` : "—"}
                    sub={weather?.main?.humidity >= 70 ? "High — watch for fungal risk"
                       : weather?.main?.humidity <= 35 ? "Low — consider irrigation"
                       : "Optimal range"}
                    color="#38bdf8" delay={0.3}/>

                  <InsightCard icon="💨" label="Wind Speed" live
                    value={weather ? `${weather.wind?.speed?.toFixed(1)} m/s` : "—"}
                    sub="Near-surface measurement"
                    color="#94a3b8" delay={0.4}/>

                  <InsightCard icon="☁️" label="Cloud Cover"
                    value={weather ? `${weather.clouds?.all}%` : "—"}
                    sub={weather?.clouds?.all > 80 ? "Poor NDVI quality window"
                       : weather?.clouds?.all < 20 ? "Excellent imaging conditions"
                       : "Acceptable imaging window"}
                    color="#64748b" delay={0.5}/>

                  <InsightCard icon="🛰️" label="Last NDVI Sync"
                    value={ndviAgo !== null ? (ndviAgo < 1 ? "Just now" : `${ndviAgo}m ago`) : "—"}
                    sub={ndviRefreshing ? "Refreshing tiles…" : "Sentinel-2B · 10m res"}
                    color="#a78bfa" delay={0.6}/>
                </div>

                {/* dynamic recommendation — re-renders when health changes */}
                <motion.div
                  key={health.label}
                  initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
                  transition={{duration:0.4}}
                  className="mx-5 mb-4 p-4 rounded-xl border"
                  style={{background:health.color+"10", borderColor:health.color+"35"}}>
                  <p className="text-xs uppercase tracking-widest mb-2" style={{color:health.color}}>
                    AI Recommendation
                  </p>
                  <p className="text-gray-300 text-sm leading-relaxed">{health.rec}</p>
                  {weather?.main?.humidity < 40 && (
                    <p className="text-blue-300 text-xs mt-2">⚠ Low humidity — evapotranspiration elevated.</p>
                  )}
                  {weather?.clouds?.all > 70 && (
                    <p className="text-yellow-300 text-xs mt-1">⚠ High cloud — NDVI tile quality may be reduced.</p>
                  )}
                </motion.div>

                {/* actions */}
                <div className="px-5 pb-6 mt-auto space-y-2">
                  <button
                    className="w-full py-2.5 rounded-xl text-xs uppercase tracking-widest font-bold text-black transition-all hover:brightness-110"
                    style={{background:health.color}}>
                    Export Report
                  </button>
                  <button
                    onClick={refreshNDVI} disabled={ndviRefreshing}
                    className="w-full py-2.5 rounded-xl text-xs uppercase tracking-widest font-semibold border border-violet-500/30 text-violet-300 hover:bg-violet-500/10 transition-all disabled:opacity-40">
                    {ndviRefreshing ? "Refreshing NDVI…" : "Force NDVI Refresh"}
                  </button>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}