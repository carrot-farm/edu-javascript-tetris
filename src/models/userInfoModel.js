const userInfoModel = { // 유저 모델
  id: '',
  socketId :'',
  state: 'ready', // ready, login, progress, play, win, loser
  name: '',
  team: undefined,
  badPieceGuage: 0,
  gameOver: false,
};
Object.freeze(userInfoModel);

export default userInfoModel;