// 檔案名稱：sundialMath.js
// 用途：專門處理日晷的所有天文與幾何計算

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

/**
 * 計算日晷各個整點的刻度數據
 * @param {Object} config - 來自 UI 表單的設定檔
 * @returns {Array} 包含早上 6 點到下午 6 點的繪製數據陣列
 */
export function calculateHourLines(config) {
  const { latitude, longitude, timezone, type, applyLongitudeCorrection = true } = config;
  const lines = [];

  // 1. 經度修正計算：計算當地經度與時區標準經線的差異
  // 例如：台灣時區為 8，標準經線為 8 * 15 = 120 度。
  // 若人在板橋(121.46度)，比 120 度更靠東，太陽會提早到，所以刻度需要偏移。
  const standardMeridian = timezone * 15;
  const longitudeOffsetDeg = applyLongitudeCorrection ? (longitude - standardMeridian) : 0;

  // 緯度轉為弧度，因為 JavaScript 的 Math.sin/cos 只吃弧度
  const phi = latitude * DEG_TO_RAD;

  // 2. 迴圈計算早上 6 點到下午 18 點的每一個整點
  for (let hour = 6; hour <= 18; hour++) {
    // 基礎時角：12點為 0 度，每小時差 15 度
    let hourAngleDeg = (hour - 12) * 15;
    
    // 將經度修正直接加入時角中
    hourAngleDeg += longitudeOffsetDeg;
    
    // 時角轉弧度
    const h = hourAngleDeg * DEG_TO_RAD;

    // 建立每個時辰的基本資料包
    const pointData = { 
      hour: hour, 
      hourAngleDeg: hourAngleDeg 
    };

    // 3. 根據日晷類型，套用不同的球面三角學公式
    if (type === 'horizontal') {
      // 水平式：計算面上刻度角 H
      const H_rad = Math.atan(Math.sin(phi) * Math.tan(h));
      let H_deg = H_rad * RAD_TO_DEG;
      
      // 數學修正：Math.atan 算出的角度範圍在 -90 到 90 度之間。
      // 對於清晨或傍晚（時角超過 90 度），我們需要手動將角度翻轉到正確的象限。
      if (hourAngleDeg > 90) H_deg += 180;
      if (hourAngleDeg < -90) H_deg -= 180;

      pointData.angle = H_deg;

    } else if (type === 'vertical') {
      // 垂直式（假設正南向）：計算面上刻度角 H
      const H_rad = Math.atan(Math.cos(phi) * Math.tan(h));
      let H_deg = H_rad * RAD_TO_DEG;
      
      if (hourAngleDeg > 90) H_deg += 180;
      if (hourAngleDeg < -90) H_deg -= 180;
      
      pointData.angle = H_deg;

    } else if (type === 'analemmatic') {
      // 地平投影式：我們不給角度，而是給出橢圓上 X 與 Y 的「比例位置」。
      // 假設橢圓長軸半徑為 1，Phase 3 畫圖時再乘上使用者想要的真實尺寸 (如 100cm)
      pointData.x = Math.sin(h);
      pointData.y = Math.sin(phi) * Math.cos(h);
    }

    lines.push(pointData);
  }

  return lines;
}