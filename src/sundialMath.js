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

  // 經度偏移：太陽正午與鐘錶正午的落差
  const standardMeridian = timezone * 15;
  const lonOffsetDeg = useSolarTime ? 0 : (longitude - standardMeridian);

  const lines = [];

  // 【核心修復】：完全捨棄時間過濾，改用純幾何的「角度區間」
  // 從太陽正午前 7 小時 (-105度) 畫到太陽正午後 7 小時 (+105度)
  // 這樣保證「物理畫面」永遠是左右對稱且飽滿的
  for (let hRelDeg = -105; hRelDeg <= 105; hRelDeg += 3.75) { 
    const hRelRad = hRelDeg * DEG_TO_RAD;
    
    // 算出這條線代表的「原始鐘錶時間」
    const rawHour = 12 + (hRelDeg / 15) - (lonOffsetDeg / 15);
    
    // 【跨日修復】：將時間標準化到 0.0 ~ 23.99 之間
    let displayHour = rawHour % 24;
    if (displayHour < 0) displayHour += 24;

    // 處理浮點數精度 (確保 12.00001 被視為整點)
    const hourMod = Number(Math.abs(displayHour % 1).toFixed(3));
    const isFullHour = hourMod === 0 || hourMod === 1;

    let pointData = { 
      hour: displayHour,
      displayHourText: Math.round(displayHour), // 提供給 SVG 顯示的乾淨數字
      isFullHour: isFullHour,
      isHalfHour: hourMod === 0.5,
      isQuarterHour: hourMod === 0.25 || hourMod === 0.75
    };

    if (config.type === 'analemmatic') {
      pointData.x = Math.sin(hRelRad);
      pointData.y = Math.sin(phi) * Math.cos(hRelRad);
      pointData.thicknessShift = 0; 
    } else {
      const factor = config.type === 'horizontal' ? Math.sin(phi) : Math.cos(phi);
      const angleRad = Math.atan2(Math.sin(hRelRad) * factor, Math.cos(hRelRad));
      pointData.x = Math.sin(angleRad);
      pointData.y = Math.cos(angleRad);
      
      if (config.type === 'vertical') {
        pointData.x = -pointData.x;
        pointData.y = -pointData.y;
      }

      pointData.thicknessShift = (gnomonThickness / 2) * Math.sign(pointData.x || 0);
    }

    lines.push(pointData);
  }
  return lines;
}