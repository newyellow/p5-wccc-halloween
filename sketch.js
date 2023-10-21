
let ribbons = [];
let fakeMouseX = 0;
let fakeMouseY = 0;
let nowMouseX = 0;
let nowMouseY = 0;


let spawnType = 0;
let hasStroke = false;
let isBlack = false;
let mainHue = 0;
let hueRange = 0;

let nowMouseDegree = 0;

let mainCanvas;
let isMouseOver = false;


async function setup() {
  mainCanvas = createCanvas(windowWidth, windowHeight);
  mainCanvas.mouseOver(() => { isMouseOver = true });
  mainCanvas.mouseOut(() => { isMouseOver = false });
  colorMode(HSB);
  background(0, 0, 12, 1.0);


  initObjNoise();
  nowMouseX = width / 2;
  nowMouseY = height / 2;

  // 0: ground, 1: moving point, 2: right, 3: left, 4: center
  spawnType = int(random(0, 5));
  hasStroke = random() < 0.5;
  isBlack = random() < 0.1;
  isBlack = 1;

  mainHue = random(0, 360);
  hueRange = random(10, 30);

  if(hasStroke)
  {
    strokeWeight(random(1, 2));
    stroke(0, 0, 100);
  }
  else
  {
    noStroke();
  }
  frameRate(60);
}

function draw() {

  nowMouseDegree += noise(frameCount * 0.01);
  fakeMouseX = width / 2 + sin(radians(nowMouseDegree)) * 0.4 * width;
  fakeMouseY = height / 2 + -cos(radians(nowMouseDegree * 2.3)) * 0.4 * height;

  // if (isMouseOver) {
  //   nowMouseX = lerp(nowMouseX, mouseX, 0.06);
  //   nowMouseY = lerp(nowMouseY, mouseY, 0.06);
  // }
  // else {
  nowMouseX = lerp(nowMouseX, fakeMouseX, 0.06);
  nowMouseY = lerp(nowMouseY, fakeMouseY, 0.06);
  // }

  for (let i = 0; i < 1; i++) {

    // let spawnX = random(0, width);
    let spawnX = 0;
    let spawnY = 0;
    let spawnDir = 0;
    let spawnDist = random(0.0, 0.1) * min(width, height);

    if (spawnType == 0) {
      spawnX = random(0, width);
      spawnY = height;
      spawnDir = random(-30, 30);
    }
    else if (spawnType == 1) {
      spawnX = nowMouseX + sin(radians(spawnDir)) * spawnDist;
      spawnY = nowMouseY + -cos(radians(spawnDir)) * spawnDist;
      spawnDir = random(-360, 360);
    }
    else if (spawnType == 2) {
      if (random() < 0.3) {
        spawnX = width;
        spawnY = random(0.3, 1.0) * height;
        spawnDir = random(-180, -90);
      }
      else {
        spawnX = random(0.3, 1.0) * width;
        spawnY = height;
        spawnDir = random(-110, 0);
      }
    }
    else if (spawnType == 3) {
      if (random() < 0.3) {
        spawnX = 0;
        spawnY = random(0.3, 1.0) * height;
        spawnDir = random(180, 90);
      }
      else {
        spawnX = random(0.0, 0.7) * width;
        spawnY = height;
        spawnDir = random(110, 0);
      }
    }
    else {
      spawnDir = random(-720, 720);
      spawnX = width / 2 + sin(radians(spawnDir)) * spawnDist;
      spawnY = height / 2 + -cos(radians(spawnDir)) * spawnDist;
    }

    ribbons.push(new Ribbon(spawnX, spawnY, random(1, 24), spawnDir, random(6, 24)));
  }


  background(0, 0, 12, 0.03);

  for (let i = 0; i < ribbons.length; i++) {
    ribbons[i].draw();
    ribbons[i].update();
  }

}

function moveOverCanvas() {
  isMouseOver = true;
}

function mousePressed () {
  background(0, 0, 0.9, 1.0);
  ribbons = [];
  setup();
}

// async sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}