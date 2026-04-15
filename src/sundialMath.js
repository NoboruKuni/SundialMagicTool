// 檔案名稱：src/sundialMath.js
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export function calculateHourLines(config) {
  const latitude = Number(config.latitude);
  const longitude = Number(config.longitude);
  const timezone = Number(config.timezone);
  const gnomonThickness = Number(config.gnomonThickness);
  const useSolarTime = !!config.useSolarTime;
  const phi = latitude * DEG_TO_RAD;

  // 經度偏移
  const standardMeridian = timezone * 15;
  const lonOffsetDeg = useSolarTime ? 0 : (longitude - standardMeridian);

  // 【核心修復】：先算出太陽正午發生的鐘錶時間，然後向左右各擴展 7 小時
  const meridianHourDec = 12 - (lonOffsetDeg / 15);
  const startHour = Math.floor(meridianHourDec - 7); 
  const endHour = Math.ceil(meridianHourDec + 7);

  const lines = [];

  // 改回以「小時 (0.25)」為單位跑迴圈，保證一定會踩到整數點 (.00, .25, .50, .75)
  for (let hour = startHour; hour <= endHour; hour += 0.25) { 
    
    // 過濾掉深夜或凌晨時間 (只顯示 4:00 - 20:00 之間)
    if (hour < 4 || hour > 20) continue;

    const hDeg = (hour - 12) * 15 + lonOffsetDeg; 
    const hRad = hDeg * DEG_TO_RAD;
    
    // 解決 JavaScript 浮點數精度問題 (例如 0.1 + 0.2 !== 0.3)
    const hourMod = Number(Math.abs(hour % 1).toFixed(3));
    
    let pointData = { 
      hour, 
      isFullHour: hourMod === 0 || hourMod === 1,
      isHalfHour: hourMod === 0.5,
      isQuarterHour: hourMod === 0.25 || hourMod === 0.75
    };

    if (config.type === 'analemmatic') {
      pointData.x = Math.sin(hRad);
      pointData.y = Math.sin(phi) * Math.cos(hRad);
      pointData.thicknessShift = 0;
    } else {
      const factor = config.type === 'horizontal' ? Math.sin(phi) : Math.cos(phi);
      const angleRad = Math.atan2(Math.sin(hRad) * factor, Math.cos(hRad));
      pointData.x = Math.sin(angleRad);
      pointData.y = Math.cos(angleRad);
      
      if (config.type === 'vertical') {
        pointData.x = -pointData.x;
        pointData.y = -pointData.y;
      }
      
      // 非投影式才套用厚度
      pointData.thicknessShift = (gnomonThickness / 2) * Math.sign(pointData.x || 0);
    }

    lines.push(pointData);
  }
  return lines;
}