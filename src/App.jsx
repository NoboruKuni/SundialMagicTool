// 檔案名稱：src/App.jsx
import React, { useState } from 'react';
import SundialConfigPanel from './SundialConfigPanel';
import SundialPreview from './SundialPreview';
import ConstructionData from './ConstructionData';
import { calculateHourLines } from './sundialMath';

export default function App() {
  const [config, setConfig] = useState({
    latitude: 25.0, longitude: 121.5, timezone: 8,
    type: 'horizontal', radius: 150, gnomonThickness: 0, useSolarTime: false, wallAzimuth: 0
  });
  const [activeTab, setActiveTab] = useState('preview');
  
  // 取得計算後的數據包 { lines, gnomon }
  const sundialData = calculateHourLines(config);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1200px', width: '100%', backgroundColor: 'white', borderRadius: '20px', display: 'flex', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden', height: '85vh' }}>
        
        {/* 左側：設定區 */}
        <div style={{ width: '380px', flexShrink: 0, zIndex: 10 }}>
          <SundialConfigPanel config={config} onChange={setConfig} />
        </div>

        {/* 右側：顯示區 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', backgroundColor: '#f8fafc' }}>
          
          {/* 頂部 Tab 切換列 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '20px 30px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', zIndex: 5 }}>
            <button onClick={() => setActiveTab('preview')} style={{ padding: '8px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', border: 'none', backgroundColor: activeTab === 'preview' ? '#3b82f6' : '#f1f5f9', color: activeTab === 'preview' ? 'white' : '#64748b', transition: '0.2s' }}>視覺預覽</button>
            <button onClick={() => setActiveTab('data')} style={{ padding: '8px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', border: 'none', backgroundColor: activeTab === 'data' ? '#3b82f6' : '#f1f5f9', color: activeTab === 'data' ? 'white' : '#64748b', transition: '0.2s' }}>施工數據</button>
          </div>
          
          {/* 內容區塊 */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {activeTab === 'preview' ? (
              <SundialPreview config={config} data={sundialData} />
            ) : (
              <ConstructionData config={config} data={sundialData} />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}