import React, { useState } from 'react';

// 模擬多國語系翻譯函數 (未來替換為真實的 i18n hooks, e.g., useTranslation)
const t = (key) => {
  const translations = {
    'geo_settings': '地理與時間設定',
    'latitude': '緯度 (Latitude)',
    'longitude': '經度 (Longitude)',
    'timezone': '時區 (Timezone)',
    'sundial_type': '日晷類型',
    'horizontal': '水平式 (Horizontal)',
    'vertical': '垂直式 (Vertical)',
    'analemmatic': '地平投影式 (Analemmatic)',
    'advanced_settings': '進階精確度設定',
    'gnomon_thickness': '晷針厚度 (mm)',
  };
  return translations[key] || key;
};

export default function SundialConfigPanel({ config, onChange }) {
  // 處理輸入變更，並確保數值型別正確
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'number' ? Number(value) : value;
    onChange({ ...config, [name]: parsedValue });
  };

  // 共用的輸入框樣式 (Tailwind)，確保全站 UI 一致性
  const inputStyle = "w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors duration-200";
  const labelStyle = "block text-xs font-medium text-gray-500 tracking-wide";
  const sectionStyle = "bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4";

  return (
    <div className="w-full max-w-md h-full overflow-y-auto p-6 bg-gray-50/50 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 tracking-tight">Vibe Sundial</h2>
      
      {/* 區塊 1：地理與時間設定 */}
      <section className={sectionStyle}>
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">{t('geo_settings')}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelStyle}>{t('latitude')}</label>
            <input 
              type="number" name="latitude" step="0.01" 
              value={config.latitude} onChange={handleChange} 
              className={inputStyle} 
            />
          </div>
          <div>
            <label className={labelStyle}>{t('longitude')}</label>
            <input 
              type="number" name="longitude" step="0.01" 
              value={config.longitude} onChange={handleChange} 
              className={inputStyle} 
            />
          </div>
        </div>
        <div>
          <label className={labelStyle}>{t('timezone')} (UTC)</label>
          <input 
            type="number" name="timezone" step="1" 
            value={config.timezone} onChange={handleChange} 
            className={inputStyle} 
          />
        </div>
      </section>

      {/* 區塊 2：日晷類型 */}
      <section className={sectionStyle}>
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">{t('sundial_type')}</h3>
        <select 
          name="type" 
          value={config.type} onChange={handleChange} 
          className={inputStyle}
        >
          <option value="horizontal">{t('horizontal')}</option>
          <option value="vertical">{t('vertical')}</option>
          <option value="analemmatic">{t('analemmatic')}</option>
        </select>
      </section>

      {/* 區塊 3：進階設定 */}
      <section className={sectionStyle}>
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">{t('advanced_settings')}</h3>
        <div>
          <label className={labelStyle}>{t('gnomon_thickness')}</label>
          <input 
            type="number" name="gnomonThickness" step="0.1" min="0" 
            value={config.gnomonThickness} onChange={handleChange} 
            className={inputStyle} 
            placeholder="例如: 2.5"
          />
        </div>
      </section>
      
    </div>
  );
}