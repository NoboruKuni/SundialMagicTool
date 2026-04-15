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
  const startHour = Math.floor(meridianHourDec - 7); 
  const endHour = Math.ceil(meridianHourDec + 7);

  const lines = [];

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

    if (config.type === 'analemmatic') {
      pointData.x = Math.sin(hRad);
      pointData.y = Math.sin(phi) * Math.cos(hRad);
      pointData.thicknessShift = 0; 
      lines.push(pointData);
    } else {
      const factor = config.type === 'horizontal' ? Math.sin(phi) : Math.cos(phi);
      const angleRad = Math.atan2(Math.sin(hRad) * factor, Math.cos(hRad));
      pointData.x = Math.sin(angleRad);
      pointData.y = Math.cos(angleRad);
      
      if (config.type === 'vertical') {
        pointData.x = -pointData.x;
        pointData.y = -pointData.y;
      }

      // 【核心修復】：判斷是否為正中央的軸線 (X 接近 0)
      const isMeridian = Math.abs(pointData.x) < 0.0001;

      if (isMeridian && gnomonThickness > 0) {
        // 如果是中央線且有粗晷針，裂開成左右兩條線！
        // 為了避免 SVG 文字重疊，我們讓右側的那條線隱藏文字
        lines.push({ ...pointData, thicknessShift: -(gnomonThickness / 2) });
        lines.push({ ...pointData, thicknessShift: (gnomonThickness / 2), isFullHour: false }); 
      } else {
        // 否則正常根據 X 的正負號往外推
        pointData.thicknessShift = (gnomonThickness / 2) * Math.sign(pointData.x);
        lines.push(pointData);
      }
    }
  }
  return lines;
}