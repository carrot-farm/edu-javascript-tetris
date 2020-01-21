import Io from 'socket.io';
import _ from 'fxjs/Strict';
import L from 'fxjs/Lazy';

import { loginUser, initialize, setDummy, clearLines, gameOver } from './tetris';
import gi from './gameInfo';

let io;
let startTime = 0;
const socket = {};
const listen = {};

// ===== 초기화
socket.init = server => {
  io = Io(server);

  // # 초기화
  io.on('connection', socket => {
    // console.log('> connection ');

    // # 이벤트 바인딩
    _.go(socket,
      eventListener(['connection', listen.connection]),
      eventListener(['disconnect', listen.disconnect]),
      eventListener(['loginUser', listen.loginUser]),
      eventListener(['clearLines', listen.clearLines]),
      eventListener(['gameOver', listen.gameOver]),
      eventListener(['initialize', listen.initialize]),
    )
  });

};


// ===== 이벤트 리스너
const eventListener = _.curry(([eventName, f], socket) => {
  socket.on(eventName, (data) => f(data, socket));
  return socket;
});


// ====== 나 자신을 포함해 전체에 update emit
const updateEmitAll = (data, socket, evt = 'update') => {
  // _.log('> updateEmitAll : ', data)
  socket.emit(evt, data);
  socket.broadcast.emit(evt, data);
};

/** ==========================================
 *  리스너
 ========================================== */
// ===== 초기 접속
listen.connection = (req, socket) => {
  gi.addUser(socket.id); // 유저 추가
  gi.updateUser(socket.id, { state: 'login' }); // login 상태로 변경
  updateEmitAll(gi.getGameInfo(), socket); // 브로드캐스트
};


// ===== 접속 정료
listen.disconnect = (req, socket) => {
  gi.removeUser(socket.id);
  updateEmitAll(gi.getGameInfo(), socket);
};


// ===== 로그인 유저
listen.loginUser = ({name}, socket) => {
  try {
    const gameInfo = gi.getGameInfo();
    let updatedGameInfo = {}; // 게임 정보 업데이트

    // # 유저가 꽉 찼을 경우 로그인 불가
    if(gameInfo.totalUsers >= gameInfo.maxUsers) {
      _.log('> max users');
      throw new Error(`유저가 꽉찼습니다.\n(최대 ${gameInfo.maxUsers}명)`);
    }

    gi.loginUser({name, socketId: socket.id, socket}); // login
    updatedGameInfo = gi.getGameInfo();
    updateEmitAll(updatedGameInfo, socket); // 브로드캐스트
    if(updatedGameInfo.totalUsers >= gameInfo.maxUsers) { // 게임 시작 시 시작시간 기록
      startTime = new Date().getTime();
      _.log('> lets play : ', startTime);
    }
  } catch(e) {
    _.log('> ERROR : \n', e);
  }
};

// ===== 줄 삭제
listen.clearLines = ({ myInfo, clearLines }, socket) => {
  const now = new Date().getTime();
  const attack = gi.clearLines({ myInfo, clearLines }); // 줄 삭제
  // _.log('> clearLines : ', startTime, now, now - startTime);
  if(now - startTime > 10000) {
    startTime = now;
    gi.speedUp();
  }
  updateEmitAll({ ...gi.getGameInfo(), attack}, socket); // 브로드캐스트
}

// ===== 게임오버
listen.gameOver = ({myInfo}, socket) => {
  gi.gameOver({ myInfo }); // 게임정보 게임오버 처리
  updateEmitAll(gi.getGameInfo(), socket); // 브로드캐스트
}


// ===== 초기화
listen.initialize = (data, socket) => {
  _.log('> initialize')
  gi.initialize();
  updateEmitAll(data, socket, 'initialized');
}


export default socket;