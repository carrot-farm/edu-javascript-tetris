const gameInfoModel = {
  gameState: 'ready',
  totalUsers: 0,
  maxUsers: 4,
  level: 0,
  teams: {
    0: [],
    1: []
  },
  users: {},
};
Object.freeze(gameInfoModel);

export default gameInfoModel;
