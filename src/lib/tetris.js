import _ from 'fxjs/Strict';
import L from 'fxjs/Lazy';

import gi from './gameInfo';

// import socket from './socket';
// let gameInfo = {
//   state: 'login', //
//   totalUsers: 0,
//   maxUsers: 2,
//   level: 0,
//   teams: {
//     0: [],
//     1: []
//   },
// };

// const initGameInfo = { // 초기 게임 정보
//   ...gameInfo,
// };
// Object.freeze(initGameInfo);

let speedUpIntervalTime = 1000 * 60; // interval time
let setTimeoutFn; // interval level up dp 사용할 변수


/** ======================================
 *  게임 정보에 관련된 객체
 ====================================== */




// ====== 일정 시간 마다 levelup
const intervalLevelUP = (gameInfo, socket) => {
  if(gameInfo.level >= 20) {
    return clearTimeout(setTimeoutFn);
  }

  setTimeoutFn = setTimeout(() => {
    gameInfo.level++;
    updateEmitAll(gameInfo, socket);
    intervalLevelUP(gameInfo, socket);
  }, speedUpIntervalTime)
};


// ====== 지정된 범위 랜덤
const rand = (start, end) =>
    Math.floor((Math.random() * (end-start+1)) + start);


// ====== 나 자신을 포함해 전체에 update emit
const updateEmitAll = (data, socket) => {
  socket.emit('update', data);
  socket.broadcast.emit('update', data);
};


// ====== 로그인
// export const loginUser = ({ name }, socket) => {
//   const gameInfo = gi.getGameInfo();
//   const team = gameInfo.totalUsers % 2;

//   // # 유저가 꽉 찼을 경우 로그인 불가
//   if(gameInfo.totalUsers >= gameInfo.maxUsers) {
//     return socket.emit('error', {message: `유저가 꽉찼습니다.\n(최대 ${gameInfo.maxUsers}명)`});
//   }

//   // # 전체 유저 수 증가
//   ++gameInfo.totalUsers;

//   // # 유저 생성
//   gameInfo.teams[team].push({
//     id,
//     socketId: socket.id,
//     name,
//     team,
//     badPieceGuage: 0,
//     gameOver: false,
//   });

//   // # 방이 다 찼으면 play 아닐경우 progress
//   gameInfo.state = (gameInfo.totalUsers === gameInfo.maxUsers) ? 'play' : 'progress';

//   // // # 일정 시간 지날 때마다 speed up
//   // if(gameInfo.state === 'play') {
//   //   intervalLevelUP(gameInfo, socket);
//   // }



//   // _.log('> loginUser ', gameInfo)
//   socket.emit('loginComplete', { myInfo: { name, team}, gameInfo });
//   socket.broadcast.emit('update', gameInfo);
// };

// ====== reset
export const initialize = (data, socket) => {
  _.log('> initialize : ', socket.id);
  // gameInfo = {
  //   ...initGameInfo
  // };
  // updateEmitAll(gameInfo, socket);
}


// ====== reset
export const reset = (data, socket) => {
  // gameInfo = {
  //   ...initGameInfo
  // };
  // _.log('> initialize : ', gameInfo)
  // updateEmitAll(gameInfo, socket);
}


// // ====== 줄 삭제
export const clearLines = ({ myInfo, clearLines }, socket) => {
  const enemyTeamNum = myInfo.team === 0 ? 1 : 0;
  const enemies = gameInfo.teams[enemyTeamNum];
  const liveEmemies = _.filter((a) => !a.gameOver, enemies); // gameOver 당하지 않고 살아 남아서 플레이 중인 적들
  const randNum = rand(0, liveEmemies.length - 1); // 랜덤한 적 선택

  // _.log('> clearLines : ', liveEmemies, randNum);
  gameInfo.teams[enemyTeamNum][randNum].badPieceGuage += clearLines;

  // # 게이지가 10일 넘을 경우
  if(gameInfo.teams[enemyTeamNum][randNum].badPieceGuage > 10) {
    gameInfo.teams[enemyTeamNum][randNum].badPieceGuage -= 10;
  }

  // updateEmitAll({ ...gameInfo }, socket);
};

// ====== game over
export const gameOver = ({ myInfo }, socket) => {
  let gameOverUsers = 0; // 현재 게임 오버 팀 이벤트가 발생한 팀의 총 게임오버 유저 수
  let gameOverTeamNum = myInfo.team; // 현재 이벤트가 발생한 팀 num
  let result = {};

  // # 팀정보에 게임오버 처리
  _.go(gameInfo.teams[gameOverTeamNum],
    L.filter((u) => u.socketId === myInfo.socketId),
    _.each((u) => {
      if(u.socketId === myInfo.socketId) { u.gameOver = true; }  // 게임오버 유저 게임오버 표시
      if(u.gameOver === true) { ++gameOverUsers; } // 게임오버 유저 카운트
    }),
  );

  // # 게임오버유저수가 전체 팀원수와 같을 경우 game over 처리
  if(gameOverUsers === gameInfo.teams[gameOverTeamNum].length) {
    gameInfo.state = 'gameOver';
    gameInfo.winner = gameOverTeamNum == 0 ? 1 : 0;
    gameInfo.loser = gameOverTeamNum;
  }

  // # 게임 정보 브로드 캐스팅
  updateEmitAll({ ...gameInfo }, socket);
};


