"use client";

import { useState, useEffect, useMemo } from "react";

/* ─── DATA ──────────────────────────────────────────────────── */
const SCHEMES = [
  {
    id: "pmfby-001",
    title: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    description: "Comprehensive crop insurance scheme providing financial support to farmers suffering crop loss/damage due to unforeseen events like natural calamities, pests, and diseases.",
    category: "insurance", state: "All India",
    eligibility: ["All farmers including sharecroppers and tenant farmers", "Must have insurable interest in the insured crop", "Both loanee and non-loanee farmers are eligible"],
    benefits: ["Coverage for all stages of crop cycle including pre-sowing and post-harvest losses", "Premium subsidy up to 90% by government", "Use of technology for faster claim settlement"],
    documents: ["Aadhaar Card", "Land records (Khasra/Khatauni)", "Bank account details", "Sowing certificate"],
    applicationProcess: ["Visit nearest bank/CSC center or PM Fasal Bima portal", "Fill application form with crop and land details", "Pay applicable premium", "Receive policy document"],
    applyLink: "https://pmfby.gov.in", lastUpdated: "2024-10-15",
    farmerCategory: ["small", "marginal", "medium", "large", "tenant", "sharecropper"],
    cropTypes: ["wheat", "rice", "cotton", "groundnut", "sugarcane", "maize"],
    ministry: "Ministry of Agriculture & Farmers Welfare", fundingAmount: "Up to full sum insured", deadline: "Varies by crop season",
  },
  {
    id: "pmksy-002",
    title: "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
    description: "Aims to expand cultivable area under assured irrigation, improve on-farm water use efficiency, introduce sustainable water conservation practices.",
    category: "irrigation", state: "All India",
    eligibility: ["All categories of farmers", "Priority to drought-prone and water-scarce regions", "Group of farmers for watershed development"],
    benefits: ["55% subsidy for small and marginal farmers on micro-irrigation", "45% subsidy for other farmers", "End-to-end irrigation solution from source to field"],
    documents: ["Aadhaar Card", "Land ownership proof", "Bank account", "Quotation from approved vendor"],
    applicationProcess: ["Register on PMKSY portal or visit state agriculture department", "Submit application with land and crop details", "Technical verification by department", "Installation and subsidy disbursement"],
    applyLink: "https://pmksy.gov.in", lastUpdated: "2024-09-01",
    farmerCategory: ["small", "marginal", "medium", "large"], cropTypes: ["all"],
    ministry: "Ministry of Agriculture & Jal Shakti", fundingAmount: "55% subsidy for small/marginal farmers",
  },
  {
    id: "pm-kisan-003",
    title: "PM-KISAN Samman Nidhi",
    description: "Income support scheme providing ₹6000 per year in three installments to all landholding farmer families to supplement their financial needs.",
    category: "subsidy", state: "All India",
    eligibility: ["All landholding farmer families", "Land must be in farmer's name as per land records", "Excludes institutional landholders and constitutional post holders"],
    benefits: ["₹6,000 per year in 3 equal installments of ₹2,000 each", "Direct transfer to Aadhaar-linked bank account", "No restrictions on use of amount"],
    documents: ["Aadhaar Card", "Land records", "Bank account linked to Aadhaar", "Mobile number"],
    applicationProcess: ["Visit PM-KISAN portal or nearest CSC", "Self-registration or via local Patwari/Revenue Officer", "Submit required documents", "eKYC mandatory for receiving installments"],
    applyLink: "https://pmkisan.gov.in", lastUpdated: "2024-11-01",
    farmerCategory: ["small", "marginal", "medium", "large"], cropTypes: ["all"],
    ministry: "Ministry of Agriculture & Farmers Welfare", fundingAmount: "₹6,000 per year",
  },
  {
    id: "kcc-004",
    title: "Kisan Credit Card (KCC) Scheme",
    description: "Provides farmers with timely and adequate credit support for their agricultural operations at low interest rates.",
    category: "loan", state: "All India",
    eligibility: ["Farmers - individual/joint borrowers who are owner cultivators", "Tenant farmers, oral lessees, and sharecroppers", "SHGs or Joint Liability Groups of farmers"],
    benefits: ["Credit up to ₹3 lakh at subsidized interest rate of 4% p.a.", "Flexible repayment options aligned with harvest", "Personal accident insurance of ₹50,000", "No processing fee up to ₹3 lakh"],
    documents: ["Application form", "Aadhaar Card", "Land documents", "Two passport-size photographs", "Income proof"],
    applicationProcess: ["Apply at nearest bank branch or online", "Submit application with land documents", "Bank verification of land holding", "KCC issued with revolving credit limit"],
    applyLink: "https://www.nabard.org", lastUpdated: "2024-08-20",
    farmerCategory: ["small", "marginal", "medium", "large", "tenant", "sharecropper"], cropTypes: ["all"],
    ministry: "Ministry of Finance / NABARD", fundingAmount: "Up to ₹3 lakh at 4% interest",
  },
  {
    id: "soil-health-005",
    title: "Soil Health Card Scheme",
    description: "Provides information to farmers on nutrient status of their soil along with recommendations on appropriate dosage of nutrients for improving soil health and fertility.",
    category: "soil_health", state: "All India",
    eligibility: ["All farmers across India", "No land holding restriction"],
    benefits: ["Free soil health card every 2 years", "Crop-wise nutrient recommendations", "Guidance on reducing chemical fertilizer use", "Improved crop yields and reduced input costs"],
    documents: ["Aadhaar Card", "Land details"],
    applicationProcess: ["Register at soilhealth.dac.gov.in or nearest KVK", "Soil sample collection by agriculture department", "Testing at certified labs", "Receive Soil Health Card with recommendations"],
    applyLink: "https://soilhealth.dac.gov.in", lastUpdated: "2024-07-10",
    farmerCategory: ["small", "marginal", "medium", "large"], cropTypes: ["all"],
    ministry: "Ministry of Agriculture & Farmers Welfare", fundingAmount: "Free",
  },
  {
    id: "enam-006",
    title: "e-NAM (National Agriculture Market)",
    description: "Online trading platform for agricultural commodities to create a unified national market for agricultural produce.",
    category: "market_linkage", state: "All India",
    eligibility: ["All registered farmers", "Must be registered on e-NAM portal", "Farmers in states with integrated APMCs"],
    benefits: ["Access to wider market and better prices", "Transparent price discovery through bidding", "Reduced post-harvest losses", "Online payment directly to bank account"],
    documents: ["Aadhaar Card", "Bank account details", "Mobile number"],
    applicationProcess: ["Register at enam.gov.in", "Complete profile with bank and mobile details", "List your produce with quality parameters", "Participate in online bidding"],
    applyLink: "https://enam.gov.in", lastUpdated: "2024-10-05",
    farmerCategory: ["small", "marginal", "medium", "large"], cropTypes: ["wheat", "rice", "vegetables", "fruits", "pulses", "oilseeds"],
    ministry: "Ministry of Agriculture & Farmers Welfare", fundingAmount: "Free registration",
  },
];

const PRICES = [
  { id:"cp-001", cropName:"Wheat", market:"Azadpur Mandi", state:"Delhi", district:"North Delhi", minPrice:2150, maxPrice:2350, modalPrice:2250, unit:"quintal", updatedAt:new Date(Date.now()-3600000).toISOString(), trend:"up", trendPercent:2.3 },
  { id:"cp-002", cropName:"Rice (Basmati)", market:"Karnal Mandi", state:"Haryana", district:"Karnal", minPrice:3800, maxPrice:4500, modalPrice:4100, unit:"quintal", updatedAt:new Date(Date.now()-1800000).toISOString(), trend:"stable", trendPercent:0.1 },
  { id:"cp-003", cropName:"Cotton", market:"Rajkot Market Yard", state:"Gujarat", district:"Rajkot", minPrice:6200, maxPrice:7100, modalPrice:6600, unit:"quintal", updatedAt:new Date(Date.now()-7200000).toISOString(), trend:"down", trendPercent:-1.8 },
  { id:"cp-004", cropName:"Soybean", market:"Indore Mandi", state:"Madhya Pradesh", district:"Indore", minPrice:4200, maxPrice:4800, modalPrice:4500, unit:"quintal", updatedAt:new Date(Date.now()-5400000).toISOString(), trend:"up", trendPercent:3.1 },
  { id:"cp-005", cropName:"Potato", market:"Agra Mandi", state:"Uttar Pradesh", district:"Agra", minPrice:800, maxPrice:1200, modalPrice:1000, unit:"quintal", updatedAt:new Date(Date.now()-900000).toISOString(), trend:"down", trendPercent:-4.2 },
  { id:"cp-006", cropName:"Onion", market:"Lasalgaon Market", state:"Maharashtra", district:"Nashik", minPrice:1500, maxPrice:2800, modalPrice:2100, unit:"quintal", updatedAt:new Date(Date.now()-600000).toISOString(), trend:"up", trendPercent:8.5 },
  { id:"cp-007", cropName:"Tomato", market:"Kolar Market", state:"Karnataka", district:"Kolar", minPrice:600, maxPrice:1400, modalPrice:900, unit:"quintal", updatedAt:new Date(Date.now()-1200000).toISOString(), trend:"up", trendPercent:12.3 },
  { id:"cp-008", cropName:"Sugarcane", market:"Meerut Mandi", state:"Uttar Pradesh", district:"Meerut", minPrice:350, maxPrice:370, modalPrice:360, unit:"quintal", updatedAt:new Date(Date.now()-86400000).toISOString(), trend:"stable", trendPercent:0 },
  { id:"cp-009", cropName:"Maize", market:"Gulbarga Market", state:"Karnataka", district:"Kalaburagi", minPrice:1800, maxPrice:2100, modalPrice:1950, unit:"quintal", updatedAt:new Date(Date.now()-3000000).toISOString(), trend:"down", trendPercent:-0.8 },
  { id:"cp-010", cropName:"Groundnut", market:"Junagadh Market Yard", state:"Gujarat", district:"Junagadh", minPrice:5500, maxPrice:6200, modalPrice:5850, unit:"quintal", updatedAt:new Date(Date.now()-4800000).toISOString(), trend:"up", trendPercent:1.6 },
];

const NEWS = [
  { id:"n1", headline:"Government Raises MSP for Rabi Crops by 5–7% for 2024-25 Season", source:"The Hindu BusinessLine", link:"https://thehindubusinessline.com", publishedAt:new Date(Date.now()-3600000).toISOString(), preview:"The Cabinet Committee on Economic Affairs approved minimum support prices for rabi crops, providing significant relief to wheat and mustard growers.", category:"policy" },
  { id:"n2", headline:"IMD Predicts Above-Normal Rainfall in Northwest India — Good News for Wheat Farmers", source:"Krishijagran", link:"https://krishijagran.com", publishedAt:new Date(Date.now()-7200000).toISOString(), preview:"The India Meteorological Department's seasonal forecast indicates favorable conditions for rabi crops with above-normal winter rainfall expected across Punjab, Haryana, and UP.", category:"weather" },
  { id:"n3", headline:"PM-KISAN 18th Installment Released: ₹20,000 Crore Transferred to 9.4 Crore Farmers", source:"PIB India", link:"https://pib.gov.in", publishedAt:new Date(Date.now()-10800000).toISOString(), preview:"Prime Minister released the 18th installment under PM-KISAN scheme, with ₹2,000 directly transferred to the bank accounts of 9.4 crore eligible farmer families.", category:"schemes" },
  { id:"n4", headline:"Onion Prices Surge 35% in Major Mandis — Export Ban Lifted", source:"Economic Times", link:"https://economictimes.indiatimes.com", publishedAt:new Date(Date.now()-14400000).toISOString(), preview:"Onion prices jumped sharply at Lasalgaon and other major markets as the government lifted the export ban and removed minimum export price restrictions.", category:"market" },
  { id:"n5", headline:"ICAR Releases New High-Yield Rice Variety Resistant to Blast Disease", source:"AgriNews India", link:"https://agrinewsindia.com", publishedAt:new Date(Date.now()-21600000).toISOString(), preview:"ICAR has released a new paddy variety 'CR Dhan 310' with 25% higher yield potential and resistance to major diseases, suitable for eastern India.", category:"technology" },
  { id:"n6", headline:"Drone Didi Scheme: 15,000 Women SHGs to Get Agricultural Drones by March 2025", source:"DD Kisan", link:"https://ddkisan.gov.in", publishedAt:new Date(Date.now()-28800000).toISOString(), preview:"The Namo Drone Didi scheme is on track to provide agricultural drones to 15,000 women self-help groups, enabling precision spraying services.", category:"schemes" },
];

const INSIGHTS = [
  { icon:"🌱", title:"Small & Marginal Farmers", body:"PM-KISAN provides direct income support of ₹6,000/year. Combine with PMFBY insurance and KCC for a complete financial safety net. Prioritize PMKSY for irrigation subsidy up to 55%.", tags:["PM-KISAN","PMFBY","KCC","PMKSY"] },
  { icon:"💧", title:"Drought-Prone Region Farmers", body:"PMKSY is your top priority — eligible for 55% micro-irrigation subsidy. Soil Health Card will optimize water and fertilizer use. Register on e-NAM for better market access.", tags:["PMKSY","Soil Health","e-NAM"] },
  { icon:"🌾", title:"Wheat & Rabi Crop Growers", body:"PMFBY covers your rabi season against frost, hailstorm, and crop failures. Apply before rabi season cut-off. KCC enables working capital at only 4% interest rate.", tags:["PMFBY","KCC","MSP"] },
  { icon:"🧑‍🌾", title:"Tenant Farmers & Sharecroppers", body:"You are explicitly eligible for KCC loans and PMFBY insurance despite not owning land. Carry rental agreement or village-level verification to prove cultivation rights.", tags:["KCC","PMFBY","tenant rights"] },
  { icon:"📱", title:"Market Access & Better Prices", body:"Register on e-NAM platform for transparent online bidding across state markets. Often 8–15% better prices than local mandis. Free to join, requires Aadhaar + bank account.", tags:["e-NAM","market linkage","digital"] },
  { icon:"🧪", title:"Reduce Input Costs", body:"Soil Health Card is free and provides precise fertilizer recommendations, potentially cutting input costs by 10–20%. Start here before buying fertilizers for next season.", tags:["Soil Health","fertilizer","cost reduction"] },
];

const INDIAN_STATES = ["Delhi","Gujarat","Haryana","Karnataka","Madhya Pradesh","Maharashtra","Punjab","Rajasthan","Tamil Nadu","Uttar Pradesh","West Bengal"];
const CROP_TYPES = ["Wheat","Rice","Cotton","Soybean","Potato","Onion","Tomato","Sugarcane","Maize","Groundnut"];
const CATEGORY_TABS = ["all","subsidy","insurance","loan","irrigation"];
const CATEGORY_LABELS = { insurance:"Insurance", subsidy:"Subsidy", loan:"Loan", irrigation:"Irrigation", soil_health:"Soil Health", market_linkage:"Market", equipment:"Equipment", training:"Training" };
const PAGE_SIZE = 4;

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
// Premium dark green palette — deep forest, not black
const T = {
  bg:          "#030e08",  // deepest surface — rich dark forest
  bgCard:      "#061410",  // card surface
  bgElev:      "#0a1d12",  // elevated UI, inputs
  bgHover:     "#0e2418",  // hover state
  border:      "rgba(48,160,90,0.15)",
  borderHover: "rgba(48,160,90,0.42)",
  // Text — high contrast on dark green bg
  hi:          "#edf7f1",  // headlines, bold values — near white w/ green tint
  body:        "#a8cdb5",  // body copy — readable sage
  sub:         "#4f7d62",  // subtext, labels
  muted:       "#2e5242",  // very subtle / decorative
  // Accents
  green:       "#40d078",  // primary CTA — bright but not neon
  greenDim:    "#2aa358",  // secondary
  greenGlow:   "rgba(64,208,120,0.10)",
  greenBorder: "rgba(64,208,120,0.28)",
  amber:       "#d4ac3c",
  amberBg:     "rgba(212,172,60,0.10)",
  amberBorder: "rgba(212,172,60,0.24)",
  blue:        "#5cb8e0",
  red:         "#e06868",
};

/* ─── HELPERS ───────────────────────────────────────────────── */
const fmt = (n) => "₹" + n.toLocaleString("en-IN");
function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString("en-IN",{day:"numeric",month:"short"});
}

const BADGE_CLS = {
  insurance:    "text-blue-300 border-blue-400/25",
  subsidy:      "text-emerald-300 border-emerald-400/25",
  loan:         "text-amber-300 border-amber-400/25",
  irrigation:   "text-cyan-300 border-cyan-400/25",
  soil_health:  "text-yellow-300 border-yellow-400/22",
  market_linkage:"text-purple-300 border-purple-400/25",
  equipment:    "text-green-300 border-green-400/25",
  training:     "text-orange-300 border-orange-400/25",
};
const BADGE_BG = {
  insurance:"rgba(90,170,224,0.10)", subsidy:"rgba(64,208,120,0.09)", loan:"rgba(212,172,60,0.09)",
  irrigation:"rgba(80,210,230,0.09)", soil_health:"rgba(200,180,60,0.09)", market_linkage:"rgba(180,100,220,0.09)",
  equipment:"rgba(80,200,100,0.09)", training:"rgba(220,130,60,0.09)",
};
const NEWS_TAG = {
  policy:"bg-blue-500/10 text-blue-300", market:"bg-amber-500/10 text-amber-300",
  weather:"bg-cyan-400/10 text-cyan-200", technology:"bg-purple-500/10 text-purple-300",
  schemes:"bg-emerald-500/10 text-emerald-300", crop_advisory:"bg-lime-500/10 text-lime-300",
};

/* ─── ATOMS ─────────────────────────────────────────────────── */
function Badge({ category }) {
  return (
    <span className={`km-mono text-[10px] px-2.5 py-[3px] rounded-full uppercase tracking-wide border shrink-0 ${BADGE_CLS[category] || "text-gray-300 border-gray-500/25"}`}
      style={{ background: BADGE_BG[category] || "rgba(80,80,80,0.09)" }}>
      {CATEGORY_LABELS[category] || category}
    </span>
  );
}

function SectionHead({ emoji, title, right, id }) {
  return (
    <div id={id} className="flex items-center justify-between gap-4 mb-5">
      <h2 className="km-serif text-[21px] leading-tight flex items-center gap-3" style={{ color: T.hi }}>
        <span className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
          style={{ background: T.greenGlow, border: `1px solid rgba(64,208,120,0.15)` }}>{emoji}</span>
        {title}
      </h2>
      {right && <span className="km-mono text-[11px] whitespace-nowrap" style={{ color: T.muted }}>{right}</span>}
    </div>
  );
}

function ApplyLink({ href, large }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
      className={`inline-flex items-center gap-1.5 km-mono rounded-full transition-all ${large ? "text-[12px] px-5 py-2" : "text-[11px] px-3.5 py-1.5"}`}
      style={{ background: T.greenGlow, border: `1px solid ${T.greenBorder}`, color: T.green }}>
      Apply ↗
    </a>
  );
}

/* ─── SCHEME CARD ───────────────────────────────────────────── */
function SchemeCard({ scheme, onOpen }) {
  return (
    <div onClick={()=>onOpen(scheme)} role="button" tabIndex={0} onKeyPress={e=>e.key==="Enter"&&onOpen(scheme)}
      className="relative rounded-xl p-5 cursor-pointer transition-all duration-200 overflow-hidden flex flex-col"
      style={{ background: T.bgCard, border: `1px solid ${T.border}`, minHeight: "220px" }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=T.borderHover; e.currentTarget.style.background=T.bgHover; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 10px 40px rgba(0,0,0,0.55)";}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border; e.currentTarget.style.background=T.bgCard; e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="";}}>

      {/* Top row: title + badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="km-serif text-[15px] leading-[1.35]" style={{ color: T.hi }}>{scheme.title}</h3>
        <Badge category={scheme.category} />
      </div>

      {/* Description */}
      <p className="text-[13.5px] leading-[1.62] mb-3 line-clamp-2" style={{ color: T.body }}>{scheme.description}</p>

      {/* Funding amount */}
      {scheme.fundingAmount && (
        <div className="flex items-center gap-2 rounded-md px-3 py-2 mb-3 text-[12.5px] font-medium"
          style={{ background: T.amberBg, border: `1px solid ${T.amberBorder}`, color: T.amber }}>
          💰 {scheme.fundingAmount}
        </div>
      )}

      {/* Benefits — pushed to grow */}
      <div className="flex flex-col gap-2 mb-4 flex-1">
        {scheme.benefits.slice(0,2).map((b,i)=>(
          <div key={i} className="flex items-start gap-2.5 text-[13px] leading-[1.5]" style={{ color: T.body }}>
            <span className="w-[6px] h-[6px] rounded-full mt-1.5 shrink-0"
              style={{ background: T.green, boxShadow:`0 0 5px rgba(64,208,120,0.45)` }} />
            {b}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 mt-auto" style={{ borderTop: `1px solid ${T.border}` }}>
        <span className="km-mono text-[11px] truncate pr-2" style={{ color: T.sub }}>
          🏛 {scheme.ministry.split(" ").slice(0,3).join(" ")}
        </span>
        <ApplyLink href={scheme.applyLink} />
      </div>
    </div>
  );
}

/* ─── MODAL ─────────────────────────────────────────────────── */
function SchemeModal({ scheme, onClose }) {
  useEffect(()=>{
    const h = e=>e.key==="Escape"&&onClose();
    document.addEventListener("keydown",h);
    document.body.style.overflow="hidden";
    return ()=>{document.removeEventListener("keydown",h); document.body.style.overflow="";};
  },[onClose]);

  if (!scheme) return null;
  const sections = [
    { label:"Eligibility", items:scheme.eligibility },
    { label:"Benefits", items:scheme.benefits },
    { label:"Required Documents", items:scheme.documents },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background:"rgba(1,7,3,0.90)", backdropFilter:"blur(10px)" }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="rounded-xl max-w-[600px] w-full max-h-[88vh] overflow-y-auto"
        style={{ background:T.bgElev, border:`1px solid rgba(64,208,120,0.30)`, boxShadow:"0 32px 80px rgba(0,0,0,0.85)" }}>

        {/* Header */}
        <div className="sticky top-0 z-10 px-6 pt-5 pb-4 flex justify-between items-start gap-4"
          style={{ background:T.bgElev, borderBottom:`1px solid ${T.border}` }}>
          <div>
            <Badge category={scheme.category} />
            <h2 className="km-serif text-[19px] leading-snug mt-2.5" style={{ color:T.hi }}>{scheme.title}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg shrink-0 text-[15px] transition-all"
            style={{ border:`1px solid ${T.border}`, color:T.body }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=T.green; e.currentTarget.style.color=T.green;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.body;}}>✕</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <p className="text-[14px] leading-[1.7]" style={{ color:T.body }}>{scheme.description}</p>

          {scheme.fundingAmount && (
            <div className="rounded-lg px-4 py-3 text-[13px]" style={{ background:T.amberBg, border:`1px solid ${T.amberBorder}`, color:T.amber }}>
              💰 <strong>Benefit:</strong> {scheme.fundingAmount}
              {scheme.deadline && <> &nbsp;·&nbsp; 📅 {scheme.deadline}</>}
            </div>
          )}

          {sections.map(({label,items})=>(
            <div key={label}>
              <div className="flex items-center gap-3 mb-3">
                <span className="km-mono text-[10px] uppercase tracking-[2px] whitespace-nowrap" style={{ color:T.muted }}>{label}</span>
                <div className="flex-1 h-px" style={{ background:T.border }} />
              </div>
              <ul className="space-y-2">
                {items.map((item,i)=>(
                  <li key={i} className="flex items-start gap-3 text-[13.5px] leading-[1.6]" style={{ color:T.body }}>
                    <span className="shrink-0 mt-0.5 font-semibold" style={{ color:T.green }}>→</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="km-mono text-[10px] uppercase tracking-[2px] whitespace-nowrap" style={{ color:T.muted }}>Application Process</span>
              <div className="flex-1 h-px" style={{ background:T.border }} />
            </div>
            <ol className="space-y-2.5">
              {scheme.applicationProcess.map((step,i)=>(
                <li key={i} className="flex items-start gap-3 text-[13.5px] leading-[1.6]" style={{ color:T.body }}>
                  <span className="w-6 h-6 shrink-0 flex items-center justify-center rounded-full km-mono text-[11px] font-bold"
                    style={{ background:T.greenGlow, border:`1px solid ${T.greenBorder}`, color:T.green }}>{i+1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="flex items-center justify-between pt-4" style={{ borderTop:`1px solid ${T.border}` }}>
            <span className="km-mono text-[11px]" style={{ color:T.muted }}>Updated: {scheme.lastUpdated} · {scheme.ministry}</span>
            <ApplyLink href={scheme.applyLink} large />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── PRICE ROW ─────────────────────────────────────────────── */
function PriceRow({ price }) {
  const trendStyle = {
    up:     { background:"rgba(30,140,70,0.12)", color:"#50dd88" },
    down:   { background:"rgba(220,80,80,0.10)", color:"#e07878" },
    stable: { background:"rgba(60,80,68,0.15)",  color:T.sub },
  }[price.trend];
  const arrow = { up:"↑", down:"↓", stable:"→" }[price.trend];
  const label = price.trendPercent !== 0 ? `${arrow} ${Math.abs(price.trendPercent).toFixed(1)}%` : "→ Stable";

  return (
    <tr style={{ borderBottom:`1px solid rgba(48,160,90,0.07)` }}
      onMouseEnter={e=>e.currentTarget.style.background="rgba(64,208,120,0.04)"}
      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
      <td className="px-5 py-3.5">
        <span className="km-serif text-[15px]" style={{ color:T.hi }}>{price.cropName}</span>
      </td>
      <td className="px-5 py-3.5">
        <div className="text-[13px]" style={{ color:T.body }}>{price.market}</div>
        <div className="km-mono text-[11px] mt-0.5" style={{ color:T.muted }}>{price.district}, {price.state}</div>
      </td>
      <td className="px-5 py-3.5 km-mono text-[13px]" style={{ color:T.body }}>{fmt(price.minPrice)}</td>
      <td className="px-5 py-3.5 km-mono text-[13px]" style={{ color:T.body }}>{fmt(price.maxPrice)}</td>
      <td className="px-5 py-3.5 km-mono text-[14px] font-semibold" style={{ color:T.green }}>{fmt(price.modalPrice)}</td>
      <td className="px-5 py-3.5">
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg km-mono text-[11px] font-medium" style={trendStyle}>{label}</span>
      </td>
      <td className="px-5 py-3.5 km-mono text-[11px]" style={{ color:T.muted }}>{relativeTime(price.updatedAt)}</td>
    </tr>
  );
}

/* ─── MAIN ──────────────────────────────────────────────────── */
export default function KrishiMitra() {
  const [liveTime, setLiveTime] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [newsKey, setNewsKey] = useState(0);
  const [searchQ, setSearchQ] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterFarmer, setFilterFarmer] = useState("");
  const [filterCrop, setFilterCrop] = useState("");
  const [priceSearch, setPriceSearch] = useState("");
  const [priceState, setPriceState] = useState("");
  const [sortCol, setSortCol] = useState("");
  const [sortDir, setSortDir] = useState("asc");

  useEffect(()=>{
    const upd = ()=>setLiveTime("Live · "+new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}));
    upd(); const iv=setInterval(upd,60000); return ()=>clearInterval(iv);
  },[]);

  const filteredSchemes = useMemo(()=>{
    const q = searchQ.toLowerCase();
    return SCHEMES.filter(s=>{
      if (activeTab!=="all" && s.category!==activeTab) return false;
      if (q && !s.title.toLowerCase().includes(q) && !s.description.toLowerCase().includes(q)) return false;
      if (filterState && s.state!=="All India" && s.state!==filterState) return false;
      if (filterCategory && s.category!==filterCategory) return false;
      if (filterFarmer && !s.farmerCategory.includes(filterFarmer)) return false;
      if (filterCrop && !s.cropTypes.includes("all") && !s.cropTypes.includes(filterCrop)) return false;
      return true;
    });
  },[searchQ,filterState,filterCategory,filterFarmer,filterCrop,activeTab]);

  const totalPages = Math.ceil(filteredSchemes.length/PAGE_SIZE);
  const pagedSchemes = filteredSchemes.slice((currentPage-1)*PAGE_SIZE, currentPage*PAGE_SIZE);

  const filteredPrices = useMemo(()=>{
    let data = PRICES.filter(p=>{
      if (priceSearch && !p.cropName.toLowerCase().includes(priceSearch.toLowerCase())) return false;
      if (priceState && p.state!==priceState) return false;
      return true;
    });
    if (sortCol) data = [...data].sort((a,b)=>{
      const av=a[sortCol], bv=b[sortCol], dir=sortDir==="asc"?1:-1;
      if (typeof av==="number") return (av-bv)*dir;
      return String(av).localeCompare(String(bv))*dir;
    });
    return data;
  },[priceSearch,priceState,sortCol,sortDir]);

  const handleSort = col=>{
    if (sortCol===col) setSortDir(d=>d==="asc"?"desc":"asc");
    else { setSortCol(col); setSortDir("asc"); }
  };
  const resetFilters = ()=>{ setSearchQ(""); setFilterState(""); setFilterCategory(""); setFilterFarmer(""); setFilterCrop(""); setActiveTab("all"); setCurrentPage(1); };
  const scrollTo = id=>document.getElementById(id)?.scrollIntoView({behavior:"smooth"});
  const sortArrow = col=>sortCol===col?(sortDir==="asc"?" ↑":" ↓"):" ↕";

  const inputSty = { background:T.bgElev, border:`1px solid ${T.border}`, color:T.hi, outline:"none" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Literata:ital,opsz,wght@0,7..72,400..600;1,7..72,400..600&family=DM+Mono:wght@400;500&display=swap');

        .km-root   { font-family:'Literata',Georgia,serif; font-size:15px; line-height:1.65; color:${T.body}; }
        .km-serif  { font-family:'DM Serif Display',Georgia,serif; }
        .km-mono   { font-family:'DM Mono','Courier New',monospace; }

        /* scrollbar */
        ::-webkit-scrollbar          { width:5px; height:5px; }
        ::-webkit-scrollbar-track    { background:${T.bg}; }
        ::-webkit-scrollbar-thumb    { background:${T.greenDim}; border-radius:4px; }

        /* animations */
        @keyframes kmFade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .km-fade { animation:kmFade 0.45s ease both; }
        .km-s>*:nth-child(1){animation:kmFade 0.45s 0.04s ease both}
        .km-s>*:nth-child(2){animation:kmFade 0.45s 0.09s ease both}
        .km-s>*:nth-child(3){animation:kmFade 0.45s 0.14s ease both}
        .km-s>*:nth-child(4){animation:kmFade 0.45s 0.19s ease both}
        .km-s>*:nth-child(5){animation:kmFade 0.45s 0.24s ease both}
        .km-s>*:nth-child(6){animation:kmFade 0.45s 0.29s ease both}

        @keyframes kmPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.35;transform:scale(0.72)}}
        .km-pulse{animation:kmPulse 2s infinite}

        /* insight top stripe */
        .km-insight::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,${T.green},rgba(64,208,120,0.16) 65%,transparent)}

        /* form controls */
        .km-field{transition:border-color 0.18s,box-shadow 0.18s}
        .km-field::placeholder{color:${T.muted}}
        .km-field:focus{border-color:rgba(64,208,120,0.55)!important;box-shadow:0 0 0 3px rgba(64,208,120,0.07)}

        /* custom select arrow */
        .km-sel{
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7'%3E%3Cpath d='M1 1l4.5 5L10 1' stroke='%2340d078' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat:no-repeat;background-position:right 10px center;
          padding-right:28px!important;-webkit-appearance:none;appearance:none;
        }
        .km-sel:focus{border-color:rgba(64,208,120,0.55)!important;box-shadow:0 0 0 3px rgba(64,208,120,0.07);outline:none}
      `}</style>

      <div className="km-root min-h-screen overflow-x-hidden" style={{ background:T.bg }}>

        {/* ── BG GLOW ─────────────────────────────── */}
        <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
          <div className="absolute inset-0" style={{
            background:"radial-gradient(ellipse 80% 50% at 8% 0%,rgba(12,70,34,0.25) 0%,transparent 56%),radial-gradient(ellipse 55% 40% at 92% 90%,rgba(6,44,22,0.20) 0%,transparent 52%)"
          }} />
        </div>


        <div className="max-w-[1360px] mx-auto px-6 relative z-10">

          {/* ── HERO ─────────────────────────────── */}
          <section className="km-fade pt-12 pb-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-end">
            <div>
              <h1 className="km-serif leading-[1.17] tracking-tight" style={{ fontSize:"clamp(30px,3.8vw,46px)", color:T.hi }}>
                All farming knowledge,<br/>
                <em style={{ color:T.green }}>one trusted dashboard.</em>
              </h1>
              <p className="mt-3 text-[15px] max-w-lg leading-[1.7]" style={{ color:T.body }}>
                Government schemes, live mandi prices, and agriculture news — curated for Indian farmers in real time.
              </p>
            </div>
            <div className="flex lg:flex-col gap-3 lg:items-end">
              {[["6","Active Schemes"],["10","Mandi Prices"]].map(([n,l])=>(
                <div key={l} className="rounded-xl px-5 py-3.5 min-w-[150px] text-right"
                  style={{ background:"linear-gradient(135deg,#091d12,#061410)", border:`1px solid rgba(64,208,120,0.20)`, boxShadow:"inset 0 1px 0 rgba(64,208,120,0.09)" }}>
                  <div className="km-serif text-[32px] leading-none" style={{ color:T.green }}>{n}</div>
                  <div className="km-mono text-[11px] uppercase tracking-[1px] mt-1" style={{ color:T.muted }}>{l}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── FILTER BAR ──────────────────────── */}
          <div className="rounded-xl px-5 py-4 mb-7 flex flex-wrap gap-3 items-center"
            style={{ background:T.bgCard, border:`1px solid ${T.border}`, boxShadow:"0 2px 20px rgba(0,0,0,0.40)" }}>
            <span className="km-mono text-[11px] uppercase tracking-[1.8px] whitespace-nowrap" style={{ color:T.muted }}>Filter</span>

            <div className="relative flex-1 min-w-[180px] max-w-[320px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[15px]" style={{ color:T.muted }}>⌕</span>
              <input type="text" value={searchQ} onChange={e=>{setSearchQ(e.target.value);setCurrentPage(1);}}
                placeholder="Search schemes…"
                className="km-root km-field w-full rounded-lg text-[13.5px] pl-8 pr-3 py-2 transition-all"
                style={inputSty} />
            </div>

            <div className="w-px h-5 shrink-0" style={{ background:T.border }} />

            {[
              [filterState,setFilterState,"All States",INDIAN_STATES.map(s=>[s,s])],
              [filterCategory,setFilterCategory,"All Categories",[["subsidy","Subsidy"],["insurance","Insurance"],["loan","Loan"],["irrigation","Irrigation"],["soil_health","Soil Health"],["market_linkage","Market Linkage"]]],
              [filterFarmer,setFilterFarmer,"All Farmers",[["small","Small"],["marginal","Marginal"],["medium","Medium"],["large","Large"],["tenant","Tenant"],["sharecropper","Sharecropper"]]],
              [filterCrop,setFilterCrop,"All Crops",CROP_TYPES.map(c=>[c.toLowerCase(),c])],
            ].map(([val,setter,ph,opts],i)=>(
              <select key={i} value={val} onChange={e=>{setter(e.target.value);setCurrentPage(1);}}
                className="km-root km-sel km-field rounded-lg text-[13.5px] px-3 py-2 cursor-pointer transition-all"
                style={inputSty}>
                <option value="">{ph}</option>
                {opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            ))}

            <button onClick={resetFilters}
              className="km-mono text-[11px] px-4 py-2 rounded-full transition-all shrink-0"
              style={{ background:T.greenGlow, border:`1px solid ${T.greenBorder}`, color:T.green }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(64,208,120,0.18)";}}
              onMouseLeave={e=>{e.currentTarget.style.background=T.greenGlow;}}>
              ↺ Reset
            </button>
          </div>

          {/* ── 2-COLUMN ─────────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_308px] gap-6 mb-10">

            {/* LEFT — Schemes */}
            <div>
              <SectionHead emoji="🏛️" title="Government Schemes" id="schemes-section"
                right={`${filteredSchemes.length} scheme${filteredSchemes.length!==1?"s":""} found`} />

              {/* Category tabs */}
              <div className="flex gap-1 p-1 rounded-[10px] w-fit mb-6"
                style={{ background:T.bgElev, border:`1px solid ${T.border}` }}>
                {CATEGORY_TABS.map(cat=>(
                  <button key={cat} onClick={()=>{setActiveTab(cat);setCurrentPage(1);}}
                    className="km-root text-[13px] px-4 py-1.5 rounded-[7px] capitalize transition-all"
                    style={activeTab===cat
                      ? {background:T.greenGlow,color:T.green,border:`1px solid ${T.greenBorder}`}
                      : {background:"transparent",color:T.muted,border:"1px solid transparent"}}>
                    {cat}
                  </button>
                ))}
              </div>

              {pagedSchemes.length===0 ? (
                <div className="text-center py-14" style={{ color:T.muted }}>
                  <div className="text-4xl mb-3">🌿</div>
                  <p className="text-[14px]">No schemes match your filters. Try adjusting your search.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 km-s">
                  {pagedSchemes.map(s=><SchemeCard key={s.id} scheme={s} onOpen={setSelectedScheme} />)}
                </div>
              )}

              {totalPages>1 && (
                <div className="flex items-center justify-center gap-1.5 mt-6">
                  <button onClick={()=>setCurrentPage(p=>p-1)} disabled={currentPage===1}
                    className="w-8 h-8 flex items-center justify-center rounded-md km-mono text-[13px] transition-all"
                    style={{ background:T.bgCard, border:`1px solid ${T.border}`, color:T.body, opacity:currentPage===1?0.3:1, cursor:currentPage===1?"not-allowed":"pointer" }}>‹</button>
                  {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                    <button key={p} onClick={()=>setCurrentPage(p)}
                      className="w-8 h-8 flex items-center justify-center rounded-md km-mono text-[12px] transition-all"
                      style={{ background:p===currentPage?T.greenGlow:T.bgCard, border:`1px solid ${p===currentPage?T.greenBorder:T.border}`, color:p===currentPage?T.green:T.body }}>{p}</button>
                  ))}
                  <button onClick={()=>setCurrentPage(p=>p+1)} disabled={currentPage===totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-md km-mono text-[13px] transition-all"
                    style={{ background:T.bgCard, border:`1px solid ${T.border}`, color:T.body, opacity:currentPage===totalPages?0.3:1, cursor:currentPage===totalPages?"not-allowed":"pointer" }}>›</button>
                </div>
              )}
            </div>

            {/* RIGHT — News */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                  style={{ background:"rgba(90,184,224,0.09)", border:"1px solid rgba(90,184,224,0.15)" }}>📰</span>
                <h2 className="km-serif text-[20px]" style={{ color:T.hi }}>Agri News</h2>
              </div>
              <div key={newsKey} className="rounded-xl overflow-hidden" style={{ background:T.bgCard, border:`1px solid ${T.border}` }}>
                {NEWS.map(n=>(
                  <a key={n.id} href={n.link} target="_blank" rel="noopener noreferrer"
                    className="block px-4 py-4 no-underline group transition-colors"
                    style={{ borderBottom:`1px solid ${T.border}` }}
                    onMouseEnter={e=>e.currentTarget.style.background=T.bgHover}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <span className={`inline-block km-mono text-[9px] uppercase tracking-[1.5px] px-2 py-0.5 rounded-md mb-2 ${NEWS_TAG[n.category]||"bg-gray-500/10 text-gray-400"}`}>
                      {n.category.replace("_"," ")}
                    </span>
                    <div className="text-[13.5px] font-semibold leading-[1.4] mb-1.5 line-clamp-2 transition-colors group-hover:text-emerald-300" style={{ color:T.hi }}>
                      {n.headline}
                    </div>
                    <div className="text-[12px] leading-[1.55] line-clamp-2 mb-2" style={{ color:T.muted }}>{n.preview}</div>
                    <div className="flex items-center justify-between">
                      <span className="km-mono text-[10px]" style={{ color:T.muted }}>{n.source}</span>
                      <span className="km-mono text-[10px]" style={{ color:T.muted }}>{relativeTime(n.publishedAt)}</span>
                    </div>
                  </a>
                ))}
                <button onClick={()=>setNewsKey(k=>k+1)}
                  className="w-full km-mono text-[11px] py-3 flex items-center justify-center gap-1.5 transition-all"
                  style={{ background:T.bgElev, borderTop:`1px solid ${T.border}`, color:T.muted }}
                  onMouseEnter={e=>{e.currentTarget.style.color=T.green; e.currentTarget.style.background=T.bgHover;}}
                  onMouseLeave={e=>{e.currentTarget.style.color=T.muted; e.currentTarget.style.background=T.bgElev;}}>
                  ↻ Refresh Feed
                </button>
              </div>
            </div>
          </div>

          {/* ── PRICES TABLE ─────────────────────── */}
          <section className="mb-10">
            <SectionHead emoji="📊" title="Daily Mandi Prices" id="prices-section"
              right={`${filteredPrices.length} markets · Updated just now`} />

            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative min-w-[190px] max-w-[290px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color:T.muted }}>⌕</span>
                <input type="text" value={priceSearch} onChange={e=>setPriceSearch(e.target.value)}
                  placeholder="Search crop…" className="km-root km-field w-full rounded-lg text-[13.5px] pl-8 pr-3 py-2 transition-all"
                  style={inputSty} />
              </div>
              <select value={priceState} onChange={e=>setPriceState(e.target.value)}
                className="km-root km-sel km-field rounded-lg text-[13.5px] px-3 py-2 cursor-pointer transition-all"
                style={inputSty}>
                <option value="">All States</option>
                {INDIAN_STATES.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="rounded-xl overflow-hidden" style={{ background:T.bgCard, border:`1px solid ${T.border}`, boxShadow:"0 4px 28px rgba(0,0,0,0.45)" }}>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {[["cropName","Crop"],["","Market"],["minPrice","Min ₹"],["maxPrice","Max ₹"],["modalPrice","Modal ₹"],["","Trend"],["updatedAt","Updated"]].map(([col,label])=>(
                        <th key={label} onClick={()=>col&&handleSort(col)}
                          className={`km-mono text-[10px] uppercase tracking-[1.5px] px-5 py-3.5 text-left whitespace-nowrap ${col?"cursor-pointer":""}`}
                          style={{ background:"rgba(5,18,10,0.97)", borderBottom:`1px solid rgba(64,208,120,0.12)`, color:sortCol===col?T.green:T.muted }}
                          onMouseEnter={e=>col&&(e.currentTarget.style.color=T.green)}
                          onMouseLeave={e=>col&&(e.currentTarget.style.color=sortCol===col?T.green:T.muted)}>
                          {label}{col&&sortArrow(col)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPrices.length===0
                      ? <tr><td colSpan={7} className="text-center py-12 km-root text-[14px]" style={{ color:T.muted }}>No price data found.</td></tr>
                      : filteredPrices.map(p=><PriceRow key={p.id} price={p} />)
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ── INSIGHTS ─────────────────────────── */}
          <section className="mb-14">
            <SectionHead emoji="💡" title="Farmer Benefit Insights" id="insights-section" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 km-s">
              {INSIGHTS.map(ins=>(
                <div key={ins.title} className="km-insight relative rounded-xl p-5 overflow-hidden"
                  style={{ background:T.bgCard, border:`1px solid ${T.border}`, boxShadow:"0 2px 18px rgba(0,0,0,0.35)" }}>
                  <div className="text-[26px] mb-3 leading-none">{ins.icon}</div>
                  <div className="km-serif text-[16px] leading-snug mb-2" style={{ color:T.hi }}>{ins.title}</div>
                  <div className="text-[13.5px] leading-[1.7]" style={{ color:T.body }}>{ins.body}</div>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {ins.tags.map(t=>(
                      <span key={t} className="km-mono text-[10px] px-2.5 py-0.5 rounded-lg uppercase tracking-wide"
                        style={{ background:T.bgElev, border:`1px solid ${T.border}`, color:T.sub }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── FOOTER ──────────────────────────────── */}
        <footer className="km-mono text-[11px] text-center py-6 tracking-wide"
          style={{ borderTop:`1px solid ${T.border}`, color:T.muted }}>
          KrishiMitra · Data sourced from Government of India portals · For informational purposes only
        </footer>

        {selectedScheme && <SchemeModal scheme={selectedScheme} onClose={()=>setSelectedScheme(null)} />}
      </div>
    </>
  );
}