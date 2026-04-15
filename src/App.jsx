// 檔案名稱：App.jsx
import React, { useState } from 'react';
import SundialConfigPanel from './SundialConfigPanel';
import SundialPreview from './SundialPreview';
import ConstructionData from './ConstructionData'; // 新增引用
import { calculateHourLines } from './sundialMath'; // 新增引用

export default function App() {
  // 核心狀態：所有的設定都在這裡統一管理
  const [config, setConfig] = useState({
    latitude: 25.01,
    longitude: 121.46,
    timezone: 8,
    type: 'horizontal',
    radius: 120,
    gnomonThickness: 0,
    applyLongitudeCorrection: true,
  });

const [activeTab, setActiveTab] = useState('preview'); // 新增分頁狀態
const hourData = calculateHourLines(config); // 先算出數據


  return (
    // 外層容器：滿版高度，灰色背景，讓中間的卡片浮凸出來
    <div className="min-h-screen bg-gray-200 p-4 md:p-8 flex items-center justify-center font-sans">
      
      {/* 主卡片：限制最大寬度，並分為左右兩欄 */}
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row h-[80vh] min-h-[600px]">
        
        {/* 左側：控制面板 (寬度佔 1/3) */}
        <div className="w-full md:w-1/3 border-r border-gray-100">
          {/* 將 config 和修改 config 的函數傳入表單 */}
          <SundialConfigPanel config={config} onChange={setConfig} />
        </div>
        
        {/* 右側：視覺預覽區 (寬度佔 2/3) */}
        <div className="w-full md:w-2/3 bg-gray-50/50 p-6 flex flex-col relative">
          {/* 預留 Tab 切換按鈕的空間 */}
          <div className="flex justify-end mb-4 space-x-2 absolute top-6 right-6 z-10">
             <button className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md shadow-sm">視覺預覽</button>
             <button className="px-4 py-1.5 bg-white text-gray-600 text-sm border border-gray-200 rounded-md shadow-sm hover:bg-gray-50">施工數據</button>
          </div>
          
          {/* 將 config 傳入 SVG 預覽元件 */}
          <SundialPreview config={config} />
        </div>

      </div>
      <div className="flex justify-end mb-4 space-x-2 absolute top-6 right-6 z-10">
  <button 
    onClick={() => setActiveTab('preview')}
    className={`px-4 py-1.5 text-sm rounded-md shadow-sm transition-all ${activeTab === 'preview' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
  >
    視覺預覽
  </button>
  <button 
    onClick={() => setActiveTab('data')}
    className={`px-4 py-1.5 text-sm rounded-md shadow-sm transition-all ${activeTab === 'data' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
  >
    施工數據
  </button>
</div>

{/* 根據 Tab 顯示內容 */}
{activeTab === 'preview' ? (
  <SundialPreview config={config} />
) : (
  <ConstructionData config={config} data={hourData} />
)}
    </div>
  );
}

