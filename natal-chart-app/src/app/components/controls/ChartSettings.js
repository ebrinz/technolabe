import React from 'react';

const ToggleSwitch = ({ label, isEnabled, onToggle }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-cyan-300/70">{label}</span>
    <button
      onClick={onToggle}
      className={`
        relative inline-flex h-4 w-8 items-center rounded-full
        transition-colors duration-300 ease-in-out focus:outline-none
        ${isEnabled ? 'bg-cyan-400/70' : 'bg-gray-700/50'}
        border border-cyan-500/30
      `}
    >
      <span
        className={`
          inline-block h-3 w-3 transform rounded-full
          bg-white/90 transition duration-300 ease-in-out
          ${isEnabled ? 'translate-x-4' : 'translate-x-1'}
          border border-cyan-400/20
        `}
      />
    </button>
  </div>
);

const ChartSettings = ({ 
  useCuneiform, 
  setUseCuneiform, 
  useTraditional, 
  setUseTraditional 
}) => {
  return (
    <div className="space-y-4 p-4 rounded-lg border border-cyan-500/20 px-4 py-2">
      <div className="space-y-3 bg-black/20 px-3 py-2">
        <ToggleSwitch
          label={useCuneiform ? "Cuneiform Numbers" : "Roman Numerals" }
          isEnabled={useCuneiform}
          onToggle={() => setUseCuneiform(!useCuneiform)}
        />
        <ToggleSwitch
          label={useTraditional ? "Traditional Planets" : "Modern Planets" }
          isEnabled={useTraditional}
          onToggle={() => setUseTraditional(!useTraditional)}
        />
      </div>
    </div>
  );
};

export default ChartSettings;