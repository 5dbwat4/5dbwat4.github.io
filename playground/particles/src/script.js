"use strict";

window.addEventListener("load",function() {

  const scaleX = 200;
  const lineW = 0.3; // line width

  const speed = 2; // intensity of field at the triangle vertices
  const nbParticles = 1000;
  const lifeTime = 400;

  let canv, ctx;    // canvas and context
  let maxx, maxy;   // canvas dimensions
  let nbx, nby;     // number of triangles
  let xc, yc;       // center of canvas

  let particles;    // array of particles

  let xRect, yRect, hRect, rectSide;

  let bgColor;
  let lineColor;

  let requestID;   // ID provided by window.requestAnimationFrame();

  let hue;          // for particles
  let xp, yp;
  let pTarget;
  let fx;
  let moveMode = 'auto';
// shortcuts for Math.
  const mrandom = Math.random;
  const mfloor = Math.floor;
  const mround = Math.round;
  const mceil = Math.ceil;
  const mabs = Math.abs;
  const mmin = Math.min;
  const mmax = Math.max;

  const mPI = Math.PI;
  const mPIS2 = Math.PI / 2;
  const m2PI = Math.PI * 2;
  const msin = Math.sin;
  const mcos = Math.cos;
  const matan2 = Math.atan2;

  const mhypot = Math.hypot;
  const msqrt = Math.sqrt;
  
  const rac3   = msqrt(3);
  const rac3s2 = rac3 / 2;
  const mPIS3 = Math.PI / 3;
  
  const sinPIS6 = 0.5;
  const cosPIS6 = rac3s2;
  const sinPIS3 = cosPIS6;
  const cosPIS3 = sinPIS6;

//------------------------------------------------------------------------
/*
 * A fast javascript implementation of simplex noise by Jonas Wagner
 *
 * Based on a speed-improved simplex noise algorithm for 2D, 3D and 4D in Java.
 * Which is based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * With Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 *
 *
 * Copyright (C) 2012 Jonas Wagner
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */
(function () {
"use strict";

var F2 = 0.5 * (Math.sqrt(3.0) - 1.0),
    G2 = (3.0 - Math.sqrt(3.0)) / 6.0,
    F3 = 1.0 / 3.0,
    G3 = 1.0 / 6.0,
    F4 = (Math.sqrt(5.0) - 1.0) / 4.0,
    G4 = (5.0 - Math.sqrt(5.0)) / 20.0;


function SimplexNoise(random) {
    if (!random) random = Math.random;
    this.p = new Uint8Array(256);
    this.perm = new Uint8Array(512);
    this.permMod12 = new Uint8Array(512);
    for (var i = 0; i < 256; i++) {
        this.p[i] = random() * 256;
    }
    for (i = 0; i < 512; i++) {
        this.perm[i] = this.p[i & 255];
        this.permMod12[i] = this.perm[i] % 12;
    }

}
SimplexNoise.prototype = {
    grad3: new Float32Array([1, 1, 0,
                            - 1, 1, 0,
                            1, - 1, 0,

                            - 1, - 1, 0,
                            1, 0, 1,
                            - 1, 0, 1,

                            1, 0, - 1,
                            - 1, 0, - 1,
                            0, 1, 1,

                            0, - 1, 1,
                            0, 1, - 1,
                            0, - 1, - 1]),
    noise2D: function (xin, yin) {
        var permMod12 = this.permMod12,
            perm = this.perm,
            grad3 = this.grad3;
        var n0=0, n1=0, n2=0; // Noise contributions from the three corners
        // Skew the input space to determine which simplex cell we're in
        var s = (xin + yin) * F2; // Hairy factor for 2D
        var i = Math.floor(xin + s);
        var j = Math.floor(yin + s);
        var t = (i + j) * G2;
        var X0 = i - t; // Unskew the cell origin back to (x,y) space
        var Y0 = j - t;
        var x0 = xin - X0; // The x,y distances from the cell origin
        var y0 = yin - Y0;
        // For the 2D case, the simplex shape is an equilateral triangle.
        // Determine which simplex we are in.
        var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
        if (x0 > y0) {
            i1 = 1;
            j1 = 0;
        } // lower triangle, XY order: (0,0)->(1,0)->(1,1)
        else {
            i1 = 0;
            j1 = 1;
        } // upper triangle, YX order: (0,0)->(0,1)->(1,1)
        // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
        // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
        // c = (3-sqrt(3))/6
        var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
        var y1 = y0 - j1 + G2;
        var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
        var y2 = y0 - 1.0 + 2.0 * G2;
        // Work out the hashed gradient indices of the three simplex corners
        var ii = i & 255;
        var jj = j & 255;
        // Calculate the contribution from the three corners
        var t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 >= 0) {
            var gi0 = permMod12[ii + perm[jj]] * 3;
            t0 *= t0;
            n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0); // (x,y) of grad3 used for 2D gradient
        }
        var t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 >= 0) {
            var gi1 = permMod12[ii + i1 + perm[jj + j1]] * 3;
            t1 *= t1;
            n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1);
        }
        var t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 >= 0) {
            var gi2 = permMod12[ii + 1 + perm[jj + 1]] * 3;
            t2 *= t2;
            n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2);
        }
        // Add contributions from each corner to get the final noise value.
        // The result is scaled to return values in the interval [-1,1].
        return 70.0 * (n0 + n1 + n2);
    }

};

window.SimplexNoise = SimplexNoise;

})();
/* end of simple noise */
//------------------------------------------------------------------------

function computeField (x, y) {

/* compute field at a given point */

  let angle = fx (x / scaleX, y / scaleX) * mPI; // non-uniform distribution -> tendency to go to the right

  let dx = x - xc;
  let dy = y - yc;
  let rad = mhypot(dx, dy);

/*  since noise2D does not return a uniform distribution, the particles have
a tendency to go to the right (angle 0)
The following lines spread the particles in all directions away from the centre,
except in a small central area to avoid discontinuity */
/*
  if (mhypot(dx, dy) > 5) { // arbitrary radius of 5
    angle += mmin (1, (rad - 5) / 10)  * (matan2(dy, dx));
  }
*/
  if (mhypot(dx, dy) > 1) { // arbitrary radius of 5
    angle +=  (matan2(dy, dx));
  }

  return [speed * mcos(angle), 2 * speed * msin(angle)]; //

} // computeField


//------------------------------------------------------------------------
function createParticle() {

  let h1 = hue;
  let thck = lineW;
  let perp = false;
  if (alea(1) > 1) {  // inhibited
    h1 = (h1 + 180) % 360;
    perp = true;
  }

  if (moveMode == 'mouse' ) {
    if (typeof pTarget == 'undefined') return false;

    let dist = mhypot (pTarget[0] - xp, pTarget[1] - yp);
    if (dist < 2) return false;

    let th = matan2 (pTarget[1] - yp, pTarget[0] - xp);

    xp = mmax (0, mmin(xp + 2 * mcos(th), maxx));
    yp = mmax (0, mmin(yp + 2 * msin(th), maxy));
  } else {
    if (rectSide == 0) {
      xp += 3;
      if (xp >= maxx) {
        --xp;
        rectSide = 1;
        ++hRect;
        yp += hRect;
      }
    } else { // move without mouse
      xp -= 3;
      if (xp < 0) {
        xp += 2;
        rectSide = 0;
        ++hRect;
        yp -=  hRect;
      }
      if (yp < 0 || yp >= maxy) yp = maxy / 2;
    }

  }
  return {
    x: xp,
    y: yp,
    colour: `hsl(${h1},${intAlea(50, 101)}%,${intAlea(30, 80)}%)`,
    TTL: alea(lifeTime * 0.8, lifeTime * 1.2), // time to live
    thck : thck,
    perp: perp
  }
} // createParticle
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function createParticles() {
  particles = [];                  // create empty array;
  for (let k = 0; k < nbParticles; ++k) {
    particles.push(createParticle());
  } // for k
  particles.forEach (part => {
    if (part)part.TTL = intAlea(lifeTime); // to avoid too many simultaneous deaths / births in first generations
  });
} // createParticles

//------------------------------------------------------------------------
function move() {

  let part, prev, dx, dy;

  for (let k = 0; k < nbParticles; ++k) {
    part = particles[k];
// death and re-birth
    if (part === false || part.TTL <= 0 || part.x < 0 || part.y < 0 || part.x >= maxx || part.y >= maxy) {
      part = createParticle();
      particles[k] = part;
    }
    if (part === false) continue;
    prev = {x: part.x, y: part.y}; // position before this move

    [dx, dy] = computeField( prev.x, prev.y);
    if (part.perp) {
      part.x += dy;
      part.y -= dx;
     
    } else {    
      part.x += dx;
      part.y += dy;
    }
    --part.TTL; // decrease time to live
// draw it
    ctx.beginPath();
    ctx.moveTo (prev.x, prev.y);
    ctx.lineTo (part.x, part.y);
    ctx.strokeStyle = part.colour;
    ctx.lineWidth = part.thck;
    ctx.stroke();

  } // for k (loop on particles)
} // move

//------------------------------------------------------------------------

function startOver() {

// canvas dimensions

  maxx = window.innerWidth;
  maxy = window.innerHeight;

  xc = maxx / 2; // center of canvas
  yc = maxy / 2;

  canv.width = maxx;
  canv.height = maxy;

  ctx.fillStyle = '#000';
  ctx.fillRect(0,0,maxx,maxy);

  fx = (function () {
    let f = new SimplexNoise();
    return function (x, y) {
      return (f.noise2D(x, y) + f.noise2D(1.876 * x , 1.876 * y  )/ 2 + f.noise2D(3.723 * x, 3.723 * y ) / 4) / 1.75;
    }
  })();

  hue = intAlea(360);

// parameters for creation of particles
  pTarget = undefined;

  if (moveMode != 'mouse') {
// prepare target's course for animation
    xRect = xp = mround(maxx / 2);
    yRect = yp = mround(maxy / 2);
    hRect = 0; // rectangle height
    rectSide = 0;
  }
  createParticles();

  if (typeof requestID == 'number') window.cancelAnimationFrame(requestID);

  (function animate () {
    requestID = undefined;
    move();
    requestID = window.requestAnimationFrame(animate);
  })();

} // startOver

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function alea (mini, maxi) {
// random number in given range

  if (typeof(maxi) == 'undefined') return mini * mrandom(); // range 0..mini

  return mini + mrandom() * (maxi - mini); // range mini..maxi
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function intAlea (mini, maxi) {
// random integer in given range (mini..maxi - 1 or 0..mini - 1)
//
  if (typeof(maxi) == 'undefined') return mfloor(mini * mrandom()); // range 0..mini - 1
  return mini + mfloor(mrandom() * (maxi - mini)); // range mini .. maxi - 1
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/* returns intermediate point between p0 and p1,
  alpha = 0 whill preturn p0, alpha = 1 will return p1
  values of alpha outside [0,1] may be used to compute points outside the p0-p1 segment
*/
  function intermediate (p0, p1, alpha) {

    return [(1 - alpha) * p0[0] + alpha * p1[0],
            (1 - alpha) * p0[1] + alpha * p1[1]];
  } // function intermediate

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function clickCanvas() {
 startOver();
}

function mouseMove(event) {

  if (moveMode != 'mouse') return;

  if (typeof pTarget == 'undefined') {
    xp = event.clientX;
    yp = event.clientY
  }
  pTarget = [event.clientX, event.clientY];

} // mouseMove

//------------------------------------------------------------------------

//------------------------------------------------------------------------
//------------------------------------------------------------------------
// beginning of execution

  {
    document.body.style.backgroundColor = bgColor;
    canv = document.createElement('canvas');
    canv.style.position = 'absolute';
    canv.addEventListener('click',clickCanvas);
    canv.addEventListener('mousemove',mouseMove);
    document.body.appendChild(canv);
    ctx = canv.getContext('2d');
    canv.setAttribute('title' , 'Click for new drawing');
  } // création CANVAS

/* go ! */
  startOver();
  window.addEventListener('resize',startOver);

 }); // window load listener
