// 檔案名稱：src/sundialMath.js
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export function calculateHourLines(config) {
  const latitude = Number(config.latitude);
  const longitude = Number(config.longitude);
  const timezone = Number(config.timezone);
  const gnomonThickness = Number(config.gnomonThickness);
  const useSolarTime = !!config.useSolarTime;
  const type = config.type;
  const phi = latitude * DEG_TO_RAD;

  const standardMeridian = timezone * 15;
  const lonOffsetDeg = useSolarTime ? 0 : (longitude - standardMeridian);

  const meridianHourDec = 12 - (lonOffsetDeg / 15);
  // 稍微擴大範圍以確保偏斜牆面能畫滿
  const startHour = Math.floor(meridianHourDec - 8); 
  const endHour = Math.ceil(meridianHourDec + 8);

  const lines = [];

  // ==========================================
  // 【3D 空間投影預先計算】 (針對垂直偏向牆面)
  // ==========================================
  let SD = 0, DL = 0, SH = Math.cos(phi); 
  if (type === 'vertical') {
    const D = (config.wallAzimuth || 0) * DEG_TO_RAD; // 牆面偏斜角
    SD = Math.atan2(Math.sin(D), Math.tan(phi));      // 副晷針距 (傾斜角)
    DL = Math.atan2(Math.tan(D), Math.sin(phi));      // 等效經度差
    SH = Math.asin(Math.cos(phi) * Math.cos(D));      // 晷針真實高度
  }

  for (let hour = startHour; hour <= endHour; hour += 0.25) { 
    let displayHour = hour % 24;
    if (displayHour < 0) displayHour += 24;

    const hourMod = Number(Math.abs(displayHour % 1).toFixed(3));
    const isFullHour = hourMod === 0 || hourMod === 1;

    const hDeg = (hour - 12) * 15 + lonOffsetDeg; 
    const hRad = hDeg * DEG_TO_RAD;
    
    let pointData = { 
      hour: hour, 
      displayHourText: Math.round(displayHour), 
      isFullHour: isFullHour,
      isHalfHour: hourMod === 0.5,
      isQuarterHour: hourMod === 0.25 || hourMod === 0.75
    };

    if (type === 'analemmatic') {
      // 地平投影式
      pointData.x = Math.sin(hRad);
      pointData.y = Math.sin(phi) * Math.cos(hRad);
      pointData.thicknessShift = 0; 
      lines.push(pointData);

    } else if (type === 'horizontal') {
      // 水平式
      const angleRad = Math.atan2(Math.sin(hRad) * Math.sin(phi), Math.cos(hRad));
      pointData.x = Math.sin(angleRad);
      pointData.y = Math.cos(angleRad);
      
      const isMeridian = Math.abs(pointData.x) < 0.0001;
      if (isMeridian && gnomonThickness > 0) {
        lines.push({ ...pointData, thicknessShift: -(gnomonThickness / 2) });
        lines.push({ ...pointData, thicknessShift: (gnomonThickness / 2) });
      } else {
        pointData.thicknessShift = (gnomonThickness / 2) * Math.sign(pointData.x || 0);
        lines.push(pointData);
      }

    } else if (type === 'vertical') {
      // ==========================================
      // 【垂直偏向式 3D 映射核心】
      // ==========================================
      // 1. 計算相對於傾斜晷針 (Substyle) 的夾角
      const angleSub = Math.atan2(Math.sin(SH) * Math.sin(hRad - DL), Math.cos(hRad - DL));
      // 2. 加上晷針本身的傾斜角，得到與真實鉛垂線的夾角
      const angleWall = angleSub + SD;

      // 3. 垂直牆面的座標鏡像轉換
      pointData.x = -Math.sin(angleWall);
      pointData.y = -Math.cos(angleWall);

      // 4. 厚度裂變發生在「副晷針線 (Substyle)」上，而不是正下方！
      const isSubstyle = Math.abs(angleSub) < 0.0001;
      if (isSubstyle && gnomonThickness > 0) {
        lines.push({ ...pointData, thicknessShift: -(gnomonThickness / 2) });
        lines.push({ ...pointData, thicknessShift: (gnomonThickness / 2) });
      } else {
        pointData.thicknessShift = (gnomonThickness / 2) * Math.sign(-angleSub || 0);
        lines.push(pointData);
      }
    }
  }
  return lines;
}