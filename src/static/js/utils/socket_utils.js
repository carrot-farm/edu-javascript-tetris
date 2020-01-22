let gameInfo = {};
let myInfo = {
  state: 'ready',
  id: '',
  socketId: '',
  name: '',
  gameOver: false,
  badPieceGuage: 0,
  team: 0,
};
let socket = {};

// ===== socket 초기화
const initSocket = () => {
  socket = io.connect('http://localhost:8080');
  // console.log('> socket start ');

  // # 초기 접속
  socket.on('connect', (...args) => {
    socket.emit('connection');
  });

  // # 접속 종료
  socket.on('disconnect', (msg) => {
    _.log('> disconnect : ', msg)
  })

  // # 정보 업데이트
  socket.on('update', (updatedGameInfo) => {
    updateGameInfo({updatedGameInfo, socketId: socket.id}, socket);
  });

  // # 초기화 완료
  socket.on('initialized', () => {
    location.reload();
  });


  return socket;
};


