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

const DEFAULT_POS = {
  top: {
    x: -0.5,
    y: -1,
    z: -0.5,
    rot: "1, 0, 0, 90deg",
    perpendicularAxis: "y",
  },
  front: {
    x: -0.5,
    y: -0.5,
    z: 1,
    rot: "0, 1, 0, 0deg",
    perpendicularAxis: "z",
  },
  left: {
    x: -1,
    y: -0.5,
    z: -0.5,
    rot: "0, 1, 0, -90deg",
    perpendicularAxis: "x",
  },
  right: {
    x: 1,
    y: -0.5,
    z: 0.5,
    rot: "0, 1, 0, 90deg",
    perpendicularAxis: "x",
  },
  bottom: {
    x: -0.5,
    y: 1,
    z: 0.5,
    rot: "1, 0, 0, -90deg",
    perpendicularAxis: "y",
  },
  back: {
    x: -0.5,
    y: 0.5,
    z: -1,
    rot: "0, 1, 0, 180deg",
    perpendicularAxis: "z",
  },
};

const OFFSET = 0.01;

const getAxisTranslation = (axis, face, posValue) => {
  const isPerpendicular = DEFAULT_POS[face].perpendicularAxis === axis;
  return `calc(${isPerpendicular ? "var(--half-size)" : "var(--size)"} * ${
    DEFAULT_POS[face][axis] * (1 + (isPerpendicular ? OFFSET : 0)) +
    (posValue || 0)
  })`;
};

const PLAYER = {
  element: document.getElementById("player"),
  x: 256,
  y: 256,
  w: 16,
  h: 32,
  customPos: undefined,

  get midX() {
    return this.x + this.w * 0.5;
  },

  //

  place() {
    if (this.customPos) {
      const { face, x, y, rot } = this.customPos;

      const tX = getAxisTranslation("x", face, x);
      const tY = getAxisTranslation("y", face, y);
      const tZ = getAxisTranslation("z", face);

      this.element.style.transform = `translate3d(${tX}, ${tY}, ${tZ}) rotate3d(${DEFAULT_POS[face].rot}) rotateX(${rot}deg)`;
    } else {
      const xOffset = Math.floor(this.x / 512);
      const yOffset = Math.floor(this.y / 512);
      const transX =
        ((this.x - (256 + 512 * xOffset)) / 512) * 100 * (512 / this.w);
      const transY =
        ((this.y - (256 + 512 * yOffset)) / 512) * 100 * (512 / this.h);
      const YAxisRotations = xOffset * 90;
      const XAxisRotations = yOffset * -90;

      this.element.style.transform = `rotateY(${YAxisRotations}deg) rotateX(${XAxisRotations}deg) translate3d(${transX}%, ${transY}%, var(--half-size))`;
    }
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

/*
grid square size = ∆

x-axis ->
x = 0    x = ∆      x = 2∆     x = 3∆
----------------------------------       y = 0
|          |          |          |  y
|   R0C0   |    T     |   R0C2   |  -
|          |          |          |  a
----------------------------------  x    y = ∆
|          |          |          |  i
|     L    |    F     |    R     |  s
|          |          |          |
----------------------------------  |    y = 2∆
|          |          |          |  v
|   R2C0   |    Bo    |   R2C2   |
|          |          |          |
----------------------------------       y = 3∆
|          |          |          |
|   R3C0   |    Ba    |   R3C2   |
|          |          |          |
----------------------------------       y = 4∆
*/

const getGridCellIndex = (gridSquareSize, axis, axisPos) => {
  let indexes;
  if (axis === "row") {
    indexes = [0, 1, 2, 3];
  } else if (axis === "col") {
    indexes = [0, 1, 2];
  }

  if (!indexes) {
    throw new Error(
      `getGridCellIndex: Invalid param value for 'axis' (${axis}), must be 'row' or 'col'`
    );
  }

  return indexes.find(
    (index) =>
      axisPos >= gridSquareSize * index &&
      axisPos < gridSquareSize * (index + 1)
  );
};

const getCurrentFace = (gridSquareSize, xPos, yPos) => {
  const col = getGridCellIndex(gridSquareSize, "col", xPos);
  const row = getGridCellIndex(gridSquareSize, "row", yPos);

  // invalid grid squares
  if (
    (row === 0 && col === 0) ||
    (row === 0 && col === 2) ||
    (row === 2 && col === 0) ||
    (row === 2 && col === 2) ||
    (row === 3 && col === 0) ||
    (row === 3 && col === 2)
  ) {
    return undefined;
  }

  if (row === 0 && col === 1) {
    return "top";
  }

  if (row === 1 && col === 0) {
    return "left";
  }

  if (row === 1 && col === 1) {
    return "front";
  }

  if (row === 1 && col === 2) {
    return "right";
  }

  if (row === 2 && col === 1) {
    return "bottom";
  }

  if (row === 3 && col === 1) {
    return "back";
  }
};

const convertPosition2dTo3d = (gridSquareSize, xPos, yPos, rotation) => {
  const face = getCurrentFace(gridSquareSize, xPos, yPos);

  if (!face) {
    throw new Error(
      `Player position (${xPos}, ${yPos}) results in an invalid face`
    );
  }

  let startPos;
  if (face === "top") {
    startPos = { col: 1, row: 0 };
  } else if (face === "left") {
    startPos = { col: 0, row: 1 };
  } else if (face === "front") {
    startPos = { col: 1, row: 1 };
  } else if (face === "right") {
    startPos = { col: 2, row: 1 };
  } else if (face === "bottom") {
    startPos = { col: 1, row: 2 };
  } else if (face === "back") {
    startPos = { col: 1, row: 3 };
  }

  const endPos = { col: startPos.col + 1, row: startPos.row + 1 };

  // x and y are percentages for how far along that value is on the given axis for the current face

  const colStart = startPos.col * gridSquareSize;
  const colEnd = endPos.col * gridSquareSize;
  const x = (xPos - colStart) / (colEnd - colStart);

  const rowStart = startPos.row * gridSquareSize;
  const rowEnd = endPos.row * gridSquareSize;
  const y = (yPos - rowStart) / (rowEnd - rowStart);

  PLAYER.customPos = { face, x, y, rot: rotation };
};
