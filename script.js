const CUBE = document.getElementById("cube");
let mouseClicked = false;

class EasedValue {
  static instances = [];
  static ease(speed) {
    EasedValue.instances.forEach((instance) => instance.ease(speed));
  }
  constructor(easing, refObj, refKey) {
    this.eased = refObj[refKey];
    this.easing = easing;
    this.refKey = refKey;
    this.refObj = refObj;
    EasedValue.instances.push(this);
  }

  ease(speed) {
    const { eased, easing, refKey, refObj } = this;
    this.eased += (refObj[refKey] - eased) * easing * speed;
  }

  snap() {
    const { refKey, refObj } = this;
    this.eased = refObj[refKey];
  }
}

const DURATION_MULTIPLIER = 1 / (1000 / 60);

let ORBIT_TIMEOUT;

const cursor = {
  x: innerWidth * 0.5,
  y: innerHeight * 0.5,
  rotX: 0,
  rotY: 0,
};

const ORBIT_X = new EasedValue(0.05, cursor, "rotX");
const ORBIT_Y = new EasedValue(0.05, cursor, "rotY");

addEventListener("mousemove", (e) => {
  if (mouseClicked) {
    const deltaX = e.clientX - cursor.x;
    const deltaY = e.clientY - cursor.y;
    cursor.rotY += deltaX;
    cursor.rotX += deltaY;
  }

  cursor.x = e.clientX;
  cursor.y = e.clientY;
});

addEventListener("mousedown", () => {
  mouseClicked = true;
  ORBIT_X.easing = 0.25;
  ORBIT_Y.easing = 0.25;
  if (ORBIT_TIMEOUT) {
    // Check if a timeout is currently set
    clearTimeout(ORBIT_TIMEOUT);
  }
});

addEventListener("mouseup", () => {
  mouseClicked = false;
  // ORBIT_TIMEOUT = setTimeout(() => {
  //   ORBIT_X.easing = 0.05;
  //   ORBIT_Y.easing = 0.05;
  //   cursor.rotX = 0;
  //   cursor.rotY = 0;
  // }, 750);
});

const PRESSING = {};

const KEYS = new Map([
  ["ArrowUp", "UP"],
  ["ArrowRight", "RIGHT"],
  ["ArrowDown", "DOWN"],
  ["ArrowLeft", "LEFT"],
]);

addEventListener("keydown", (e) => (PRESSING[KEYS.get(e.key)] = true));
addEventListener("keyup", (e) => (PRESSING[KEYS.get(e.key)] = false));

const positionPlayer = () => {
  if ((PRESSING.LEFT || PRESSING.RIGHT) && !(PRESSING.LEFT && PRESSING.RIGHT)) {
    if (PRESSING.LEFT) {
      PLAYER.x -= 1;
    } else {
      PLAYER.x += 1;
    }
  }
  if ((PRESSING.UP || PRESSING.DOWN) && !(PRESSING.UP && PRESSING.DOWN)) {
    if (PRESSING.UP) {
      PLAYER.y -= 1;
    } else {
      PLAYER.y += 1;
    }
  }

  PLAYER.place();
};

const PEEK = {
  x: 0,
  y: 0,
};

const PEEK_X = new EasedValue(0.075, PEEK, "x");
const PEEK_Y = new EasedValue(0.075, PEEK, "y");

const MAX_TILT = 45;

const resolvePeekY = () => {
  const percX = (PLAYER.x + PLAYER.w * 0.5 - 256) / 256;
  PEEK.y = Math.sign(percX * -1) * Math.pow(Math.abs(percX), 4) * MAX_TILT;
};

const resolvePeekX = () => {
  const percY = (PLAYER.y + PLAYER.h * 0.5 - 256) / 256;
  PEEK.x = Math.sign(percY) * Math.pow(Math.abs(percY), 3) * MAX_TILT;
};

const PLAYER = {
  element: document.getElementById("player"),
  x: 256,
  y: 256,
  w: 16,
  h: 32,

  get midX() {
    return this.x + this.w * 0.5;
  },

  //

  place() {
    const xOffset = Math.floor(this.x / 512);
    const yOffset = Math.floor(this.y / 512);
    const transX =
      ((this.x - (256 + 512 * xOffset)) / 512) * 100 * (512 / this.w);
    const transY =
      ((this.y - (256 + 512 * yOffset)) / 512) * 100 * (512 / this.h);
    const YAxisRotations = xOffset * 90;
    const XAxisRotations = yOffset * -90;
    this.element.style.transform = `rotateY(${YAxisRotations}deg) rotateX(${XAxisRotations}deg) translate3d(${transX}%, ${transY}%, var(--half-size))`;
  },
};

//

const step = (timeStamp, then) => {
  EasedValue.ease((timeStamp - then) * DURATION_MULTIPLIER);

  //

  // resolvePeekY();
  // resolvePeekX();

  //

  CUBE.style.transform = `rotate3d(1, 0, 0, ${
    ORBIT_X.eased * -1
  }deg) rotate3d(0, 1, 0, ${ORBIT_Y.eased + PEEK_Y.eased}deg)`;

  positionPlayer();

  // console.log(PLAYER.x, PLAYER.y);

  // CUBE.style.transform = `rotateY(${resolveYRotation(PLAYER.x)}deg)`;

  requestAnimationFrame((nextTimeStamp) => step(nextTimeStamp, timeStamp));
};

step(performance.now(), 0);
