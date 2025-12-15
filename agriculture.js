// assets/js/agriculture.js
// Main game script (Three.js-based) - corrected and split version
(function () {
  'use strict';

  if (typeof window.THREE === 'undefined') {
    console.error('Three.js not loaded. Make sure agriculture.html includes a THREE.js script tag.');
    return;
  }
  const THREE = window.THREE;

  // DOM elements
  const canvas = document.getElementById('glcanvas');
  const hotbarEl = document.getElementById('hotbar');
  const crosshairEl = document.getElementById('crosshair');
  const xpFillEl = document.getElementById('xpFill');
  const cropHudEl = document.getElementById('cropHUD');
  const cropFillEl = document.getElementById('cropFill');
  const invEl = document.getElementById('invData');
  const feedbackEl = document.getElementById('game-feedback');

  // hide UI until pointer lock (start)
  function hideUI() {
    [hotbarEl, crosshairEl, xpFillEl.parentElement, cropHudEl].forEach(el => {
      if (el) el.classList.add('ui-hidden');
      if (el) el.classList.remove('ui-visible');
    });
  }
  function showUI() {
    [hotbarEl, crosshairEl, xpFillEl.parentElement, cropHudEl].forEach(el => {
      if (el) el.classList.remove('ui-hidden');
      if (el) el.classList.add('ui-visible');
    });
  }
  hideUI(); // initial: hidden

  // Renderer, scene, camera
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  function resizeRenderer() {
    const w = Math.max(1, Math.floor(canvas.clientWidth * (window.devicePixelRatio || 1)));
    const h = Math.max(1, Math.floor(canvas.clientHeight * (window.devicePixelRatio || 1)));
    if (canvas.width !== w || canvas.height !== h) {
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    }
  }
  resizeRenderer();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB);
  scene.fog = new THREE.Fog(0x87CEEB, 60, 240);

  const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.set(0, 2.0, 0);

  // Lights
  const amb = new THREE.AmbientLight(0xffffff, 0.6); scene.add(amb);
  const dir = new THREE.DirectionalLight(0xffffff, 0.9); dir.position.set(40, 80, 40); dir.castShadow = true; scene.add(dir);

  // Basic materials (small set as before)
  const materials = {
    grass: new THREE.MeshLambertMaterial({ color: 0x74b06f }),
    dirt: new THREE.MeshLambertMaterial({ color: 0x6b4f2b }),
    farmland: new THREE.MeshLambertMaterial({ color: 0x8b5a2b }),
    water: new THREE.MeshLambertMaterial({ color: 0x4aa3ff, transparent: true, opacity: 0.82 })
  };

  // world storage
  const CHUNK_SIZE = 16;
  const RENDER_DISTANCE = 3;
  const world = new Map();        // key "x,y,z" -> { type, mesh }
  const crops = new Map();        // key "x,y,z" -> crop data object
  const loadedChunks = new Map(); // key "cx,cz" -> true
  const savedBlocks = new Map();  // persist blocks for unloaded chunks

  // helper to key coords
  function keyFor(x, y, z) { return `${x},${y},${z}`; }
  function chunkKey(cx, cz) { return `${cx},${cz}`; }
  function worldToChunk(x, z) { return { cx: Math.floor(x / CHUNK_SIZE), cz: Math.floor(z / CHUNK_SIZE) }; }

  // create cube geometry reused for blocks
  const blockGeo = new THREE.BoxGeometry(1, 1, 1);

  function createBlock(type, x, y, z) {
    let mat = materials[type] || materials.grass;
    // clone material so we can tint it for crops
    let matUse = mat;
    if (type.startsWith('crop_')) {
      const seed = type.replace('crop_', '');
      const baseColor = new THREE.Color(0x88c057);
      matUse = new THREE.MeshLambertMaterial({ color: baseColor });
    }
    const mesh = new THREE.Mesh(blockGeo, matUse);
    mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.position.set(x, y, z);
    return mesh;
  }

  function loadChunk(cx, cz) {
    const ck = chunkKey(cx, cz);
    if (loadedChunks.has(ck)) return;
    const startX = cx * CHUNK_SIZE;
    const startZ = cz * CHUNK_SIZE;
    for (let x = startX; x < startX + CHUNK_SIZE; x++) {
      for (let z = startZ; z < startZ + CHUNK_SIZE; z++) {
        const k = keyFor(x, 0, z);
        const type = savedBlocks.get(k) || 'grass';
        const mesh = createBlock(type, x, 0, z);
        scene.add(mesh);
        world.set(k, { type, mesh });
      }
    }
    loadedChunks.set(ck, true);
  }
  function unloadChunk(cx, cz) {
    const ck = chunkKey(cx, cz);
    if (!loadedChunks.has(ck)) return;
    const startX = cx * CHUNK_SIZE, startZ = cz * CHUNK_SIZE;
    for (let x = startX; x < startX + CHUNK_SIZE; x++) {
      for (let z = startZ; z < startZ + CHUNK_SIZE; z++) {
        const k = keyFor(x, 0, z);
        const entry = world.get(k);
        if (entry) {
          savedBlocks.set(k, entry.type);
          scene.remove(entry.mesh);
          try { entry.mesh.geometry.dispose(); /* do not dispose shared material */ } catch (e) { }
          world.delete(k);
        }
      }
    }
    loadedChunks.delete(ck);
  }
  function updateChunksAround(px, pz) {
    const pcx = Math.floor(px / CHUNK_SIZE);
    const pcz = Math.floor(pz / CHUNK_SIZE);
    for (let dx = -RENDER_DISTANCE; dx <= RENDER_DISTANCE; dx++) {
      for (let dz = -RENDER_DISTANCE; dz <= RENDER_DISTANCE; dz++) {
        loadChunk(pcx + dx, pcz + dz);
      }
    }
    // unload too-far chunks
    for (const ck of Array.from(loadedChunks.keys())) {
      const [cx, cz] = ck.split(',').map(Number);
      if (Math.abs(cx - pcx) > RENDER_DISTANCE || Math.abs(cz - pcz) > RENDER_DISTANCE) unloadChunk(cx, cz);
    }
  }

  // generate initial chunks around origin
  updateChunksAround(0, 0);

  // Raycasting helpers
  const raycaster = new THREE.Raycaster();
  const center = new THREE.Vector2(0, 0);

  // ghost preview and highlight box
  const ghostMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, emissive: 0x66ff66, emissiveIntensity: 0.15 });
  const ghost = new THREE.Mesh(blockGeo, ghostMat); ghost.visible = false; scene.add(ghost);

  const highlight = new THREE.BoxHelper(new THREE.Mesh(blockGeo), 0xffff66); highlight.visible = false; scene.add(highlight);

  // stronger pulsing effect state
  let pulse = 0;

  // game state (kept similar to your original)
  const gameState = {
    coins: 100,
    level: 1,
    xp: 0,
    cropsHarvested: 0,
    selectedBlock: 'soil',
    inventory: {
      soil: 10,
      water: 5,
      rice_seed: 5,
      wheat_seed: 5,
      sugarcane_seed: 3,
      cotton_seed: 3,
      potato_seed: 5
    }
  };

  // basic crop data (same as your mapping)
  const cropData = {
    rice_seed: { name: 'Rice', growthTime: 5000, sellPrice: 25, xp: 5, color: 0x8B4513, matureColor: 0x90EE90 },
    wheat_seed: { name: 'Wheat', growthTime: 4000, sellPrice: 20, xp: 4, color: 0xDAA520, matureColor: 0xFFD700 },
    sugarcane_seed: { name: 'Sugarcane', growthTime: 8000, sellPrice: 40, xp: 8, color: 0x228B22, matureColor: 0x32CD32 },
    cotton_seed: { name: 'Cotton', growthTime: 6000, sellPrice: 30, xp: 6, color: 0xF5F5DC, matureColor: 0xFFFFFF },
    potato_seed: { name: 'Potato', growthTime: 3000, sellPrice: 15, xp: 3, color: 0x8B4513, matureColor: 0xFFE4B5 }
  };

  // pointer lock and UI visibility
  let pointerLocked = false;
  canvas.addEventListener('click', () => {
    canvas.requestPointerLock?.();
  });
  document.addEventListener('pointerlockchange', () => {
    pointerLocked = (document.pointerLockElement === canvas);
    if (pointerLocked) {
      showUI();
      // ensure crosshair pulsing
      crosshairEl.classList.add('pulse');
    } else {
      hideUI();
      crosshairEl.classList.remove('pulse');
    }
  });

  // mouse look accumulators
  let yaw = 0, pitch = 0;
  document.addEventListener('mousemove', (e) => {
    if (!pointerLocked) return;
    yaw -= e.movementX * 0.0025;
    pitch -= e.movementY * 0.0025;
    pitch = Math.max(-1.2, Math.min(1.2, pitch));
  });

  // Inputs
  const keys = {};
  window.addEventListener('keydown', (ev) => keys[ev.code] = true);
  window.addEventListener('keyup', (ev) => keys[ev.code] = false);

  // placement & removal (center screen)
  canvas.addEventListener('mousedown', (e) => {
    if (!pointerLocked) return;
    // center ray
    raycaster.setFromCamera(center, camera);
    const hitList = raycaster.intersectObjects(Array.from(world.values()).map(o => o.mesh));
    if (hitList.length === 0) return;
    const hit = hitList[0];
    if (e.button === 2) {
      // right click remove block
      const mesh = hit.object;
      // find entry
      for (const [k, v] of world.entries()) {
        if (v.mesh === mesh) {
          scene.remove(mesh);
          try { mesh.geometry.dispose(); } catch (e) { }
          savedBlocks.set(k, v.type);
          world.delete(k);
          break;
        }
      }
      return;
    }
    // left click => place block adjacent to face
    const pos = hit.point.clone().add(hit.face.normal.clone().multiplyScalar(0.5)).floor();
    const ix = pos.x, iy = pos.y, iz = pos.z;
    // only place if empty
    const k = keyFor(ix, iy, iz);
    if (world.has(k)) return;
    // if placing seed type -> require below be farmland/soil
    const selected = gameState.selectedBlock;
    if (selected.endsWith('_seed')) {
      const below = world.get(keyFor(ix, iy - 1, iz));
      if (!below || below.type !== 'soil') {
        showFeedback('Seeds must be planted on tilled soil (use Hoe).');
        return;
      }
      const mesh = createBlock('crop_' + selected, ix, iy, iz);
      scene.add(mesh);
      world.set(k, { type: 'crop_' + selected, mesh });
      crops.set(k, { type: selected, planted: Date.now(), growthStage: 0, needsWater: true });
      gameState.inventory[selected] = (gameState.inventory[selected] || 0) - 1;
      updateInventoryPanel();
      showFeedback('Seed planted');
      return;
    }
    // generic block place (soil, water, grass, etc)
    if (gameState.inventory[selected] > 0 || selected === 'soil') {
      const mesh = createBlock(selected, ix, iy, iz);
      scene.add(mesh);
      world.set(k, { type: selected, mesh });
      if (selected !== 'soil') {
        gameState.inventory[selected]--;
        updateInventoryPanel();
      }
      showFeedback('Block placed');
    } else {
      showFeedback('Not enough item to place');
    }
  });
  // avoid context menu while pointer locked
  canvas.addEventListener('contextmenu', e => { if (pointerLocked) e.preventDefault(); });

  // ----- player physics: camera is player "eye" ----- //
  const velocity = new THREE.Vector3();
  let grounded = false;
  let jumpPending = false;
  function updatePlayer(dt) {
    // update camera rotation by yaw/pitch
    camera.rotation.set(pitch, yaw, 0, 'YXZ');

    // movement direction (local)
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    forward.y = 0; right.y = 0;
    forward.normalize(); right.normalize();

    // damping
    velocity.x -= velocity.x * 8.0 * dt;
    velocity.z -= velocity.z * 8.0 * dt;
    // gravity
    velocity.y -= 20.0 * dt;

    // controls
    const speed = (keys['ShiftLeft'] ? 6.0 : 3.0);
    if (keys['KeyW']) { velocity.addScaledVector(forward, speed * dt * 20); }
    if (keys['KeyS']) { velocity.addScaledVector(forward, -speed * dt * 20); }
    if (keys['KeyA']) { velocity.addScaledVector(right, -speed * dt * 20); }
    if (keys['KeyD']) { velocity.addScaledVector(right, speed * dt * 20); }

    // jump
    if (keys['Space']) {
      if (grounded) { velocity.y += 8.5; grounded = false; }
    }

    // apply movement
    const move = velocity.clone().multiplyScalar(dt);
    camera.position.add(move);

    // keep camera above ground (simple check)
    // compute array of candidate ground blocks around player position
    const px = Math.floor(camera.position.x), pz = Math.floor(camera.position.z);
    let groundY = -Infinity;
    for (let sx = px - 1; sx <= px + 1; sx++) {
      for (let sz = pz - 1; sz <= pz + 1; sz++) {
        const k = keyFor(sx, 0, sz);
        if (world.has(k)) {
          groundY = Math.max(groundY, 1); // ground block base y=0, top at y=1
        }
      }
    }
    // groundY will be at least 1 if blocks present; otherwise fallback 0
    if (!isFinite(groundY)) groundY = 1;
    const idealY = groundY + 1.0; // stand 1 unit above block top
    if (camera.position.y <= idealY) {
      camera.position.y = idealY;
      velocity.y = 0;
      grounded = true;
    } else {
      grounded = false;
    }

    // update chunks around camera
    updateChunksAround(camera.position.x, camera.position.z);
  }

  // crops growth
  function updateCrops() {
    const now = Date.now();
    for (const [k, c] of crops.entries()) {
      const block = world.get(k);
      if (!block) continue;
      const info = cropData[c.type];
      if (!info) continue;
      const age = now - c.planted;
      const effective = c.needsWater ? age * 0.22 : age;
      const prog = Math.min(1, effective / info.growthTime);
      if (prog >= 1 && c.growthStage < 1) {
        c.growthStage = 1;
        block.mesh.material.color.setHex(info.matureColor);
      } else {
        const from = new THREE.Color(info.color);
        const to = new THREE.Color(info.matureColor);
        block.mesh.material.color.lerpColors(from, to, prog);
      }
    }
  }

  // harvest check (E)
  function checkHarvest() {
    raycaster.setFromCamera(center, camera);
    const hits = raycaster.intersectObjects(Array.from(world.values()).map(o => o.mesh));
    if (!hits.length) return;
    const mesh = hits[0].object;
    for (const [k, entry] of world.entries()) {
      if (entry.mesh === mesh && entry.type.startsWith('crop_')) {
        const crop = crops.get(k);
        if (crop && crop.growthStage >= 1) {
          const info = cropData[crop.type];
          gameState.coins += info.sellPrice;
          gameState.xp += info.xp;
          gameState.cropsHarvested++;
          scene.remove(mesh);
          try { mesh.geometry.dispose(); } catch (e) { }
          world.delete(k);
          crops.delete(k);
          showFeedback(`Harvested ${info.name}! +${info.sellPrice} coins`);
          updateInventoryPanel();
        } else {
          showFeedback('Crop not ready yet');
        }
        break;
      }
    }
  }

  // input for harvest
  document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyE') checkHarvest();
  });

  // UI update helpers
  function updateInventoryPanel() {
    if (!invEl) return;
    invEl.innerHTML = `
      <strong>Coins:</strong> ${gameState.coins}<br>
      <strong>Level:</strong> ${gameState.level} &nbsp;
      <strong>XP:</strong> ${gameState.xp}<br>
      <strong>Inventory</strong><br>
      Soil: ${gameState.inventory.soil} |
      Water: ${gameState.inventory.water} |
      Seeds: ${Object.keys(gameState.inventory).filter(k => k.endsWith('_seed')).map(k => `${k.replace('_seed', '')}:${gameState.inventory[k]}`).join(' , ')}
    `;
    // update XP visual bar
    if (xpFillEl) {
      const p = Math.min(100, (gameState.xp / Math.max(1, gameState.level * 50)) * 100);
      xpFillEl.style.width = p + '%';
    }
  }
  updateInventoryPanel();

  function showFeedback(msg) {
    if (!feedbackEl) return;
    feedbackEl.textContent = msg;
    feedbackEl.style.opacity = '1';
    setTimeout(() => { if (feedbackEl) feedbackEl.textContent = ''; }, 3000);
  }

  // Hotbar mapping (1..6)
  const hotbarOrder = ['soil', 'water', 'rice_seed', 'wheat_seed', 'potato_seed', 'hoe'];
  let hotbarIndex = 0;
  function renderHotbarUI() {
    if (!hotbarEl) return;
    const slots = hotbarEl.querySelectorAll('.slot');
    slots.forEach((s, i) => {
      s.textContent = hotbarOrder[i] ? hotbarOrder[i].split('_')[0] : '--';
      s.classList.toggle('active', i === hotbarIndex);
      s.onclick = () => { hotbarIndex = i; gameState.selectedBlock = hotbarOrder[i]; updateInventoryPanel(); };
    });
  }
  renderHotbarUI();

  document.addEventListener('keydown', (e) => {
    if (/^Digit[1-6]$/.test(e.code)) {
      const idx = parseInt(e.code.replace('Digit', ''), 10) - 1;
      hotbarIndex = idx;
      gameState.selectedBlock = hotbarOrder[idx];
      renderHotbarUI();
      updateInventoryPanel();
    }
  });

  // Ghost + highlight update (center-screen)
  function updateGhostAndHighlight() {
    pulse += 0.06;
    const glow = (Math.sin(pulse) + 1) * 0.5;
    crosshairEl && crosshairEl.classList.toggle('pulse', glow > 0.6);

    raycaster.setFromCamera(center, camera);
    const hits = raycaster.intersectObjects(Array.from(world.values()).map(o => o.mesh));
    if (hits.length) {
      const hit = hits[0];
      highlight.visible = true;
      highlight.setFromObject(hit.object);
      const placePos = hit.point.clone().add(hit.face.normal.clone().multiplyScalar(0.5)).floor();
      ghost.position.set(placePos.x, placePos.y, placePos.z);
      ghost.visible = true;
      // brighten highlight color by adjusting box helper color
      highlight.material && (highlight.material.color.setHex(0xffff99));
      // pulse ghost emission
      ghost.material.emissiveIntensity = 0.15 + glow * 0.6;
      // crop HUD when hitting crop
      const key = keyFor(placePos.x, placePos.y, placePos.z);
      if (crops.has(key)) {
        cropHudEl.classList.remove('ui-hidden'); cropHudEl.classList.add('ui-visible');
        const crop = crops.get(key);
        const info = cropData[crop.type] || { growthTime: 4000 };
        const elapsed = (Date.now() - crop.planted);
        const progress = Math.min(1, elapsed / info.growthTime);
        cropFillEl.style.width = (progress * 100) + '%';
      } else {
        cropHudEl.classList.add('ui-hidden'); cropHudEl.classList.remove('ui-visible');
      }
    } else {
      highlight.visible = false;
      ghost.visible = false;
      cropHudEl.classList.add('ui-hidden'); cropHudEl.classList.remove('ui-visible');
    }
  }

  // animation loop
  let last = performance.now();
  function animate(now) {
    requestAnimationFrame(animate);
    resizeRenderer();
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    // Update player and world logic
    updatePlayer(dt);
    updateCrops();
    updateGhostAndHighlight();

    renderer.render(scene, camera);
  }
  animate();

  // window resize correct aspect
  window.addEventListener('resize', () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    resizeRenderer();
  });

  // Expose a few things for debugging in console
  window._agri = { scene, camera, world, crops, gameState };

  // show a welcome message when not pointer locked
  showFeedback('Click the viewport to begin — hotbar & crosshair appear after you start.');

})();
