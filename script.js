/// script.js
// SVG-based sprout-to-tree growth animation, runs exactly 2 cycles.

(() => {
  const seedLeft = document.getElementById('seedLeft');
  const seedRight = document.getElementById('seedRight');
  const seedGroup = document.getElementById('seedGroup');
  const sproutPath = document.getElementById('sproutPath');
  const stem = document.getElementById('stem');
  const crown = document.getElementById('crown');
  const leavesGroup = document.getElementById('leavesGroup');
  const bud = document.getElementById('bud');
  const appleGroup = document.getElementById('appleGroup');
  const appleBody = document.getElementById('appleBody');
  const impactShadow = document.getElementById('impactShadow');

  let cycles = 0;
  const MAX_CYCLES = 2;

  // Timing plan (ms)
  const TIMES = {
    seedOpenDelay: 250,
    seedOpenDuration: 700,
    sproutDelay: 300,
    sproutDrawDuration: 900,
    stemGrowDuration: 1200,
    branchDelay: 350,
    crownShowDuration: 700,
    leafStartDelay: 350,
    perLeafDelay: 110,
    budDelay: 400,
    budToApple: 700,
    appleHold: 1500,
    appleFallDuration: 1100,
    impactDuration: 520,
    finalPause: 800
  };

  // Utility sleep
  const wait = (ms) => new Promise(res => setTimeout(res, ms));

  // Create a natural crown of oval leaves programmatically
  // Leaves will be positioned in an arc around crown center (0,-50)
  function createLeaves(count = 22) {
    leavesGroup.innerHTML = '';
    const centerX = 0;
    const centerY = -40;
    const radiusX = 180;
    const radiusY = 80;

    for (let i = 0; i < count; i++) {
      // angle from -120deg to -60deg mirrored left/right
      const side = (i % 2 === 0) ? -1 : 1;
      // progress 0..1 from center outward
      const p = (i / (count - 1));
      // bias so more leaves near center
      const bias = Math.sin(p * Math.PI);
      // angle small spread
      const angle = (side === -1)
        ? (-95 - 30 * bias + Math.random() * 10)
        : (-85 + 30 * bias + Math.random() * 10);

      const rad = angle * Math.PI / 180;
      const rx = radiusX * (0.55 + 0.45 * Math.random()) * (0.4 + bias * 0.9);
      const ry = radiusY * (0.6 + 0.4 * Math.random()) * (0.6 + bias * 0.4);

      // leaf center
      const lx = centerX + rx * Math.cos(rad) + (Math.random() * 18 - 9);
      const ly = centerY + ry * Math.sin(rad) + (Math.random() * 12 - 6);

      const leaf = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
      leaf.setAttribute('cx', lx.toFixed(2));
      leaf.setAttribute('cy', ly.toFixed(2));
      const w = (46 + Math.random() * 30).toFixed(1);
      const h = (28 + Math.random() * 18).toFixed(1);
      leaf.setAttribute('rx', w / 2);
      leaf.setAttribute('ry', h / 2);
      leaf.setAttribute('fill', `url(#leafGrad${i})`); // gradient fallback not required
      leaf.setAttribute('class', 'leaf');
      // custom rotation variable for CSS animation
      const rot = (Math.random() * 40 - 20).toFixed(1) + 'deg';
      leaf.style.setProperty('--rot', rot);
      leaf.style.opacity = 0;
      // add slight transform (initial small scale handled by CSS)
      leaf.setAttribute('transform', `rotate(${(Math.random()*20-10).toFixed(1)}, ${lx.toFixed(1)}, ${ly.toFixed(1)})`);
      leavesGroup.appendChild(leaf);
    }
  }

  // Draw sprout path by animating stroke-dashoffset
  function prepareSproutDraw() {
    const length = sproutPath.getTotalLength();
    sproutPath.style.strokeDasharray = `${length} ${length}`;
    sproutPath.style.strokeDashoffset = `${length}`;
    sproutPath.getBoundingClientRect(); // force reflow
    return length;
  }

  // Animate seed opening (two halves rotate outwards)
  async function openSeed() {
    // Move seed halves outwards visually using transform attributes on the group
    // We'll use CSS classes by setting transforms on elements in JS for precise pivots
    // Left half rotate CCW and translate
    seedLeft.style.transformOrigin = 'center';
    seedRight.style.transformOrigin = 'center';

    // Use small animated transforms
    seedLeft.animate([
      { transform: 'translate(0px,0px) rotate(0deg)' },
      { transform: 'translate(-18px,-12px) rotate(-48deg)' }
    ], { duration: TIMES.seedOpenDuration, easing: 'cubic-bezier(.2,.9,.2,1)', fill: 'forwards' });

    seedRight.animate([
      { transform: 'translate(0px,0px) rotate(0deg)' },
      { transform: 'translate(18px,-12px) rotate(48deg)' }
    ], { duration: TIMES.seedOpenDuration, easing: 'cubic-bezier(.2,.9,.2,1)', fill: 'forwards' });

    await wait(TIMES.seedOpenDuration);
  }

  // Animate sprout path drawing and stem growth
  async function drawSproutAndStem() {
    const total = prepareSproutDraw();
    // animate dashoffset to 0
    const start = performance.now();
    const dur = TIMES.sproutDrawDuration;
    return new Promise(resolve => {
      function tick(now) {
        const t = Math.min(1, (now - start) / dur);
        sproutPath.style.strokeDashoffset = `${Math.round(total * (1 - t))}`;
        // stem height grows following t after small delay
        const stemH = Math.round(t * 320); // final height 320
        stem.setAttribute('height', stemH);
        stem.setAttribute('y', -stemH); // grows upward from anchor
        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      }
      requestAnimationFrame(tick);
    });
  }

  // Reveal crown and extend branches
  async function showCrownAndBranches() {
    // fade in crown
    crown.classList.add('crown-show');
    // animate left/right branches width/scale using Web Animations
    const left = document.getElementById('leftBranch').firstElementChild || document.querySelector('#leftBranch rect');
    const right = document.getElementById('rightBranch').firstElementChild || document.querySelector('#rightBranch rect');

    // Expand left branch using transform of group (it already has transform rotate set)
    const leftGroup = document.getElementById('leftBranch');
    const rightGroup = document.getElementById('rightBranch');

    leftGroup.animate([
      { transform: 'translate(-40px,40px) rotate(-28deg) scaleX(0)' },
      { transform: 'translate(0px,40px) rotate(-18deg) scaleX(1)' }
    ], { duration: 700, easing: 'cubic-bezier(.2,.9,.2,1)', fill: 'forwards' });

    rightGroup.animate([
      { transform: 'translate(40px,40px) rotate(28deg) scaleX(0)' },
      { transform: 'translate(0px,40px) rotate(18deg) scaleX(1)' }
    ], { duration: 700, easing: 'cubic-bezier(.2,.9,.2,1)', fill: 'forwards' });

    await wait(700);
  }

  // Pop leaves one-by-one
  async function popLeaves() {
    const all = Array.from(leavesGroup.querySelectorAll('.leaf'));
    // sort by distance to center (so center leaves appear first)
    const centerX = 0;
    all.sort((a, b) => {
      const ax = parseFloat(a.getAttribute('cx'));
      const bx = parseFloat(b.getAttribute('cx'));
      return Math.abs(ax - centerX) - Math.abs(bx - centerX);
    });

    for (let i = 0; i < all.length; i++) {
      const el = all[i];
      // use CSS animation class: leaf-pop
      el.classList.add('leaf-pop');
      // small delay between leaves
      await wait(TIMES.perLeafDelay + Math.random() * 80);
    }
  }

  // Show bud then apple
  async function growApple() {
    bud.style.opacity = 1;
    bud.classList.add('bud-pop');
    await wait(TIMES.budToApple);
    // hide bud and show apple
    bud.style.opacity = 0;
    appleGroup.style.opacity = 1;
    appleGroup.classList.add('apple-grow');
    await wait(700);
  }

  // Apple fall with rotation and bounce, then morph to seed
  async function appleFallAndMorph() {
    // compute fall distance (from crown to ground)
    const startY = -8; // appleGroup initial translate y
    const groundY = 580 - 220; // approximate in scene coords (scene height 700, ground at 560)
    const fallDistance = 340;

    // animate impact shadow pop slightly before landing
    impactShadow.classList.add('impact-pop');

    // animate appleGroup using Web Animations API: translateY and rotate
    const anim = appleGroup.animate([
      { transform: 'translate(0px,-8px) rotate(0deg)', offset: 0 },
      { transform: `translate(0px,${fallDistance * 0.6}px) rotate(30deg)`, offset: 0.6 },
      { transform: `translate(0px,${fallDistance * 0.4}px) rotate(-12deg)`, offset: 0.8 },
      { transform: `translate(0px,${fallDistance}px) rotate(8deg) scale(0.2)`, offset: 1 }
    ], { duration: TIMES.appleFallDuration, easing: 'cubic-bezier(.22,.7,.25,1)', fill: 'forwards' });

    await wait(TIMES.appleFallDuration);

    // hide apple and show tiny ground seed pop
    appleGroup.style.opacity = 0;
    const groundSeed = document.getElementById('groundSeed');
    groundSeed.classList.add('ground-seed-pop');

    // small delay for sink
    await wait(420);
  }

  // Reset dynamic elements for next cycle
  function resetForNextCycle() {
    // reset seed halves back to closed: we animate back via inverse transforms
    seedLeft.style.transform = '';
    seedRight.style.transform = '';

    // reset sprout path
    sproutPath.style.strokeDasharray = '';
    sproutPath.style.strokeDashoffset = '';

    // reset stem
    stem.setAttribute('height', 0);
    stem.setAttribute('y', 0);

    // crown hide
    crown.style.opacity = 0;
    crown.classList.remove('crown-show');

    // clear leaves (removing pop class)
    leavesGroup.querySelectorAll('.leaf').forEach(l => {
      l.classList.remove('leaf-pop');
      l.style.opacity = 0;
    });

    // hide apple & bud
    appleGroup.style.opacity = 0;
    appleGroup.classList.remove('apple-grow');
    bud.classList.remove('bud-pop');
    bud.style.opacity = 0;

    // hide impact shadow and ground seed
    impactShadow.classList.remove('impact-pop');
    document.getElementById('groundSeed').classList.remove('ground-seed-pop');

    // show main seed again
    seedLeft.style.opacity = 1;
    seedRight.style.opacity = 1;
  }

  // Full sequence
  async function runOneCycle() {
    // 1) seed opens
    await wait(TIMES.seedOpenDelay);
    await openSeed();

    // 2) small delay then sprout path draw + stem growth
    await wait(TIMES.sproutDelay);
    await drawSproutAndStem();

    // 3) reveal crown + extend branches
    await wait(TIMES.branchDelay);
    crown.style.opacity = 1;
    await showCrownAndBranches();

    // 4) pop leaves
    await wait(TIMES.leafStartDelay);
    await popLeaves();

    // 5) bud -> apple
    await wait(TIMES.budDelay);
    await growApple();

    // 6) hold and then fall
    await wait(TIMES.appleHold);
    await appleFallAndMorph();

    // 7) final pause
    await wait(TIMES.finalPause);
  }

  async function runCycles() {
    // create leaves once before starting
    createLeaves(22);
    await wait(250);

    while (cycles < MAX_CYCLES) {
      await runOneCycle();
      cycles++;
      if (cycles < MAX_CYCLES) {
        // prepare for next cycle: reset visible parts, but keep main trunk/stem visible
        resetForNextCycle();
        // small gap
        await wait(700);
      } else {
        // keep final tree visible but hide main seed and apple
        document.getElementById('seedLeft').style.opacity = 0;
        document.getElementById('seedRight').style.opacity = 0;
        appleGroup.style.display = 'none';
      }
    }
  }

  // Start
  window.addEventListener('load', () => {
    // ensure sizes ready then start
    setTimeout(() => {
      runCycles().catch(e => console.error(e));
    }, 350);
  });

  // expose restart for debug
  window._restartTree = function() {
    cycles = 0;
    resetForNextCycle();
    runCycles();
  };

})();

