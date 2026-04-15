// 檔案名稱：src/SundialPreview.jsx
import React, { useMemo, useRef } from 'react';
import { calculateHourLines } from './sundialMath';

export default function SundialPreview({ config }) {
  const hourLines = useMemo(() => calculateHourLines(config), [config]);
  const svgRef = useRef(null);

  const radius = config.radius || 150;
  const padding = 80;
  const viewBoxSize = radius + padding;

  // 下載邏輯保持不變
  const downloadSVG = () => {
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

  // 判斷物理安裝基準方向
  const isVertical = config.type === 'vertical';
  const axisYDir = isVertical ? 1 : -1; 
  const axisLabel = isVertical ? "↓ 向下 (地面)" : "↑ 正北 (True North)";

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', backgroundColor: 'white' }}>
      
      <button onClick={downloadSVG} style={{ position: 'absolute', bottom: '20px', right: '20px', padding: '10px 20px', backgroundColor: '#1e293b', color: 'white', borderRadius: '30px', fontSize: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 10 }}>
        📥 下載 SVG 向量圖
      </button>

      <svg ref={svgRef} viewBox={`-${viewBoxSize} -${viewBoxSize} ${viewBoxSize * 2} ${viewBoxSize * 2}`} style={{ width: '100%', maxWidth: '600px', height: 'auto' }}>
        
        {/* 物理基準軸 (晷針安裝線) */}
        {config.gnomonThickness > 0 ? (
          <rect x={-config.gnomonThickness/2} y={isVertical ? 0 : -radius} width={config.gnomonThickness} height={radius} fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
        ) : (
          <line x1="0" y1="0" x2="0" y2={radius * axisYDir} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="5 5" />
        )}
        
        {/* 指北/向下 安裝標示 */}
        <text x="0" y={(radius + 30) * axisYDir} textAnchor="middle" alignmentBaseline="middle" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#ef4444', letterSpacing: '1px' }}>
          {axisLabel}
        </text>
        <circle cx="0" cy="0" r="4" fill="#ef4444" />

        {/* 繪製外圈刻度 */}
        {hourLines.map((line, idx) => {
          const shift = line.thicknessShift || 0;
          
          // 【外圈刻度邏輯】：控制線條往內延伸的長度
          let rInner = radius;
          if (line.isFullHour) rInner = radius * 0.4;       // 整點：保留中心 40% 留白
          else if (line.isHalfHour) rInner = radius * 0.85; // 半點：很短
          else if (line.isQuarterHour) rInner = radius * 0.93; // 刻點：極短

          const pxOuter = line.x * radius;
          const pyOuter = -line.y * radius;
          const pxInner = line.x * rInner;
          const pyInner = -line.y * rInner;

          return (
            <g key={`${line.hour}-${idx}`} transform={`translate(${shift}, 0)`}>
              {config.type === 'analemmatic' ? (
                <circle cx={pxOuter} cy={pyOuter} r={line.isFullHour ? 4 : (line.isHalfHour ? 2 : 1)} fill={line.isFullHour ? "#2563eb" : "#94a3b8"} />
              ) : (
                <line 
                  x1={pxInner} y1={pyInner} 
                  x2={pxOuter} y2={pyOuter} 
                  stroke={line.isFullHour ? "#1e293b" : "#94a3b8"} 
                  strokeWidth={line.isFullHour ? 2.5 : 1} 
                  strokeLinecap="round" 
                />
              )}
              
              {line.isFullHour && (
                <text 
                  x={line.x * (radius + 15)} y={-line.y * (radius + 15)} 
                  textAnchor="middle" alignmentBaseline="middle" 
                  style={{ fontSize: '15px', fontWeight: 'bold', fill: '#334155', userSelect: 'none' }}
                >
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