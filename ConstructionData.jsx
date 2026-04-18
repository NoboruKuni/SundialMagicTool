// 檔案名稱：src/ConstructionData.jsx
import React from 'react';
import { getEoTTable } from './sundialMath';

export default function ConstructionData({ config, data }) {
  // 【防呆機制】：確保資料確實傳入，避免 Cannot read properties of undefined 崩潰
  if (!data || !data.lines) {
    return (
      <div style={{ padding: '30px', color: '#ef4444', fontWeight: 'bold' }}>
        ⚠️ 正在載入數據或遇到錯誤。請確保您的 App.jsx 已經正確將 data 作為 prop 傳遞給此元件。
      </div>
    );
  }

  const { lines, gnomon } = data;
  const eotData = getEoTTable();

  // 過濾出只顯示整點與半點的數據，避免表格太長
  const tableLines = lines.filter(l => l.isFullHour || l.isHalfHour);

  const blockStyle = { backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' };
  const thStyle = { padding: '12px', textAlign: 'left', borderBottom: '2px solid #cbd5e1', fontSize: '13px', color: '#475569' };
  const tdStyle = { padding: '10px 12px', borderBottom: '1px solid #e2e8f0', fontSize: '13px', color: '#0f172a', fontFamily: 'monospace' };

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '30px', backgroundColor: '#f8fafc', boxSizing: 'border-box' }}>
      
      {/* 區塊 1：晷針安裝參數 */}
      {config.type !== 'analemmatic' && gnomon && (
        <div style={blockStyle}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>📐 晷針安裝參數 (Gnomon Parameters)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 'bold' }}>晷針仰角 (Style Height / SH)</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#1d4ed8' }}>
                {/* 【修正】：移除 ?. 語法，改用傳統判定確保相容性 */}
                {gnomon.SH_deg !== null && gnomon.SH_deg !== undefined ? gnomon.SH_deg.toFixed(2) + '°' : 'N/A'}
              </div>
              <div style={{ fontSize: '11px', color: '#60a5fa', marginTop: '4px' }}>晷針斜邊與牆面/地面的實體夾角。</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#f5f3ff', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#8b5cf6', fontWeight: 'bold' }}>副晷針偏角 (Substyle Distance / SD)</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#6d28d9' }}>
                {/* 【修正】：移除 ?. 語法 */}
                {gnomon.SD_deg !== null && gnomon.SD_deg !== undefined ? gnomon.SD_deg.toFixed(2) + '°' : 'N/A'}
              </div>
              <div style={{ fontSize: '11px', color: '#a78bfa', marginTop: '4px' }}>晷針底邊偏離垂直基準線的角度。</div>
            </div>
          </div>
        </div>
      )}

      {/* 區塊 2：日行差修正表 */}
      <div style={blockStyle}>
        <h3 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>⏱️ 日行差修正表 (Equation of Time)</h3>
        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', lineHeight: '1.5' }}>
          真實太陽時與手錶時間存在落差。讀取日晷時間後，請根據日期<b>加上</b>或<b>減去</b>表中的分鐘數，即可得到精準的鐘錶時間 (此表已考慮均時差，單位：分鐘)。
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr>
                <th style={thStyle}>日期</th>
                {eotData.map(m => <th key={`m-${m[0].month}`} style={thStyle}>{m[0].month}月</th>)}
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2].map((dayIdx) => (
                <tr key={`day-${dayIdx}`}>
                  <td style={{...tdStyle, fontWeight: 'bold', color: '#64748b'}}>{eotData[0][dayIdx].day} 日</td>
                  {eotData.map(m => {
                    const eot = m[dayIdx].eot;
                    const color = eot > 0 ? '#059669' : (eot < 0 ? '#e11d48' : '#64748b');
                    return (
                      <td key={`${m[0].month}-${dayIdx}`} style={{...tdStyle, color, fontWeight: 'bold'}}>
                        {eot > 0 ? '+' : ''}{eot}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 區塊 3：刻度座標數據 */}
      <div style={blockStyle}>
        <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>📍 刻度座標放樣表 (Hour Lines Layout)</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>時間 (Hour)</th>
              <th style={thStyle}>實體角度 (Angle)</th>
              <th style={thStyle}>X 座標 (單位向量)</th>
              <th style={thStyle}>Y 座標 (單位向量)</th>
              <th style={thStyle}>厚度平移 (dx)</th>
            </tr>
          </thead>
          <tbody>
            {tableLines.map((line, i) => (
              <tr key={i} style={{ backgroundColor: line.isFullHour ? '#f8fafc' : 'white' }}>
                <td style={{...tdStyle, fontWeight: line.isFullHour ? 'bold' : 'normal'}}>
                  {line.displayHourText}{line.isHalfHour ? ':30' : ':00'}
                </td>
                {/* 【修正】：確保 0° 不會被當成 falsy 值變成 N/A */}
                <td style={tdStyle}>{line.angleDeg !== undefined ? line.angleDeg.toFixed(2) + '°' : 'N/A'}</td>
                <td style={tdStyle}>{line.x.toFixed(4)}</td>
                <td style={tdStyle}>{line.y.toFixed(4)}</td>
                <td style={tdStyle}>{line.thicknessShift ? line.thicknessShift.toFixed(2) + ' mm' : '0.00 mm'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}