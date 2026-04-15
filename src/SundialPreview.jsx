// 檔案名稱：src/SundialPreview.jsx
import React, { useMemo } from 'react';
import { calculateHourLines } from './sundialMath';

export default function SundialPreview({ config }) {
  const hourLines = useMemo(() => calculateHourLines(config), [config]);
  const radius = config.radius || 150;
  const padding = 50;
  const viewBoxSize = radius + padding;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-xl p-6 relative">
      <svg viewBox={`-${viewBoxSize} -${viewBoxSize} ${viewBoxSize * 2} ${viewBoxSize * 2}`} className="w-full max-w-lg h-auto">
        {/* 中心厚度區間指示 (選填) */}
        {config.gnomonThickness > 0 && (
          <rect 
            x={-(config.gnomonThickness/2)} y={-radius} 
            width={config.gnomonThickness} height={radius*2} 
            fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="0.5"
          />
        )}

        {hourLines.map((line, idx) => {
          const shift = line.thicknessShift || 0;
          
          if (config.type === 'analemmatic') {
            const px = line.x * radius + shift;
            const py = -line.y * radius;
            return (
              <g key={`${line.hour}-${idx}`}>
                <circle cx={px} cy={py} r="3" fill="#3b82f6" />
                <text x={px} y={py - 15} textAnchor="middle" fontSize="8" fill="#4b5563">{line.hour}:00</text>
              </g>
            );
          } else {
            const rad = line.angle * (Math.PI / 180);
            const px = radius * Math.sin(rad);
            const py = -radius * Math.cos(rad);
            return (
              <g key={`${line.hour}-${idx}`} transform={`translate(${shift}, 0)`}>
                <line x1="0" y1="0" x2={px} y2={py} stroke="#1f2937" strokeWidth="1.5" />
                <text x={px * 1.1} y={py * 1.1} textAnchor="middle" alignmentBaseline="middle" fontSize="8" fill="#4b5563">
                  {line.hour}:00
                </text>
              </g>
            );
          }
        })}
        
        {/* 0,0 標記 */}
        <circle cx="0" cy="0" r="2" fill="red" />
      </svg>
    </div>
  );
}