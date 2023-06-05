import * as THREE from './threejs/three.module.js';
import { FBXLoader } from './threejs/FBXLoader.js';
import { GLTFLoader } from './threejs/GLTFLoader.js';
import { DRACOLoader } from './threejs//DRACOLoader.js';
import './helpers/eventListeners.js';
import { generateStars, generatePlanets, generateSun, animatePlanets } from './helpers/darkRoom.js';
import { initializeEventListener } from './helpers/eventListeners.js';
import { initializePlayerMovement, updatePosition } from './helpers/playerMovement.js';
import { createWallWithDoorHole, createCeiling, 
         createDoor, createFloor, createRotatedWallWithDoorHole} from './helpers/entranceRoom.js';
import { createCircularWindow, createGarden, createSunnyRoom, createWallWithTwoWindows, createWindow  } from './helpers/sunnyRoom.js';
import { hasRequiredRotations, closeDoor, startStatueRotation, animateStatueRotation, openDoor } from './helpers/animations.js';
import { createSimpleWall, createPainting  } from './helpers/general.js';

export const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 1.7;

initializePlayerMovement(camera, renderer);

initializeEventListener(camera, startStatueRotation);

const textureLoader = new THREE.TextureLoader();

const texture = textureLoader.load('assets/textures/Statue_Remeshed_Diffuse1K.png');
const material = new THREE.MeshPhongMaterial({ map: texture });

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('./threejs/draco/draco/');

const fbxLoader = new FBXLoader();
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

//For collisions
export let collidableObjects = [];

//--------------------------_Entrance Room_----------------------

const darkWoodTexture = textureLoader.load('./assets/textures/castle_brick_07_diff_1k.jpg');
const darkWoodMaterial = new THREE.MeshPhongMaterial({ map: darkWoodTexture });

const floorTexture = textureLoader.load('./assets/textures/castle_brick_07_diff_1k.jpg');
const floorMaterial = new THREE.MeshPhongMaterial({ map: floorTexture });
floorMaterial.castShadow = true;
floorMaterial.receiveShadow = true;

const floorWidth = 25;
const floorHeight = 0.1;
const floorDepth = floorWidth;
const floorPosition = { x: 0, y: 0.05, z: 0 };
const floor = createFloor(floorWidth, floorHeight, floorDepth, floorMaterial, floorPosition);
scene.add(floor);

const doorWidth = 1.75;
const doorHeight = 2.5;
const doorDepth = 0.2;

const leftDoor = createDoor(scene, -floorWidth / 2, 0.13, 0, Math.PI / 2, 
          darkWoodMaterial, doorWidth, doorHeight, doorDepth); 
          leftDoor.boundingBox = new THREE.Box3().setFromObject(leftDoor);
          collidableObjects.push(leftDoor);

export let sunnyRoomDoor;
sunnyRoomDoor = createDoor(scene, floorWidth / 2,    0.13, 0, -Math.PI / 2, 
          darkWoodMaterial, doorWidth, doorHeight, doorDepth);
          sunnyRoomDoor.boundingBox = new THREE.Box3().setFromObject(sunnyRoomDoor);
          collidableObjects.push(sunnyRoomDoor);


export let frontDoor = createDoor(scene, 0, 0.13, -floorWidth / 2, 0, 
          darkWoodMaterial, doorWidth, doorHeight, doorDepth);
          frontDoor.boundingBox = new THREE.Box3().setFromObject(frontDoor);
          collidableObjects.push(frontDoor);

const ceilingPositionY = 7;
const ceilingWidth = floorWidth / 2;
const ceilingHeight = 0.1;
const ceilingDepth = floorDepth;
const ceilingMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
createCeiling(scene, - floorWidth / 4, ceilingPositionY, 0, ceilingMaterial,
              ceilingWidth, ceilingHeight, ceilingDepth );


const frontWallBounds = createWallWithDoorHole(scene, -floorWidth / 2, 0, -floorWidth / 2, 0, 0xff0000, 
                       floorWidth, ceilingPositionY, 0.1, doorWidth * 2, doorHeight+0.1);
frontWallBounds.forEach(bounds => collidableObjects.push(bounds));

const leftWallBounds = createRotatedWallWithDoorHole(scene, -floorWidth / 2, 0, floorWidth / 2, Math.PI / 2, 0x00ff00,
                       floorWidth, ceilingPositionY, 0.1, doorWidth * 2, doorHeight + 0.1);
leftWallBounds.forEach(bounds => collidableObjects.push(bounds));

const rightWallBounds = createRotatedWallWithDoorHole(scene, floorWidth / 2, 0, floorWidth / 2, Math.PI / 2, 0x0000ff,
                       floorWidth, ceilingPositionY + 19.1, 0.1, doorWidth * 2, doorHeight + 0.1);
rightWallBounds.forEach(bounds => collidableObjects.push(bounds));

// back wall, no hole
let backWallEntranceRoomPosition = new THREE.Vector3(0, ceilingPositionY / 2, floorWidth / 2);
const backWallEntranceRoom = createSimpleWall(backWallEntranceRoomPosition, floorWidth, ceilingPositionY, 0.1, 0x123456, Math.PI, undefined, false);
scene.add(backWallEntranceRoom);
backWallEntranceRoom.updateMatrixWorld(true);
backWallEntranceRoom.boundingBox = new THREE.Box3().setFromObject(backWallEntranceRoom);
collidableObjects.push(backWallEntranceRoom);

const spotLight = new THREE.SpotLight(0xffffff, 1);
spotLight.position.set(0, ceilingHeight + 10, 0);
spotLight.angle = Math.PI / 2.5; 
spotLight.penumbra = 0.1;
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.bias = -0.005;
scene.add(spotLight);

//--------------------------_Sunny Room_----------------------

// -> This lights are to remove when delivering the project
// const sunnyPointLight = new THREE.PointLight(0xffffff, 1.0, 50);
// sunnyPointLight.castShadow = true;
// sunnyPointLight.receiveShadow = true;
// sunnyPointLight.position.set(floorWidth, 2, 0);
// sunnyPointLight.shadow.bias = -0.005;
// scene.add(sunnyPointLight);


const pointLight = new THREE.PointLight(0xffffff, 1.0, 100);
pointLight.position.set(0, 2, 0);
scene.add(pointLight);

const sunnyPointLight2 = new THREE.PointLight(0xffffff, 1.0, 50);
sunnyPointLight2.position.set(floorWidth + 10, 2, 0);
scene.add(sunnyPointLight2);

const sunnyPointLight3 = new THREE.PointLight(0xffffff, 1.0, 50);
sunnyPointLight3.position.set(floorWidth + 15, 2, 0);
scene.add(sunnyPointLight3);

const sunnyPointLight4 = new THREE.PointLight(0xffffff, 1.0, 1000);
sunnyPointLight4.position.set(-50, 2, 0);
scene.add(sunnyPointLight4);



const sunnyFloorTexture = textureLoader.load('./assets/textures/red_sandstone_pavement_diff_1k.jpg');
const sunnyFloorMaterial = new THREE.MeshPhongMaterial({ map: sunnyFloorTexture });
sunnyFloorMaterial.castShadow = true;
sunnyFloorMaterial.receiveShadow = true;


const sunnyFloorWidth = 40;
const sunnyFloorHeight = 0.1;
const sunnyFloorDepth = sunnyFloorWidth - 15;

const sunnyfloorPosition = { x: floorWidth + 7.5, y: 0.05, z: 0 };
const sunnyFloor = createFloor(sunnyFloorWidth, sunnyFloorHeight, sunnyFloorDepth, sunnyFloorMaterial, sunnyfloorPosition);
scene.add(sunnyFloor);

const sunnyRoomWidth = 19.5;
const sunnyRoomHeight = floorWidth;
const sunnyRoomDepth = floorDepth * 2;
const segments = 16;
const sunnyRoom = createSunnyRoom(sunnyRoomWidth, sunnyRoomHeight, sunnyRoomDepth, segments, doorWidth, doorHeight);
sunnyRoom.position.set(floorWidth / 2,0 ,floorWidth / 2 );

scene.add(sunnyRoom);



const wallPosition = { x: 49.5, y: 0.05 , z: 0 };
const wallWidth = sunnyFloorWidth / 1.5;
const wallHeight = ceilingPositionY + 19.1;
const wallDepth = 0.4;

const rectWindowWidth = 10;
const rectWindowHeight = 5;
const rectWindowPosition = { x: 0, y: ceilingPositionY + 2 };

const circularWindowRadius = 2;
const circularWindowPosition = { x: 0, y: 18 };

const wallColor = 0x654321;
const wallRotationY = Math.PI / 2; 

const sunnyRoomFrontWall = createWallWithTwoWindows(wallPosition, wallWidth, wallHeight, wallDepth, 
                           rectWindowWidth, rectWindowHeight, rectWindowPosition, 
                           circularWindowRadius, circularWindowPosition, 
                           wallColor, wallRotationY, null);
scene.add(sunnyRoomFrontWall);
sunnyRoomFrontWall.updateMatrixWorld(true);
sunnyRoomFrontWall.boundingBox = new THREE.Box3().setFromObject(sunnyRoomFrontWall);
collidableObjects.push(sunnyRoomFrontWall);


const paneMaterial = new THREE.MeshPhongMaterial({
 color: 0xFFFFFF, 
 transparent: true, 
 opacity: 0
});

const windowPosition = { x: 49.5, y: ceilingPositionY + 2, z: 0 };
const windowWidth = rectWindowWidth - 0.1;
const windowHeight = rectWindowHeight - 0.1;
const windowDepth = wallDepth - 0.1;
const windowFrameColor = 0x652233
const windowRotationY = Math.PI / 2; 
scene.add(createWindow(windowPosition, windowWidth, windowHeight, windowDepth, windowFrameColor, windowRotationY, null, paneMaterial));

let radius = 2;
let position = new THREE.Vector3(49.5, 18, 0);
let rotation = new THREE.Vector3(0, 0, Math.PI / 2); 
let color = 0xff0000;

let roseWindowtexture = new THREE.TextureLoader().load('./assets/textures/roseWindow2.jpg');
const roseWindowmaterial = new THREE.MeshPhongMaterial({
  map: roseWindowtexture,
  transparent: true,
  side: THREE.DoubleSide
});

let window1 = createCircularWindow(radius, position, rotation, color, roseWindowmaterial);
scene.add(window1);

position = new THREE.Vector3(30, 0.1, 0);
rotation = new THREE.Vector3(0, Math.PI / 2, 0); 
let window2 = createCircularWindow(radius, position, rotation, color, roseWindowmaterial);
scene.add(window2);

//---------------------------_SunnyRoomPaintings_----------------------------
const positionPaintingX = 12.7;
const positionPaintingY = 2;
const positionPaintingZ = 3.5;

const normalPaitingwidth = 2;
const normalPaitingHeight = 3;
const normalPaitingFrameThickness = 0.1;

const positionPainting = new THREE.Vector3(positionPaintingX, positionPaintingY, positionPaintingZ);
const rotationPaintingVertical = new THREE.Vector3(0, Math.PI / 2, 0);
const rotationPaintingVerticalInverse = new THREE.Vector3(0, - Math.PI / 2, 0);
const rotationPaintingHorizontalTilt = new THREE.Vector3(Math.PI / 16, 0, Math.PI / 2);
const rotationPaintingHorizontalTiltInverse = new THREE.Vector3(-Math.PI / 14, Math.PI, Math.PI / 2);

// Back wall
createPainting(
  scene, positionPainting, rotationPaintingVertical, 
  2, 3, 0.1, './assets/textures/151090.jpg',
  {
    name: "The Starry Night",
    artist: "Vincent van Gogh",
    year: "1889",
    description: "The Starry Night is an oil on canvas painting by Dutch Post-Impressionist painter Vincent van Gogh."
  }
);

positionPainting.z = positionPaintingZ + 3.5;
createPainting(scene, positionPainting, rotationPaintingVertical, 
  2, 3, 0.1, './assets/textures/151090.jpg', {
    name: "Mona Lisa",
    artist: "Leonardo da Vinci",
    year: "1517",
    description: "The Mona Lisa is a half-length portrait painting by Italian artist Leonardo da Vinci."
  }
);



positionPainting.z = positionPaintingZ - 7.5;
createPainting(scene, positionPainting, rotationPaintingVertical, normalPaitingwidth, normalPaitingHeight, normalPaitingFrameThickness, './assets/textures/151090.jpg');
positionPainting.z = positionPaintingZ - 11;
createPainting(scene, positionPainting, rotationPaintingVertical, 2, normalPaitingHeight, normalPaitingFrameThickness, './assets/textures/151090.jpg');
positionPainting.y = positionPaintingY + 8;
positionPainting.z = positionPaintingZ - 4;
createPainting(scene, positionPainting, rotationPaintingVertical, 10, 9, normalPaitingFrameThickness, './assets/textures/151090.jpg');

//Left wall
positionPainting.x = positionPaintingX + 6;
positionPainting.y = positionPaintingY + 1;
positionPainting.z = positionPaintingZ - 15.1;
createPainting(scene, positionPainting, rotationPaintingHorizontalTilt, normalPaitingwidth * 2, normalPaitingHeight * 2, normalPaitingFrameThickness, './assets/textures/151090.jpg');
positionPainting.x = positionPaintingX + 13;
createPainting(scene, positionPainting, rotationPaintingHorizontalTilt, normalPaitingwidth * 2, normalPaitingHeight * 2, normalPaitingFrameThickness, './assets/textures/151090.jpg');
positionPainting.x = positionPaintingX + 21;
createPainting(scene, positionPainting, rotationPaintingHorizontalTilt, normalPaitingwidth * 2, normalPaitingHeight * 2, normalPaitingFrameThickness, './assets/textures/151090.jpg');
positionPainting.x = positionPaintingX + 30;
createPainting(scene, positionPainting, rotationPaintingHorizontalTilt, normalPaitingwidth * 2, normalPaitingHeight * 2, normalPaitingFrameThickness, './assets/textures/151090.jpg');
positionPainting.x = positionPaintingX + 10;
positionPainting.y = positionPaintingY + 9;
positionPainting.z = positionPaintingZ - 13;
createPainting(scene, positionPainting, rotationPaintingHorizontalTilt, 10, 9, normalPaitingFrameThickness, './assets/textures/151090.jpg');
positionPainting.x = positionPaintingX + 23;
createPainting(scene, positionPainting, rotationPaintingHorizontalTilt, 10, 9, normalPaitingFrameThickness, './assets/textures/151090.jpg');

//Right Wall
positionPainting.x = positionPaintingX + 6;
positionPainting.y = positionPaintingY + 1;
positionPainting.z = positionPaintingZ + 8.15;
createPainting(scene, positionPainting, rotationPaintingHorizontalTiltInverse, normalPaitingwidth * 2, normalPaitingHeight * 2, normalPaitingFrameThickness, './assets/textures/151090.jpg');
positionPainting.x = positionPaintingX + 13;
createPainting(scene, positionPainting, rotationPaintingHorizontalTiltInverse, normalPaitingwidth * 2, normalPaitingHeight * 2, normalPaitingFrameThickness, './assets/textures/151090.jpg');
positionPainting.x = positionPaintingX + 21;
createPainting(scene, positionPainting, rotationPaintingHorizontalTiltInverse, normalPaitingwidth * 2, normalPaitingHeight * 2, normalPaitingFrameThickness, './assets/textures/151090.jpg');
positionPainting.x = positionPaintingX + 30;
createPainting(scene, positionPainting, rotationPaintingHorizontalTiltInverse, normalPaitingwidth * 2, normalPaitingHeight * 2, normalPaitingFrameThickness, './assets/textures/151090.jpg');
positionPainting.x = positionPaintingX + 10;
positionPainting.y = positionPaintingY + 9;
positionPainting.z = positionPaintingZ + 6;
createPainting(scene, positionPainting, rotationPaintingHorizontalTiltInverse, 10, 9, normalPaitingFrameThickness, './assets/textures/151090.jpg');
positionPainting.x = positionPaintingX + 23;
createPainting(scene, positionPainting, rotationPaintingHorizontalTiltInverse, 10, 9, normalPaitingFrameThickness, './assets/textures/151090.jpg');


//Front wall
positionPainting.x = positionPaintingX + 36.6;
positionPainting.y = positionPaintingY + 1;
positionPainting.z = positionPaintingZ + 5;
createPainting(scene, positionPainting, rotationPaintingVerticalInverse, normalPaitingwidth + 1, normalPaitingHeight + 1, normalPaitingFrameThickness, './assets/textures/151090.jpg');
positionPainting.z = positionPaintingZ;
createPainting(scene, positionPainting, rotationPaintingVerticalInverse, normalPaitingwidth + 1, normalPaitingHeight + 1, normalPaitingFrameThickness, './assets/textures/151090.jpg');
positionPainting.z = positionPaintingZ -5;
createPainting(scene, positionPainting, rotationPaintingVerticalInverse, normalPaitingwidth + 1, normalPaitingHeight + 1, normalPaitingFrameThickness, './assets/textures/151090.jpg');
positionPainting.z = positionPaintingZ -10;
createPainting(scene, positionPainting, rotationPaintingVerticalInverse, normalPaitingwidth + 1, normalPaitingHeight + 1, normalPaitingFrameThickness, './assets/textures/151090.jpg');


//---------------------------_SunnyRoomLight_--------------------------------

const spotLightSunnyRoom = new THREE.SpotLight(0xFFFFFF, 1, 0, Math.PI); 
spotLightSunnyRoom.position.set(47, ceilingPositionY + 2, 0);
spotLightSunnyRoom.castShadow = true;
spotLightSunnyRoom.shadow.bias = -0.001;
scene.add(spotLightSunnyRoom);

const spotLightSunnyRoom2 = new THREE.SpotLight(0xFFFFFF, 1, 0, Math.PI); 
spotLightSunnyRoom2.position.set(13, ceilingPositionY + 2, 0); 
spotLightSunnyRoom2.castShadow = true;
spotLightSunnyRoom2.shadow.bias = -0.001;
scene.add(spotLightSunnyRoom2);

const spotLightSunnyRoom3 = new THREE.SpotLight(0xFF0000, 1, 0, Math.PI); 
spotLightSunnyRoom3.position.set(47, 18, 0);
spotLightSunnyRoom3.castShadow = true;
spotLightSunnyRoom3.shadow.bias = -0.001;
scene.add(spotLightSunnyRoom3);

export let sunnyRoomBoundary;
sunnyRoomBoundary = new THREE.Box3(
  new THREE.Vector3(sunnyFloorWidth/2, 0, sunnyFloorDepth / 2),
  new THREE.Vector3(sunnyFloorWidth * 1.5, sunnyRoomHeight / 2, sunnyFloorDepth* 1.5)
);

let translationVector = new THREE.Vector3(-7.4, 0.1, -25);
sunnyRoomBoundary.min.add(translationVector);
sunnyRoomBoundary.max.add(translationVector);

// const sunnyRoomBoundaryHelper = new THREE.Box3Helper(sunnyRoomBoundary, 0xff0000);
// scene.add(sunnyRoomBoundaryHelper);

export function isInsideSunnyRoom(camera, boundary) {
  const cameraPosition = camera.position;
  return boundary.containsPoint(cameraPosition);
}

//-----------------------------_SunnyRoomStatues_-------------------------

window.addEventListener('statueFacingCorrectDirection', function (event) {
  if (hasRequiredRotations()) { 
    spotLightSunnyRoom.intensity = 0;
    spotLightSunnyRoom2.intensity = 0;
    spotLightSunnyRoom3.intensity = 1;
    openDoor(sunnyRoomDoor);
  }
});


const gardenPosition = { x: 30, y: 0.5, z: 0 };
createGarden(scene, gardenPosition, 8, 4, 100, 0.1, Math.PI / 2);

export let models = [];

// fbxLoader.load(
//   './assets/models/StatuePot.fbx',
//   (fbx) => {
//     fbx.scale.set(0.05, 0.05, 0.05);
//     fbx.position.set(30, 0, 3.1);
//     models.push(fbx);
//     fbx.traverse(function(node) {
//       if (node.isMesh) {
//         node.castShadow = true;
//         node.material = material;
//       }
//     });
//     scene.add(fbx);
//   },
//   undefined, 
//   (error) => console.error(error)
// );

// fbxLoader.load(
//   './assets/models/chubbyAngel.fbx',
//   (fbx) => {
//     fbx.scale.set(0.15, 0.15, 0.15);
//     fbx.position.set(30, 0, -3);
//     models.push(fbx);
//     fbx.traverse(function(node) {
//       if (node.isMesh) {
//         node.castShadow = true;
//       }
//     });
//     scene.add(fbx);
//   },
//   undefined, 
//   (error) => console.error(error)
// );

// gltfLoader.load(
//   './assets/models/ScholarStatue.glb',
//   (gltf) => {
//     const model = gltf.scene;

//     model.scale.set(0.002, 0.002, 0.002);
//     model.position.set(33, 0, 0);

//     models.push(model);

//     model.traverse(function(node) {
//       if (node.isMesh) {
//         node.castShadow = true;
//       }
//     });

//     scene.add(model);
//   },
//   undefined, 
//   (error) => console.error(error)
// );

//---------------------_Dark Room_----------------------------

const planets1Bounds = new THREE.Box3(new THREE.Vector3(1000, 10, -10), new THREE.Vector3(-10, 10, 10));
const planets2Bounds = new THREE.Box3(new THREE.Vector3(-10, 10, -10), new THREE.Vector3(-10, 10, 10));

const stars1Bounds = new THREE.Box3(new THREE.Vector3(-70, -35, -50), new THREE.Vector3(70, 55, 50));
const stars2Bounds = new THREE.Box3(new THREE.Vector3(-70, -15, -90), new THREE.Vector3(70, 80, 90));

const restrictedZonesForStarts = [stars1Bounds, stars2Bounds];
const restrictedZones = [planets1Bounds, planets2Bounds];

const stars = generateStars(1000, restrictedZonesForStarts);
scene.add(stars);
const planets = generatePlanets(10, restrictedZones);
scene.add(planets);

const sun = generateSun(restrictedZones);
scene.add(sun);

//Light to see the door
const spotLightDarkRoomDoor = new THREE.SpotLight(0xff0000, 0); 
spotLightDarkRoomDoor.position.set(-10, 4, 0); 
spotLightDarkRoomDoor.target.position.set(-13, 0, 0); 
scene.add(spotLightDarkRoomDoor);
scene.add(spotLightDarkRoomDoor.target);

//Dark Room boundary box
export let darkRoomBoundary;
darkRoomBoundary = new THREE.Box3(
  new THREE.Vector3(sunnyFloorWidth/2, 0, sunnyFloorDepth / 2),
  new THREE.Vector3(sunnyFloorWidth * 1.5, sunnyRoomHeight / 2, sunnyFloorDepth* 1.5)
);

let translationVectorDarkRoom = new THREE.Vector3(-73, 0.1, -25);
darkRoomBoundary.min.add(translationVectorDarkRoom);
darkRoomBoundary.max.add(translationVectorDarkRoom);

// const darkRoomBoundaryHelper = new THREE.Box3Helper(darkRoomBoundary, 0xff0000);
// scene.add(darkRoomBoundaryHelper);

export function isInsideDarkRoom(camera, darkRoomBoundary) {
  const cameraPosition = camera.position;
  return darkRoomBoundary.containsPoint(cameraPosition);
}






//Black walls for collision in DarkRoom, the extra parameters are to take out the shininess because I don't want the walls to be seen
let darkRoomFrontWallPosition = new THREE.Vector3(-floorWidth * 1.5, 0, 0);
const darkRoomFrontWall = createSimpleWall(darkRoomFrontWallPosition, floorWidth, 2, 0.1, 0xff0000, Math.PI / 2, undefined, false);
scene.add(darkRoomFrontWall);
darkRoomFrontWall.updateMatrixWorld(true);
darkRoomFrontWall.boundingBox = new THREE.Box3().setFromObject(darkRoomFrontWall);
collidableObjects.push(darkRoomFrontWall);

let darkRoomLeftWallPosition = new THREE.Vector3(-floorWidth, 0, floorWidth / 2);
const darkRoomLeftWall = createSimpleWall(darkRoomLeftWallPosition, floorWidth, 2, 0.1, 0xff0000, Math.PI, undefined, false);
scene.add(darkRoomLeftWall);
darkRoomLeftWall.updateMatrixWorld(true);
darkRoomLeftWall.boundingBox = new THREE.Box3().setFromObject(darkRoomLeftWall);
collidableObjects.push(darkRoomLeftWall);

let darkRoomRightWallPosition = new THREE.Vector3(-floorWidth, 0, -floorWidth / 2);
const darkRoomRightWall = createSimpleWall(darkRoomRightWallPosition, floorWidth, 2, 0.1, 0xff0000, Math.PI, undefined, false);
scene.add(darkRoomRightWall);
darkRoomRightWall.updateMatrixWorld(true);
darkRoomRightWall.boundingBox = new THREE.Box3().setFromObject(darkRoomRightWall);
collidableObjects.push(darkRoomRightWall);

//Dark Room Paitings
positionPainting.x = positionPaintingX + 6;
positionPainting.y = positionPaintingY + 1;
positionPainting.z = positionPaintingZ - 15.1;

// Back wall
createPainting(
  scene, positionPainting, rotationPaintingVertical, 2, 3, 0.1, './assets/textures/151090.jpg') 


  // const cubeGeometry = new THREE.BoxGeometry(5, 5, 5);
// const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
// cube.position.set(-floorWidth / 2, 2, 0);
// scene.add(cube);
  


//---------------------Animate------------------

let enteredSunnyRoom = false;
export let enteredDarkRoom = false;

function animate() {
  requestAnimationFrame(animate);
  animateStatueRotation();
  animatePlanets(planets, sun);

  if (isInsideSunnyRoom(camera, sunnyRoomBoundary)) {
    enteredSunnyRoom = true; 
      if(spotLightSunnyRoom3.intensity === 0) {
          spotLightSunnyRoom.intensity = 1;
          spotLightSunnyRoom2.intensity = 1;
          closeDoor(sunnyRoomDoor);
      }
  } else {
      spotLightSunnyRoom.intensity = 0;
      spotLightSunnyRoom2.intensity = 0;
      spotLightSunnyRoom3.intensity = 0;
  }

  if(enteredSunnyRoom == true){
    spotLightDarkRoomDoor.intensity = 1; 
  }
  if (sun) {
    sun.rotation.y += 0.001;
  }
  if (isInsideDarkRoom(camera, darkRoomBoundary)) {
    enteredDarkRoom == true;
  }

  updatePosition(camera);
  renderer.render(scene, camera);
}

animate();



