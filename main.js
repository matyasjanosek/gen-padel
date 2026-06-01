import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// ── HERO ──────────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0d08);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(4, 2.5, 7);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
document.getElementById('hero').appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0x223311, 0x0a0d08, 1));
const key = new THREE.DirectionalLight(0xb5f23d, 1.5);
key.position.set(5, 10, 5);
scene.add(key);
const fill = new THREE.DirectionalLight(0xffffff, 0.3);
fill.position.set(-5, 3, -3);
scene.add(fill);
const point = new THREE.PointLight(0xb5f23d, 2, 20);
point.position.set(0, 3, 0);
scene.add(point);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;
controls.enableZoom = false;

const count = 200;
const positions = new Float32Array(count * 3);
for (let i = 0; i < count; i++) {
  const r = 4 + Math.random() * 6;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.random() * Math.PI;
  positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
  positions[i * 3 + 1] = r * Math.cos(phi) * 0.5;
  positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
}
const pgeo = new THREE.BufferGeometry();
pgeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particles = new THREE.Points(pgeo, new THREE.PointsMaterial({ color: 0xb5f23d, size: 0.06, transparent: true, opacity: 0.6 }));
scene.add(particles);

// Draco + loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

var loaderBar = document.getElementById('loader-bar');
var loaderEl = document.getElementById('loader');
var fakeProgress = 0;
var fakeInterval = setInterval(function() {
  fakeProgress += 4;
  if (fakeProgress >= 85) clearInterval(fakeInterval);
  loaderBar.style.width = fakeProgress + '%';
}, 80);

loader.load('padel_court_compressed.glb', (gltf) => {
  const model = gltf.scene;
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const scale = 5 / Math.max(size.x, size.y, size.z);
  model.scale.setScalar(scale);
  model.position.sub(center.multiplyScalar(scale));
  scene.add(model);

  clearInterval(fakeInterval);
  loaderBar.style.width = '100%';
  setTimeout(function() {
    loaderEl.style.opacity = '0';
    loaderEl.style.transition = 'opacity 0.6s ease';
    setTimeout(function() { loaderEl.style.display = 'none'; }, 600);
  }, 300);
});

// ── SCROLL BALL ───────────────────────────────────────────────────────────────
const ballRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
ballRenderer.setPixelRatio(window.devicePixelRatio);
ballRenderer.setSize(160, 160);
ballRenderer.domElement.style.position = 'fixed';
ballRenderer.domElement.style.right = '2rem';
ballRenderer.domElement.style.bottom = '50%';
ballRenderer.domElement.style.zIndex = '200';
ballRenderer.domElement.style.pointerEvents = 'none';
ballRenderer.domElement.style.transition = 'bottom 0.1s ease-out';
document.body.appendChild(ballRenderer.domElement);

const ballScene = new THREE.Scene();
const ballCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
ballCamera.position.z = 3;
ballScene.add(new THREE.AmbientLight(0xffffff, 0.5));
const ballLight = new THREE.DirectionalLight(0xb5f23d, 2);
ballLight.position.set(2, 2, 2);
ballScene.add(ballLight);

const ballLoader = new GLTFLoader();
ballLoader.setDRACOLoader(dracoLoader);
ballLoader.load('ball_compressed.glb', (gltf) => {
  const m = gltf.scene;
  const b = new THREE.Box3().setFromObject(m);
  const s = b.getSize(new THREE.Vector3());
  m.scale.setScalar(1.2 / Math.max(s.x, s.y, s.z));
  ballScene.add(m);
  window._ball = m;
});

window.addEventListener('scroll', () => {
  const progress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
  const bottomPct = 50 - progress * 40;
  ballRenderer.domElement.style.bottom = bottomPct + '%';
  if (window._ball) {
    window._ball.rotation.x = progress * Math.PI * 4;
    window._ball.rotation.z = progress * Math.PI * 2;
  }

  // hide buttons near footer
  var footerTop = document.querySelector('footer').getBoundingClientRect().top;
  var arBtn = document.querySelector('.ar-wrap');
  var aiBtn = document.querySelector('.ai-btn');
  if (footerTop < 120) {
    arBtn.classList.add('btn-hidden');
    aiBtn.classList.add('btn-hidden');
  } else {
    arBtn.classList.remove('btn-hidden');
    aiBtn.classList.remove('btn-hidden');
  }
});

// ── TORUS ─────────────────────────────────────────────────────────────────────
const torusCanvas = document.getElementById('torus-canvas');
const torusRenderer = new THREE.WebGLRenderer({ canvas: torusCanvas, antialias: true });
torusRenderer.setClearColor(0x0a0d08);

const torusScene = new THREE.Scene();
const torusCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
torusCamera.position.z = 6;

torusScene.add(new THREE.AmbientLight(0xffffff, 0.4));
const tLight = new THREE.DirectionalLight(0xb5f23d, 2);
tLight.position.set(3, 3, 3);
torusScene.add(tLight);

const torus = new THREE.Mesh(
  new THREE.TorusGeometry(1.8, 0.4, 16, 60),
  new THREE.MeshPhongMaterial({ color: 0x1e2419, emissive: 0x0a1a05, shininess: 80 })
);
torusScene.add(torus);

const wire = new THREE.Mesh(
  new THREE.TorusGeometry(1.8, 0.4, 16, 60),
  new THREE.MeshBasicMaterial({ color: 0xb5f23d, wireframe: true, transparent: true, opacity: 0.3 })
);
torusScene.add(wire);

function resizeTorus() {
  const w = torusCanvas.clientWidth;
  const h = torusCanvas.clientHeight;
  torusRenderer.setSize(w, h);
  torusCamera.aspect = w / h;
  torusCamera.updateProjectionMatrix();
}
resizeTorus();

// ── RESIZE ────────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  resizeTorus();
});

// ── RENDER LOOP ───────────────────────────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);

  controls.update();
  particles.rotation.y += 0.0008;
  particles.rotation.x += 0.0003;
  renderer.render(scene, camera);

  if (window._ball) window._ball.rotation.y += 0.01;
  ballRenderer.render(ballScene, ballCamera);

  torus.rotation.x += 0.004;
  torus.rotation.y += 0.007;
  wire.rotation.x += 0.004;
  wire.rotation.y += 0.007;
  torusRenderer.render(torusScene, torusCamera);
}
animate();
