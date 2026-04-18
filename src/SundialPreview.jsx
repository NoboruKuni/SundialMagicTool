// 檔案名稱：src/SundialPreview.jsx
import React, { useMemo, useRef } from 'react';
import { calculateHourLines } from './sundialMath';

export default function SundialPreview({ config }) {
  const { hourLines, meridianTimeStr, substyleAngleDeg } = useMemo(() => {
    const lines = calculateHourLines(config);
    const lonOffsetDeg = config.useSolarTime ? 0 : (config.longitude - config.timezone * 15);
    const meridianHourDec = 12 - (lonOffsetDeg / 15);
    let mHrs = Math.floor(meridianHourDec), mMins = Math.round((meridianHourDec - mHrs) * 60);
    if (mMins === 60) { mHrs += 1; mMins = 0; }
    if (mHrs >= 24) mHrs -= 24; if (mHrs < 0) mHrs += 24;

    let sdDeg = 0;
    if (config.type === 'vertical') {
      const D = (config.wallAzimuth || 0) * (Math.PI / 180);
      sdDeg = Math.atan2(Math.sin(D), Math.tan(config.latitude * (Math.PI / 180))) * (180 / Math.PI);
    }
    return { hourLines: lines, meridianTimeStr: `${mHrs}:${mMins.toString().padStart(2, '0')}`, substyleAngleDeg: sdDeg };
  }, [config]);

  const svgRef = useRef(null);
  const radius = config.radius || 150, padding = 120, viewBoxSize = radius + padding;

  const isVertical = config.type === 'vertical';
  const axisYDir = isVertical ? 1 : -1; 

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', backgroundColor: 'white' }}>
      
      <div style={{ position: 'absolute', top: '30px', right: '30px', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
            <div style={{ width: '2px', height: '20px', backgroundColor: isVertical ? '#3b82f6' : '#ef4444', transform: isVertical ? 'rotate(180deg)' : 'none' }}></div>
        </div>
        <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px', fontWeight: 'bold' }}>{isVertical ? '垂直鉛垂線' : '正北'}</div>
      </div>

      <svg ref={svgRef} viewBox={`-${viewBoxSize} -${viewBoxSize} ${viewBoxSize * 2} ${viewBoxSize * 2}`} style={{ width: '100%', maxWidth: '700px', height: 'auto' }}>
        
        {/* 【修正】：移除了錯誤的負號，讓 SVG 的旋轉方向與我們推演的物理方向一致 */}
        <g transform={`rotate(${substyleAngleDeg})`}>
          {config.type !== 'analemmatic' && (
            config.gnomonThickness > 0 ? (
              <rect x={-config.gnomonThickness/2} y={isVertical ? 0 : -radius} width={config.gnomonThickness} height={radius} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.5" />
            ) : (
              <line x1="0" y1="0" x2="0" y2={radius * axisYDir} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
            )
          )}
        </g>
        
        <circle cx="0" cy="0" r="4" fill="#ef4444" />

        {hourLines.map((line, idx) => {
          const shift = line.thicknessShift || 0;
          let rInner = radius * (line.isFullHour ? 0.45 : (line.isHalfHour ? 0.88 : 0.95));
          const pxOuter = line.x * radius, pyOuter = -line.y * radius;
          const pxInner = line.x * rInner, pyInner = -line.y * rInner;

          // 【物理位移法】：計算垂直於傾斜晷針的法向量，產生完美的平行推移
          const sdRad = substyleAngleDeg * (Math.PI / 180);
          const dx = shift * Math.cos(sdRad);
          const dy = shift * Math.sin(sdRad);

          return (
            <g key={`${line.hour}-${idx}`}>
              {config.type === 'analemmatic' ? (
                <circle cx={pxOuter} cy={pyOuter} r={line.isFullHour ? 4.5 : 1.5} fill="#2563eb" />
              ) : (
                <line 
                  x1={pxInner + dx} y1={pyInner + dy} 
                  x2={pxOuter + dx} y2={pyOuter + dy} 
                  stroke={line.isFullHour ? "#1e293b" : "#cbd5e1"} 
                  strokeWidth={line.isFullHour ? 2 : 0.8} 
                />
              )}
              {line.isFullHour && (
                <text 
                  x={(line.x * (radius + 25)) + dx} 
                  y={(-line.y * (radius + 25)) + dy} 
                  textAnchor="middle" alignmentBaseline="middle" 
                  style={{ fontSize: '14px', fontWeight: '800', fill: '#475569' }}
                >
                  {line.displayHourText}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {/* 在左下角顯示精確的物理參數供驗證 */}
      <div style={{ position: 'absolute', bottom: '20px', left: '20px', fontSize: '11px', color: '#94a3b8' }}>
        {isVertical && `副晷針偏角 (SD): ${substyleAngleDeg.toFixed(2)}°`}
      </div>
    </div>
  );
}