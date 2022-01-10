/*
  Johan Karlsson, 2020
  https://twitter.com/DonKarlssonSan
  MIT License, see Details View
  
  https://en.wikipedia.org/wiki/Circle_packing
  
  Thank you Dan Shiffman of Coding Train! 
*/

class Circle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = 3;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.stroke();
  }}


let canvas;
let ctx;
let w, h;
let mouseX, mouseY;
let circles;

function setup() {
  canvas = document.querySelector("#canvas");
  ctx = canvas.getContext("2d");
  reset();
  window.addEventListener("resize", reset);
  canvas.addEventListener("mousemove", mousemove);
  setupCircles();
  mouseX = mouseY = w * 10;
}

function setupCircles() {
  circles = [];
}

function reset() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}

function dist(x1, y1, x2, y2) {
  let xDiff = x1 - x2;
  let yDiff = y1 - y2;
  return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}

function addCircles() {
  let nrOfTries = 0;
  let wasAdded;
  do {
    wasAdded = false;
    let x = Math.random() * w;
    let y = Math.random() * h;
    if (validPos(x, y)) {
      wasAdded = true;
      let c = new Circle(x, y);
      circles.push(c);
    }
    nrOfTries++;
  } while (!wasAdded && nrOfTries < 100);
}

function validPos(x, y) {
  for (let i = 0; i < circles.length; i++) {
    let current = circles[i];
    let d = dist(x, y, current.x, current.y);
    if (d - 3 < current.r) {
      return false;
    }
  }
  let distToCursor = dist(mouseX, mouseY, x, y);
  if (distToCursor < 70) {
    return false;
  }
  return true;
}

function canGrow(circle) {
  for (let i = 0; i < circles.length; i++) {
    let current = circles[i];
    if (circle !== current) {
      let d = dist(circle.x, circle.y, current.x, current.y);
      if (d - 2 <= circle.r + current.r) {
        return false;
      }
    }
  }
  return true;
}

function drawCircles() {
  for (let j = 0; j < 4; j++) {
    addCircles();
  }
  circles.forEach(c => {
    if (canGrow(c)) {
      c.r += 0.5;
    }
    c.draw();
  });
  circles = circles.filter(c => dist(mouseX, mouseY, c.x, c.y) > 50);
}

function mousemove(event) {
  mouseX = event.clientX;
  mouseY = event.clientY;
}

function draw() {
  requestAnimationFrame(draw);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "white";
  drawCircles();
}

setup();
draw();