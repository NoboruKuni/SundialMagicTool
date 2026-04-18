// 檔案名稱：src/SundialConfigPanel.jsx
import React from 'react';

export default function SundialConfigPanel({ config, onChange }) {
  const handleChange = (e) => {
    let { name, value, type } = e.target;
    
    if (type === 'number' || name === 'wallAzimuth') {
      value = Number(value);
      if (name === 'latitude') value = Math.max(0, Math.min(90, value));
      if (name === 'longitude') value = Math.max(0, Math.min(360, value));
    }
    
    onChange({ ...config, [name]: value });
  };

  const isAnalemmatic = config.type === 'analemmatic';
  const sectionStyle = { marginBottom: '24px' };
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: '900', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' };
  const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', transition: 'all 0.2s' };

  return (
    <div style={{ padding: '32px', height: '100%', overflowY: 'auto', backgroundColor: '#f8fafc', borderRight: '1px solid #e2e8f0' }}>
      <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', marginBottom: '4px', letterSpacing: '-1px' }}>SundialMagic</h2>
      <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '32px', fontWeight: 'bold' }}>VERSION 1.8 PRO</p>

      {/* 地理設定 */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', borderLeft: '4px solid #3b82f6', paddingLeft: '10px', marginBottom: '16px' }}>📍 地理與時間</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          {/* 【修正】：將 step 從 0.01 放大為 0.1 */}
          <div><label style={labelStyle}>緯度 (0~90)</label><input type="number" name="latitude" value={config.latitude} onChange={handleChange} min="0" max="90" step="0.1" style={inputStyle} /></div>
          <div><label style={labelStyle}>經度 (0~360)</label><input type="number" name="longitude" value={config.longitude} onChange={handleChange} min="0" max="360" step="0.1" style={inputStyle} /></div>
        </div>
        
        <div style={{ opacity: config.useSolarTime ? 0.5 : 1, transition: '0.3s' }}>
          <label style={labelStyle}>時區 (UTC)</label>
          <select name="timezone" value={config.timezone} onChange={handleChange} disabled={config.useSolarTime} style={{...inputStyle, backgroundColor: config.useSolarTime ? '#f1f5f9' : 'white'}}>
            {[...Array(25)].map((_, i) => {
              const val = i - 12;
              return <option key={val} value={val}>UTC {val > 0 ? '+' + val : val}</option>;
            })}
          </select>
        </div>
      </div>

      {/* 晷面參數 */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', borderLeft: '4px solid #3b82f6', paddingLeft: '10px', marginBottom: '16px' }}>📐 晷面參數</h3>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>時間模式</label>
          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '10px' }}>
            <button onClick={() => onChange({...config, useSolarTime: false})} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', backgroundColor: !config.useSolarTime ? 'white' : 'transparent', color: !config.useSolarTime ? '#2563eb' : '#64748b' }}>鐘錶時間</button>
            <button onClick={() => onChange({...config, useSolarTime: true})} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', backgroundColor: config.useSolarTime ? 'white' : 'transparent', color: config.useSolarTime ? '#2563eb' : '#64748b' }}>真太陽時</button>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>日晷類型</label>
          <select name="type" value={config.type} onChange={handleChange} style={inputStyle}>
            <option value="horizontal">水平式 (Horizontal)</option>
            <option value="vertical">垂直式 (Vertical)</option>
            <option value="analemmatic">地平投影式 (Analemmatic)</option>
          </select>
        </div>

        {config.type === 'vertical' && (
          <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
            <label style={{...labelStyle, color: '#0f172a'}}>牆面朝向 (Azimuth)</label>
            <p style={{ fontSize: '10px', color: '#64748b', marginBottom: '10px', lineHeight: '1.4' }}>
              背貼牆面向南看：偏西(右轉)為正，偏東(左轉)為負。
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="range" min="-90" max="90" name="wallAzimuth" value={config.wallAzimuth || 0} onChange={handleChange} style={{ flex: 1, accentColor: '#3b82f6' }} />
              <input type="number" name="wallAzimuth" value={config.wallAzimuth || 0} onChange={handleChange} style={{ width: '50px', border: '1px solid #e2e8f0', borderRadius: '4px', textAlign: 'center', fontSize: '12px' }} />
            </div>
          </div>
        )}

        <div style={{ opacity: isAnalemmatic ? 0.4 : 1 }}>
          <label style={labelStyle}>晷針厚度 (mm)</label>
          <input type="number" name="gnomonThickness" value={isAnalemmatic ? 0 : config.gnomonThickness} onChange={handleChange} min="0" style={inputStyle} />
        </div>
      </div>
    </div>
  );
}