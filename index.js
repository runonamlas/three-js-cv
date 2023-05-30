import { CharacterControls } from './characterControls';
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// MapStepPositionList
var stepPositionList = [];


// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa8def0);
scene.add(new THREE.AxesHelper(10))


// CAMERA
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0,3,-8);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true

// CONTROLS
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true
orbitControls.minDistance = 1
//orbitControls.maxDistance = 150
orbitControls.enablePan = false
//orbitControls.maxPolarAngle = Math.PI / 2 - 0.05
orbitControls.update();



// LIGHTS
light()

// FLOOR
generateFloor()

// MODEL WITH ANIMATIONS
var characterControls
new GLTFLoader().load('assets/character/character.glb', function (gltf) {
    const model = gltf.scene;
    model.traverse(function (object) {
        if (object.isMesh) object.castShadow = true;
    });
    scene.add(model);

    const gltfAnimations = gltf.animations;
    const mixer = new THREE.AnimationMixer(model);
    const animationsMap = new Map()
    gltfAnimations.filter(a => a.name != 'TPose').forEach((a) => {
        animationsMap.set(a.name, mixer.clipAction(a))
    })

    characterControls = new CharacterControls(model, mixer, animationsMap, orbitControls, camera,  'idle')
});

createStepRight(17.25,19.8,0.3)
createStepLeft(17.25,19.8,0.9)


/*
//CUBE
const geometryk = new THREE.BoxGeometry( 20, 0.3, 15 ); 
const materialk = new THREE.MeshStandardMaterial( {color: 0x9b7053} ); 
const cube = new THREE.Mesh( geometryk, materialk ); 
cube.receiveShadow = true
cube.castShadow = true
cube.position.z= geometryk.parameters.depth/2+5;
cube.position.y=geometryk.parameters.height/2;
cube.geometry.computeBoundingBox();
var posim = cube.position.clone()
geometryk.boundingBox.min.add(posim)
stepPositionList.push(geometryk.boundingBox)
scene.add( cube );*/

// CONTROL KEYS
const keysPressed = {  }
//const keyDisplayQueue = new KeyDisplay();
document.addEventListener('keydown', (event) => {(keysPressed)[event.key.toLowerCase()] = true}, false);
document.addEventListener('keyup', (event) => {(keysPressed)[event.key.toLowerCase()] = false
}, false);

const clock = new THREE.Clock();
// ANIMATE
function animate() {
    let mixerUpdateDelta = clock.getDelta();
    if (characterControls) {
        characterControls.update(mixerUpdateDelta, keysPressed, stepPositionList);
    }
    orbitControls.update()
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
document.body.appendChild(renderer.domElement);
animate();

// RESIZE HANDLER
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    //keyDisplayQueue.updatePosition()
}
window.addEventListener('resize', onWindowResize);

function generateFloor() {
    const WIDTH = 40
    const LENGTH = 40

    const geometry = new THREE.PlaneGeometry(WIDTH, LENGTH, 512, 512);
    const material = new THREE.MeshPhongMaterial({
        color: 0x9b7653,
      })

    const floor = new THREE.Mesh(geometry, material)
    floor.receiveShadow = true
    floor.rotation.x = - Math.PI / 2
    scene.add(floor)
}

function light() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.7))

    const dirLight = new THREE.DirectionalLight(0xffffff, 1)
    dirLight.position.set(- 60, 100, - 20);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = - 50;
    dirLight.shadow.camera.left = - 50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 200;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    
    scene.add(dirLight);
    scene.add( new THREE.DirectionalLightHelper(dirLight))
}

function createStepRight(width,height,yPosition){
    var depth = 0.20; // Paralelkenarın derinliği
    var shape = new THREE.Shape();

    // Paralelkenarın köşe noktalarını belirleyin
    var x1 = 0; // Sol alt köşe x koordinatı
    var y1 = 0; // Sol alt köşe y koordinatı

    var x2 = width; // Sağ alt köşe x koordinatı
    var y2 = 0; // Sağ alt köşe y koordinatı

    var x3 = width; // Sağ üst köşe x koordinatı
    var y3 = height; // Sağ üst köşe y koordinatı

    var x4 = -height * Math.tan(Math.PI /40); // Sol üst köşe x koordinatı
    var y4 = height; // Sol üst köşe y koordinatı

    shape.moveTo(x1, y1);
    shape.lineTo(x2, y2);
    shape.lineTo(x3, y3);
    shape.lineTo(x4, y4);
    shape.lineTo(x1, y1);

    var extrudeSettings = {
    depth: depth
    };
    var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    var material = new THREE.MeshStandardMaterial({ color: 0x9b7053 });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = Math.PI / 2
    mesh.rotation.z = Math.PI / 2
    mesh.position.y = yPosition
    mesh.position.x = height/2
    mesh.position.z = width/6
    mesh.receiveShadow = true
    mesh.castShadow = true
    geometry.computeBoundingBox();
    var posim = mesh.position.clone()
    console.log(geometry.boundingBox)
    geometry.boundingBox.min.add(posim)
    console.log(geometry.boundingBox)
    stepPositionList.push(geometry.boundingBox)
    scene.add(mesh);
}

function createStepLeft(width,height,yPosition){
    var depth = 0.20; // Paralelkenarın derinliği
    var shape = new THREE.Shape();

    // Paralelkenarın köşe noktalarını belirleyin
    var x1 = 0; // Sol alt köşe x koordinatı
    var y1 = 0; // Sol alt köşe y koordinatı

    var x2 = width; // Sağ alt köşe x koordinatı
    var y2 = 0; // Sağ alt köşe y koordinatı

    var x3 = width; // Sağ üst köşe x koordinatı
    var y3 = height; // Sağ üst köşe y koordinatı
    
    var x4 = height * Math.tan(Math.PI / 40); // Sol üst köşe x koordinatı
    var y4 = height; // Sol üst köşe y koordinatı

    shape.moveTo(x1, y1);
    shape.lineTo(x2, y2);
    shape.lineTo(x3, y3);
    shape.lineTo(x4, y4);
    shape.lineTo(x1, y1);

    var extrudeSettings = {
    depth: depth
    };
    var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    var material = new THREE.MeshStandardMaterial({ color: 0x9b7053 });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = Math.PI / 2
    mesh.rotation.z = Math.PI / 2
    mesh.position.y = yPosition
    mesh.position.x = height/2
    mesh.position.z = width/6
    mesh.receiveShadow = true
    mesh.castShadow = true
    mesh.geometry.computeBoundingBox();
    var posim = mesh.position.clone()
    geometry.boundingBox.min.add(posim)
    stepPositionList.push(geometry.boundingBox)
    scene.add(mesh);
}