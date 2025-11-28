export const FILTERS = [
  { id: 'normal', name: 'Original', css: 'none' },
  { id: 'bw', name: 'Mono', css: 'grayscale(100%) contrast(110%)' },
  { id: 'warm', name: 'Warm', css: 'sepia(40%) contrast(105%) brightness(105%)' },
  { id: 'cool', name: 'Cool', css: 'hue-rotate(-10deg) sepia(20%) brightness(105%) opacity(0.9)' },
  
  // --- NEW FILTERS ---
  
  // 1. Vintage Film (Greenish/Faded look like the flower reference)
  { 
    id: 'vintage-film', 
    name: 'Vintage Film', 
    css: 'sepia(40%) hue-rotate(30deg) contrast(85%) brightness(120%) saturate(80%)' 
  },

  // 2. Korean Style (Bright, Soft, slightly desaturated skin tones)
  { 
    id: 'korean', 
    name: 'Film 1', 
    css: 'brightness(110%) contrast(90%) saturate(90%) sepia(20%) hue-rotate(-10deg) blur(0.5px)' 
  },

  // 3. Zootopia Vibe (Vibrant, Saturated, Cartoony Pop)
  { 
    id: 'zootopia', 
    name: 'Film 2', 
    css: 'saturate(120%) contrast(100%) brightness(105%) blur(0.3px)' 
  },
  // 1. "Pure" - The standard 'Beauty Filter' (Bright + Smooth)
  { 
    id: 'beauty-pure', 
    name: 'Pure', 
    // Brightens the face, lowers contrast to hide shadows/blemishes, adds tiny softness
    css: 'brightness(110%) contrast(95%) blur(0.3px)' 
  },

  // 2. "Glow" - Warm and Radiant (Healthy Skin Tone)
  { 
    id: 'beauty-glow', 
    name: 'Glow', 
    // Slight sepia adds warmth, saturation adds color, brightness makes it shine
    css: 'brightness(112%) saturate(110%) sepia(10%) contrast(100%)' 
  },

  // 3. "Clear" - High Definition (Sharp Features)
  { 
    id: 'beauty-clear', 
    name: 'Clear', 
    // Higher contrast makes eyes/lashes pop, slight blue tint (hue-rotate) makes it look crisp
    css: 'contrast(115%) brightness(105%) hue-rotate(5deg) saturate(100%)' 
  },
];

// Keep your existing LAYOUTS and FRAME_COLORS the same
export const LAYOUTS = [
  { id: 'strip4', name: '2x6 Strip', slots: 4, cols: 1, label: 'Classic Strip' },
  { id: 'grid2x2', name: '4x6 Vertical', slots: 4, cols: 2, label: '4-Photo Frame' },
  { id: 'grid3x2', name: '2x3 Grid', slots: 6, cols: 2, label: '6-Photo Grid' },
];

export const FRAME_COLORS = [
  { id: 'white', name: 'White', hex: '#ffffff', text: '#000000' },
  { id: 'black', name: 'Black', hex: '#1a1a1a', text: '#ffffff' },
  { id: 'dark red', name:'Dark red', hex: '#530000', text: '#fff7f7ff'},
  { id: 'pink', name: 'Pastel Pink', hex: '#ffa0d4ff', text: '#4c1029ff' },
  { id: 'blue', name: 'Sky Blue', hex: '#a4cbe5ff', text: '#0369a1' },
  { id: 'cream', name: 'Cream', hex: '#fff0b5ff', text: '#b45309' },
  { id: 'purple', name: 'Lilac', hex: '#d1a6fcff', text: '#7e22ce' },
  { id: 'orange', name: 'Fox Orange', hex: '#857056ff', text: '#f6e1d8ff' },
];