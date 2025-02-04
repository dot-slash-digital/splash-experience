(async () => {
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

  const cursor = {
    x: innerWidth * 0.5,
    y: innerHeight * 0.5,
  };

  const win = {
    w: innerWidth,
    h: innerHeight,
  };

  const flips = {
    x: 0,
    y: 0,
  };

  addEventListener("mousemove", (e) => {
    cursor.x = e.clientX;
    cursor.y = e.clientY;
  });

  addEventListener("resize", () => {
    win.w = innerWidth;
    win.h = innerHeight;
  });

  const CURSOR_X = new EasedValue(0.2, cursor, "x");
  const CURSOR_Y = new EasedValue(0.2, cursor, "y");

  class Tile {
    static instances = [];
    static parent = document.getElementById("tile-group");
    static template = Object.assign(document.createElement("div"), {
      className: "tile",
    });
    static tilesPerSide = 10;
    static canvasSize = 1920;
    static maxTilt = 45;

    static populate() {
      const totalTiles = Tile.tilesPerSide ** 2;
      Tile.parent.style.setProperty("--tiles-per-side", Tile.tilesPerSide);
      for (let i = 0; i < totalTiles; i++) new Tile();
      Tile.instances.forEach((tile) => tile.place());
    }

    static async paintFront() {
      const { canvasSize, tilesPerSide } = this;

      const loadImg = (imgName) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.addEventListener("load", () => resolve(img), { once: true });
          img.addEventListener("error", (err) => reject(err), { once: true });
          img.src = `/images/${imgName}.webp`;
        });

      const frontImage = await loadImg("front_img");

      const IMAGE_CANVAS = Object.assign(document.createElement("canvas"), {
        width: canvasSize,
        height: canvasSize,
      });

      const IMAGE_CTX = IMAGE_CANVAS.getContext("2d", { alpha: false });

      IMAGE_CTX.drawImage(frontImage, 0, 0);

      const tileSize = canvasSize / tilesPerSide;

      const TILE_CANVAS = Object.assign(document.createElement("canvas"), {
        width: tileSize,
        height: tileSize,
      });

      const TILE_CTX = TILE_CANVAS.getContext("2d", { alpha: false });

      Tile.instances.forEach((tile, index) => {
        const x = (index % tilesPerSide) * tileSize * -1;
        const y = Math.floor(index / tilesPerSide) * tileSize * -1;
        console.log(x, y);
        TILE_CTX.drawImage(IMAGE_CANVAS, x, y);

        tile.front.style.backgroundImage = `url(${TILE_CANVAS.toDataURL()})`;
      });
    }

    static flipX = new EasedValue(0.1, flips, "x");
    static flipY = new EasedValue(0.1, flips, "y");

    static get brightness() {
      return 1.5 - CURSOR_X.eased / win.w + (CURSOR_Y.eased / win.h) * 0.5;
    }

    constructor() {
      this.element = Tile.template.cloneNode();
      Tile.instances.push(this);
    }

    baseRotationX(maxTilt) {
      return maxTilt - maxTilt * 2 * (CURSOR_Y.eased / win.h);
    }

    baseRotationY(maxTilt) {
      return -1 * maxTilt + maxTilt * 2 * (CURSOR_X.eased / win.w);
    }

    place() {
      this.front = Object.assign(document.createElement("div"), {
        className: "front",
      });
      this.back = Object.assign(document.createElement("div"), {
        className: "back",
      });
      this.back.append("");

      this.element.append(this.front, this.back);
      Tile.parent.append(this.element);
    }

    style() {
      this.element.style.transform = `rotateX(${this.baseRotationX(
        Tile.maxTilt + Tile.flipX.eased
      )}deg) rotateY(${this.baseRotationY(
        Tile.maxTilt + Tile.flipY.eased
      )}deg)`;
      this.front.style.filter = `brightness(${Tile.brightness})`;
      this.back.style.filter = `brightness(${Tile.brightness})`;
    }
  }

  const step = (timeStamp, then) => {
    EasedValue.ease((timeStamp - then) * DURATION_MULTIPLIER);
    Tile.instances.forEach((tile) => tile.style());

    const threshold = 0.2;

    const flipLeft = cursor.x < 0 + win.w * threshold;
    const flipRight = cursor.x > win.w - win.w * threshold;

    const flipUp = cursor.y < 0 + win.h * threshold;
    const flipDown = cursor.y > win.h - win.h * threshold;

    if ((flipLeft || flipRight) && !(flipUp || flipDown)) {
      flips.y = 180;
    } else if (!(flipLeft || flipRight) && (flipUp || flipDown)) {
      flips.x = 180;
    } else {
      flips.y = 0;
      flips.x = 0;
    }

    requestAnimationFrame((nextTimeStamp) => step(nextTimeStamp, timeStamp));
  };

  Tile.populate();
  await Tile.paintFront();

  step(performance.now(), 0);
})();
