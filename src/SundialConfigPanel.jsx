// 檔案名稱：src/SundialConfigPanel.jsx
import React from 'react';

export default function SundialConfigPanel({ config, onChange }) {
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    onChange({ ...config, [name]: type === 'number' ? Number(value) : value });
  };

  const inputCls = "w-full p-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all";
  const labelCls = "block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1";

  return (
    <div className="flex flex-col h-full bg-slate-50/50 p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tighter">SundialMagic</h1>
        <p className="text-xs text-slate-400 font-medium">Precision Astro-Tool</p>
      </div>

      <div className="space-y-6">
        <section>
          <label className={labelCls}>地理位置</label>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" name="latitude" value={config.latitude} onChange={handleChange} placeholder="緯度" className={inputCls} />
            <input type="number" name="longitude" value={config.longitude} onChange={handleChange} placeholder="經度" className={inputCls} />
          </div>
          <input type="number" name="timezone" value={config.timezone} onChange={handleChange} className={`${inputCls} mt-2`} placeholder="時區 (UTC)" />
        </section>

        <section>
          <label className={labelCls}>日晷類型</label>
          <select name="type" value={config.type} onChange={handleChange} className={inputCls}>
            <option value="horizontal">水平式 (Horizontal)</option>
            <option value="vertical">垂直式 (Vertical)</option>
            <option value="analemmatic">地平投影式 (Analemmatic)</option>
          </select>
        </section>

        <section>
          <label className={labelCls}>精確度修正 (mm)</label>
          <input type="number" name="gnomonThickness" value={config.gnomonThickness} onChange={handleChange} className={inputCls} />
        </section>
      </div>
    </div>
  );
}