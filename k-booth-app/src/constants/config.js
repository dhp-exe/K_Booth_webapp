export const LAYOUTS = [
  { id: 'strip4', name: '4-Cut Strip', slots: 4, cols: 1, label: 'Vertical Strip' },
  { id: 'grid2x2', name: '2x2 Grid', slots: 4, cols: 2, label: 'Square Grid' },
  { id: 'grid3x2', name: '6-Cut Grid', slots: 6, cols: 2, label: 'Large Grid' },
];

export const FILTERS = [
  { id: 'normal', name: 'Original', css: 'none' },
  { id: 'bw', name: 'Mono', css: 'grayscale(100%) contrast(110%)' },
  { id: 'warm', name: 'Warm', css: 'sepia(40%) contrast(105%) brightness(105%)' },
  { id: 'cool', name: 'Cool', css: 'hue-rotate(180deg) sepia(20%) brightness(105%) opacity(0.9)' },
  { id: 'soft', name: 'Soft', css: 'brightness(110%) contrast(90%) saturate(85%)' },
  { id: 'vintage', name: 'Vintage', css: 'sepia(60%) hue-rotate(-10deg) contrast(120%) saturate(80%)' },
];

export const FRAME_COLORS = [
  { id: 'white', name: 'White', hex: '#ffffff', text: '#000000' },
  { id: 'black', name: 'Black', hex: '#1a1a1a', text: '#ffffff' },
  { id: 'pink', name: 'Pastel Pink', hex: '#fdf2f8', text: '#be185d' },
  { id: 'blue', name: 'Sky Blue', hex: '#f0f9ff', text: '#0369a1' },
  { id: 'cream', name: 'Cream', hex: '#fffbeb', text: '#b45309' },
  { id: 'purple', name: 'Lilac', hex: '#faf5ff', text: '#7e22ce' },
];