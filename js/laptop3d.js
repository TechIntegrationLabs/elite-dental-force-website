/**
 * Elite Dental Force - 3D Laptop Hero
 * Three.js + GLTFLoader via CDN (no build step needed)
 * Replaces the flat dashboard image with an interactive 3D laptop
 */

(function () {
  'use strict';

  // Wait for Three.js to load
  if (typeof THREE === 'undefined') {
    console.warn('Three.js not loaded, skipping 3D laptop');
    return;
  }

  const container = document.getElementById('laptop3d');
  if (!container) return;

  // Hide the old flat dashboard image
  const oldWrapper = document.querySelector('.dashboard-wrapper');
  if (oldWrapper) oldWrapper.style.display = 'none';

  // ── Scene Setup ──
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(-4, 1.5, 8);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  // ── Lighting ──
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
  mainLight.position.set(8, 10, 5);
  mainLight.castShadow = false;
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0x60a5fa, 0.3);
  fillLight.position.set(-5, 3, -5);
  scene.add(fillLight);

  const rimLight = new THREE.PointLight(0x00d4ff, 0.5, 20);
  rimLight.position.set(-3, 2, -4);
  scene.add(rimLight);

  // ── Load Model ──
  const LoaderClass = THREE.GLTFLoader || THREE.GLTFLoader;
  if (!LoaderClass) {
    console.warn('GLTFLoader not available, showing fallback');
    if (oldWrapper) oldWrapper.style.display = '';
    return;
  }
  const loader = new LoaderClass();

  // Create a screen texture from the dashboard screenshot
  const textureLoader = new THREE.TextureLoader();
  const screenTexture = textureLoader.load('images/edifi-dashboard-hero.webp');
  screenTexture.colorSpace = THREE.SRGBColorSpace;
  screenTexture.flipY = false;

  let laptopGroup = null;
  let mixer = null;

  loader.load(
    'models/laptop.glb',
    function (gltf) {
      laptopGroup = gltf.scene;
      laptopGroup.scale.setScalar(1.6);
      laptopGroup.position.set(0, -1.2, 0);
      laptopGroup.rotation.set(0.05, -0.3, 0);

      // Apply screen texture to the matte/screen mesh
      laptopGroup.traverse(function (child) {
        if (child.isMesh) {
          // Improve material quality
          if (child.material) {
            child.material.envMapIntensity = 1.2;
          }

          // Find screen mesh and apply dashboard texture
          const name = (child.name || '').toLowerCase();
          const matName = (child.material?.name || '').toLowerCase();

          if (name.includes('matte') || matName.includes('matte') ||
              name.includes('screen') && !name.includes('frame')) {
            child.material = new THREE.MeshStandardMaterial({
              map: screenTexture,
              emissive: new THREE.Color(0x111111),
              emissiveIntensity: 0.3,
              roughness: 0.2,
              metalness: 0.0,
            });
          }
        }
      });

      scene.add(laptopGroup);

      // Entrance animation
      laptopGroup.position.y = -3;
      laptopGroup.rotation.x = 0.3;

      if (typeof gsap !== 'undefined') {
        gsap.to(laptopGroup.position, {
          y: -1.2,
          duration: 1.5,
          ease: 'power3.out',
          delay: 0.5,
        });
        gsap.to(laptopGroup.rotation, {
          x: 0.05,
          duration: 1.5,
          ease: 'power3.out',
          delay: 0.5,
        });
      } else {
        laptopGroup.position.y = -1.2;
        laptopGroup.rotation.x = 0.05;
      }
    },
    undefined,
    function (error) {
      console.warn('3D laptop failed to load, showing fallback', error);
      if (oldWrapper) oldWrapper.style.display = '';
    }
  );

  // ── Environment Map (simple gradient) ──
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  const envGeo = new THREE.SphereGeometry(5, 32, 32);
  const envMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0x1a2a4a),
    side: THREE.BackSide,
  });
  envScene.add(new THREE.Mesh(envGeo, envMat));

  // Add a bright spot for reflections
  const spotGeo = new THREE.SphereGeometry(0.5, 16, 16);
  const spotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const spot = new THREE.Mesh(spotGeo, spotMat);
  spot.position.set(3, 3, 3);
  envScene.add(spot);

  const envMap = pmremGenerator.fromScene(envScene).texture;
  scene.environment = envMap;
  pmremGenerator.dispose();

  // ── Mouse Interaction ──
  let mouseX = 0;
  let mouseY = 0;
  let targetRotationY = -0.3;
  let targetRotationX = 0.05;

  container.addEventListener('mousemove', function (e) {
    const rect = container.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    targetRotationY = -0.3 + mouseX * 0.15;
    targetRotationX = 0.05 - mouseY * 0.08;
  }, { passive: true });

  container.addEventListener('mouseleave', function () {
    targetRotationY = -0.3;
    targetRotationX = 0.05;
  });

  // ── Floating Animation ──
  let floatTime = 0;

  // ── Render Loop ──
  function animate() {
    requestAnimationFrame(animate);
    floatTime += 0.008;

    if (laptopGroup) {
      // Smooth rotation follow
      laptopGroup.rotation.y += (targetRotationY - laptopGroup.rotation.y) * 0.05;
      laptopGroup.rotation.x += (targetRotationX - laptopGroup.rotation.x) * 0.05;

      // Gentle float
      laptopGroup.position.y = -1.2 + Math.sin(floatTime) * 0.08;
    }

    renderer.render(scene, camera);
  }

  animate();

  // ── Resize Handler ──
  function onResize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  window.addEventListener('resize', onResize, { passive: true });

  // ── Reduced motion preference ──
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (oldWrapper) {
      oldWrapper.style.display = '';
      container.style.display = 'none';
    }
  }
})();
