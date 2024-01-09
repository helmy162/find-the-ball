import waterNormals from "./images/waternormals.jpg"
import cupTextureSrc from "./images/cup.jpg"

import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";

import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { Water } from "three/examples/jsm/objects/Water.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { OrbitControls, SceneUtils } from "three/examples/jsm/Addons";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

let container, stats;
let camera, scene, renderer;
let controls, water, sun, mesh;
let jotaro;
let staticYacht,animatedBoat,boatSound;
let patrick,dog;
let fire,man,throne,speakers;
let jojo_model=false;
let speakerSound
let initialSpeakerVolume = 1
let initialBoatVolume = 1

const loader = new GLTFLoader();
const listener = new THREE.AudioListener();  // Audio Handler
const audioLoader = new THREE.AudioLoader(); 
var dogMixer = new THREE.AnimationMixer();  // Dog Animation
var fireMixer = new THREE.AnimationMixer(); // Fire Animation
var manMixer = new THREE.AnimationMixer(); // Sitting Man Animation
const clock = new THREE.Clock(); 
const loadingManager = new THREE.LoadingManager(); // Loading Screen



const audioParameters = {
  speakerVolume:1,
  boatVolume:1
}




let clouds = [];

class Throne{
  constructor(x,y,z)
  {

  loader.load(
  "./models/throne.glb",
   (gltf) => {
    this.model = gltf.scene;
    this.model.position.set(x,y,z);
    this.model.scale.set(20,20,20)
    scene.add(this.model);
  })
}
}
    
 class SittingMan{
  constructor(x,y,z)
  {
    
  loader.load(
  "./models/sittingMan.glb",
   (gltf) => {
    this.model = gltf.scene;
    this.model.position.set(x,y,z);
    this.model.scale.set(10,10,10)
    scene.add(this.model);

    // Animating the man
    manMixer = new THREE.AnimationMixer(this.model);
    const clips = gltf.animations;

    if (clips.length > 0) {
    const action = manMixer.clipAction(clips[0]); 
    action.play();
} 
    
  })
  }
}
class Speaker{
  constructor(x,y,z)
  { 
    loader.load("./models/speaker.glb",(gltf) =>{
      this.model = gltf.scene;
      this.model.scale.set(5, 5, 5);
      this.model.position.set(x,y,z)
      this.speaker = this.model


      speakerSound = new THREE.PositionalAudio(listener)
      const loader = new THREE.AudioLoader();
      loader.load('sounds/GaldinQuay.mp3', (buffer) => {
        speakerSound.setBuffer(buffer)
        speakerSound.setVolume(initialSpeakerVolume)
        speakerSound.setRefDistance(2)
        speakerSound.setLoop(true)
        speakerSound.play()
      });
      this.speaker.add(speakerSound)
        
      scene.add(this.model);
    });
}

  updateSpeakerVolume(volume)
  {
    speakerSound.setVolume(volume)
  }


 
}
class Fire{
  constructor(x,y,z)
  {
  loader.load(
  "./models/fire.glb",
   (gltf) => {
    this.model = gltf.scene;
    this.model.position.set(x,y,z);
    this.model.scale.set(6,6,6)
    scene.add(this.model);

    // Animating the fire
    fireMixer = new THREE.AnimationMixer(this.model);
    const clips = gltf.animations;

    if (clips.length > 0) {
    const action = fireMixer.clipAction(clips[0]); 
    action.play();
} 
    
  })
  }
}

class Dog{
  constructor(x,y,z)
  {
  loader.load(
  "./models/dog.glb",
   (gltf) => {
    this.model = gltf.scene;
    this.model.position.set(x,y,z);
    this.model.scale.set(0.1,0.1,0.1)
    this.model.castShadow=true;
    this.model.receiveShadow=true;

    scene.add(this.model);

    // Animating the Dog
    dogMixer = new THREE.AnimationMixer(this.model);
    const clips = gltf.animations;

    if (clips.length > 0) {
    const action = dogMixer.clipAction(clips[0]); 
    action.play();
} 
    
  })
  }
}
class Jotaro{
  
    constructor(x,y,z)
    {
    loader.load(
    "./models/jojo_st.glb",
    (gltf) => {
      this.model = gltf.scene;
      this.model.scale.set(0.4, 0.4, 0.4);
      this.model.position.set(x,y,z);
      this.model.castShadow=true;
      this.model.receiveShadow=true;

      scene.add(this.model);
      jojo_model = this.model;
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
    }
}
class Yacht{
  constructor(x,y,z)
  { 
    loader.load("./models/yacht.glb",(gltf) =>{
      this.model = gltf.scene;
      this.model.scale.set(15,15,15);
      this.model.position.set(x,y,z)
      this.model.rotation.set(0,180,0)
      this.yacht = this.model
      scene.add(this.model);

    });
  }
}

class Boat{
  constructor(x,y,z)
  { 
    loader.load("./models/boat.glb",(gltf) =>{
      this.model = gltf.scene;
      this.model.scale.set(15, 15, 15);
      this.model.position.set(x,y,z)
      this.boat = this.model
      boatSound = new THREE.PositionalAudio(listener)
      const loader = new THREE.AudioLoader();
      loader.load('sounds/ali.mp3', (buffer) => {
        boatSound.setBuffer(buffer)
        boatSound.setVolume(initialBoatVolume)
        boatSound.setRefDistance(2)
        boatSound.setLoop(false)
        boatSound.play()
      });
      this.boat.add(boatSound)
        
      scene.add(this.model);
    });
}
    update()
  {
    if(this.boat)
  {
    // Update boat's poisition
    this.boat.position.z -= 1
  }
}

  updateBoatVolume(volume)
  {
    boatSound.setVolume(volume)
  }


 
}
class Cloud {
  constructor(x, y, z, scale, target) {
    this.model = null;

    loader.load("./models/cloud.glb", (gltf) => {
      this.model = gltf.scene;
      scene.add(this.model);  
      clouds.push(this.model);
      this.model.scale.set(scale, scale, scale);
      this.model.position.set(x, y, z);

      this.changeColor(0xFFFFFF);
    });
  }

  changeColor(colorValue) {
    if (this.model) {
      this.model.traverse((o) => {
        if (o.isMesh) {
          const newMaterial = new THREE.MeshStandardMaterial({ color: colorValue });
          o.material = newMaterial;
        }
      });
    }
  }
}
class Island{
  constructor(x,y,z)
  { 
    loader.load("./models/tropical_island.glb",(gltf) =>{
      this.model = gltf.scene;
      this.model.position.set(x,y,z)
      this.island = this.model
      scene.add(this.model);
    });
  }
  update()
  {}
}
class Patrick {
  constructor(x, y, z,target) {
    loader.load("./models/patrick_star.glb", (gltf) => {
      this.model = gltf.scene;
      scene.add(this.model);
      this.model.scale.set(10,10,10);
      this.model.position.set(x, y, z);
      this.patrick = this.model;
    });
  }
}

// Usage


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
  camera.position.set(0, 40, 150);
  camera.add(listener)
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

  // Ambient Ocean Audio
  
  const oceanSound = new THREE.Audio( listener );

     
  audioLoader.load( 'sounds/ambient.mp3', ( buffer ) => {
    oceanSound.setBuffer( buffer );
    oceanSound.setLoop( true );
    oceanSound.setVolume( 0.2 );
    oceanSound.play();
  });

  //

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

  // Models Initialization [START]

jotaro = new Jotaro(0,1,0)
staticYacht = new Yacht(420,-5,-45)
animatedBoat = new Boat(-600,-15,-90)
Island = new Island(340,-15,-200)
patrick = new Patrick(50,0,380)
dog = new Dog(320,5,-70)
fire = new Fire(200,-10,-100)
man = new SittingMan(301.5,3,-70)
throne = new Throne(300,2,-70)
speakers = new Speaker(285,2,-70)

// Models Initialization [END]

  // GUI

  const gui = new GUI();

  gui.add(parameters, "azimuth", -180, 180, 0.1).onChange(updateSun);
  var volume = gui.addFolder('Volume Controls')
  volume.add(audioParameters, 'speakerVolume', 0, 100).name('Speaker Volume').onChange(updateSpeakerVolume)
  volume.add(audioParameters, 'boatVolume', 0, 100).name('Boat Volume').onChange(updateBoatVolume)


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
  animatedBoat.update()
  render();
  dogMixer.update(clock.getDelta())
  fireMixer.update(clock.getDelta()+0.01);
  manMixer.update(clock.getDelta()+ 0.02);
  stats.update();
  animateClouds();
  
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
  });
  cupBodyMaterial.name = "cupBodyMaterial";

  const cupTexture = new THREE.TextureLoader().load(cupTextureSrc);

  const cupBodyMaterialTexture = new THREE.MeshBasicMaterial({
    map: cupTexture,
    transparent: true,
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
   *   BOTTOM                                             *
   *****************************************************/

  const cupBottomGeometry = new THREE.CircleGeometry(2.083, 32); // Use the radius of the bottom of the cylinder
  const cupBottomMaterial = new THREE.MeshBasicMaterial({
    color: 0xc8cbcf,
    side: THREE.DoubleSide,
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




// generateClouds function
function generateClouds(){
  for(let i = 0; i < 8; i++){
    let x = Math.random() * 500 - 250;
    let y = Math.random() * 30 + 150;  
    let z = Math.random() * 500 - 250;
    const scale = Math.random() * 10 + 2;
    const single_cloud = new Cloud(x,y,z,scale);
  } 
}
// animateClouds function
function animateClouds() {
  clouds.forEach((cloud) => {
    cloud.position.x += 0.1; // Adjust the speed of cloud movement
    // Implement additional movement in other axes for a more natural effect

    // Reset cloud position when it goes beyond a certain limit to create a looping effect
    if (cloud.position.x > 250) {
      cloud.position.x = -250;
      // Implement similar checks and repositioning for other axes if needed
    }
  });
}
generateClouds();



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
  return position == 8 ? 2 : position == 0 ? 1 : 0;
}


// Function to update speaker's volume
function updateSpeakerVolume() {
  speakers.updateSpeakerVolume(audioParameters.speakerVolume)
}
// Function to update boat's volume
function updateBoatVolume() {
  animatedBoat.updateBoatVolume(audioParameters.boatVolume)
}


document.addEventListener("click", function (e) {
  if(isSwitching || ballRevealed) return;
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  rayCaster.setFromCamera(mouse, camera);

  const intersects = rayCaster.intersectObjects( cups );

  if (intersects.length == 0) return;

  const cup = intersects[0].object.type == "Mesh" ?
              intersects[0].object.parent.parent :
              intersects[0].object.name == "cupBody" ?
              intersects[0].object.parent :
              intersects[0].object;
      
  let clickCupPosition = Math.round(cup.position.x);
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
