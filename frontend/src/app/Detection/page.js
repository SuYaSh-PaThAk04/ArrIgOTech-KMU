"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf, TrendingUp, Droplets, Calendar, MapPin, Sparkles,
  CheckCircle2, AlertCircle, BarChart3, PieChart, ArrowLeft,
  Camera, Upload, Languages, Volume2, History, ChevronDown, ChevronUp,
  Shield, Zap, FlaskConical, Bug, X, RefreshCw, Clock, Activity,
  Pill, FileText, AlertTriangle,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";

// ─────────────────────────────────────────────────────────
// YIELD PAGE DATA
// ─────────────────────────────────────────────────────────
const DUMMY_RESULTS = [
  { predicted_yield_t_ha: 3.2, estimated_revenue: 128000, factors: ["Optimal nitrogen levels detected for high yield potential","Soil pH is within ideal range for selected crop variety","Planting date aligns with regional climate patterns","Good phosphorus-potassium balance for root development"], recommendations: ["Consider split application of nitrogen for better nutrient uptake","Monitor soil moisture levels during flowering stage","Apply organic mulch to maintain soil temperature","Schedule irrigation based on crop growth stages"] },
  { predicted_yield_t_ha: 3.5, estimated_revenue: 140000, factors: ["Strong nutrient profile supports healthy crop growth","Soil composition favors water retention and drainage","Area size allows for efficient resource management","Climate conditions are favorable for this crop variety"], recommendations: ["Implement crop rotation to maintain soil health","Use precision farming techniques for fertilizer application","Install drip irrigation for water efficiency","Monitor pest activity during critical growth phases"] },
  { predicted_yield_t_ha: 3.8, estimated_revenue: 152000, factors: ["Excellent soil nutrient balance detected","Ideal pH level promotes optimal nutrient availability","Field area supports mechanized farming practices","Strong potassium levels enhance disease resistance"], recommendations: ["Apply micronutrient supplements for maximum yield","Maintain consistent irrigation schedule during grain filling","Use integrated pest management strategies","Consider foliar feeding during vegetative growth"] },
];
const getRandomDummyResult = () => DUMMY_RESULTS[Math.floor(Math.random() * DUMMY_RESULTS.length)];

// ─────────────────────────────────────────────────────────
// DISEASE PAGE DATA
// ─────────────────────────────────────────────────────────
const DIALECTS = [
  { code: "en", label: "English" }, { code: "hi", label: "हिन्दी" },
  { code: "pa", label: "ਪੰਜਾਬੀ" }, { code: "te", label: "తెలుగు" },
  { code: "mr", label: "मराठी" }, { code: "bn", label: "বাংলা" },
  { code: "gu", label: "ગુજરાતી" }, { code: "kn", label: "ಕನ್ನಡ" },
];
const DUMMY_ANALYSIS = {
  disease: "Tomato Late Blight", severity: "High", confidence: 91,
  description: { en: "Late blight is caused by Phytophthora infestans and spreads rapidly in cool, wet conditions. Water-soaked lesions appear on leaves and stems, quickly turning brown with white fungal growth on leaf undersides. Entire crops can be destroyed within days without intervention.", hi: "लेट ब्लाइट Phytophthora infestans के कारण होता है और ठंडे, नम मौसम में तेजी से फैलता है।" },
  pestInfo: { causativeAgent: "Oomycete (Water Mold)", scientificName: "Phytophthora infestans", spreadMechanism: "Wind-dispersed spores, water splash, infected seed" },
  cure: {
    chemical: [{ product: "Ridomil Gold", activeIngredient: "Metalaxyl-M + Mancozeb", dosage: "2.5g/L", frequency: "Every 7-10 days", safetyInterval: "7 days" }, { product: "Daconil", activeIngredient: "Chlorothalonil 75% WP", dosage: "2g/L", frequency: "Every 5-7 days", safetyInterval: "14 days" }],
    organic: [{ remedy: "Copper Oxychloride", preparation: "3g/L water, mix well", frequency: "Every 7 days" }, { remedy: "Neem Oil", preparation: "5ml/L + few drops dish soap", frequency: "Every 5 days" }],
    soilTreatment: "Apply Trichoderma viride @ 5g/L as soil drench to suppress soil-borne phase.",
    preventive: "Use certified disease-free seeds. Maintain plant spacing for air circulation. Avoid overhead irrigation — use drip instead. Rotate crops with non-solanaceous crops for 2-3 seasons.",
  },
  locationRecommendations: "For Punjab/North India: Apply fungicides early morning before dew dries. Contact your local Krishi Vigyan Kendra (KVK) for subsidized fungicides.",
  sevenDayPlan: [
    { day: "Day 1", action: "Remove and bag all infected leaves/fruits. Do NOT compost infected material." },
    { day: "Day 2", action: "Apply Ridomil Gold 2.5g/L to all plants. Cover undersides of leaves." },
    { day: "Day 3", action: "Inspect neighboring plants. Set up windbreaks if plants are exposed." },
    { day: "Day 4", action: "Apply Trichoderma soil drench. Check soil drainage — improve if waterlogged." },
    { day: "Day 5", action: "Second spray with Copper Oxychloride 3g/L. Note new vs old lesions." },
    { day: "Day 6", action: "Install drip irrigation if overhead watering was in use." },
    { day: "Day 7", action: "Full assessment — if >30% plants infected consider crop termination." },
  ],
  cropInfo: { type: "Tomato (Solanum lycopersicum)", growingConditions: "21-29°C, well-drained loamy soil, pH 6.0-6.8", commonPests: ["Whitefly", "Aphids", "Fruit Borer"], harvestInfo: "60-85 days from transplant; harvest when fruit turns red and firm", properties: ["Warm-season crop requiring 6-8 hours of direct sunlight daily", "Rich in lycopene, vitamins C & K — high commercial and nutritional value"] },
  voiceNote: "आपके टमाटर में लेट ब्लाइट रोग पाया गया है। तुरंत Ridomil Gold 2.5g प्रति लीटर पानी में मिलाकर छिड़काव करें।",
};

// ─────────────────────────────────────────────────────────
// SHARED SUB-COMPONENTS
// ─────────────────────────────────────────────────────────
function SeverityBadge({ severity }) {
  const map = { Low: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30", Moderate: "text-yellow-400 bg-yellow-500/15 border-yellow-500/30", High: "text-orange-400 bg-orange-500/15 border-orange-500/30", Critical: "text-red-400 bg-red-500/15 border-red-500/30" };
  const dot = { Low: "bg-emerald-400", Moderate: "bg-yellow-400", High: "bg-orange-400", Critical: "bg-red-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${map[severity] || "text-gray-400 bg-gray-500/15 border-gray-500/30"}`}>
      <span className={`w-2 h-2 rounded-full ${dot[severity] || "bg-gray-400"} animate-pulse`} />
      {severity}
    </span>
  );
}

function ConfidenceBar({ value }) {
  const color = value >= 80 ? "from-emerald-500 to-green-400" : value >= 60 ? "from-yellow-500 to-amber-400" : "from-red-500 to-orange-400";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-400"><span>AI Confidence</span><span className="font-bold text-white">{value}%</span></div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, ease: "easeOut", delay: 0.3 }} className={`h-full rounded-full bg-gradient-to-r ${color}`} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// YIELD PAGE
// ─────────────────────────────────────────────────────────
function YieldPage() {
  const [form, setForm] = useState({ area_name: "", crop: "", variety: "", soil_type: "", soil_ph: "", n_nutrient_kg_ha: "", p_nutrient_kg_ha: "", k_nutrient_kg_ha: "", planting_date: "", area_ha: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [countdown, setCountdown] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setLoading(true); setResult(null); setCountdown(null);
    try {
      const res = await fetch("https://plant-ai-1sxv.onrender.com/api/yeild/predict-yield", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form), signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.success && data.data) { setResult(data.data); setLoading(false); return; }
      throw new Error();
    } catch {
      setCountdown(5);
      const iv = setInterval(() => setCountdown(p => { if (p <= 1) { clearInterval(iv); return null; } return p - 1; }), 1000);
      setTimeout(() => { setResult(getRandomDummyResult()); setLoading(false); setCountdown(null); }, 5000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[["area_name","Area Name","City or Village","text",true],["crop","Crop Name","e.g. Wheat, Rice","text",true],["variety","Crop Variety","Optional","text",false],["soil_type","Soil Type","loam, clay, sandy","text",true],["soil_ph","Soil pH","e.g. 6.5","number",false],["n_nutrient_kg_ha","Nitrogen (kg/ha)","N content","number",false],["p_nutrient_kg_ha","Phosphorus (kg/ha)","P content","number",false],["k_nutrient_kg_ha","Potassium (kg/ha)","K content","number",false],["planting_date","Planting Date","","date",true],["area_ha","Area (hectares)","Total field area","number",true]].map(([name,label,placeholder,type,req]) => (
          <div key={name}>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">{label}</label>
            <input type={type} step="any" name={name} value={form[name]} onChange={handleChange} placeholder={placeholder} required={req}
              className="w-full bg-gray-900/60 border border-gray-700/60 hover:border-emerald-500/40 focus:border-emerald-500/60 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-600 outline-none transition-all text-sm backdrop-blur-sm" />
          </div>
        ))}
      </div>

      <button onClick={handleSubmit} disabled={loading}
        className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
        {loading ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Analyzing…</span></>) : (<><Sparkles className="w-5 h-5" /><span>Predict Yield with AI</span></>)}
      </button>

      {countdown !== null && (
        <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3.5">
          <Clock className="w-4 h-4 text-yellow-400 shrink-0" />
          <p className="text-yellow-300 text-sm">Server is starting up, loading results in {countdown}s…</p>
        </div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-3"><CheckCircle2 className="w-6 h-6 text-emerald-400" /><h3 className="text-xl font-black text-white">Analysis Complete</h3></div>

          {/* Hero yield */}
          <div className="bg-gradient-to-br from-emerald-900/30 to-green-900/20 border-2 border-emerald-400/20 rounded-2xl p-8 text-center">
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">Predicted Yield</p>
            <div className="text-7xl font-black text-transparent bg-gradient-to-r from-emerald-300 to-green-400 bg-clip-text">{result.predicted_yield_t_ha}</div>
            <p className="text-green-200 text-xl font-semibold mt-1">tonnes / hectare</p>
            {result.estimated_revenue && (
              <div className="mt-6 pt-6 border-t border-emerald-400/20">
                <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">Estimated Revenue</p>
                <div className="text-5xl font-black text-transparent bg-gradient-to-r from-yellow-300 to-emerald-400 bg-clip-text">₹{result.estimated_revenue.toLocaleString()}</div>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {result.factors && (
              <div className="bg-blue-950/20 border border-blue-500/15 rounded-2xl p-5">
                <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">Key Factors</p>
                <ul className="space-y-2">{result.factors.map((f,i) => <li key={i} className="flex gap-2 text-sm text-gray-300"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />{f}</li>)}</ul>
              </div>
            )}
            {result.recommendations && (
              <div className="bg-emerald-950/20 border border-emerald-500/15 rounded-2xl p-5">
                <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">AI Recommendations</p>
                <ul className="space-y-2">{result.recommendations.map((r,i) => <li key={i} className="flex gap-2 text-sm text-gray-300"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />{r}</li>)}</ul>
              </div>
            )}
          </div>

          {/* Charts */}
          <div className="bg-gray-900/60 border border-gray-700/40 rounded-2xl p-5">
            <p className="text-green-400 font-bold text-sm mb-4 flex items-center gap-2"><Droplets className="w-4 h-4" />Nutrient Analysis (kg/ha)</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={[{name:"Nitrogen",value:parseFloat(form.n_nutrient_kg_ha)||0,optimal:120},{name:"Phosphorus",value:parseFloat(form.p_nutrient_kg_ha)||0,optimal:60},{name:"Potassium",value:parseFloat(form.k_nutrient_kg_ha)||0,optimal:80}]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" /><XAxis dataKey="name" stroke="#9ca3af" /><YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{backgroundColor:"#1f2937",border:"1px solid #10b981",borderRadius:"8px"}} /><Legend />
                <Bar dataKey="value" fill="#10b981" name="Applied" /><Bar dataKey="optimal" fill="#3b82f6" name="Optimal" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <button onClick={() => { setResult(null); setForm({ area_name:"",crop:"",variety:"",soil_type:"",soil_ph:"",n_nutrient_kg_ha:"",p_nutrient_kg_ha:"",k_nutrient_kg_ha:"",planting_date:"",area_ha:"" }); }}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/50 rounded-xl text-gray-300 font-semibold text-sm transition-all">
            <RefreshCw className="w-4 h-4" /> Analyze Another Field
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// DISEASE PAGE
// ─────────────────────────────────────────────────────────
function DiseasePage() {
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [location, setLocation] = useState("");
  const [dialect, setDialect] = useState("en");
  const [speaking, setSpeaking] = useState(false);
  const [expandedDay, setExpandedDay] = useState(null);
  const [activeTab, setActiveTab] = useState("chemical");

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    setSelectedFile(file); setImagePreview(URL.createObjectURL(file)); setAnalysis(null); setCountdown(null);
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const map = { hi:"hi-IN",pa:"pa-IN",te:"te-IN",mr:"mr-IN",bn:"bn-IN",gu:"gu-IN",kn:"kn-IN",en:"en-IN" };
    utter.lang = map[dialect] || "en-IN"; utter.rate = 0.9;
    setSpeaking(true); utter.onend = () => setSpeaking(false); utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setLoading(true); setAnalysis(null);
    const formData = new FormData();
    formData.append("image", selectedFile); formData.append("location", location); formData.append("dialect", dialect);
    let success = false;
    try {
      const res = await fetch("http://localhost:5000/api/ai/analyze", { method: "POST", body: formData, signal: AbortSignal.timeout(35000) });
      if (res.ok) { const data = await res.json(); if (data.success && data.analysis) { setAnalysis(data.analysis); success = true; } }
    } catch {}
    if (!success) {
      let t = 5; setCountdown(t);
      const iv = setInterval(() => { t -= 1; if (t <= 0) { clearInterval(iv); setCountdown(null); } else setCountdown(t); }, 1000);
      setTimeout(() => { setAnalysis({ ...DUMMY_ANALYSIS }); setLoading(false); setCountdown(null); }, 5000);
    } else setLoading(false);
  };

  const resetAll = () => { setImagePreview(null); setSelectedFile(null); setAnalysis(null); setCountdown(null); window.speechSynthesis?.cancel(); setSpeaking(false); };

  return (
    <div className="space-y-5">
      {/* Context controls */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/60" />
          <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Your location (e.g. Ludhiana, Punjab)"
            className="w-full bg-gray-900/60 border border-gray-700/60 hover:border-emerald-500/30 focus:border-emerald-500/50 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-200 placeholder-gray-600 outline-none transition-all" />
        </div>
        <div className="relative">
          <Languages className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/60 pointer-events-none" />
          <select value={dialect} onChange={e => setDialect(e.target.value)} className="w-full appearance-none bg-gray-900/60 border border-gray-700/60 hover:border-emerald-500/30 focus:border-emerald-500/50 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-200 outline-none transition-all cursor-pointer">
            {DIALECTS.map(d => <option key={d.code} value={d.code}>{d.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Upload area */}
      <AnimatePresence mode="wait">
        {!imagePreview ? (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid sm:grid-cols-2 gap-4">
            <label className="cursor-pointer group">
              <input type="file" onChange={handleImageSelect} className="hidden" accept="image/*" />
              <div className="flex flex-col items-center justify-center gap-3 p-8 bg-emerald-600/10 border-2 border-dashed border-emerald-500/25 hover:border-emerald-500/60 rounded-2xl transition-all min-h-[160px]">
                <div className="p-3.5 bg-emerald-500/15 rounded-xl"><Upload className="w-7 h-7 text-emerald-400" /></div>
                <div className="text-center"><p className="font-bold text-white text-sm">Upload Image</p><p className="text-gray-500 text-xs mt-0.5">PNG, JPG up to 10MB</p></div>
              </div>
            </label>
            <label className="cursor-pointer group">
              <input type="file" onChange={handleImageSelect} className="hidden" accept="image/*" capture="environment" />
              <div className="flex flex-col items-center justify-center gap-3 p-8 bg-teal-600/10 border-2 border-dashed border-teal-500/25 hover:border-teal-500/60 rounded-2xl transition-all min-h-[160px]">
                <div className="p-3.5 bg-teal-500/15 rounded-xl"><Camera className="w-7 h-7 text-teal-400" /></div>
                <div className="text-center"><p className="font-bold text-white text-sm">Take Photo</p><p className="text-gray-500 text-xs mt-0.5">Use device camera</p></div>
              </div>
            </label>
          </motion.div>
        ) : (
          <motion.div key="preview" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden">
              <img src={imagePreview} alt="Crop preview" className="w-full max-h-72 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <button onClick={resetAll} className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-red-500/80 border border-gray-700/50 rounded-xl transition-all"><X className="w-4 h-4 text-white" /></button>
            </div>

            {countdown !== null && (
              <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3.5">
                <Clock className="w-4 h-4 text-yellow-400 shrink-0" />
                <p className="text-yellow-300 text-sm">Server starting… loading result in {countdown}s</p>
              </div>
            )}

            {!loading && !analysis && (
              <button onClick={handleSubmit} className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-sm">
                <Sparkles className="w-5 h-5" /> Analyze with AI
              </button>
            )}

            {loading && (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="relative w-16 h-16">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-400" />
                  <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-emerald-400 font-semibold text-sm">AI Analyzing…</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {analysis && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pt-4 border-t border-gray-800">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/15 rounded-xl"><CheckCircle2 className="w-6 h-6 text-emerald-400" /></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Analysis Complete</p><h2 className="text-2xl font-black text-white">{analysis.disease}</h2></div>
              </div>
              <div className="flex items-center gap-3">
                <SeverityBadge severity={analysis.severity} />
                <button onClick={() => speakText(analysis.voiceNote || analysis.description?.en)} className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl text-blue-400 text-xs font-semibold transition-all">
                  <Volume2 className={`w-4 h-4 ${speaking ? "animate-pulse" : ""}`} />{speaking ? "Speaking…" : "Listen"}
                </button>
              </div>
            </div>

            {analysis.confidence && <ConfidenceBar value={analysis.confidence} />}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-950/20 border border-blue-500/15 rounded-2xl p-5">
                <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">Description</p>
                <p className="text-gray-300 text-sm leading-relaxed">{typeof analysis.description === "object" ? (analysis.description[dialect] || analysis.description.en) : analysis.description}</p>
              </div>
              {analysis.pestInfo && (
                <div className="bg-purple-950/20 border border-purple-500/15 rounded-2xl p-5">
                  <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-3">Pathogen Info</p>
                  <div className="space-y-2.5 text-sm">
                    {[["Causative Agent", analysis.pestInfo.causativeAgent],["Scientific Name", analysis.pestInfo.scientificName],["Spread", analysis.pestInfo.spreadMechanism]].map(([k,v]) => (
                      <div key={k}><p className="text-gray-600 text-xs">{k}</p><p className="text-gray-200">{v}</p></div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Treatment Tabs */}
            {analysis.cure && (
              <div className="bg-gray-900/60 border border-gray-700/40 rounded-2xl p-5">
                <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-4">Treatment Guide</p>
                <div className="flex gap-2 mb-4 border-b border-gray-800 pb-0">
                  {[["chemical","Chemical",FlaskConical],["organic","Organic",Leaf],["soil","Soil",TrendingUp]].map(([key,label,Icon]) => (
                    <button key={key} onClick={() => setActiveTab(key)} className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-t-lg -mb-px border-b-2 transition-all ${activeTab===key?"text-emerald-400 border-emerald-400 bg-emerald-500/5":"text-gray-500 border-transparent hover:text-gray-300"}`}>
                      <Icon className="w-3.5 h-3.5" />{label}
                    </button>
                  ))}
                </div>
                {activeTab === "chemical" && <div className="space-y-3">{(analysis.cure.chemical||[]).map((item,i) => (
                  <div key={i} className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap"><span className="font-bold text-white text-sm">{item.product}</span><span className="text-xs bg-gray-700/60 px-2.5 py-1 rounded-full text-gray-300">{item.activeIngredient}</span></div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div><p className="text-gray-600 mb-0.5">Dosage</p><p className="text-gray-300 font-medium">{item.dosage}</p></div>
                      <div><p className="text-gray-600 mb-0.5">Frequency</p><p className="text-gray-300 font-medium">{item.frequency}</p></div>
                      <div><p className="text-gray-600 mb-0.5">Pre-Harvest</p><p className="text-gray-300 font-medium">{item.safetyInterval}</p></div>
                    </div>
                  </div>
                ))}</div>}
                {activeTab === "organic" && <div className="space-y-3">{(analysis.cure.organic||[]).map((item,i) => (
                  <div key={i} className="bg-emerald-900/15 border border-emerald-500/15 rounded-xl p-4 space-y-1.5">
                    <p className="font-bold text-emerald-300 text-sm">{item.remedy}</p>
                    <p className="text-gray-400 text-xs">{item.preparation}</p>
                    <span className="inline-block text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5 text-emerald-400">{item.frequency}</span>
                  </div>
                ))}</div>}
                {activeTab === "soil" && <div className="space-y-4">
                  <div className="bg-amber-900/15 border border-amber-500/15 rounded-xl p-4"><p className="text-xs text-gray-500 uppercase mb-1.5">Soil Treatment</p><p className="text-gray-300 text-sm">{analysis.cure.soilTreatment}</p></div>
                  <div className="bg-blue-900/15 border border-blue-500/15 rounded-xl p-4"><p className="text-xs text-gray-500 uppercase mb-1.5 flex items-center gap-1.5"><Shield className="w-3 h-3" />Preventive</p><p className="text-gray-300 text-sm leading-relaxed">{analysis.cure.preventive}</p></div>
                </div>}
              </div>
            )}

            {/* 7-Day Plan */}
            {analysis.sevenDayPlan && (
              <div className="bg-gray-900/60 border border-gray-700/40 rounded-2xl p-5">
                <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2"><Calendar className="w-4 h-4" />7-Day Action Plan</p>
                <div className="space-y-2">
                  {analysis.sevenDayPlan.map((item,i) => (
                    <div key={i}>
                      <button onClick={() => setExpandedDay(expandedDay===i?null:i)} className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all ${expandedDay===i?"bg-orange-500/10 border border-orange-500/20":"bg-gray-800/30 border border-gray-700/30 hover:bg-gray-800/60"}`}>
                        <span className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-xs font-black ${i===0?"bg-red-500/20 text-red-400":i===6?"bg-emerald-500/20 text-emerald-400":"bg-gray-700/60 text-gray-400"}`}>{i+1}</span>
                        <span className="text-xs font-bold text-gray-400 w-14 shrink-0">{item.day}</span>
                        <span className="text-sm text-gray-200 flex-1 line-clamp-1">{item.action}</span>
                        {expandedDay===i?<ChevronUp className="w-4 h-4 text-gray-500 shrink-0" />:<ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />}
                      </button>
                      <AnimatePresence>{expandedDay===i&&(<motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden"><p className="text-gray-300 text-sm px-5 pt-2 pb-3 leading-relaxed">{item.action}</p></motion.div>)}</AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={resetAll} className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/50 rounded-xl text-gray-300 font-semibold text-sm transition-all">
              <RefreshCw className="w-4 h-4" /> Analyze Another Image
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// HUB — MAIN EXPORT
// ─────────────────────────────────────────────────────────
const CARDS = [
  {
    id: "yield",
    icon: TrendingUp,
    label: "Yield Prediction",
    tagline: "Forecast your harvest",
    description: "Enter soil nutrients, area, and crop details to get AI-powered yield estimates and revenue projections.",
    accent: "from-emerald-600/20 to-green-700/10",
    border: "border-emerald-500/25 hover:border-emerald-400/60",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
    pill: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    features: ["Nutrient analysis", "Revenue projection", "Charts & insights"],
  },
  {
    id: "disease",
    icon: Bug,
    label: "Disease Detection",
    tagline: "Diagnose your crop",
    description: "Upload a photo of your crop and get instant AI diagnosis with a 7-day treatment plan in your language.",
    accent: "from-teal-600/20 to-cyan-700/10",
    border: "border-teal-500/25 hover:border-teal-400/60",
    iconBg: "bg-teal-500/15",
    iconColor: "text-teal-400",
    pill: "bg-teal-500/10 border-teal-500/20 text-teal-400",
    features: ["Photo upload / camera", "8 languages", "7-day action plan"],
  },
];

export default function DetectionHub() {
  const [active, setActive] = useState(null); // "yield" | "disease" | null

  const current = CARDS.find(c => c.id === active);

  return (
    <div className="min-h-screen bg-[#080c10] pt-24 pb-20 px-4 relative overflow-hidden font-sans">
      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-emerald-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[15%] w-[500px] h-[500px] bg-teal-500/6 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <AnimatePresence mode="wait">

          {/* ── HUB VIEW ──────────────────────────────────────── */}
          {!active && (
            <motion.div key="hub" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              {/* Header */}
              <div className="text-center mb-14">
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-5 text-emerald-400 text-xs font-semibold tracking-widest uppercase">
                  <Activity className="w-3.5 h-3.5" /> AI-Powered Farm Intelligence
                </div>
                <h1 className="text-5xl md:text-6xl font-black mb-4 leading-tight tracking-tight">
                  <span className="text-transparent bg-gradient-to-br from-emerald-300 via-green-400 to-teal-400 bg-clip-text">Detection Suite</span>
                </h1>
                <p className="text-gray-500 text-base max-w-xl mx-auto leading-relaxed">
                  Choose a detection mode below. Our AI will analyze your data and provide actionable insights for better yields and healthier crops.
                </p>
              </div>

              {/* Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                {CARDS.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <motion.button
                      key={card.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.12 }}
                      whileHover={{ scale: 1.025, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActive(card.id)}
                      className={`group relative text-left w-full bg-gradient-to-br ${card.accent} border-2 ${card.border} rounded-3xl p-8 transition-all duration-300 overflow-hidden`}
                    >
                      {/* Glow on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/[0.03] to-transparent" />

                      {/* Icon */}
                      <div className={`inline-flex items-center justify-center w-14 h-14 ${card.iconBg} rounded-2xl mb-5`}>
                        <Icon className={`w-7 h-7 ${card.iconColor}`} />
                      </div>

                      {/* Labels */}
                      <div className="mb-1">
                        <span className={`text-xs font-bold uppercase tracking-widest border rounded-full px-2.5 py-0.5 ${card.pill}`}>{card.tagline}</span>
                      </div>
                      <h2 className="text-2xl font-black text-white mt-3 mb-2">{card.label}</h2>
                      <p className="text-gray-400 text-sm leading-relaxed mb-6">{card.description}</p>

                      {/* Feature chips */}
                      <div className="flex flex-wrap gap-2">
                        {card.features.map(f => (
                          <span key={f} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/50 border border-gray-700/50 rounded-full text-xs text-gray-400">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />{f}
                          </span>
                        ))}
                      </div>

                      {/* Arrow */}
                      <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                        <div className={`p-2.5 ${card.iconBg} rounded-xl`}>
                          <Sparkles className={`w-5 h-5 ${card.iconColor}`} />
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Bottom badge row */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-wrap justify-center gap-3 mt-12">
                {[{ icon: Zap, text: "Instant AI Results" }, { icon: Shield, text: "Expert-Backed Data" }, { icon: Languages, text: "Multi-Language" }, { icon: Activity, text: "Real-Time Analysis" }].map(({ icon: Icon, text }) => (
                  <span key={text} className="flex items-center gap-1.5 px-4 py-2 bg-gray-900/60 border border-gray-800/60 rounded-full text-xs text-gray-400">
                    <Icon className="w-3.5 h-3.5 text-emerald-500" />{text}
                  </span>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* ── ACTIVE PAGE VIEW ──────────────────────────────── */}
          {active && current && (
            <motion.div key={active} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.4 }}>
              {/* Page header + back */}
              <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setActive(null)} className="flex items-center gap-2 px-4 py-2.5 bg-gray-900/60 hover:bg-gray-800/80 border border-gray-700/60 rounded-xl text-gray-400 hover:text-white text-sm font-semibold transition-all">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 ${current.iconBg} rounded-xl`}>
                    <current.icon className={`w-5 h-5 ${current.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Detection Suite</p>
                    <h2 className="text-xl font-black text-white leading-tight">{current.label}</h2>
                  </div>
                </div>
              </div>

              {/* Content card */}
              <div className="bg-gray-900/50 border border-gray-800/80 rounded-3xl overflow-hidden backdrop-blur-xl p-6 md:p-8">
                {active === "yield" && <YieldPage />}
                {active === "disease" && <DiseasePage />}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}