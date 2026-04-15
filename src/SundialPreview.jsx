// 檔案名稱：src/SundialPreview.jsx
import React, { useMemo, useRef } from 'react';
import { calculateHourLines } from './sundialMath';

export default function SundialPreview({ config }) {
  // 1. 同時計算晷線與「真太陽正午」的校準時間
  const { hourLines, meridianTimeStr } = useMemo(() => {
    const lines = calculateHourLines(config);
    
    // 計算正午校準時間 (經度修正轉為時間)
    // 經度每差 1 度 = 4 分鐘 (1/15 小時)
    const lonOffsetDeg = config.longitude - config.timezone * 15;
    const meridianHourDec = 12 - (lonOffsetDeg / 15);
    
    let mHrs = Math.floor(meridianHourDec);
    let mMins = Math.round((meridianHourDec - mHrs) * 60);
    if (mMins === 60) { mHrs += 1; mMins = 0; }
    if (mHrs >= 24) mHrs -= 24;
    if (mHrs < 0) mHrs += 24;
    
    const timeStr = `${mHrs}:${mMins.toString().padStart(2, '0')}`;
    return { hourLines: lines, meridianTimeStr: timeStr };
  }, [config]);

  const svgRef = useRef(null);
  const radius = config.radius || 150;
  const padding = 100; // 稍微加大 Padding 容納指北針與文字
  const viewBoxSize = radius + padding;

  const downloadSVG = () => { /* ...下載邏輯保持不變... */
    const svgData = svgRef.current.outerHTML;
    const blob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sundial-${config.type}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isVertical = config.type === 'vertical';
  const axisYDir = isVertical ? 1 : -1; 

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', backgroundColor: 'white' }}>
      
      <button onClick={downloadSVG} style={{ position: 'absolute', bottom: '20px', right: '20px', padding: '10px 20px', backgroundColor: '#1e293b', color: 'white', borderRadius: '30px', fontSize: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 10 }}>
        📥 下載 SVG 向量圖
      </button>

      <svg ref={svgRef} viewBox={`-${viewBoxSize} -${viewBoxSize} ${viewBoxSize * 2} ${viewBoxSize * 2}`} style={{ width: '100%', maxWidth: '650px', height: 'auto' }}>
        
        {/* 【UI 優化】：獨立的方位標示 (右上角) */}
        <g transform={`translate(${radius + 40}, ${-radius + 20})`}>
          <circle cx="0" cy="0" r="16" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1"/>
          {isVertical ? (
            <>
              {/* 垂直式：標示向下 (重力方向) */}
              <line x1="0" y1="-8" x2="0" y2="8" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
              <polygon points="-3,3 0,10 3,3" fill="#3b82f6" />
              <text x="0" y="22" textAnchor="middle" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#3b82f6' }}>向下</text>
            </>
          ) : (
            <>
              {/* 水平式：標示正北 (N) */}
              <line x1="0" y1="8" x2="0" y2="-8" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
              <polygon points="-4,-2 0,-12 4,-2" fill="#ef4444" />
              <text x="0" y="-18" textAnchor="middle" style={{ fontSize: '14px', fontWeight: '900', fill: '#ef4444' }}>N</text>
            </>
          )}
        </g>

        {/* 物理基準軸 (晷針安裝線) */}
        {config.gnomonThickness > 0 ? (
          <rect x={-config.gnomonThickness/2} y={isVertical ? 0 : -radius} width={config.gnomonThickness} height={radius} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
        ) : (
          <line x1="0" y1="0" x2="0" y2={radius * axisYDir} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4" />
        )}
        
        {/* 【殺手級功能】：安裝校準時間標示 */}
        <g transform={`translate(0, ${(radius + 40) * axisYDir})`}>
           <text x="0" y="-8" textAnchor="middle" style={{ fontSize: '11px', fontWeight: 'bold', fill: '#64748b' }}>
             晷針安裝基準線
           </text>
           <text x="0" y="8" textAnchor="middle" style={{ fontSize: '13px', fontWeight: '900', fill: '#059669' }}>
             (完全無陰影時為 {meridianTimeStr})
           </text>
        </g>
        
        <circle cx="0" cy="0" r="4" fill="#ef4444" />

        {/* 繪製外圈刻度 */}
        {hourLines.map((line, idx) => {
          const shift = line.thicknessShift || 0;
          let rInner = radius;
          if (line.isFullHour) rInner = radius * 0.4;
          else if (line.isHalfHour) rInner = radius * 0.85;
          else if (line.isQuarterHour) rInner = radius * 0.93;

          const pxOuter = line.x * radius;
          const pyOuter = -line.y * radius;
          const pxInner = line.x * rInner;
          const pyInner = -line.y * rInner;

          return (
            <g key={`${line.hour}-${idx}`} transform={`translate(${shift}, 0)`}>
              {config.type === 'analemmatic' ? (
                <circle cx={pxOuter} cy={pyOuter} r={line.isFullHour ? 4 : (line.isHalfHour ? 2 : 1)} fill={line.isFullHour ? "#2563eb" : "#94a3b8"} />
              ) : (
                <line x1={pxInner} y1={pyInner} x2={pxOuter} y2={pyOuter} stroke={line.isFullHour ? "#1e293b" : "#94a3b8"} strokeWidth={line.isFullHour ? 2.5 : 1} strokeLinecap="round" />
              )}
              {line.isFullHour && (
                <text x={line.x * (radius + 15)} y={-line.y * (radius + 15)} textAnchor="middle" alignmentBaseline="middle" style={{ fontSize: '15px', fontWeight: 'bold', fill: '#334155', userSelect: 'none' }}>
                  {line.hour}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}