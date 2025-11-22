import React, { useEffect } from 'react';
import { Upload, ChevronLeft, X, Image as ImageIcon } from 'lucide-react';

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
  onBack 
}) {
  
  // --- FIX: Automatically attach the stream to the video element ---
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  // --- Helper Component: Renders the mini layout with captured photos ---
  const LayoutPreview = () => {
    const slotClass = "bg-gray-100 rounded-sm flex items-center justify-center text-gray-300 overflow-hidden relative";
    const activeClass = "ring-2 ring-pink-500 ring-offset-1"; 
    const cardClass = "bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex flex-col transition-all duration-300";

    const renderSlot = (index) => {
        const hasPhoto = photos[index];
        const isNext = index === photos.length;
        
        return (
            <div key={index} className={`flex-1 ${slotClass} ${isNext ? activeClass : ''}`}>
                {hasPhoto ? (
                    <img src={hasPhoto} alt={`shot-${index}`} className="w-full h-full object-cover" />
                ) : (
                    <ImageIcon size={16} strokeWidth={1.5} />
                )}
            </div>
        );
    };

    switch (layout.id) {
      case 'strip4': 
        return (
          <div className={`${cardClass} w-24 h-64`}>
             <div className="flex-1 flex flex-col gap-2">
                {[...Array(4)].map((_, i) => renderSlot(i))}
             </div>
          </div>
        );
      case 'grid2x2':
        return (
          <div className={`${cardClass} w-40 h-56 justify-center`}>
            <div className="aspect-[2/3] w-full grid grid-cols-2 gap-2">
               {[...Array(4)].map((_, i) => renderSlot(i))}
            </div>
          </div>
        );
      case 'grid3x2':
        return (
          <div className={`${cardClass} w-40 h-56 justify-center`}>
             <div className="aspect-[2/3] w-full grid grid-cols-2 gap-2">
                {[...Array(6)].map((_, i) => renderSlot(i))}
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 w-full p-4 z-30 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
        <button onClick={onBack} className="p-2 bg-white/10 rounded-full backdrop-blur-md hover:bg-white/20 transition-all">
          <ChevronLeft />
        </button>
        <div className="bg-black/30 backdrop-blur-md px-4 py-1 rounded-full border border-white/10">
            <span className="font-semibold tracking-wider text-sm">{photos.length} / {layout.slots}</span>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Main Viewfinder - RESIZED with Padding */}
      <div className="flex-1 relative flex items-center justify-center bg-gray-900 p-4 pb-0 md:p-10 overflow-hidden">
        
        {/* Video Container with Rounded Corners */}
        <div className="relative w-full h-full max-w-6xl overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10 bg-black">
            {stream ? (
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover transform -scale-x-100" 
            />
            ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 animate-pulse gap-2">
                <div className="w-12 h-12 border-4 border-gray-600 border-t-gray-400 rounded-full animate-spin"></div>
                <p className="text-sm font-medium tracking-wider">STARTING CAMERA</p>
            </div>
            )}
            
            {/* Countdown Overlay inside the video frame */}
            {countdown && (
            <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/40 backdrop-blur-[2px]">
                <span className="text-9xl font-bold animate-pulse text-white drop-shadow-2xl">{countdown}</span>
            </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Live Layout Preview - Floating Top Right */}
        <div className="absolute top-12 right-6 z-20 opacity-90 hover:opacity-100 transition-opacity hidden md:block">
            <LayoutPreview />
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-black p-6 pb-10 flex flex-col gap-4 items-center relative z-30 shadow-2xl">
        
        {/* Mobile Preview (Shows above buttons on small screens) */}
        <div className="md:hidden absolute bottom-full right-4 mb-4 scale-75 origin-bottom-right">
            <LayoutPreview />
        </div>

        <div className="flex items-center justify-center gap-12 w-full max-w-md">
           {/* Upload */}
           <label className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className="p-3.5 rounded-full bg-gray-800 border border-gray-700 group-hover:bg-gray-700 group-hover:border-gray-500 transition-all">
                <Upload size={20} className="text-gray-300 group-hover:text-white" />
              </div>
              <span className="text-[10px] uppercase tracking-wider font-medium text-gray-400 group-hover:text-white">Upload</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={onUpload} />
           </label>

           {/* Shutter Button */}
           <button 
             onClick={onTakePhoto}
             disabled={countdown !== null || photos.length >= layout.slots}
             className={`w-20 h-20 rounded-full border-[5px] flex items-center justify-center transition-all duration-300 shadow-lg
               ${countdown !== null ? 'border-red-500 bg-red-500/20 scale-95' : 'border-white hover:bg-white/20 active:scale-90'}
               ${photos.length >= layout.slots ? 'opacity-50 cursor-not-allowed border-gray-500' : ''}
             `}
           >
             <div className={`rounded-full transition-all duration-300 shadow-inner
                ${countdown !== null ? 'w-4 h-4 bg-red-500' : 'w-16 h-16 bg-white'}
             `}></div>
           </button>

           {/* Undo */}
           <button 
             onClick={onUndo}
             disabled={photos.length === 0}
             className="flex flex-col items-center gap-2 group disabled:opacity-30 disabled:cursor-not-allowed"
           >
              <div className="p-3.5 rounded-full bg-gray-800 border border-gray-700 group-hover:bg-gray-700 group-hover:border-gray-500 transition-all">
                <X size={20} className="text-gray-300 group-hover:text-white" />
              </div>
              <span className="text-[10px] uppercase tracking-wider font-medium text-gray-400 group-hover:text-white">Undo</span>
           </button>
        </div>
      </div>
    </div>
  );
}