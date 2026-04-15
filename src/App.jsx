// 檔案名稱：src/App.jsx
import React, { useState } from 'react';
import SundialConfigPanel from './SundialConfigPanel';
import SundialPreview from './SundialPreview';
import ConstructionData from './ConstructionData';
import { calculateHourLines } from './sundialMath';

export default function App() {
  const [config, setConfig] = useState({
    latitude: 25.01, longitude: 121.46, timezone: 8,
    type: 'horizontal', radius: 150, gnomonThickness: 0
  });
  const [activeTab, setActiveTab] = useState('preview');
  const data = calculateHourLines(config);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1000px', width: '100%', backgroundColor: 'white', borderRadius: '20px', display: 'flex', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden', height: '80vh' }}>
        
        {/* 左側：設定區 */}
        <div style={{ width: '350px', borderRight: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <SundialConfigPanel config={config} onChange={setConfig} />
        </div>

        {/* 右側：顯示區 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '20px' }}>
            <button onClick={() => setActiveTab('preview')} style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #e2e8f0', backgroundColor: activeTab === 'preview' ? '#2563eb' : 'white', color: activeTab === 'preview' ? 'white' : '#64748b' }}>視覺預覽</button>
            <button onClick={() => setActiveTab('data')} style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #e2e8f0', backgroundColor: activeTab === 'data' ? '#2563eb' : 'white', color: activeTab === 'data' ? 'white' : '#64748b' }}>施工數據</button>
          </div>
          
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {activeTab === 'preview' ? <SundialPreview config={config} /> : <ConstructionData config={config} data={data} />}
          </div>
        </div>

      </div>
    </div>
  );
}