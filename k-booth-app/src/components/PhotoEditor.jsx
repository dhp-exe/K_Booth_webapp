// src/components/PhotoEditor.jsx
import React, { useState } from 'react';
import { Download, RefreshCw, Palette, Layout, Check, Sparkles, Image as ImageIcon } from 'lucide-react';
import { BACKGROUNDS } from '../constants/config';
import { removeBackground } from '../utils/segmentation';

export default function PhotoEditor({
  photos,
  layout,
  printRef,
  selectedFilter,
  filters,
  onFilterChange,
  selectedFrame,
  frames,
  onFrameChange,
  onDownload,
  isDownloading,
  onRestart
}) {
  // --- STATE FOR BACKGROUND REMOVAL ---
  const [processedPhotos, setProcessedPhotos] = useState({}); // Stores transparent versions
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedBg, setSelectedBg] = useState(BACKGROUNDS[0]); // Default to 'none'

  const gridClass = layout.id === 'strip4' ? 'grid-cols-1' : 'grid-cols-2';
  const containerWidth = layout.id === 'strip4' ? 'max-w-[300px]' : 'max-w-[480px]';

  // --- HANDLER: Background Selection ---
  const handleBackgroundChange = async (bg) => {
    setSelectedBg(bg);

    // Only run AI if we haven't processed these photos yet AND we are choosing a real background
    if (bg.id !== 'none' && Object.keys(processedPhotos).length === 0) {
      setIsProcessing(true);
      const newProcessed = {};
      
      try {
        // Process all photos in the strip
        for (let i = 0; i < photos.length; i++) {
            const originalUrl = photos[i];
            const transparentUrl = await removeBackground(originalUrl);
            newProcessed[i] = transparentUrl;
        }
        setProcessedPhotos(newProcessed);
      } catch (error) {
        console.error("Segmentation failed", error);
        alert("Could not process background. Please try again.");
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

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 overflow-hidden">
      
      {/* LEFT: Live Preview Area */}
      <div className="flex-1 overflow-y-auto p-8 flex items-start justify-center bg-gray-200/50">
        <div className="flex flex-col items-center gap-4">
          
          {/* The Photobooth Strip */}
          <div 
            ref={printRef}
            className={`relative shadow-2xl overflow-hidden transition-colors duration-300 ${containerWidth}`}
            style={{ backgroundColor: selectedFrame.hex }}
          >
            <div className={`p-4 md:p-6 grid ${gridClass} gap-3 md:gap-4`}>
              {photos.map((originalPhoto, idx) => {
                // LOGIC: If a background is active & we have the cutout, show that. Otherwise show original.
                const showTransparent = selectedBg.id !== 'none' && processedPhotos[idx];
                const displayPhoto = showTransparent ? processedPhotos[idx] : originalPhoto;

                return (
                  <div 
                    key={idx} 
                    className={`relative overflow-hidden shadow-inner flex items-center justify-center
                      ${layout.id === 'strip4' ? 'aspect-[4/3]' : 'aspect-[2/3]'}
                      ${showTransparent ? '' : 'bg-gray-100'} 
                    `}
                    // The custom background goes on the CONTAINER
                    style={showTransparent ? getBackgroundStyle(selectedBg) : {}}
                  >
                    {/* Loading Spinner for specific photo slot */}
                    {isProcessing && !processedPhotos[idx] && selectedBg.id !== 'none' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                            <RefreshCw className="animate-spin text-pink-500" />
                        </div>
                    )}

                    {/* The Photo (Original or Cutout) */}
                    <img 
                      src={displayPhoto} 
                      className={`w-full h-full object-cover transition-all duration-500
                        ${showTransparent ? 'scale-105' : 'scale-100'} // Zoom slightly if cutout to fit better
                      `}
                      style={{ filter: selectedFilter.css }}
                      alt={`frame-${idx}`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Footer / Branding */}
            <div className="pb-4 pt-1 flex justify-between items-end px-6">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest opacity-60 font-bold" style={{ color: selectedFrame.text }}>
                  {new Date().toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' })}
                </span>
              </div>
              <div className="flex flex-col items-end">
                 <h2 className="font-bold tracking-tighter text-lg leading-none" style={{ color: selectedFrame.text }}>
                   K-BOOTH
                 </h2>
                 <span className="text-[8px] opacity-70" style={{ color: selectedFrame.text }}>memory archive</span>
              </div>
            </div>
          </div>
          <p className="text-gray-400 text-xs mt-4">Preview</p>
        </div>
      </div>

      {/* RIGHT: Tools Panel */}
      <div className="w-full md:w-80 bg-white shadow-xl z-20 flex flex-col border-l border-gray-100">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
           <h3 className="font-bold text-gray-800">Edit Photo Strip</h3>
           <button onClick={onRestart} className="text-sm text-red-400 hover:text-red-600 font-medium">Start Over</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-8">
          
          {/* 1. BACKGROUNDS (NEW) */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-gray-800 font-medium">
              <Sparkles size={18} className="text-pink-500" />
              <span>Background (Phước đang thử nghiệm)</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {BACKGROUNDS.map(bg => (
                 <button 
                   key={bg.id}
                   onClick={() => handleBackgroundChange(bg)}
                   className={`aspect-square rounded-lg border-2 overflow-hidden relative transition-all
                     ${selectedBg.id === bg.id ? 'border-pink-500 ring-2 ring-pink-200' : 'border-gray-100 hover:border-gray-300'}
                   `}
                   style={getBackgroundStyle(bg)}
                 >
                    {bg.id === 'none' && <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">None</div>}
                    {selectedBg.id === bg.id && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                             <Check size={16} className="text-white drop-shadow-md" />
                        </div>
                    )}
                 </button>
              ))}
            </div>
          </div>

          {/* 2. Filters (Existing) */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-gray-800 font-medium">
              <Palette size={18} className="text-pink-500" />
              <span>Filters</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {filters.map(f => (
                <button 
                  key={f.id}
                  onClick={() => onFilterChange(f)}
                  className={`h-16 rounded-lg overflow-hidden relative border-2 transition-all group
                    ${selectedFilter.id === f.id ? 'border-pink-500 ring-2 ring-pink-200' : 'border-transparent hover:border-gray-200'}
                  `}
                >
                  <img src={photos[0]} className="w-full h-full object-cover absolute inset-0" style={{ filter: f.css }} alt={f.name} />
                  <span className="absolute bottom-0 left-0 w-full bg-black/50 text-white text-[10px] p-1 text-center backdrop-blur-sm">
                    {f.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Frames (Existing) */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-gray-800 font-medium">
              <Layout size={18} className="text-pink-500" />
              <span>Frame Color</span>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {frames.map(color => (
                <button
                  key={color.id}
                  onClick={() => onFrameChange(color)}
                  className={`w-full aspect-square rounded-full border border-gray-200 shadow-sm relative flex items-center justify-center transition-transform active:scale-95
                    ${selectedFrame.id === color.id ? 'ring-2 ring-offset-2 ring-pink-500' : ''}
                  `}
                  style={{ backgroundColor: color.hex }}
                >
                  {selectedFrame.id === color.id && (
                    <Check size={16} style={{ color: color.text }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-gray-50 border-t border-gray-100">
          <button 
            onClick={onDownload}
            disabled={isDownloading || isProcessing}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
          >
            {isDownloading || isProcessing ? (
              <>
                <RefreshCw className="animate-spin" size={20} />
                {isProcessing ? 'Processing...' : 'Saving...'}
              </>
            ) : (
              <>
                <Download size={20} />
                Save Photo
              </>
            )}
          </button>
          <p className="text-center text-gray-400 text-xs mt-3">Made by dhp.</p>
        </div>
      </div>
    </div>
  );
}