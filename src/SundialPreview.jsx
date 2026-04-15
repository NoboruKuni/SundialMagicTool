// 檔案名稱：src/SundialPreview.jsx
import React, { useMemo } from 'react';
import { calculateHourLines } from './sundialMath';

export default function SundialPreview({ config }) {
  const hourLines = useMemo(() => calculateHourLines(config), [config]);
  const radius = config.radius || 150;
  // 加大 padding 避免文字超出
  const padding = 80; 
  const viewBoxSize = radius + padding;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-xl p-4 relative">
      <svg viewBox={`-${viewBoxSize} -${viewBoxSize} ${viewBoxSize * 2} ${viewBoxSize * 2}`} className="w-full max-w-xl h-auto">
        
        {/* 垂直基準中線 (測試用) */}
        <line x1="0" y1={-radius-20} x2="0" y2={radius+20} stroke="#f1f5f9" strokeWidth="2" />

        {hourLines.map((line, idx) => {
          const shift = line.thicknessShift || 0;
          const px = line.x * radius;
          const py = -line.y * radius; 

          return (
            <g key={`${line.hour}-${idx}`} transform={`translate(${shift}, 0)`}>
              {config.type === 'analemmatic' ? (
                <circle cx={px} cy={py} r="4" fill="#3b82f6" />
              ) : (
                <line x1="0" y1="0" x2={px} y2={py} stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
              )}
              
              {/* 將文字稍微推遠一點，避免重疊 */}
              <text 
                x={px * 1.2} y={py * 1.2} 
                textAnchor="middle" alignmentBaseline="middle" 
                fontSize="12" fill="#64748b" className="font-bold select-none"
              >
                {line.hour}
              </text>
            </g>
          );
        })}
        
        <circle cx="0" cy="0" r="3" fill="#f43f5e" />
      </svg>
      
      <div className="absolute top-4 right-4 text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded">
        Ref: 12:00 Vertically Aligned
      </div>
    </div>
  );
}