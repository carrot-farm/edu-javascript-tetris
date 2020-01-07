class Piece {
  x; // x 위치 좌표
  y; // y 위치 좌료
  color; // 색상
  shape; // 2차원 배열로된 블럭의 모양 좌표들
  ctx; // canvas 객체
  typeid; // 블럭의 typeid
  hardDropped; // 바닥에 닿아서 움직이지 못하게 되었을 때


  constructor(ctx) {
    this.ctx = ctx;
    this.spawn();
  }

  // ===== 피스 모양
  spawn() {
    // console.log('> ',typeId, this.color,this.shape)
    // # 랜덤 타입 결정
    this.typeId = this.randomizeTetrominoType(COLORS.length - 1);

    // # 모양
    this.shape = SHAPES[this.typeId];

    // # 색상
    this.color = COLORS[this.typeId];

    // # 좌표
    this.x = 0;
    this.y = 0;

    // # hardDrop
    this.hardDropped = false;
  }

  // ===== 블록을 그린다.
  draw() {
    this.ctx.fillStyle = this.color;
    // # shape 안에 있는 블록 좌표에 x, y를 더한다. 보드에서 블록의 좌표는 this.x + x 가 된다.
    this.shape.forEach((row, y) => {
      // # 셀값이 0보다 크다면 블록을 칠한다.
      row.forEach((value, x) => {
        if(value > 0) {
          this.ctx.fillRect(this.x + x, this.y + y, 1, 1);
        }
      })
    })
  }

  // ===== 블럭 좌표 이동
  move(p) {
    // console.log('> move() : ', p.x, p.y)
    // # 움직일 수 있는 것들만 이동
    if(!this.hardDropped) {
      this.x = p.x;
      this.y = p.y;
    }
    this.shape = p.shape;
  }

  // ===== hardDrop로 지정.
  hardDrop() {
    this.hardDropped = true;
  }

  // ===== 시작 포지션 설정(2칸 짜리 구문)
  setStartingPosition() {
    this.x = this.typeId === 4 ? 4 : 3;
  }


  // ===== 램덤 블럭 결정
  randomizeTetrominoType(noOfTypes) {
    return Math.floor(Math.random() * noOfTypes + 1);
  }

}