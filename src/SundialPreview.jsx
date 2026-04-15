// 檔案名稱：src/SundialPreview.jsx
import React, { useMemo } from 'react';
import { calculateHourLines } from './sundialMath';

export default function SundialPreview({ config }) {
  const hourLines = useMemo(() => calculateHourLines(config), [config]);
  const radius = config.radius || 150;
  const padding = 80;
  const viewBoxSize = radius + padding;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
      <svg viewBox={`-${viewBoxSize} -${viewBoxSize} ${viewBoxSize * 2} ${viewBoxSize * 2}`} style={{ width: '100%', maxWidth: '600px', height: 'auto' }}>
        
        {/* 極淡的參考線，確認 12 點有沒有歪 */}
        <line x1="0" y1={-radius-20} x2="0" y2={radius+20} stroke="#f1f5f9" strokeWidth="2" />
        <line x1={-radius-20} y1="0" x2={radius+20} y2="0" stroke="#f1f5f9" strokeWidth="2" />

        {hourLines.map((line, idx) => {
          const shift = line.thicknessShift || 0;
          const px = line.x * radius;
          const py = -line.y * radius; // SVG Y 軸向上取負

          return (
            <g key={`${line.hour}-${idx}`} transform={`translate(${shift}, 0)`}>
              {config.type === 'analemmatic' ? (
                <circle cx={px} cy={py} r="5" fill="#2563eb" />
              ) : (
                <line x1="0" y1="0" x2={px} y2={py} stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
              )}
              
              <text 
                x={px * 1.25} y={py * 1.25} 
                textAnchor="middle" alignmentBaseline="middle" 
                style={{ fontSize: '14px', fontWeight: 'bold', fill: '#64748b', userSelect: 'none' }}
              >
                {line.hour}
              </text>
            </g>
          );
        })}
        
        <circle cx="0" cy="0" r="4" fill="#ef4444" />
      </svg>
    </div>
  );
}