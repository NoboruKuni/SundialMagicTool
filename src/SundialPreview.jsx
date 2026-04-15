// 檔案名稱：SundialPreview.jsx
import React, { useMemo } from 'react';
import { calculateHourLines } from './sundialMath';

export default function SundialPreview({ config }) {
  // 1. 呼叫 Phase 2 的數學引擎，算出所有時間點的數據
  // 使用 useMemo 確保只有當 config 改變時，才重新計算數學，節省效能
  const hourLines = useMemo(() => calculateHourLines(config), [config]);

  // 2. 設定畫布尺寸
  const radius = config.radius || 100;
  const padding = 30; // 留白，避免文字被切掉
  const viewBoxSize = radius + padding;
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
      
      {/* 標題與裝飾 */}
      <div className="absolute top-6 left-6">
        <h3 className="text-lg font-semibold text-gray-800 tracking-wide">視覺預覽</h3>
        <p className="text-xs text-gray-400 mt-1">SVG Vector Render</p>
      </div>
      
      {/* 核心 SVG 畫布 */}
      {/* viewBox 讓 (-viewBoxSize, -viewBoxSize) 成為左上角，(0,0) 剛好在正中心 */}
      <svg 
        viewBox={`-${viewBoxSize} -${viewBoxSize} ${viewBoxSize * 2} ${viewBoxSize * 2}`} 
        className="w-full max-w-lg h-auto drop-shadow-sm"
      >
        {/* 畫一個外圓/邊界參考線 (虛線) */}
        <circle cx="0" cy="0" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
        
        {/* 根據日晷類型，渲染不同的視覺幾何 */}
        {config.type === 'analemmatic' ? (
          
          // 【模式 A】地平投影式：畫出橢圓軌跡與時辰點
          <g id="analemmatic-render">
            {/* 中心基準點 */}
            <circle cx="0" cy="0" r="3" fill="#ef4444" />
            {hourLines.map((point) => {
              // 根據半徑放大比例，並翻轉 Y 軸
              const px = point.x * radius;
              const py = -point.y * radius; 
              return (
                <g key={point.hour}>
                  <circle cx={px} cy={py} r="2.5" fill="#3b82f6" />
                  <text x={px} y={py - 12} textAnchor="middle" fontSize="6" fill="#4b5563" fontWeight="500">
                    {point.hour}:00
                  </text>
                  {/* 連接基準點到時辰點的輔助虛線 */}
                  <line x1="0" y1="0" x2={px} y2={py} stroke="#f3f4f6" strokeWidth="0.5" strokeDasharray="2 2" />
                </g>
              );
            })}
          </g>

        ) : (

          // 【模式 B】水平式 / 垂直式：畫出從中心發散的刻度射線
          <g id="radial-render">
            {/* 晷針根部 (Gnomon Root) */}
            <circle cx="0" cy="0" r="3" fill="#ef4444" />
            {hourLines.map((line) => {
              // 將角度 (Degree) 轉換為弧度 (Radian) 供 SVG 計算
              const rad = line.angle * (Math.PI / 180);
              // 假設 12 點 (0度) 指向正上方 (Y 軸負向)
              const px = radius * Math.sin(rad);
              const py = -radius * Math.cos(rad); 
              return (
                <g key={line.hour}>
                  <line x1="0" y1="0" x2={px} y2={py} stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
                  <text x={px * 1.15} y={py * 1.15} textAnchor="middle" alignmentBaseline="middle" fontSize="6" fill="#4b5563" fontWeight="500">
                    {line.hour}:00
                  </text>
                </g>
              );
            })}
          </g>
          
        )}
      </svg>
    </div>
  );
}