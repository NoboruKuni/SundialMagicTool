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

  const standardMeridian = timezone * 15;
  const lonOffsetDeg = useSolarTime ? 0 : (longitude - standardMeridian);

  const meridianHourDec = 12 - (lonOffsetDeg / 15);
  const startHour = Math.floor(meridianHourDec - 8); 
  const endHour = Math.ceil(meridianHourDec + 8);

  const lines = [];

  // 垂直偏向參數
  let SD = 0, DL = 0, SH = Math.cos(phi); 
  if (config.type === 'vertical') {
    const D = (config.wallAzimuth || 0) * DEG_TO_RAD;
    SD = Math.atan2(Math.sin(D), Math.tan(phi));
    DL = Math.atan2(Math.tan(D), Math.sin(phi));
    SH = Math.asin(Math.cos(phi) * Math.cos(D));
  }

  for (let hour = startHour; hour <= endHour; hour += 0.25) { 
    let displayHour = hour % 24;
    if (displayHour < 0) displayHour += 24;
    const hourMod = Number(Math.abs(displayHour % 1).toFixed(3));
    const isFullHour = hourMod === 0 || hourMod === 1;

    const hDeg = (hour - 12) * 15 + lonOffsetDeg; 
    const hRad = hDeg * DEG_TO_RAD;
    
    let pointData = { 
      hour, 
      displayHourText: Math.round(displayHour), 
      isFullHour,
      isHalfHour: hourMod === 0.5,
      isQuarterHour: hourMod === 0.25 || hourMod === 0.75
    };

    if (config.type === 'analemmatic') {
      pointData.x = Math.sin(hRad);
      pointData.y = Math.sin(phi) * Math.cos(hRad);
      pointData.thicknessShift = 0; 
      lines.push(pointData);
    } else if (config.type === 'horizontal') {
      const factor = Math.sin(phi);
      const angleRad = Math.atan2(Math.sin(hRad) * factor, Math.cos(hRad));
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
    } else if (config.type === 'vertical') {
      const hDiff = hRad - DL;
      const angleSub = Math.atan2(Math.sin(SH) * Math.sin(hDiff), Math.cos(hDiff));
      const angleWall = angleSub + SD;

      pointData.x = -Math.sin(angleWall);
      pointData.y = -Math.cos(angleWall);

      // 副晷針判定：若 hRad 與 DL 接近，代表影子落在副晷針線上
      const isSubstyle = Math.abs(hDiff) < 0.01;
      if (isSubstyle && gnomonThickness > 0) {
        lines.push({ ...pointData, thicknessShift: -(gnomonThickness / 2) });
        lines.push({ ...pointData, thicknessShift: (gnomonThickness / 2) });
      } else {
        // 修正位移方向：angleSub 決定了相對於副晷針的位置
        pointData.thicknessShift = (gnomonThickness / 2) * Math.sign(-angleSub || 0);
        lines.push(pointData);
      }
    }
  }
  return lines;
}