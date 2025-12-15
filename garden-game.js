// Garden game: simple 2D grid garden with till, plant, water, harvest and save/load
(function(){
  const canvas = document.getElementById('garden-canvas');
  const coinsEl = document.getElementById('coins');
  const xpEl = document.getElementById('xp');
  const invEl = document.getElementById('inventory');
  const hotbarEl = document.getElementById('hotbar');
  const saveBtn = document.getElementById('save-btn');
  const resetBtn = document.getElementById('reset-btn');

  const GRID_W = 16, GRID_H = 12; // tiles
  let tileSize = 48;
  canvas.width = GRID_W * tileSize; canvas.height = GRID_H * tileSize;

  const ctx = canvas.getContext('2d');

  // Game state
  let state = {
    coins: 50,
    xp: 0,
    grid: {}, // key x,y -> {type:'grass'|'tilled'|'crop', cropType?, plantedAt, watered}
    inventory: { seed: 8, water: 5, soil: 20 },
    hotbarIndex: 0
  };

  const hotbar = [ 'hoe', 'seed', 'water' ];

  const crops = {
    carrot: { growMs: 12000, sell: 6, xp: 2, color: '#ffd39b' },
    tomato: { growMs: 16000, sell: 10, xp: 3, color: '#ff6b6b' }
  };

  // initialize grid as grass
  function ensureGrid(){
    for(let x=0;x<GRID_W;x++) for(let y=0;y<GRID_H;y++){ const k = key(x,y); if(!state.grid[k]) state.grid[k] = { type:'grass' }; }
  }
  function key(x,y){return x+','+y}

  // save/load
  const STORAGE_KEY = 'garden_save_v1';
  function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); flash('Saved'); }
  function load(){ const s = localStorage.getItem(STORAGE_KEY); if(s){ try{ state = JSON.parse(s); }catch(e){console.warn('load failed',e);} } ensureGrid(); }
  function reset(){ localStorage.removeItem(STORAGE_KEY); state = { coins:50, xp:0, grid:{}, inventory:{ seed:8, water:5, soil:20 }, hotbarIndex:0 }; ensureGrid(); }

  // UI
  function renderHUD(){ coinsEl.textContent = state.coins; xpEl.textContent = state.xp; invEl.innerHTML='';
    Object.entries(state.inventory).forEach(([k,v])=>{ const d=document.createElement('div'); d.className='inv-item'; d.innerHTML = `<span>${k}</span><strong>${v}</strong>`; invEl.appendChild(d); });
    hotbarEl.innerHTML=''; hotbar.forEach((id,idx)=>{ const s=document.createElement('div'); s.className='slot'+(idx===state.hotbarIndex? ' active':'' ); s.textContent = id[0].toUpperCase()+id.slice(1); s.addEventListener('click',()=>{ state.hotbarIndex=idx; renderHUD(); }); hotbarEl.appendChild(s); });
  }

  // draw loop
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // tiles
    for(let x=0;x<GRID_W;x++){
      for(let y=0;y<GRID_H;y++){
        const k = key(x,y); const t = state.grid[k] || { type:'grass' };
        const px = x*tileSize, py = y*tileSize;
        // base
        if(t.type==='grass') { ctx.fillStyle = '#88c070'; ctx.fillRect(px,py,tileSize,tileSize); }
        else if(t.type==='tilled'){ ctx.fillStyle = '#8b5a2b'; ctx.fillRect(px,py,tileSize,tileSize); }
        else if(t.type==='crop'){ ctx.fillStyle = '#8b5a2b'; ctx.fillRect(px,py,tileSize,tileSize); }
        // crop overlay
        if(t.type==='crop' && t.cropType){ const c = crops[t.cropType]; const age = Date.now() - t.plantedAt; const p = Math.min(1, age / c.growMs); ctx.fillStyle = c.color; ctx.globalAlpha = 0.6 + 0.4*p; ctx.fillRect(px+tileSize*0.18, py+tileSize*0.18, tileSize*0.64, tileSize*0.64); ctx.globalAlpha = 1; if(p>=1){ ctx.strokeStyle='#fff'; ctx.lineWidth = 3; ctx.strokeRect(px+6,py+6,tileSize-12,tileSize-12); }}
        // grid lines
        ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.strokeRect(px,py,tileSize,tileSize);
      }
    }
    requestAnimationFrame(draw);
  }

  // Utility flash
  function flash(msg){ const el = document.getElementById('game-feedback') || document.createElement('div'); el.id='game-feedback'; el.style.position='fixed'; el.style.left='50%'; el.style.transform='translateX(-50%)'; el.style.bottom='18px'; el.style.padding='8px 12px'; el.style.background='rgba(0,0,0,0.6)'; el.style.color='#fff'; document.body.appendChild(el); el.textContent = msg; setTimeout(()=>{ if(el.parentNode) el.parentNode.removeChild(el); },1200); }

  // Actions: hoe, seed, water, harvest
  function useToolAt(tx,ty){ const k=key(tx,ty); const tile = state.grid[k]; const tool = hotbar[state.hotbarIndex];
    if(tool==='hoe'){ if(tile.type==='grass'){ tile.type='tilled'; state.inventory.soil = Math.max(0,(state.inventory.soil||0)-0); updateAndSave('Tilled soil'); } }
    else if(tool==='seed'){ if(tile.type==='tilled' && !tile.type==='crop'){ // plant random crop
        const cropType = Math.random()>0.5? 'carrot':'tomato'; if((state.inventory.seed||0)<=0){ flash('No seeds'); return;} tile.type='crop'; tile.cropType = cropType; tile.plantedAt = Date.now(); tile.watered = false; state.inventory.seed--; updateAndSave('Planted seed'); } }
    else if(tool==='water'){ if(tile.type==='crop'){ if((state.inventory.water||0)<=0){ flash('No water'); return;} tile.watered = true; state.inventory.water--; updateAndSave('Watered'); } }
    // Harvest if crop mature
    if(tile.type==='crop' && tile.cropType){ const c = crops[tile.cropType]; const age = Date.now() - tile.plantedAt; const eff = tile.watered? age*1.4 : age; if(eff >= c.growMs){ // harvest
        state.coins += c.sell; state.xp += c.xp; tile.type='tilled'; delete tile.cropType; delete tile.plantedAt; delete tile.watered; updateAndSave('Harvested'); }
    }
  }

  function updateAndSave(msg){ renderHUD(); save(); if(msg) flash(msg); }

  // Input handling
  canvas.addEventListener('click', (e)=>{
    const rect = canvas.getBoundingClientRect(); const mx = e.clientX - rect.left; const my = e.clientY - rect.top;
    const tx = Math.floor(mx / tileSize); const ty = Math.floor(my / tileSize);
    if(tx>=0 && tx<GRID_W && ty>=0 && ty<GRID_H){ useToolAt(tx,ty); }
  });

  document.addEventListener('keydown', (e)=>{
    if(e.code.startsWith('Digit')){
      const n = parseInt(e.code.replace('Digit',''),10); if(!isNaN(n) && n>=1 && n<=hotbar.length){ state.hotbarIndex = n-1; renderHUD(); }
    }
  });

  saveBtn.addEventListener('click', save);
  resetBtn.addEventListener('click', ()=>{ if(confirm('Reset garden?')){ reset(); renderHUD(); }});

  // responsive tile size
  function fitCanvas(){ const maxW = Math.min(window.innerWidth - 320, 960); tileSize = Math.floor(Math.min(64, maxW / GRID_W)); canvas.width = GRID_W * tileSize; canvas.height = GRID_H * tileSize; }
  window.addEventListener('resize', ()=>{ fitCanvas(); });

  // game loop for growth checks
  function tick(){ // simple periodic save and HUD update
    renderHUD(); save(); setTimeout(tick, 5000);
  }

  // init
  load(); ensureGrid(); fitCanvas(); renderHUD(); draw(); tick();

})();
