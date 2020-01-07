const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const canvasNext = document.getElementById('next');
const ctxNext = canvasNext.getContext('2d');
let requestId;
time = {};

// # 점수, 레벨, 삭제 라인 수 정보
let accoutValues = {
  score: 0, // 스코어
  level: 0, // ㅅ피드 레벨
  lines: 0, // 삭제 라인 수
}

// # board 인스턴스 생성
let board  = new Board(ctx, ctxNext);

// # Proxy를 이용해 account 값이 변경될때 마다 엘리먼트 값 변경
let account = new Proxy(accoutValues, {
  set: (target, key, value) => {
    target[key] = value; // 값을 반영
    updateAccount(key, value); // 엘리먼트에 값을 반영
    return true;
  }
});

// # 이벤트 키코드에 따른 좌표 변경.
let moves = {
  [KEY.SPACE]: p => ({ ...p, y: p.y + 1 }),
  [KEY.LEFT]: p => ({ ...p, x: p.x - 1 }),
  [KEY.RIGHT]: p => ({ ...p, x: p.x + 1 }),
  [KEY.DOWN]: p => ({ ...p, y: p.y + 1 }),
  [KEY.UP]: p => board.rotate(p),
};

// ===== 다음 블럭 생성 함수
function initNext() {
  ctxNext.canvas.width = 4 * BLOCK_SIZE;
  ctxNext.canvas.height = 4 * BLOCK_SIZE;
  ctxNext.scale(BLOCK_SIZE, BLOCK_SIZE);
}

// ===== 시작
function play() {
  // console.log('> play')
  // # 키보드 이벤트
  eventListener();

  // # 리셋 게임.
  resetGame();

  // # 시작시간 저장
  time.start = performance.now();

  // # 시작된 게임이 있을 경우 중단 시킨다.
  if(requestId) {
    cancelAnimationFrame(requestId);
  }

  // # 애니메이션
  animate();
}

// ===== 리셋
function resetGame() {
  account.score = 0;
  account.lines = 0;
  account.level = 0;

  // # 보드 정보 리셋
  board.reset();

  // # 시간 초기화
  time = {
    start: 0,
    elapsed: 0,
    level: LEVEL[account.level],
  };
}

// ===== account 정보 업데이트 하기
function updateAccount(key, value) {
  let element = document.getElementById(key);
  if (element) {
    element.textContent = value;
  }
}

// ===== 이벤트 리스터
function eventListener() {
  // console.log('> addEventListener ');
  document.addEventListener('keydown', event => {
    // console.log('> ', event.keyCode);
    if(moves[event.keyCode]) {
      // # 버블링 막기
      event.preventDefault();

      // # 블럭의 좌표 변경
      let p = moves[event.keyCode](board.piece);

      // # space 눌렀을 경우 출돌 전까지 계속 y 좌표 이동
      if(event.keyCode === KEY.SPACE) {
        while(board.valid(p)) {
          account.score += POINTS.HARD_DROP; // 포인트 추가
          board.piece.move(p);
          p = moves[KEY.DOWN](board.piece);
        }

        board.piece.hardDrop();
      }
      // # 일반적인 이동
      else if (board.valid(p)) {
        board.piece.move(p); // 블럭 좌표 변경

        // # 다운 시 스코어 추가
        if (event.keyCode === KEY.DOWN) {
          account.score += POINTS.SOFT_DROP;
        }
      }

      // # 애니메이션
      animate();
    }
  });
}


// ===== 애니메이션
function animate(now = 0) {
  // # 지난 시간 업데이트
  time.elapsed = now - time.start;

  // # 지난시간이 현재 타입 레벨을 초과 했는지 확인.
  if(time.elapsed > time.level) {
    // console.log('> animate : ', time.elapsed)
    time.start = now; // 현재 시간 재 측정
    // 블럭 떨어 뜨리면서 false 리턴 시
    if (!board.drop()) {
      gameOver();
      return;
    }
  }

  // # 랜더링전 블럭 삭제
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // # 보드 렌더링
  board.draw();

  // # 화면이 갱신될 때마다 호출
  requestId = requestAnimationFrame(this.animate.bind(this));
}

// ===== 게임 종료
function gameOver() {
  console.log('> gameOver : ', requestId);
  // # 반복 호출 종료
  cancelAnimationFrame(requestId);

  // # 게임 오버 표시
  ctx.fillStyle = 'black';
  ctx.fillRect(1, 3, 8, 1.2);
  ctx.font = '1px Arial';
  ctx.fillStyle = 'red';
  ctx.fillText('GAME OVER', 1.8, 4);
  // console.log('> gameOver done : ', requestId);
}


// # 다음블럭 초기화
initNext();