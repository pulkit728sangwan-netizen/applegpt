// script.js
// Minimal-vector multi-stage growth animation with exact 2 cycles.
// Sequencing is handled with async/await for clarity.

(() => {
  // grab elements
  const seed       = document.getElementById('seed');
  const stem       = document.getElementById('stem');
  const armLeft    = document.getElementById('armLeft');
  const armRight   = document.getElementById('armRight');
  const leaf1      = document.getElementById('leaf1');
  const leaf2      = document.getElementById('leaf2');
  const leaf3      = document.getElementById('leaf3');
  const leaf4      = document.getElementById('leaf4');
  const leaf5      = document.getElementById('leaf5');
  const bud        = document.getElementById('bud');
  const apple      = document.getElementById('apple');
  const groundSeed = document.getElementById('groundSeed');

  let cycle = 0;
  const MAX_CYCLES = 2;

  // helper sleep
  const wait = ms => new Promise(res => setTimeout(res, ms));

  // clear classes and inline styles to reset to starting state
  function resetAll() {
    seed.classList.remove('open');
    stem.classList.remove('grow');
    armLeft.classList.remove('extend-left');
    armRight.classList.remove('extend-right');

    [leaf1,leaf2,leaf3,leaf4,leaf5].forEach(l=>{
      l.classList.remove('grow');
      l.style.opacity = 0;
      // force reflow safe-reset
      void l.offsetWidth;
    });

    bud.classList.remove('grow');
    apple.classList.remove('grow','fall');
    apple.style.opacity = 0;
    apple.setAttribute('aria-hidden','true');

    groundSeed.classList.remove('show');

    // ensure the main seed is visible at start
    seed.style.visibility = 'visible';
    seed.style.opacity = 1;

    // force reflow to ensure animations can be re-applied
    void document.body.offsetWidth;
  }

  // run a single full sequence
  async function runOneCycle() {
    resetAll();
    // short initial pause so visible
    await wait(200);

    // 1) seed opens
    seed.classList.add('open');
    await wait(900); // wait for seed-open animations (700ms + small buffer)

    // 2) sprout emerges and stem grows
    stem.classList.add('grow');
    await wait(1300); // allow stem to grow partially/mostly

    // 3) arms extend (left and right)
    armLeft.classList.add('extend-left');
    armRight.classList.add('extend-right');
    await wait(800);

    // 4) leaves appear one-by-one
    leaf1.classList.add('grow'); await wait(380);
    leaf2.classList.add('grow'); await wait(380);
    leaf3.classList.add('grow'); await wait(380);
    leaf4.classList.add('grow'); await wait(380);
    leaf5.classList.add('grow'); await wait(420);

    // 5) bud appears then becomes apple
    bud.classList.add('grow');
    await wait(700);
    // replace bud with apple (hide bud, show apple)
    bud.style.visibility = 'hidden';
    bud.style.opacity = 0;
    apple.classList.add('grow');
    apple.style.opacity = 1;
    apple.setAttribute('aria-hidden','false');

    // 6) hold apple for a short duration
    await wait(1800);

    // 7) apple falls
    apple.classList.add('fall');
    // apple-fall length 1200ms
    await wait(1250);

    // 8) apple has "compressed" into ground seed — show tiny ground seed
    apple.style.opacity = 0;
    apple.setAttribute('aria-hidden','true');

    // show ground seed tiny element
    groundSeed.classList.add('show');
    await wait(420);

    // 9) restore the reusable seed element to closed (for next cycle) — small delay
    seed.classList.remove('open');
    seed.style.visibility = 'visible';
    seed.style.opacity = 1;

    // small pause and cleanup then return
    await wait(700);
  }

  // main controller to run exactly 2 cycles
  async function runCycles() {
    // safety initial reset
    resetAll();
    // small delay to let DOM settle
    await wait(300);
    while (cycle < MAX_CYCLES) {
      await runOneCycle();
      cycle++;
      // between cycles small pause (final cycle does not restart)
      if (cycle < MAX_CYCLES) {
        // prepare next: hide ground tiny seed briefly before next planting
        groundSeed.classList.remove('show');
        await wait(600);
      } else {
        // finished all cycles: leave the grown tree visible (stem & leaves remain)
        // hide the reusable seed element and apple (already hidden)
        seed.style.visibility = 'hidden';
        seed.style.opacity = 0;
        bud.style.visibility = 'hidden';
        bud.style.opacity = 0;
        apple.style.display = 'none';
        // groundSeed remains visible as final small seed if you like
      }
    }
  }

  // start when loaded (safe)
  window.addEventListener('DOMContentLoaded', () => {
    // start with a slight delay so page renders
    setTimeout(() => {
      runCycles().catch(err => console.error(err));
    }, 350);
  });

  // expose for debugging (optional)
  window._restartTreeAnimation = () => {
    cycle = 0;
    resetAll();
    runCycles();
  };
})();
