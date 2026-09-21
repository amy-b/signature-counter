const COUNTER_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRjyOm3QaakmqxAS08fciuHRd_PGOmwjUYHwJURGNMScBSi3J5NB99ZeEc1PQroSSRzgb9JjwCMe7da/pub?gid=1927244906&single=true&output=csv";

let signatureCount = 0;
let particles = [];

const rainbow = [
  "#FF595E",
  "#FF924C",
  "#FFCA3A",
  "#8AC926",
  "#00B4D8",
  "#4361EE",
  "#9B5DE5",
  "#F15BB5"
];

function setup() {

  // Create one container for EVERYTHING
  const container = createDiv();
  container.id("counter-container");

  // Create canvas inside container
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent(container);

  // Create number inside same container
  const counter = createDiv("...");
  counter.id("signature-counter");
  counter.parent(container);

  // Create label inside same container
  const label = createDiv("SIGNATURES AND GROWING");
  label.id("signature-label");
  label.parent(container);

  getSignatureCount();

  // Update every 15 seconds
  setInterval(getSignatureCount, 30000);
}


function windowResized() {
  resizeCanvas(windowWidth, 250);
}


async function getSignatureCount() {

  try {

    const response = await fetch(COUNTER_URL);

    if (!response.ok) {
      throw new Error(
        `Google returned status ${response.status}`
      );
    }

    const csvData = await response.text();

    const newCount = parseInt(csvData.trim());

    if (isNaN(newCount)) {
      throw new Error(
        `Expected a number but received: ${csvData}`
      );
    }

    updateCount(newCount);

  } catch (error) {

    console.error(
      "Couldn't update signature count:",
      error
    );
  }
}


function updateCount(newCount) {

  // ONE DOT = 10 SIGNATURES
  const desiredParticles =
    ceil(newCount);

  while (
    particles.length < desiredParticles
  ) {

    particles.push(
      new CommunityParticle()
    );
  }


  while (
    particles.length > desiredParticles
  ) {

    particles.pop();
  }


  signatureCount = newCount;


  // Update HTML counter
  const counter =
    select("#signature-counter");

  if (counter) {
    counter.html(signatureCount);
  }
}


function draw() {

  background(250, 248, 243);


  for (let particle of particles) {

    particle.move();

    particle.display();
  }
}


class CommunityParticle {

  constructor() {

    this.x = random(width);
    this.y = random(height);

    this.size = random(18, 42);

    this.col = random(rainbow);

    this.noiseX = random(1000);
    this.noiseY = random(1000);

    this.speed =
      random(0.003, 0.008);

    this.vx = 0;
    this.vy = 0;
  }


  move() {

    // Gentle wandering
    let xMovement =
      map(
        noise(this.noiseX),
        0,
        1,
        -0.7,
        0.7
      );

    let yMovement =
      map(
        noise(this.noiseY),
        0,
        1,
        -0.7,
        0.7
      );


    this.noiseX += this.speed;
    this.noiseY += this.speed;


    // Follow mouse or finger
    if (mouseIsPressed) {

      let d =
        dist(
          this.x,
          this.y,
          mouseX,
          mouseY
        );


      if (d < 250) {

        let attraction =
          map(
            d,
            0,
            250,
            0.06,
            0.002
          );


        this.vx +=
          (mouseX - this.x) *
          attraction;

        this.vy +=
          (mouseY - this.y) *
          attraction;
      }
    }


    // Movement
    this.x +=
      xMovement + this.vx;

    this.y +=
      yMovement + this.vy;


    // Friction
    this.vx *= 0.9;
    this.vy *= 0.9;


    // Wrap around edges
    if (this.x < -this.size) {
      this.x =
        width + this.size;
    }

    if (
      this.x >
      width + this.size
    ) {
      this.x =
        -this.size;
    }

    if (this.y < -this.size) {
      this.y =
        height + this.size;
    }

    if (
      this.y >
      height + this.size
    ) {
      this.y =
        -this.size;
    }
  }


  display() {

    noStroke();

    let particleColor =
      color(this.col);

    particleColor.setAlpha(190);

    fill(particleColor);

    circle(
      this.x,
      this.y,
      this.size
    );
  }
}


// Scatter particles when
// finger is lifted
function touchEnded() {

  for (
    let particle of particles
  ) {

    let angle =
      atan2(
        particle.y - mouseY,
        particle.x - mouseX
      );

    let force =
      random(4, 10);


    particle.vx +=
      cos(angle) * force;

    particle.vy +=
      sin(angle) * force;
  }

  return false;
}
