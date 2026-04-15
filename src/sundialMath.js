// 檔案名稱：src/sundialMath.js
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export function calculateHourLines(config) {
  const { latitude, longitude, timezone, type, gnomonThickness = 0, radius = 100 } = config;
  const lines = [];
  const phi = latitude * DEG_TO_RAD;

  // 經度偏移量（分鐘轉為角度）
  const standardMeridian = timezone * 15;
  const longitudeOffsetDeg = longitude - standardMeridian;

  for (let hour = 6; hour <= 18; hour++) {
    // 太陽時角：(小時-12)*15度 + 經度修正
    // 我們加上偏移，但在繪圖時會把 12:00 轉回正上方
    let hourAngleDeg = (hour - 12) * 15 + longitudeOffsetDeg;
    const h = hourAngleDeg * DEG_TO_RAD;

    let pointData = { hour, hourAngleDeg };

    // 厚度修正位移 (以半徑為比例)
    // 12點前向左移，12點後向右移
    const thicknessOffset = (gnomonThickness / 2) / (radius * 2); // 簡單比例轉換
    const side = hour < 12 ? -1 : (hour > 12 ? 1 : 0);

    if (type === 'horizontal' || type === 'vertical') {
      const factor = type === 'horizontal' ? Math.sin(phi) : Math.cos(phi);
      let H_rad = Math.atan(factor * Math.tan(h));
      let H_deg = H_rad * RAD_TO_DEG;

      if (hourAngleDeg > 90) H_deg += 180;
      if (hourAngleDeg < -90) H_deg -= 180;

      // 關鍵修正：減去 12:00 的角度，讓 12:00 永遠是 0 度
      const noonOffset = Math.atan(factor * Math.tan(longitudeOffsetDeg * DEG_TO_RAD)) * RAD_TO_DEG;
      pointData.angle = H_deg - noonOffset;
      pointData.thicknessShift = (gnomonThickness / 2) * side; // 實體毫米位移

    } else if (type === 'analemmatic') {
      // 地平投影式：橢圓座標
      pointData.x = Math.sin(h);
      pointData.y = Math.sin(phi) * Math.cos(h);
      pointData.thicknessShift = (gnomonThickness / 2) * side;
    }

    lines.push(pointData);
    
    // 如果是 12:00 且有厚度，需要產生兩條線（左12點與右12點）
    if (hour === 12 && gnomonThickness > 0) {
      lines[lines.length - 1].thicknessShift = -(gnomonThickness / 2);
      lines.push({ ...pointData, thicknessShift: (gnomonThickness / 2) });
    }
  }

  return lines;
}