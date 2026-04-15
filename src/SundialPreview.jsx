// 檔案名稱：src/SundialPreview.jsx
import React, { useMemo } from 'react';
import { calculateHourLines } from './sundialMath';

export default function SundialPreview({ config }) {
  const hourLines = useMemo(() => calculateHourLines(config), [config]);
  const radius = config.radius || 150;
  const padding = 60;
  const viewBoxSize = radius + padding;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-xl p-6 relative">
      <svg viewBox={`-${viewBoxSize} -${viewBoxSize} ${viewBoxSize * 2} ${viewBoxSize * 2}`} className="w-full max-w-lg h-auto">
        
        {/* 12:00 垂直基準輔助線 (淡淡的灰色，確認校正用) */}
        <line x1="0" y1={-radius-10} x2="0" y2={radius+10} stroke="#f3f4f6" strokeWidth="1" />

        {hourLines.map((line, idx) => {
          const shift = line.thicknessShift || 0;
          const px = line.x * radius;
          const py = -line.y * radius; // SVG Y 軸向下，所以取負

          return (
            <g key={`${line.hour}-${idx}`} transform={`translate(${shift}, 0)`}>
              {config.type === 'analemmatic' ? (
                // 地平投影式：畫點
                <circle cx={px} cy={py} r="3.5" fill="#3b82f6" className="drop-shadow-sm" />
              ) : (
                // 放射狀：畫線
                <line x1="0" y1="0" x2={px} y2={py} stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round" />
              )}
              
              {/* 時間文字 */}
              <text 
                x={px * 1.15} y={py * 1.15} 
                textAnchor="middle" alignmentBaseline="middle" 
                fontSize="10" fill="#6b7280" className="select-none font-medium"
              >
                {line.hour}
              </text>
            </g>
          );
        })}
        
        {/* 中心點標記 */}
        <circle cx="0" cy="0" r="2.5" fill="#ef4444" />
      </svg>
      
      <div className="absolute bottom-4 text-[10px] text-gray-400 font-mono">
        12:00 校正基準已對齊 Y 軸
      </div>
    </div>
  );
}