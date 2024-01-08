import { OrbitControls } from "THREE/examples/jsm/controls/OrbitControls.js";
import { Raycaster } from "three";

// Create a scene
const scene = new THREE.Scene();
// Create a camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Adjust camera position
camera.position.set(0, 4, 7); // Adjust x, y, z as needed
camera.lookAt(new THREE.Vector3(0, 0, 0)); // Look at the center of the scene

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

const spotLight = new THREE.SpotLight(0xffffff, 1);
spotLight.position.set(0, 4, 10);
spotLight.angle = Math.PI / 4;
spotLight.penumbra = 0.1;
scene.add(spotLight);

const cupMaterial = new THREE.MeshPhongMaterial({
  color: 0x00ff00,
  specular: 0x555555,
  shininess: 30,
});
const ballMaterial = new THREE.MeshPhongMaterial({
  color: 0xff0000,
  specular: 0x111111,
  shininess: 100,
  transparent: true,
});

// Create geometry for the cups and ball
const cupGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
const ballGeometry = new THREE.SphereGeometry(0.2, 32, 32);

// Create mesh for the cups
const cups = [];
for (let i = 0; i < 3; i++) {
  const cup = new THREE.Mesh(cupGeometry, cupMaterial);
  cup.position.x = i * 2 - 2;
  cup.position.y = 0.5; // half the height of the cup
  scene.add(cup);
  cups.push(cup);
}

// Create mesh for the ball
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
ball.position.y = 0.2; // half the height of the ball (radius)
scene.add(ball);

// Update renderer settings
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
renderer.antialias = true;

// Enable shadows for light sources
// pointLight.castShadow = true;
spotLight.castShadow = true;

// Enable shadows for objects
cups.forEach((cup) => (cup.castShadow = true));
ball.castShadow = true;

// Create a ground plane that acts as a floor
const groundGeometry = new THREE.PlaneGeometry(20, 20); // Adjust size as needed
const groundMaterial = new THREE.MeshPhongMaterial({
  color: 0xcccccc,
  specular: 0x101010,
}); // Neutral color

const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Rotate to lay flat
ground.position.y = 0; // Lower it below the cups and ball
ground.receiveShadow = true; // Enable shadow reception

scene.add(ground);

let positions = [-2, 0, 2]; // Left, Middle, Right positions on the X-axis
let isSwitching = false;
let switchDuration = 1000; // Duration of the switch in milliseconds
let switchStartTime;
let cupToSwitch1, cupToSwitch2;

let switchQueue = [];
let numberOfSwitches = 5; // Number of switches to perform at the start

let revealDuration = 1000; // Duration to reveal the ball
let revealHeight = 1; // Height to lift the cups
let ballRevealed = false;

let ballUnderCupIndex = 1; // Index of the cup hiding the ball
let winningCupIndex = 1; // Index of the cup the user guesses
ball.position.x = 0;

let revealStartTime, revealEndTime;
let isRevealing = false;

function revealBall() {
  ballRevealed = true;
  isRevealing = true;
  revealStartTime = Date.now();

  // Start the reveal animation
  requestAnimationFrame(animateReveal);
}

function animateReveal() {
  let currentTime = Date.now();
  let deltaTime = currentTime - revealStartTime;

  if (deltaTime < revealDuration) {
    let fraction = deltaTime / revealDuration;
    let currentHeight = 0.5 + fraction * revealHeight;

    cups.forEach((cup) => {
      cup.position.y = currentHeight;
    });

    requestAnimationFrame(animateReveal);
  } else {
    revealEndTime = Date.now();
    // Finish the reveal and start the switch
    finishReveal();
  }
}

function finishReveal() {
  let currentTime = Date.now();
  let deltaTime = currentTime - revealEndTime;

  if (deltaTime < revealDuration) {
    let fraction = deltaTime / revealDuration;
    let currentHeight = revealHeight + 0.5 - fraction * revealHeight;

    cups.forEach((cup) => {
      cup.position.y = currentHeight;
    });

    requestAnimationFrame(finishReveal);
  } else {
    ballRevealed = false;
    isRevealing = false;

    // Start the switching sequence after lowering the cups
    generateSwitches();
    startNextSwitch();
  }
}

// Start the game by revealing the ball
revealBall();

// Function to generate a series of random switches
function generateSwitches() {
  for (let i = 0; i < numberOfSwitches; i++) {
    let cup1 = Math.floor(Math.random() * cups.length);
    let cup2;
    do {
      cup2 = Math.floor(Math.random() * cups.length);
    } while (cup1 === cup2);

    switchQueue.push([cup1, cup2]);
  }
}

// Function to start the next switch
function startNextSwitch() {
  if (switchQueue.length > 0) {
    [cupToSwitch1, cupToSwitch2] = switchQueue.shift();
    startSwitching();
  }
}
// Modified animateCups function
function animateCups() {
  if (isSwitching) {
    let currentTime = Date.now();
    let deltaTime = currentTime - switchStartTime;

    if (deltaTime < switchDuration) {
      // Calculate the fraction of the switch that is complete
      let fraction = deltaTime / switchDuration;
      let angle = fraction * Math.PI; // Half circle (180 degrees)

      // Calculate the midpoint of the two cups
      let midX = (positions[cupToSwitch1] + positions[cupToSwitch2]) / 2;
      let radius = (positions[cupToSwitch1] - positions[cupToSwitch2]) / 2;

      // Calculate new positions along the circular path
      let newX1 = midX + Math.cos(angle) * radius;
      let newZ1 = Math.sin(angle) * radius;

      let newX2 = midX - Math.cos(angle) * radius;
      let newZ2 = -Math.sin(angle) * radius;

      // Update cup x positions
      cups[cupToSwitch1].position.x = newX1;
      cups[cupToSwitch2].position.x = newX2;

      // Update cup z positions
      cups[cupToSwitch1].position.z = newZ1;
      cups[cupToSwitch2].position.z = newZ2;
    } else {
      isSwitching = false;
      [positions[cupToSwitch1], positions[cupToSwitch2]] = [
        positions[cupToSwitch2],
        positions[cupToSwitch1],
      ];
      winningCupIndex = positions[ballUnderCupIndex] / 2 + 1;
      startNextSwitch();

      // Start the next switch
    }
    // Move the ball with the cup it's under
    if (!ballRevealed) {
      ball.position.x = cups[ballUnderCupIndex].position.x;
      ball.position.z = cups[ballUnderCupIndex].position.z;
      ball.castShadow = false;
    }
  }
}

function updateBallPosition() {
  //not working
  if (cupToSwitch1 === ballUnderCupIndex) {
    ballUnderCupIndex = cupToSwitch2;
  } else if (cupToSwitch2 === ballUnderCupIndex) {
    ballUnderCupIndex = cupToSwitch1;
  }
}

// Function to start switching two cups
function startSwitching() {
  isSwitching = true;
  switchStartTime = Date.now();
}

// Function to check the user's guess
function checkGuess(index) {
  return index === winningCupIndex;
}

const rayCaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Call the animate function repeatedly
function animate() {
  if (!isRevealing) {
    animateCups();
  }
  rayCaster.setFromCamera(mouse, camera);
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

function positionToIndex(position) {
  return position == 2 ? 2 : position == 0 ? 1 : 0;
}

document.addEventListener("click", function (e) {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  rayCaster.setFromCamera(mouse, camera);
  let clickCupPosition = Math.round(
    rayCaster.intersectObjects(cups)[0].object.position.x
  );
  let clickedCupIndex = positionToIndex(clickCupPosition);
  console.log(clickedCupIndex);
  const isCorrect = checkGuess(clickedCupIndex);

  const resultElement = document.getElementById('guessResult');
    resultElement.innerHTML = isCorrect ? "Correct!" : "Wrong Guess!";
    resultElement.classList.add('show');

    // Hide the message after a few seconds
    setTimeout(() => {
        resultElement.classList.remove('show');
    }, 2000);
    
  if (isCorrect) {
    console.log("Correct guess!");
    revealBall();
  } else {
    console.log("Try again!");
    revealBall();
  }
});

animate();
