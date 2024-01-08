import waterNormals from "./images/waternormals.jpg"
import cupTextureSrc from "./images/cup.jpg"

import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";

import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Water } from "three/examples/jsm/objects/Water.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { SceneUtils } from "three/examples/jsm/Addons";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

let container, stats;
let camera, scene, renderer;
let controls, water, sun, mesh;
let jojo_model=false;

init();
animate();

function init() {
  container = document.getElementById("container");

  // Renderer

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.5;
  container.appendChild(renderer.domElement);

  // Scene

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    1,
    20000
  );
  camera.position.set(30, 30, 100);

  // Sun

  sun = new THREE.Vector3();

  // Water

  const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
  water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load(
      waterNormals,
      function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
    ),
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    fog: scene.fog !== undefined,
  });

  water.rotation.x = -Math.PI / 2;
  water.material.uniforms.size.value = 10;
  water.material.uniforms.distortionScale.value = 3.7;

  scene.add(water);

  // Skybox

  const sky = new Sky();
  sky.scale.setScalar(10000);
  scene.add(sky);

  const skyUniforms = sky.material.uniforms;

  skyUniforms["turbidity"].value = 10;
  skyUniforms["rayleigh"].value = 2;
  skyUniforms["mieCoefficient"].value = 0.005;
  skyUniforms["mieDirectionalG"].value = 0.8;

  const parameters = {
    elevation: 2,
    azimuth: 180,
  };

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const sceneEnv = new THREE.Scene();

  let renderTarget;

  function updateSun() {
    const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
    const theta = THREE.MathUtils.degToRad(parameters.azimuth);

    sun.setFromSphericalCoords(1, phi, theta);

    sky.material.uniforms["sunPosition"].value.copy(sun);
    water.material.uniforms["sunDirection"].value.copy(sun).normalize();

    if (renderTarget !== undefined) renderTarget.dispose();

    sceneEnv.add(sky);
    renderTarget = pmremGenerator.fromScene(sceneEnv);
    scene.add(sky);

    scene.environment = renderTarget.texture;
  }

  updateSun();

  // Adding Middle Box

  const geometry = new THREE.BoxGeometry(30, 30, 30);
  const material = new THREE.MeshStandardMaterial({
    roughness: 0,
    side: THREE.DoubleSide,
  });

  mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);

  //adding jotaro stuff

  const loader = new GLTFLoader();

  loader.load(
    "./models/jojo_st.glb",
    function (gltf) {
      gltf.scene.scale.set(0.4, 0.4, 0.4);
      gltf.scene.position.set(0, 1, 0);
      gltf.scene.castShadow=true;
      gltf.scene.receiveShadow=true;

      scene.add(gltf.scene);
      jojo_model = gltf.scene;
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
  // Orbit Controls

  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.target.set(0, 10, 0);
  controls.minDistance = 40.0;
  controls.maxDistance = 200.0;
  controls.update();

  // Stats

  stats = new Stats();
  container.appendChild(stats.dom);

  // GUI

  const gui = new GUI();

  gui.add(parameters, "azimuth", -180, 180, 0.1).onChange(updateSun);

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(time) {
  requestAnimationFrame(animate);
  if (jojo_model) jojo_model.rotation.y += 0.01;
  render();
  stats.update();
}

function render() {
  water.material.uniforms["time"].value += 10.0 / 600.0;
  renderer.render(scene, camera);
}

let cups, ball;

function renderCup() {
  const cup = new THREE.Object3D();
  cup.name = "cup";

  let cupBodyMaterials = [];
  /*****************************************************
   *   BODY                                            *
   *****************************************************/

  const cupBodyGeometry = new THREE.CylinderGeometry(
    2.646,
    2.083,
    6,
    64,
    12,
    true
  );
  var loader2 = new THREE.TextureLoader();
  loader2.crossOrigin = "*";

  const cupBodyMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    overdraw: 0.5,
  });
  cupBodyMaterial.name = "cupBodyMaterial";

  const cupTexture = new THREE.TextureLoader().load(cupTextureSrc);

  const cupBodyMaterialTexture = new THREE.MeshBasicMaterial({
    map: cupTexture,
    transparent: true,
    castShadow: true,
  });
  cupBodyMaterialTexture.name = "cupBodyTexture";

  cupBodyMaterials.push(cupBodyMaterial);
  cupBodyMaterials.push(cupBodyMaterialTexture);

  cupBodyMaterial.vertexColors = THREE.FaceColors;

  const cupBodyMesh = SceneUtils.createMultiMaterialObject(
    cupBodyGeometry,
    cupBodyMaterials
  );
  cupBodyMesh.name = "cupBody";
  cup.add(cupBodyMesh);

  /*****************************************************
   *   TOP                                             *
   *****************************************************/

  const cupTopGeometry = new THREE.TorusGeometry(1.29, 0.06, 0.16, 62);
  const cupTopMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.5,
    metalness: 0.5,
    emissive: 0xc4c4c4,
    overdraw: true,
  });

  const cupTop = new THREE.Mesh(cupTopGeometry, cupTopMaterial);
  cupTop.name = "cupTop";
  cupTop.position.set(0, 1.25, 0);
  cupTop.rotation.x = Math.PI / 2;

  cup.add(cupTop);

  /*****************************************************
   *   BOTTOM                                             *
   *****************************************************/

  const cupBottomGeometry = new THREE.CircleGeometry(2.083, 32); // Use the radius of the bottom of the cylinder
  const cupBottomMaterial = new THREE.MeshBasicMaterial({
    color: 0xc8cbcf,
    side: THREE.DoubleSide,
    overdraw: 0.5,
  });

  const cupBottomMesh = new THREE.Mesh(cupBottomGeometry, cupBottomMaterial);
  cupBottomMesh.name = "cupBottom";
  cupBottomMesh.position.set(0, -3, 0); // Position it at the bottom of the cylinder
  cupBottomMesh.rotation.x = Math.PI / 2; // Rotate to align with the bottom

  cup.add(cupBottomMesh);

  // flip the cup so it's facing up
  cup.rotation.x = Math.PI;

  return cup;
}

function gameInit() {
  const cupMaterial = new THREE.MeshStandardMaterial({
    roughness: 0,
    color: 0x00ff00,
  });
  const ballMaterial = new THREE.MeshStandardMaterial({
    roughness: 0,
    color: 0xff0000,
  });

  // Create geometry for the cups and ball
  const cupGeometry = new THREE.CylinderGeometry(2.5, 2.5, 5, 32);
  const ballGeometry = new THREE.SphereGeometry(1, 32, 32);

  // Create mesh for the cups
  cups = [];
  for (let i = 0; i < 3; i++) {
    const cup = renderCup();

    cup.position.x = i * 8 - 8;
    cup.position.y = 15 + 2.5; // half box height (30) + half the height of the cup (5)
    cup.position.z = 0;

    scene.add(cup);
    cups.push(cup);
  }

  // Create mesh for the ball
  ball = new THREE.Mesh(ballGeometry, ballMaterial);
  ball.position.y = 15 + 1; // half box height (30) + half the height of the ball (radius = 1)
  scene.add(ball);

  // Update renderer settings
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
  renderer.antialias = true;

  // Enable shadows for objects
  cups.forEach((cup) => (cup.castShadow = true));
  ball.castShadow = true;
}

gameInit();
let positions = [-8, 0, 8]; // Left, Middle, Right positions on the X-axis
let isSwitching = false;
let switchDuration = 1000; // Duration of the switch in milliseconds
let switchStartTime;
let cupToSwitch1, cupToSwitch2;

let switchQueue = [];
let numberOfSwitches = 5; // Number of switches to perform at the start

let revealDuration = 1000; // Duration to reveal the ball
let revealHeight = 5; // Height to lift the cups
let ballRevealed = false;

let ballUnderCupIndex = 1; // Index of the cup hiding the ball
let winningCupIndex = 1; // Index of the cup the user guesses
ball.position.x = 0;

let revealStartTime, revealEndTime;
let isRevealing = false;

function animateGame() {
  if (!isRevealing) {
    animateCups();
  }
  rayCaster.setFromCamera(mouse, camera);
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animateGame);

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
    let currentHeight = 15 + 2.5 + fraction * revealHeight;

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
    let currentHeight = revealHeight + 15 + 2.5 - fraction * revealHeight;

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
      winningCupIndex = positions[ballUnderCupIndex] / 8 + 1;
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

  const resultElement = document.getElementById("guessResult");
  resultElement.innerHTML = isCorrect ? "Correct!" : "Wrong Guess!";
  resultElement.classList.add("show");

  // Hide the message after a few seconds
  setTimeout(() => {
    resultElement.classList.remove("show");
  }, 2000);

  if (isCorrect) {
    console.log("Correct guess!");
    revealBall();
  } else {
    console.log("Try again!");
    revealBall();
  }
});

// Start the game by revealing the ball
revealBall();
animateGame();
