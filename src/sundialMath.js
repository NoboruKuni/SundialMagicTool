// 檔案名稱：src/sundialMath.js
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export function calculateHourLines(config) {
  const latitude = Number(config.latitude);
  const longitude = Number(config.longitude);
  const timezone = Number(config.timezone);
  const gnomonThickness = Number(config.gnomonThickness);
  const phi = latitude * DEG_TO_RAD;

  const standardMeridian = timezone * 15;
  const lonOffsetDeg = longitude - standardMeridian;

  const getDialAngle = (hDeg) => {
    const hRad = hDeg * DEG_TO_RAD;
    if (config.type === 'analemmatic') {
      return { x: Math.sin(hRad), y: Math.sin(phi) * Math.cos(hRad) };
    } else {
      const factor = config.type === 'horizontal' ? Math.sin(phi) : Math.cos(phi);
      const angleRad = Math.atan2(Math.sin(hRad) * factor, Math.cos(hRad));
      return { angleDeg: angleRad * RAD_TO_DEG };
    }
  };

  const base = getDialAngle(lonOffsetDeg);
  const lines = [];

  // 這裡改為每 0.25 小時 (15分鐘) 跑一次迴圈
  for (let hour = 6; hour <= 18; hour += 0.25) {
    const hRelDeg = (hour - 12) * 15;
    const hRelRad = hRelDeg * DEG_TO_RAD;
    const currentH = hRelDeg + lonOffsetDeg;
    const current = getDialAngle(currentH);

    let pointData = { 
      hour, 
      isFullHour: hour % 1 === 0,
      isHalfHour: hour % 1 === 0.5,
      isQuarterHour: hour % 0.5 !== 0
    };

    const side = hour < 12 ? -1 : (hour > 12 ? 1 : 0);
    const thicknessShift = (gnomonThickness / 2) * side;

    if (config.type === 'analemmatic') {
      const rotRad = -Math.atan2(base.x, base.y);
      const cosR = Math.cos(rotRad);
      const sinR = Math.sin(rotRad);
      pointData.x = current.x * cosR - current.y * sinR;
      pointData.y = current.x * sinR + current.y * cosR;
    } else {
      const hActual = currentH * DEG_TO_RAD;
      const angleActual = Math.atan2(Math.sin(hActual) * (config.type === 'horizontal' ? Math.sin(phi) : Math.cos(phi)), Math.cos(hActual));
      const hBase = lonOffsetDeg * DEG_TO_RAD;
      const angleBase = Math.atan2(Math.sin(hBase) * (config.type === 'horizontal' ? Math.sin(phi) : Math.cos(phi)), Math.cos(hBase));
      const finalAngleRad = angleActual - angleBase;
      pointData.x = Math.sin(finalAngleRad);
      pointData.y = Math.cos(finalAngleRad);
    }

    pointData.thicknessShift = thicknessShift;
    lines.push(pointData);

    // 12點厚度處理
    if (hour === 12 && gnomonThickness > 0) {
      lines[lines.length - 1].thicknessShift = -(gnomonThickness / 2);
      lines.push({ ...pointData, thicknessShift: (gnomonThickness / 2) });
    }
  }
  return lines;
}