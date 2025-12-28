// src/components/PhotoEditor.jsx
import React, { useState } from 'react';
import { Download, RefreshCw, Palette, Layout, Check, Sparkles } from 'lucide-react';
import { BACKGROUNDS } from '../constants/config';
import { removeBackground } from '../utils/segmentation';

export default function PhotoEditor({
  photos,
  layout,
  selectedFilter,
  filters,
  onFilterChange,
  selectedFrame,
  frames,
  onFrameChange,
  onRestart
}) {
  const [processedPhotos, setProcessedPhotos] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedBg, setSelectedBg] = useState(BACKGROUNDS[0]);

  // --- 1. HELPER: Load Image ---
  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // --- 2. HELPER: Draw with Object-Fit: Cover ---
  // (Moved up so bakeFilter can use it)
  const drawCover = (ctx, img, x, y, w, h) => {
    const imgRatio = img.width / img.height;
    const targetRatio = w / h;
    let sx, sy, sw, sh;

    if (imgRatio > targetRatio) {
      // Image is wider -> Crop sides
      sh = img.height;
      sw = img.height * targetRatio;
      sx = (img.width - sw) / 2;
      sy = 0;
    } else {
      // Image is taller -> Crop top/bottom
      sw = img.width;
      sh = img.width / targetRatio;
      sx = 0;
      sy = (img.height - sh) / 2;
    }

    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  };

  // --- 3. HELPER: Bake Filter (OPTIMIZED) ---
  // Now accepts target dimensions (w, h). 
  // It resizes the image FIRST, then filters the small pixels.
  const bakeFilter = (img, filterCss, w, h) => {
    // Create canvas at the exact target size (e.g., 600x400) instead of full 4K
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    
    // 1. Apply Filter
    if (filterCss && filterCss !== 'none') {
        ctx.filter = filterCss;
    }

    // 2. Draw Image (Cropped & Resized)
    // We draw at 0,0 because this canvas is exactly the size of the slot
    drawCover(ctx, img, 0, 0, w, h);
    
    return canvas;
  };

  // --- 4. MAIN LOGIC: Generate High-Res Strip ---
  const handleDownload = async () => {
    setIsSaving(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const STRIP_WIDTH = 1200; 
      const PADDING = 60;
      const GAP = 30;
      const FOOTER_HEIGHT = 160;
      
      let photoWidth, photoHeight, totalHeight;
      const cols = layout.id === 'strip4' ? 1 : 2;
      const rows = layout.id === 'strip4' ? 4 : (layout.id === 'grid3x2' ? 3 : 2);
      const aspectRatio = layout.id === 'strip4' ? 4/3 : 2/3;

      photoWidth = (STRIP_WIDTH - (PADDING * 2) - (GAP * (cols - 1))) / cols;
      photoHeight = photoWidth / aspectRatio;
      totalHeight = PADDING + (rows * photoHeight) + ((rows - 1) * GAP) + FOOTER_HEIGHT + PADDING;

      canvas.width = STRIP_WIDTH;
      canvas.height = totalHeight;

      // Draw Frame Background
      ctx.fillStyle = selectedFrame.hex;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Process Each Photo
      for (let i = 0; i < photos.length; i++) {
        const colIndex = i % cols;
        const rowIndex = Math.floor(i / cols);
        
        const x = PADDING + (colIndex * (photoWidth + GAP));
        const y = PADDING + (rowIndex * (photoHeight + GAP));

        const isSegmented = selectedBg.id !== 'none' && processedPhotos[i];
        const imgSrc = isSegmented ? processedPhotos[i] : photos[i];
        
        let img = await loadImage(imgSrc);

        // 1. Draw Custom Background (if any)
        // Note: Backgrounds are NOT filtered, so we draw them directly on main canvas
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, photoWidth, photoHeight);
        ctx.clip();

        if (isSegmented) {
          if (selectedBg.type === 'color' || selectedBg.type === 'gradient') {
            if (selectedBg.value.includes('gradient')) {
                const grad = ctx.createLinearGradient(x, y + photoHeight, x, y);
                grad.addColorStop(0, '#fbc2eb'); 
                grad.addColorStop(1, '#a6c1ee');
                ctx.fillStyle = grad;
            } else {
                ctx.fillStyle = selectedBg.value;
            }
            ctx.fillRect(x, y, photoWidth, photoHeight);
          } else if (selectedBg.type === 'image') {
            const bgImg = await loadImage(selectedBg.value);
            drawCover(ctx, bgImg, x, y, photoWidth, photoHeight);
          }
        } else {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x, y, photoWidth, photoHeight);
        }
        ctx.restore();

        // 2. PREPARE & DRAW THE PHOTO
        // We pass the dimensions so 'bakeFilter' can shrink it down efficiently
        let finalImageToDraw = img;
        
        if (selectedFilter.css !== 'none') {
             // Bake the filter into a small, resized canvas
             finalImageToDraw = bakeFilter(img, selectedFilter.css, photoWidth, photoHeight);
        }

        // 3. Draw onto Main Strip
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, photoWidth, photoHeight);
        ctx.clip();
        
        if (selectedFilter.css !== 'none') {
            // If baked, it's already cropped/sized, so just draw it 1:1
            ctx.drawImage(finalImageToDraw, x, y, photoWidth, photoHeight);
        } else {
            // If raw image, we still need to crop/resize it
            drawCover(ctx, finalImageToDraw, x, y, photoWidth, photoHeight);
        }
        
        ctx.restore();
      }

      // Draw Footer
      const footerY = totalHeight - PADDING - (FOOTER_HEIGHT / 2);
      
      ctx.fillStyle = selectedFrame.text;
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const dateStr = new Date().toLocaleDateString('en-GB', { year: '2-digit', month: '2-digit', day: 'numeric' });
      ctx.fillText(dateStr.toUpperCase(), PADDING, footerY);

      ctx.textAlign = 'right';
      ctx.font = 'bold 60px sans-serif';
      ctx.fillText('K-BOOTH', STRIP_WIDTH - PADDING, footerY - 15);
      
      ctx.font = '30px sans-serif';
      ctx.globalAlpha = 0.7;
      ctx.fillText('memory archive', STRIP_WIDTH - PADDING, footerY + 25);
      ctx.globalAlpha = 1.0;

      // Export
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `k-booth-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

    } catch (err) {
      console.error("Canvas Gen Failed:", err);
      alert("Failed to save photo.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackgroundChange = async (bg) => {
    setSelectedBg(bg);
    if (bg.id !== 'none' && Object.keys(processedPhotos).length === 0) {
      setIsProcessing(true);
      const newProcessed = {};
      try {
        for (let i = 0; i < photos.length; i++) {
            newProcessed[i] = await removeBackground(photos[i]);
        }
        setProcessedPhotos(newProcessed);
      } catch (error) {
        alert("Background removal failed.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const getBackgroundStyle = (bg) => {
    if (bg.type === 'color' || bg.type === 'gradient') return { background: bg.value };
    if (bg.type === 'image') return { backgroundImage: `url(${bg.value})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    return {};
  };

  const gridClass = layout.id === 'strip4' ? 'grid-cols-1' : 'grid-cols-2';
  const containerWidth = layout.id === 'strip4' ? 'max-w-[140px] md:max-w-[300px]' : 'max-w-[200px] md:max-w-[480px]';

  return (
    <div className="flex flex-row h-[100dvh] bg-gray-100 overflow-hidden">
      
      {/* 1. PREVIEW AREA */}
      <div className="w-[60%] md:flex-1 relative bg-gray-200/50 overflow-hidden border-r border-gray-200">
        <div className="absolute inset-0 overflow-y-auto overflow-x-hidden flex flex-col p-4 md:p-6">
            <div className="my-auto w-full flex flex-col items-center gap-4 min-h-min">
            
                <div 
                    className={`relative shadow-2xl overflow-hidden transition-colors duration-300 ${containerWidth} shrink-0`}
                    style={{ backgroundColor: selectedFrame.hex }}
                >
                    <div className={`p-2 md:p-6 grid ${gridClass} gap-1.5 md:gap-4`}>
                    {photos.map((originalPhoto, idx) => {
                        const showTransparent = selectedBg.id !== 'none' && processedPhotos[idx];
                        const displayPhoto = showTransparent ? processedPhotos[idx] : originalPhoto;

                        return (
                        <div 
                            key={idx} 
                            className={`relative overflow-hidden shadow-inner flex items-center justify-center
                            ${layout.id === 'strip4' ? 'aspect-[4/3]' : 'aspect-[2/3]'}
                            ${showTransparent ? '' : 'bg-gray-100'} 
                            `}
                            style={showTransparent ? getBackgroundStyle(selectedBg) : {}}
                        >
                            {isProcessing && !processedPhotos[idx] && selectedBg.id !== 'none' && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                                    <RefreshCw className="animate-spin text-pink-500 w-4 h-4 md:w-6 md:h-6" />
                                </div>
                            )}
                            <img 
                            src={displayPhoto} 
                            className={`w-full h-full object-cover transition-all duration-500
                                ${showTransparent ? 'scale-105' : 'scale-100'}
                            `}
                            style={{ filter: selectedFilter.css }}
                            alt={`frame-${idx}`}
                            />
                        </div>
                        );
                    })}
                    </div>

                    <div className="pb-2 pt-1 flex justify-between items-end px-2 md:px-6">
                        <div className="flex flex-col">
                            <span className="text-[6px] md:text-[10px] uppercase tracking-widest opacity-60 font-bold" style={{ color: selectedFrame.text }}>
                            {new Date().toLocaleDateString('en-GB', { year: '2-digit', month: '2-digit', day: 'numeric' })}
                            </span>
                        </div>
                        <div className="flex flex-col items-end">
                            <h2 className="font-bold tracking-tighter text-[10px] md:text-lg leading-none" style={{ color: selectedFrame.text }}>
                            K-BOOTH
                            </h2>
                            <span className="text-[5px] md:text-[8px] opacity-70" style={{ color: selectedFrame.text }}>memory archive</span>
                        </div>
                    </div>
                </div>
                
                <p className="text-gray-400 text-[9px] md:text-xs">Preview</p>
            </div>
        </div>
      </div>

      {/* 2. TOOLS PANEL */}
      <div className="w-[40%] md:w-80 bg-white shadow-xl z-20 flex flex-col border-l border-gray-100">
        
        <div className="p-3 md:p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-2 shrink-0">
           <h3 className="font-bold text-gray-800 text-xs md:text-base text-center">Edit Strip</h3>
           <button onClick={onRestart} className="text-[10px] md:text-sm text-red-400 hover:text-red-600 font-medium">Reset</button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 md:p-5 space-y-6">
          
          {/* Backgrounds */}
          <div>
            <div className="flex items-center gap-1 md:gap-2 mb-2 text-gray-800 font-medium text-xs md:text-sm">
              <Sparkles size={14} className="text-pink-500" />
              <span>Backdrop</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {BACKGROUNDS.map(bg => (
                 <button 
                   key={bg.id}
                   onClick={() => handleBackgroundChange(bg)}
                   className={`aspect-square rounded-lg border-2 overflow-hidden relative transition-all group
                     ${selectedBg.id === bg.id ? 'border-pink-500 ring-2 ring-pink-200' : 'border-gray-100'}
                   `}
                   style={getBackgroundStyle(bg)}
                 >
                    {bg.id === 'none' && <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[9px] text-gray-400 mb-2">Off</div>}
                    {selectedBg.id === bg.id && <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10"><Check size={14} className="text-white"/></div>}
                    <span className="absolute bottom-0 left-0 w-full bg-black/50 text-white text-[9px] md:text-[10px] p-0.5 text-center backdrop-blur-sm z-20">
                        {bg.name}
                    </span>
                 </button>
              ))}
            </div>
          </div>

           {/* Filters */}
           <div>
            <div className="flex items-center gap-1 md:gap-2 mb-2 text-gray-800 font-medium text-xs md:text-sm">
              <Palette size={14} className="text-pink-500" />
              <span>Filters</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {filters.map(f => (
                <button 
                  key={f.id}
                  onClick={() => onFilterChange(f)}
                  className={`h-12 md:h-16 rounded-lg overflow-hidden relative border-2 transition-all
                    ${selectedFilter.id === f.id ? 'border-pink-500' : 'border-transparent'}
                  `}
                >
                  <img src={photos[0]} className="w-full h-full object-cover absolute inset-0" style={{ filter: f.css }} alt={f.name} />
                  <span className="absolute bottom-0 left-0 w-full bg-black/50 text-white text-[9px] md:text-[10px] p-0.5 text-center backdrop-blur-sm">
                    {f.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Frames */}
          <div>
            <div className="flex items-center gap-1 md:gap-2 mb-2 text-gray-800 font-medium text-xs md:text-sm">
              <Layout size={14} className="text-pink-500" />
              <span>Frame</span>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {frames.map(color => (
                <button
                  key={color.id}
                  onClick={() => onFrameChange(color)}
                  className={`w-full aspect-square rounded-full border border-gray-200 shadow-sm relative flex items-center justify-center
                    ${selectedFrame.id === color.id ? 'ring-2 ring-offset-1 ring-pink-500' : ''}
                  `}
                  style={{ backgroundColor: color.hex }}
                >
                  {selectedFrame.id === color.id && <Check size={12} style={{ color: color.text }} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 md:p-5 bg-gray-50 border-t border-gray-100 shrink-0 safe-pb">
          <button 
            onClick={handleDownload}
            disabled={isSaving || isProcessing}
            className="w-full bg-pink-500 active:bg-pink-600 text-white py-3 rounded-xl font-bold text-xs md:text-lg shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSaving || isProcessing ? (
              <><RefreshCw className="animate-spin" size={16} /> Saving...</>
            ) : (
              <><Download size={16} /> Save Photo</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}