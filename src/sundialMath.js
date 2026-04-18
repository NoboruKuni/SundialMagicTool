// 檔案名稱：src/sundialMath.js
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

// 計算全年的日行差 (EoT) - 回傳每個月 1號、11號、21號 的修正分鐘數
export function getEoTTable() {
  const days = [1, 11, 21];
  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const daysInMonth = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  
  return months.map(m => {
    return days.map(d => {
      const n = daysInMonth[m - 1] + d;
      const B = (360 / 365.24) * (n - 81) * DEG_TO_RAD;
      const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
      return { month: m, day: d, eot: Math.round(eot * 10) / 10 }; // 保留一位小數
    });
  });
}

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
  let SD = 0, DL = 0, SH = Math.cos(phi); 
  let gnomonParams = { SH_deg: 0, SD_deg: 0 };

  if (config.type === 'vertical') {
    const D = (config.wallAzimuth || 0) * DEG_TO_RAD;
    SD = Math.atan2(Math.sin(D), Math.tan(phi));
    DL = Math.atan2(Math.tan(D), Math.sin(phi));
    SH = Math.asin(Math.cos(phi) * Math.cos(D));
    gnomonParams = { SH_deg: SH * RAD_TO_DEG, SD_deg: SD * RAD_TO_DEG };
  } else if (config.type === 'horizontal') {
    gnomonParams = { SH_deg: latitude, SD_deg: 0 };
  } else {
    gnomonParams = { SH_deg: null, SD_deg: null }; // 投影式無實體晷針
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
      pointData.angleDeg = angleRad * RAD_TO_DEG;
      
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
      pointData.angleDeg = angleWall * RAD_TO_DEG; // 記錄牆面角度供施工用

      const isSubstyle = Math.abs(hDiff) < 0.01;
      if (isSubstyle && gnomonThickness > 0) {
        lines.push({ ...pointData, thicknessShift: -(gnomonThickness / 2) });
        lines.push({ ...pointData, thicknessShift: (gnomonThickness / 2) });
      } else {
        pointData.thicknessShift = (gnomonThickness / 2) * Math.sign(-angleSub || 0);
        lines.push(pointData);
      }
    }
  }
  
  // 【修正】：回傳包裹了 lines 與 gnomon 參數的物件
  return { lines, gnomon: gnomonParams };
}