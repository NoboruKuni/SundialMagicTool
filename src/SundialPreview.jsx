// 檔案名稱：src/SundialPreview.jsx
import React, { useMemo, useRef } from 'react';
import { calculateHourLines } from './sundialMath';

export default function SundialPreview({ config }) {
  const hourLines = useMemo(() => calculateHourLines(config), [config]);
  const svgRef = useRef(null); // 用來抓取 SVG 元素進行匯出

  const radius = config.radius || 150;
  const padding = 80;
  const viewBoxSize = radius + padding;

  // 匯出 SVG 的魔法函式
  const downloadSVG = () => {
    const svgData = svgRef.current.outerHTML;
    const svgBlob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `sundial-${config.type}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      
      {/* 匯出按鈕 - 懸浮在畫面右下角 */}
      <button 
        onClick={downloadSVG}
        style={{ position: 'absolute', bottom: '20px', right: '20px', padding: '10px 20px', backgroundColor: '#1e293b', color: 'white', borderRadius: '30px', fontSize: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
      >
        📥 下載 SVG 向量圖
      </button>

      <svg 
        ref={svgRef}
        viewBox={`-${viewBoxSize} -${viewBoxSize} ${viewBoxSize * 2} ${viewBoxSize * 2}`} 
        style={{ width: '100%', maxWidth: '600px', height: 'auto', backgroundColor: 'white' }}
      >
        <line x1="0" y1={-radius-20} x2="0" y2={radius+20} stroke="#f1f5f9" strokeWidth="2" />

        {hourLines.map((line, idx) => {
          const shift = line.thicknessShift || 0;
          
          // 根據刻度等級決定長度
          let lengthFactor = 1;
          if (line.isHalfHour) lengthFactor = 0.95;
          if (line.isQuarterHour) lengthFactor = 0.98;

          const px = line.x * radius * lengthFactor;
          const py = -line.y * radius * lengthFactor;

          return (
            <g key={`${line.hour}-${idx}`} transform={`translate(${shift}, 0)`}>
              {config.type === 'analemmatic' ? (
                // 投影式：調整點的大小
                <circle 
                  cx={line.x * radius} cy={-line.y * radius} 
                  r={line.isFullHour ? 5 : 2} 
                  fill={line.isFullHour ? "#2563eb" : "#cbd5e1"} 
                />
              ) : (
                // 放射狀：調整線的粗細與顏色
                <line 
                  x1={line.isFullHour ? 0 : px * 0.9} 
                  y1={line.isFullHour ? 0 : py * 0.9} 
                  x2={px} y2={py} 
                  stroke={line.isFullHour ? "#1e293b" : "#94a3b8"} 
                  strokeWidth={line.isFullHour ? 2.5 : 1} 
                  strokeLinecap="round" 
                />
              )}
              
              {/* 只有整點才顯示數字 */}
              {line.isFullHour && (
                <text 
                  x={px * 1.25} y={py * 1.25} 
                  textAnchor="middle" alignmentBaseline="middle" 
                  style={{ fontSize: '16px', fontWeight: '900', fill: '#1e293b', userSelect: 'none', fontFamily: '"Georgia", serif' }}
                >
                  {line.hour}
                </text>
              )}
            </g>
          );
        })}
        <circle cx="0" cy="0" r="4" fill="#ef4444" />
      </svg>
    </div>
  );
}