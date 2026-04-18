// 檔案名稱：src/SundialPreview.jsx
import React, { useMemo, useRef } from 'react';

export default function SundialPreview({ config, data }) {
  // 【防崩潰裝甲】：安全解構資料，相容舊版陣列與防止 undefined 崩潰
  const hourLines = data?.lines || (Array.isArray(data) ? data : []);
  const gnomon = data?.gnomon || {};

  const { meridianTimeStr, substyleAngleDeg } = useMemo(() => {
    const lonOffsetDeg = config.useSolarTime ? 0 : (config.longitude - config.timezone * 15);
    const meridianHourDec = 12 - (lonOffsetDeg / 15);
    let mHrs = Math.floor(meridianHourDec), mMins = Math.round((meridianHourDec - mHrs) * 60);
    if (mMins === 60) { mHrs += 1; mMins = 0; }
    if (mHrs >= 24) mHrs -= 24; if (mHrs < 0) mHrs += 24;

    // 安全讀取 SD_deg，如果讀不到就給 0
    return { 
      meridianTimeStr: `${mHrs}:${mMins.toString().padStart(2, '0')}`, 
      substyleAngleDeg: gnomon.SD_deg || 0 
    };
  }, [config, gnomon]);

  const svgRef = useRef(null);
  const radius = config.radius || 150, padding = 120, viewBoxSize = radius + padding;

  const isVertical = config.type === 'vertical';
  const axisYDir = isVertical ? 1 : -1; 

  const downloadSVG = () => {
    if (!svgRef.current) return;
    const svgData = svgRef.current.outerHTML;
    const blob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `sundial-magic-${config.type}.svg`;
    link.click();
  };

  // 如果 hourLines 是空的，顯示安全警告而不是白屏
  if (hourLines.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#ef4444', fontWeight: 'bold' }}>
        ⚠️ 正在計算數學模型，請稍候或重新整理頁面 (Ctrl + F5)。
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'white' }}>
      
      {/* 浮動的 SVG 下載按鈕 */}
      <div style={{ position: 'absolute', bottom: '30px', right: '30px', zIndex: 999 }}>
        <button onClick={downloadSVG} style={{ padding: '12px 24px', backgroundColor: '#0f172a', color: 'white', borderRadius: '50px', fontSize: '13px', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}>
          📥 下載 SVG 向量圖
        </button>
      </div>

      <div style={{ position: 'absolute', top: '30px', right: '30px', textAlign: 'center', zIndex: 10 }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
            <div style={{ width: '2px', height: '20px', backgroundColor: isVertical ? '#3b82f6' : '#ef4444', transform: isVertical ? 'rotate(180deg)' : 'none' }}></div>
        </div>
        <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px', fontWeight: 'bold' }}>{isVertical ? '垂直鉛垂線' : '正北'}</div>
      </div>

      <svg ref={svgRef} viewBox={`-${viewBoxSize} -${viewBoxSize} ${viewBoxSize * 2} ${viewBoxSize * 2}`} style={{ width: '100%', height: '100%', maxHeight: '800px' }}>
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

          const sdRad = substyleAngleDeg * (Math.PI / 180);
          const dx = shift * Math.cos(sdRad);
          const dy = shift * Math.sin(sdRad);

          return (
            <g key={`${line.hour}-${idx}`}>
              {config.type === 'analemmatic' ? (
                <circle cx={pxOuter} cy={pyOuter} r={line.isFullHour ? 4.5 : 1.5} fill="#2563eb" />
              ) : (
                <line x1={pxInner + dx} y1={pyInner + dy} x2={pxOuter + dx} y2={pyOuter + dy} stroke={line.isFullHour ? "#1e293b" : "#cbd5e1"} strokeWidth={line.isFullHour ? 2 : 0.8} />
              )}
              {line.isFullHour && (
                <text x={(line.x * (radius + 25)) + dx} y={(-line.y * (radius + 25)) + dy} textAnchor="middle" alignmentBaseline="middle" style={{ fontSize: '14px', fontWeight: '800', fill: '#475569' }}>
                  {line.displayHourText}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div style={{ position: 'absolute', bottom: '20px', left: '20px', fontSize: '11px', color: '#94a3b8' }}>
        {isVertical && `副晷針偏角 (SD): ${substyleAngleDeg.toFixed(2)}°`}
      </div>
    </div>
  );
}