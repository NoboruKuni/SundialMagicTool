// 檔案名稱：src/ConstructionData.jsx
import React from 'react';

export default function ConstructionData({ config, data }) {
  // 根據日晷類型決定表頭名稱
  const isRadial = config.type === 'horizontal' || config.type === 'vertical';

  return (
    <div className="w-full h-full bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-gray-50">
        <h3 className="text-lg font-semibold text-gray-800 tracking-wide">📐 施工繪製數據表</h3>
        <p className="text-xs text-gray-400 mt-1">
          {isRadial ? "請依照角度從基準線（12:00）量測繪製" : "請依照 X, Y 座標在地面標註點位"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
              <th className="py-3 px-4">時間 (Time)</th>
              {isRadial ? (
                <th className="py-3 px-4">偏離 12:00 角度 (°)</th>
              ) : (
                <>
                  <th className="py-3 px-4">X 座標 (比例)</th>
                  <th className="py-3 px-4">Y 座標 (比例)</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="text-sm text-gray-600 divide-y divide-gray-50">
            {data.map((item) => (
              <tr key={item.hour} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-4 font-medium text-gray-900">{item.hour}:00</td>
                {isRadial ? (
                  <td className="py-3 px-4 font-mono">
                    {item.angle ? item.angle.toFixed(2) : "0.00"}°
                  </td>
                ) : (
                  <>
                    <td className="py-3 px-4 font-mono text-blue-600">{item.x.toFixed(4)}</td>
                    <td className="py-3 px-4 font-mono text-emerald-600">{item.y.toFixed(4)}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* 提示區塊 */}
        <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-100">
          <h4 className="text-xs font-bold text-amber-800 uppercase mb-2">💡 繪製小撇步</h4>
          <p className="text-xs text-amber-700 leading-relaxed">
            {isRadial 
              ? "使用量角器時，請將 0° 對準 12:00 的線條。正值代表向右(東)偏移，負值代表向左(西)偏移。"
              : "若您預計製作長軸為 2 公尺的日晷，請將上述 X, Y 數值直接乘以 100 公分即可得到實際距離。"}
          </p>
        </div>
      </div>
    </div>
  );
}