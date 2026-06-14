/* ═══════════════════════════════════════════════════════════════
   EDITORIAL PORTFOLIO - Script
   Ecosystem: GSAP + ScrollTrigger + Lenis
   ═══════════════════════════════════════════════════════════════ */

// ─── 1. ECOSYSTEM SETUP ───

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger, Draggable);

// Initialize Lenis smooth scroll
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});

// Sync Lenis with GSAP's ticker
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

// Disable GSAP's default lag smoothing
gsap.ticker.lagSmoothing(0);

console.log("GSAP + Lenis Initialized");


// ─── 2. SMOOTH ANCHOR SCROLLING ───

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      lenis.scrollTo(target, { offset: -80 });
    }
  });
});


// ─── 2b. MOBILE MENU TOGGLE ───

const hamburgerBtn = document.getElementById('hamburger-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (hamburgerBtn && mobileMenu) {
  hamburgerBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('is-open');
    hamburgerBtn.classList.toggle('is-open');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu when a link is clicked
  mobileMenu.querySelectorAll('.mobile-menu-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      
      // If the link is not an anchor on the same page, let it open normally
      if (!href.startsWith('#')) {
        mobileMenu.classList.remove('is-open');
        hamburgerBtn.classList.remove('is-open');
        document.body.style.overflow = '';
        return;
      }

      e.preventDefault();
      mobileMenu.classList.remove('is-open');
      hamburgerBtn.classList.remove('is-open');
      document.body.style.overflow = '';
      const target = document.querySelector(href);
      if (target) {
        lenis.scrollTo(target, { offset: -80 });
      }
    });
  });
}


// ─── 3. NAV SCROLL STATE ───

const nav = document.getElementById('nav');

ScrollTrigger.create({
  start: 'top -80',
  onUpdate: (self) => {
    if (self.scroll() > 80) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
});


// ─── 4. NAV ACTIVE STATE ───

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

sections.forEach(section => {
  ScrollTrigger.create({
    trigger: section,
    start: 'top center',
    end: 'bottom center',
    onEnter: () => setActiveNav(section.id),
    onEnterBack: () => setActiveNav(section.id),
  });
});

function setActiveNav(id) {
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
  });
}


// ─── 5. HERO ENTRANCE ANIMATION (SplitType + GSAP) ───

// Split the hero title into individual characters
const titleSplit = new SplitType('#hero-title', { types: 'chars' });

// Split subtitle and description into lines
const subtitleSplit = new SplitType('#hero-subtitle', { types: 'lines' });
const descSplit = new SplitType('#hero-desc', { types: 'lines' });

// CRITICAL: Wrap split lines/chars in overflow:hidden for the "rising from floor" effect
document.querySelectorAll('#hero-title .char').forEach(char => {
  const wrapper = document.createElement('span');
  wrapper.style.overflow = 'hidden';
  wrapper.style.display = 'inline-block';
  char.parentNode.insertBefore(wrapper, char);
  wrapper.appendChild(char);
});

document.querySelectorAll('#hero-subtitle .line, #hero-desc .line').forEach(line => {
  const wrapper = document.createElement('div');
  wrapper.style.overflow = 'hidden';
  line.parentNode.insertBefore(wrapper, line);
  wrapper.appendChild(line);
});

// Set initial states
gsap.set(titleSplit.chars, { y: '100%', opacity: 0 });
gsap.set(subtitleSplit.lines, { y: '100%', opacity: 0 });
gsap.set(descSplit.lines, { y: '100%', opacity: 0 });

// Build the hero timeline
const heroTL = gsap.timeline({ defaults: { ease: 'power4.out' } });

heroTL
  // Badge fades in
  .to('.hero-badge', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    delay: 0.3,
  })
  // Title characters stagger up from behind mask
  .to(titleSplit.chars, {
    y: '0%',
    opacity: 1,
    duration: 1.2,
    stagger: 0.05,
    ease: 'power4.out',
  }, '-=0.3')
  // Playground items float in right after title starts
  .to('.draggable-item', {
    opacity: 1,
    duration: 0.8,
    stagger: 0.12,
    ease: 'power2.out',
  }, '-=0.6')
  // Subtitle lines rise up
  .to(subtitleSplit.lines, {
    y: '0%',
    opacity: 1,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out',
  }, '-=0.8')
  // Description lines rise up
  .to(descSplit.lines, {
    y: '0%',
    opacity: 1,
    duration: 0.8,
    stagger: 0.08,
    ease: 'power3.out',
  }, '-=0.4')
  // Scroll cue fades in
  .to('.hero-scroll-cue', {
    opacity: 1,
    duration: 0.6,
  }, '-=0.2');


// ─── 5b. HERO PLAYGROUND - GSAP Draggable ───

let topZIndex = 10;
let hintAnimations = []; // Store hint tweens so we can kill them on first interact

Draggable.create('.draggable-item', {
  type: 'x,y',
  edgeResistance: 0.65,
  bounds: '#hero',
  inertia: false,
  cursor: 'grab',
  activeCursor: 'grabbing',
  allowNativeTouchScrolling: false,
  onPress: function () {
    // Kill any hint animation on this element
    hintAnimations.forEach(anim => anim.kill());
    hintAnimations = [];

    topZIndex++;
    const isSquiggle = this.target.classList.contains('hero-squiggle');

    gsap.to(this.target, {
      scale: 1.08,
      boxShadow: isSquiggle ? 'none' : '0 12px 40px rgba(26, 26, 26, 0.18), 0 4px 12px rgba(26, 26, 26, 0.1)',
      zIndex: topZIndex,
      duration: 0.25,
      ease: 'power2.out',
      overwrite: 'auto',
    });
    this.target.classList.add('draggable-active');
  },
  onRelease: function () {
    const isSquiggle = this.target.classList.contains('hero-squiggle');

    gsap.to(this.target, {
      scale: 1,
      boxShadow: isSquiggle ? 'none' : '0 4px 16px rgba(26, 26, 26, 0.08), 0 1px 4px rgba(26, 26, 26, 0.05)',
      duration: 0.4,
      ease: 'elastic.out(1, 0.5)',
      overwrite: 'auto',
    });
    this.target.classList.remove('draggable-active');
  },
});

// ─── 5c. DRAG HINT - Gentle floating nudge ───
// After entrance animation completes, gently float items to hint "I'm draggable"
heroTL.eventCallback('onComplete', () => {
  document.querySelectorAll('.draggable-item').forEach((item, i) => {
    const anim = gsap.to(item, {
      y: '-=8',
      duration: 1.6 + (i * 0.2),
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: i * 0.3,
    });
    hintAnimations.push(anim);
  });
});

console.log('Hero Playground Draggable Initialized');


// ─── 6. SCROLL-TRIGGERED REVEALS ───

// Section headers
gsap.utils.toArray('.section-header').forEach(header => {
  gsap.to(header, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: header,
      start: 'top 85%',
      toggleActions: 'play none none none',
    }
  });
});

// About paragraphs
gsap.utils.toArray('.golden-col p').forEach((p, i) => {
  gsap.to(p, {
    opacity: 1,
    y: 0,
    duration: 0.7,
    delay: i * 0.1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: p,
      start: 'top 85%',
      toggleActions: 'play none none none',
    }
  });
});

// About meta items
gsap.utils.toArray('.about-meta-item').forEach((item, i) => {
  gsap.to(item, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    delay: i * 0.08,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: item,
      start: 'top 90%',
      toggleActions: 'play none none none',
    }
  });
});

// Work items - fade in + scrollytelling image swap
const workItems = gsap.utils.toArray('.work-item');
const previewImages = document.querySelectorAll('.work-preview-img');

// Fade work items in on scroll
workItems.forEach((item, i) => {
  gsap.to(item, {
    opacity: 0.3,
    y: 0,
    duration: 0.7,
    delay: i * 0.1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: item,
      start: 'top 85%',
      toggleActions: 'play none none none',
    }
  });
});

// Scrollytelling - activate item + swap image on scroll
if (workItems.length && previewImages.length) {
  // Set first item active initially
  workItems[0].classList.add('is-active');

  workItems.forEach((item) => {
    ScrollTrigger.create({
      trigger: item,
      start: 'top 40%',
      end: 'bottom 40%',
      onEnter: () => activateWorkItem(item),
      onEnterBack: () => activateWorkItem(item),
    });
  });

  function activateWorkItem(activeItem) {
    const idx = activeItem.dataset.index;

    // Toggle active class on items
    workItems.forEach(it => it.classList.remove('is-active'));
    activeItem.classList.add('is-active');

    // Update global state & dispatch event for custom cursor
    window.currentActiveProjectIndex = idx;
    document.dispatchEvent(new CustomEvent('projectchange', { detail: { index: idx } }));

    // Swap preview image & manage videos
    previewImages.forEach(img => {
      img.classList.remove('active');
      if (img.tagName === 'VIDEO') {
        img.pause();
      }
    });
    const target = document.querySelector(`.work-preview-img[data-index="${idx}"]`);
    if (target) {
      target.classList.add('active');
      if (target.tagName === 'VIDEO') {
        target.currentTime = 0;
        target.play().catch(e => console.log('Video play interrupted:', e));
      }
    }
  }
}

// Experience items
gsap.utils.toArray('.exp-item').forEach((item, i) => {
  gsap.to(item, {
    opacity: 1,
    y: 0,
    duration: 0.7,
    delay: i * 0.1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: item,
      start: 'top 85%',
      toggleActions: 'play none none none',
    }
  });
});

// Skill pills
gsap.utils.toArray('.skill-pill').forEach((pill, i) => {
  gsap.to(pill, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.4,
    delay: i * 0.02,
    ease: 'back.out(1.4)',
    scrollTrigger: {
      trigger: '.skills-flow',
      start: 'top 85%',
      toggleActions: 'play none none none',
    }
  });
});

// Contact section
const contactSection = document.getElementById('contact');
if (contactSection) {
  gsap.to('#contact .section-header', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: contactSection,
      start: 'top 80%',
      toggleActions: 'play none none none',
    }
  });
}


// ─── 7. PHYSICS SANDBOX - Matter.js Skills Playground ───

(function () {
  const canvas = document.getElementById('physics-canvas');
  if (!canvas || window.innerWidth < 768) return;

  // Destructure Matter.js modules
  const { Engine, Render, Runner, World, Bodies, Body, Mouse, MouseConstraint, Events, Composite } = Matter;

  // Create engine
  const engine = Engine.create({
    gravity: { x: 0, y: 1.2 } // Normal gravity restored
  });

  const world = engine.world;

  // Get container dimensions
  const cw = canvas.clientWidth;
  const ch = canvas.clientHeight;

  // Create renderer
  const render = Render.create({
    element: canvas,
    engine: engine,
    options: {
      width: cw,
      height: ch,
      wireframes: false,
      background: 'transparent',
      pixelRatio: window.devicePixelRatio || 1,
    }
  });

  Render.run(render);

  // Create runner
  const runner = Runner.create();
  Runner.run(runner, engine);

  // ── WALLS (Left, Right, Bottom - Top is open so balls drop in) ──
  const wallThickness = 60;
  const wallOptions = {
    isStatic: true,
    render: { visible: false },
    friction: 0.3,
    restitution: 0.4,
  };

  World.add(world, [
    // Bottom wall
    Bodies.rectangle(cw / 2, ch + wallThickness / 2, cw + 100, wallThickness, wallOptions),
    // Left wall
    Bodies.rectangle(-wallThickness / 2, ch / 2, wallThickness, ch * 2, wallOptions),
    // Right wall
    Bodies.rectangle(cw + wallThickness / 2, ch / 2, wallThickness, ch * 2, wallOptions),
  ]);

  // ── SKILL DEFINITIONS ──
  // Each skill gets a label and a color from the site palette.
  const skills = [
    { type: 'pill', text: 'Product Building' },
    { type: 'pill', text: 'UI/UX Design' },
    { type: 'pill', text: 'Prompt Engineering' },
    { type: 'pill', text: 'WebGL' },
    { type: 'pill', text: 'Three.js' },
    { type: 'pill', text: 'Chrome Extensions' },
    { type: 'pill', text: 'Agentic Workflows' },
    { type: 'pill', text: 'NLP' },
    { type: 'pill', text: 'Django' },
    { type: 'pill', text: 'Python' },
    { type: 'pill', text: 'Vite' },

    { type: 'icon', src: 'assets/images/logos/React.png', bg: '#F0F0F0' },
    { type: 'icon', src: 'assets/images/logos/Typescript.png', bg: '#F0F0F0' },
    { type: 'icon', src: 'assets/images/logos/Figma-logo.png', bg: '#F0F0F0' },
    { type: 'icon', src: 'assets/images/logos/Notion.png', bg: '#F0F0F0' },
    { type: 'icon', src: 'assets/images/logos/tailwind.png', bg: '#F0F0F0' },
    { type: 'icon', src: 'assets/images/logos/mcp.webp', bg: '#F0F0F0' },
    { type: 'icon', src: 'assets/images/logos/Google_AI_Studio.png', bg: '#F0F0F0' },
    { type: 'icon', src: 'assets/images/logos/Claude.png', bg: '#F0F0F0' },
    { type: 'icon', src: 'assets/images/logos/antigravity.png', bg: '#F0F0F0' },
    { type: 'icon', src: 'assets/images/logos/firebase.webp', bg: '#F0F0F0' },
    { type: 'icon', src: 'assets/images/logos/github.png', bg: '#F0F0F0' },
  ];

  // Pre-load images
  skills.forEach(skill => {
    if (skill.type === 'icon') {
      skill.img = new Image();
      skill.img.src = skill.src;
    }
  });

  // ── CREATE BODIES ──
  const balls = [];

  // Use a temp canvas to measure text
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');

  const colors = ['#1A1A1A', '#C4663D', '#8B7355'];
  let colorIdx = 0;

  skills.forEach((skill, i) => {
    // Use more horizontal space to spread them out across the new w-full container
    const x = (cw * 0.05) + (Math.random() * cw * 0.9);
    const y = ch - 120 - (Math.random() * 100); // Spawn near bottom

    const commonOptions = {
      restitution: 0.15,
      friction: 0.05,
      frictionAir: 0.035,
      density: 0.003,
    };

    let body;

    if (skill.type === 'pill') {
      const fontSize = 20; // Increased font size
      tempCtx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
      const textWidth = tempCtx.measureText(skill.text).width;

      const width = textWidth + 60; // Increased padding
      const height = 64; // Increased height

      const pillColor = colors[colorIdx++ % colors.length];

      body = Bodies.rectangle(x, y, width, height, {
        ...commonOptions,
        chamfer: { radius: height / 2 },
        render: {
          fillStyle: pillColor,
          strokeStyle: 'transparent',
          lineWidth: 0,
        }
      });

      body._isPill = true;
      body._text = skill.text;
      body._fontSize = fontSize;
      body._textColor = pillColor === '#1A1A1A' ? '#FAF9F6' : '#FAF9F6';
    } else {
      const radius = 50 + Math.random() * 12; // Increased icon radius

      body = Bodies.circle(x, y, radius, {
        ...commonOptions,
        render: {
          fillStyle: skill.bg,
          strokeStyle: '#EBE8E1',
          lineWidth: 1,
        }
      });

      body._isIcon = true;
      body._img = skill.img;
      body._radius = radius;
    }

    balls.push(body);
  });

  World.add(world, balls);

  // ── ATTRACTION FORCE - Pull balls gently toward the group center ──
  Events.on(engine, 'beforeUpdate', function () {
    // Calculate center of mass of all balls
    let cx = 0, cy = 0;
    balls.forEach(b => { cx += b.position.x; cy += b.position.y; });
    cx /= balls.length;
    cy /= balls.length;

    const attractionStrength = 0.0000012;

    balls.forEach(ball => {
      const dx = cx - ball.position.x;
      const dy = cy - ball.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 5) {
        Body.applyForce(ball, ball.position, {
          x: dx * attractionStrength * ball.mass,
          y: dy * attractionStrength * ball.mass,
        });
      }
    });
  });

  // ── MOUSE INTERACTION - CRITICAL ──
  const mouse = Mouse.create(render.canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      render: { visible: false },
    }
  });

  World.add(world, mouseConstraint);

  // Keep the mouse in sync with the render
  render.mouse = mouse;

  // Prevent page scroll when interacting with the canvas
  render.canvas.addEventListener('wheel', (e) => {
    // Allow normal page scrolling - don't prevent default
  });

  // Fix: remove mouse offset issues caused by CSS transforms
  mouse.element.removeEventListener('mousewheel', mouse.mousewheel);
  mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel);

  // ── RENDER LABELS AND ICONS ──
  Events.on(render, 'afterRender', function () {
    const ctx = render.context;

    balls.forEach(body => {
      ctx.save();
      ctx.translate(body.position.x, body.position.y);
      ctx.rotate(body.angle);

      if (body._isPill) {
        ctx.font = `600 ${body._fontSize}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = body._textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(body._text, 0, 0);
      } else if (body._isIcon) {
        if (body._img && body._img.complete) {
          const size = body._radius * 1.1; // Scale icon to fit inside circle
          ctx.drawImage(body._img, -size / 2, -size / 2, size, size);
        }
      }

      ctx.restore();
    });
  });

  // ── HANDLE RESIZE ──
  const resizePhysics = () => {
    const newW = canvas.clientWidth;
    const newH = canvas.clientHeight;

    render.canvas.width = newW * (window.devicePixelRatio || 1);
    render.canvas.height = newH * (window.devicePixelRatio || 1);
    render.options.width = newW;
    render.options.height = newH;

    // Update wall positions
    const wallBodies = Composite.allBodies(world).filter(b => b.isStatic);
    if (wallBodies.length >= 3) {
      Body.setPosition(wallBodies[0], { x: newW / 2, y: newH + wallThickness / 2 }); // Bottom
      Body.setPosition(wallBodies[1], { x: -wallThickness / 2, y: newH / 2 }); // Left
      Body.setPosition(wallBodies[2], { x: newW + wallThickness / 2, y: newH / 2 }); // Right
    }
  };

  window.addEventListener('resize', resizePhysics);

  // ── PERFORMANCE: Pause physics when off-screen ──
  let physicsActive = true;

  ScrollTrigger.create({
    trigger: canvas,
    start: 'top bottom+=200',
    end: 'bottom top-=200',
    onEnter: () => {
      if (!physicsActive) {
        Runner.run(runner, engine);
        Render.run(render);
        physicsActive = true;
      }
    },
    onEnterBack: () => {
      if (!physicsActive) {
        Runner.run(runner, engine);
        Render.run(render);
        physicsActive = true;
      }
    },
    onLeave: () => {
      if (physicsActive) {
        Runner.stop(runner);
        Render.stop(render);
        physicsActive = false;
      }
    },
    onLeaveBack: () => {
      if (physicsActive) {
        Runner.stop(runner);
        Render.stop(render);
        physicsActive = false;
      }
    },
  });

  console.log('Physics Sandbox Initialized (with visibility optimization)');
})();

// ── 8. CUSTOM INTERACTIVE CURSOR ──
(function () {
  const cursor = document.getElementById('custom-cursor');
  if (!cursor || window.innerWidth < 768) return;

  const cursorContent = cursor.querySelector('.cursor-content');
  const cursorText = cursor.querySelector('.cursor-text');
  const cursorIcon = cursor.querySelector('.cursor-icon');

  // Enable custom cursor mode globally (hides default cursor)
  document.body.classList.add('has-custom-cursor');

  // GSAP quickTo for high performance following
  const xTo = gsap.quickTo(cursor, "x", { duration: 0.15, ease: "power3" });
  const yTo = gsap.quickTo(cursor, "y", { duration: 0.15, ease: "power3" });

  let isHovering = false;
  let hasMoved = false;
  let currentMouseX = window.innerWidth / 2;
  let currentMouseY = window.innerHeight / 2;

  window.addEventListener("mousemove", (e) => {
    currentMouseX = e.clientX;
    currentMouseY = e.clientY;

    // Reveal cursor only on first move
    if (!hasMoved) {
      gsap.to(cursor, { opacity: 1, duration: 0.5 });
      hasMoved = true;
    }

    xTo(e.clientX);
    yTo(e.clientY);
  });

  // Default state style (Small dark dot)
  gsap.set(cursor, { width: 16, height: 16, backgroundColor: '#1A1A1A' });

  // 1. Projects Hover (Dark Pill with Dynamic Text)
  const workSection = document.getElementById('work');
  let isHoveringWork = false;

  const cursorTextMap = {
    "0": "Drag cards to browse",
    "1": "Open Playful",
    "2": "Visit Web Store",
    "3": "Open Zenithe",
    "4": "View Official Post",
    "5": "View Certificate",
    "6": "Visit Page",
    "7": "Open Aethecraft Studios"
  };

  const updateCursorText = () => {
    if (!isHoveringWork || !workSection) return;
    const idx = window.currentActiveProjectIndex || "0";
    const targetText = cursorTextMap[idx] || "Open Project";
    if (cursorText.textContent !== targetText) {
      cursorText.textContent = targetText;
    }
  };

  // Listen for active project changes to update cursor text instantly
  document.addEventListener('projectchange', (e) => {
    window.currentActiveProjectIndex = e.detail.index;
    updateCursorText();
  });

  const expandWorkCursor = () => {
    if (isHoveringWork) return;
    isHovering = true;
    isHoveringWork = true;
    cursorIcon.classList.remove('hidden');
    updateCursorText();

    gsap.to(cursor, {
      width: 220,
      height: 36,
      backgroundColor: '#1A1A1A', // Dark Pill
      mixBlendMode: 'normal',
      duration: 0.4,
      ease: 'back.out(1.5)'
    });
    gsap.set(cursorContent, { opacity: 1, scale: 1 });
  };

  const shrinkWorkCursor = () => {
    if (!isHoveringWork) return;
    isHovering = false;
    isHoveringWork = false;
    gsap.to(cursor, {
      width: 16,
      height: 16,
      backgroundColor: '#1A1A1A',
      mixBlendMode: 'normal',
      duration: 0.3,
      ease: 'power3.out'
    });
    gsap.set(cursorContent, { opacity: 0, scale: 0.5 });
    setTimeout(() => { if (!isHovering) cursorIcon.classList.add('hidden'); }, 200);
  };

  if (workSection) {
    workSection.style.cursor = 'none';
    workSection.addEventListener('mouseenter', expandWorkCursor);
    workSection.addEventListener('mouseleave', shrinkWorkCursor);

    // Make the entire section clickable
    workSection.addEventListener('click', (e) => {
      if (e.target.closest('a') || e.target.closest('button')) return;
      const idx = window.currentActiveProjectIndex || "0";
      const correspondingItem = document.querySelector(`.work-item[data-index="${idx}"]`);
      if (correspondingItem) {
        const link = correspondingItem.querySelector('h3 a');
        if (link && link.href) window.open(link.href, '_blank');
      }
    });
  }

  // 2. Footer Name Hover (Pill with Text)
  const footerName = document.getElementById('footer-name');
  if (footerName) {
    footerName.style.cursor = 'none';

    footerName.addEventListener('mouseenter', () => {
      isHovering = true;
      cursorIcon.classList.add('hidden');
      cursorText.textContent = "Product Designer";

      gsap.to(cursor, {
        width: 150,
        height: 36,
        backgroundColor: '#1A1A1A',
        mixBlendMode: 'normal',
        scale: 1,
        duration: 0.4,
        ease: 'back.out(1.5)'
      });
      gsap.set(cursorContent, { opacity: 1, scale: 1 });
    });

    footerName.addEventListener('mouseleave', () => {
      isHovering = false;
      gsap.to(cursor, {
        width: 16,
        height: 16,
        backgroundColor: '#1A1A1A',
        mixBlendMode: 'normal',
        scale: 1,
        duration: 0.3,
        ease: 'power3.out'
      });
      gsap.set(cursorContent, { opacity: 0, scale: 0.5 });
    });
  }

  // 3. Generic Dynamic Hover (elements with data-cursor-text attribute)
  const hoverCards = document.querySelectorAll('[data-cursor-text]');
  hoverCards.forEach(card => {
    card.style.cursor = 'none';

    card.addEventListener('mouseenter', () => {
      isHovering = true;
      cursorIcon.classList.remove('hidden');
      cursorText.textContent = card.getAttribute('data-cursor-text');

      const textLength = card.getAttribute('data-cursor-text').length;
      const pillWidth = Math.max(130, textLength * 9 + 30);

      gsap.to(cursor, {
        width: pillWidth,
        height: 36,
        backgroundColor: '#1A1A1A',
        mixBlendMode: 'normal',
        scale: 1,
        duration: 0.4,
        ease: 'back.out(1.5)'
      });
      gsap.set(cursorContent, { opacity: 1, scale: 1 });
    });

    card.addEventListener('mouseleave', () => {
      isHovering = false;
      gsap.to(cursor, {
        width: 16,
        height: 16,
        backgroundColor: '#1A1A1A',
        mixBlendMode: 'normal',
        scale: 1,
        duration: 0.3,
        ease: 'power3.out'
      });
      gsap.set(cursorContent, { opacity: 0, scale: 0.5 });
      setTimeout(() => { if (!isHovering) cursorIcon.classList.add('hidden'); }, 200);
    });
  });

})();

// ─── 9. TINDER-STYLE CARD DECK ───

(function () {
  const decks = document.querySelectorAll('.card-deck-container');
  
  decks.forEach(deck => {
    const cards = Array.from(deck.querySelectorAll('.deck-card'));
    const hint = deck.querySelector('.deck-swipe-hint');
    const totalCards = cards.length;
    let isAnimating = false;

    // Build a visual stack order (last element = top of stack visually)
    let stack = [...cards]; // stack[stack.length-1] is the top card

    // ── Position all cards in the stack ──
    function layoutStack(animate) {
      const dur = animate ? 0.45 : 0;
      stack.forEach((card, i) => {
        const distFromTop = (stack.length - 1) - i; // 0 = top card
        // Alternating slight rotation for fan-out effect
        const stackRotation = distFromTop > 0 ? (i % 2 === 0 ? 1.5 : -1.5) * distFromTop : 0;

        const props = {
          x: 0,
          y: distFromTop * 12,
          scale: 1 - distFromTop * 0.04,
          rotation: stackRotation,
          opacity: 1,
          zIndex: i + 1,
          duration: dur,
          ease: animate ? 'back.out(1.2)' : 'power2.out',
          overwrite: 'auto',
        };

        if (animate) {
          gsap.to(card, props);
        } else {
          gsap.set(card, props);
        }

        // Update counter label
        const label = card.querySelector('.deck-card-label');
        if (label) {
          label.textContent = `${distFromTop + 1} / ${totalCards}`;
        }
      });
    }

    // ── Get top card ──
    function getTopCard() {
      return stack[stack.length - 1];
    }

    // ── Swipe the top card out, then recycle it to the bottom ──
    function swipeCard(direction, velocityY) {
      if (isAnimating) return;
      isAnimating = true;

      const topCard = getTopCard();

      // Hide hint on first interaction
      if (hint) gsap.to(hint, { opacity: 0, duration: 0.3 });

      const xTarget = direction === 'right' ? 900 : -900;
      const yTarget = velocityY ? velocityY * 0.55 : (Math.random() * 200 - 100);
      const rotTarget = direction === 'right' ? 25 : -25;

      gsap.to(topCard, {
        x: xTarget,
        y: yTarget,
        rotation: rotTarget,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.in',
        onComplete: () => {
          // Move this card from top of stack to bottom
          stack.pop();
          stack.unshift(topCard);

          // Reset its position instantly (it's now at the bottom)
          gsap.set(topCard, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 });

          // Re-layout the entire stack with animation
          layoutStack(true);

          isAnimating = false;
        }
      });
    }

    // ── Make each card draggable ──
    cards.forEach(card => {
      Draggable.create(card, {
        type: 'x,y',
        inertia: false,
        cursor: 'grab',
        activeCursor: 'grabbing',
        zIndexBoost: false,

        onPress: function () {
          if (getTopCard() !== this.target || isAnimating) {
            this.endDrag();
            return;
          }
          gsap.to(this.target, {
            boxShadow: '0 24px 60px rgba(26, 26, 26, 0.25), 0 10px 24px rgba(26, 26, 26, 0.12)',
            scale: 1.04,
            duration: 0.25,
            ease: 'power2.out',
          });
        },

        onDrag: function () {
          if (getTopCard() !== this.target) return;
          // Tilt dynamically based on X and Y drag distance
          const rotation = this.x * 0.07 + (this.y * 0.02);
          gsap.set(this.target, { rotation: rotation });
        },

        onRelease: function () {
          if (getTopCard() !== this.target) return;

          const thresholdX = 120;

          if (Math.abs(this.x) > thresholdX) {
            // Swiped far enough — complete the swipe
            const dir = this.x > 0 ? 'right' : 'left';
            const finalY = this.y;
            // Clear inline shadow
            gsap.set(this.target, { clearProps: 'boxShadow' });
            swipeCard(dir, finalY);
          } else {
            // Snap back to center with spring effect
            gsap.to(this.target, {
              x: 0,
              y: 0,
              rotation: 0,
              scale: 1,
              boxShadow: '0 4px 24px rgba(26, 26, 26, 0.10), 0 1px 6px rgba(26, 26, 26, 0.06)',
              duration: 0.65,
              ease: 'elastic.out(1.1, 0.6)',
              overwrite: 'auto',
            });
          }
        },
      });
    });

    // Initial layout (no animation)
    layoutStack(false);
  });

  console.log('Card Decks Initialized');
})();
