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

  // 經度偏移：鐘錶正午與太陽正午的落差角度
  const standardMeridian = timezone * 15;
  const lonOffsetDeg = useSolarTime ? 0 : (longitude - standardMeridian);

  // 1. 算出「真太陽正午」發生在鐘錶上的哪一刻 (以小數表示，例如 6.902)
  const meridianHourDec = 12 - (lonOffsetDeg / 15);

  // 2. 以正午為中心，向左推 7 小時，向右推 7 小時
  const startHour = Math.floor(meridianHourDec - 7); 
  const endHour = Math.ceil(meridianHourDec + 7);

  const lines = [];

  // 3. 【核心修復】：改回以 0.25 小時 (15分鐘) 為單位跳動，保證一定會踩到精確的整點！
  // 絕對不加任何時間過濾器，讓幾何決定對稱。
  for (let hour = startHour; hour <= endHour; hour += 0.25) { 
    
    // 將跨日的時間轉換為 0.00 ~ 23.99 (例如 -1 點變成 23 點)
    let displayHour = hour % 24;
    if (displayHour < 0) displayHour += 24;

    // 處理 JavaScript 浮點數精度，確保 12.0001 被認定為 12.0
    const hourMod = Number(Math.abs(displayHour % 1).toFixed(3));
    const isFullHour = hourMod === 0 || hourMod === 1;

    const hDeg = (hour - 12) * 15 + lonOffsetDeg; 
    const hRad = hDeg * DEG_TO_RAD;
    
    let pointData = { 
      hour: hour, // 原始時間供數學計算
      displayHourText: Math.round(displayHour), // 顯示用的乾淨整數數字
      isFullHour: isFullHour,
      isHalfHour: hourMod === 0.5,
      isQuarterHour: hourMod === 0.25 || hourMod === 0.75
    };

    if (config.type === 'analemmatic') {
      pointData.x = Math.sin(hRad);
      pointData.y = Math.sin(phi) * Math.cos(hRad);
      pointData.thicknessShift = 0; 
    } else {
      const factor = config.type === 'horizontal' ? Math.sin(phi) : Math.cos(phi);
      const angleRad = Math.atan2(Math.sin(hRad) * factor, Math.cos(hRad));
      pointData.x = Math.sin(angleRad);
      pointData.y = Math.cos(angleRad);
      
      if (config.type === 'vertical') {
        pointData.x = -pointData.x;
        pointData.y = -pointData.y;
      }

      pointData.thicknessShift = (gnomonThickness / 2) * Math.sign(pointData.x || 0);
    }

    // 將所有計算好的線條推入陣列
    lines.push(pointData);
  }
  return lines;
}