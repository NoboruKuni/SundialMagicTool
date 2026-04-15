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

  // 經度偏移：計算鐘錶正午與太陽正午的差距 (以角度計)
  const standardMeridian = timezone * 15;
  const lonOffsetDeg = useSolarTime ? 0 : (longitude - standardMeridian);

  const lines = [];

  /**
   * 為了確保中央左右各有足夠的小時線，我們不從固定小時 (如 6 點) 開始，
   * 而是從「太陽時角 (hRel)」出發。
   * 從 -105 度 (太陽正午前 7 小時) 到 +105 度 (太陽正午後 7 小時)
   */
  for (let hRelDeg = -105; hRelDeg <= 105; hRelDeg += 3.75) { // 每 15 分鐘一格 (3.75度)
    const hRelRad = hRelDeg * DEG_TO_RAD;
    
    // 計算對應的鐘錶小時 (用來標註文字)
    // 當 hRelDeg = 0 時，代表當地的太陽正午。
    // 在鐘錶時間模式下，這對應到 12 - (lonOffsetDeg/15) 小時
    const hour = 12 + (hRelDeg / 15) - (lonOffsetDeg / 15);
    
    // 過濾掉不合理的深夜或凌晨時間 (只顯示 4:00 - 20:00 之間的標記)
    if (hour < 4 || hour > 20) continue;

    let pointData = { 
      hour: Math.round(hour * 100) / 100, // 保留兩位小數供判斷
      isFullHour: Math.abs(hour % 1) < 0.001 || Math.abs(hour % 1) > 0.999,
      isHalfHour: Math.abs(hour % 1 - 0.5) < 0.001
    };

    if (config.type === 'analemmatic') {
      // 投影式：不考慮厚度，直接算橢圓點
      pointData.x = Math.sin(hRelRad);
      pointData.y = Math.sin(phi) * Math.cos(hRelRad);
      pointData.thicknessShift = 0; 
    } else {
      const factor = config.type === 'horizontal' ? Math.sin(phi) : Math.cos(phi);
      const angleRad = Math.atan2(Math.sin(hRelRad) * factor, Math.cos(hRelRad));
      pointData.x = Math.sin(angleRad);
      pointData.y = Math.cos(angleRad);
      
      if (config.type === 'vertical') {
        pointData.x = -pointData.x;
        pointData.y = -pointData.y;
      }

      // 只有非投影式才套用厚度偏移
      pointData.thicknessShift = (gnomonThickness / 2) * Math.sign(pointData.x || 0);
    }

    lines.push(pointData);
  }
  return lines;
}