// 檔案名稱：src/sundialMath.js
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export function calculateHourLines(config) {
  const latitude = Number(config.latitude);
  const longitude = Number(config.longitude);
  const timezone = Number(config.timezone);
  const gnomonThickness = Number(config.gnomonThickness);
  const phi = latitude * DEG_TO_RAD;

  // 經度偏移：計算鐘錶時間與真太陽時的落差
  const standardMeridian = timezone * 15;
  const lonOffsetDeg = longitude - standardMeridian;

  const lines = [];
  // 為了讓外圈更完整，我們擴展計算範圍到 5:00 ~ 19:00
  for (let hour = 5; hour <= 19; hour += 0.25) { 
    // 真太陽時角 (Local Solar Hour Angle)
    // 當 hDeg = 0 時，代表太陽正當頭，影子落在正北中軸線上
    const hDeg = (hour - 12) * 15 + lonOffsetDeg; 
    const hRad = hDeg * DEG_TO_RAD;
    
    let pointData = { 
      hour, 
      isFullHour: hour % 1 === 0,
      isHalfHour: hour % 1 === 0.5,
      isQuarterHour: hour % 0.5 !== 0
    };

    if (config.type === 'analemmatic') {
      pointData.x = Math.sin(hRad);
      pointData.y = Math.sin(phi) * Math.cos(hRad);
    } else {
      const factor = config.type === 'horizontal' ? Math.sin(phi) : Math.cos(phi);
      // X=0, Y=1 現在絕對代表真太陽正午 (物理正北)
      const angleRad = Math.atan2(Math.sin(hRad) * factor, Math.cos(hRad));
      pointData.x = Math.sin(angleRad);
      pointData.y = Math.cos(angleRad);
      
      // 垂直式 (正南牆面)：幾何投影需翻轉 180 度，線條向下，早晨在右
      if (config.type === 'vertical') {
        pointData.x = -pointData.x;
        pointData.y = -pointData.y;
      }
    }

    // 【動態厚度修正】：這是一個優雅的解法
    // 如果影子落在左邊 (x < 0)，代表是右側邊緣投射的，所以整體向左平移
    pointData.thicknessShift = (gnomonThickness / 2) * Math.sign(pointData.x || 0);
    
    // 只保留有意義的線條 (Y > -0.1 確保影子不會畫到太陽後面去)
    if (pointData.y > -0.2 || config.type === 'analemmatic') {
        lines.push(pointData);
    }
  }
  return lines;
}