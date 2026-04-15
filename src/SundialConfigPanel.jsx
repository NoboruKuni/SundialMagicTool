// 檔案名稱：src/SundialConfigPanel.jsx
import React from 'react';

export default function SundialConfigPanel({ config, onChange }) {
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    onChange({ ...config, [name]: type === 'number' ? Number(value) : value });
  };

  // 封裝一個元件內部的樣式，確保整齊
  const sectionStyle = { marginBottom: '24px' };
  const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' };
  const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ padding: '32px', height: '100%', overflowY: 'auto', backgroundColor: '#f8fafc' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b', marginBottom: '4px' }}>SundialMagic</h2>
      <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '32px' }}>專業日晷設計工具 v1.2</p>

      <div style={sectionStyle}>
        <h3 style={{ fontSize: '14px', color: '#334155', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '16px' }}>📍 地理與時間設定</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={labelStyle}>緯度 (Latitude)</label>
            <input type="number" name="latitude" value={config.latitude} onChange={handleChange} step="0.01" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>經度 (Longitude)</label>
            <input type="number" name="longitude" value={config.longitude} onChange={handleChange} step="0.01" style={inputStyle} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>時區 (Timezone UTC)</label>
          <input type="number" name="timezone" value={config.timezone} onChange={handleChange} style={inputStyle} />
        </div>
      </div>

      <div style={sectionStyle}>
        <h3 style={{ fontSize: '14px', color: '#334155', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '16px' }}>📐 參數設定</h3>
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>日晷類型</label>
          <select name="type" value={config.type} onChange={handleChange} style={inputStyle}>
            <option value="horizontal">水平式 (Horizontal)</option>
            <option value="vertical">垂直式 (Vertical)</option>
            <option value="analemmatic">地平投影式 (Analemmatic)</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>晷針厚度 (mm)</label>
          <input type="number" name="gnomonThickness" value={config.gnomonThickness} onChange={handleChange} min="0" style={inputStyle} />
        </div>
      </div>
    </div>
  );
}