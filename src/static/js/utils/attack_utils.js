
const fireBall = ((window, gsap) => {
  const fireBallCanvas = document.getElementById('fire-ball');
  const container = document.getElementById('fire-ball-container');


  // ===== 엘리먼트 생성
  const el = (html) => {
    const wrap = document.createElement("div");
    wrap.innerHTML = html;
    // return wrap.children[0];
    return wrap
  };


  // ===== 엘리먼트 여러개 생성
  const els = (f, count) => _.go(L.range(count),
    L.map(f),
    _.takeAll,
    _.tap(_.log),
    _.reduce((acc, b) => acc += b),
    _.tap(_.log),
    el
  )


  // ===== 파이어볼 생성
  const createFireBall = (num) => {
    const fbs = els((
      (i) => (i === 0
        ? `<div class="fire-ball fire-ball-num-${num} fire-ball-${i}">
            <div class="fire-ball-right fire-ball-outer-right"></div>
            <div class="fire-ball-right fire-ball-inner-right"></div>
          </div>`
        : `<div class="fire-ball fire-ball-num-${num} fire-ball-${i}"></div>`
      )
    ), 8);
    // _.log('> ', fb)
    container.appendChild(fbs);
    return fbs
  };


  // ===== 파티클 생성
  const createParticle = (createNum) => {
    const particles = el(
      `<div class="fire-ball-dot fire-ball-dot-num-${createNum} "></div>`
    );

    container.appendChild(particles);
    return particles;
  };


  // ===== 폭발
  const explosion = () => {
    // return _.log(createParticles(3));
    _.go(L.range(20),
      _.each((i) => {
        const size = rand(8, 20); // 파티클의 크기.(x, y)
        const angle = Math.random() * Math.PI * 2; // 앵글
        const length = Math.random() * (300 / 2 - size / 2); // 파티클 생성 범위
        const speed = 1;
        const gravity = 1;
        const $particle = createParticle(1);
        _.log('> angle : ', i, angle, length, $particle)
        return;

        gsap.set($particle, {
          width: size,
          height: size,
          x: Math.cos(angle) * length,
          y: Math.sin(angle) * length,
          // backgroundColor: '#ff9547',
          // scale: ''
          // x: Math.cos(angle) * length,
          // y: Math.sin(angle) * length,
          // xPercent: -50,
          // yPercent: -50,
          // force3D: true,
        })

        // let tween = gsap.to($particle, {
        //   duration: 2,
        //   opacity: 0,
        //   physics2D: {
        //     velocity: "random(200, 650)",
        //     angle: "random(250, 290)",
        //     gravity: 500
        //   },
        //   delay: "random(0, 2.5)"
        // });

      }),
    )
  };


  // ===== 지정 좌표 공격
  const attack = ({from, to, hit}) => {
    // # 파이어볼 생성
    const fireBalls = createFireBall(0);

    _.log('> fireBalls ', fireBalls.children);

    // # 지정좌표에서 날라가기
    gsap.fromTo(fireBalls.children,
      from,
      {
        ...to,
        duration: 1,
        stagger: 0.02,
        onComplete: () => {
          // fireBalls.remove();
          _.log('> onComplete : ');
          explosion()
        }
      },
    );

    // # 지정좌표 도착시 파이어볼은 사라지고 폭발 파티클

    // # 타겟 흔들림
  };


  return {
    attack
  }
})(window, gsap)




