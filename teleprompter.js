(function () {
  'use strict';

  // ── DOM refs ──
  const viewport      = document.getElementById('viewport');
  const titlebar      = document.getElementById('titlebar');
  const scriptWrapper = document.getElementById('script-wrapper');
  const scriptEl      = document.getElementById('script-container');
  const editor        = document.getElementById('editor');
  const btnPlay       = document.getElementById('btn-play');
  const btnMode       = document.getElementById('btn-mode');
  const sliderSpeed   = document.getElementById('slider-speed');
  const sliderFont    = document.getElementById('slider-font');
  const speedValEl    = document.getElementById('speed-val');
  const fontValEl     = document.getElementById('font-val');
  const alignBtns     = document.querySelectorAll('[data-align]');
  const colorBtns     = [
    document.getElementById('btn-color-white'),
    document.getElementById('btn-color-yellow'),
  ];

  // ── State ──
  let isPlaying     = false;
  let isEditMode    = false;
  let speed         = 20;          // 0–100
  let fontSize      = 42;
  let scrollPos     = 0;           // sub-pixel position
  let lastTimestamp  = 0;
  let textColor     = '#ffffff';
  let textAlign     = 'left';
  let rafId         = null;

  const SPEED_STEP  = 2;
  const PX_PER_SEC_FACTOR = 1.2;   // speed 50 ≈ 60 px/s

  // ── Default script ──
  const DEFAULT_SCRIPT =
    "Welcome to the Precision Teleprompter.\n\n" +
    "This is your scrolling script area. Paste or type your content by clicking the Edit button in the controls above.\n\n" +
    "Use the spacebar to play and pause. Press S to speed up, A to slow down.\n\n" +
    "The yellow cue line in the center of the viewport guides your reading position.\n\n" +
    "Drag the title bar to reposition the window. Resize it from the bottom-right corner.\n\n" +
    "Happy prompting!";

  // ── Dynamic padding so first/last line aligns with cue line ──
  function updateScriptPadding() {
    const half = scriptWrapper.clientHeight / 2;
    scriptEl.style.paddingTop    = half + 'px';
    scriptEl.style.paddingBottom = half + 'px';
  }

  new ResizeObserver(updateScriptPadding).observe(scriptWrapper);

  // ── Initialization ──
  function init() {
    loadScript(DEFAULT_SCRIPT);
    updateScriptPadding();
    applyFontSize();
    applyTextColor();
    applyTextAlign();
    startRAF();
  }

  function loadScript(text) {
    scriptEl.innerHTML = '';
    const paragraphs = text.split(/\n\n+/);
    paragraphs.forEach(function (p) {
      if (!p.trim()) return;
      const el = document.createElement('p');
      el.style.marginBottom = '1.1em';
      // Safely set text content (no HTML injection)
      el.textContent = p.trim();
      scriptEl.appendChild(el);
    });
  }

  // ── Motion Engine (rAF) ──
  function startRAF() {
    lastTimestamp = 0;
    rafId = requestAnimationFrame(tick);
  }

  function tick(timestamp) {
    if (lastTimestamp === 0) lastTimestamp = timestamp;
    const deltaMs = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    if (isPlaying && speed > 0) {
      const deltaSec = deltaMs / 1000;
      const pxPerSec = speed * PX_PER_SEC_FACTOR;
      scrollPos += pxPerSec * deltaSec;

      // Clamp so we don't scroll past the end
      const maxScroll = Math.max(0, scriptEl.scrollHeight - scriptWrapper.clientHeight);
      if (scrollPos > maxScroll) {
        scrollPos = maxScroll;
        setPlaying(false);
      }
    }

    scriptEl.style.transform = 'translateY(' + (-scrollPos) + 'px)';
    rafId = requestAnimationFrame(tick);
  }

  // ── Play / Pause ──
  function setPlaying(val) {
    isPlaying = val;
    btnPlay.innerHTML = isPlaying ? '&#9646;&#9646; Pause' : '&#9654; Play';
    btnPlay.classList.toggle('active', isPlaying);
    viewport.classList.toggle('active', isPlaying);
  }

  btnPlay.addEventListener('click', function () { setPlaying(!isPlaying); });

  // ── Speed slider ──
  sliderSpeed.addEventListener('input', function () {
    speed = parseInt(this.value, 10);
    speedValEl.textContent = speed;
  });

  function setSpeed(val) {
    speed = Math.max(0, Math.min(100, val));
    sliderSpeed.value = speed;
    speedValEl.textContent = speed;
  }

  // ── Font size slider ──
  sliderFont.addEventListener('input', function () {
    fontSize = parseInt(this.value, 10);
    applyFontSize();
  });

  function applyFontSize() {
    scriptEl.style.fontSize = fontSize + 'px';
    editor.style.fontSize   = fontSize + 'px';
    fontValEl.textContent    = fontSize + 'px';
  }

  // ── Text color ──
  colorBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      textColor = this.dataset.color;
      applyTextColor();
      colorBtns.forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');
    });
  });

  function applyTextColor() {
    scriptEl.style.color = textColor;
  }

  // ── Text alignment ──
  alignBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      textAlign = this.dataset.align;
      applyTextAlign();
      alignBtns.forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');
    });
  });

  function applyTextAlign() {
    scriptEl.style.textAlign = textAlign;
  }

  // ── Mode toggle (Edit / Prompt) ──
  btnMode.addEventListener('click', function () {
    isEditMode = !isEditMode;
    if (isEditMode) {
      // Switch to edit mode
      setPlaying(false);
      editor.value = getPlainText();
      editor.style.display = 'block';
      scriptEl.style.display = 'none';
      document.getElementById('cue-line').style.display = 'none';
      btnMode.innerHTML = '&#9654; Prompt';
    } else {
      // Switch to prompt mode
      loadScript(editor.value || DEFAULT_SCRIPT);
      editor.style.display   = 'none';
      scriptEl.style.display = 'block';
      document.getElementById('cue-line').style.display = '';
      scrollPos = 0;
      btnMode.innerHTML = '&#9998; Edit';
    }
  });

  function getPlainText() {
    var paras = scriptEl.querySelectorAll('p');
    var lines = [];
    paras.forEach(function (p) { lines.push(p.textContent); });
    return lines.join('\n\n');
  }

  // ── Keyboard Logic ──
  document.addEventListener('keydown', function (e) {
    // Ignore key events when typing in the editor textarea
    if (isEditMode && document.activeElement === editor) return;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        setPlaying(!isPlaying);
        break;
      case 'KeyS':
        e.preventDefault();
        setSpeed(speed + SPEED_STEP);
        break;
      case 'KeyA':
        e.preventDefault();
        setSpeed(speed - SPEED_STEP);
        break;
    }
  });

  // ── Draggable Viewport ──
  (function initDrag() {
    let dragging = false;
    let offsetX  = 0;
    let offsetY  = 0;

    titlebar.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      dragging = true;
      const rect = viewport.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      e.preventDefault();
    });

    document.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      let newLeft = e.clientX - offsetX;
      let newTop  = e.clientY - offsetY;
      // Clamp so the full viewport stays within the browser window
      const vw = viewport.offsetWidth;
      const vh = viewport.offsetHeight;
      newLeft = Math.max(0, Math.min(window.innerWidth  - vw, newLeft));
      newTop  = Math.max(0, Math.min(window.innerHeight - vh, newTop));
      viewport.style.left = newLeft + 'px';
      viewport.style.top  = newTop  + 'px';
    });

    document.addEventListener('mouseup', function () {
      dragging = false;
    });
  })();

  // ── Manual scroll with mouse wheel ──
  scriptWrapper.addEventListener('wheel', function (e) {
    e.preventDefault();
    scrollPos += e.deltaY;
    scrollPos = Math.max(0, scrollPos);
    const maxScroll = Math.max(0, scriptEl.scrollHeight - scriptWrapper.clientHeight);
    scrollPos = Math.min(scrollPos, maxScroll);
  }, { passive: false });

  // ── Start ──
  init();
})();
