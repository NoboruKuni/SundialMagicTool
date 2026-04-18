// 檔案名稱：src/SundialPreview.jsx
import React, { useMemo, useRef } from 'react';
import { calculateHourLines } from './sundialMath';

export default function SundialPreview({ config }) {
  const { hourLines, meridianTimeStr, substyleAngleDeg } = useMemo(() => {
    const lines = calculateHourLines(config);
    const lonOffsetDeg = config.useSolarTime ? 0 : (config.longitude - config.timezone * 15);
    const meridianHourDec = 12 - (lonOffsetDeg / 15);
    
    let mHrs = Math.floor(meridianHourDec);
    let mMins = Math.round((meridianHourDec - mHrs) * 60);
    if (mMins === 60) { mHrs += 1; mMins = 0; }
    if (mHrs >= 24) mHrs -= 24; if (mHrs < 0) mHrs += 24;

    // 計算晷針傾斜角 (SVG 渲染需要)
    let sdDeg = 0;
    if (config.type === 'vertical') {
      const D = (config.wallAzimuth || 0) * (Math.PI / 180);
      const SD = Math.atan2(Math.sin(D), Math.tan(config.latitude * (Math.PI / 180)));
      sdDeg = SD * (180 / Math.PI);
    }

    return { 
      hourLines: lines, 
      meridianTimeStr: `${mHrs}:${mMins.toString().padStart(2, '0')}`,
      substyleAngleDeg: sdDeg
    };
  }, [config]);

  const svgRef = useRef(null);
  const radius = config.radius || 150;
  const padding = 100;
  const viewBoxSize = radius + padding;

  const downloadSVG = () => {
    const svgData = svgRef.current.outerHTML;
    const blob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `sundial-${config.type}.svg`;
    link.click();
  };

  const isVertical = config.type === 'vertical';
  const axisYDir = isVertical ? 1 : -1; 

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', backgroundColor: 'white', overflow: 'hidden' }}>
      
      <button onClick={downloadSVG} style={{ position: 'absolute', bottom: '30px', right: '30px', padding: '12px 24px', backgroundColor: '#0f172a', color: 'white', borderRadius: '50px', fontSize: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 10 }}>
        📥 下載 SVG 向量圖
      </button>

      <div style={{ position: 'absolute', top: '30px', right: '30px', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', backgroundColor: '#f8fafc' }}>
            <div style={{ width: '2px', height: '20px', backgroundColor: isVertical ? '#3b82f6' : '#ef4444', transform: isVertical ? 'rotate(180deg)' : 'none', position: 'absolute' }}></div>
            <div style={{ position: 'absolute', top: isVertical ? '22px' : '-4px', fontSize: '12px', fontWeight: '900', color: isVertical ? '#3b82f6' : '#ef4444' }}>{isVertical ? '↓' : 'N'}</div>
        </div>
        {isVertical && <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px', fontWeight: 'bold' }}>垂直鉛垂線</div>}
      </div>

      <svg ref={svgRef} viewBox={`-${viewBoxSize} -${viewBoxSize} ${viewBoxSize * 2} ${viewBoxSize * 2}`} style={{ width: '100%', maxWidth: '700px', height: 'auto' }}>
        
        {/* ========================================== */}
        {/* 傾斜晷針群組 (厚度與安裝線會跟著 SD 角旋轉) */}
        {/* ========================================== */}
        <g transform={`rotate(${-substyleAngleDeg})`}>
          {config.type !== 'analemmatic' && (
            config.gnomonThickness > 0 ? (
              <rect x={-config.gnomonThickness/2} y={isVertical ? 0 : -radius} width={config.gnomonThickness} height={radius} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.5" />
            ) : (
              <line x1="0" y1="0" x2="0" y2={radius * axisYDir} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
            )
          )}
          
          <g transform={`translate(0, ${(radius + 50) * axisYDir})`}>
             <text x="0" y="0" textAnchor="middle" style={{ fontSize: '12px', fontWeight: 'bold', fill: '#94a3b8' }}>
               {config.type === 'vertical' && Math.abs(substyleAngleDeg) > 0.1 ? "TILTED GNOMON LINE" : (config.useSolarTime ? "SOLAR NOON AXIS" : `INSTALLATION ALIGNMENT @ ${meridianTimeStr}`)}
             </text>
          </g>
        </g>
        
        <circle cx="0" cy="0" r="4" fill="#ef4444" />

        {hourLines.map((line, idx) => {
          const shift = line.thicknessShift || 0;
          let rInner = radius;
          if (line.isFullHour) rInner = radius * 0.45;
          else if (line.isHalfHour) rInner = radius * 0.88;
          else rInner = radius * 0.95;

          const pxOuter = line.x * radius;
          const pyOuter = -line.y * radius;
          const pxInner = line.x * rInner;
          const pyInner = -line.y * rInner;

          return (
            // 將厚度平移與傾斜角結合，確保線條完美貼合傾斜的粗晷針邊緣
            <g key={`${line.hour}-${idx}`} transform={`rotate(${-substyleAngleDeg}) translate(${shift}, 0) rotate(${substyleAngleDeg})`}>
              {config.type === 'analemmatic' ? (
                <circle cx={pxOuter} cy={pyOuter} r={line.isFullHour ? 4.5 : 1.5} fill={line.isFullHour ? "#2563eb" : "#cbd5e1"} />
              ) : (
                <line x1={pxInner} y1={pyInner} x2={pxOuter} y2={pyOuter} stroke={line.isFullHour ? "#1e293b" : "#cbd5e1"} strokeWidth={line.isFullHour ? 2 : 0.8} strokeLinecap="round" />
              )}
              
              {line.isFullHour && (
                <text x={line.x * (radius + 20)} y={-line.y * (radius + 20)} textAnchor="middle" alignmentBaseline="middle" style={{ fontSize: '14px', fontWeight: '800', fill: '#475569', userSelect: 'none', fontFamily: 'system-ui' }}>
                  {line.displayHourText}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}