// 檔案名稱：src/sundialMath.js
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export function calculateHourLines(config) {
  const latitude = Number(config.latitude);
  const longitude = Number(config.longitude);
  const timezone = Number(config.timezone);
  const gnomonThickness = Number(config.gnomonThickness);
  const useSolarTime = !!config.useSolarTime; // 新增：是否使用太陽時模式
  
  const phi = latitude * DEG_TO_RAD;

  // 核心邏輯切換：
  // 若使用太陽時，lonOffsetDeg 為 0，代表 12:00 永遠對準子午線。
  const standardMeridian = timezone * 15;
  const lonOffsetDeg = useSolarTime ? 0 : (longitude - standardMeridian);

  const lines = [];
  for (let hour = 5; hour <= 19; hour += 0.25) { 
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
      const angleRad = Math.atan2(Math.sin(hRad) * factor, Math.cos(hRad));
      pointData.x = Math.sin(angleRad);
      pointData.y = Math.cos(angleRad);
      
      if (config.type === 'vertical') {
        pointData.x = -pointData.x;
        pointData.y = -pointData.y;
      }
    }

    pointData.thicknessShift = (gnomonThickness / 2) * Math.sign(pointData.x || 0);
    
    if (pointData.y > -0.2 || config.type === 'analemmatic') {
        lines.push(pointData);
    }
  }
  return lines;
}