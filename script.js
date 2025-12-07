// script.js
// New: realistic vector-style growth with many leaves placed in a crown.
// The script creates leaves and sequences animations; runs exactly 2 cycles.

(function(){
  // elements
  const seed = document.getElementById('seed');
  const stem = document.getElementById('stem');
  const crown = document.getElementById('crown');
  const leftBranch = document.getElementById('leftBranch');
  const rightBranch = document.getElementById('rightBranch');
  const bud = document.getElementById('bud');
  const apple = document.getElementById('apple');
  const impact = document.getElementById('impact');
  const groundSeed = document.getElementById('groundSeed');

  let cycle = 0;
  const MAX_CYCLES = 2;
  const leafCount = 24; // number of leaves to create

  // helper
  const wait = ms => new Promise(res => setTimeout(res, ms));
  const rand = (a,b) => a + Math.random()*(b-a);

  // create leaves and position them in crown region (arc-like crown)
  const leaves = [];
  function createLeaves(){
    // clear existing
    crown.querySelectorAll('.leaf').forEach(n=>n.remove());
    const crownRect = crown.getBoundingClientRect();
    const w = crownRect.width || 520;
    const h = crownRect.height || 260;
    // arrange leaves in an arch above stem: angle between -110 deg to -70 deg on left, and -110 to -70 on right mirrored
    for (let i=0;i<leafCount;i++){
      const el = document.createElement('div');
      el.className = 'leaf';
      // compute placement using polar-ish distribution across crown width
      // we want denser near center
      const t = i / (leafCount-1); // 0..1
      // map to x across crown width with center bias
      const bias = (Math.sin((t-0.5)*Math.PI) + 1) / 2; // 0..1 smooth
      // alternate side left/right
      const side = (i%2===0) ? -1 : 1;
      // horizontal offset from center
      const offsetX = (side * (40 + bias*180)) + rand(-14,14);
      // vertical offset (higher when offsetX small)
      const offsetY = 40 + (1 - Math.abs(offsetX)/(w/2))*(h*0.55) + rand(-12,12);
      el.style.left = (260 + offsetX) + 'px';   // crown center ~260
      el.style.bottom = offsetY + 'px';
      // small rotation variance
      const rot = rand(-20,20);
      el.style.transform = `scale(0.12) rotate(${rot}deg)`;
      // slightly vary size
      const scale = rand(0.88,1.12);
      el.style.width = Math.round(56*scale) + 'px';
      el.style.height = Math.round(34*scale) + 'px';
      crown.appendChild(el);
      leaves.push(el);
    }
  }

  // clear animations and prepare initial state
  function resetAll(){
    // reset seed closed
    seed.classList.remove('open');
    seed.style.visibility = 'visible';
    seed.style.opacity = 1;

    // stem
    stem.classList.remove('grow');

    // branches
    leftBranch.classList.remove('extend-left');
    rightBranch.classList.remove('extend-right');

    // bud/apple
    bud.classList.remove('pop');
    bud.style.visibility = 'visible';
    bud.style.opacity = 1;
    apple.classList.remove('grow','fall');
    apple.style.opacity = 0;
    apple.setAttribute('aria-hidden','true');
    apple.style.display = '';

    // impact & ground seed
    impact.classList.remove('pop');
    groundSeed.classList.remove('show');

    // leaves reset
    leaves.forEach(l=>{
      l.classList.remove('pop');
      l.style.opacity = 0;
      // reset transform scale small
      // leave rotation/position as is
      l.style.transform = l.style.transform.replace(/scale\([^\)]*\)/,'scale(0.12)');
      // ensure reflow
      void l.offsetWidth;
    });
  }

  // single run sequence
  async function runOnce(){
    resetAll();
    await wait(220);

    // 1. seed opens
    seed.classList.add('open');
    await wait(900);

    // 2. sprout -> stem grows
    stem.classList.add('grow');
    await wait(1300);

    // 3. branches extend
    leftBranch.classList.add('extend-left');
    rightBranch.classList.add('extend-right');
    await wait(700);

    // 4. leaves pop one-by-one in a natural order: nearest to center first
    // sort leaves by absolute x distance to center
    const centerX = 260;
    const ordered = [...leaves].sort((a,b)=>{
      const ax = parseFloat(a.style.left), bx = parseFloat(b.style.left);
      return Math.abs(ax-centerX) - Math.abs(bx-centerX);
    });
    for (let i=0;i<ordered.length;i++){
      const l = ordered[i];
      // small delay between pops
      await wait(rand(80,150));
      l.classList.add('pop');
      // tiny rotation tweak to look natural
      l.style.transform = l.style.transform.replace('scale(0.12)', 'scale(0.98)');
    }

    // 5. bud appears then becomes apple
    await wait(500);
    bud.classList.add('pop');
    await wait(680);
    bud.style.visibility = 'hidden';
    bud.style.opacity = 0;
    apple.classList.add('grow');
    apple.style.opacity = 1;
    apple.setAttribute('aria-hidden','false');

    // 6. Pause, then apple falls
    await wait(1600);
    // impact shadow appears slightly before
    impact.classList.add('pop');
    apple.classList.add('fall');
    await wait(1250);

    // 7. apple compressed into ground seed: hide apple and show tiny
    apple.style.opacity = 0;
    apple.setAttribute('aria-hidden','true');
    groundSeed.classList.add('show');

    // 8. re-show the reusable seed on ground (closed) soon after
    await wait(300);
    seed.classList.remove('open'); // ensure closed
    seed.style.visibility = 'visible';
    seed.style.opacity = 1;

    await wait(700);
  }

  // run exactly MAX_CYCLES
  async function runCycles(){
    createLeaves();
    resetAll();
    await wait(300);
    while (cycle < MAX_CYCLES){
      await runOnce();
      cycle++;
      if (cycle < MAX_CYCLES){
        // small gap between cycles: hide the tiny groundseed and clear apple/bud
        groundSeed.classList.remove('show');
        apple.classList.remove('grow','fall');
        bud.classList.remove('pop');
        apple.style.display = '';
        await wait(700);
      } else {
        // final state: keep grown tree visible; hide the main seed and apple
        seed.style.visibility = 'hidden';
        apple.style.display = 'none';
      }
    }
  }

  // wait for DOM and sizes, then start
  function startWhenReady(){
    // ensure crown layout measured
    createLeaves();
    // slight delay to let CSS settle
    setTimeout(()=> {
      runCycles().catch(e=>console.error(e));
    }, 420);
  }

  window.addEventListener('load', startWhenReady);
  window.addEventListener('resize', ()=>{
    // rebuild leaf positions to adapt to size
    leaves.length = 0;
    createLeaves();
  });

  // debug helper (optional)
  window._restartTree = () => {
    cycle = 0;
    runCycles();
  };

})();

