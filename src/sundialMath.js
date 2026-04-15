// 檔案名稱：src/sundialMath.js
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export function calculateHourLines(config) {
  const { latitude, longitude, timezone, type, gnomonThickness = 0 } = config;
  const phi = latitude * DEG_TO_RAD;

  // 1. 計算經度偏移 (小時 12:00 時，太陽實際上偏離子午線幾度)
  const standardMeridian = timezone * 15;
  const lonOffsetDeg = longitude - standardMeridian;

  // 2. 核心公式：根據日晷類型，計算「時角 h」對應的「面角度 A」
  const getDialAngle = (hDeg) => {
    const hRad = hDeg * DEG_TO_RAD;
    if (type === 'analemmatic') {
      // 地平投影式：回傳 X, Y 座標
      return { x: Math.sin(hRad), y: Math.sin(phi) * Math.cos(hRad) };
    } else {
      // 水平/垂直式
      const factor = type === 'horizontal' ? Math.sin(phi) : Math.cos(phi);
      // 使用 atan2 確保 360 度全範圍精確
      const angleRad = Math.atan2(Math.sin(hRad) * factor, Math.cos(hRad));
      return { angleDeg: angleRad * RAD_TO_DEG };
    }
  };

  // 3. 找出「時鐘 12:00」的基準 (Base)
  const base = getDialAngle(lonOffsetDeg);

  const lines = [];
  for (let hour = 6; hour <= 18; hour++) {
    const currentH = (hour - 12) * 15 + lonOffsetDeg;
    const current = getDialAngle(currentH);
    
    let pointData = { hour };
    const side = hour < 12 ? -1 : (hour > 12 ? 1 : 0);
    const thicknessShift = (gnomonThickness / 2) * side;

    if (type === 'analemmatic') {
      // 對於橢圓日晷，我們需要旋轉座標向量
      const rotRad = -Math.atan2(base.x, base.y);
      const cosR = Math.cos(rotRad);
      const sinR = Math.sin(rotRad);
      // 旋轉矩陣確保 12:00 的 (base.x, base.y) 被轉到 (0, 1)
      pointData.x = current.x * cosR - current.y * sinR;
      pointData.y = current.x * sinR + current.y * cosR;
    } else {
      // 水平/垂直式：直接減去基準角，確保 12:00 為 0 度
      const finalAngle = current.angleDeg - base.angleDeg;
      pointData.x = Math.sin(finalAngle * DEG_TO_RAD);
      pointData.y = Math.cos(finalAngle * DEG_TO_RAD);
      pointData.angle = finalAngle;
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