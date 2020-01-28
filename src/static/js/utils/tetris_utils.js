// ===== login page 메소드
const loginPage = {};
loginPage.root = {};

loginPage.init = (socket) => {
  loginPage.root = $('#login-page');
  loginPage.addEventLIstener(socket);
  loginPage.root.find('input').focus();
  degubEventListener(socket);
};
loginPage.addEventLIstener = (socket) => {
  const $root = loginPage.root;
  loginPage.root.find('form').off('submit').on('submit', (e) => {
    e.preventDefault();
    const name = $root.find('[name=name]').val();
    // return _.log('> login ', name, socket);
    socket.emit('loginUser', { name });
  });
}

// ===== 페이지별 렌더링 데이터
const render = {};

// ===== 로그인 페이지 렌더링
render['login'] = ({ updatedGameInfo, oldGameInfo, updatedMyInfo }, socket) => {
  const $root = document.getElementById('login-page');
  $root.querySelector('[name=name]').value = '';
  loginPage.init(socket);
  changePage(updatedMyInfo.state);
};


// ===== 대기 페이지 렌더링
render['progress'] = ({ updatedGameInfo, oldGameInfo, updatedMyInfo }) => {
  const $root = document.getElementById('progress-page');
  // _.log('> progress : ', updatedGameInfo)
  // console.log('> render progress : ', $root.querySelector('.input-name'))
  $root.querySelector('.current-users').textContent = updatedGameInfo.totalUsers;
  $root.querySelector('.max-users').textContent = updatedGameInfo.maxUsers;
  changePage(updatedMyInfo.state);
};


// ===== play 페이지 랜더링
render['play'] = ({ updatedGameInfo, oldGameInfo, updatedMyInfo, oldMyInfo }) => {
  const { state } = updatedGameInfo;
  const myTeamsNum = updatedMyInfo.team;
  const enemiesNum = myTeamsNum === 0 ? 1: 0;
  const oldEnemies = oldGameInfo && oldGameInfo.teams && oldGameInfo.teams[enemiesNum];
  const myTeams = updatedGameInfo.teams[myTeamsNum];

  _.log('> play : ', updatedMyInfo);
  // # speed up


  render['enemies']({
    updatedEnemies: updatedGameInfo.teams[enemiesNum],
    oldEnemies,
  });
  render['myTeams']({myTeams, socketId: updatedMyInfo.socketId});
  render['myInfo']({updatedGameInfo, updatedMyInfo, oldMyInfo});
  changePage(updatedMyInfo.state);
};


// ===== winnner
render['win'] = ({updatedMyInfo}) => {
  changeMainText("WINNER");
  changePage('game-over');
}

// ===== gameOver
render['gameOver'] = ({updatedMyInfo}) => {
  changeMainText("LOSER");
  changePage('game-over');
}


// ===== enemies 섹션 랜더링
render['enemies'] = ({updatedEnemies, oldEnemies}) => {
  const $root = document.getElementById('enemies-container');

  // # 에너미 랜더링
  $root.innerHTML = updatedEnemies.length <= 1
    ? usersInfoRender('enemy', updatedEnemies[0])
    : _.go(updatedEnemies,
      _.reduce( (acc, e) => (
        (typeof acc === 'string' ? acc : usersInfoRender('enemy', acc))
          + (e? usersInfoRender('enemy', e): '')
        )
      ),
    );
};

// ===== my team 랜더링
render['myTeams'] = ({myTeams, socketId}) => {
  const $root = document.getElementById('my-teams-container');
  // console.log('> myTeams', myTeams, socketId);
  if(myTeams.length <= 1) {return '';}

  let result = _.go(myTeams,
    _.filter(a => a.socketId != socketId),
    _.reduce( (acc, e) => (
        (typeof acc === 'string' ? acc : usersInfoRender('myTeam', acc))
          + usersInfoRender('myTeam', e)
      )
    ),
  );

  // # 아군이 1명일 때
  if(typeof result === 'object' && !result.length) {
    // console.log('> one', result);
    result = usersInfoRender('myTeam', result);
  }

  // console.log('> myTeams', result, typeof result);
  $root.innerHTML = result ? result : '';
};

// ===== my info 랜더링
render['myInfo'] = ({updatedGameInfo, updatedMyInfo, oldMyInfo}) => {
  const $root = document.getElementById('my-info-container');
  $root.querySelector('#myName').textContent = updatedMyInfo.name;
  $root.querySelector('#level').textContent = updatedGameInfo.level;
  // _.log('> myInfo : ', updatedGameInfo )

  // # update bad piece guage
  if(updatedMyInfo.badPieceGuage != oldMyInfo.badPieceGuage) {
    changeBadPiece({
      selector: '.my-bad-piece-guage',
      guage: updatedMyInfo.badPieceGuage
    });
  }

  // # 방해 블럭 생성
  if(oldMyInfo.badPieceGuage > updatedMyInfo.badPieceGuage) {
    board.createBadPiece();
  }

  // # 공격을 받았을 때 흔들림
  if(oldMyInfo.badPieceGuage > 0 && updatedMyInfo.badPieceGuage !== oldMyInfo.badPieceGuage) {
    shake('.game-board');
  }
};

// ===== 랜더링 컴포넌트
function usersInfoRender(userType, userInfo) {
  // _.log('> ',data.gameOver)
  return (`
    <div class="${userType}-container ${userType}-${userInfo.socketId} user-info-container">
      <div class="${userType}-name name">${userInfo.name}</div>
      <div class="bad-piece-guage-container">
        <div class="bad-piece-guage ${userType === 'enemy'?'red':''}" style="transform:scaleX(${userInfo.badPieceGuage/10});"></div>
      </div>
      <div class="game-over-container ${userInfo.state === 'gameOver' ? '': 'hide'}">
        <div class="bg"></div>
        <div class="text">GAME<br/>OVER</div>
      </div>
    </div>
  `);
};

// ===== bad piece bar 변경
function changeBadPiece({selector, guage}) {
  // _.log("> ", selector,guage, document.querySelector(selector))
  document.querySelector(selector).style.transform = `scaleX(${guage/10})`;
}


// ===== 게임 페이지를 변경한다.
function changePage(pageName) {
  $('.page').each((idx, el) => {
    const $el = $(el);
    if(`${pageName}-page` === el.id) {
      _.log('> changePage : ', pageName, el.id)
      setTimeout(() => $el.removeClass('hide'), 1);
    } else {
      $el.addClass('hide');
    }
  });
}

// ===== 나의 정보 셋팅
function setMyInfo(_myInfo) {
  myInfo = _myInfo;
}


// ===== 메인 텍스트 변경
function changeMainText(text) {
  $('#main-text').text(text);
}


// ===== 업데이트 게임정보
function updateGameInfo({ updatedGameInfo, socketId }, socket) {
  // _.log('> updateGameInfo : \n', socketId, updatedGameInfo);
  const updatedMyInfo = updatedGameInfo.users[socketId];
  const oldMyInfo = {...myInfo};
  const oldGameInfo = {...gameInfo};
  const myTeamsNum = updatedMyInfo.team;
  const enemiesNum = myTeamsNum === 0 ? 1: 0;
  const updatedEnemies = updatedGameInfo.teams[enemiesNum];
  const oldEnemies = oldGameInfo && oldGameInfo.teams && oldGameInfo.teams[enemiesNum];
  const myTeams = updatedGameInfo.teams[myTeamsNum];
  const updateData = {
    updatedGameInfo,
    oldGameInfo,
    updatedMyInfo,
    oldMyInfo,
  };

  // _.log('> updateGameInfo : \n', updatedGameInfo);
  // # 페이지 전환
  if(oldMyInfo.state !== updatedMyInfo.state) {
    // _.log('> change page');
    render[updatedMyInfo.state](updateData, socket);

    // # play
    if(updatedMyInfo.state === 'play') {
      // _.log('> lets play!!');
      play();
    }
  }


  if(updatedMyInfo.state === 'progress') {
    render[updatedMyInfo.state](updateData, socket);
  }else if(updatedMyInfo.state === 'play') {
    render.enemies({updatedEnemies, oldEnemies}); // 적 랜더링
    render.myTeams({myTeams, socketId}); // 우리 팀 렌더링
    render.myInfo({updatedGameInfo, updatedMyInfo, oldMyInfo}); // 나의 정보 렌더링

    // # 공격
    if(updatedGameInfo.attack) {
      // _.log("> attack : ", updatedGameInfo.attack)
      // # 공격시
      if(updatedMyInfo.socketId === updatedGameInfo.attack.from.socketId) {
        attackEnemy({ targetId: `.enemy-${updatedGameInfo.attack.to.socketId}`, hit: updatedGameInfo.attack.hit })
      }
      // # 공격 받을 시
      else if(updatedMyInfo.socketId === updatedGameInfo.attack.to.socketId) {
        attackMe({ enemyId: `.enemy-${updatedGameInfo.attack.from.socketId}`, hit: updatedGameInfo.attack.hit })
      }
      delete updatedGameInfo.attack; // 삭제
    }

    // # 게임 스피드 변경.
    if(updatedGameInfo.level !== oldGameInfo.level) {
      board.changeSpeed(updatedGameInfo.level);
    }
  }


  // # 최신 정보 업데이트
  gameInfo = {...gameInfo, ...updatedGameInfo};
  myInfo = {...myInfo, ...updatedMyInfo};
}


// ===== 적이 나를 공경
function attackMe({ enemyId, hit }) {
  const $enemyEl = document.querySelector(enemyId);
  const $boardEl = document.querySelector('#my-info-detail');
  const enemyInfo = $enemyEl.getBoundingClientRect();
  const boardInfo = $boardEl.getBoundingClientRect();

  // # 파이어볼
  fireBall.attack({
    from: {
      x: enemyInfo.x + (enemyInfo.width / 2) - 7 ,
      y: enemyInfo.y + (enemyInfo.height / 2),
    },
    to: {
      x: (window.innerWidth / 2) + 140,
      y: boardInfo.y + 190,
      el: $boardEl
    },
    hit: hit
  });
}


// ===== 적측 공격
function attackEnemy({ targetId , hit }) {
  const $targetEl = document.querySelector(targetId);
  const $boardEl = document.querySelector('#board');
  const targetInfo = $targetEl.getBoundingClientRect();
  const boardInfo = $boardEl.getBoundingClientRect();

  // _.log('> attackEnemy : ', targetInfo);

  // # 파이어볼
  fireBall.attack({
    from: {
      x: (window.innerWidth / 2) - 100,
      y: boardInfo.y + boardInfo.height - 20},
    to: {
      x: targetInfo.x + (targetInfo.width / 2) - 7 ,
      y: targetInfo.y + (targetInfo.height / 2),
      el: $targetEl
    },
    hit: hit
  });
}


// ===== 지정된 엘리먼트 흔들기
function setGameState(state) {
  gameState = state;
}


// ===== 지정된 엘리먼트 흔들기
function shake(elName) {
  gsap.to(elName, 0.1, {x:"+=10", yoyo:true, repeat:3 })
}


// ===== 팀 정보에서 나의 정보 찾기
const findMyInfo = ({gameInfo, myId}) => {
  const aTeam = _.go(gameInfo.teams[0],
      _.filter(a => a.id === myId)
    );
  const bTeam = _.go(gameInfo.teams[1],
      _.filter(a => a.id === myId)
    );
  // console.log('> b : ', aTeam, bTeam);
  return [...aTeam, ...bTeam];
}


// ===== 초기화
const initialize = () => {
  socket.emit('initialize');
};

// ===== 클라이언트에서 설정
const cheatUpdateGameInfo = (_gameInfo = {}) => {
  socket.emit('cheatUpdateGameInfo', _gameInfo);
};


// ===== 디버그 패널 이벤트 바인딩
function degubEventListener(socket) {
  const $root = $('#debug-pannel');

  // # 초기화 버튼 클릭
  $root.find('.initialize').off('click').on('click', () => {
    socket.emit('initialize');
  });

  // # 더미 데이터 셋팅
  $root.find('.setDummy').off('click').on('click', () => {
    socket.emit('setDummy');
  });

  // # 배드 블럭 생성
  $root.find('.create-bad-piece').off('click').on('click', () => {
    board.createBadPiece();
  });

  // # 공격
  $root.find('.attack').off('click').on('click', () => {
    socket.emit('clearLines',{ myInfo, clearLines: 1 });
  });
}
