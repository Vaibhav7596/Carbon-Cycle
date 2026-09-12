import L from 'leaflet';

export const createSourceIcon = (label?: string) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div class="relative flex items-center justify-center group">
        <div class="absolute -inset-1 bg-emerald-500/20 rounded-full blur-sm animate-pulse"></div>
        <div class="w-8 h-8 bg-emerald-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white text-xs font-bold transform transition hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="m12 8 4 4-4 4"/>
            <path d="M8 12h8"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export const createFacilityIcon = (type: string) => {
  const isBiochar = type === 'BIOCHAR';
  const bgColor = isBiochar ? 'bg-amber-700' : type === 'BIOGAS' ? 'bg-emerald-700' : 'bg-lime-700';

  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div class="relative flex items-center justify-center group">
        <div class="w-9 h-9 ${bgColor} border-2 border-white rounded-lg shadow-xl flex items-center justify-center text-white text-xs font-bold transform transition hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/>
            <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
            <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
            <path d="M10 6h4"/>
            <path d="M10 10h4"/>
            <path d="M10 14h4"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

export const createTruckIcon = () => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="w-8 h-8 bg-blue-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
            <path d="M15 18H9"/>
            <path d="M19 18h2a1 1 0 0 0 1-1v-5l-3-4h-4v10h1"/>
            <circle cx="7" cy="18" r="2"/>
            <circle cx="17" cy="18" r="2"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};
