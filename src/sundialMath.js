// 檔案名稱：src/sundialMath.js
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export function calculateHourLines(config) {
  const { latitude, longitude, timezone, type, gnomonThickness = 0, radius = 100 } = config;
  const lines = [];
  const phi = latitude * DEG_TO_RAD;

  // 1. 經度修正角度
  const standardMeridian = timezone * 15;
  const longitudeOffsetDeg = longitude - standardMeridian;

  // 2. 先計算「時鐘正午 12:00」的原始角度或座標，作為校正基準 (Reference Base)
  let baseOffset = 0;
  let basePos = { x: 0, y: 0 };
  const hNoon = longitudeOffsetDeg * DEG_TO_RAD;

  if (type === 'horizontal' || type === 'vertical') {
    const factor = type === 'horizontal' ? Math.sin(phi) : Math.cos(phi);
    baseOffset = Math.atan(factor * Math.tan(hNoon)) * RAD_TO_DEG;
  } else if (type === 'analemmatic') {
    // 這裡我們記錄 12:00 在未旋轉前的位置
    basePos.x = Math.sin(hNoon);
    basePos.y = Math.sin(phi) * Math.cos(hNoon);
    // 計算 12:00 點相對於中心點的角度，用於整體的旋轉
    baseOffset = Math.atan2(basePos.x, basePos.y) * RAD_TO_DEG;
  }

  // 3. 計算 6:00 到 18:00 的數據
  for (let hour = 6; hour <= 18; hour++) {
    let hourAngleDeg = (hour - 12) * 15 + longitudeOffsetDeg;
    const h = hourAngleDeg * DEG_TO_RAD;
    let pointData = { hour, hourAngleDeg };

    // 晷針厚度位移側 (12點前負，12點後正)
    const side = hour < 12 ? -1 : (hour > 12 ? 1 : 0);

    if (type === 'horizontal' || type === 'vertical') {
      const factor = type === 'horizontal' ? Math.sin(phi) : Math.cos(phi);
      let H_rad = Math.atan(factor * Math.tan(h));
      let H_deg = H_rad * RAD_TO_DEG;

      // 象限修正
      if (hourAngleDeg > 90) H_deg += 180;
      if (hourAngleDeg < -90) H_deg -= 180;

      // 【修正關鍵】：強制減去 12:00 的基準角，使其歸零
      pointData.angle = H_deg - baseOffset;
      pointData.thicknessShift = (gnomonThickness / 2) * side;

    } else if (type === 'analemmatic') {
      // 原始橢圓座標
      const rawX = Math.sin(h);
      const rawY = Math.sin(phi) * Math.cos(h);

      // 【修正關鍵】：對橢圓座標進行二維旋轉矩陣運算，讓 12:00 轉到 Y 軸上
      const rotRad = -baseOffset * DEG_TO_RAD;
      pointData.x = rawX * Math.cos(rotRad) - rawY * Math.sin(rotRad);
      pointData.y = rawX * Math.sin(rotRad) + rawY * Math.cos(rotRad);
      pointData.thicknessShift = (gnomonThickness / 2) * side;
    }

    lines.push(pointData);
    
    // 處理 12 點的雙線（若有厚度）
    if (hour === 12 && gnomonThickness > 0) {
      lines[lines.length - 1].thicknessShift = -(gnomonThickness / 2);
      // 複製一份給另一側
      const right12 = JSON.parse(JSON.stringify(lines[lines.length - 1]));
      right12.thicknessShift = (gnomonThickness / 2);
      lines.push(right12);
    }
  }

  return lines;
}