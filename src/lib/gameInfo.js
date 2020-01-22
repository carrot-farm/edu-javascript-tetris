import _, { update } from 'fxjs/Strict';
import L from 'fxjs/Lazy';

import userInfoModel from '../models/userInfoModel';
import gameInfoModel from '../models/gameInfoModel';
import { rand } from '../utils/mathUtils';

const gi = (function() {
  let gameInfo = { // 현재 게임 정보
    ...gameInfoModel
  };
  let setTimeoutId; // speed up에 사용될 setTimeout id


  // ===== 게임 정보 가져오기
  const getGameInfo  = () => ({ ...gameInfo });

  // ===== 게임 정보 업데이트
  const updateGameInfo  = (updatedGameInfo) => {
    gameInfo = { ...gameInfo, ...updatedGameInfo };
  }

  // ===== 유저 추가
  const addUser = (socketId) => {
    gameInfo.users[socketId] = {
      ...userInfoModel, socketId,
    };
  };


  // ===== 유저 삭제
  const removeUser = (socketId) => {
    const user = gameInfo.users[socketId];
    let teams = gameInfo.teams[user.team];
    if(teams) { // 팀정보 삭제
      gameInfo.teams[user.team] = _.filter(a => (a.socketId !== socketId), teams);
    }
    delete gameInfo.users[socketId]; // 유저 정보 삭제

    --gameInfo.totalUsers;// 전체 유저 수 감소
    if(gameInfo.totalUsers < 0) {gameInfo.totalUsers = 0;}
  };


  // ===== 유저 정보 업데이트
  const updateUser = (socketId, updateData = {}) => {
    gameInfo.users[socketId] = {
      ...gameInfo.users[socketId],
      ...updateData
    };
  };


  // ===== 로그인
  const loginUser = ({name, socketId, socket}) => {
    gameInfo.totalUsers  = gameInfo.totalUsers < 0 ? 0: gameInfo.totalUsers;
    const team = gameInfo.totalUsers % 2;
    const userInfo = gameInfo.users[socketId];

    userInfo.team = team;
    userInfo.name = name;
    // _.log('> loginUser : ', gameInfo.totalUsers, team)

    // # 전체 유저 수 증가
    ++gameInfo.totalUsers;

    // # 방이 다 찼으면 play 아닐경우 progress
    gameInfo.users[socketId].state = (gameInfo.totalUsers === gameInfo.maxUsers) ? 'play' : 'progress';

    // # 유저 생성
    gameInfo.teams[team].push(gameInfo.users[socketId]);

    // # 유저가 다 찼을 경우 전부 play
    if(gameInfo.totalUsers >= gameInfo.maxUsers) {
      _.go(gameInfo.users,
        L.entries,
        _.each(([k, v]) => {
          v.state = 'play';
        }),
        _.map(([k, v]) => ({ [k]: v }))
      );
    }
  };


  // ===== 줄 삭제
  const clearLines = ({ myInfo, clearLines }) => {
    const enemyTeamNum = myInfo.team === 0 ? 1 : 0;
    const enemies = gameInfo.teams[enemyTeamNum];
    const liveEmemies = _.filter((a) => !a.gameOver, enemies); // gameOver 당하지 않고 살아 남아서 플레이 중인 적들
    const randNum = rand(0, liveEmemies.length - 1); // 랜덤한 적 선택
    const randomEnemy = gameInfo.teams[enemyTeamNum][randNum];

    // _.log('> clearLines : ', randNum, randomEnemy);
    gameInfo.teams[enemyTeamNum][randNum].badPieceGuage += clearLines;

    // # 게이지가 10일 넘을 경우
    if(gameInfo.teams[enemyTeamNum][randNum].badPieceGuage > 10) {
      gameInfo.teams[enemyTeamNum][randNum].badPieceGuage -= 10;
    }

    return {
      from: myInfo,
      to: randomEnemy,
      crash: clearLines
    };
  };

  const speedUp = () => {
    gameInfo.level++;
  };

  // ===== 게임 오버
  const gameOver = ({ myInfo }) => {
    const myTeam = gameInfo.teams[myInfo.team];
    const enemies = gameInfo.teams[myInfo.team === 0?1:0];
    let gameOverUsers = 0;

    // # 게임오버 유저 처리
    gameInfo.users[myInfo.socketId].state = 'gameOver';

    // # 전체 게임오버 했는지 확인
    _.go(myTeam,
      _.each(a => {
        if(a.state === 'gameOver') { ++gameOverUsers;}
      })
    );

    // _.log("> gameOver : ", myTeam.length, enemies)
    // # 우리팀 전원이 패배 했을 경우 상대팀 승리 처리
    if(myTeam.length === gameOverUsers) {
      _.go(enemies,
        _.each(a => a.state = 'win'));
      initialize(); // 초기화
    }
  };


  // ===== 초기화
  const initialize = () => {
    gameInfo = { // 현재 게임 정보
      ...gameInfoModel
    };
  };


  // ===== 리턴 데이터
  return {
    getGameInfo,
    updateGameInfo,
    addUser,
    removeUser,
    updateUser,
    loginUser,
    clearLines,
    speedUp,
    gameOver,
    initialize,
  };
})();

// ===== export
export default gi;
