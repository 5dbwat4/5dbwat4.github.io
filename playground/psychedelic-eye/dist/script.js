/* 
 * PSYCHEDELIC EYE
 * 3D generative anim made with p5 - Enjoy!
 *
 * #039 - #100DaysOfCode
 * By ilithya | 2020
 * https://www.ilithya.rocks/
 * https://twitter.com/ilithya_net
 */

const bgColor = 'hotpink'; 
const inkColor = '#191919'; // black
const eyeColor = '#fffffd'; // white

function setup() {
	setAttributes('antialias', true);
	createCanvas(windowWidth, windowHeight, WEBGL);
	
	background(bgColor);
	frameRate(4);
	strokeWeight(1);
	stroke(inkColor);
	fill(eyeColor);
}

let time = 0;
const drawEye = () => {	
	time++;
	
	background(bgColor);	
	orbitControl();

	const w = round((windowWidth + windowHeight) / 28);
	const qTime = sin(time / 4);

	const count = round(w/1.7);
	for (let i = 0; i < count; i++) {
		rotateZ(qTime);

		push();
		rotateX(qTime/2);	
  		sphere(round(w*3.5));
		pop();
	}
};

function draw() {
	drawEye();
}