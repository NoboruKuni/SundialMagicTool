// 檔案名稱：src/sundialMath.js
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export function calculateHourLines(config) {
  const { latitude, longitude, timezone, type, gnomonThickness = 0 } = config;
  const phi = latitude * DEG_TO_RAD;

  // 1. 經度偏差 (以角度計)
  const standardMeridian = timezone * 15;
  const longitudeOffsetDeg = longitude - standardMeridian;

  // 2. 計算「時鐘 12:00」的原始投影偏移角
  // 對於水平/垂直式，我們算出 12 點時太陽實際的角度位移
  const hNoonRad = longitudeOffsetDeg * DEG_TO_RAD;
  const factor = type === 'horizontal' ? Math.sin(phi) : Math.cos(phi);
  // 這是 12:00 在原始座標系中的偏角
  const baseAngleRad = Math.atan(factor * Math.tan(hNoonRad));
  const baseAngleDeg = baseAngleRad * RAD_TO_DEG;

  const lines = [];
  for (let hour = 6; hour <= 18; hour++) {
    // 太陽時角 (包含經度修正)
    const hourAngleDeg = (hour - 12) * 15 + longitudeOffsetDeg;
    const h = hourAngleDeg * DEG_TO_RAD;
    
    let pointData = { hour };
    const side = hour < 12 ? -1 : (hour > 12 ? 1 : 0);
    const thicknessShift = (gnomonThickness / 2) * side;

    if (type === 'horizontal' || type === 'vertical') {
      // 計算該小時的投影角
      let H_rad = Math.atan(factor * Math.tan(h));
      let H_deg = H_rad * RAD_TO_DEG;

      // 象限修正 (處理清晨與傍晚)
      if (hourAngleDeg > 90) H_deg += 180;
      if (hourAngleDeg < -90) H_deg -= 180;

      // 【關鍵修正】：直接減去 12 點的偏角，讓 12 點歸零
      pointData.angle = H_deg - baseAngleDeg;
      
      // 轉換成 X, Y 座標供畫圖使用
      const finalRad = pointData.angle * DEG_TO_RAD;
      pointData.x = Math.sin(finalRad);
      pointData.y = Math.cos(finalRad);

    } else if (type === 'analemmatic') {
      // 對於地平投影式，我們讓「時角」歸零即可
      // 這樣 12 點的時角會變成 0，對應 sin(0)=0，剛好在 Y 軸上
      const adjustedH = (hour - 12) * 15 * DEG_TO_RAD;
      pointData.x = Math.sin(adjustedH);
      pointData.y = Math.sin(phi) * Math.cos(adjustedH);
      pointData.angle = Math.atan2(pointData.x, pointData.y) * RAD_TO_DEG;
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