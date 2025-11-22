import React from 'react';
import { Camera, Upload, ChevronLeft, X } from 'lucide-react';

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
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white relative">
      {/* Header */}
      <div className="absolute top-0 w-full p-4 z-10 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
        <button onClick={onBack} className="p-2 bg-white/10 rounded-full backdrop-blur-md hover:bg-white/20">
          <ChevronLeft />
        </button>
        <span className="font-semibold tracking-wider">{photos.length} / {layout.slots}</span>
        <div className="w-10"></div>
      </div>

      {/* Main Viewfinder */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {stream ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover transform -scale-x-100" 
          />
        ) : (
          <div className="flex flex-col items-center text-gray-500">
            <Camera size={48} className="mb-4" />
            <p>Camera is off</p>
          </div>
        )}
        
        {/* Countdown Overlay */}
        {countdown && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/20 backdrop-blur-[2px]">
            <span className="text-9xl font-bold animate-pulse text-white drop-shadow-lg">{countdown}</span>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="bg-black p-6 pb-10 flex flex-col gap-6 items-center">
        {/* Gallery Strip Preview */}
        <div className="flex gap-2 overflow-x-auto w-full justify-center min-h-[60px]">
          {[...Array(layout.slots)].map((_, i) => (
            <div key={i} className="w-12 h-16 bg-gray-800 rounded border border-gray-700 overflow-hidden relative">
              {photos[i] ? (
                <img src={photos[i]} alt="captured" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                  {i + 1}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-8 w-full max-w-md">
           <label className="flex flex-col items-center gap-1 cursor-pointer text-gray-400 hover:text-white transition-colors">
              <div className="p-3 rounded-full bg-gray-800 border border-gray-600">
                <Upload size={20} />
              </div>
              <span className="text-xs">Upload</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={onUpload} />
           </label>

           <button 
             onClick={onTakePhoto}
             disabled={countdown !== null || photos.length >= layout.slots}
             className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all
               ${countdown !== null ? 'bg-red-500 scale-90' : 'bg-transparent hover:bg-white/20 active:scale-95'}
               ${photos.length >= layout.slots ? 'opacity-50 cursor-not-allowed' : ''}
             `}
           >
             <div className="w-16 h-16 bg-white rounded-full"></div>
           </button>

           <button 
             onClick={onUndo}
             disabled={photos.length === 0}
             className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors disabled:opacity-30"
           >
              <div className="p-3 rounded-full bg-gray-800 border border-gray-600">
                <X size={20} />
              </div>
              <span className="text-xs">Undo</span>
           </button>
        </div>
      </div>
    </div>
  );
}