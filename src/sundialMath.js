// 檔案名稱：src/sundialMath.js
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export function calculateHourLines(config) {
  // 強制將所有輸入轉為數字，避免字串運算錯誤
  const latitude = Number(config.latitude);
  const longitude = Number(config.longitude);
  const timezone = Number(config.timezone);
  const gnomonThickness = Number(config.gnomonThickness);
  const type = config.type;

  const phi = latitude * DEG_TO_RAD;
  const standardMeridian = timezone * 15;
  const lonOffsetDeg = longitude - standardMeridian;

  // 12:00 的原始偏移角基準
  const getBaseAngle = () => {
    const hRad = lonOffsetDeg * DEG_TO_RAD;
    if (type === 'analemmatic') return Math.atan2(Math.sin(hRad), Math.sin(phi) * Math.cos(hRad));
    const factor = type === 'horizontal' ? Math.sin(phi) : Math.cos(phi);
    return Math.atan2(Math.sin(hRad) * factor, Math.cos(hRad));
  };
  const baseAngleRad = getBaseAngle();

  const lines = [];
  for (let hour = 6; hour <= 18; hour++) {
    const hDeg = (hour - 12) * 15 + lonOffsetDeg;
    const hRad = hDeg * DEG_TO_RAD;
    
    let pointData = { hour };
    const side = hour < 12 ? -1 : (hour > 12 ? 1 : 0);
    const thicknessShift = (gnomonThickness / 2) * side;

    // --- 核心修正區 ---
    if (hour === 12) {
      // 暴力修正：12點絕對垂直
      pointData.angle = 0;
      pointData.x = 0;
      pointData.y = 1;
    } else {
      if (type === 'analemmatic') {
        const rawX = Math.sin(hRad);
        const rawY = Math.sin(phi) * Math.cos(hRad);
        // 使用旋轉矩陣轉回 12:00 軸心
        const cosR = Math.cos(-baseAngleRad);
        const sinR = Math.sin(-baseAngleRad);
        pointData.x = rawX * cosR - rawY * sinR;
        pointData.y = rawX * sinR + rawY * cosR;
        pointData.angle = Math.atan2(pointData.x, pointData.y) * RAD_TO_DEG;
      } else {
        const factor = type === 'horizontal' ? Math.sin(phi) : Math.cos(phi);
        const currentAngleRad = Math.atan2(Math.sin(hRad) * factor, Math.cos(hRad));
        const finalAngle = (currentAngleRad - baseAngleRad) * RAD_TO_DEG;
        pointData.angle = finalAngle;
        pointData.x = Math.sin(finalAngle * DEG_TO_RAD);
        pointData.y = Math.cos(finalAngle * DEG_TO_RAD);
      }
    }

    pointData.thicknessShift = thicknessShift;
    lines.push(pointData);

    // 處理有厚度的 12 點
    if (hour === 12 && gnomonThickness > 0) {
      lines[lines.length - 1].thicknessShift = -(gnomonThickness / 2);
      lines.push({ ...pointData, thicknessShift: (gnomonThickness / 2) });
    }
  }
  return lines;
}