
var PI  = Math.PI;
var TAU = PI * 2;
var toRad = PI / 180;
var toDeg = 180 / PI;

var vw = window.innerWidth;
var vh = window.innerHeight;

var pointer, missile;

function init() {

  var element = document.querySelector("#missile");

  var x = vw / 2;
  var y = vh + 200;

  pointer = {
    x: x,
    y: vh / 2
  };

  missile = {
    element: element,
    isDirty: true,
    rotation: 0,
    speed: 10,
    turn: 5,
    x: x,
    y: y
  };

  TweenLite.set(element, {
    autoAlpha: 1,
    scale: 0.8,
    xPercent: -50,
    yPercent: -50,
    x: x,
    y: y
  });

  TweenMax.to(element, 1, {
    x: "+=1",
    y: "+=1",
    rotation: "+=1",
    repeat: -1,
    modifiers: {
      x: function() {
        if (missile.isDirty) updateMissile();
        return missile.x;
      },
      y: function() {
        if (missile.isDirty) updateMissile();
        return missile.y;
      },
      rotation: function() {
        if (missile.isDirty) updateMissile();
        return missile.rotation * toDeg + 90;
      }
    },
    onUpdate: function() {
      missile.isDirty = true;
    }
  });

  window.addEventListener("mousemove", moveAction);
}

function updateMissile() {

  var x2 = pointer.x;
  var y2 = pointer.y;
  var x1 = missile.x;
  var y1 = missile.y;

  var angle = Math.atan2(y2 - y1, x2 - x1);
  var theta = 0;

  if (missile.rotation !== angle) {

    var turn  = missile.turn * toRad;
    var delta = angle - missile.rotation;

    if (delta >  PI) delta -= TAU;
    if (delta < -PI) delta += TAU;

    theta = delta > 0 ? turn : -turn;

    missile.rotation += theta;

    if (Math.abs(delta) < turn) {
      missile.rotation = angle;
    }
  }

  missile.x += Math.cos(missile.rotation) * missile.speed;
  missile.y += Math.sin(missile.rotation) * missile.speed;

  missile.isDirty = false;
}

function moveAction(event) {
  pointer.x = event.x;
  pointer.y = event.y;
}

window.onload = init;

