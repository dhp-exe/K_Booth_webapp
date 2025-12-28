import bg1 from '../assets/backgrounds/bg_blue.jpg'; 
import bg2 from '../assets/backgrounds/bg_darkRed.jpg'; 
import bg3 from '../assets/backgrounds/bg_grey.jpg';
export const FILTERS = [
  { id: 'normal', name: 'Original', css: 'none' },
  { id: 'bw', name: 'Mono', css: 'grayscale(100%) contrast(110%)' },
  { id: 'warm', name: 'Warm', css: 'sepia(40%) contrast(105%) brightness(105%)' },
  { id: 'cool', name: 'Cool', css: 'hue-rotate(-10deg) sepia(20%) brightness(105%)' },
  { 
    id: 'Film 1', 
    name: 'Film 1', 
    css: 'brightness(110%) contrast(90%) saturate(90%) sepia(20%) hue-rotate(-10deg) ' 
  },
  { 
    id: 'Film 2', 
    name: 'Film 2', 
    css: 'saturate(120%) contrast(100%) brightness(105%) ' 
  },
  { 
    id: 'beauty-glow', 
    name: 'Glow', 
    css: 'brightness(112%) saturate(110%) sepia(10%) contrast(100%)' 
  },
  { 
    id: 'beauty-clear', 
    name: 'Clear', 
    css: 'contrast(115%) brightness(105%) hue-rotate(5deg) saturate(100%)' 
  },
];

export const LAYOUTS = [
  { id: 'strip4', name: '2x6 Strip', slots: 4, cols: 1, label: 'Classic Strip' },
  { id: 'grid2x2', name: '4x6 Vertical', slots: 4, cols: 2, label: '4-Photo Frame' },
  { id: 'grid3x2', name: '2x3 Grid', slots: 6, cols: 2, label: '6-Photo Grid' },
];

export const BACKGROUNDS = [
  { id: 'none', name: 'None', type: 'color', value: 'transparent' },
  
  { id: 'bg-pink', name: 'Pink', type: 'color', value: '#ffcfd2' },
  { id: 'bg-film', name: 'Film', type: 'color', value: '#767257' },
  { id: 'bg-grey', name: 'Dark Grey', type: 'color', value: '#3c3d42' },
  { id: 'bg-deepBlue', name: 'Deep Blue', type: 'color', value: '#192841' },

  { id: 'bg-1', name: 'Curtain 1', type: 'image', value: bg1 },
  { id: 'bg-2', name: 'Stranger Things', type: 'image', value: bg2 },
  { id: 'bg-3', name: 'Curtain 2', type: 'image', value: bg3 },
];

export const FRAME_COLORS = [
  { id: 'white', name: 'White', hex: '#ffffff', text: '#000000' },
  { id: 'black', name: 'Black', hex: '#1a1a1a', text: '#ffffff' },
  { id: 'dark red', name:'Dark red', hex: '#530000', text: '#fff7f7ff'},
  { id: 'grey', name: 'Grey', hex: '#272934ff', text: '#d5d5d5ff' },
  { id: 'blue', name: 'Sky Blue', hex: '#1071b2ff', text: '#060e12ff' },
  { id: 'cream', name: 'Cream', hex: '#2b502bff', text: '#edededff' },
  { id: 'purple', name: 'Lilac', hex: '#341539', text: '#eedaffff' },
  { id: 'orange', name: 'Fox Orange', hex: '#857056ff', text: '#f6e1d8ff' },
];