
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
    // _.takeAll,
    _.reduce((acc, b) => acc += b),
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
  const explosion = (to, callback) => {
    // return _.log(createParticles(3));
    _.go(L.range(20),
      _.each((i) => {
        const size = rand(3, 10); // 파티클의 크기.(x, y)
        const angle = Math.random() * Math.PI * 2; // 앵글
        const length = Math.random() * (150 / 2 - size / 2); // 파티클 생성 범위
        const speed = 1;
        const gravity = 1;
        const $particle = createParticle(1).children[0];
        // _.log('> angle : ', i, angle, length, $particle)
        // _.log('> angle : ', Math.cos(angle) * length)

        gsap.set($particle, {
          width: size,
          height: size,
          x: to.x,
          y: to.y,
          xPercent: -50,
          yPercent: -50,
          force3D: true,
        })

        gsap.to($particle, {
          duration: 0.5,
          opacity: 0,
          x: to.x + (Math.cos(angle) * length),
          y: to.y + (Math.sin(angle) * length),
          ease: "power4.out",
          onComplete: () => {
            if(i === 19) {
              if(typeof callback === 'function') {
                callback();
              }
            }
          }
        });
      }),
    )
  };


  // ===== 지정 좌표 공격
  const attackFireBall = ({from, to, delay}) => new Promise((resolve) => {

    // # 파이어볼 생성
    const fireBalls = createFireBall(0);
    // _.log('> fireBalls ', fireBalls.children);

    // # 지정좌표에서 날라가기
    gsap.fromTo(fireBalls.children,
      from,
      {
        x: to.x, y: to.y,
        delay: delay * 0.3,
        duration: 1,
        stagger: 0.01,
        ease: 'power3.in',
        onComplete: () => {
          // _.log('> onComplete : ');
          gsap.to(fireBalls.children,{
            duration: 0.1,
            opacity: 0,
          })

          // # 타겟 흔들림.
          shake(to.el);

          // # 지정좌표 도착시 파이어볼은 사라지고 폭발 파티클
          explosion({x: to.x + 7, y: to.y + 7 }, () => {
            resolve();
          });
        }
      }
    );
  });



  // ===== 지정 좌표 공격
  const attack = ({from, to, hit, shakeTargetEl}) => new Promise((resolve) => {
    _.go(L.range(hit),
      C.map( i => attackFireBall({from, to, delay: i})),
      a => resolve(a)
    )
  });


  return {
    attack
  }
})(window, gsap)




