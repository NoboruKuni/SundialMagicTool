// 檔案名稱：src/sundialMath.js
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export function calculateHourLines(config) {
  const latitude = Number(config.latitude);
  const longitude = Number(config.longitude);
  const timezone = Number(config.timezone);
  const gnomonThickness = Number(config.gnomonThickness);
  const phi = latitude * DEG_TO_RAD;

  // 經度偏移 (小時 12:00 時，太陽實際上偏離子午線幾度)
  const standardMeridian = timezone * 15;
  const lonOffsetDeg = longitude - standardMeridian;

  const lines = [];
  for (let hour = 6; hour <= 18; hour++) {
    // 這裡的關鍵：h 是相對於「時鐘正午」的角度位移
    // 12:00 時，h = 0
    const hRelDeg = (hour - 12) * 15; 
    const hRelRad = hRelDeg * DEG_TO_RAD;
    
    let pointData = { hour };
    const side = hour < 12 ? -1 : (hour > 12 ? 1 : 0);
    const thicknessShift = (gnomonThickness / 2) * side;

    if (config.type === 'analemmatic') {
      /**
       * 地平投影式：12 點必須在橢圓頂端。
       * 經度修正會反映在「指針(人)站立的位置」偏移，
       * 但晷面本身的時標點對齊 12 點是標準做法。
       */
      pointData.x = Math.sin(hRelRad);
      pointData.y = Math.sin(phi) * Math.cos(hRelRad);
    } else {
      /**
       * 水平/垂直式：
       * 要讓經度修正後的 12:00 垂直，
       * 我們必須計算「包含經度修正的時角」與「12點經度修正時角」的差值。
       */
      const factor = config.type === 'horizontal' ? Math.sin(phi) : Math.cos(phi);
      
      // 目前小時的投影角 (包含經度偏移)
      const hActual = (hRelDeg + lonOffsetDeg) * DEG_TO_RAD;
      const angleActual = Math.atan2(Math.sin(hActual) * factor, Math.cos(hActual));
      
      // 12:00 基準點的投影角
      const hBase = (0 + lonOffsetDeg) * DEG_TO_RAD;
      const angleBase = Math.atan2(Math.sin(hBase) * factor, Math.cos(hBase));
      
      // 相對角度 (確保 12 點為 0)
      const finalAngleRad = angleActual - angleBase;
      pointData.angle = finalAngleRad * RAD_TO_DEG;
      pointData.x = Math.sin(finalAngleRad);
      pointData.y = Math.cos(finalAngleRad);
    }

    pointData.thicknessShift = thicknessShift;
    lines.push(pointData);

    if (hour === 12 && gnomonThickness > 0) {
      lines[lines.length - 1].thicknessShift = -(gnomonThickness / 2);
      lines.push({ ...pointData, thicknessShift: (gnomonThickness / 2) });
    }
  }
  return lines;
}