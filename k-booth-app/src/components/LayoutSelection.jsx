import React from 'react';
import { Sparkles } from 'lucide-react';

export default function LayoutSelection({ layouts, onSelect }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-pink-50 p-6 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <Sparkles className="text-pink-500" />
          K-Booth
          <Sparkles className="text-pink-500" />
        </h1>
        <p className="text-gray-500">Select your frame style to begin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {layouts.map((layout) => (
          <button
            key={layout.id}
            onClick={() => onSelect(layout)}
            className="group relative bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-pink-300 flex flex-col items-center gap-4"
          >
            <div className={`w-24 bg-gray-100 rounded border border-gray-200 overflow-hidden flex flex-wrap content-start p-1 gap-0.5
              ${layout.id === 'strip4' ? 'h-32 flex-col items-center' : 'h-24'}
              ${layout.id === 'grid2x2' ? 'w-24 h-24' : ''}
              ${layout.id === 'grid3x2' ? 'w-24 h-32' : ''}
            `}>
              {[...Array(layout.slots)].map((_, i) => (
                <div key={i} className={`bg-gray-300 rounded-sm w-full flex-1 ${layout.id !== 'strip4' ? 'w-[48%] h-[48%]' : ''}`}></div>
              ))}
            </div>
            <div className="text-center">
              <h3 className="font-bold text-gray-800 text-lg">{layout.name}</h3>
              <p className="text-sm text-gray-400">{layout.slots} Shots</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}