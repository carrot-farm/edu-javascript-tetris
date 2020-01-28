class Board {
  ctx; // 현재 board
  ctxNext; // 다음 canvas 객체
  grid; // 전체 보드
  piece; // 블록 객체
  next; // 오른쪽에 보여질 다음 블록
  requestId;
  time;

  constructor(ctx, ctxNext) {
    this.ctx = ctx;
    this.ctxNext = ctxNext;
    this.init();
  }

  // ===== 초기화
  init() {
    // ===== 상수를 사용해 캔버스의 크기를 계산
    this.ctx.canvas.width = COLS * BLOCK_SIZE;
    this.ctx.canvas.height = ROWS * BLOCK_SIZE;

    // ===== 블록 크기 정의.
    this.ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
  }

  // ===== 리셋
  reset() {
    // # 배열을 받는다.
    this.grid = this.getEmptyBoard();

    // # 블럭생성
    this.piece = new Piece(this.ctx);

    // # 블럭의 초기 위치 설정
    this.piece.setStartingPosition();

    // # 다음 블럭 생성
    this.getNewPiece();
  }

  // ===== 새로운 블럭 생성
  getNewPiece() {
    // # 다음 블럭 생성
    this.next = new Piece(this.ctxNext);

    // # 다음 블럭 전 생성 지우기
    this.ctxNext.clearRect(
      0,
      0,
      this.ctxNext.canvas.width,
      this.ctxNext.canvas.height,
    );

    // # 블럭 렌더링
    this.next.draw();
  }

  // ===== 블럭과 보드 그리그
  draw() {
    this.piece.draw();
    this.drawBoard();
  }

  // ===== 블럭 아래로 떨어 뜨리기
  drop() {
    let p = moves[KEY.DOWN](this.piece); // 한칸 아래 좌표

    // # 유효 객체는 움직이기
    if (this.valid(p)) {
      this.piece.move(p);
    }
    // # 유효하지 않은 객체
    else {
      this.freeze(); // board에 채워 넣기
      this.clearLines(); // 곽찬 줄이 있으면 지우기
      // console.log('> freeze');
      // # gameover
      if(this.piece.y === 0) {
        return false;
      }
      // # next 블럭을 현재 블럭으로 전환 후 위치 재 지정.
      this.piece = this.next;
      this.piece.ctx = this.ctx;
      this.piece.setStartingPosition();
      this.getNewPiece(); // 다음 대기열 블럭 생성
    }

    return true;
  }

  // ===== 방해 블럭 생성
  createBadPiece() {
    const voidNum = Math.floor(Math.random() * 10); // 방해 블럭 중 하나가 빠질 공간
    const badPieces = _.go(_.range(10),
      L.entries,
      _.takeAll,
      _.map(([idx, a]) => (idx == voidNum ? 0 : 8 ) ),
      _.tap(_.log),
    )
    // _.log('> createBadPiece : ');

    this.grid.shift();
    this.grid.push(badPieces);
    // _.log('> grid : ', this.grid);
  }

  // ===== 꽉찬 줄 지우기
  clearLines() {

    let lines = 0; // 삭제한 라인의 수

    // # 전체 보드 순회
    this.grid.forEach((row, y) => {

      // # row의 값이 전부 0 보다 클 경우.
      if(row.every(value => value > 0)) {
        lines++;

        // # 꽉찬 줄을 지운다.
        this.grid.splice(y, 1);

        // # 새로운 줄을 생성한다.
        this.grid.unshift(Array(COLS).fill(0));
      }
    });

    // # 삭제된 라인이 있을 경우
    if(lines > 0) {
      // # 삭제된 라인이 있다면 점수 추가
      account.score += this.getLinesClearedPoints(lines);
      account.lines += lines; // 삭제 라인 추가

      // 삭제 라인 수가 다음 레벨에 도달 했을 경우.
      if(account.lines >= LINES_PER_LEVEL) {
        this.levelUp(); // 레벨 업
      }

      // # socket
      socket.emit('clearLines',{ myInfo, clearLines: lines });
    }
  }

  // ===== 레벨 업
  levelUp() {
    // console.log('> 스피드 레벨 업');
    // account.level++; // 레벨업

    // // # 라인 수 빼기
    // account.lines -= LINES_PER_LEVEL;

    // // # 스피드 업
    // time.level = LEVEL[account.level];
  }

  // ===== changeSeppd
  changeSpeed(speed) {
    account.level = speed; // 레벨업

    // # 스피드 업
    time.level = LEVEL[account.level];
    _.log('> changeSpeed', speed)
  }

  // ===== 라인 삭제 시 포인트
  getLinesClearedPoints(lines, level) {
    const lineClearPoints =
      lines === 1 ? POINTS.SINGLE :
      lines === 2 ? POINTS.DOUBLE :
      lines === 3 ? POINTS.TRIPLE :
      lines === 4 ? POINTS.TETRIS :
      0;

    // return (account.level + 1) * lineClearPoints;
    return (account.level + 1) * lineClearPoints;
  }

  // ===== 보드 그리기
  drawBoard() {
    this.grid.forEach((row, y) => {
      row.forEach((value, x) => {
        if(value > 0) {
          this.ctx.fillStyle = COLORS[value];
          this.ctx.fillRect(x, y, 1, 1);
        }
      })
    })
  }

  // ===== 0으로 채워진 2차원 배열 반환
  getEmptyBoard() {
    return Array.from (
      {length: ROWS}, () => Array(COLS).fill(0)
    )
  }

  // ===== 블럭의 충돌 검사. 충돌 시 false
  valid(p) {
    return p.shape.every((row, dy) => {
      return row.every((value, dx) => {
        let x = p.x + dx;
        let y = p.y + dy;

        // # 충돌하는 항목을 검사
        return (
          value === 0 ||
          (this.insideWalls(x) && this.aboveFloor(y) && this.notOccupied(x, y))
        )
      })
    })
  }

  // ===== 블럭 고정(board 에 블럭을 채워 넣는다.)
  freeze() {
    this.piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.grid[y + this.piece.y][x + this.piece.x] = value;
        }
      });
    });
  }

  // ===== x 좌표가 보드의 내부인지 검사
  insideWalls(x) {
    return x >= 0 && x < COLS;
  }

  // ===== y 좌표가 보드의 내부인지 검사
  aboveFloor(y) {
    return y < ROWS;
  }

  // ===== bord가 채워져 있는 곳인지 업사
  notOccupied(x, y) {
    return this.grid[y] && this.grid[y][x] === 0;
  }

  // ===== 시계 방향 회전
  rotate(piece, direction) {
    // # 깊은 복사를 위해 stringify로 변환 복사.
    let p = JSON.parse(JSON.stringify(piece));

    if(!p.hardDroped) {
      // # 행렬 변환
      for( let y = 0; y < p.shape.length ; ++y) {
        for( let x = 0; x < y; ++x) {
          [p.shape[x][y], p.shape[y][x]] = [p.shape[y][x], p.shape[x][y]];
        }
      }

      // # 시계방향을 기준으로 열 순서대로 변경
      p.shape.forEach(row => row.reverse());
    }

    // console.log('> rotate : ', p.shape, piece.shape)
    return p;
  }


}



// play();
