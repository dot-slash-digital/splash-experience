class Block {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
}

class Face {
  static instances = [];
  static canvas = Object.assign(document.createElement("canvas"), {
    width: 512,
    height: 512,
  });
  static ctx = Face.canvas.getContext("2d");

  constructor(div, items) {
    this.div = div;
    this.items = items;
    Face.instances.push(this);
  }

  paint(label) {
    Face.ctx.clearRect(0, 0, 512, 512);
    Face.ctx.font = "48px sans-serif";
    Face.ctx.fillStyle = "#fff";
    Face.ctx.fillText(label, 200, 200);
    Face.ctx.fillStyle = "#000";
    this.items.forEach((item) => {
      Face.ctx.fillRect(item.x, item.y, item.w, item.h);
    });

    this.div.style.backgroundImage = `url(${Face.canvas.toDataURL(
      "img/webp"
    )})`;
  }
}

//faces are 512 x 512
//blocks should be in increments of 32 or 16

const FRONT = new Face(document.getElementById("front"), [
  new Block(0, 0, 64, 64),
  new Block(0, 480, 512, 32),
  new Block(128, 128, 32, 128),
  new Block(320, 256, 192, 64),
]);

const BACK = new Face(document.getElementById("back"), [
  new Block(0, 0, 512, 128),
  new Block(0, 384, 512, 128),
]);

const TOP = new Face(document.getElementById("top"), [
  new Block(128, 128, 64, 32),
  new Block(0, 0, 512, 32),
  new Block(64, 320, 256, 32),
  new Block(0, 256, 128, 64),
]);

const BOTTOM = new Face(document.getElementById("bottom"), [
  new Block(128, 128, 64, 32),
  new Block(0, 0, 512, 32),
  new Block(64, 320, 256, 32),
  new Block(0, 256, 128, 64),
]);

const RIGHT = new Face(document.getElementById("right"), [
  new Block(256, 128, 32, 64),
  new Block(256, 0, 512, 32),
  new Block(64, 320, 256, 32),
  new Block(0, 256, 128, 64),
  new Block(0, 480, 512, 32),
  new Block(480, 320, 32, 32),
  new Block(416, 320, 32, 32),
]);

const LEFT = new Face(document.getElementById("left"), [
  new Block(0, 0, 512, 128),
  new Block(0, 384, 512, 128),
]);

FRONT.paint("FRONT");
TOP.paint("TOP");
RIGHT.paint("RIGHT");
LEFT.paint("LEFT");
BOTTOM.paint("BOTTOM");
BACK.paint("BACK");

let CURRENT_FACE = FRONT;
