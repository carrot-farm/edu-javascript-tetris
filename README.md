# 테트리스 만들기

## 프로젝트 구조
```javascript
─ constants.js  // 게임 설정과 규칙 정의.
└ board.js // 보드 로직
└ piece.js // 테트리스 조각 로직 파일
└ main.js // 게임 초기화와 종료 로직
└ index.html
└ styles.css // 스타일 정의
```

## 보드 구조
. 2차원 배열 구조.
. 숫자를 이용해 블록 표현.
   * 비어있는 셀 : 0
   * 채워져 있는 셀 : 1 ~ 7

