/* ═══════════════════════════════════════════
   APARU QR Taxi — Config & Design Tokens
   Plain JS (no JSX) — loaded before React app
═══════════════════════════════════════════ */

/* ── Dev mode flag (add ?dev=1 to URL to enable dev nav) ── */
var IS_DEV = new URLSearchParams(window.location.search).has('dev');

/* ── Design Tokens (from Figma) ─────────── */
var C = {
  org:    '#FC6500',
  orgDk:  '#D85800',
  orgLt:  '#FF7A26',
  orgGh:  'rgba(252,101,0,.10)',
  teal:   '#009AA3',
  tealGh: 'rgba(0,154,163,.10)',
  dk:     '#2A3037',
  dkMid:  '#4A5568',
  gray:   '#8A95A3',
  grayLt: '#C4CAD4',
  bdr:    '#E8ECF0',
  bg:     '#F5F6FA',
  white:  '#FFFFFF',
  ok:     '#16A34A',
  okGh:   'rgba(22,163,74,.12)',
  shd:    '0 4px 24px rgba(42,48,55,.10)',
  shdSm:  '0 2px 12px rgba(42,48,55,.08)',
};

/* ── API Layer ──────────────────────────── */
var API = {
  base: 'http://testtaxi3.aparu.kz',
  key:  'test1',

  async post(path, body) {
    try {
      var r = await fetch(this.base + path, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'X-Api-Key': this.key },
        body:    JSON.stringify(body),
      });
      if (!r.ok) return null;
      return await r.json();
    } catch (e) {
      return null;
    }
  },

  geocode(text, lat, lng) {
    lat = lat || 49.9483;
    lng = lng || 82.6135;
    return this.post('/api/v1/maps/geocode', { text, latitude: lat, longitude: lng, withCities: true });
  },

  reverseGeocode(lat, lng) {
    return this.post('/api/v1/maps/reverse-geocode', { latitude: lat, longitude: lng });
  },

  route(points) {
    return this.post('/api/v1/maps/route', { points });
  },

  /* Simulate order creation (Phase 1 mock — Phase 2 will use real endpoint) */
  createOrder(params) {
    return new Promise(function(resolve) {
      setTimeout(function() {
        resolve({
          orderId:  'ORD-' + Math.random().toString(36).slice(2, 9).toUpperCase(),
          status:   'searching',
          driver:   null,
        });
      }, 800);
    });
  },
};

/* ── Nominatim (OpenStreetMap) geocoder ────
   Covers ALL addresses indexed in OSM for UKG.
   Free, no API key required.
   Rate limit: 1 req/s — fine for user-typed queries.
──────────────────────────────────────────── */
var Nominatim = {
  _ua: { 'User-Agent': 'APARU-QR-Taxi/1.0 (hackathon demo)' },

  async search(text) {
    try {
      var url = 'https://nominatim.openstreetmap.org/search'
        + '?q=' + encodeURIComponent(text + ' Усть-Каменогорск')
        + '&countrycodes=kz&format=json&limit=6&accept-language=ru&addressdetails=1';
      var r = await fetch(url, { headers: this._ua });
      if (!r.ok) return [];
      var data = await r.json();
      return data.map(function(item) {
        var parts = item.display_name.split(',');
        return {
          address:        parts[0].trim(),
          additionalInfo: parts.slice(1, 3).map(function(s){ return s.trim(); }).join(', '),
          latitude:       parseFloat(item.lat),
          longitude:      parseFloat(item.lon),
          type:           's',
          nominatim:      true,
        };
      });
    } catch(e) { return []; }
  },

  async reverse(lat, lng) {
    try {
      var url = 'https://nominatim.openstreetmap.org/reverse'
        + '?lat=' + lat + '&lon=' + lng
        + '&format=json&accept-language=ru&addressdetails=1';
      var r = await fetch(url, { headers: this._ua });
      if (!r.ok) return null;
      var d = await r.json();
      if (!d || d.error) return null;
      var a = d.address || {};
      var street = a.road || a.pedestrian || a.path || '';
      var house  = a.house_number || '';
      var label  = street + (house ? ', ' + house : '');
      return {
        address:        label || d.display_name.split(',')[0],
        additionalInfo: a.city || a.town || 'Усть-Каменогорск',
        latitude:       parseFloat(d.lat),
        longitude:      parseFloat(d.lon),
        type:           's',
      };
    } catch(e) { return null; }
  },
};

/* ── QR URL params parser ───────────────── */
function getQRParams() {
  var p = new URLSearchParams(window.location.search);
  return {
    name: p.get('name') || 'Oskemen Hub · ул. Казахстан, 59',
    lat:  parseFloat(p.get('lat'))  || 49.949513,
    lng:  parseFloat(p.get('lng'))  || 82.627727,
  };
}
