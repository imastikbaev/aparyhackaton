/* ═══════════════════════════════════════════
   APARU QR Taxi — React Application
   Organised by concern, all ТЗ screens present.

   Sections:
   1.  Map marker factories
   2.  SVG Icons & Payment Icons
   3.  Shared UI components
   4.  GeoSearch autocomplete
   5.  LeafletMap wrapper
   6.  Screen 1 — Welcome
   7.  Screen 2 — Trip Details
   8.  Screen 3 — Phone Entry
   9.  Screen 4 — OTP Verification
   10. Screen 5 — Searching Driver
   11. Screen 6 — Driver En Route + Arrived  ← ТЗ §3.5 "водитель прибыл"
   12. Screen 7 — Trip Active
   13. Screen 8 — Completed + App CTA        ← ТЗ §3.7
   14. App root
═══════════════════════════════════════════ */

/* Global references (defined in config.js / data.js) */
// C, API, IS_DEV, getQRParams, UKA_ADDRESSES, searchLocal

const { useState, useEffect, useRef, useCallback, useMemo } = React;
const { Wallet: LuWallet, Coins: LuCoins, Handshake: LuHandshake, X: LuX, Check: LuCheck, Users: LuUsers, Download: LuDownload, Share2: LuShare, CreditCard: LuCard } = LucideReact;

/* ── Demo car data per tariff ─────────── */
const DEMO_CARS = {
  economy: {
    model:    'Lada Priora',
    color:    'Серебристый',
    colorDot: '#C0C0C0',
    plate:    '458 КА 01',
    driver:   'Даурен К.',
    rating:   4.7,
    trips:    198,
    eta:      3,
    gradient: `#4F46E5, #7C3AED`,
  },
  comfort: {
    model:    'Chevrolet Cobalt',
    color:    'Белый',
    colorDot: '#E5E5EA',
    plate:    '221 АВ 01',
    driver:   'Сергей Н.',
    rating:   4.8,
    trips:    256,
    eta:      5,
    gradient: `${C.teal}, #00C4CF`,
  },
  business: {
    model:    'Toyota Camry',
    color:    'Чёрный',
    colorDot: '#3A3A3C',
    plate:    '777 АА 01',
    driver:   'Алексей М.',
    rating:   4.9,
    trips:    312,
    eta:      7,
    gradient: `${C.org}, #FF8C40`,
  },
};

/* ═══════════════════════════════════════════
   §1 — MAP MARKER FACTORIES
═══════════════════════════════════════════ */
const createPinA = () => L.divIcon({
  className: '',
  html: `<svg width="42" height="76" viewBox="0 0 42 76" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M24.7229 73.2031C23.6668 73.7311 22.3477 74 21 74C19.6523 74 18.3332 73.7311 17.2771 73.2031C16.3407 72.7348 15 71.7179 15 70C15 68.2821 16.3407 67.2652 17.2771 66.7969C18.3332 66.2689 19.6523 66 21 66C22.3477 66 23.6668 66.2689 24.7229 66.7969C25.6593 67.2652 27 68.2821 27 70C27 71.7179 25.6593 72.7348 24.7229 73.2031ZM21 72C23.2091 72 25 71.1046 25 70C25 68.8954 23.2091 68 21 68C18.7909 68 17 68.8954 17 70C17 71.1046 18.7909 72 21 72Z" fill="white"/>
    <path d="M21 9C32.0397 9 40.9998 17.896 41 28.8828C41 35.6659 37.5824 41.654 32.374 45.2402C28.8243 47.7692 26.4758 50.2528 25.0078 52.8633C23.5438 55.4667 22.919 58.2607 22.9189 61.4717V69.0811C22.9187 70.1409 22.0599 71 21 71C19.9401 71 19.0813 70.1409 19.0811 69.0811V61.4717C19.081 58.2607 18.4562 55.4667 16.9922 52.8633C15.5242 50.2528 13.1757 47.7692 9.62598 45.2402L9.14258 44.8965C4.20699 41.2785 1 35.4539 1 28.8828C1.00024 17.896 9.96027 9 21 9Z" fill="#FC6500" stroke="white" stroke-width="2"/>
    <path d="M17.1425 36H13.7152L18.9374 20.8727H23.0589L28.2737 36H24.8464L21.0572 24.3295H20.9391L17.1425 36ZM16.9283 30.054H25.0237V32.5506H16.9283V30.054Z" fill="white"/>
    <ellipse cx="21" cy="70" rx="4" ry="2" fill="#8D8E93" opacity="0.5"/>
  </svg>`,
  iconSize: [42, 76], iconAnchor: [21, 76],
});

const createPinB = () => L.divIcon({
  className: '',
  html: `<svg width="42" height="76" viewBox="0 0 42 76" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M24.7229 73.2031C23.6668 73.7311 22.3477 74 21 74C19.6523 74 18.3332 73.7311 17.2771 73.2031C16.3407 72.7348 15 71.7179 15 70C15 68.2821 16.3407 67.2652 17.2771 66.7969C18.3332 66.2689 19.6523 66 21 66C22.3477 66 23.6668 66.2689 24.7229 66.7969C25.6593 67.2652 27 68.2821 27 70C27 71.7179 25.6593 72.7348 24.7229 73.2031Z" fill="white"/>
    <path d="M21 9C32.0397 9 40.9998 17.896 41 28.8828C41 35.6659 37.5824 41.654 32.374 45.2402C28.8243 47.7692 26.4758 50.2528 25.0078 52.8633C23.5438 55.4667 22.919 58.2607 22.9189 61.4717V69.0811C22.9187 70.1409 22.0599 71 21 71C19.9401 71 19.0813 70.1409 19.0811 69.0811V61.4717C19.081 58.2607 18.4562 55.4667 16.9922 52.8633C15.5242 50.2528 13.1757 47.7692 9.62598 45.2402L9.14258 44.8965C4.20699 41.2785 1 35.4539 1 28.8828C1.00024 17.896 9.96027 9 21 9Z" fill="#009AA3" stroke="white" stroke-width="2"/>
    <path d="M15.439 36V20.8727H21.4958C22.6087 20.8727 23.5369 21.0377 24.2805 21.3676C25.024 21.6975 25.5829 22.1555 25.9572 22.7415C26.3314 23.3225 26.5185 23.9922 26.5185 24.7506C26.5185 25.3415 26.4004 25.861 26.164 26.3091C25.9276 26.7523 25.6026 27.1167 25.189 27.4023C24.7803 27.683 24.3125 27.8824 23.7856 28.0006V28.1483C24.3617 28.1729 24.9009 28.3354 25.4032 28.6358C25.9104 28.9362 26.3216 29.3572 26.6367 29.8989C26.9519 30.4356 27.1094 31.0758 27.1094 31.8193C27.1094 32.622 26.91 33.3384 26.5112 33.9687C26.1172 34.5941 25.5337 35.089 24.7606 35.4534C23.9875 35.8178 23.0346 36 21.9021 36H15.439ZM18.6373 33.3852H21.2447C22.136 33.3852 22.786 33.2153 23.1947 32.8756C23.6034 32.5309 23.8077 32.0729 23.8077 31.5017C23.8077 31.0831 23.7068 30.7138 23.5049 30.3937C23.303 30.0737 23.0149 29.8225 22.6407 29.6403C22.2714 29.4581 21.8307 29.367 21.3185 29.367H18.6373V33.3852ZM18.6373 27.2028H21.0083C21.4466 27.2028 21.8356 27.1265 22.1754 26.9739C22.5201 26.8163 22.7909 26.5947 22.9879 26.3091C23.1897 26.0235 23.2907 25.6812 23.2907 25.2824C23.2907 24.7358 23.0962 24.2951 22.7072 23.9602C22.3231 23.6254 21.7765 23.458 21.0674 23.458H18.6373V27.2028Z" fill="white"/>
    <ellipse cx="21" cy="70" rx="4" ry="2" fill="#8D8E93" opacity="0.5"/>
  </svg>`,
  iconSize: [42, 76], iconAnchor: [21, 76],
});

const createCarPin = () => L.divIcon({
  className: '',
  html: `<div style="width:48px;height:48px;border-radius:24px;background:white;box-shadow:0 4px 16px rgba(0,0,0,.22);display:flex;align-items:center;justify-content:center;">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="#FC6500">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
    </svg>
  </div>`,
  iconSize: [48, 48], iconAnchor: [24, 24],
});

/* ═══════════════════════════════════════════
   §2 — SVG ICONS
═══════════════════════════════════════════ */
const Ico = {
  back:  () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke={C.dk} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  check: ({c='white',s=14}) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-6" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  star:  ({filled=true,s=18}) => <svg width={s} height={s} viewBox="0 0 24 24" fill={filled?C.org:'none'} stroke={filled?C.org:C.grayLt} strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  search:() => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.gray} strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>,
  x:     () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.grayLt} strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  car:   () => <svg width="20" height="20" viewBox="0 0 24 24" fill={C.dk}><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>,
  phone: () => <svg width="20" height="20" viewBox="0 0 24 24" fill={C.white}><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>,
  chat:  () => <svg width="20" height="20" viewBox="0 0 24 24" fill={C.white}><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>,
  home:  ({s=16,c=C.gray}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  building:({s=16,c=C.gray}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M8 10h.01M16 10h.01M12 14h.01M8 14h.01M16 14h.01"/></svg>,
  mapPin:({s=16,c=C.gray}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  clock: ({s=16,c=C.gray}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  lock:  ({s=16,c=C.gray}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  wallet:({s=16,c=C.gray}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>,
  checkCircle: ({s=42,c=C.ok}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  messageCircle: ({s=42,c=C.org}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>,
  taxi:  ({s=44,c=C.white}) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>,
  apple: ({s=22}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>,
  android:({s=22}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><path d="M12 18h.01"/></svg>,
  heart: ({s=14,c=C.ok}) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c} stroke={c} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  user:  ({s=28}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  hash:  ({s=18,c=C.dk}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>,
  dot:   ({s=18,c='#ccc'}) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><circle cx="12" cy="12" r="7"/></svg>,
};

const PayIcons = {
  card: () => <svg width="32" height="22" viewBox="0 0 32 22" fill="none"><rect x=".5" y=".5" width="31" height="21" rx="3.5" fill="#F0F4FF" stroke={C.bdr}/><rect x="3" y="8" width="26" height="2.5" fill={C.bdr}/><rect x="3" y="13" width="10" height="2" rx="1" fill={C.grayLt}/><rect x="25" y="12" width="4" height="4" rx="1" fill={C.grayLt}/></svg>,
  cash: () => <svg width="32" height="22" viewBox="0 0 32 22" fill="none"><rect x=".5" y=".5" width="31" height="21" rx="3.5" fill="#E6F6F0" stroke={C.bdr}/><circle cx="16" cy="11" r="5" fill={C.ok} opacity=".3"/><circle cx="16" cy="11" r="2.5" fill={C.ok}/></svg>,
  transfer: () => <svg width="32" height="22" viewBox="0 0 32 22" fill="none"><rect x=".5" y=".5" width="31" height="21" rx="3.5" fill="#EEF2FF" stroke={C.bdr}/><path d="M20 7l-8 8M12 7h8v8" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  halyk: () => <svg width="32" height="22" viewBox="0 0 32 22" fill="none"><rect x=".5" y=".5" width="31" height="21" rx="3.5" fill="white" stroke={C.bdr}/><text x="4" y="15" fontSize="9" fontWeight="700" fill="#00896B">Halyk</text></svg>,
};

/* ═══════════════════════════════════════════
   §3 — SHARED UI COMPONENTS
═══════════════════════════════════════════ */
function PinBadge({ type }) {
  return (
    <div style={{ width:32, height:32, borderRadius:16, background:type==='a'?C.org:C.teal, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <span style={{ color:'white', fontWeight:900, fontSize:14, lineHeight:1 }}>{type==='a'?'A':'B'}</span>
    </div>
  );
}

function Card({ children, style={}, onClick }) {
  return (
    <div onClick={onClick} style={{ background:C.white, borderRadius:20, padding:'18px', boxShadow:C.shdSm, ...style }}>
      {children}
    </div>
  );
}

function PrimaryBtn({ children, onClick, disabled, loading, style={} }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        width:'100%', padding:'17px 24px', borderRadius:16, border:'none',
        background: disabled ? C.bdr : `linear-gradient(135deg,${C.org},${C.orgLt})`,
        color: disabled ? C.gray : C.white,
        fontSize:16, fontWeight:700, cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : `0 6px 20px rgba(252,101,0,.32)`,
        transition:'all .2s', display:'flex', alignItems:'center', justifyContent:'center', gap:8, ...style,
      }}
    >
      {loading ? <div className="spinner" /> : children}
    </button>
  );
}

function GhostBtn({ children, onClick, style={} }) {
  return (
    <button
      onClick={onClick}
      style={{
        width:'100%', padding:'15px', borderRadius:16, border:`1.5px solid ${C.bdr}`,
        background:C.white, color:C.dkMid, fontSize:15, fontWeight:600, cursor:'pointer',
        transition:'all .15s', ...style,
      }}
    >{children}</button>
  );
}

function TopBar({ title, sub, onBack, right }) {
  return (
    <div style={{ background:C.white, borderBottom:`1px solid ${C.bdr}`, display:'flex', alignItems:'center', gap:12, padding:'12px 16px', flexShrink:0, zIndex:10 }}>
      {onBack && (
        <button onClick={onBack} style={{ background:'#F0F2F5', border:'none', borderRadius:12, width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Ico.back />
        </button>
      )}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:17, fontWeight:700, color:C.dk, lineHeight:1.2 }}>{title}</div>
        {sub && <div style={{ fontSize:12, color:C.gray, marginTop:2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

function Handle() {
  return <div style={{ width:40, height:4, borderRadius:2, background:C.bdr, margin:'10px auto 0' }} />;
}

function DriverInfo({ compact, car }) {
  const c = car || DEMO_CARS.business;
  const stars = Math.round(c.rating);
  return (
    <div style={{ display:'flex', gap:14, alignItems:'center' }}>
      <div style={{ position:'relative', flexShrink:0 }}>
        <div style={{ width:compact?48:58, height:compact?48:58, borderRadius:compact?24:29, background:`linear-gradient(135deg,${c.gradient})`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Ico.user s={compact?22:28} />
        </div>
        <div style={{ position:'absolute', bottom:1, right:1, width:14, height:14, borderRadius:7, background:C.ok, border:`2px solid white` }} />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:compact?14:16, fontWeight:700, color:C.dk }}>{c.driver}</div>
        <div style={{ display:'flex', gap:3, alignItems:'center', marginTop:3 }}>
          {[1,2,3,4,5].map(s => <Ico.star key={s} filled={s<=stars} s={compact?12:14} />)}
          <span style={{ fontSize:11, color:C.gray, marginLeft:3 }}>{c.rating} · {c.trips} поездок</span>
        </div>
        {!compact && (
          <div style={{ display:'flex', gap:6, marginTop:6 }}>
            <span style={{ background:C.bg, borderRadius:8, padding:'3px 10px', fontSize:12, fontWeight:600, color:C.dkMid }}>{c.model}</span>
            <span style={{ background:C.bg, borderRadius:8, padding:'3px 10px', fontSize:12, fontWeight:700, color:C.dk, letterSpacing:.8 }}>{c.plate}</span>
          </div>
        )}
      </div>
      {compact && (
        <div style={{ textAlign:'right', flexShrink:0 }}>
          <div style={{ fontSize:11, color:C.gray }}>Номер</div>
          <div style={{ fontSize:13, fontWeight:800, color:C.dk, letterSpacing:.8 }}>{c.plate}</div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   §4a — MAP PICKER MODAL
   Fullscreen map — drag to any location, confirm.
   Uses Nominatim reverse geocode to get address.
═══════════════════════════════════════════ */
function MapPickerModal({ initialCenter, onConfirm, onClose }) {
  const divRef   = useRef(null);
  const mapRef   = useRef(null);
  const timerRef = useRef(null);
  const [addrPreview, setAddrPreview] = useState('Переместите карту к нужной точке');
  const [confirming, setConfirming]   = useState(false);

  useEffect(() => {
    if (!divRef.current || mapRef.current) return;
    const map = L.map(divRef.current, {
      center: [initialCenter.lat, initialCenter.lng],
      zoom: 16,
      zoomControl: true,
      attributionControl: false,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    mapRef.current = map;

    // Live address preview as user pans
    const updatePreview = async () => {
      const c = map.getCenter();
      // Try APARU reverse geocode first, then Nominatim
      let res = await API.reverseGeocode(c.lat, c.lng);
      if (res?.placeName) {
        setAddrPreview(res.placeName + (res.areaName ? ', ' + res.areaName : ''));
      } else {
        const nom = await Nominatim.reverse(c.lat, c.lng);
        if (nom) setAddrPreview(nom.address + (nom.additionalInfo ? ', ' + nom.additionalInfo : ''));
        else     setAddrPreview(`${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}`);
      }
    };

    map.on('movestart', () => setAddrPreview('Определяем адрес…'));
    map.on('moveend',   () => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(updatePreview, 500);
    });

    // Initial preview
    timerRef.current = setTimeout(updatePreview, 600);

    return () => { clearTimeout(timerRef.current); map.remove(); mapRef.current = null; };
  }, []);

  const handleConfirm = async () => {
    const map = mapRef.current;
    if (!map) return;
    setConfirming(true);
    const center = map.getCenter();

    // Get best available address
    let result = await Nominatim.reverse(center.lat, center.lng);
    if (!result) {
      const aparu = await API.reverseGeocode(center.lat, center.lng);
      if (aparu?.placeName) result = { address: aparu.placeName, additionalInfo: aparu.areaName || 'Усть-Каменогорск', latitude: center.lat, longitude: center.lng };
    }
    if (!result) {
      result = { address: `${center.lat.toFixed(5)}, ${center.lng.toFixed(5)}`, additionalInfo: 'Усть-Каменогорск', latitude: center.lat, longitude: center.lng };
    }
    result.latitude  = center.lat;
    result.longitude = center.lng;
    setConfirming(false);
    onConfirm(result);
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:10000, background:C.white, display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ background:C.white, borderBottom:`1px solid ${C.bdr}`, display:'flex', alignItems:'center', gap:12, padding:'12px 16px', flexShrink:0 }}>
        <button onClick={onClose} style={{ background:'#F0F2F5', border:'none', borderRadius:12, width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Ico.back />
        </button>
        <div>
          <div style={{ fontSize:17, fontWeight:700, color:C.dk }}>Выберите на карте</div>
          <div style={{ fontSize:12, color:C.gray }}>Перемещайте карту — булавка всегда в центре</div>
        </div>
      </div>

      {/* Map */}
      <div style={{ flex:1, position:'relative', overflow:'hidden' }}>
        <div ref={divRef} style={{ width:'100%', height:'100%' }} />

        {/* Fixed center crosshair (B pin) */}
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -100%)', zIndex:1000, pointerEvents:'none', filter:'drop-shadow(0 4px 8px rgba(0,0,0,.25))' }}>
          <svg width="36" height="64" viewBox="0 0 42 76" fill="none">
            <path d="M21 9C32.0397 9 40.9998 17.896 41 28.8828C41 35.6659 37.5824 41.654 32.374 45.2402C28.8243 47.7692 26.4758 50.2528 25.0078 52.8633C23.5438 55.4667 22.919 58.2607 22.9189 61.4717V69.0811C22.9187 70.1409 22.0599 71 21 71C19.9401 71 19.0813 70.1409 19.0811 69.0811V61.4717C19.081 58.2607 18.4562 55.4667 16.9922 52.8633C15.5242 50.2528 13.1757 47.7692 9.62598 45.2402L9.14258 44.8965C4.20699 41.2785 1 35.4539 1 28.8828C1.00024 17.896 9.96027 9 21 9Z" fill="#009AA3" stroke="white" strokeWidth="2"/>
            <text x="21" y="34" textAnchor="middle" fill="white" fontSize="16" fontWeight="900" fontFamily="Inter,sans-serif">B</text>
            <ellipse cx="21" cy="70" rx="4" ry="2" fill="#8D8E93" opacity="0.4"/>
          </svg>
        </div>

        {/* Pulse ring under pin */}
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)', zIndex:999, pointerEvents:'none' }}>
          <div style={{ width:18, height:18, borderRadius:9, background:C.tealGh, border:`2px solid ${C.teal}`, animation:'pulse 1.5s ease-in-out infinite' }} />
        </div>
      </div>

      {/* Bottom panel */}
      <div style={{ padding:'16px', background:C.white, boxShadow:'0 -4px 20px rgba(0,0,0,.08)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', background:C.bg, borderRadius:14, marginBottom:14 }}>
          <Ico.mapPin s={18} c={C.teal} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:11, color:C.gray, fontWeight:500 }}>Адрес</div>
            <div style={{ fontSize:13, fontWeight:600, color:C.dk, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{addrPreview}</div>
          </div>
        </div>
        <PrimaryBtn onClick={handleConfirm} loading={confirming}>
          <span style={{ display:'flex', alignItems:'center', gap:8 }}><Ico.check s={16}/> Выбрать это место</span>
        </PrimaryBtn>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   §4b — GEO SEARCH AUTOCOMPLETE
   Sources (in priority order):
   1. Local dataset — instant, no network
   2. APARU API     — city-specific, fast
   3. Nominatim     — full OSM, any address in UKG
   + "Select on map" button for absolute freedom
═══════════════════════════════════════════ */
function GeoSearch({ placeholder, lat, lng, onSelect, value, onChange, onMapPick }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const timer = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = useCallback((text) => {
    clearTimeout(timer.current);
    if (!text || text.length < 2) { setSuggestions([]); setOpen(false); return; }

    // 1. Local dataset — instant
    const local = searchLocal(text);
    if (local.length > 0) { setSuggestions(local); setOpen(true); }

    // 2. APARU + 3. Nominatim — parallel, ~200ms debounce
    timer.current = setTimeout(async () => {
      setLoading(true);
      const [aparuRes, nomRes] = await Promise.all([
        API.geocode(text, lat, lng),
        Nominatim.search(text),
      ]);
      setLoading(false);

      const aparuItems = aparuRes?.results?.slice(0, 5) || [];
      // De-duplicate Nominatim results against APARU (by proximity)
      const nomItems = nomRes.filter(n =>
        !aparuItems.some(a =>
          Math.abs((a.latitude||0) - n.latitude) < 0.001 &&
          Math.abs((a.longitude||0) - n.longitude) < 0.001
        )
      ).slice(0, 4);

      const merged = [...local.slice(0,3), ...aparuItems, ...nomItems];
      if (merged.length > 0) { setSuggestions(merged.slice(0, 9)); setOpen(true); }
      else if (!open)        { setSuggestions([]); }
    }, 200);
  }, [lat, lng]);

  const handleChange = (e) => { onChange(e.target.value); search(e.target.value); };
  const handleFocus  = () => { setFocused(true); if (value?.length >= 2) search(value); };

  const pick = (s) => {
    const full = s.address + (s.additionalInfo ? `, ${s.additionalInfo}` : '');
    onChange(full); onSelect(s); setSuggestions([]); setOpen(false); setFocused(false);
  };

  const clear = () => { onChange(''); setSuggestions([]); setOpen(false); };

  const typeIcon = (type) => {
    if (type === 'o') return <Ico.building s={16} c={C.org} />;
    if (type === 'h') return <Ico.home s={16} c={C.teal} />;
    if (type === 's') return <Ico.mapPin s={16} c={C.teal} />;
    return <Ico.mapPin s={16} c={C.gray} />;
  };

  return (
    <div ref={wrapRef} style={{ position:'relative' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'4px 0', borderBottom: focused ? `1.5px solid ${C.org}` : '1.5px solid transparent', transition:'border-color .2s' }}>
        <PinBadge type="b" />
        <input
          style={{ flex:1, border:'none', background:'transparent', fontSize:14, fontWeight:500, color:C.dk, padding:'8px 0' }}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={() => setFocused(false)}
          autoComplete="off"
        />
        <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
          {loading
            ? <div className="spinner spinner--sm" />
            : value
              ? <button onMouseDown={e => { e.preventDefault(); clear(); }} style={{ background:'none', border:'none', cursor:'pointer', padding:2, display:'flex', borderRadius:6 }}><Ico.x /></button>
              : null
          }
          {/* Map picker button */}
          {onMapPick && (
            <button
              onMouseDown={e => { e.preventDefault(); setOpen(false); onMapPick(); }}
              title="Выбрать на карте"
              style={{ background:C.tealGh, border:`1px solid ${C.teal}`, borderRadius:10, width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}
            >
              <Ico.mapPin s={16} c={C.teal} />
            </button>
          )}
        </div>
      </div>

      {/* Hint under input */}
      {!open && !value && (
        <div style={{ fontSize:11, color:C.gray, marginTop:6, display:'flex', alignItems:'center', gap:4 }}>
          <Ico.mapPin s={11} c={C.tealGh.replace('rgba','rgba')} />
          <span>Введите адрес или нажмите <b style={{ color:C.teal }}>📍</b> для выбора на карте</span>
        </div>
      )}

      {open && suggestions.length > 0 && (
        <div style={{ position:'absolute', left:-14, right:-14, top:'calc(100% + 8px)', background:C.white, borderRadius:18, boxShadow:`0 8px 32px rgba(42,48,55,.16)`, zIndex:9999, overflow:'hidden', border:`1px solid ${C.bdr}` }}>
          <div style={{ padding:'10px 16px 6px', display:'flex', alignItems:'center', gap:6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill={C.teal}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
            <span style={{ fontSize:11, color:C.gray, fontWeight:500 }}>Выберите адрес из списка</span>
          </div>
          {suggestions.map((s, i) => (
            <div
              key={i}
              onMouseDown={e => { e.preventDefault(); pick(s); }}
              style={{ padding:'11px 16px', display:'flex', gap:12, alignItems:'flex-start', cursor:'pointer', borderTop: i > 0 ? `1px solid ${C.bdr}` : 'none', transition:'background .12s' }}
              onMouseEnter={e => e.currentTarget.style.background = C.bg}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ flexShrink:0, marginTop:1 }}>{typeIcon(s.type)}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:700, color:C.dk, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.address}</div>
                {s.additionalInfo && <div style={{ fontSize:12, color:C.gray, marginTop:2, display:'flex', alignItems:'center', gap:4 }}><Ico.mapPin s={11} c={C.gray}/> {s.additionalInfo}</div>}
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink:0, marginTop:2 }}><path d="M9 18l6-6-6-6" stroke={C.grayLt} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          ))}
        </div>
      )}

      {open && suggestions.length === 0 && !loading && value?.length >= 2 && (
        <div style={{ position:'absolute', left:-14, right:-14, top:'calc(100% + 8px)', background:C.white, borderRadius:18, boxShadow:`0 8px 32px rgba(42,48,55,.16)`, zIndex:9999, border:`1px solid ${C.bdr}`, padding:'20px 16px', textAlign:'center' }}>
          <div style={{ marginBottom:8, display:'flex', justifyContent:'center' }}><Ico.search /></div>
          <div style={{ fontSize:13, fontWeight:600, color:C.dk }}>Адрес не найден</div>
          <div style={{ fontSize:12, color:C.gray, marginTop:4 }}>Попробуйте другое название или <button onMouseDown={e=>{ e.preventDefault(); onMapPick && onMapPick(); }} style={{ background:'none', border:'none', color:C.teal, fontWeight:700, cursor:'pointer', padding:0, fontSize:12 }}>выберите на карте</button></div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   §4c — FULL-SCREEN ADDRESS SEARCH
   Открывается поверх всего — как на скрине:
   шапка «Куда», оранжевый underline, список.
═══════════════════════════════════════════ */
const TYPE_LABELS_FS = { s:'Улица', h:'Дом', o:'Место', c:'Город' };

function FullScreenSearch({ lat, lng, onSelect, onClose, onMapPick }) {
  const [query,   setQuery]   = useState('');
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(false);
  const timer   = useRef(null);
  const inputRef= useRef(null);

  // Авто-фокус при открытии
  useEffect(() => { inputRef.current?.focus(); }, []);

  const doSearch = useCallback((text) => {
    clearTimeout(timer.current);
    if (!text || text.length < 2) { setItems([]); return; }

    // 1. Мгновенный локальный поиск
    const local = searchLocal(text);
    if (local.length > 0) setItems(local);

    // 2. API + Nominatim с дебаунсом
    timer.current = setTimeout(async () => {
      setLoading(true);
      const [aparuRes, nomRes] = await Promise.all([
        API.geocode(text, lat, lng),
        Nominatim.search(text),
      ]);
      setLoading(false);
      // Aparu — до 12 результатов (все адреса из УКА)
      const aparuItems = aparuRes?.results?.slice(0, 12) || [];
      // Nominatim — убираем дубликаты по координатам, берём до 6
      const nomItems   = nomRes.filter(n =>
        !aparuItems.some(a =>
          Math.abs((a.latitude||0) - n.latitude)  < 0.001 &&
          Math.abs((a.longitude||0) - n.longitude) < 0.001
        )
      ).slice(0, 6);
      // Итог: локальные (не дублировать с API) + Aparu + Nominatim
      const localUniq = local.filter(l =>
        !aparuItems.some(a =>
          Math.abs((a.latitude||0) - l.lat) < 0.001 &&
          Math.abs((a.longitude||0) - l.lng) < 0.001
        )
      ).slice(0, 3);
      const merged = [...localUniq, ...aparuItems, ...nomItems];
      if (merged.length > 0) setItems(merged.slice(0, 18));
    }, 200);
  }, [lat, lng]);

  const handleChange = (e) => { setQuery(e.target.value); doSearch(e.target.value); };
  const handleClear  = () =>  { setQuery(''); setItems([]); inputRef.current?.focus(); };

  const handleSelect = (item) => {
    onSelect(item);
    onClose();
  };

  const getSubtitle = (item) => {
    const label = TYPE_LABELS_FS[item.type] || '';
    if (label && item.additionalInfo) return `${label}, ${item.additionalInfo}`;
    return item.additionalInfo || label;
  };

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9999,
      background:C.white, display:'flex', flexDirection:'column',
    }}>
      {/* ── Шапка ── */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'12px 16px', position:'relative',
        borderBottom:`1px solid ${C.bdr}`,
      }}>
        <button
          onClick={onClose}
          style={{ position:'absolute', left:8, background:'none', border:'none', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            width:38, height:38, borderRadius:10 }}
        >
          <Ico.back />
        </button>
        <span style={{ fontSize:17, fontWeight:700, color:C.dk }}>Куда</span>
        {onMapPick && (
          <button
            onClick={() => { onMapPick(); onClose(); }}
            style={{ position:'absolute', right:12, background:C.org, border:'none',
              borderRadius:20, color:C.white, fontWeight:700, fontSize:14,
              padding:'6px 16px', cursor:'pointer' }}
          >
            На карте
          </button>
        )}
      </div>

      {/* ── Поле ввода ── */}
      <div style={{
        display:'flex', alignItems:'center', gap:8,
        margin:'10px 16px 0',
        borderBottom:`2px solid ${C.org}`,
        paddingBottom:2,
      }}>
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          placeholder="Введите адрес"
          style={{
            flex:1, border:'none', outline:'none', background:'transparent',
            fontSize:16, color:C.dk, padding:'6px 0',
          }}
          autoComplete="off"
        />
        {loading && <div className="spinner spinner--sm" />}
        {!loading && query.length > 0 && (
          <button
            onMouseDown={e => { e.preventDefault(); handleClear(); }}
            style={{ background:C.bdr, border:'none', cursor:'pointer', borderRadius:'50%',
              width:22, height:22, display:'flex', alignItems:'center',
              justifyContent:'center', flexShrink:0 }}
          >
            <Ico.x />
          </button>
        )}
      </div>

      {/* ── Список результатов ── */}
      <div style={{ flex:1, overflowY:'auto' }}>
        {items.length === 0 && !loading && query.length < 2 && (
          <div style={{ padding:'32px 24px', textAlign:'center' }}>
            <div style={{ marginBottom:8, display:'flex', justifyContent:'center' }}>
              <Ico.search />
            </div>
            <div style={{ fontSize:14, color:C.gray }}>Начните вводить адрес</div>
          </div>
        )}

        {items.map((item, i) => (
          <div
            key={i}
            onClick={() => handleSelect(item)}
            style={{
              display:'flex', alignItems:'center', gap:12,
              padding:'14px 16px',
              borderBottom:`1px solid ${C.bdr}`,
              cursor:'pointer',
              transition:'background .1s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = C.bg}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            onTouchStart ={e => e.currentTarget.style.background = C.bg}
            onTouchEnd   ={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ flexShrink:0 }}>
              {item.type === 'o'
                ? <Ico.building s={18} c={C.org} />
                : item.type === 'h'
                ? <Ico.home    s={18} c={C.teal} />
                : <Ico.mapPin  s={18} c={C.gray} />}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:15, fontWeight:600, color:C.dk,
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {item.address}
              </div>
              {getSubtitle(item) && (
                <div style={{ fontSize:13, color:C.gray, marginTop:2,
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {getSubtitle(item)}
                </div>
              )}
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink:0 }}>
              <path d="M9 18l6-6-6-6" stroke={C.grayLt} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   §5 — LEAFLET MAP COMPONENT
═══════════════════════════════════════════ */
function LeafletMap({ center, zoom=15, height=240, markers=[], route=null, style={} }) {
  const divRef  = useRef(null);
  const mapRef  = useRef(null);
  const mRefs   = useRef([]);
  const routeRef= useRef(null);

  useEffect(() => {
    if (!divRef.current || mapRef.current) return;
    const map = L.map(divRef.current, { center:[center.lat,center.lng], zoom, zoomControl:false, attributionControl:false, scrollWheelZoom:false, dragging:true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19 }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Sync markers
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    mRefs.current.forEach(m => m.remove());
    mRefs.current = markers.map(m => {
      const icon = m.type==='a' ? createPinA() : m.type==='b' ? createPinB() : createCarPin();
      return L.marker([m.lat, m.lng], { icon }).addTo(map);
    });
  }, [markers]);

  // Sync route
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    if (routeRef.current) { routeRef.current.remove(); routeRef.current = null; }
    if (route?.length > 0) {
      const ll = route.map(([lng, lat]) => [lat, lng]);
      routeRef.current = L.polyline(ll, { color:C.org, weight:5, lineCap:'round', lineJoin:'round', opacity:.85 }).addTo(map);
      map.fitBounds(routeRef.current.getBounds(), { padding:[60,60], animate:true });
    }
  }, [route]);

  return <div ref={divRef} className="map-wrap" style={{ height, borderRadius:0, overflow:'hidden', ...style }} />;
}

/* ═══════════════════════════════════════════
   §5b — HUB SHARE MODAL
   Показывает попутчика из той же локации
═══════════════════════════════════════════ */
const HUB_SHARE_RIDER = {
  name:    'Арман К.',
  initials:'АК',
  rating:  4.8,
  rides:   87,
  heading: 'Центр города',
  savings: '50%',
  coins:   240,
};

function HubShareModal({ tariff, onConfirm, onClose }) {
  const splitPriceMap = { economy:'400–600 ₸', comfort:'700–950 ₸', business:'1 250–1 750 ₸' };
  const r = HUB_SHARE_RIDER;

  return (
    <div style={{ position:'fixed', inset:0, zIndex:3000, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.45)' }} />

      {/* Sheet */}
      <div className="su" style={{ position:'relative', background:C.white, borderRadius:'24px 24px 0 0', padding:'0 0 32px', maxHeight:'85dvh', overflowY:'auto', zIndex:1 }}>
        <Handle />

        {/* Header */}
        <div style={{ padding:'18px 20px 0', textAlign:'center' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(22,163,74,.12)', borderRadius:20, padding:'4px 14px', marginBottom:16 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:C.ok, animation:'pulse 1.4s ease-in-out infinite' }} />
            <span style={{ fontSize:12, fontWeight:700, color:C.ok }}>Попутчик онлайн</span>
          </div>
          <div style={{ fontSize:20, fontWeight:800, color:C.dk, marginBottom:4 }}>Поехать вместе?</div>
          <div style={{ fontSize:13, color:C.gray, lineHeight:1.5 }}>Один участник Hub ищет машину<br/>в том же направлении</div>
        </div>

        {/* Rider card */}
        <div style={{ margin:'20px 20px 0', background:C.bg, borderRadius:18, padding:'16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:52, height:52, borderRadius:26, background:`linear-gradient(135deg,${C.teal},#00C4CF)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ color:'white', fontWeight:800, fontSize:18 }}>{r.initials}</span>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:16, fontWeight:700, color:C.dk }}>{r.name}</div>
              <div style={{ display:'flex', gap:3, alignItems:'center', marginTop:2 }}>
                {[1,2,3,4,5].map(s => <Ico.star key={s} filled={s<=Math.round(r.rating)} s={11}/>)}
                <span style={{ fontSize:11, color:C.gray, marginLeft:2 }}>{r.rating} · {r.rides} поездок</span>
              </div>
            </div>
            <div style={{ textAlign:'right', flexShrink:0 }}>
              <div style={{ fontSize:10, color:C.gray }}>Направление</div>
              <div style={{ fontSize:13, fontWeight:700, color:C.dk }}>{r.heading}</div>
            </div>
          </div>
        </div>

        {/* Benefits row */}
        <div style={{ display:'flex', gap:10, margin:'14px 20px 0' }}>
          {[
            { icon:<LuWallet size={20} color={C.ok}/>,      label:'Экономия',    value:r.savings,         bg:'rgba(22,163,74,.10)',  col:C.ok },
            { icon:<LuCoins size={20} color={C.org}/>,      label:'Social Coins',value:`×2 (+${r.coins})`,bg:'rgba(252,101,0,.10)', col:C.org },
            { icon:<LuHandshake size={20} color={C.teal}/>, label:'Сообщество',  value:'Hub',             bg:'rgba(0,154,163,.10)', col:C.teal },
          ].map((b,i) => (
            <div key={i} style={{ flex:1, background:b.bg, borderRadius:14, padding:'10px 8px', textAlign:'center' }}>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:4 }}>{b.icon}</div>
              <div style={{ fontSize:10, color:C.gray, marginBottom:2 }}>{b.label}</div>
              <div style={{ fontSize:12, fontWeight:800, color:b.col }}>{b.value}</div>
            </div>
          ))}
        </div>

        {/* Split price */}
        <div style={{ margin:'14px 20px 0', background:`linear-gradient(135deg,${C.teal},#007A82)`, borderRadius:16, padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ color:'rgba(255,255,255,.65)', fontSize:11 }}>Ваша часть</div>
            <div style={{ color:'white', fontSize:24, fontWeight:900, marginTop:2 }}>{splitPriceMap[tariff]}</div>
          </div>
          <div style={{ color:'rgba(255,255,255,.55)', fontSize:12, textAlign:'right' }}>
            <div>вместо</div>
            <div style={{ textDecoration:'line-through', fontSize:16, fontWeight:700 }}>
              {{ economy:'800–1 200 ₸', comfort:'1 400–1 900 ₸', business:'2 500–3 500 ₸' }[tariff]}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding:'20px 20px 0', display:'flex', flexDirection:'column', gap:10 }}>
          <PrimaryBtn onClick={onConfirm} style={{ background:`linear-gradient(135deg,${C.teal},#007A82)`, boxShadow:`0 6px 20px rgba(0,154,163,.35)` }}>
            <span style={{ display:'flex', alignItems:'center', gap:8 }}><LuHandshake size={18}/> Поехать вместе</span>
          </PrimaryBtn>
          <GhostBtn onClick={onClose}>Нет, спасибо</GhostBtn>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   §6 — SCREEN 1: WELCOME
   ТЗ §3.1 — открытие, точка А из QR, ввод точки Б
═══════════════════════════════════════════ */
function WelcomeScreen({ qr, onNext }) {
  const [dest, setDest]           = useState('');
  const [destCoord, setDestCoord] = useState(null);
  const [tariff, setTariff]       = useState('economy');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [showSearch,    setShowSearch]    = useState(false);
  const [hubShareActive,    setHubShareActive]    = useState(false);
  const [showHubShareModal, setShowHubShareModal] = useState(false);

  const tariffs = [
    { id:'economy', label:'Эконом',  price:'800–1 200 ₸', min:'~3 мин' },
    { id:'comfort', label:'Комфорт', price:'1 400–1 900 ₸', min:'~5 мин' },
    { id:'business',label:'Бизнес',  price:'2 500–3 500 ₸', min:'~7 мин' },
  ];

  return (
    <>
    {showMapPicker && (
      <MapPickerModal
        initialCenter={{ lat: qr.lat, lng: qr.lng }}
        onClose={() => setShowMapPicker(false)}
        onConfirm={(result) => {
          const full = result.address + (result.additionalInfo ? `, ${result.additionalInfo}` : '');
          setDest(full);
          setDestCoord({ lat: result.latitude, lng: result.longitude });
          setShowMapPicker(false);
        }}
      />
    )}
    {showSearch && (
      <FullScreenSearch
        lat={qr.lat} lng={qr.lng}
        onClose={() => setShowSearch(false)}
        onMapPick={() => { setShowSearch(false); setShowMapPicker(true); }}
        onSelect={(item) => {
          const full = item.address + (item.additionalInfo ? `, ${item.additionalInfo}` : '');
          setDest(full);
          setDestCoord({ lat: item.latitude, lng: item.longitude });
        }}
      />
    )}
    {showHubShareModal && (
      <HubShareModal
        tariff={tariff}
        onConfirm={() => { setHubShareActive(true); setShowHubShareModal(false); }}
        onClose={() => setShowHubShareModal(false)}
      />
    )}
    <div className="fi" style={{ display:'flex', flexDirection:'column', height:'100dvh', background:C.bg, overflow:'hidden' }}>
      {/* Map */}
      <div style={{ flexShrink:0, position:'relative' }}>
        <LeafletMap center={{ lat:qr.lat, lng:qr.lng }} zoom={15} height={240} markers={[{ type:'a', lat:qr.lat, lng:qr.lng }]} />
        {/* Logo */}
        <div style={{ position:'absolute', top:12, left:12, background:C.white, borderRadius:14, padding:'8px 14px', display:'flex', alignItems:'center', gap:8, boxShadow:C.shdSm, zIndex:900 }}>
          <svg width="72" height="13" viewBox="0 0 2814 503" fill="none"><path d="M2813.95 288.383C2813.95 437.965 2692.85 502.367 2571.77 502.14C2450.69 501.931 2329.59 437.074 2329.59 288.383L2329.56 0.517578H2436.28L2436.34 257.898C2437.41 359.781 2503.52 402.304 2571.17 405.451C2643.18 408.788 2716.92 366.207 2715.75 257.898L2715.85 0.517578H2813.99L2813.95 288.383ZM1859.14 211.298H2023.97C2048.3 211.298 2065.55 210.558 2075.58 209.08C2085.61 207.715 2094.78 204.643 2103.1 200.074C2121.32 190.197 2130.36 172.433 2130.36 146.517C2130.36 120.733 2121.3 102.95 2103.1 93.0918C2094.53 88.2763 2085.37 85.1861 2075.71 83.84C2066.05 82.475 2048.81 81.8684 2023.99 81.8684H1859.16V211.317L1859.14 211.298ZM1859.14 292.63L1859.16 494.025H1752.35L1752.28 0.536537H2035.34C2072.63 0.536537 2102.24 2.77364 2123.99 7.07721C2145.88 11.3997 2164.95 18.9262 2181.22 29.7895C2200.06 42.3779 2214.11 59.4026 2223.52 80.7498C2232.32 101.49 2236.73 123.691 2236.73 147.256C2236.73 227.849 2192.47 274.979 2103.81 288.686L2247.83 494.025H2126.64L1989.48 292.63H1859.12H1859.14ZM752.451 212.416H915.463C947.983 212.416 970.734 208.966 983.941 201.932C992.263 197.363 998.989 190.083 1004.12 180.092C1009.25 170.101 1011.82 158.991 1011.82 147.029C1011.82 135.18 1009.25 124.203 1004.12 114.212C998.989 104.22 992.263 96.9403 983.941 92.3714C970.978 85.3378 948.227 81.8873 915.463 81.8873H752.451V212.454V212.416ZM752.451 293.748L752.526 494.025H645.668L645.762 0.536537H928.05C963.632 0.536537 991.887 3.00114 1012.8 7.81659C1033.59 12.6131 1052.04 20.8979 1068.07 32.747C1084.58 44.9562 1097.54 61.1278 1106.82 81.129C1116.12 101.87 1120.76 123.823 1120.76 147.029C1120.76 180.225 1111.95 209.345 1094.22 234.522C1078.93 255.869 1058.75 271.169 1033.58 280.174C1008.27 289.179 973.157 293.748 928.05 293.748H752.451ZM353.554 300.535L276.923 130.743L275.082 126.667L274.199 124.696L193.604 300.554H275.082H276.134H353.554V300.535ZM322.612 0.536537L564.246 494.025H443.504L384.251 368.16H275.815H275.082H161.93L102.507 494.025H-0.0114746L233.15 0.536537C262.964 0.536537 292.798 0.536537 322.631 0.536537H322.612ZM1460.01 300.535L1383.38 130.743L1381.54 126.667L1380.66 124.696L1300.06 300.554H1381.54H1382.59H1460.01V300.535ZM1429.07 0.536537L1670.71 494.025H1549.96L1490.71 368.16H1382.27H1381.54H1268.39L1208.97 494.025H1106.45L1339.61 0.536537C1369.44 0.536537 1399.28 0.536537 1429.09 0.536537H1429.07Z" fill="#FC6500"/></svg>
        </div>
        {/* QR badge */}
        <div style={{ position:'absolute', top:12, right:12, background:C.org, borderRadius:12, padding:'6px 12px', boxShadow:`0 4px 14px rgba(252,101,0,.4)`, zIndex:900 }}>
          <div style={{ color:'rgba(255,255,255,.75)', fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:.5 }}>QR-точка</div>
          <div style={{ color:'white', fontSize:12, fontWeight:700, marginTop:1, maxWidth:100, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{qr.name}</div>
        </div>
      </div>

      {/* Bottom sheet */}
      <div style={{ flex:1, background:C.white, borderRadius:'24px 24px 0 0', marginTop:-20, display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 -4px 30px rgba(0,0,0,.08)', zIndex:10 }}>
        <Handle />
        <div style={{ flex:1, overflowY:'auto', padding:'16px 16px 24px' }}>

          {/* Route card */}
          <div style={{ background:C.bg, borderRadius:16, padding:'4px 14px', marginBottom:16 }}>
            {/* Point A */}
            <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0' }}>
              <PinBadge type="a" />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:11, color:C.gray, fontWeight:500, marginBottom:1 }}>Откуда</div>
                <div style={{ fontSize:14, fontWeight:600, color:C.dk, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{qr.name}</div>
              </div>
              <div style={{ background:C.okGh, borderRadius:8, padding:'3px 8px', flexShrink:0 }}>
                <span style={{ fontSize:11, fontWeight:700, color:C.ok, display:'flex', alignItems:'center', gap:3 }}>QR <Ico.check c={C.ok} s={10}/></span>
              </div>
            </div>
            {/* Divider */}
            <div style={{ display:'flex', gap:4, alignItems:'center', paddingLeft:14, paddingBottom:4 }}>
              {[0,1,2,3].map(i => <div key={i} style={{ width:3, height:3, borderRadius:1.5, background:C.bdr }} />)}
            </div>
            {/* Point B — тап открывает полноэкранный поиск */}
            <div style={{ padding:'4px 0 8px' }}>
              <div
                onClick={() => setShowSearch(true)}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'4px 0',
                  borderBottom:`1.5px solid ${dest ? C.org : C.bdr}`,
                  cursor:'pointer', transition:'border-color .2s' }}
              >
                <PinBadge type="b" />
                <div style={{ flex:1, minWidth:0 }}>
                  {dest
                    ? <div style={{ fontSize:14, fontWeight:600, color:C.dk,
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {dest}
                      </div>
                    : <div style={{ fontSize:14, color:C.gray }}>Куда едем?</div>
                  }
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                  {dest && (
                    <button
                      onClick={e => { e.stopPropagation(); setDest(''); setDestCoord(null); }}
                      style={{ background:'none', border:'none', cursor:'pointer', padding:2,
                        display:'flex', borderRadius:6 }}
                    ><Ico.x /></button>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); setShowMapPicker(true); }}
                    title="Выбрать на карте"
                    style={{ background:C.tealGh, border:`1px solid ${C.teal}`, borderRadius:10,
                      width:34, height:34, display:'flex', alignItems:'center',
                      justifyContent:'center', cursor:'pointer', flexShrink:0 }}
                  >
                    <Ico.mapPin s={16} c={C.teal} />
                  </button>
                </div>
              </div>
              {!dest && (
                <div style={{ fontSize:11, color:C.gray, marginTop:6,
                  display:'flex', alignItems:'center', gap:4 }}>
                  <Ico.mapPin s={11} c={C.gray} />
                  <span>Введите адрес или нажмите <b style={{ color:C.teal }}>📍</b> для выбора на карте</span>
                </div>
              )}
            </div>
          </div>

          {/* Hub Share Banner */}
          {!hubShareActive ? (
            <div
              onClick={() => setShowHubShareModal(true)}
              style={{ marginBottom:16, borderRadius:16, border:`1.5px solid ${C.teal}`, background:'rgba(0,154,163,.06)', padding:'12px 14px', cursor:'pointer', display:'flex', alignItems:'center', gap:12, transition:'all .15s' }}
            >
              <div style={{ position:'relative', flexShrink:0 }}>
                <div style={{ width:40, height:40, borderRadius:20, background:`linear-gradient(135deg,${C.teal},#00C4CF)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ color:'white', fontWeight:800, fontSize:14 }}>АК</span>
                </div>
                <div style={{ position:'absolute', bottom:0, right:0, width:12, height:12, borderRadius:6, background:C.ok, border:`2px solid white`, animation:'pulse 1.4s ease-in-out infinite' }} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:700, color:C.dk }}>Арман К. ищет попутчика</div>
                <div style={{ fontSize:11, color:C.gray, marginTop:1, display:'flex', alignItems:'center', gap:3 }}>Центр города · Экономия 50% · <LuCoins size={11} color={C.org}/> ×2 Coins</div>
              </div>
              <div style={{ background:C.teal, borderRadius:10, padding:'6px 12px', flexShrink:0 }}>
                <span style={{ color:'white', fontSize:11, fontWeight:700, whiteSpace:'nowrap' }}>Вместе →</span>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom:16, borderRadius:16, border:`1.5px solid ${C.ok}`, background:C.okGh, padding:'12px 14px', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:36, height:36, borderRadius:18, background:`linear-gradient(135deg,${C.teal},#00C4CF)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ color:'white', fontWeight:800, fontSize:13 }}>АК</span>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:700, color:C.ok, display:'flex', alignItems:'center', gap:5 }}>Hub Share активирован <LuCheck size={14} color={C.ok}/></div>
                <div style={{ fontSize:11, color:C.gray, marginTop:1, display:'flex', alignItems:'center', gap:3 }}>Арман К. · <LuCoins size={11} color={C.org}/> ×2 бонус начислится после поездки</div>
              </div>
              <button
                onClick={() => setHubShareActive(false)}
                style={{ background:'none', border:'none', cursor:'pointer', padding:4, color:C.gray, display:'flex' }}
              ><LuX size={18} color={C.gray}/></button>
            </div>
          )}

          {/* Tariff selector */}
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.gray, textTransform:'uppercase', letterSpacing:.8, marginBottom:10 }}>Тариф</div>
            <div style={{ display:'flex', gap:8 }}>
              {tariffs.map(t => {
                const splitPrices = { economy:'400–600 ₸', comfort:'700–950 ₸', business:'1 250–1 750 ₸' };
                const displayPrice = hubShareActive ? splitPrices[t.id] : t.price;
                return (
                  <div key={t.id} onClick={() => setTariff(t.id)} style={{ flex:1, padding:'12px 8px', borderRadius:14, border:`1.5px solid ${tariff===t.id?(hubShareActive?C.teal:C.org):C.bdr}`, background:tariff===t.id?(hubShareActive?'rgba(0,154,163,.10)':C.orgGh):C.white, cursor:'pointer', transition:'all .15s', textAlign:'center' }}>
                    <div style={{ marginBottom:4, display:'flex', justifyContent:'center' }}><Ico.car /></div>
                    <div style={{ fontSize:12, fontWeight:700, color:tariff===t.id?(hubShareActive?C.teal:C.org):C.dk }}>{t.label}</div>
                    <div style={{ fontSize:11, color:hubShareActive?C.ok:C.gray, marginTop:2, fontWeight:hubShareActive?700:400 }}>{displayPrice}</div>
                    <div style={{ fontSize:10, color:C.gray }}>{t.min}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <PrimaryBtn
            onClick={() => onNext(dest, destCoord, tariff, hubShareActive)}
            style={hubShareActive ? { background:`linear-gradient(135deg,${C.teal},#007A82)`, boxShadow:`0 6px 20px rgba(0,154,163,.35)` } : {}}
          >
            <span style={{ display:'flex', alignItems:'center', gap:8 }}>
              {hubShareActive ? <><LuHandshake size={20}/> Найти такси (подсадка)</> : <><Ico.taxi s={20} /> Найти такси</>}
            </span>
          </PrimaryBtn>
        </div>
      </div>
    </div>
    </>
  );
}

/* ═══════════════════════════════════════════
   §7 — SCREEN 2: TRIP DETAILS
   ТЗ §3.2 — водитель, авто, тариф, оплата, кнопка
═══════════════════════════════════════════ */
function DetailsScreen({ qr, dest, destCoord, tariff, onNext, onBack }) {
  const [payment, setPayment]     = useState('card');
  const [routeData, setRouteData] = useState(null);
  const [routeCoords, setRouteCoords] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeErr, setRouteErr]   = useState(false);

  const priceMap = { economy:'1 050 ₸', comfort:'1 650 ₸', business:'2 900 ₸' };
  const payments = [
    { id:'card',     label:'Карта',    Icon:PayIcons.card },
    { id:'cash',     label:'Наличные', Icon:PayIcons.cash },
    { id:'transfer', label:'Перевод',  Icon:PayIcons.transfer },
    { id:'halyk',    label:'Halyk',    Icon:PayIcons.halyk },
  ];

  useEffect(() => {
    if (!destCoord) return;
    setLoadingRoute(true);
    setRouteErr(false);
    API.route([
      { latitude:qr.lat,       longitude:qr.lng },
      { latitude:destCoord.lat, longitude:destCoord.lng },
    ]).then(r => {
      setLoadingRoute(false);
      if (r) { setRouteData(r); setRouteCoords(r.coordinates); }
      else    setRouteErr(true);
    });
  }, []);

  const km  = routeData ? (routeData.distance / 1000).toFixed(1) : (routeErr ? '–' : '...');
  const min = routeData ? Math.ceil(routeData.time / 60000)       : (routeErr ? '–' : '...');

  const mapMarkers = useMemo(() => {
    const m = [{ type:'a', lat:qr.lat, lng:qr.lng }];
    if (destCoord) m.push({ type:'b', lat:destCoord.lat, lng:destCoord.lng });
    return m;
  }, [destCoord]);

  return (
    <div className="su" style={{ display:'flex', flexDirection:'column', height:'100dvh', background:C.bg, overflow:'hidden' }}>
      <div style={{ flexShrink:0 }}>
        <TopBar title="Детали поездки" sub="Подтвердите заказ" onBack={onBack} />
        <LeafletMap center={{ lat:qr.lat, lng:qr.lng }} zoom={14} height={210} markers={mapMarkers} route={routeCoords} />
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:12, paddingBottom:32 }}>

        {/* Route summary */}
        <Card style={{ padding:'16px' }}>
          <div style={{ display:'flex', gap:12, alignItems:'stretch' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', paddingTop:2, paddingBottom:2 }}>
              <PinBadge type="a" />
              <div style={{ width:2, flex:1, background:C.bdr, margin:'6px 0', minHeight:16 }} />
              <PinBadge type="b" />
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ paddingBottom:16, paddingTop:2 }}>
                <div style={{ fontSize:11, color:C.gray }}>Откуда</div>
                <div style={{ fontSize:14, fontWeight:600, color:C.dk, marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{qr.name}</div>
              </div>
              <div style={{ paddingTop:2 }}>
                <div style={{ fontSize:11, color:C.gray }}>Куда</div>
                <div style={{ fontSize:14, fontWeight:600, color:dest?C.dk:C.gray, marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{dest || 'Адрес не указан'}</div>
              </div>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:16 }}>
            {[
              { i:<Ico.mapPin s={18} c={C.org}/>, v:`${km} км`,                        l:'Расстояние' },
              { i:<Ico.clock  s={18} c={C.teal}/>,v:`${min} мин`,                      l:'Время' },
              { i:<Ico.taxi   s={18} c={C.dk}/>,  v:`~${DEMO_CARS[tariff].eta} мин`,   l:'Ожидание' },
            ].map((s, i) => (
              <div key={i} style={{ flex:1, background:C.bg, borderRadius:12, padding:'10px 6px', textAlign:'center' }}>
                <div style={{ marginBottom:4, display:'flex', justifyContent:'center' }}>{s.i}</div>
                <div style={{ fontSize:13, fontWeight:700, color:C.dk }}>{s.v}</div>
                <div style={{ fontSize:10, color:C.gray, marginTop:2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Driver info */}
        <Card style={{ padding:'16px' }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.gray, textTransform:'uppercase', letterSpacing:.8, marginBottom:14 }}>Водитель</div>
          <DriverInfo car={DEMO_CARS[tariff]} />
          <div style={{ marginTop:14, padding:'12px 14px', background:C.bg, borderRadius:14, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <Ico.car />
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:C.dk }}>{DEMO_CARS[tariff].model} · {DEMO_CARS[tariff].color}</div>
                <div style={{ fontSize:12, color:C.gray }}>Гос. номер: <b style={{ color:C.dk, letterSpacing:.8 }}>{DEMO_CARS[tariff].plate}</b></div>
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:10, color:C.gray }}>Прибудет</div>
              <div style={{ fontSize:20, fontWeight:900, color:C.org }}>~{DEMO_CARS[tariff].eta} мин</div>
            </div>
          </div>
        </Card>

        {/* Payment method — ТЗ §3.2 */}
        <Card style={{ padding:'16px' }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.gray, textTransform:'uppercase', letterSpacing:.8, marginBottom:14 }}>Способ оплаты</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {payments.map(p => (
              <div key={p.id} onClick={() => setPayment(p.id)} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', borderRadius:14, cursor:'pointer', border:`1.5px solid ${payment===p.id?C.org:C.bdr}`, background:payment===p.id?C.orgGh:C.white, transition:'all .15s' }}>
                <p.Icon />
                <span style={{ fontSize:12, fontWeight:600, color:payment===p.id?C.org:C.dk }}>{p.label}</span>
                {payment===p.id && <div style={{ marginLeft:'auto', width:18, height:18, borderRadius:9, background:C.org, display:'flex', alignItems:'center', justifyContent:'center' }}><Ico.check s={10}/></div>}
              </div>
            ))}
          </div>
        </Card>

        {/* Price banner */}
        <div style={{ background:`linear-gradient(135deg,${C.dk},#3A4150)`, borderRadius:20, padding:'20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ color:'rgba(255,255,255,.6)', fontSize:12 }}>К оплате</div>
              <div style={{ color:'white', fontSize:30, fontWeight:900, marginTop:3 }}>{priceMap[tariff]}</div>
              <div style={{ color:'rgba(255,255,255,.5)', fontSize:11, marginTop:4 }}>
                {routeData ? `${km} км · ${min} мин` : 'Рассчитывается…'}
              </div>
            </div>
            <div style={{ width:60, height:60, borderRadius:30, background:C.org, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 6px 20px rgba(252,101,0,.45)` }}>
              {payment==='card' ? <PayIcons.card/> : payment==='cash' ? <PayIcons.cash/> : payment==='transfer' ? <PayIcons.transfer/> : <PayIcons.halyk/>}
            </div>
          </div>
        </div>

        <PrimaryBtn onClick={onNext}>Подтвердить заказ →</PrimaryBtn>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   §8 — SCREEN 3: PHONE ENTRY
   ТЗ §3.3 — подтверждение номера телефона
═══════════════════════════════════════════ */
function PhoneScreen({ onNext, onBack }) {
  const [phone, setPhone] = useState('+7 ');

  const fmt = v => {
    if (!v.startsWith('+7 ')) v = '+7 ';
    const d = v.slice(3).replace(/\D/g, '').slice(0, 10);
    let f = '+7 ';
    if (d.length > 0) f += d.slice(0, 3);
    if (d.length > 3) f += ' ' + d.slice(3, 6);
    if (d.length > 6) f += ' ' + d.slice(6, 8);
    if (d.length > 8) f += ' ' + d.slice(8, 10);
    return f;
  };
  const valid = phone.replace(/\D/g, '').slice(1).length === 10;

  return (
    <div className="su" style={{ display:'flex', flexDirection:'column', height:'100dvh', background:C.white }}>
      <TopBar title="Номер телефона" onBack={onBack} />
      <div style={{ flex:1, padding:'36px 24px 32px', display:'flex', flexDirection:'column' }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ position:'relative', width:88, height:88, margin:'0 auto 20px', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ position:'absolute', inset:0,  borderRadius:44, background:C.orgGh, animation:'pulse 1.8s ease-in-out infinite' }} />
            <div style={{ position:'absolute', inset:12, borderRadius:32, background:C.orgGh, animation:'pulse 1.8s ease-in-out .3s infinite' }} />
            <div style={{ width:56, height:56, borderRadius:28, background:C.org, display:'flex', alignItems:'center', justifyContent:'center', zIndex:1, boxShadow:`0 6px 20px rgba(252,101,0,.4)` }}>
              <Ico.phone />
            </div>
          </div>
          <h2 style={{ fontSize:22, fontWeight:800, color:C.dk, marginBottom:8 }}>Ваш номер телефона</h2>
          <p style={{ fontSize:14, color:C.gray, lineHeight:1.6 }}>Отправим SMS с кодом подтверждения<br/>для создания заказа</p>
        </div>

        <div style={{ border:`2px solid ${valid?C.org:C.bdr}`, borderRadius:18, padding:'16px 20px', background:C.bg, display:'flex', alignItems:'center', gap:14, marginBottom:16, boxShadow:valid?`0 0 0 4px ${C.orgGh}`:'none', transition:'all .2s' }}>
          <span style={{ fontSize:24, lineHeight:1 }}>🇰🇿</span>
          <div style={{ width:1, height:22, background:C.bdr }} />
          <input
            type="tel" value={phone}
            onChange={e => setPhone(fmt(e.target.value))}
            style={{ flex:1, border:'none', background:'transparent', fontSize:20, fontWeight:700, color:C.dk, letterSpacing:.5 }}
            autoFocus
          />
          {valid && (
            <div style={{ width:26, height:26, borderRadius:13, background:C.ok, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Ico.check s={12} />
            </div>
          )}
        </div>

        <div style={{ background:C.bg, borderRadius:14, padding:'14px 16px', display:'flex', gap:10, marginBottom:'auto' }}>
          <Ico.lock s={18} c={C.gray} />
          <span style={{ fontSize:12, color:C.gray, lineHeight:1.6 }}>Ваш номер используется только для подтверждения заказа. Мы не передаём данные третьим лицам.</span>
        </div>

        <div style={{ marginTop:24 }}>
          <PrimaryBtn onClick={() => valid && onNext(phone)} disabled={!valid}>
            Получить SMS-код
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   §9 — SCREEN 4: OTP VERIFICATION
   ТЗ §3.3 — ввод SMS-кода
═══════════════════════════════════════════ */
function OTPScreen({ phone, onNext, onBack }) {
  const [code,  setCode]  = useState(['', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [done,  setDone]  = useState(false);
  const refs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (timer <= 0 || done) return;
    const t = setTimeout(() => setTimer(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, done]);

  const enter = (i, v) => {
    const d = v.replace(/\D/g, '').slice(-1);
    const n = [...code]; n[i] = d; setCode(n);
    if (d && i < 3) refs[i+1].current.focus();
    if (n.every(c => c)) { setDone(true); setTimeout(onNext, 700); }
  };
  const back = (i, e) => { if (e.key === 'Backspace' && !code[i] && i > 0) refs[i-1].current.focus(); };
  const reset = () => { setTimer(60); setCode(['','','','']); setDone(false); refs[0].current.focus(); };

  return (
    <div className="su" style={{ display:'flex', flexDirection:'column', height:'100dvh', background:C.white }}>
      <TopBar title="Код из SMS" sub={`Отправлен на ${phone}`} onBack={onBack} />
      <div style={{ flex:1, padding:'40px 24px 32px', display:'flex', flexDirection:'column', alignItems:'center' }}>
        <div style={{ width:80, height:80, borderRadius:40, background:done?C.okGh:C.orgGh, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:24, transition:'all .3s' }}>
          {done ? <Ico.checkCircle s={42} c={C.ok}/> : <Ico.messageCircle s={42} c={C.org}/>}
        </div>
        <h2 style={{ fontSize:22, fontWeight:800, color:C.dk, marginBottom:8 }}>Введите код</h2>
        <p style={{ fontSize:14, color:C.gray, textAlign:'center', marginBottom:40 }}>
          Код отправлен на <b style={{ color:C.dk }}>{phone}</b>
        </p>

        <div style={{ display:'flex', gap:12, marginBottom:28 }}>
          {code.map((c, i) => (
            <input key={i} ref={refs[i]} type="tel" maxLength={2} value={c}
              onChange={e => enter(i, e.target.value)}
              onKeyDown={e => back(i, e)}
              style={{ width:66, height:74, textAlign:'center', fontSize:28, fontWeight:800, color:done?C.ok:C.dk, border:`2.5px solid ${done?C.ok:c?C.org:C.bdr}`, borderRadius:18, outline:'none', background:c?(done?C.okGh:C.orgGh):C.bg, fontFamily:'Inter,sans-serif', transition:'all .15s', boxShadow:c?`0 0 0 4px ${done?C.okGh:C.orgGh}`:'none' }}
              autoFocus={i === 0}
            />
          ))}
        </div>

        <div style={{ width:'100%', height:3, background:C.bg, borderRadius:2, marginBottom:24 }}>
          <div style={{ width:`${(code.filter(c=>c).length/4)*100}%`, height:'100%', background:done?C.ok:C.org, borderRadius:2, transition:'width .2s' }} />
        </div>

        {timer > 0
          ? <p style={{ fontSize:14, color:C.gray }}>Повторная отправка через <b style={{ color:C.org }}>{timer}с</b></p>
          : <button onClick={reset} style={{ background:'none', border:'none', color:C.org, fontSize:15, fontWeight:700, cursor:'pointer', textDecoration:'underline', textDecorationStyle:'dotted', textUnderlineOffset:3 }}>Отправить ещё раз</button>
        }

        {/* Demo hint — only in dev mode */}
        {IS_DEV && (
          <div style={{ marginTop:'auto', width:'100%', textAlign:'center', padding:'12px 0', background:C.bg, borderRadius:14 }}>
            <span style={{ fontSize:12, color:C.gray }}>DEV: введите любые 4 цифры</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   §10 — SCREEN 5: SEARCHING DRIVER
   ТЗ §3.4 — создание заказа, поиск водителя
═══════════════════════════════════════════ */
function SearchingScreen({ onNext }) {
  const [step,  setStep]  = useState(0);
  const [found, setFound] = useState(false);
  const steps = ['Ищем ближайших водителей…', 'Проверяем маршрут…', 'Подключаем водителя…'];

  useEffect(() => {
    const tt = [
      setTimeout(() => setStep(1), 900),
      setTimeout(() => setStep(2), 1900),
      setTimeout(() => setFound(true), 2900),
      setTimeout(() => onNext(), 4100),
    ];
    return () => tt.forEach(clearTimeout);
  }, []);

  return (
    <div className="fi" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100dvh', background:C.bg, padding:'40px 24px' }}>
      {!found ? (
        <>
          <div style={{ position:'relative', width:160, height:160, marginBottom:36 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ position:'absolute', inset:0, borderRadius:80, border:`2px solid ${C.org}`, animation:`ripple 2.2s ease-out ${i*.55}s infinite` }} />
            ))}
            <div style={{ position:'absolute', inset:28, borderRadius:52, background:C.org, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 8px 32px rgba(252,101,0,.45)` }}>
              <span style={{ animation:'bounce 1.2s ease-in-out infinite', display:'flex' }}><Ico.taxi s={44} c={C.white}/></span>
            </div>
          </div>
          <h2 style={{ fontSize:22, fontWeight:800, color:C.dk, marginBottom:8 }}>Поиск водителя</h2>
          <p style={{ fontSize:14, color:C.gray, marginBottom:32, textAlign:'center' }}>{steps[step]}</p>
          <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:8 }}>
            {steps.map((s, i) => (
              <div key={i} className={i <= step ? 'si' : ''} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:C.white, borderRadius:14, opacity: i <= step ? 1 : .35, transition:'opacity .4s' }}>
                <div style={{ width:28, height:28, borderRadius:14, background:i<step?C.ok:i===step?C.org:C.bdr, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .4s' }}>
                  {i < step
                    ? <Ico.check s={12}/>
                    : i === step
                      ? <div className="spinner" style={{ width:12, height:12, border:'2px solid rgba(255,255,255,.4)', borderTop:'2px solid white' }} />
                      : <div style={{ width:8, height:8, borderRadius:4, background:C.grayLt }} />
                  }
                </div>
                <span style={{ fontSize:13, fontWeight:600, color: i <= step ? C.dk : C.gray }}>{s}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="sc" style={{ textAlign:'center' }}>
          <div style={{ width:100, height:100, borderRadius:50, background:C.okGh, margin:'0 auto 24px', display:'flex', alignItems:'center', justifyContent:'center', border:`2px solid rgba(22,163,74,.25)` }}>
            <div style={{ width:76, height:76, borderRadius:38, background:C.ok, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Ico.check s={36} />
            </div>
          </div>
          <h2 style={{ fontSize:26, fontWeight:900, color:C.ok }}>Водитель найден!</h2>
          <p style={{ fontSize:14, color:C.gray, marginTop:8 }}>Водитель едет к вам</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   §10b — OFFLINE TICKET GENERATOR
   Рисует PNG-билет через Canvas 2D API.
   Без интернета — данные остаются в галерее.
═══════════════════════════════════════════ */
function generateTicket(canvas, { orderId, plate, model, color, driver, pickup }) {
  const W = 390, H = 620;
  canvas.width  = W * 2; // retina
  canvas.height = H * 2;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2); // retina

  const R = 24; // corner radius
  const org = '#FC6500', dk = '#2A3037', gray = '#8A95A3', bdr = '#E8ECF0', bg = '#F5F6FA';
  const now = new Date();
  const timeStr = now.toLocaleTimeString('ru-RU', { hour:'2-digit', minute:'2-digit' });
  const dateStr = now.toLocaleDateString('ru-RU', { day:'numeric', month:'long', year:'numeric' });

  /* ── helpers ── */
  function roundRect(x, y, w, h, r, fill) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  }

  /* ── card background ── */
  roundRect(0, 0, W, H, R, 'white');
  ctx.shadowColor = 'rgba(0,0,0,.12)';
  ctx.shadowBlur  = 24;
  ctx.shadowOffsetY = 6;
  roundRect(2, 2, W - 4, H - 4, R, 'white');
  ctx.shadowColor = 'transparent';

  /* ── orange header ── */
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(R, 0); ctx.lineTo(W - R, 0);
  ctx.quadraticCurveTo(W, 0, W, R);
  ctx.lineTo(W, 140); ctx.lineTo(0, 140); ctx.lineTo(0, R);
  ctx.quadraticCurveTo(0, 0, R, 0);
  ctx.closePath();
  ctx.fillStyle = org; ctx.fill();
  ctx.restore();

  /* ── header: APARU label ── */
  ctx.fillStyle = 'white';
  ctx.font = 'bold 26px Inter, -apple-system, sans-serif';
  ctx.fillText('APARU', 24, 46);

  ctx.font = '500 12px Inter, -apple-system, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,.75)';
  ctx.fillText('Такси по QR', 24, 64);

  /* ── header: БИЛЕТ badge ── */
  roundRect(W - 110, 20, 86, 32, 8, 'rgba(255,255,255,.22)');
  ctx.fillStyle = 'white';
  ctx.font = 'bold 11px Inter, -apple-system, sans-serif';
  ctx.fillText('OFFLINE', W - 96, 40);

  /* ── header: order id ── */
  ctx.fillStyle = 'rgba(255,255,255,.9)';
  ctx.font = '500 12px Inter, -apple-system, sans-serif';
  ctx.fillText('Номер заказа', 24, 96);
  ctx.fillStyle = 'white';
  ctx.font = 'bold 18px Inter, -apple-system, sans-serif';
  ctx.fillText(orderId, 24, 118);

  /* ── tear line ── */
  ctx.strokeStyle = bdr;
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 5]);
  ctx.beginPath(); ctx.moveTo(24, 152); ctx.lineTo(W - 24, 152); ctx.stroke();
  ctx.setLineDash([]);

  /* ── circles on tear line ── */
  [0, W].forEach(cx => {
    ctx.beginPath();
    ctx.arc(cx, 152, 14, 0, Math.PI * 2);
    ctx.fillStyle = bg; ctx.fill();
  });

  /* ── "ВАША МАШИНА" label ── */
  ctx.fillStyle = gray;
  ctx.font = 'bold 11px Inter, -apple-system, sans-serif';
  ctx.letterSpacing = '0.8px';
  ctx.fillText('ВАША МАШИНА', 24, 185);
  ctx.letterSpacing = '0px';

  /* ── plate number block ── */
  roundRect(24, 196, W - 48, 68, 14, org + '14');
  ctx.strokeStyle = org;
  ctx.lineWidth = 1.5;
  roundRect(24, 196, W - 48, 68, 14);
  ctx.stroke();

  ctx.fillStyle = dk;
  ctx.font = 'bold 38px Inter, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '2px';
  ctx.fillText(plate, W / 2, 242);
  ctx.letterSpacing = '0px';
  ctx.textAlign = 'left';

  /* ── model + color ── */
  ctx.fillStyle = gray;
  ctx.font = '500 13px Inter, -apple-system, sans-serif';
  ctx.fillText('Модель', 24, 290);
  ctx.fillStyle = gray;
  ctx.fillText('Цвет', W / 2 + 8, 290);

  ctx.fillStyle = dk;
  ctx.font = 'bold 16px Inter, -apple-system, sans-serif';
  ctx.fillText(model, 24, 312);
  ctx.fillText(color, W / 2 + 8, 312);

  /* ── divider ── */
  ctx.strokeStyle = bdr; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(24, 330); ctx.lineTo(W - 24, 330); ctx.stroke();

  /* ── driver ── */
  ctx.fillStyle = gray;
  ctx.font = '500 12px Inter, -apple-system, sans-serif';
  ctx.fillText('Водитель', 24, 355);

  ctx.fillStyle = dk;
  ctx.font = 'bold 16px Inter, -apple-system, sans-serif';
  ctx.fillText(driver, 24, 376);

  /* stars */
  ctx.fillStyle = org;
  ctx.font = '14px Arial';
  ctx.fillText('★★★★★', 24, 396);

  /* ── divider ── */
  ctx.strokeStyle = bdr;
  ctx.beginPath(); ctx.moveTo(24, 412); ctx.lineTo(W - 24, 412); ctx.stroke();

  /* ── pickup ── */
  ctx.fillStyle = gray;
  ctx.font = '500 12px Inter, -apple-system, sans-serif';
  ctx.fillText('Место посадки', 24, 436);

  ctx.fillStyle = dk;
  ctx.font = 'bold 14px Inter, -apple-system, sans-serif';
  // wrap long pickup name
  const maxW = W - 48;
  const words = pickup.split(' ');
  let line = '', y = 458;
  words.forEach(word => {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line.trim(), 24, y); line = word + ' '; y += 20;
    } else { line = test; }
  });
  ctx.fillText(line.trim(), 24, y);

  /* ── time ── */
  ctx.fillStyle = gray;
  ctx.font = '500 12px Inter, -apple-system, sans-serif';
  ctx.fillText(timeStr + ' · ' + dateStr, 24, y + 26);

  /* ── footer ── */
  roundRect(0, H - 54, W, 54, R, bg);
  ctx.fillStyle = gray;
  ctx.font = '500 12px Inter, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Покажите карточку водителю', W / 2, H - 30);
  ctx.fillStyle = org;
  ctx.font = 'bold 11px Inter, -apple-system, sans-serif';
  ctx.fillText('aparu.kz', W / 2, H - 13);
  ctx.textAlign = 'left';
}

function OfflineTicketModal({ qr, car, onClose }) {
  const canvasRef  = useRef(null);
  const orderId    = useMemo(() => 'ORD-' + Math.random().toString(36).slice(2,8).toUpperCase(), []);
  const [saved, setSaved] = useState(false);
  const c = car || DEMO_CARS.business;

  const ticketData = {
    orderId,
    plate:  c.plate,
    model:  c.model,
    color:  c.color,
    driver: c.driver,
    pickup: qr.name,
  };

  useEffect(() => {
    if (canvasRef.current) generateTicket(canvasRef.current, ticketData);
  }, []);

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Try Web Share API first (mobile — saves to gallery)
    if (navigator.share && navigator.canShare) {
      try {
        const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
        const file = new File([blob], `aparu-${orderId}.png`, { type:'image/png' });
        if (navigator.canShare({ files:[file] })) {
          await navigator.share({ files:[file], title:'APARU билет', text:'Мой заказ такси' });
          setSaved(true); return;
        }
      } catch(e) { /* fallback */ }
    }

    // Fallback: download link
    const link = document.createElement('a');
    link.download = `aparu-${orderId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setSaved(true);
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:4000, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.55)' }} />
      <div className="su" style={{ position:'relative', background:C.white, borderRadius:'24px 24px 0 0', zIndex:1, maxHeight:'92dvh', display:'flex', flexDirection:'column' }}>
        <Handle />

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'4px 20px 16px' }}>
          <div>
            <div style={{ fontSize:18, fontWeight:800, color:C.dk }}>Оффлайн-карточка</div>
            <div style={{ fontSize:12, color:C.gray, marginTop:2 }}>Сохраните — работает без интернета</div>
          </div>
          <button onClick={onClose} style={{ background:C.bg, border:'none', borderRadius:12, width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <LuX size={18} color={C.gray}/>
          </button>
        </div>

        {/* Canvas preview */}
        <div style={{ overflowY:'auto', padding:'0 20px', flex:1 }}>
          <div style={{ borderRadius:24, overflow:'hidden', boxShadow:C.shd }}>
            <canvas ref={canvasRef} style={{ display:'block', width:'100%' }} />
          </div>

          {/* Info tip */}
          <div style={{ display:'flex', gap:10, alignItems:'flex-start', marginTop:14, background:C.bg, borderRadius:14, padding:'12px 14px' }}>
            <LuCard size={16} color={C.teal} style={{ flexShrink:0, marginTop:1 }}/>
            <span style={{ fontSize:12, color:C.gray, lineHeight:1.6 }}>
              Если пропадёт интернет — покажите водителю номер авто и гос.номер с этой карточки
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding:'16px 20px 32px', display:'flex', flexDirection:'column', gap:10 }}>
          <PrimaryBtn onClick={handleSave} style={saved ? { background:`linear-gradient(135deg,${C.ok},#15803D)`, boxShadow:`0 6px 20px rgba(22,163,74,.35)` } : {}}>
            <span style={{ display:'flex', alignItems:'center', gap:8 }}>
              {saved ? <><LuCheck size={18}/> Сохранено!</> : <><LuDownload size={18}/> Сохранить в галерею</>}
            </span>
          </PrimaryBtn>
          <GhostBtn onClick={onClose}>Закрыть</GhostBtn>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   §11 — SCREEN 6: DRIVER EN ROUTE + ARRIVED
   ТЗ §3.5 — «водитель назначен» + «водитель прибыл»
   Two internal states: driving → arrived
═══════════════════════════════════════════ */
function DriverScreen({ qr, tariff, onStart, onCancel }) {
  const car = DEMO_CARS[tariff] || DEMO_CARS.business;
  const [eta,        setEta]        = useState(car.eta);
  const [arrived,    setArrived]    = useState(false);
  const [showTicket, setShowTicket] = useState(false);

  // ETA countdown — auto-transition to "arrived" when it hits 0
  useEffect(() => {
    if (arrived) return;
    if (eta <= 0) { setArrived(true); return; }
    const t = setInterval(() => setEta(p => Math.max(0, p - 1)), 14000); // 14s per minute (demo speed)
    return () => clearInterval(t);
  }, [eta, arrived]);

  const driverPos = { lat: qr.lat + 0.012, lng: qr.lng + 0.008 };

  return (
    <div className="su" style={{ display:'flex', flexDirection:'column', height:'100dvh', background:C.bg, overflow:'hidden' }}>
      {showTicket && <OfflineTicketModal qr={qr} car={car} onClose={() => setShowTicket(false)} />}

      {/* Map */}
      <div style={{ flexShrink:0, position:'relative' }}>
        <LeafletMap
          center={{ lat: qr.lat + 0.006, lng: qr.lng + 0.004 }}
          zoom={14} height={300}
          markers={[
            { type:'a',   lat:qr.lat,        lng:qr.lng },
            { type:'car', lat:driverPos.lat,  lng:driverPos.lng },
          ]}
        />
        <div style={{ position:'absolute', top:12, left:12, zIndex:900 }}>
          <button onClick={onCancel} style={{ background:C.white, border:'none', borderRadius:12, width:44, height:44, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:C.shdSm }}>
            <Ico.back />
          </button>
        </div>

        {/* Status badge — changes when arrived */}
        {!arrived ? (
          <div style={{ position:'absolute', top:12, right:12, background:C.org, borderRadius:16, padding:'10px 16px', boxShadow:`0 4px 16px rgba(252,101,0,.45)`, zIndex:900 }}>
            <div style={{ color:'rgba(255,255,255,.75)', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:.4 }}>Прибудет через</div>
            <div style={{ color:'white', fontSize:24, fontWeight:900, lineHeight:1.1 }}>{eta} мин</div>
          </div>
        ) : (
          <div className="sc" style={{ position:'absolute', top:12, right:12, background:C.ok, borderRadius:16, padding:'10px 16px', boxShadow:`0 4px 16px rgba(22,163,74,.45)`, zIndex:900 }}>
            <div style={{ color:'rgba(255,255,255,.85)', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:.4 }}>Водитель</div>
            <div style={{ color:'white', fontSize:16, fontWeight:900, lineHeight:1.2 }}>Прибыл!</div>
          </div>
        )}
      </div>

      {/* Bottom sheet */}
      <div style={{ background:C.white, borderRadius:'24px 24px 0 0', marginTop:-20, flex:1, display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 -4px 24px rgba(0,0,0,.08)', zIndex:10 }}>
        <Handle />
        <div style={{ flex:1, overflowY:'auto', padding:'16px 16px 32px' }}>

          {/* Status indicator — ТЗ §3.5 statuses */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
            <div style={{ width:8, height:8, borderRadius:4, background:arrived?C.ok:C.org, animation:'pulse 1.2s infinite' }} />
            <span style={{ fontSize:13, fontWeight:600, color:arrived?C.ok:C.org }}>
              {arrived ? 'Водитель прибыл — ждёт вас' : 'Водитель едет к вам'}
            </span>
            <div style={{ marginLeft:'auto', background:arrived?C.okGh:C.orgGh, borderRadius:8, padding:'3px 10px' }}>
              <span style={{ fontSize:11, fontWeight:700, color:arrived?C.ok:C.org }}>
                {arrived ? 'Прибыл' : 'В пути'}
              </span>
            </div>
          </div>

          {/* Driver card */}
          <Card style={{ padding:'16px', marginBottom:12 }}>
            <DriverInfo car={car} />
            <div style={{ height:1, background:C.bdr, margin:'16px 0' }} />
            <div style={{ display:'flex', justifyContent:'space-around' }}>
              {[
                { e:<Ico.car/>,                           l:car.model },
                { e:<Ico.dot s={18} c={car.colorDot}/>,   l:car.color },
                { e:<Ico.hash s={18}/>,                   l:car.plate, m:true },
              ].map((s, i) => (
                <div key={i} style={{ textAlign:'center' }}>
                  <div style={{ marginBottom:4, display:'flex', justifyContent:'center' }}>{s.e}</div>
                  <div style={{ fontSize:12, fontWeight:s.m?800:600, color:C.dk, letterSpacing:s.m?.8:0 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Contact buttons */}
          <div style={{ display:'flex', gap:10, marginBottom:14 }}>
            {[
              { i:<Ico.phone/>, l:'Позвонить', bg:C.org },
              { i:<Ico.chat/>,  l:'Написать',  bg:C.teal },
            ].map((b, i) => (
              <button key={i} style={{ flex:1, padding:'13px', borderRadius:14, border:'none', background:b.bg, color:'white', fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:`0 4px 14px rgba(0,0,0,.15)` }}>
                {b.i}{b.l}
              </button>
            ))}
          </div>

          {/* Offline ticket button */}
          <button
            onClick={() => setShowTicket(true)}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'12px 16px', marginBottom:12, borderRadius:14, border:`1.5px dashed ${C.bdr}`, background:C.bg, cursor:'pointer', transition:'all .15s' }}
          >
            <div style={{ width:36, height:36, borderRadius:10, background:C.white, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:C.shdSm, flexShrink:0 }}>
              <LuDownload size={16} color={C.org}/>
            </div>
            <div style={{ flex:1, textAlign:'left' }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.dk }}>Сохранить карточку заказа</div>
              <div style={{ fontSize:11, color:C.gray, marginTop:1 }}>Номер авто · Гос.номер · Без интернета</div>
            </div>
            <LuCard size={16} color={C.grayLt}/>
          </button>

          {/* CTA changes based on arrived state — ТЗ §3.5 */}
          {arrived ? (
            <PrimaryBtn
              onClick={onStart}
              style={{ background:`linear-gradient(135deg,${C.ok},#15803D)`, boxShadow:`0 6px 20px rgba(22,163,74,.35)` }}
            >
              <span style={{ display:'flex', alignItems:'center', gap:8 }}><Ico.checkCircle s={20} c="white"/> Начать поездку</span>
            </PrimaryBtn>
          ) : (
            <>
              <PrimaryBtn onClick={() => setArrived(true)}>Водитель прибыл →</PrimaryBtn>
              <GhostBtn onClick={onCancel} style={{ marginTop:10, color:C.gray }}>Отменить заказ</GhostBtn>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   §12 — SCREEN 7: TRIP ACTIVE
   ТЗ §3.5 — «поездка началась»
═══════════════════════════════════════════ */
function TripScreen({ qr, dest, destCoord, onEnd }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const s = String(elapsed % 60).padStart(2, '0');

  const markers = useMemo(() => {
    const a = [{ type:'a', lat:qr.lat, lng:qr.lng }];
    if (destCoord) a.push({ type:'b', lat:destCoord.lat, lng:destCoord.lng });
    return a;
  }, []);

  return (
    <div className="su" style={{ display:'flex', flexDirection:'column', height:'100dvh', background:C.bg, overflow:'hidden' }}>
      <div style={{ background:`linear-gradient(135deg,${C.ok},#15803D)`, padding:'20px 20px 32px', borderBottomLeftRadius:28, borderBottomRightRadius:28, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
          <div style={{ width:8, height:8, borderRadius:4, background:'rgba(255,255,255,.7)', animation:'pulse 1s infinite' }} />
          <span style={{ color:'rgba(255,255,255,.85)', fontSize:13, fontWeight:600 }}>Поездка идёт</span>
        </div>
        <div style={{ fontSize:54, fontWeight:900, color:'white', letterSpacing:2, fontVariantNumeric:'tabular-nums', lineHeight:1 }}>{m}:{s}</div>
        <div style={{ color:'rgba(255,255,255,.55)', fontSize:12, marginTop:6 }}>Время в пути</div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:12, paddingBottom:24, marginTop:-8 }}>
        <LeafletMap center={{ lat:qr.lat, lng:qr.lng }} zoom={13} height={180} markers={markers} style={{ borderRadius:20, overflow:'hidden' }} />

        <Card style={{ padding:'14px 16px' }}>
          <div style={{ display:'flex', gap:12, alignItems:'stretch' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', paddingTop:2, paddingBottom:2 }}>
              <PinBadge type="a" />
              <div style={{ width:2, flex:1, background:C.bdr, margin:'6px 0', minHeight:14 }} />
              <PinBadge type="b" />
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ paddingBottom:14, paddingTop:2 }}>
                <div style={{ fontSize:11, color:C.gray }}>Откуда</div>
                <div style={{ fontSize:13, fontWeight:600, color:C.dk, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{qr.name}</div>
              </div>
              <div>
                <div style={{ fontSize:11, color:C.gray }}>Куда</div>
                <div style={{ fontSize:13, fontWeight:600, color:dest?C.dk:C.gray, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{dest || 'Адрес не указан'}</div>
              </div>
            </div>
          </div>
        </Card>

        <Card style={{ padding:'14px 16px' }}><DriverInfo compact /></Card>

        <div style={{ flex:1 }} />
        <PrimaryBtn
          onClick={onEnd}
          style={{ background:`linear-gradient(135deg,${C.ok},#15803D)`, boxShadow:`0 6px 20px rgba(22,163,74,.35)` }}
        >
          <span style={{ display:'flex', alignItems:'center', gap:8 }}><Ico.checkCircle s={20} c="white"/> Завершить поездку</span>
        </PrimaryBtn>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   §13 — SCREEN 8: COMPLETED
   ТЗ §3.5 «поездка завершена» + §3.6 новая поездка + §3.7 CTA
═══════════════════════════════════════════ */
function CompletedScreen({ onRestart, qr }) {
  const [rating,      setRating]      = useState(0);
  const [hover,       setHover]       = useState(0);
  const [rated,       setRated]       = useState(false);
  const [scClaimed,   setScClaimed]   = useState(false);

  const isOskemenHub = qr && qr.name && qr.name.toLowerCase().includes('oskemen hub');
  const SC_AMOUNT = 50;

  return (
    <div className="su" style={{ display:'flex', flexDirection:'column', height:'100dvh', background:C.bg, overflow:'hidden' }}>
      {/* Hero */}
      <div style={{ background:`linear-gradient(160deg,${C.dk} 0%,#1a2030 100%)`, padding:'36px 24px 56px', textAlign:'center', borderBottomLeftRadius:32, borderBottomRightRadius:32, flexShrink:0, position:'relative', overflow:'hidden' }}>
        {[[8,18,C.org],[25,8,C.teal],[72,12,C.org],[88,22,C.white],[12,55,'#FC6500'],[90,50,C.teal]].map(([l,t,bg], i) => (
          <div key={i} style={{ position:'absolute', left:`${l}%`, top:`${t}%`, width:8, height:8, borderRadius:4, background:bg, opacity:.35, animation:`bounce ${1+i*.15}s ease-in-out ${i*.1}s infinite` }} />
        ))}
        <div style={{ width:90, height:90, borderRadius:45, background:'rgba(22,163,74,.18)', margin:'0 auto 18px', display:'flex', alignItems:'center', justifyContent:'center', border:`2px solid rgba(22,163,74,.3)` }}>
          <div style={{ width:68, height:68, borderRadius:34, background:C.ok, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Ico.check s={34} />
          </div>
        </div>
        <h2 style={{ color:'white', fontSize:26, fontWeight:900, marginBottom:8 }}>Поездка завершена!</h2>
        <p style={{ color:'rgba(255,255,255,.55)', fontSize:14 }}>Спасибо, что выбрали APARU</p>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'20px 16px 32px', display:'flex', flexDirection:'column', gap:14, marginTop:-16 }}>

        {/* Trip stats */}
        <Card>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr' }}>
            {[
              { v:'12 мин', l:'Время',     e:<Ico.clock s={22} c={C.teal}/> },
              { v:'4.2 км', l:'Расстояние',e:<Ico.mapPin s={22} c={C.org}/> },
              { v:'1 050 ₸',l:'Сумма',     e:<Ico.wallet s={22} c={C.ok}/> },
            ].map((s, i) => (
              <div key={i} style={{ textAlign:'center', padding:'16px 8px', borderRight: i < 2 ? `1px solid ${C.bdr}` : 'none' }}>
                <div style={{ marginBottom:6, display:'flex', justifyContent:'center' }}>{s.e}</div>
                <div style={{ fontSize:17, fontWeight:800, color:C.dk }}>{s.v}</div>
                <div style={{ fontSize:11, color:C.gray, marginTop:2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Driver rating */}
        <Card>
          <div style={{ textAlign:'center', padding:'4px 0' }}>
            <div style={{ fontSize:16, fontWeight:700, color:C.dk, marginBottom:4 }}>Как прошла поездка?</div>
            <div style={{ fontSize:13, color:C.gray, marginBottom:20 }}>Оцените водителя Алексея</div>
            <div style={{ display:'flex', justifyContent:'center', gap:10, marginBottom:16 }}>
              {[1,2,3,4,5].map(s => (
                <div key={s}
                  onClick={() => { setRating(s); setRated(true); }}
                  onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
                  style={{ cursor:'pointer', transform:`scale(${hover>=s||rating>=s?1.22:1})`, transition:'transform .12s' }}
                >
                  <Ico.star filled={hover >= s || rating >= s} s={38} />
                </div>
              ))}
            </div>
            {rated && (
              <div className="fi" style={{ fontSize:13, color:C.ok, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                Спасибо за оценку! <Ico.heart s={14} c={C.ok}/>
              </div>
            )}
          </div>
        </Card>

        {/* Social Coins coupon — показывается только при QR из Oskemen Hub */}
        {isOskemenHub && (
          <div style={{ background:`linear-gradient(135deg,#0B6E73,${C.teal})`, borderRadius:20, padding:'20px', position:'relative', overflow:'hidden' }}>
            {/* Decorative circles */}
            <div style={{ position:'absolute', right:-24, top:-24, width:100, height:100, borderRadius:50, background:'rgba(255,255,255,.07)' }} />
            <div style={{ position:'absolute', right:10, bottom:-30, width:80, height:80, borderRadius:40, background:'rgba(255,255,255,.05)' }} />

            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14, position:'relative' }}>
              {/* SC coin icon */}
              <div style={{ width:56, height:56, borderRadius:28, background:'rgba(255,255,255,.18)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:'2px solid rgba(255,255,255,.3)' }}>
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                  <circle cx="15" cy="15" r="13" fill="rgba(255,255,255,.15)" stroke="white" strokeWidth="2"/>
                  <text x="15" y="20" textAnchor="middle" fontSize="13" fontWeight="900" fill="white">SC</text>
                </svg>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ color:'rgba(255,255,255,.75)', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:.6, marginBottom:2 }}>Oskemen Hub</div>
                <div style={{ color:'white', fontWeight:800, fontSize:17, lineHeight:1.2 }}>+{SC_AMOUNT} Social Coins</div>
                <div style={{ color:'rgba(255,255,255,.75)', fontSize:12, marginTop:3 }}>За поездку из хаба</div>
              </div>
              {/* Amount badge */}
              <div style={{ background:'rgba(255,255,255,.2)', borderRadius:14, padding:'6px 14px', border:'1.5px solid rgba(255,255,255,.3)', flexShrink:0 }}>
                <div style={{ color:'white', fontSize:20, fontWeight:900, lineHeight:1 }}>{SC_AMOUNT}</div>
                <div style={{ color:'rgba(255,255,255,.7)', fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:.5 }}>SC</div>
              </div>
            </div>

            <div style={{ background:'rgba(255,255,255,.1)', borderRadius:14, padding:'12px 14px', marginBottom:14, position:'relative' }}>
              <div style={{ color:'rgba(255,255,255,.85)', fontSize:12, lineHeight:1.6 }}>
                <b style={{ color:'white' }}>Social Coins (SC)</b> — виртуальная валюта за активность в сообществе. Тратьте на услуги и товары в <b style={{ color:'white' }}>Hub Market</b>.
              </div>
            </div>

            {scClaimed ? (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'14px', background:'rgba(255,255,255,.15)', borderRadius:14, border:'1.5px solid rgba(255,255,255,.3)' }}>
                <Ico.check s={16} c="white" />
                <span style={{ color:'white', fontWeight:700, fontSize:14 }}>Начислено! Проверьте Hub Market</span>
              </div>
            ) : (
              <button
                onClick={() => setScClaimed(true)}
                style={{ width:'100%', padding:'14px', borderRadius:14, border:'2px solid rgba(255,255,255,.5)', background:'rgba(255,255,255,.15)', color:'white', fontSize:14, fontWeight:700, cursor:'pointer', backdropFilter:'blur(4px)', letterSpacing:.2 }}
              >
                Получить {SC_AMOUNT} SC →
              </button>
            )}
          </div>
        )}

        {/* App download CTA — ТЗ §3.7 */}
        <div style={{ background:`linear-gradient(135deg,${C.org},${C.orgLt})`, borderRadius:20, padding:'20px' }}>
          <div style={{ display:'flex', gap:14, alignItems:'flex-start', marginBottom:16 }}>
            <div style={{ width:56, height:56, borderRadius:18, background:'rgba(0,0,0,.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none"><circle cx="15" cy="15" r="13" stroke="white" strokeWidth="2.5"/><circle cx="15" cy="15" r="5" fill="white"/><circle cx="15" cy="15" r="2" fill={C.org}/></svg>
            </div>
            <div>
              <div style={{ color:'white', fontWeight:800, fontSize:17 }}>Скачайте APARU</div>
              <div style={{ color:'rgba(255,255,255,.85)', fontSize:13, marginTop:5, lineHeight:1.5 }}>Все функции в одном приложении. Бонусы за каждую поездку!</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            {[
              { i:<Ico.apple s={22}/>,   n:'App Store' },
              { i:<Ico.android s={22}/>, n:'Google Play' },
            ].map(b => (
              <div key={b.n} style={{ flex:1, background:'rgba(0,0,0,.18)', borderRadius:14, padding:'12px 14px', display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                {b.i}
                <div>
                  <div style={{ color:'rgba(255,255,255,.7)', fontSize:10 }}>Скачать в</div>
                  <div style={{ color:'white', fontWeight:700, fontSize:13 }}>{b.n}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Re-scan / new ride — ТЗ §3.6 */}
        <GhostBtn onClick={onRestart}>↩ Новая поездка</GhostBtn>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   §14 — APP ROOT
   State machine: welcome → details → phone →
   otp → searching → driver → trip → completed
═══════════════════════════════════════════ */
function App() {
  const qr = useMemo(getQRParams, []);

  const [screen,    setScreen]    = useState('welcome');
  const [dest,      setDest]      = useState('');
  const [destCoord, setDestCoord] = useState(null);
  const [tariff,    setTariff]    = useState('economy');
  const [phone,     setPhone]     = useState('');
  const [hubShare,  setHubShare]  = useState(false);

  const go = s => setScreen(s);

  /* Screen map */
  const screens = {
    welcome: (
      <WelcomeScreen qr={qr} onNext={(d, dc, t, hs) => {
        setDest(d); setDestCoord(dc); setTariff(t); setHubShare(!!hs); go('details');
      }} />
    ),
    details: (
      <DetailsScreen qr={qr} dest={dest} destCoord={destCoord} tariff={tariff}
        onNext={() => go('phone')}
        onBack={() => go('welcome')}
      />
    ),
    phone: (
      <PhoneScreen onNext={p => { setPhone(p); go('otp'); }} onBack={() => go('details')} />
    ),
    otp: (
      <OTPScreen phone={phone} onNext={() => go('searching')} onBack={() => go('phone')} />
    ),
    searching: (
      <SearchingScreen onNext={() => go('driver')} />
    ),
    driver: (
      <DriverScreen qr={qr} tariff={tariff} onStart={() => go('trip')} onCancel={() => go('welcome')} />
    ),
    trip: (
      <TripScreen qr={qr} dest={dest} destCoord={destCoord} onEnd={() => go('completed')} />
    ),
    completed: (
      <CompletedScreen qr={qr} onRestart={() => { setDest(''); setDestCoord(null); go('welcome'); }} />
    ),
  };

  /* Dev navigation — only visible with ?dev=1 */
  const devLabels = { welcome:'Главная', details:'Детали', phone:'Телефон', otp:'Код', searching:'Поиск', driver:'Водитель', trip:'Поездка', completed:'Готово' };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100dvh', overflow:'hidden' }}>
      {IS_DEV && (
        <nav className="dev-nav">
          {Object.keys(devLabels).map(s => (
            <button key={s} onClick={() => go(s)} className={screen === s ? 'active' : ''}>
              {devLabels[s]}
            </button>
          ))}
        </nav>
      )}
      <div style={{ flex:1, overflow:'hidden', position:'relative' }}>
        {screens[screen]}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
