// 檔案名稱：src/ConstructionData.jsx
import React from 'react';

export default function ConstructionData({ config, data }) {
  const isRadial = config.type === 'horizontal' || config.type === 'vertical';

  return (
    <div className="w-full h-full bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-gray-50 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 tracking-wide">📐 施工繪製數據表</h3>
          <p className="text-xs text-gray-400 mt-1">
            {isRadial ? "角度以 12:00 線為 0° 起算" : "座標以中心點 (0,0) 為基準"}
          </p>
        </div>
        {config.gnomonThickness > 0 && (
          <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-1 rounded-full font-bold">
            已套用 {config.gnomonThickness}mm 厚度修正
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
              <th className="py-3 px-4">時間</th>
              {isRadial ? (
                <th className="py-3 px-4">繪製角度 (°)</th>
              ) : (
                <>
                  <th className="py-3 px-4">X (cm)</th>
                  <th className="py-3 px-4">Y (cm)</th>
                </>
              )}
              {config.gnomonThickness > 0 && <th className="py-3 px-4">晷針位移側</th>}
            </tr>
          </thead>
          <tbody className="text-sm text-gray-600 divide-y divide-gray-50">
            {data.map((item, idx) => (
              <tr key={`${item.hour}-${idx}`} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-4 font-medium text-gray-900">{item.hour}:00</td>
                {isRadial ? (
                  <td className="py-3 px-4 font-mono">{item.angle.toFixed(2)}°</td>
                ) : (
                  <>
                    <td className="py-3 px-4 font-mono text-blue-600">{(item.x * config.radius).toFixed(2)}</td>
                    <td className="py-3 px-4 font-mono text-emerald-600">{(item.y * config.radius).toFixed(2)}</td>
                  </>
                )}
                {config.gnomonThickness > 0 && (
                  <td className="py-3 px-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded ${
                      item.thicknessShift < 0 ? 'bg-red-50 text-red-600' : 
                      item.thicknessShift > 0 ? 'bg-green-50 text-green-600' : 'bg-gray-100'
                    }`}>
                      {item.thicknessShift < 0 ? '向左移' : item.thicknessShift > 0 ? '向右移' : '中心'}
                      {Math.abs(item.thicknessShift).toFixed(1)}mm
                    </span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}