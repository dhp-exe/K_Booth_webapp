// src/components/CameraCapture.jsx
import React, { useEffect } from 'react';
import { Upload, ChevronLeft, X, Image as ImageIcon, Zap } from 'lucide-react';

export default function CameraCapture({ 
  stream, 
  videoRef, 
  canvasRef, 
  photos, 
  layout, 
  countdown, 
  onTakePhoto, 
  onUpload, 
  onUndo, 
  onBack,
  isAutoMode,
  setIsAutoMode
}) {
  
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  const LayoutPreview = () => {
    const slotClass = "bg-gray-100 rounded-sm flex items-center justify-center text-gray-300 overflow-hidden relative";
    const activeClass = "ring-2 ring-pink-500 ring-offset-1"; 
    const cardClass = "bg-white p-1.5 md:p-3 rounded-lg md:rounded-xl shadow-lg border border-gray-100 flex flex-col transition-all duration-300 h-auto";

    const renderSlot = (index, aspectClass) => {
        const hasPhoto = photos[index];
        const isNext = index === photos.length;
        
        return (
            <div key={index} className={`flex-1 ${slotClass} ${aspectClass} ${isNext ? activeClass : ''}`}>
                {hasPhoto ? (
                    <img src={hasPhoto} alt={`shot-${index}`} className="w-full h-full object-cover" />
                ) : (
                    <ImageIcon size={12} strokeWidth={1.5} /> /* Reduced icon size */
                )}
            </div>
        );
    };

    switch (layout.id) {
      case 'strip4': 
        return (
          <div className={`${cardClass} w-14 md:w-32`}>
             <div className="flex-1 flex flex-col gap-1 md:gap-2">
                {[...Array(4)].map((_, i) => renderSlot(i, 'aspect-[4/3]'))}
             </div>
          </div>
        );
      case 'grid2x2':
        return (
          <div className={`${cardClass} w-24 md:w-48`}>
            <div className="w-full grid grid-cols-2 gap-1 md:gap-2">
               {[...Array(4)].map((_, i) => renderSlot(i, 'aspect-[2/3]'))}
            </div>
          </div>
        );
      case 'grid3x2':
        return (
          <div className={`${cardClass} w-24 md:w-48`}>
             <div className="w-full grid grid-cols-2 gap-1 md:gap-2">
                {[...Array(6)].map((_, i) => renderSlot(i, 'aspect-[2/3]'))}
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    // Changed h-screen to h-[100dvh] for mobile browser support
    <div className="flex flex-col h-[100dvh] bg-gray-900 text-white relative overflow-hidden">
      
      {/* Header */}
      <div className="absolute top-0 w-full p-4 z-30 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={onBack} className="p-2 bg-white/10 rounded-full backdrop-blur-md hover:bg-white/20 transition-all">
          <ChevronLeft />
        </button>
        <div className="bg-black/30 backdrop-blur-md px-4 py-1 rounded-full border border-white/10">
            <span className="font-semibold tracking-wider text-sm">{photos.length} / {layout.slots}</span>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Main Viewfinder */}
      {/* Reduced padding on mobile (p-2) to maximize screen real estate */}
      <div className="flex-1 relative flex items-center justify-center bg-gray-900 p-2 pb-0 md:p-10 overflow-hidden">
        <div className="relative w-full h-full max-w-4xl overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl ring-1 ring-white/10 bg-black">
            {stream ? (
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-cover transform -scale-x-100" 
            />
            ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 animate-pulse gap-2">
                <div className="w-12 h-12 border-4 border-gray-600 border-t-gray-400 rounded-full animate-spin"></div>
                <p className="text-sm font-medium tracking-wider">STARTING CAMERA</p>
            </div>
            )}
            
            {/* Countdown Overlay */}
            {countdown && (
            <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/40 backdrop-blur-[2px]">
                <span className="text-8xl md:text-9xl font-bold animate-pulse text-white drop-shadow-2xl">{countdown}</span>
            </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Desktop Layout Preview */}
        <div className="absolute top-12 right-6 z-20 opacity-90 hover:opacity-100 transition-opacity hidden md:block">
            <LayoutPreview />
        </div>
      </div>

      {/* Controls Bar */}
      {/* pb-safe handles iPhone Home Bar */}
      <div className="bg-black p-5 md:p-6 pb-8 md:pb-10 flex flex-col gap-4 items-center relative z-30 shadow-2xl safe-pb">
        
        {/* Mobile Layout Preview (Floating above controls) */}
        <div className="md:hidden absolute bottom-full right-4 mb-4 origin-bottom-right drop-shadow-2xl">
            <LayoutPreview />
        </div>

        <div className="flex items-center justify-center gap-6 md:gap-8 w-full max-w-lg">
           {/* Upload */}
           <label className="flex flex-col items-center gap-1.5 md:gap-2 cursor-pointer group">
              <div className="p-3 md:p-3.5 rounded-full bg-gray-800 border border-gray-700 group-hover:bg-gray-700 group-hover:border-gray-500 transition-all">
                <Upload size={18} className="text-gray-300 group-hover:text-white md:w-5 md:h-5" />
              </div>
              <span className="text-[9px] md:text-[10px] uppercase tracking-wider font-medium text-gray-400 group-hover:text-white">Upload</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={onUpload} />
           </label>

           {/* Auto Mode Toggle */}
           <button 
             onClick={() => setIsAutoMode(!isAutoMode)}
             className={`flex flex-col items-center gap-1.5 md:gap-2 group transition-all ${isAutoMode ? 'scale-110' : ''}`}
           >
              <div className={`p-3 md:p-3.5 rounded-full border transition-all duration-300
                 ${isAutoMode 
                    ? 'bg-yellow-500/20 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' 
                    : 'bg-gray-800 border-gray-700 group-hover:border-gray-500'}
              `}>
                <Zap size={18} className={`transition-colors md:w-5 md:h-5 ${isAutoMode ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
              </div>
              <span className={`text-[9px] md:text-[10px] uppercase tracking-wider font-bold transition-colors ${isAutoMode ? 'text-yellow-400' : 'text-gray-400'}`}>
                {isAutoMode ? 'Auto' : 'Manual'}
              </span>
           </button>

           {/* Shutter Button (Center) */}
           <button 
             onClick={onTakePhoto}
             disabled={countdown !== null || photos.length >= layout.slots}
             className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-[4px] md:border-[5px] flex items-center justify-center transition-all duration-300 shadow-lg relative
               ${countdown !== null ? 'border-red-500 bg-red-500/20 scale-95' : 'border-white hover:bg-white/20 active:scale-90'}
               ${photos.length >= layout.slots ? 'opacity-50 cursor-not-allowed border-gray-500' : ''}
             `}
           >
             <div className={`rounded-full transition-all duration-300 shadow-inner
                ${countdown !== null ? 'w-3 h-3 bg-red-500' : 'w-12 h-12 md:w-16 md:h-16 bg-white'}
             `}></div>
           </button>

           {/* Undo */}
           <button 
             onClick={onUndo}
             disabled={photos.length === 0}
             className="flex flex-col items-center gap-1.5 md:gap-2 group disabled:opacity-30 disabled:cursor-not-allowed"
           >
              <div className="p-3 md:p-3.5 rounded-full bg-gray-800 border border-gray-700 group-hover:bg-gray-700 group-hover:border-gray-500 transition-all">
                <X size={18} className="text-gray-300 group-hover:text-white md:w-5 md:h-5" />
              </div>
              <span className="text-[9px] md:text-[10px] uppercase tracking-wider font-medium text-gray-400 group-hover:text-white">Undo</span>
           </button>
        </div>
      </div>
    </div>
  );
}