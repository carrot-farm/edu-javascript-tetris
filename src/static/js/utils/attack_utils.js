const fireBallCanvas = document.getElementById('fire-ball');

// ===== 파이어볼 생성
const createFireBall = () => {
  const fireBall =  _.go(L.range(8),
    L.map((i) => (i === 0 ?
      `<div class="fire-ball fire-ball-${i}">
        <div class="fire-ball-right fire-ball-outer-right" />
        <div class="fire-ball-right fire-ball-inner-right" />
      </div>`:
      `<div class="fire-ball fire-ball-${i}" />`
    )),
    _.reduce((a,b) => a + b),
    a => `<div class="fire-ball-wrapper">${a}</div>`,
  )

  return $('#fire-ball-container').html(fireBall);
};


// ===== 지정 좌표 공격
const attack = ({from, to, hit}) => {
  // # 파이어볼 생성
  const fireBalls = _.go(_.range(hit),
    _.map(a => createFireBall()),
  )

  // # 지정좌표에서 날라가기
  gsap.fromTo('.fire-ball',
    from,
    {
      ...to,
      duration: 1,
      stagger: 0.02
  });

  // # 지정좌표 도착시 파이어볼은 사라지고 폭발 파티클

  // # 타겟 흔들림
};


