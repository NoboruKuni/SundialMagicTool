// 檔案名稱：src/SundialConfigPanel.jsx
import React from 'react';

export default function SundialConfigPanel({ config, onChange }) {
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    onChange({ ...config, [name]: type === 'number' ? Number(value) : value });
  };

  const isAnalemmatic = config.type === 'analemmatic';
  const sectionStyle = { marginBottom: '24px' };
  const labelStyle = { display: 'block', fontSize: '11px', fontBold: '900', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' };
  const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', transition: 'all 0.2s' };

  return (
    <div style={{ padding: '32px', height: '100%', overflowY: 'auto', backgroundColor: '#f8fafc', borderRight: '1px solid #e2e8f0' }}>
      <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', marginBottom: '4px', letterSpacing: '-1px' }}>SundialMagic</h2>
      <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '32px', fontWeight: 'bold' }}>VERSION 1.5 PRO</p>

      {/* 地理設定 */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', borderLeft: '4px solid #3b82f6', paddingLeft: '10px', marginBottom: '16px' }}>📍 地理與時間</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div><label style={labelStyle}>緯度</label><input type="number" name="latitude" value={config.latitude} onChange={handleChange} style={inputStyle} /></div>
          <div><label style={labelStyle}>經度</label><input type="number" name="longitude" value={config.longitude} onChange={handleChange} style={inputStyle} /></div>
        </div>
        <div><label style={labelStyle}>時區 (UTC)</label><input type="number" name="timezone" value={config.timezone} onChange={handleChange} style={inputStyle} /></div>
      </div>

      {/* 晷面參數 */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', borderLeft: '4px solid #3b82f6', paddingLeft: '10px', marginBottom: '16px' }}>📐 晷面參數</h3>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>時間模式</label>
          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '10px' }}>
            <button onClick={() => onChange({...config, useSolarTime: false})} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', backgroundColor: !config.useSolarTime ? 'white' : 'transparent', color: !config.useSolarTime ? '#2563eb' : '#64748b', boxShadow: !config.useSolarTime ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>鐘錶時間</button>
            <button onClick={() => onChange({...config, useSolarTime: true})} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', backgroundColor: config.useSolarTime ? 'white' : 'transparent', color: config.useSolarTime ? '#2563eb' : '#64748b', boxShadow: config.useSolarTime ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>真太陽時</button>
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
          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
            <label style={{...labelStyle, color: '#1d4ed8'}}>牆面方位角</label>
            <input type="range" min="-90" max="90" name="wallAzimuth" value={config.wallAzimuth || 0} onChange={handleChange} style={{ width: '100%', accentColor: '#3b82f6' }} />
            <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: '#1e40af', marginTop: '4px' }}>{config.wallAzimuth || 0}°</div>
          </div>
        )}

        <div style={{ opacity: isAnalemmatic ? 0.4 : 1, pointerEvents: isAnalemmatic ? 'none' : 'auto', transition: '0.3s' }}>
          <label style={labelStyle}>晷針厚度 (mm) {isAnalemmatic && "— N/A"}</label>
          <input type="number" name="gnomonThickness" value={isAnalemmatic ? 0 : config.gnomonThickness} onChange={handleChange} style={{...inputStyle, backgroundColor: isAnalemmatic ? '#f1f5f9' : 'white'}} />
        </div>
      </div>
    </div>
  );
}