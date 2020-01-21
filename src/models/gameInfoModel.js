const gameInfoModel = {
  gameState: 'ready',
  totalUsers: 0,
  maxUsers: 2,
  level: 2,
  teams: {
    0: [],
    1: []
  },
  users: {},
};
Object.freeze(gameInfoModel);

export default gameInfoModel;