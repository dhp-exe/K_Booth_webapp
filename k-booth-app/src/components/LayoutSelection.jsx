import React from 'react';
import { Sparkles, Image as ImageIcon } from 'lucide-react';

export default function LayoutSelection({ layouts, onSelect }) {
  
  const renderPreview = (layoutId) => {
    const slotClass = "bg-[#dbeafe] rounded-sm flex items-center justify-center text-slate-400";
    const iconSize = 20;

    const cardClass = "bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col";

    switch (layoutId) {
      case 'strip4':
        // 4 Photo Strip (Vertical Stack)
        return (
          <div className={`${cardClass} w-32 h-64`}>
             <div className="flex-1 flex flex-col gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`flex-1 ${slotClass}`}>
                    <ImageIcon size={iconSize} strokeWidth={1.5} />
                  </div>
                ))}
             </div>
          </div>
        );

      case 'grid2x2':
        // 4x6 Vertical (2x2 Grid) 
        return (
          <div className={`${cardClass} w-44 h-64 justify-center`}>
            <div className="aspect-[2/3] w-full grid grid-cols-2 gap-2">
               {[...Array(4)].map((_, i) => (
                  <div key={i} className={slotClass}>
                    <ImageIcon size={iconSize} strokeWidth={1.5} />
                  </div>
                ))}
            </div>
          </div>
        );

      case 'grid3x2':
        // 2x3 Grid (6 Photos)
        return (
          <div className={`${cardClass} w-44 h-64 justify-center`}>
             <div className="aspect-[2/3] w-full grid grid-cols-2 gap-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={slotClass}>
                    <ImageIcon size={iconSize} strokeWidth={1.5} />
                  </div>
                ))}
             </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-pink-50 px-4 py-10 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <Sparkles className="text-pink-500" />
          K-Booth
          <Sparkles className="text-pink-500" />
        </h1>
        <p className="text-gray-500">Select your frame style to begin</p>
      </div>

      {/* Grid container for the selection buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-6xl items-end justify-items-center">
        {layouts.map((layout) => (
          <button
            key={layout.id}
            onClick={() => onSelect(layout)}
            className="group flex flex-col items-center gap-6 focus:outline-none"
          >
            {/* The Preview Card with hover lift effect */}
            <div className="relative transition-all duration-300 transform group-hover:-translate-y-2 group-hover:shadow-xl rounded-2xl">
              {renderPreview(layout.id)}
            </div>

            {/* Label */}
            <div className="text-center group-hover:text-pink-600 transition-colors">
              <h3 className="font-bold text-gray-700 text-lg">{layout.name}</h3>
              <p className="text-sm text-gray-400">{layout.label}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}