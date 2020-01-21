// ====== 지정된 범위 랜덤
export const rand = (start, end) =>
     Math.floor((Math.random() * (end-start+1)) + start);