// 檔案名稱：src/sundialMath.js
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export function calculateHourLines(config) {
  const { latitude, longitude, timezone, type, gnomonThickness = 0, radius = 100 } = config;
  const phi = latitude * DEG_TO_RAD;

  // 1. 計算經度偏移導致的時角偏移（弧度）
  const standardMeridian = timezone * 15;
  const longitudeOffsetRad = (longitude - standardMeridian) * DEG_TO_RAD;

  /**
   * 內部函式：根據時角 h 計算該類型日晷的原始 X, Y 座標 (比例)
   */
  const getRawXY = (h) => {
    if (type === 'horizontal' || type === 'vertical') {
      const factor = type === 'horizontal' ? Math.sin(phi) : Math.cos(phi);
      // 水平與垂直日晷在幾何上可以看作是單位圓上的射線
      const angleRad = Math.atan2(Math.sin(h) * factor, Math.cos(h));
      return { x: Math.sin(angleRad), y: Math.cos(angleRad) };
    } else {
      // Analemmatic: 橢圓座標
      return { x: Math.sin(h), y: Math.sin(phi) * Math.cos(h) };
    }
  };

  // 2. 核心校正：計算「時鐘 12:00」的原始角度，作為「反向旋轉」的基準
  // 12:00 的時角 h 就是 longitudeOffsetRad
  const basePos = getRawXY(longitudeOffsetRad);
  const rotationAngle = -Math.atan2(basePos.x, basePos.y); // 計算它偏離正北(Y軸)的角度

  // 3. 生成 6:00 到 18:00 的數據
  const lines = [];
  for (let hour = 6; hour <= 18; hour++) {
    const h = (hour - 12) * 15 * DEG_TO_RAD + longitudeOffsetRad;
    const raw = getRawXY(h);

    // 套用旋轉矩陣，將座標轉回 12:00 對齊 Y 軸的座標系
    // x' = x cosθ - y sinθ
    // y' = x sinθ + y cosθ
    const cosR = Math.cos(rotationAngle);
    const sinR = Math.sin(rotationAngle);
    
    let rotatedX = raw.x * cosR - raw.y * sinR;
    let rotatedY = raw.x * sinR + raw.y * cosR;

    // 處理晷針厚度位移 (side: 上午為負，下午為正)
    const side = hour < 12 ? -1 : (hour > 12 ? 1 : 0);
    const thicknessShift = (gnomonThickness / 2) * side;

    const pointData = {
      hour,
      x: rotatedX,
      y: rotatedY,
      angle: Math.atan2(rotatedX, rotatedY) * RAD_TO_DEG,
      thicknessShift
    };

    lines.push(pointData);

    // 12:00 的厚度分開兩條線處理
    if (hour === 12 && gnomonThickness > 0) {
      lines[lines.length - 1].thicknessShift = -(gnomonThickness / 2);
      const right12 = { ...pointData, thicknessShift: (gnomonThickness / 2) };
      lines.push(right12);
    }
  }

  return lines;
}