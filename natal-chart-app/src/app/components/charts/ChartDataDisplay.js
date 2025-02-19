'use client'
import React from 'react';

const ChartDataDisplay = ({ chartData }) => {
  if (!chartData) return null;

  const formatValue = (value) => {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return value;
  };

  const renderSection = (title, data) => {
    if (!data) return null;

    return (
      <div className="mb-4">
        <h3 className="text-cyan-300 text-lg font-medium mb-2">{title}</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="contents">
              <div className="text-cyan-400/70">{key}:</div>
              <div className="text-cyan-300">{formatValue(value)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPlanetData = (planetData) => {
    if (!planetData) return null;

    return (
      <div className="mb-4">
        <h3 className="text-cyan-300 text-lg font-medium mb-2">Planets</h3>
        <div className="space-y-4">
          {Object.entries(planetData).map(([planet, data]) => (
            <div key={planet} className="bg-black/20 p-3 rounded-lg">
              <h4 className="text-cyan-400 font-medium mb-2">{planet}</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(data).map(([key, value]) => (
                  <div key={key} className="contents">
                    <div className="text-cyan-400/70">{key}:</div>
                    <div className="text-cyan-300">{formatValue(value)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAspects = (aspects) => {
    if (!aspects?.length) return null;

    return (
      <div className="mb-4">
        <h3 className="text-cyan-300 text-lg font-medium mb-2">Aspects</h3>
        <div className="space-y-2">
          {aspects.map((aspect, index) => (
            <div key={index} className="bg-black/20 p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(aspect).map(([key, value]) => (
                  <div key={key} className="contents">
                    <div className="text-cyan-400/70">{key}:</div>
                    <div className="text-cyan-300">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-black/50 backdrop-blur-sm p-4 mt-4 max-h-[500px] overflow-auto">
      {renderPlanetData(chartData.points)}
      {renderAspects(chartData.aspects)}
      {renderSection('Houses', chartData.houses)}
    </div>
  );
};

export default ChartDataDisplay;