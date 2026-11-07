// Add verified business contact details here before enabling live contact links.
const BUSINESS_CONTACT = {
  phone: "+919150745668",
  email: "safaconstruction62@gmail.com",
  whatsapp: "+919150745668",
};
const buildWhatsAppLink = (message) => {
  const digits = BUSINESS_CONTACT.whatsapp.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
};

// Demonstration-only rates in INR. Replace with approved SAFA CONSTRUCTION rates.
const SAMPLE_RATES = {
  basic: 1850,
  standard: 2250,
  premium: 2850,
  luxury: 3650,
  contingency: 0.10,
  addOns: {
    interiors: 450,
    kitchen: 180000,
    wall: 250000,
    landscaping: 150000,
  },
};

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#main-nav");
document.documentElement.classList.add("js-ready");

const introOverlay = document.querySelector("#cinematic-intro");
const introAudio = document.querySelector("#intro-audio");
const introEnter = document.querySelector("#intro-enter");
const introSkip = document.querySelector("#intro-skip");
const soundToggle = document.querySelector("#sound-toggle");
const introBrand = document.querySelector(".brand");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const INTRO_DURATION = 7800;
const SOUND_PREFERENCE_KEY = "safa-sound-enabled";
const INTRO_SESSION_KEY = "safa-intro-played-v3";
let soundEnabled = false;
let introTimer;
let introFadeTimer;
let introRun = 0;
let introActive = false;
let interfaceAudioContext;
let interfaceMaster;
let lastInterfaceSoundAt = 0;

const adminInnovationStudio = document.querySelector("#innovation-studio");
const adminAssistant = document.querySelector(".safa-chat");
if (adminInnovationStudio) {
  fetch("/api/admin-session", { credentials: "same-origin", cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error(`Admin session check returned HTTP ${response.status}.`);
      return response.json();
    })
    .then((session) => {
      adminInnovationStudio.hidden = session.authorized !== true;
      if (adminAssistant) adminAssistant.hidden = session.authorized !== true;
    })
    .catch((error) => {
      adminInnovationStudio.hidden = true;
      if (adminAssistant) adminAssistant.hidden = true;
      console.warn("Admin-only Innovation Studio remains hidden because access could not be verified.", error);
    });
}

const heroTitle = document.querySelector("#hero-title");
let heroTitleAnimationTimer;
const playHeroTitleLift = () => {
  heroTitle.classList.remove("is-lifting");
  void heroTitle.offsetWidth;
  heroTitle.classList.add("is-lifting");
  window.clearTimeout(heroTitleAnimationTimer);
  heroTitleAnimationTimer = window.setTimeout(() => {
    heroTitle.classList.remove("is-lifting");
  }, reducedMotion.matches ? 250 : 800);
};
heroTitle.addEventListener("pointerenter", (event) => {
  if (event.pointerType === "touch") return;
  heroTitle.classList.add("is-pointer-hover");
});
heroTitle.addEventListener("pointerleave", () => heroTitle.classList.remove("is-pointer-hover"));
heroTitle.addEventListener("click", playHeroTitleLift);
heroTitle.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  playHeroTitleLift();
});

try {
  soundEnabled = window.localStorage.getItem(SOUND_PREFERENCE_KEY) === "true";
} catch (error) {
  console.warn("SAFA interface sound preference could not be read; interface sounds remain off.", error);
}
introAudio.muted = false;
introAudio.volume = 0.82;

const updateSoundControl = () => {
  soundToggle.setAttribute("aria-pressed", String(soundEnabled));
  soundToggle.setAttribute("aria-label", soundEnabled ? "Mute interface sound effects" : "Turn on interface sound effects");
  soundToggle.querySelector(".sound-label").textContent = soundEnabled ? "UI SOUND ON" : "UI SOUND OFF";
  soundToggle.classList.toggle("is-muted", !soundEnabled);
};
updateSoundControl();

const playInterfaceSound = async (kind) => {
  if (!soundEnabled || introActive || !introAudio.paused) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    interfaceAudioContext = interfaceAudioContext || new AudioContextClass();
    const context = interfaceAudioContext;
    if (context.state === "suspended") await context.resume();
    if (!soundEnabled) return;
    const now = context.currentTime;
    if (now - lastInterfaceSoundAt < 0.12) return;
    lastInterfaceSoundAt = now;
    if (!interfaceMaster) {
      interfaceMaster = context.createGain();
      interfaceMaster.gain.setValueAtTime(0.34, now);
      interfaceMaster.connect(context.destination);
    }

    const sounds = {
      select: [{ frequency: 660, endFrequency: 820, duration: 0.075, volume: 0.04, type: "sine" }],
      confirm: [
        { frequency: 620, endFrequency: 760, duration: 0.11, volume: 0.05, type: "sine" },
        { frequency: 930, endFrequency: 1100, duration: 0.09, volume: 0.018, type: "triangle", delay: 0.035 },
      ],
      dismiss: [{ frequency: 520, endFrequency: 360, duration: 0.095, volume: 0.04, type: "sine" }],
    };
    (sounds[kind] || sounds.select).forEach(({ frequency, endFrequency, duration, volume, type, delay = 0 }) => {
      const startAt = context.currentTime + delay;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, startAt);
      oscillator.frequency.exponentialRampToValueAtTime(endFrequency, startAt + duration);
      gain.gain.setValueAtTime(0.001, startAt);
      gain.gain.linearRampToValueAtTime(volume, startAt + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
      oscillator.connect(gain).connect(interfaceMaster);
      oscillator.start(startAt);
      oscillator.stop(startAt + duration + 0.01);
    });
  } catch (error) {
    console.warn("SAFA interface sound effect could not play in this browser.", error);
  }
};

const finishIntro = (runId) => {
  if (runId !== introRun || !introActive) return;
  const restoreFocus = introOverlay.contains(document.activeElement);
  window.clearTimeout(introTimer);
  introTimer = undefined;
  introActive = false;
  introOverlay.classList.remove("is-active");
  introOverlay.classList.add("is-leaving");
  introOverlay.setAttribute("aria-hidden", "true");
  introOverlay.removeAttribute("role");
  introOverlay.removeAttribute("aria-modal");
  document.body.classList.remove("intro-open");
  document.querySelector("main").inert = false;
  document.querySelector(".site-header").inert = false;
  if (!reducedMotion.matches) {
    siteHeader.classList.remove("intro-reveal");
    document.querySelector(".hero-actions").classList.remove("intro-reveal");
    requestAnimationFrame(() => {
      siteHeader.classList.add("intro-reveal");
      document.querySelector(".hero-actions").classList.add("intro-reveal");
    });
    window.setTimeout(() => {
      siteHeader.classList.remove("intro-reveal");
      document.querySelector(".hero-actions").classList.remove("intro-reveal");
    }, 1500);
  }
  if (restoreFocus) document.querySelector("#hero-title").focus({ preventScroll: true });
  document.querySelector("#intro-audio-status").textContent =
    introAudio.dataset.playback === "skipped" ? "Intro skipped." : "Introduction finished.";
  window.setTimeout(() => introOverlay.classList.remove("is-leaving"), reducedMotion.matches ? 0 : 900);
  window.clearInterval(introFadeTimer);
  if (!introAudio.paused && !introAudio.ended) {
    const fadeStartedAt = performance.now();
    const fadeStartVolume = introAudio.volume;
    introFadeTimer = window.setInterval(() => {
      const progress = Math.min((performance.now() - fadeStartedAt) / 220, 1);
      introAudio.volume = fadeStartVolume * (1 - progress);
      if (progress === 1) {
        window.clearInterval(introFadeTimer);
        introAudio.pause();
        introAudio.currentTime = 0;
        introAudio.volume = 0.82;
      }
    }, 24);
  } else {
    introAudio.pause();
    introAudio.currentTime = 0;
    introAudio.volume = 0.82;
  }
};

const runIntroAnimation = (runId) => {
  window.clearTimeout(introTimer);
  introOverlay.classList.remove("is-playing");
  void introOverlay.offsetWidth;
  introOverlay.classList.add("is-playing");
  const reducedMotionDuration = Math.max(3000, Number.isFinite(introAudio.duration) ? introAudio.duration * 1000 : 0);
  introTimer = window.setTimeout(() => finishIntro(runId), reducedMotion.matches ? reducedMotionDuration : INTRO_DURATION);
};

const beginIntro = async () => {
  introRun += 1;
  const runId = introRun;
  window.clearTimeout(introTimer);
  window.clearInterval(introFadeTimer);
  introAudio.pause();
  introAudio.currentTime = 0;
  introAudio.volume = 0.82;
  introActive = true;
  introOverlay.classList.remove("is-leaving");
  introOverlay.classList.add("is-active");
  introOverlay.setAttribute("aria-hidden", "false");
  introOverlay.setAttribute("role", "dialog");
  introOverlay.setAttribute("aria-modal", "true");
  document.body.classList.add("intro-open");
  document.querySelector("main").inert = true;
  document.querySelector(".site-header").inert = true;
  introEnter.hidden = true;
  introEnter.disabled = false;
  introSkip.hidden = false;
  introSkip.focus({ preventScroll: true });

  runIntroAnimation(runId);
  introAudio.muted = false;
  try {
    introAudio.currentTime = 0;
    await introAudio.play();
    if (runId !== introRun || !introActive) return;
    introAudio.dataset.playback = "playing";
    document.querySelector("#intro-audio-status").textContent = "Intro music is playing.";
  } catch (error) {
    if (runId !== introRun || !introActive) return;
    introAudio.pause();
    introAudio.currentTime = 0;
    introAudio.dataset.playback = error.name === "NotSupportedError" ? "unavailable" : "pending";
    introEnter.hidden = false;
    introEnter.disabled = false;
    introEnter.textContent = error.name === "NotSupportedError" ? "Retry intro sound" : "Play intro with sound";
    document.querySelector("#intro-audio-status").textContent = error.name === "NotSupportedError"
      ? "Intro audio could not be loaded. Check the audio file or browser support, then retry."
      : "Your browser blocked automatic audio. Select “Play intro with sound” to start the music.";
    console.warn("SAFA intro audio did not start automatically; waiting for an explicit play action.", error);
  }
};

const introEnterWebsite = async () => {
  introEnter.disabled = true;
  introEnter.textContent = "Starting intro sound…";
  try {
    introAudio.muted = false;
    introAudio.currentTime = 0;
    await introAudio.play();
    if (!introActive) return;
    introAudio.dataset.playback = "local-audio";
    introEnter.hidden = true;
    document.querySelector("#intro-audio-status").textContent = "Intro music is playing.";
  } catch (error) {
    if (!introActive) return;
    introEnter.disabled = false;
    introAudio.dataset.playback = error.name === "NotSupportedError" ? "unavailable" : "pending";
    introEnter.textContent = error.name === "NotSupportedError" ? "Retry intro sound" : "Play intro with sound";
    document.querySelector("#intro-audio-status").textContent = error.name === "NotSupportedError"
      ? "Intro audio is unavailable in this browser. Check the audio file and retry."
      : "Sound has not started yet. Check your browser’s site sound settings and retry.";
    console.warn("SAFA intro audio could not play after user interaction.", error);
  }
};

introEnter.addEventListener("click", introEnterWebsite);
introAudio.addEventListener("ended", () => {
  if (introActive) document.querySelector("#intro-audio-status").textContent = "Intro music finished.";
});
introSkip.addEventListener("click", () => {
  introAudio.dataset.playback = "skipped";
  finishIntro(introRun);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && introActive) {
    introAudio.dataset.playback = "skipped";
    finishIntro(introRun);
  }
});
soundToggle.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  updateSoundControl();
  try {
    window.localStorage.setItem(SOUND_PREFERENCE_KEY, String(soundEnabled));
  } catch (error) {
    console.warn("SAFA sound preference could not be saved; it will apply for this visit.", error);
  }
  if (interfaceMaster && interfaceAudioContext) {
    const now = interfaceAudioContext.currentTime;
    interfaceMaster.gain.cancelScheduledValues(now);
    interfaceMaster.gain.setTargetAtTime(soundEnabled ? 0.34 : 0, now, 0.04);
  }
  if (soundEnabled && !introActive) void playInterfaceSound("confirm");
});
document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const target = event.target.closest("button, input[type='submit'], summary, .project-card, a[href]");
  if (!target || target.matches("#sound-toggle, #intro-enter")) return;
  if (target.matches("#intro-skip, .dialog-close, #safa-chat-close")) {
    void playInterfaceSound("dismiss");
  } else if (target.matches(".button-gold, button[type='submit'], input[type='submit'], #save-house, #dialog-enquire, .safa-chat-form button")) {
    void playInterfaceSound("confirm");
  } else {
    void playInterfaceSound("select");
  }
});
document.addEventListener("change", (event) => {
  if (event.target instanceof Element && event.target.matches("select, input[type='range'], input[type='radio'], input[type='checkbox']")) {
    void playInterfaceSound("select");
  }
});
introBrand.addEventListener("click", (event) => {
  event.preventDefault();
  beginIntro();
});
document.querySelector("#replay-intro").addEventListener("click", () => {
  beginIntro();
});

const siteHeader = document.querySelector(".site-header");
const hero = document.querySelector(".hero");
let scrollFrame = 0;
const updateScrollEffects = () => {
  const scrollY = window.scrollY;
  siteHeader.classList.toggle("is-scrolled", scrollY > 30);
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && scrollY < hero.offsetHeight) {
    hero.style.setProperty("--hero-parallax", `${Math.round(scrollY * 0.12)}px`);
  }
  scrollFrame = 0;
};
window.addEventListener("scroll", () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollEffects);
}, { passive: true });
updateScrollEffects();

const revealTargets = document.querySelectorAll(
  ".intro-grid, .values-row article, .section-heading, .service-card, .project-card, .process-grid article, .tracking-panel, .planning-layout, .estimate-copy, .calculator, .contact-heading, .contact-form, .closing > *",
);
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -35px 0px" });
  revealTargets.forEach((element, index) => {
    element.classList.add("reveal");
    if (element.matches(".service-card, .project-card, .values-row article, .process-grid article")) {
      element.classList.add(`reveal-delay-${(index % 3) + 1}`);
    }
    revealObserver.observe(element);
  });
}

const navLinks = [...mainNav.querySelectorAll('a[href^="#"]')];
const navSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        const active = link.getAttribute("href") === `#${entry.target.id}`;
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
        link.classList.toggle("is-active", active);
      });
    });
  }, { rootMargin: "-25% 0px -65% 0px" });
  navSections.forEach((section) => sectionObserver.observe(section));
}

const customCursor = document.querySelector(".custom-cursor");
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  const cursorDot = customCursor.querySelector(".cursor-dot");
  const cursorRing = customCursor.querySelector(".cursor-ring");
  const cursorLabel = customCursor.querySelector(".cursor-label");
  let pointerX = -100;
  let pointerY = -100;
  let cursorFrame = 0;
  const renderCursor = () => {
    cursorDot.style.transform = `translate(${pointerX}px, ${pointerY}px) translate(-50%, -50%)`;
    const position = `translate(${pointerX}px, ${pointerY}px) translate(-50%, -50%)`;
    cursorRing.style.transform = position;
    cursorLabel.style.transform = position;
    cursorFrame = 0;
  };
  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (!cursorFrame) cursorFrame = requestAnimationFrame(renderCursor);
  }, { passive: true });
  document.querySelectorAll("a, button, [data-cursor-label]").forEach((element) => {
    element.addEventListener("pointerenter", () => {
      customCursor.classList.add("is-hovering");
      cursorLabel.textContent = element.dataset.cursorLabel || "";
    });
    element.addEventListener("pointerleave", () => customCursor.classList.remove("is-hovering"));
  });
}

const houseViewer = document.querySelector("#house-viewer");
const viewerStatus = document.querySelector("#viewer-status");
const viewerHint = document.querySelector("#viewer-hint");
const houseControls = [
  document.querySelector("#house-style"),
  document.querySelector("#house-color"),
  document.querySelector("#house-finish"),
  document.querySelector("#house-roof"),
  document.querySelector("#house-glazing"),
  document.querySelector("#house-floors"),
  document.querySelector("#house-light"),
  document.querySelector("#reset-house"),
  document.querySelector("#save-house"),
];
let houseViewerStarted = false;
let houseThreePromise;
const loadThree = () => {
  if (window.THREE) return Promise.resolve(window.THREE);
  if (houseThreePromise) return houseThreePromise;
  houseThreePromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.async = true;
    script.onload = () => window.THREE ? resolve(window.THREE) : reject(new Error("3D library did not initialize."));
    script.onerror = () => reject(new Error("3D library could not be downloaded."));
    document.head.append(script);
  });
  return houseThreePromise;
};

const startHeroArchitecture = async () => {
  const canvas = document.querySelector("#hero-architecture");
  const heroSection = document.querySelector(".hero");
  if (!canvas || !heroSection || canvas.dataset.started === "true") return;
  canvas.dataset.started = "true";

  try {
    const THREE = await loadThree();
    const width = heroSection.clientWidth;
    const height = heroSection.clientHeight;
    if (!width || !height) throw new Error("The architectural scene has no visible layout size.");

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.outputEncoding = THREE.sRGBEncoding;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, width / height, .1, 100);
    const target = new THREE.Vector3(2, 2.4, 0);
    camera.position.set(10, 7, 14);
    camera.lookAt(target);

    scene.add(new THREE.HemisphereLight(0xf7f0df, 0x171819, 2.1));
    const keyLight = new THREE.DirectionalLight(0xffedcf, 2.6);
    keyLight.position.set(-5, 10, 8);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0xc7a875, 42, 19);
    rimLight.position.set(5, 4, -4);
    scene.add(rimLight);

    const architecture = new THREE.Group();
    architecture.position.x = 2.25;
    scene.add(architecture);
    const addBox = (width, height, depth, position, material, rotationY = 0) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
      mesh.position.set(...position);
      mesh.rotation.y = rotationY;
      architecture.add(mesh);
      return mesh;
    };
    const ivory = new THREE.MeshStandardMaterial({ color: "#c9c2b3", roughness: .66, metalness: .12 });
    const charcoal = new THREE.MeshStandardMaterial({ color: "#202321", roughness: .48, metalness: .38 });
    const glazing = new THREE.MeshStandardMaterial({
      color: "#475354",
      roughness: .19,
      metalness: .56,
      emissive: "#5d5039",
      emissiveIntensity: .12,
    });
    const gold = new THREE.MeshStandardMaterial({
      color: "#bd9c61",
      roughness: .27,
      metalness: .82,
      emissive: "#4a3216",
      emissiveIntensity: .16,
    });
    const ground = new THREE.Mesh(
      new THREE.BoxGeometry(10, .14, 7),
      new THREE.MeshStandardMaterial({ color: "#252522", roughness: .9 }),
    );
    ground.position.set(0, -.08, 0);
    architecture.add(ground);

    addBox(6.6, .28, 4.9, [0, .16, 0], charcoal);
    addBox(4.9, 2.45, 4.05, [-.43, 1.52, -.12], ivory);
    addBox(5.05, 2.28, 3.9, [.28, 3.86, -.15], charcoal);
    addBox(7.1, .22, 5.45, [.25, 5.15, -.12], ivory, -.035);
    addBox(6.85, .07, 5.23, [.25, 5.3, -.12], gold, -.035);

    addBox(4.35, 1.92, .09, [-.43, 1.62, 1.93], glazing);
    [-2.62, -1.25, .16, 1.57].forEach((x) => addBox(.075, 2.15, .16, [x, 1.68, 2], gold));
    addBox(4.55, .08, .16, [-.43, .64, 2], gold);
    addBox(4.55, .08, .16, [-.43, 2.64, 2], gold);
    addBox(2.35, 1.76, .09, [.3, 3.86, 1.82], glazing);
    [-.98, .28, 1.56].forEach((x) => addBox(.065, 1.84, .13, [x, 3.86, 1.9], gold));
    addBox(2.5, .075, .13, [.3, 2.94, 1.9], gold);
    addBox(2.5, .075, .13, [.3, 4.78, 1.9], gold);

    addBox(2.1, .18, 2.15, [-2.34, 1.48, 1.35], ivory);
    addBox(.11, 2.2, .11, [-3.24, 1.15, 2.17], gold);
    addBox(.11, 2.2, .11, [-1.44, 1.15, 2.17], gold);
    addBox(2.45, .17, 2.3, [2.2, .34, 2.34], charcoal);
    addBox(2.25, 2.45, .12, [2.2, 1.55, 3.43], charcoal);
    addBox(.055, 2.4, .07, [2.2, 1.55, 3.51], gold);
    addBox(1.4, .08, .9, [-2.55, 2.87, .1], gold);

    const blueprintMaterial = new THREE.LineBasicMaterial({ color: "#c7a875", transparent: true, opacity: .28 });
    const gridPoints = [
      [-4.8, -.005, -3.3], [4.8, -.005, -3.3],
      [4.8, -.005, -3.3], [4.8, -.005, 3.3],
      [4.8, -.005, 3.3], [-4.8, -.005, 3.3],
      [-4.8, -.005, 3.3], [-4.8, -.005, -3.3],
    ];
    const gridGeometry = new THREE.BufferGeometry().setFromPoints(
      gridPoints.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    );
    const blueprint = new THREE.LineSegments(gridGeometry, blueprintMaterial);
    architecture.add(blueprint);

    const dustPositions = new Float32Array(90);
    for (let index = 0; index < dustPositions.length; index += 3) {
      dustPositions[index] = (Math.random() - .5) * 9;
      dustPositions[index + 1] = Math.random() * 6;
      dustPositions[index + 2] = (Math.random() - .5) * 7;
    }
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute("position", new THREE.Float32BufferAttribute(dustPositions, 3));
    const dust = new THREE.Points(
      dustGeometry,
      new THREE.PointsMaterial({ color: "#d8bd84", size: .022, transparent: true, opacity: .4, sizeAttenuation: true }),
    );
    dust.position.x = 2.1;
    scene.add(dust);

    let visible = true;
    let frame = 0;
    let previousFrameAt = 0;
    let pointerX = 0;
    let pointerY = 0;
    let currentX = 0;
    let currentY = 0;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const render = (time = 0) => {
      frame = 0;
      if (document.hidden || !visible) return;
      if (prefersReducedMotion.matches) {
        renderer.render(scene, camera);
        return;
      }
      if (time - previousFrameAt < 32) {
        frame = requestAnimationFrame(render);
        return;
      }
      previousFrameAt = time;
      currentX += (pointerX - currentX) * .035;
      currentY += (pointerY - currentY) * .035;
      architecture.rotation.y = currentX * .12 + Math.sin(time * .00012) * .018;
      architecture.rotation.x = -currentY * .035;
      dust.position.y = Math.sin(time * .00016) * .08;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    const heroVisibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame) frame = requestAnimationFrame(render);
      if (!visible && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    heroVisibility.observe(heroSection);
    heroSection.addEventListener("pointermove", (event) => {
      const bounds = heroSection.getBoundingClientRect();
      pointerX = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
      pointerY = ((event.clientY - bounds.top) / bounds.height - .5) * 2;
    }, { passive: true });
    heroSection.addEventListener("pointerleave", () => {
      pointerX = 0;
      pointerY = 0;
    });
    prefersReducedMotion.addEventListener?.("change", () => {
      if (prefersReducedMotion.matches && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
        renderer.render(scene, camera);
      } else if (!prefersReducedMotion.matches && visible && !frame) {
        frame = requestAnimationFrame(render);
      }
    });
    const resizeObserver = new ResizeObserver(() => {
      const nextWidth = heroSection.clientWidth;
      const nextHeight = heroSection.clientHeight;
      if (!nextWidth || !nextHeight) return;
      renderer.setSize(nextWidth, nextHeight);
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      if (prefersReducedMotion.matches) renderer.render(scene, camera);
    });
    resizeObserver.observe(heroSection);
    heroSection.classList.add("has-3d-architecture");
    frame = requestAnimationFrame(render);
  } catch (error) {
    canvas.dataset.started = "false";
    console.warn("SAFA cinematic 3D hero is unavailable; retaining the architectural photo fallback.", error);
  }
};

if ("IntersectionObserver" in window) {
  const heroLoader = new IntersectionObserver(([entry], observer) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    void startHeroArchitecture();
  }, { rootMargin: "100px 0px" });
  heroLoader.observe(document.querySelector(".hero"));
}

const startHouseViewer = async () => {
  if (houseViewerStarted) return;
  houseViewerStarted = true;
  viewerStatus.textContent = "Loading interactive 3D concept…";
  try {
    const THREE = await loadThree();
    const houseParameters = new URLSearchParams(window.location.search);
    const requestedHouseColor = houseParameters.get("houseColor");
    const houseColorControl = document.querySelector("#house-color");
    if ([...houseColorControl.options].some((option) => option.value === requestedHouseColor)) {
      houseColorControl.value = requestedHouseColor;
    }
    const houseRoofControl = document.querySelector("#house-roof");
    const requestedRoof = houseParameters.get("houseRoof");
    if ([...houseRoofControl.options].some((option) => option.value === requestedRoof)) {
      houseRoofControl.value = requestedRoof;
    }
    const houseGlazingControl = document.querySelector("#house-glazing");
    const requestedGlazing = houseParameters.get("houseGlazing");
    if ([...houseGlazingControl.options].some((option) => option.value === requestedGlazing)) {
      houseGlazingControl.value = requestedGlazing;
    }
    const canvas = document.querySelector("#house-canvas");
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(houseViewer.clientWidth, houseViewer.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0b1e37");
    const camera = new THREE.PerspectiveCamera(36, houseViewer.clientWidth / houseViewer.clientHeight, .1, 100);
    const target = new THREE.Vector3(0, 2.3, 0);
    let radius = 22;
    let theta = .76;
    let phi = 1.12;
    const placeCamera = () => {
      camera.position.set(
        target.x + radius * Math.sin(phi) * Math.sin(theta),
        target.y + radius * Math.cos(phi),
        target.z + radius * Math.sin(phi) * Math.cos(theta),
      );
      camera.lookAt(target);
    };
    placeCamera();

    const ambient = new THREE.HemisphereLight(0xf5f5f5, 0x182333, .65);
    scene.add(ambient);
    const keyLight = new THREE.DirectionalLight(0xffedcf, 1.1);
    keyLight.position.set(-5, 9, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);
    const warmAccent = new THREE.PointLight(0xd6a34a, 4.5, 18);
    warmAccent.position.set(5, 4, -3);
    scene.add(warmAccent);

    const architecture = new THREE.Group();
    scene.add(architecture);
    let customModel = null;
    let customModelName = "";
    const customModelOriginalMaterials = new Map();
    let customModelParts = new Map();
    let customModelDefaultColor = "";
    let customModelDefaultFinish = "";
    let gltfLoaderPromise;
    const customModelInput = document.querySelector("#custom-model-file");
    const customModelStatus = document.querySelector("#custom-model-status");
    const customModelControls = document.querySelector("#custom-model-controls");
    const customModelPartControl = document.querySelector("#custom-model-part");
    const customModelColorControl = document.querySelector("#custom-model-color");
    const customModelFinishControl = document.querySelector("#custom-model-finish");
    const housePhotoInput = document.querySelector("#house-photo-file");
    const housePhotoPicker = document.querySelector("#house-photo-picker");
    const housePhotoPreview = document.querySelector("#house-photo-preview");
    const housePhotoStatus = document.querySelector("#house-photo-status");
    const clearHousePhotoButton = document.querySelector("#clear-house-photo");
    let housePhotoUrl = "";
    let housePhotoLoadId = 0;
    const housePhotoModel = new THREE.Group();
    housePhotoModel.visible = false;
    scene.add(housePhotoModel);
    const customModelButtons = [
      customModelPartControl,
      customModelColorControl,
      customModelFinishControl,
      document.querySelector("#apply-model-design"),
      document.querySelector("#restore-model-design"),
      document.querySelector("#clear-custom-model"),
    ];
    const setCustomModelStatus = (message) => {
      customModelStatus.textContent = message;
      viewerStatus.textContent = message;
    };
    const loadGltfLoader = () => {
      if (THREE.GLTFLoader) return Promise.resolve();
      if (gltfLoaderPromise) return gltfLoaderPromise;
      gltfLoaderPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/three@0.128.0/examples/js/loaders/GLTFLoader.js";
        script.async = true;
        script.onload = () => THREE.GLTFLoader ? resolve() : reject(new Error("3D model loader did not initialize."));
        script.onerror = () => reject(new Error("3D model loader could not be downloaded."));
        document.head.append(script);
      }).catch((error) => {
        gltfLoaderPromise = undefined;
        throw error;
      });
      return gltfLoaderPromise;
    };
    const disposeCustomModel = () => {
      if (!customModel) return;
      scene.remove(customModel);
      customModel.traverse((object) => {
        object.geometry?.dispose();
        if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
        else object.material?.dispose();
      });
      customModelOriginalMaterials.forEach((materials) => materials.forEach((material) => material.dispose()));
      customModel = null;
      customModelOriginalMaterials.clear();
      customModelParts = new Map();
      customModelName = "";
      architecture.visible = true;
      customModelControls.hidden = true;
      customModelButtons.forEach((control) => { control.disabled = true; });
      houseControls.slice(0, 7).forEach((control) => { control.disabled = false; });
      document.querySelector(".studio-control-grid").hidden = false;
    };
    const clearHousePhoto = () => {
      housePhotoLoadId += 1;
      housePhotoModel.traverse((object) => {
        object.geometry?.dispose();
        if (Array.isArray(object.material)) object.material.forEach((material) => {
          material.map?.dispose();
          material.dispose();
        });
        else {
          object.material?.map?.dispose();
          object.material?.dispose();
        }
      });
      housePhotoModel.clear();
      housePhotoModel.visible = false;
      architecture.visible = true;
      document.querySelector(".studio-control-grid").hidden = false;
      housePhotoPicker.hidden = true;
      clearHousePhotoButton.hidden = true;
      housePhotoInput.value = "";
      housePhotoPreview.removeAttribute("src");
      if (housePhotoUrl) URL.revokeObjectURL(housePhotoUrl);
      housePhotoUrl = "";
      target.set(0, 2.3, 0);
      radius = 22;
      theta = .76;
      phi = 1.12;
      placeCamera();
      customModelInput.disabled = false;
      housePhotoStatus.textContent = "Photo removed. The interactive house concept is visible again.";
      viewerHint.hidden = true;
      buildHouse();
      updateSummary();
      renderHouse();
    };
    const resetCustomModelMaterials = () => {
      customModelParts.forEach((objects) => {
        objects.forEach((object) => {
          const current = object.material;
          if (Array.isArray(current)) current.forEach((material) => material.dispose());
          else current?.dispose();
          const originals = customModelOriginalMaterials.get(object.uuid);
          object.material = originals.length > 1 ? originals.map((material) => material.clone()) : originals[0].clone();
        });
      });
    };
    const applyCustomModelDesign = () => {
      if (!customModel) return;
      const selectedPart = customModelPartControl.value;
      const targets = selectedPart === "all"
        ? [...customModelParts.values()].flat()
        : customModelParts.get(selectedPart) || [];
      const finishSettings = {
        smooth: { roughness: .42, metalness: .02 },
        stone: { roughness: .94, metalness: .01 },
        textured: { roughness: .86, metalness: 0 },
        metal: { roughness: .3, metalness: .68 },
      }[customModelFinishControl.value];
      targets.forEach((object) => {
        const currentMaterials = Array.isArray(object.material) ? object.material : [object.material];
        object.material = currentMaterials.map((material, index) => {
          const updated = material.clone();
          updated.color.set(customModelColorControl.value);
          updated.roughness = finishSettings.roughness;
          updated.metalness = finishSettings.metalness;
          updated.needsUpdate = true;
          return updated;
        });
        if (object.material.length === 1) object.material = object.material[0];
      });
      renderHouse();
      const partName = selectedPart === "all" ? "all model parts" : customModelPartControl.selectedOptions[0].textContent;
      setCustomModelStatus(`Applied ${customModelColorControl.selectedOptions[0].textContent} with ${customModelFinishControl.selectedOptions[0].textContent.toLowerCase()} finish to ${partName}. The edit is a local visual preview.`);
    };
    const loadCustomModel = async (file) => {
      if (!file) return;
      if (!file.name.toLowerCase().endsWith(".glb") || file.size > 30 * 1024 * 1024) {
        customModelInput.value = "";
        setCustomModelStatus("Choose one self-contained .GLB file no larger than 30 MB. Other formats and external linked textures are not supported.");
        return;
      }
      clearHousePhoto();
      customModelInput.disabled = true;
      setCustomModelStatus("Reading the selected model locally… It is not being uploaded.");
      try {
        await loadGltfLoader();
        const data = await file.arrayBuffer();
        const gltf = await new Promise((resolve, reject) => {
          new THREE.GLTFLoader().parse(data, "", resolve, reject);
        });
        if (!gltf.scene) throw new Error("The GLB file does not contain a scene.");
        const candidate = gltf.scene;
        candidate.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(candidate);
        const dimensions = bounds.getSize(new THREE.Vector3());
        if (bounds.isEmpty() || ![dimensions.x, dimensions.y, dimensions.z].every(Number.isFinite) ||
            Math.max(dimensions.x, dimensions.y, dimensions.z) <= 0) {
          throw new Error("No visible 3D geometry was found in this model.");
        }
        const scale = 10 / Math.max(dimensions.x, dimensions.y, dimensions.z);
        const center = bounds.getCenter(new THREE.Vector3());
        candidate.scale.multiplyScalar(scale);
        candidate.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
        candidate.updateMatrixWorld(true);

        const nextParts = new Map();
        const nextOriginalMaterials = new Map();
        let meshIndex = 0;
        candidate.traverse((object) => {
          if (!object.isMesh) return;
          meshIndex += 1;
          object.castShadow = true;
          object.receiveShadow = true;
          const label = (object.name || `Model part ${meshIndex}`).trim().slice(0, 60);
          const key = `part-${meshIndex}`;
          const existing = nextParts.get(key) || [];
          const originals = Array.isArray(object.material)
            ? object.material.map((material) => material.clone())
            : [object.material.clone()];
          object.material = Array.isArray(object.material)
            ? object.material.map((material) => material.clone())
            : object.material.clone();
          nextOriginalMaterials.set(object.uuid, originals);
          object.userData.safaPartKey = key;
          existing.push(object);
          nextParts.set(key, existing);
          object.userData.safaPartLabel = label;
        });
        if (!meshIndex) {
          candidate.traverse((object) => {
            object.geometry?.dispose();
            if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
            else object.material?.dispose();
          });
          throw new Error("No editable mesh surfaces were found in this model.");
        }

        disposeCustomModel();
        customModelParts = nextParts;
        nextOriginalMaterials.forEach((materials, uuid) => customModelOriginalMaterials.set(uuid, materials));
        customModel = candidate;
        customModelName = file.name;
        scene.add(customModel);
        architecture.visible = false;
        houseControls.slice(0, 7).forEach((control) => { control.disabled = true; });
        const partOptions = [new Option("Entire model", "all")];
        nextParts.forEach((objects, key) => {
          const label = objects[0].userData.safaPartLabel;
          const duplicates = [...nextParts.values()].flat().filter((object) => object.userData.safaPartLabel === label).length;
          partOptions.push(new Option(duplicates > 1 ? `${label} · ${key.slice(5)}` : label, key));
        });
        customModelPartControl.replaceChildren(...partOptions);
        customModelColorControl.value = "#e8e0d2";
        customModelFinishControl.value = "smooth";
        customModelDefaultColor = customModelColorControl.value;
        customModelDefaultFinish = customModelFinishControl.value;
        customModelControls.hidden = false;
        customModelButtons.forEach((control) => { control.disabled = false; });
        document.querySelector(".studio-control-grid").hidden = true;
        radius = 18;
        theta = .76;
        phi = 1.12;
        placeCamera();
        renderHouse();
        customModelStatus.textContent = `${file.name} loaded locally. ${meshIndex} editable mesh${meshIndex === 1 ? "" : "es"} found. Select a part and apply a visual design.`;
        viewerStatus.textContent = "";
        viewerHint.hidden = false;
        customModelInput.disabled = false;
      } catch (error) {
        customModelInput.disabled = false;
        customModelInput.value = "";
        setCustomModelStatus(`Could not load this model: ${error.message}`);
      }
    };
    const wallMaterial = new THREE.MeshStandardMaterial({ color: document.querySelector("#house-color").value, roughness: .78 });
    const initialGlazing = {
      clear: { color: "#73797d", roughness: .2 },
      bronze: { color: "#929292", roughness: .28 },
      smoky: { color: "#555b60", roughness: .24 },
    }[houseGlazingControl.value];
    const glassMaterial = new THREE.MeshStandardMaterial({ ...initialGlazing, metalness: .18 });
    const darkMaterial = new THREE.MeshStandardMaterial({ color: "#292929", roughness: .72 });
    const initialRoof = {
      charcoal: { color: "#34383b", roughness: .46, metalness: .38 },
      slate: { color: "#59636d", roughness: .78, metalness: .08 },
      terracotta: { color: "#a9583b", roughness: .86, metalness: .02 },
    }[houseRoofControl.value];
    const roofMaterial = new THREE.MeshStandardMaterial(initialRoof);
    const slabMaterial = new THREE.MeshStandardMaterial({ color: "#a88b58", roughness: .82 });
    const makeBox = (parent, width, height, depth, x, y, z, material, castShadow = true) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
      mesh.position.set(x, y, z);
      mesh.castShadow = castShadow;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };
    makeBox(architecture, 9, .22, 7, 0, -.03, 0, slabMaterial);
    const lawnMaterial = new THREE.MeshStandardMaterial({ color: "#202b38", roughness: 1 });
    makeBox(architecture, 14, .12, 12, 0, -.15, 0, lawnMaterial, false);

    const buildHouse = () => {
      while (architecture.children.length > 2) {
        const child = architecture.children[2];
        architecture.remove(child);
        child.geometry.dispose();
      }
      const style = document.querySelector("#house-style").value;
      const floors = Number(document.querySelector("#house-floors").value);
      const floorHeight = 2.45;
      const totalHeight = floors * floorHeight;
      const bodyWidth = style === "villa" ? 7.1 : style === "traditional" ? 6.5 : 6.7;
      makeBox(architecture, bodyWidth, totalHeight, 4.8, 0, totalHeight / 2 + .09, 0, wallMaterial);
      if (style === "traditional") {
        const pitch = .48;
        const roofSpan = 4.15;
        makeBox(architecture, roofSpan, .2, 5.35, -1.05, totalHeight + .99, 0, roofMaterial).rotation.z = pitch;
        makeBox(architecture, roofSpan, .2, 5.35, 1.05, totalHeight + .99, 0, roofMaterial).rotation.z = -pitch;
        makeBox(architecture, .12, .16, 5.48, 0, totalHeight + 1.91, 0, roofMaterial);
      } else {
        makeBox(architecture, bodyWidth + .4, .18, 5.2, 0, totalHeight + .18, 0, roofMaterial);
      }
      if (style === "villa") {
        makeBox(architecture, 2.35, 2.05, 3.35, -4.12, 1.12, -.38, wallMaterial);
        makeBox(architecture, 2.58, .16, 3.6, -4.12, 2.2, -.38, roofMaterial);
        makeBox(architecture, 2.05, 1.55, .1, -4.12, 1.05, 1.32, glassMaterial);
        makeBox(architecture, .06, 1.55, .14, -4.12, 1.05, 1.39, slabMaterial, false);
      }
      makeBox(architecture, 3.1, .12, 2.2, -.5, totalHeight + .34, -.1, slabMaterial);
      makeBox(architecture, 2.9, .1, 2, -.5, totalHeight + .47, -.1, roofMaterial);
      makeBox(architecture, 1.25, 2.05, .12, -1.82, 1.13, 2.46, darkMaterial);
      makeBox(architecture, 1.05, 1.88, .1, -1.82, 1.1, 2.54, wallMaterial);
      const windowYs = floors === 1 ? [1.5] : [1.35, 3.8];
      windowYs.forEach((y) => {
        makeBox(architecture, 1.48, 1.55, .1, .25, y, 2.46, darkMaterial);
        makeBox(architecture, 1.34, 1.4, .08, .25, y, 2.53, glassMaterial);
        makeBox(architecture, 1.35, .06, .12, .25, y, 2.58, slabMaterial, false);
        makeBox(architecture, .05, 1.4, .12, .25, y, 2.58, slabMaterial, false);
      });
      makeBox(architecture, 2.3, .17, 1.8, 1.85, .2, 3.05, slabMaterial);
      makeBox(architecture, .16, 2.6, .16, .9, 1.48, 3.7, slabMaterial);
      makeBox(architecture, .16, 2.6, .16, 2.8, 1.48, 3.7, slabMaterial);
      if (floors === 2) {
        makeBox(architecture, 2.6, 1.15, .1, 1.92, 3.35, 2.46, darkMaterial);
        makeBox(architecture, 2.42, .98, .08, 1.92, 3.35, 2.53, glassMaterial);
        makeBox(architecture, 3.3, .14, 2.5, 1.5, 4.12, 0, style === "traditional" ? roofMaterial : slabMaterial);
      }
      if (style === "modern") {
        makeBox(architecture, 2.45, .12, .12, 1.35, 2.45, 2.84, roofMaterial);
        makeBox(architecture, .12, 2.5, .12, .2, 1.3, 2.84, roofMaterial);
      } else if (style === "traditional") {
        makeBox(architecture, 2.05, .1, .14, -1.82, 2.05, 2.62, roofMaterial);
      }
      makeBox(architecture, .16, 1.6, .16, -3.5, .72, -1.4, lawnMaterial, false);
      makeBox(architecture, .16, 1.9, .16, 3.5, .87, -1.4, lawnMaterial, false);
    };
    const renderHouse = () => renderer.render(scene, camera);
    buildHouse();

    const colorControl = document.querySelector("#house-color");
    const finishControl = document.querySelector("#house-finish");
    const styleControl = document.querySelector("#house-style");
    const roofControl = document.querySelector("#house-roof");
    const glazingControl = document.querySelector("#house-glazing");
    const floorsControl = document.querySelector("#house-floors");
    const lightControl = document.querySelector("#house-light");
    const summary = document.querySelector("#design-summary");
    housePhotoInput.disabled = false;
    housePhotoInput.addEventListener("change", async () => {
      const file = housePhotoInput.files?.[0];
      if (!file) return;
      const loadId = ++housePhotoLoadId;
      if ((file.type && !file.type.startsWith("image/")) || file.size > 25 * 1024 * 1024) {
        housePhotoInput.value = "";
        housePhotoStatus.textContent = "Choose an image file supported by this browser, no larger than 25 MB.";
        return;
      }

      const nextPhotoUrl = URL.createObjectURL(file);
      housePhotoPreview.src = nextPhotoUrl;
      housePhotoStatus.textContent = `Loading ${file.name} locally for the 3D photo view…`;
      try {
        await housePhotoPreview.decode();
        if (loadId !== housePhotoLoadId) {
          URL.revokeObjectURL(nextPhotoUrl);
          return;
        }
        const maxTextureSize = 2048;
        const scale = Math.min(1, maxTextureSize / Math.max(housePhotoPreview.naturalWidth, housePhotoPreview.naturalHeight));
        const textureCanvas = document.createElement("canvas");
        textureCanvas.width = Math.max(1, Math.round(housePhotoPreview.naturalWidth * scale));
        textureCanvas.height = Math.max(1, Math.round(housePhotoPreview.naturalHeight * scale));
        const textureContext = textureCanvas.getContext("2d");
        if (!textureContext) throw new Error("The browser could not prepare the image for 3D.");
        textureContext.drawImage(housePhotoPreview, 0, 0, textureCanvas.width, textureCanvas.height);
        const texture = new THREE.CanvasTexture(textureCanvas);
        texture.encoding = THREE.sRGBEncoding;
        const aspect = textureCanvas.width / textureCanvas.height;
        const width = Math.min(10, 7.2 * aspect);
        const height = width / aspect;
        const backingMaterial = new THREE.MeshStandardMaterial({ color: "#172438", metalness: .48, roughness: .34 });
        const photoMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, toneMapped: false });
        const backing = new THREE.Mesh(new THREE.BoxGeometry(width + .24, height + .24, .18), backingMaterial);
        backing.position.z = -.13;
        backing.castShadow = true;
        backing.receiveShadow = true;
        const photoSurface = new THREE.Mesh(new THREE.PlaneGeometry(width, height), photoMaterial);
        photoSurface.position.z = -.025;
        housePhotoModel.traverse((object) => {
          object.geometry?.dispose();
          if (Array.isArray(object.material)) object.material.forEach((material) => {
            material.map?.dispose();
            material.dispose();
          });
          else {
            object.material?.map?.dispose();
            object.material?.dispose();
          }
        });
        housePhotoModel.clear();
        housePhotoModel.add(backing, photoSurface);
        const frameMaterial = new THREE.MeshStandardMaterial({ color: "#d6b875", metalness: .7, roughness: .3 });
        const frameDepth = .12;
        const frameEdges = [
          [width + .28, .08, frameDepth, 0, height / 2 + .04],
          [width + .28, .08, frameDepth, 0, -height / 2 - .04],
          [.08, height, frameDepth, -width / 2 - .04, 0],
          [.08, height, frameDepth, width / 2 + .04, 0],
        ];
        frameEdges.forEach(([edgeWidth, edgeHeight, edgeDepth, x, y]) => {
          const edge = new THREE.Mesh(new THREE.BoxGeometry(edgeWidth, edgeHeight, edgeDepth), frameMaterial);
          edge.position.set(x, y, .015);
          edge.castShadow = true;
          housePhotoModel.add(edge);
        });
        housePhotoModel.position.set(0, 3.3, 0);
        housePhotoModel.rotation.set(0, 0, 0);
        if (customModel) {
          disposeCustomModel();
          customModelInput.value = "";
        }
        architecture.visible = false;
        housePhotoModel.visible = true;
        document.querySelector(".studio-control-grid").hidden = true;
        customModelInput.disabled = true;
        radius = 18;
        theta = .76;
        phi = 1.12;
        target.set(0, 3.3, 0);
        placeCamera();
        if (housePhotoUrl) URL.revokeObjectURL(housePhotoUrl);
        housePhotoUrl = nextPhotoUrl;
        housePhotoPicker.hidden = false;
        clearHousePhotoButton.hidden = false;
        viewerHint.hidden = false;
        viewerStatus.textContent = "";
        renderHouse();
        housePhotoStatus.textContent = `${file.name} is displayed in the rotatable 3D photo viewer. Drag the viewer to rotate; click the image below to sample a colour. Photo stays on this device.`;
      } catch (error) {
        URL.revokeObjectURL(nextPhotoUrl);
        if (loadId !== housePhotoLoadId) return;
        housePhotoInput.value = "";
        housePhotoPreview.src = housePhotoUrl;
        housePhotoPicker.hidden = !housePhotoUrl;
        housePhotoStatus.textContent = `Could not read this photo: ${error.message}`;
      }
    });
    clearHousePhotoButton.addEventListener("click", clearHousePhoto);
    housePhotoPicker.addEventListener("click", (event) => {
      if (!housePhotoPreview.naturalWidth || !housePhotoPreview.naturalHeight) return;
      const bounds = housePhotoPreview.getBoundingClientRect();
      const imageScale = Math.min(
        bounds.width / housePhotoPreview.naturalWidth,
        bounds.height / housePhotoPreview.naturalHeight,
      );
      const imageWidth = housePhotoPreview.naturalWidth * imageScale;
      const imageHeight = housePhotoPreview.naturalHeight * imageScale;
      const imageLeft = bounds.left + (bounds.width - imageWidth) / 2;
      const imageTop = bounds.top + (bounds.height - imageHeight) / 2;
      const x = event.detail === 0
        ? Math.floor(housePhotoPreview.naturalWidth / 2)
        : Math.min(housePhotoPreview.naturalWidth - 1, Math.max(0, Math.floor((event.clientX - imageLeft) / imageScale)));
      const y = event.detail === 0
        ? Math.floor(housePhotoPreview.naturalHeight / 2)
        : Math.min(housePhotoPreview.naturalHeight - 1, Math.max(0, Math.floor((event.clientY - imageTop) / imageScale)));
      const sampleCanvas = document.createElement("canvas");
      sampleCanvas.width = 1;
      sampleCanvas.height = 1;
      const context = sampleCanvas.getContext("2d", { willReadFrequently: true });
      if (!context) {
        housePhotoStatus.textContent = "Could not sample this photo in the current browser.";
        return;
      }
      try {
        context.drawImage(housePhotoPreview, x, y, 1, 1, 0, 0, 1, 1);
        const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
        const sampledColor = `#${[red, green, blue].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
        let colorOption = [...colorControl.options].find((option) => option.value === sampledColor);
        if (!colorOption) {
          colorOption = new Option(`Photo sample ${sampledColor.toUpperCase()}`, sampledColor);
          colorControl.add(colorOption);
        }
        colorControl.value = sampledColor;
        colorControl.dispatchEvent(new Event("change", { bubbles: true }));
        housePhotoStatus.textContent = `Sampled ${sampledColor.toUpperCase()} from the selected photo and applied it to the 3D concept. Choose other points or materials to refine the preview.`;
      } catch (error) {
        housePhotoStatus.textContent = `Could not sample this photo: ${error.message}`;
      }
    });
    const updateSummary = () => {
      summary.textContent = `${styleControl.selectedOptions[0].text} · ${floorsControl.value === "1" ? "Single-storey" : "Two-storey"} · ${colorControl.selectedOptions[0].text} · ${finishControl.selectedOptions[0].text} · ${roofControl.selectedOptions[0].text} roof · ${glazingControl.selectedOptions[0].text} glazing · ${lightControl.value === "day" ? "Daylight" : "Evening"}`;
    };
    customModelInput.disabled = false;
    customModelInput.addEventListener("change", () => loadCustomModel(customModelInput.files?.[0]));
    document.querySelector("#apply-model-design").addEventListener("click", applyCustomModelDesign);
    document.querySelector("#restore-model-design").addEventListener("click", () => {
      resetCustomModelMaterials();
      customModelColorControl.value = customModelDefaultColor;
      customModelFinishControl.value = customModelDefaultFinish;
      renderHouse();
      setCustomModelStatus("Original model materials and textures restored. The model remains local to this browser.");
    });
    document.querySelector("#clear-custom-model").addEventListener("click", () => {
      disposeCustomModel();
      customModelInput.value = "";
      setCustomModelStatus("Your local model was removed. The built-in SAFA concept is visible again.");
      viewerStatus.textContent = "";
      buildHouse();
      updateSummary();
      renderHouse();
    });
    customModelPartControl.addEventListener("change", () => {
      setCustomModelStatus(`Selected ${customModelPartControl.selectedOptions[0].textContent}. Choose a colour and finish, then apply them to the 3D model.`);
    });
    document.querySelector("#reset-house").addEventListener("click", () => {
      if (!customModel) return;
      resetCustomModelMaterials();
      customModelColorControl.value = customModelDefaultColor;
      customModelFinishControl.value = customModelDefaultFinish;
      radius = 18;
      theta = .76;
      phi = 1.12;
      placeCamera();
      renderHouse();
      setCustomModelStatus("3D view reset and original model appearance restored.");
    });
    styleControl.addEventListener("change", () => {
      buildHouse();
      updateSummary();
      renderHouse();
    });
    colorControl.addEventListener("change", () => {
      wallMaterial.color.set(colorControl.value);
      updateSummary();
      renderHouse();
    });
    finishControl.addEventListener("change", () => {
      wallMaterial.roughness = {
        smooth: .68,
        limestone: .96,
        textured: .88,
      }[finishControl.value];
      updateSummary();
      renderHouse();
    });
    roofControl.addEventListener("change", () => {
      const roof = {
        charcoal: { color: "#34383b", roughness: .46, metalness: .38 },
        slate: { color: "#59636d", roughness: .78, metalness: .08 },
        terracotta: { color: "#a9583b", roughness: .86, metalness: .02 },
      }[roofControl.value];
      roofMaterial.color.set(roof.color);
      roofMaterial.roughness = roof.roughness;
      roofMaterial.metalness = roof.metalness;
      updateSummary();
      renderHouse();
    });
    glazingControl.addEventListener("change", () => {
      const glazing = {
        clear: { color: "#73797d", roughness: .2 },
        bronze: { color: "#929292", roughness: .28 },
        smoky: { color: "#555b60", roughness: .24 },
      }[glazingControl.value];
      glassMaterial.color.set(glazing.color);
      glassMaterial.roughness = glazing.roughness;
      updateSummary();
      renderHouse();
    });
    floorsControl.addEventListener("change", () => {
      buildHouse();
      updateSummary();
      renderHouse();
    });
    lightControl.addEventListener("change", () => {
      const evening = lightControl.value === "evening";
      scene.background.set(evening ? "#050d19" : "#0b1e37");
      ambient.intensity = evening ? .35 : .65;
      keyLight.intensity = evening ? 1.25 : 1.1;
      warmAccent.intensity = evening ? 10 : 4.5;
      keyLight.color.set(evening ? "#ffd99a" : "#ffedcf");
      updateSummary();
      renderHouse();
    });
    document.querySelector("#reset-house").addEventListener("click", () => {
      if (housePhotoModel.visible) {
        housePhotoModel.rotation.set(0, 0, 0);
        radius = 18;
        theta = .76;
        phi = 1.12;
        target.set(0, 3.3, 0);
        placeCamera();
        renderHouse();
        return;
      }
      radius = 22;
      theta = .76;
      phi = 1.12;
      styleControl.value = "modern";
      colorControl.value = "#e8e0d2";
      finishControl.value = "smooth";
      roofControl.value = "charcoal";
      glazingControl.value = "clear";
      floorsControl.value = "2";
      lightControl.value = "day";
      wallMaterial.color.set(colorControl.value);
      wallMaterial.roughness = .68;
      glassMaterial.color.set("#73797d");
      glassMaterial.roughness = .2;
      slabMaterial.color.set("#a88b58");
      roofMaterial.color.set("#34383b");
      roofMaterial.roughness = .46;
      roofMaterial.metalness = .38;
      scene.background.set("#0b1e37");
      ambient.intensity = .65;
      keyLight.intensity = 1.1;
      warmAccent.intensity = 4.5;
      keyLight.color.set("#ffedcf");
      buildHouse();
      placeCamera();
      updateSummary();
      renderHouse();
    });
    document.querySelector("#save-house").addEventListener("click", () => {
      const customSummary = customModel
        ? `Uploaded model: ${customModelName}\nSelected part: ${customModelPartControl.selectedOptions[0].textContent}\nDesign colour: ${customModelColorControl.selectedOptions[0].textContent}\nSurface finish: ${customModelFinishControl.selectedOptions[0].textContent}`
        : summary.textContent;
      const brief = [
        "SAFA CONSTRUCTION — Illustrative design concept",
        customSummary,
        "This is a preliminary massing concept, not an architectural drawing or construction specification.",
      ].join("\n");
      const url = URL.createObjectURL(new Blob([brief], { type: "text/plain;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "safa-design-concept.txt";
      link.click();
      URL.revokeObjectURL(url);
    });
    houseControls.forEach((control) => { control.disabled = false; });
    updateSummary();

    let dragging = false;
    let previousX = 0;
    let previousY = 0;
    canvas.addEventListener("pointerdown", (event) => {
      dragging = true;
      previousX = event.clientX;
      previousY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      theta -= (event.clientX - previousX) * .008;
      phi = Math.max(.25, Math.min(1.45, phi + (event.clientY - previousY) * .006));
      previousX = event.clientX;
      previousY = event.clientY;
      placeCamera();
      renderHouse();
    });
    const endDrag = () => { dragging = false; };
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);
    canvas.addEventListener("wheel", (event) => {
      event.preventDefault();
      radius = Math.max(8, Math.min(28, radius + event.deltaY * .012));
      placeCamera();
      renderHouse();
    }, { passive: false });
    const resizeObserver = new ResizeObserver(() => {
      const width = houseViewer.clientWidth;
      const height = houseViewer.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderHouse();
    });
    resizeObserver.observe(houseViewer);
    renderHouse();
    houseViewer.classList.add("is-ready");
    viewerHint.hidden = false;
    viewerStatus.textContent = "";
  } catch (error) {
    viewerStatus.textContent = "Interactive 3D is unavailable here. Showing a static design reference instead.";
    console.error("SAFA 3D concept viewer failed to initialize:", error);
  }
};

if ("IntersectionObserver" in window) {
  const viewerLoader = new IntersectionObserver(([entry], observer) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    startHouseViewer();
  }, { rootMargin: "180px 0px" });
  viewerLoader.observe(houseViewer);
}

const arReadinessButton = document.querySelector("#ar-readiness-check");
const arReadinessStatus = document.querySelector("#ar-readiness");
arReadinessButton.addEventListener("click", async () => {
  arReadinessButton.disabled = true;
  arReadinessStatus.textContent = "Checking browser and device support…";
  try {
    if (!window.isSecureContext) {
      arReadinessStatus.textContent = "WebXR requires a secure HTTPS page (or localhost). No model asset is configured, so use the concept gallery fallback.";
      return;
    }

    const xr = navigator.xr;
    if (!xr || typeof xr.isSessionSupported !== "function") {
      arReadinessStatus.textContent = "This browser does not expose the WebXR support check. No model asset is configured; use the concept gallery fallback.";
      return;
    }

    const [arSupported, vrSupported] = await Promise.all([
      xr.isSessionSupported("immersive-ar"),
      xr.isSessionSupported("immersive-vr"),
    ]);
    const arResult = arSupported ? "AR supported" : "AR not reported";
    const vrResult = vrSupported ? "VR supported" : "VR not reported";
    arReadinessStatus.textContent = `${arResult}; ${vrResult}. This site has no approved GLB/GLTF house asset, so an immersive session cannot start. No camera was opened. Browse the illustrative concept gallery instead.`;
  } catch (error) {
    arReadinessStatus.textContent = "The browser could not confirm WebXR support. No immersive session or camera was started; use the concept gallery fallback.";
    console.warn("SAFA WebXR capability check failed.", error);
  } finally {
    arReadinessButton.disabled = false;
  }
});

document.querySelector("#year").textContent = new Date().getFullYear();

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
  mainNav.classList.toggle("open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});
mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    mainNav.classList.remove("open");
    document.body.classList.remove("menu-open");
  });
});

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    document.querySelectorAll(".filter-button").forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll(".project-card").forEach((card) => {
      const shouldHide = filter !== "all" && card.dataset.category !== filter;
      card.hidden = shouldHide;
      card.classList.toggle("filter-enter", !shouldHide);
    });
  });
});

const projectDialog = document.querySelector("#project-dialog");
const projectShowcase = document.querySelector("#project-showcase");
const projectShowcaseCanvas = document.querySelector("#project-showcase-canvas");
const projectShowcaseStatus = document.querySelector("#project-showcase-status");
const projectShowcaseImage = document.querySelector("#dialog-image");
const projectDialogKicker = document.querySelector("#dialog-kicker");
const projectEnquireLink = document.querySelector("#dialog-enquire");
const projectShowcaseCount = document.querySelector("#showcase-count");
const showcaseItems = [
  ...Array.from(document.querySelectorAll(".service-card"), (card) => ({
    element: card,
    title: card.querySelector("h3").textContent,
    description: card.querySelector(".service-text p").textContent,
    image: card.dataset.showcaseImage,
    type: "service",
  })),
  ...Array.from(document.querySelectorAll(".project-card"), (card) => ({
    element: card,
    title: card.dataset.title,
    description: card.dataset.description || card.querySelector(".project-description")?.textContent || "",
    image: card.dataset.image,
    type: "project",
  })),
];
let activeProjectShowcase = null;
let activeShowcaseIndex = 0;
let projectShowcaseRun = 0;

const setShowcaseItem = (index) => {
  activeShowcaseIndex = (index + showcaseItems.length) % showcaseItems.length;
  const item = showcaseItems[activeShowcaseIndex];
  document.querySelector("#dialog-title").textContent = item.title;
  document.querySelector("#dialog-description").textContent = item.description;
  projectDialogKicker.textContent = item.type === "service" ? "SAFA SERVICE SHOWCASE" : "ILLUSTRATIVE DESIGN CONCEPT";
  projectEnquireLink.innerHTML = item.type === "service"
    ? 'Enquire about this service <span aria-hidden="true">↗</span>'
    : 'Enquire about a similar idea <span aria-hidden="true">↗</span>';
  projectShowcaseImage.src = item.image;
  projectShowcaseImage.alt = `${item.type === "service" ? "Illustrative service image" : "Illustrative project image"} for ${item.title}`;
  projectShowcaseCount.textContent = `${String(activeShowcaseIndex + 1).padStart(2, "0")} / ${String(showcaseItems.length).padStart(2, "0")}`;
  if (projectDialog.open) void startProjectShowcase();
};

const stepShowcase = (direction) => setShowcaseItem(activeShowcaseIndex + direction);

const stopProjectShowcase = () => {
  projectShowcaseRun += 1;
  const showcase = activeProjectShowcase;
  activeProjectShowcase = null;
  if (showcase) {
    window.cancelAnimationFrame(showcase.frame);
    showcase.resizeObserver.disconnect();
    projectShowcaseCanvas.removeEventListener("pointerdown", showcase.onPointerDown);
    projectShowcaseCanvas.removeEventListener("pointermove", showcase.onPointerMove);
    projectShowcaseCanvas.removeEventListener("pointerup", showcase.onPointerUp);
    projectShowcaseCanvas.removeEventListener("pointercancel", showcase.onPointerUp);
    projectShowcaseCanvas.removeEventListener("keydown", showcase.onKeyDown);
    showcase.scene.traverse((object) => {
      if (!object.isMesh && !object.isLineSegments && !object.isPoints) return;
      object.geometry?.dispose();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => material?.dispose());
    });
    showcase.photoTexture.dispose();
    showcase.renderer.dispose();
  }
  projectShowcase.classList.remove("is-ready");
  projectShowcaseCanvas.setAttribute("aria-hidden", "true");
  projectShowcaseImage.hidden = false;
  projectShowcaseStatus.hidden = true;
};

const startProjectShowcase = async () => {
  stopProjectShowcase();
  const runId = projectShowcaseRun;
  projectShowcaseStatus.textContent = "Loading 3D showcase…";
  projectShowcaseStatus.hidden = false;
  projectShowcase.classList.remove("is-ready");
  projectShowcaseCanvas.setAttribute("aria-hidden", "true");

  let renderer;
  try {
    const THREE = await loadThree();
    if (!projectDialog.open || runId !== projectShowcaseRun) return;
    const bounds = projectShowcase.getBoundingClientRect();
    if (!bounds.width || !bounds.height) throw new Error("The project showcase has no visible layout size.");

    renderer = new THREE.WebGLRenderer({
      canvas: projectShowcaseCanvas,
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(bounds.width, bounds.height);
    renderer.setClearColor("#08172d", 0);
    renderer.outputEncoding = THREE.sRGBEncoding;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, bounds.width / bounds.height, .1, 80);
    camera.position.set(0, .15, 10.2);
    camera.lookAt(0, 0, 0);
    scene.add(new THREE.HemisphereLight(0xe8eff8, 0x14243a, 1.2));
    const keyLight = new THREE.DirectionalLight(0xffe3ad, 2);
    keyLight.position.set(-3, 5, 7);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0xd6a34a, 22, 16);
    rimLight.position.set(3.8, 1.5, -2);
    scene.add(rimLight);
    const lowerLight = new THREE.PointLight(0x7289aa, 8, 12);
    lowerLight.position.set(-3, -2.8, 2);
    scene.add(lowerLight);

    const stage = new THREE.Group();
    scene.add(stage);
    const goldMaterial = new THREE.MeshStandardMaterial({ color: "#d6a34a", metalness: .86, roughness: .24 });
    const darkMaterial = new THREE.MeshStandardMaterial({ color: "#0b1e37", metalness: .42, roughness: .34 });
    const photoTexture = await new Promise((resolve, reject) => {
      new THREE.TextureLoader().load(projectShowcaseImage.src, resolve, undefined, reject);
    });
    if (!projectDialog.open || runId !== projectShowcaseRun) {
      photoTexture.dispose();
      renderer.dispose();
      return;
    }
    photoTexture.encoding = THREE.sRGBEncoding;
    photoTexture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    const imageAspect = photoTexture.image.width / photoTexture.image.height || 1.5;
    let photoWidth = Math.min(6.5, 4.5 * imageAspect);
    let photoHeight = photoWidth / imageAspect;
    if (photoHeight > 3.85) {
      photoHeight = 3.85;
      photoWidth = photoHeight * imageAspect;
    }
    const frameWidth = photoWidth + .2;
    const frameHeight = photoHeight + .2;
    const card = new THREE.Group();
    stage.add(card);
    const backplate = new THREE.Mesh(
      new THREE.BoxGeometry(frameWidth + .14, frameHeight + .14, .2),
      darkMaterial,
    );
    card.add(backplate);
    const photo = new THREE.Mesh(
      new THREE.PlaneGeometry(photoWidth, photoHeight),
      new THREE.MeshBasicMaterial({ map: photoTexture, side: THREE.DoubleSide }),
    );
    photo.position.z = .105;
    card.add(photo);
    [
      [frameWidth, .035, 0, photoHeight / 2 + .1],
      [frameWidth, .035, 0, -photoHeight / 2 - .1],
      [.035, photoHeight, -photoWidth / 2 - .1, 0],
      [.035, photoHeight, photoWidth / 2 + .1, 0],
    ].forEach(([width, height, x, y]) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(width, height, .06), goldMaterial);
      rail.position.set(x, y, .2);
      card.add(rail);
    });

    const halo = new THREE.Group();
    halo.position.set(0, 0, -.8);
    scene.add(halo);
    const haloGold = new THREE.MeshBasicMaterial({ color: "#d6a34a", transparent: true, opacity: .42 });
    const haloFine = new THREE.MeshBasicMaterial({ color: "#eaf0fa", transparent: true, opacity: .13 });
    const goldOrbit = new THREE.Mesh(new THREE.TorusGeometry(3.55, .012, 6, 120), haloGold);
    goldOrbit.scale.y = .63;
    goldOrbit.rotation.z = -.18;
    halo.add(goldOrbit);
    const ivoryOrbit = new THREE.Mesh(new THREE.TorusGeometry(3.18, .007, 5, 120), haloFine);
    ivoryOrbit.scale.y = .66;
    ivoryOrbit.rotation.z = .24;
    halo.add(ivoryOrbit);
    const verticalOrbit = new THREE.Mesh(new THREE.TorusGeometry(3.3, .009, 5, 120), haloGold);
    verticalOrbit.rotation.x = .34;
    verticalOrbit.rotation.y = .53;
    verticalOrbit.scale.y = .78;
    halo.add(verticalOrbit);

    const dustPositions = new Float32Array(150);
    for (let index = 0; index < dustPositions.length; index += 3) {
      dustPositions[index] = (Math.random() - .5) * 10;
      dustPositions[index + 1] = (Math.random() - .5) * 6;
      dustPositions[index + 2] = -2 - Math.random() * 3;
    }
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute("position", new THREE.Float32BufferAttribute(dustPositions, 3));
    const dust = new THREE.Points(
      dustGeometry,
      new THREE.PointsMaterial({ color: "#e5c783", size: .018, transparent: true, opacity: .6, sizeAttenuation: true }),
    );
    scene.add(dust);

    const stageState = {
      renderer,
      scene,
      photoTexture,
      halo,
      dust,
      resizeObserver: new ResizeObserver(() => {
        const size = projectShowcase.getBoundingClientRect();
        if (!size.width || !size.height) return;
        renderer.setSize(size.width, size.height);
        camera.aspect = size.width / size.height;
        camera.updateProjectionMatrix();
      }),
      frame: 0,
      dragging: false,
      previousX: 0,
      previousY: 0,
      rotationX: 0,
      rotationY: 0,
      startTime: 0,
    };
    stageState.onPointerDown = (event) => {
      stageState.dragging = true;
      stageState.previousX = event.clientX;
      stageState.previousY = event.clientY;
      projectShowcaseCanvas.setPointerCapture(event.pointerId);
    };
    stageState.onPointerMove = (event) => {
      if (!stageState.dragging) return;
      stageState.rotationY += (event.clientX - stageState.previousX) * .008;
      stageState.rotationX = Math.max(-.2, Math.min(.2, stageState.rotationX + (event.clientY - stageState.previousY) * .004));
      stageState.previousX = event.clientX;
      stageState.previousY = event.clientY;
    };
    stageState.onPointerUp = () => { stageState.dragging = false; };
    stageState.onKeyDown = (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        stepShowcase(event.key === "ArrowLeft" ? -1 : 1);
        return;
      }
      const directions = { ArrowUp: -.08, ArrowDown: .08 };
      const direction = directions[event.key];
      if (direction === undefined) return;
      event.preventDefault();
      stageState.rotationX = Math.max(-.2, Math.min(.2, stageState.rotationX + direction));
    };
    projectShowcaseCanvas.addEventListener("pointerdown", stageState.onPointerDown);
    projectShowcaseCanvas.addEventListener("pointermove", stageState.onPointerMove);
    projectShowcaseCanvas.addEventListener("pointerup", stageState.onPointerUp);
    projectShowcaseCanvas.addEventListener("pointercancel", stageState.onPointerUp);
    projectShowcaseCanvas.addEventListener("keydown", stageState.onKeyDown);
    stageState.resizeObserver.observe(projectShowcase);
    activeProjectShowcase = stageState;
    projectShowcase.classList.add("is-ready");
    projectShowcaseCanvas.setAttribute("aria-hidden", "false");
    projectShowcaseCanvas.setAttribute("aria-label", `Interactive 3D showcase for ${document.querySelector("#dialog-title").textContent}`);
    projectShowcaseStatus.hidden = true;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const render = (time) => {
      if (activeProjectShowcase !== stageState || !projectDialog.open) return;
      if (!stageState.startTime) stageState.startTime = time;
      const entrance = Math.min((time - stageState.startTime) / 850, 1);
      const easedEntrance = 1 - Math.pow(1 - entrance, 3);
      card.scale.setScalar(prefersReducedMotion.matches ? 1 : .9 + easedEntrance * .1);
      if (!stageState.dragging && !prefersReducedMotion.matches) {
        stageState.rotationY += .0007;
      }
      card.rotation.y = stageState.rotationY;
      card.rotation.x = stageState.rotationX;
      if (!prefersReducedMotion.matches) {
        halo.rotation.z = Math.sin(time * .00012) * .035;
        halo.rotation.y = Math.sin(time * .00016) * .08;
        dust.position.y = Math.sin(time * .0002) * .08;
      }
      renderer.render(scene, camera);
      stageState.frame = window.requestAnimationFrame(render);
    };
    stageState.frame = window.requestAnimationFrame(render);
  } catch (error) {
    renderer?.dispose();
    if (runId !== projectShowcaseRun) return;
    projectShowcase.classList.remove("is-ready");
    projectShowcaseCanvas.setAttribute("aria-hidden", "true");
    projectShowcaseImage.hidden = false;
    projectShowcaseStatus.textContent = "3D preview unavailable here. The image is shown instead.";
    projectShowcaseStatus.hidden = false;
    console.error("SAFA 3D showcase could not initialize; showing the image fallback.", error);
  }
};

const openShowcase = (item) => {
  setShowcaseItem(showcaseItems.indexOf(item));
  projectDialog.showModal();
  void startProjectShowcase();
};

showcaseItems.filter((item) => item.type === "project").forEach((item) => {
  item.element.addEventListener("click", () => openShowcase(item));
});
showcaseItems.filter((item) => item.type === "service").forEach((item) => {
  const button = item.element.querySelector(".service-showcase-button");
  const image = item.element.querySelector(".service-photo");
  button.addEventListener("click", () => {
    openShowcase(item);
  });
  image.addEventListener("click", () => openShowcase(item));
  image.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openShowcase(item);
  });
});
document.querySelector("#showcase-previous").addEventListener("click", () => stepShowcase(-1));
document.querySelector("#showcase-next").addEventListener("click", () => stepShowcase(1));

if (window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.querySelectorAll(".service-card, .project-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      const rotationX = (0.5 - y) * 7;
      const rotationY = (x - 0.5) * 9;
      const angle = Math.hypot(rotationX, rotationY);
      if (!angle) return;
      card.style.setProperty("--tilt-axis-x", (rotationX / angle).toFixed(3));
      card.style.setProperty("--tilt-axis-y", (rotationY / angle).toFixed(3));
      card.style.setProperty("--tilt-angle", `${angle.toFixed(2)}deg`);
      card.style.setProperty("--glow-x", `${(x * 100).toFixed(1)}%`);
      card.style.setProperty("--glow-y", `${(y * 100).toFixed(1)}%`);
    }, { passive: true });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-angle", "0deg");
    });
  });
}
document.querySelector(".dialog-close").addEventListener("click", () => projectDialog.close());
projectDialog.addEventListener("close", stopProjectShowcase);
projectDialog.addEventListener("click", (event) => {
  if (event.target === projectDialog) projectDialog.close();
});
document.querySelector("#dialog-enquire").addEventListener("click", () => projectDialog.close());

const safaAboutDialog = document.querySelector("#safa-about-dialog");
document.querySelector("#hero-logo-button").addEventListener("click", () => {
  safaAboutDialog.showModal();
});
document.querySelector(".safa-about-close").addEventListener("click", () => safaAboutDialog.close());
safaAboutDialog.addEventListener("click", (event) => {
  if (event.target === safaAboutDialog) safaAboutDialog.close();
});
safaAboutDialog.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const target = document.querySelector(link.getAttribute("href"));
    safaAboutDialog.close();
    target?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    if (target?.id) history.replaceState(null, "", `#${target.id}`);
  });
});

const innovationDialog = document.querySelector("#innovation-dialog");
const innovationDialogTitle = document.querySelector("#innovation-dialog-title");
const innovationDialogKicker = document.querySelector("#innovation-dialog-kicker");
const innovationDialogCopy = document.querySelector("#innovation-dialog-copy");
const innovationDialogLink = document.querySelector("#innovation-dialog-link");
const innovationDialogVisual = document.querySelector("#innovation-dialog-visual");
const innovationTool = document.querySelector("#innovation-tool");
let sketchPreviewUrl = "";
const innovationPreviews = {
  floorplan: {
    title: "AI Floor Plan Generator",
    status: "BROWSER BRIEF · CONCEPT ONLY",
    copy: "Preview a home-planning brief for plot size, floors, rooms, and preferences. The current page builds a conceptual layout in your browser; it does not provide an architect-approved or structurally validated plan.",
    link: "tools/floor-plan-generator.html",
    linkText: "Open the floor plan tool",
  },
  materials: {
    title: "Smart Material Selector",
    status: "INTERACTIVE EXTERIOR CONCEPT",
    copy: "See how wall colours, roof finishes, glazing, and lighting can change the exterior house concept. These are illustrative visual samples, not a supplier catalogue or construction specification.",
    link: "tools/material-selector.html",
    linkText: "Open the material selector",
  },
  voice: {
    title: "SAFA AI Text Assistant",
    status: "MULTILINGUAL TEXT CHAT",
    copy: "Preview the multilingual text assistant for asking about SAFA services, home planning, and preliminary budgets. Type a question and get a readable response.",
    link: "tools/voice-assistant.html",
    linkText: "Open SAFA AI",
  },
  projects: {
    title: "Cinematic Project Explorer",
    status: "ILLUSTRATIVE PROJECT GALLERY",
    copy: "Explore the site's visual service and design gallery with an interactive showcase. Images represent concepts and are not a verified portfolio of completed customer projects.",
    link: "tools/project-explorer.html",
    linkText: "Open the project explorer",
  },
  city: {
    title: "Smart City Explorer",
    status: "LOCATION DATA NOT CONNECTED",
    copy: "A verified city explorer would need current maps, local planning rules, and approved site information. This demo does not look up or infer any city-specific regulations. Use the planning brief to record a location for discussion with a qualified local professional.",
    link: "#planning-assistant",
    linkText: "Open planning brief",
    tool: '<label for="innovation-city">Choose a location to add to your planning brief</label><select id="innovation-city"><option>Choose a city</option><option>Madurai</option><option>Chennai</option><option>Coimbatore</option><option>Trichy</option><option>Other / not listed</option></select><p id="innovation-city-note" role="status">No map, live city data, or local approval rules are queried.</p>',
  },
  sketch: {
    title: "Sketch-to-House AI",
    status: "LOCAL PREVIEW · NO AI CONVERSION",
    copy: "Select a sketch to preview it in this browser only. The image is not uploaded or sent anywhere, and this site does not currently convert sketches into AI-generated house designs or 3D models.",
    link: "#planning-assistant",
    linkText: "Continue with a planning brief",
    tool: '<label for="innovation-sketch-file">Choose a sketch image (PNG, JPEG, or WebP; up to 10 MB)</label><input id="innovation-sketch-file" type="file" accept="image/png,image/jpeg,image/webp" /><img id="innovation-sketch-image" alt="Local sketch preview" hidden /><p id="innovation-sketch-status" role="status">Your selected image stays in this browser tab.</p>',
  },
  cutaway: {
    title: "3D House Cutaway Mode",
    status: "INTERIOR 3D MODEL REQUIRED",
    copy: "The current 3D designer is an exterior massing concept; it contains no furnished rooms, structural details, or cutaway model. An approved interior GLB/GLTF asset and suitable performance testing are needed before a true cutaway can be shown.",
    link: "#house-studio",
    linkText: "Explore the exterior 3D designer",
    tool: '<p>Current preview: interactive exterior massing with style, colour, roof, glazing, and lighting controls.</p>',
  },
  prices: {
    title: "Material Price Comparison",
    status: "SAMPLE RATES · NO LIVE SUPPLIER DATA",
    copy: "The cost estimator uses broad illustrative construction rates, not a comparison of real products. Supplier quotations, availability, delivery, taxes, and local labour prices are not connected. Treat any estimate as preliminary.",
    link: "#estimate",
    linkText: "Open sample cost estimator",
    tool: '<p>Use the existing calculator for a broad budget range, or ask SAFA for a project-specific discussion. No supplier or product prices are returned by this demo.</p>',
  },
  moodboard: {
    title: "AI Design Moodboard",
    status: "BROWSER PALETTE PREVIEW · NO AI IMAGES",
    copy: "Try a simple colour direction locally. This preview changes only the palette; it does not generate images, save your choices, or send data to an AI design provider.",
    link: "#house-studio",
    linkText: "Apply choices in the 3D designer",
    tool: '<label for="innovation-palette">Choose a mood</label><select id="innovation-palette"><option value="coastal">Coastal ivory</option><option value="earth">Earth & timber</option><option value="modern">Modern charcoal</option></select><div class="moodboard-preview" id="innovation-moodboard" aria-label="Local colour moodboard preview"><span></span><span></span><span></span></div><p id="innovation-palette-note" role="status">Coastal ivory · soft ivory, deep navy, and warm gold.</p>',
  },
  proposal: {
    title: "Instant Project Proposal Generator",
    status: "DOWNLOADABLE STARTER DRAFT · NOT A QUOTE",
    copy: "Create a short discussion draft on this device. It is not an official SAFA proposal, a scope of work, a confirmed price, or a construction commitment.",
    link: "#contact",
    linkText: "Continue to project enquiry",
    tool: '<form id="innovation-proposal-form"><label for="innovation-project-type">Project type</label><select id="innovation-project-type"><option>New home</option><option>Villa or duplex</option><option>Renovation</option><option>Planning or interiors</option></select><label for="innovation-project-location">Project location</label><input id="innovation-project-location" type="text" maxlength="100" placeholder="City or area" /><label for="innovation-project-goal">What would you like to discuss?</label><textarea id="innovation-project-goal" rows="3" maxlength="500" placeholder="Your priorities, approximate area, or questions"></textarea><button class="button button-gold" type="submit">Download starter draft ↓</button><p class="proposal-feedback" id="innovation-proposal-feedback" role="status" aria-live="polite"></p></form>',
  },
  twin: {
    title: "Digital Twin Project Viewer",
    status: "CONCEPT · NO CUSTOMER DATA CONNECTED",
    copy: "Preview a project-status experience intended to bring milestones and site updates together. There are no customer records, live project feeds, or private account access connected to this concept.",
    link: "tools/digital-twin-viewer.html",
    linkText: "View digital twin setup",
  },
  journey: {
    title: "Interactive 3D Website Journey",
    status: "CINEMATIC SITE EXPERIENCE",
    copy: "Preview the guided SAFA website journey and its cinematic introduction. The journey uses the existing website experience and does not represent a separate construction-site simulation.",
    link: "tools/website-journey.html",
    linkText: "Open the website journey",
  },
  admin: {
    title: "Administration Dashboard",
    status: "SECURE ADMIN SYSTEM NOT CONFIGURED",
    copy: "Preview the administration dashboard concept. This site does not currently provide admin login, customer records, project management, or a private dashboard backend.",
    link: "tools/admin-dashboard.html",
    linkText: "View secure setup requirements",
  },
};

const innovationModels = {
  floorplan: '<div class="feature-model" data-model="floorplan"><div class="model-toolbar"><label>Floors<select data-model-field="floors"><option value="1">1 floor</option><option value="2" selected>2 floors</option><option value="3">3 floors</option></select></label><label>Bedrooms<input data-model-field="bedrooms" type="range" min="1" max="5" value="3"></label></div><svg class="model-floorplan" data-floors="2" data-bedrooms="3" viewBox="0 0 420 220" role="img" aria-label="Illustrative adjustable room layout"><rect class="plan-outline" x="18" y="18" width="384" height="184" rx="5"/><g class="plan-rooms"><rect x="30" y="30" width="145" height="75" rx="3"/><rect x="185" y="30" width="92" height="75" rx="3"/><rect x="287" y="30" width="103" height="75" rx="3"/><rect x="30" y="115" width="105" height="75" rx="3"/><rect x="145" y="115" width="120" height="75" rx="3"/><rect x="275" y="115" width="115" height="75" rx="3"/></g><g class="plan-labels"><text x="70" y="72">LIVING</text><text x="207" y="72">BEDROOM</text><text x="312" y="72">BEDROOM</text><text x="52" y="158">KITCHEN</text><text x="178" y="158">DINING</text><text x="303" y="158">FLEX ROOM</text></g><text class="plan-level-label" x="25" y="213">2 LEVELS · 3 BEDROOMS</text></svg><p class="model-feedback" data-model-status role="status">2-floor concept · 3 bedrooms. Drag-free preview; adjust the controls to explore.</p><small>Illustrative room blocks only · not an approved floor plan.</small></div>',
  materials: '<div class="feature-model" data-model="materials"><svg class="model-house" viewBox="0 0 420 220" role="img" aria-label="Illustrative house exterior material preview"><defs><linearGradient id="model-sky" x2="0" y2="1"><stop stop-color="#152f4e"/><stop offset="1" stop-color="#091729"/></linearGradient></defs><rect width="420" height="220" fill="url(#model-sky)"/><path d="M50 185h320" stroke="#d6a34a" opacity=".6"/><path class="model-roof-shape" d="m88 100 121-66 123 66v13H88z"/><path class="model-wall-shape" d="M105 105h208v80H105z"/><path class="model-glass-shape" d="M124 124h51v61h-51zm117 0h59v38h-59z"/><path d="M196 142h37v43h-37z" fill="#15243a" stroke="#d6a34a"/><path d="M98 188h225" stroke="#f2d18c" stroke-width="2"/></svg><div class="model-toolbar model-swatch-group"><fieldset><legend>Wall colour</legend><button type="button" data-material-part="wall" data-color="#e8e0d2" aria-label="Ivory walls" style="--swatch:#e8e0d2"></button><button type="button" data-material-part="wall" data-color="#bba27b" aria-label="Sandstone walls" style="--swatch:#bba27b"></button><button type="button" data-material-part="wall" data-color="#707d78" aria-label="Sage walls" style="--swatch:#707d78"></button><button type="button" data-material-part="wall" data-color="#343c48" aria-label="Charcoal walls" style="--swatch:#343c48"></button></fieldset><fieldset><legend>Roof colour</legend><button type="button" data-material-part="roof" data-color="#343a43" aria-label="Charcoal roof" style="--swatch:#343a43"></button><button type="button" data-material-part="roof" data-color="#806047" aria-label="Terracotta roof" style="--swatch:#806047"></button><button type="button" data-material-part="roof" data-color="#b38b50" aria-label="Bronze roof" style="--swatch:#b38b50"></button></fieldset></div><p class="model-feedback" data-model-status role="status">Choose a wall or roof swatch to change the house concept.</p><small>Visual finishes only · not a product or construction specification.</small></div>',
  voice: '<div class="feature-model" data-model="voice"><p class="model-feedback" data-model-status role="status">Try a sample text question. This preview does not send it to AI.</p><form data-model-form="voice"><label>Sample question<textarea name="question" rows="2" maxlength="300" placeholder="How do I plan a two-floor house?"></textarea></label><div class="model-toolbar"><label>Language<select name="language"><option>English</option><option>தமிழ்</option><option>हिन्दी</option><option>മലയാളം</option></select></label><button class="button button-gold" type="submit">Try sample reply</button></div></form><div class="voice-demo-reply" data-model-reply hidden></div><small>Sample text response only · no microphone or AI service call.</small></div>',
  projects: '<div class="feature-model" data-model="projects"><img class="model-gallery-image" data-gallery-image src="assets/service-home.jpg" alt="Illustrative residential concept"><div class="model-gallery-controls"><button type="button" data-gallery-step="-1" aria-label="Previous concept">←</button><span data-gallery-caption>Residential concept · illustrative</span><button type="button" data-gallery-step="1" aria-label="Next concept">→</button></div><div class="model-gallery-dots"><button type="button" data-gallery-index="0" aria-label="Show residential concept"></button><button type="button" data-gallery-index="1" aria-label="Show villa concept"></button><button type="button" data-gallery-index="2" aria-label="Show interior concept"></button></div><small>Illustrative imagery · not a verified completed-project portfolio.</small></div>',
  city: '<div class="feature-model" data-model="city"><p class="model-instruction">Select a conceptual district to highlight it.</p><div class="model-city-map"><button type="button" data-city-zone="Homes">Homes</button><button type="button" data-city-zone="Community">Community</button><button type="button" data-city-zone="Green space">Green space</button><button type="button" data-city-zone="Civic">Civic</button><button type="button" data-city-zone="Mixed use">Mixed use</button></div><div class="model-toolbar"><label>Planning location<select data-city-location><option>Choose a city</option><option>Chennai</option><option>Madurai</option><option>Coimbatore</option><option>Other</option></select></label></div><p class="model-feedback" data-model-status role="status">Concept map only · no live map or local rules are connected.</p><small>Not a surveyed site map · verify local rules with qualified professionals.</small></div>',
  sketch: '<div class="feature-model" data-model="sketch"><svg class="model-sketch-art" viewBox="0 0 420 180" role="img" aria-label="House sketch conversion concept"><path d="m70 94 137-68 145 72M92 87v72h230V87m-190 30h62v42h-62zm108 0h71v42h-71z"/></svg><div class="model-toolbar"><label>Design style<select data-sketch-style><option>Modern</option><option>Traditional</option><option>Tropical</option><option>Minimalist</option></select></label><label>Floors<select data-sketch-floors><option>1 floor</option><option selected>2 floors</option><option>3 floors</option></select></label></div><p class="model-feedback" data-model-status role="status">Choose an image below for a private, local-only preview.</p><small>AI conversion is not connected. Your selected image stays in this browser.</small></div>',
  cutaway: '<div class="feature-model" data-model="cutaway"><svg class="model-cutaway" data-cutaway-view="open" viewBox="0 0 420 220" role="img" aria-label="Conceptual house cutaway room schematic"><path class="cutaway-roof" d="m54 82 154-67 158 67"/><path class="cutaway-wall" d="M76 83h265v115H76z"/><path class="cutaway-partition" d="M210 84v112M78 143h262"/><text x="115" y="125">LIVING</text><text x="246" y="125">KITCHEN</text><text x="113" y="177">BEDROOM</text><text x="244" y="177">BATH</text></svg><div class="model-toolbar"><button type="button" data-cutaway-toggle="roof">Hide roof</button><button type="button" data-cutaway-toggle="walls">Hide walls</button><button type="button" data-cutaway-toggle="reset">Reset view</button></div><p class="model-feedback" data-model-status role="status">Concept room schematic · not an actual furnished or structural 3D cutaway.</p></div>',
  prices: '<div class="feature-model" data-model="prices"><p class="model-instruction">Enter two prices from quotes you already have.</p><div class="model-quote-grid"><label>Quote A rate (₹/unit)<input data-quote="a" type="number" min="0" step="0.01" value="0"></label><label>Quote B rate (₹/unit)<input data-quote="b" type="number" min="0" step="0.01" value="0"></label><label>Quantity<input data-quote="quantity" type="number" min="0.01" step="0.01" value="100"></label></div><div class="model-price-bars"><div><span>Quote A</span><i data-price-bar="a"></i><strong data-price-total="a">₹0</strong></div><div><span>Quote B</span><i data-price-bar="b"></i><strong data-price-total="b">₹0</strong></div></div><p class="model-feedback" data-model-status role="status">Sample comparison · enter your own rates. No supplier pricing is fetched.</p><small>Excludes taxes, delivery, quality/specification differences, and labour.</small></div>',
  twin: '<div class="feature-model" data-model="twin"><div class="model-twin-shell"><div class="model-twin-house"><span></span><span></span><span></span></div><div class="model-twin-status"><b data-twin-percent>25%</b><span data-twin-stage>Foundation · sample</span></div></div><input data-twin-progress aria-label="Sample project phase" type="range" min="0" max="4" value="1"><div class="model-twin-steps"><button type="button" data-twin-step="0">Brief</button><button type="button" data-twin-step="1">Foundation</button><button type="button" data-twin-step="2">Structure</button><button type="button" data-twin-step="3">Finishes</button><button type="button" data-twin-step="4">Handover</button></div><p class="model-feedback">Sample timeline only · not a live customer project or site update.</p></div>',
  moodboard: '<div class="feature-model" data-model="moodboard"><div class="model-toolbar"><label>Design mood<select data-mood-palette><option value="coastal">Coastal ivory</option><option value="earth">Earth & timber</option><option value="modern">Modern charcoal</option><option value="garden">Garden retreat</option></select></label><label>Preview surface<select data-mood-surface><option>Exterior</option><option>Living room</option><option>Kitchen</option></select></label></div><div class="model-moodboard" data-mood-preview><span></span><span></span><span></span><span></span></div><p class="model-feedback" data-model-status role="status">Choose a mood and surface to preview a palette.</p><small>Local colour concept · no AI images generated or saved.</small></div>',
  proposal: '<div class="feature-model" data-model="proposal"><div class="model-proposal-sheet"><span>SAFA CONSTRUCTION</span><b>PROJECT DISCUSSION</b><i></i><i></i><i></i><em>PRELIMINARY DRAFT</em></div><label>Project type<select data-proposal-type><option>New home</option><option>Villa or duplex</option><option>Renovation</option><option>Planning or interiors</option></select></label><p class="model-feedback" data-model-status role="status">Choose a project type to prefill the downloadable discussion draft below.</p><small>Personalize and download the discussion draft below. It is not a quote or formal SAFA proposal.</small></div>',
  journey: '<div class="feature-model" data-model="journey"><div class="model-journey-track"><span data-journey-fill></span><button type="button" data-journey-step="0" class="is-active">01</button><button type="button" data-journey-step="1">02</button><button type="button" data-journey-step="2">03</button><button type="button" data-journey-step="3">04</button></div><h3 data-journey-title>Discover SAFA</h3><p class="model-feedback" data-model-status role="status">Meet the team and explore the construction journey.</p><div class="model-toolbar"><button type="button" data-journey-nav="-1">Previous</button><button type="button" data-journey-nav="1">Next step</button></div><small>Preview stages are illustrative website sections, not project progress.</small></div>',
  admin: '<div class="feature-model" data-model="admin"><div class="model-admin-tabs"><button type="button" data-admin-tab="overview" class="is-active">Overview</button><button type="button" data-admin-tab="projects">Projects</button><button type="button" data-admin-tab="materials">Materials</button></div><div class="model-admin-panel" data-admin-panel><b>Dashboard concept</b><div><span>Project records</span><strong>Not connected</strong></div><div><span>Customer access</span><strong>Secure login required</strong></div><div><span>Backend status</span><strong>Not configured</strong></div></div><p class="model-feedback">Interface concept only · no login, customer data, or management actions are available.</p></div>',
};

let activeInnovation3D = null;
let innovation3DGeneration = 0;
const disposeInnovation3D = () => {
  innovation3DGeneration += 1;
  if (!activeInnovation3D) return;
  activeInnovation3D.resizeObserver.disconnect();
  window.cancelAnimationFrame(activeInnovation3D.frame);
  const materials = new Set();
  activeInnovation3D.scene.traverse((object) => {
    object.geometry?.dispose();
    if (Array.isArray(object.material)) object.material.forEach((entry) => materials.add(entry));
    else if (object.material) materials.add(object.material);
  });
  materials.forEach((material) => material.dispose());
  activeInnovation3D.renderer.renderLists.dispose();
  activeInnovation3D.renderer.dispose();
  activeInnovation3D = null;
};

const startInnovation3D = async (model) => {
  disposeInnovation3D();
  const generation = innovation3DGeneration;
  const canvas = document.createElement("canvas");
  canvas.className = "feature-3d-canvas";
  canvas.setAttribute("aria-label", `Interactive three-dimensional ${model.dataset.model} concept preview. Drag or use the arrow keys to rotate; use the wheel or plus and minus keys to zoom.`);
  canvas.setAttribute("role", "img");
  canvas.setAttribute("tabindex", "0");
  const viewer = document.createElement("div");
  viewer.className = "feature-3d-viewer";
  viewer.append(canvas);
  const hint = document.createElement("span");
  hint.className = "feature-3d-hint";
  hint.textContent = "DRAG TO ROTATE · SCROLL TO ZOOM";
  viewer.append(hint);
  model.prepend(viewer);
  const status = document.createElement("p");
  status.className = "feature-3d-status";
  status.setAttribute("role", "status");
  status.textContent = "Loading interactive 3D preview…";
  viewer.append(status);

  try {
    const THREE = await loadThree();
    if (generation !== innovation3DGeneration || !model.isConnected || !innovationDialog.open) return;
    const width = viewer.clientWidth;
    const height = viewer.clientHeight;
    if (!width || !height) throw new Error("The feature preview has no visible layout size.");
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.4));
    renderer.setSize(width, height);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0b1e37");
    const camera = new THREE.PerspectiveCamera(34, width / height, .1, 100);
    let radius = 11;
    let theta = .72;
    let phi = 1.08;
    const target = new THREE.Vector3(0, .85, 0);
    const placeCamera = () => {
      camera.position.set(
        target.x + radius * Math.sin(phi) * Math.sin(theta),
        target.y + radius * Math.cos(phi),
        target.z + radius * Math.sin(phi) * Math.cos(theta),
      );
      camera.lookAt(target);
    };
    placeCamera();
    scene.add(new THREE.HemisphereLight(0xf2eadb, 0x182333, 1.8));
    const keyLight = new THREE.DirectionalLight(0xffedcf, 2.5);
    keyLight.position.set(-5, 9, 7);
    keyLight.castShadow = true;
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0xd6a34a, 25, 20);
    rimLight.position.set(5, 5, -4);
    scene.add(rimLight);
    const modelRoot = new THREE.Group();
    scene.add(modelRoot);
    const state = { model, THREE, scene, camera, renderer, modelRoot, status, keyLight, rimLight, wallMaterials: [], roofMaterials: [], glazingMaterials: [], accentMaterials: [], floorplanRooms: [], cityBlocks: [], priceBars: [], projectPanels: [], twinParts: [], journeyNodes: [], orbitMeshes: [] };
    const material = (color, roughness = .7, metalness = .05) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
    const goldMaterial = material("#d6a34a", .38, .52);
    const darkMaterial = material("#18283b");
    state.sharedMaterials = new Set([goldMaterial, darkMaterial]);
    const glassMaterial = material("#7796aa", .24, .24);
    const addBox = (group, w, h, d, x, y, z, mat, role) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if (role) mesh.userData.role = role;
      group.add(mesh);
      return mesh;
    };
    const addSphere = (group, size, x, y, z, mat, role) => {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 24, 18), mat);
      mesh.position.set(x, y, z);
      if (role) mesh.userData.role = role;
      group.add(mesh);
      return mesh;
    };
    const addCylinder = (group, top, bottom, height, x, y, z, mat, role) => {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(top, bottom, height, 8), mat);
      mesh.position.set(x, y, z);
      if (role) mesh.userData.role = role;
      group.add(mesh);
      return mesh;
    };
    const addFloor = () => {
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), material("#15283a", 1));
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -.08;
      floor.receiveShadow = true;
      modelRoot.add(floor);
      const grid = new THREE.GridHelper(10, 20, "#876a3f", "#294057");
      grid.position.y = -.065;
      modelRoot.add(grid);
    };
    const addHouse = (style = "modern", floors = 2, cutaway = false) => {
      const houseGroup = new THREE.Group();
      modelRoot.add(houseGroup);
      const width = style === "villa" ? 5.3 : style === "traditional" ? 4.8 : 5;
      const floorHeight = .9;
      const wall = material("#e8e0d2");
      const roof = material(style === "traditional" ? "#806047" : "#343a43", .42, .28);
      state.wallMaterials.push(wall);
      state.roofMaterials.push(roof);
      const bodyHeight = floors * floorHeight;
      const body = addBox(houseGroup, width, bodyHeight, 3.5, 0, bodyHeight / 2, 0, wall, "house-wall");
      state.houseBody = body;
      if (cutaway) {
        body.material = material("#e8e0d2", .76);
        body.material.transparent = true;
        body.material.opacity = .22;
        body.material.side = THREE.DoubleSide;
        const divider = material("#d6a34a");
        addBox(houseGroup, .07, bodyHeight, 3.5, 0, bodyHeight / 2, 0, divider, "cutaway-wall");
        addBox(houseGroup, width, .06, .07, 0, floorHeight, 0, divider, "cutaway-wall");
        addBox(houseGroup, width + .2, .16, 3.8, 0, bodyHeight + .18, 0, roof, "cutaway-roof");
      } else if (style === "traditional") {
        const roofPanelA = addBox(houseGroup, width / 2 + .3, .14, 3.8, -.95, bodyHeight + .48, 0, roof, "house-roof");
        const roofPanelB = addBox(houseGroup, width / 2 + .3, .14, 3.8, .95, bodyHeight + .48, 0, roof, "house-roof");
        roofPanelA.rotation.z = .48;
        roofPanelB.rotation.z = -.48;
      } else {
        addBox(houseGroup, width + .35, .18, 3.85, 0, bodyHeight + .12, 0, roof, "house-roof");
      }
      for (let floor = 0; floor < floors; floor += 1) {
        const centerY = floor * floorHeight + .48;
        const glass = material("#7796aa", .2, .28);
        state.glazingMaterials.push(glass);
        addBox(houseGroup, 1.05, .5, .08, -.98, centerY, 1.79, glass, "house-glazing");
        addBox(houseGroup, 1.05, .5, .08, 1.05, centerY, 1.79, glass, "house-glazing");
        addBox(houseGroup, .58, .94, .09, 0, .48, 1.8, darkMaterial, "house-door");
      }
      if (style === "villa") {
        addBox(houseGroup, 2.25, .18, 2.2, width / 2 + .6, .95, .2, goldMaterial, "house-balcony");
        addBox(houseGroup, .07, 1.2, .07, width / 2 + .1, .55, 1.1, goldMaterial, "house-column");
        addBox(houseGroup, .07, 1.2, .07, width / 2 + 1.1, .55, 1.1, goldMaterial, "house-column");
      }
      if (style === "modern") {
        addBox(houseGroup, 1.8, .12, .18, 1.45, floorHeight + .1, 1.8, goldMaterial, "house-detail");
      }
      state.houseAssembly = houseGroup;
      state.houseStyle = style;
      state.houseFloors = floors;
    };
    state.rebuildHouse = addHouse;
    const makeProjectPanels = () => {
      ["#ad8b62", "#9caeaf", "#c9b99a"].forEach((color, index) => {
        const panelMaterial = material(color, .72);
        const panel = addBox(modelRoot, 2.35, 1.65, .12, (index - 1) * 2.55, 1.25, 0, panelMaterial, "project-panel");
        panel.rotation.y = (1 - index) * .15;
        state.projectPanels.push(panel);
        addBox(modelRoot, 2.43, .06, .2, (index - 1) * 2.55, .4, .03, goldMaterial, "project-frame");
      });
    };
    addFloor();
    switch (model.dataset.model) {
      case "floorplan": {
        const roomColors = ["#d6a34a", "#7994a5", "#8f9a88", "#b59468", "#697f91", "#a2845c"];
        roomColors.forEach((color, index) => {
          const x = index % 3;
          const z = Math.floor(index / 3);
          const room = addBox(modelRoot, 2.7, .45, 2.15, (x - 1) * 2.85, .22 + Math.floor(index / 3) * .02, (z - .5) * 2.25, material(color, .66), "floorplan-room");
          state.floorplanRooms.push(room);
        });
        break;
      }
      case "materials":
        addHouse();
        break;
      case "voice":
        addSphere(modelRoot, .85, 0, 1, 0, material("#bb8c43", .24, .55), "voice-core");
        [1.25, 1.65, 2.05].forEach((radius) => {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, .025, 8, 80), material("#f0ce83", .28, .48));
          ring.position.y = 1;
          modelRoot.add(ring);
          state.orbitMeshes.push(ring);
        });
        for (let index = 0; index < 6; index += 1) {
          const angle = index * Math.PI / 3;
          addSphere(modelRoot, .1, Math.cos(angle) * 2.35, 1 + Math.sin(angle) * .6, Math.sin(angle) * 2.35, goldMaterial, "voice-node");
        }
        break;
      case "projects":
        makeProjectPanels();
        break;
      case "city":
        for (let index = 0; index < 9; index += 1) {
          const height = .7 + (index * 7 % 5) * .25;
          const block = addBox(modelRoot, 1.05, height, 1.05, (index % 3 - 1) * 1.65, height / 2, (Math.floor(index / 3) - 1) * 1.65, material(index === 4 ? "#718972" : "#60788c"), "city-block");
          state.cityBlocks.push(block);
        }
        break;
      case "sketch":
        addHouse("modern", 2);
        modelRoot.children.filter((child) => child.userData.role?.startsWith("house-")).forEach((child) => {
          child.material = material("#c6a66c", .78);
          child.material.wireframe = true;
        });
        state.sketchBoard = new THREE.Mesh(
          new THREE.PlaneGeometry(2.8, 1.7),
          new THREE.MeshBasicMaterial({ color: "#e3d5b8", side: THREE.DoubleSide }),
        );
        state.sketchBoard.position.set(0, 1.45, -2.2);
        state.sketchBoard.userData.role = "sketch-board";
        modelRoot.add(state.sketchBoard);
        break;
      case "cutaway":
        addHouse("modern", 2, true);
        break;
      case "prices":
        [1.1, 1.7].forEach((height, index) => {
          const bar = addBox(modelRoot, 1.55, height, 1.35, index ? 1.15 : -1.15, height / 2, 0, material(index ? "#7694a5" : "#d6a34a"), "price-bar");
          state.priceBars.push(bar);
        });
        break;
      case "twin":
        addHouse("villa", 2);
        state.houseAssembly.traverse((part) => {
          if (part.userData.role?.startsWith("house-")) state.twinParts.push(part);
        });
        break;
      case "moodboard": {
        ["#e8e0d2", "#102746", "#d6a34a", "#aab6a0"].forEach((color, index) => {
          addBox(modelRoot, 1.8, .16, 1.8, (index % 2) * 2 - 1, .55, (Math.floor(index / 2) - .5) * 2.1, material(color), "mood-swatch");
        });
        break;
      }
      case "proposal": {
        const sheet = addBox(modelRoot, 3.3, .12, 2.35, 0, .7, 0, material("#e4d7bd"), "proposal-sheet");
        sheet.rotation.x = -.12;
        [0, 1, 2, 3].forEach((index) => addBox(modelRoot, 2.15 - index * .18, .025, .045, 0, .79, -.72 + index * .34, material(index ? "#8b9baa" : "#bb8c43"), "proposal-line"));
        addBox(modelRoot, 1.05, .055, .06, -.9, .8, -.88, goldMaterial, "proposal-heading");
        break;
      }
      case "journey":
        for (let index = 0; index < 4; index += 1) {
          const node = addSphere(modelRoot, .32, (index - 1.5) * 1.75, .75 + (index % 2) * .45, 0, material(index ? "#526a7d" : "#d6a34a"), "journey-node");
          state.journeyNodes.push(node);
          if (index < 3) {
            const connector = addBox(modelRoot, 1.2, .06, .06, (index - 1) * 1.75 + .82, .75, 0, goldMaterial, "journey-link");
            connector.rotation.z = index % 2 ? -.18 : .18;
          }
        }
        break;
      case "admin":
        addBox(modelRoot, 4.6, .15, 3.4, 0, .5, 0, material("#25394d"), "admin-base");
        for (let index = 0; index < 3; index += 1) {
          addBox(modelRoot, 1.15, .45 + (index % 2) * .2, .14, -1.45 + index * 1.45, .95, 1.12, material(index ? "#647f94" : "#d6a34a"), "admin-chart");
        }
        for (let index = 0; index < 4; index += 1) {
          addBox(modelRoot, 2.8, .045, .04, 0, .82, .45 - index * .32, material("#95a5b2"), "admin-row");
        }
        break;
      default:
        addHouse();
    }
    const pointer = { dragging: false, x: 0, y: 0 };
    canvas.addEventListener("pointerdown", (event) => {
      pointer.dragging = true;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!pointer.dragging) return;
      theta -= (event.clientX - pointer.x) * .009;
      phi = Math.max(.3, Math.min(1.45, phi + (event.clientY - pointer.y) * .007));
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      placeCamera();
      renderer.render(scene, camera);
    });
    const endDrag = () => { pointer.dragging = false; };
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);
    canvas.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        theta += event.key === "ArrowLeft" ? -.12 : .12;
      } else if (event.key === "+" || event.key === "=") {
        radius = Math.max(6, radius - .6);
      } else if (event.key === "-") {
        radius = Math.min(18, radius + .6);
      } else {
        return;
      }
      event.preventDefault();
      placeCamera();
      renderer.render(scene, camera);
    });
    canvas.addEventListener("wheel", (event) => {
      event.preventDefault();
      radius = Math.max(6, Math.min(18, radius + event.deltaY * .012));
      placeCamera();
      renderer.render(scene, camera);
    }, { passive: false });
    const resizeObserver = new ResizeObserver(() => {
      if (!viewer.clientWidth || !viewer.clientHeight || generation !== innovation3DGeneration) return;
      renderer.setSize(viewer.clientWidth, viewer.clientHeight);
      camera.aspect = viewer.clientWidth / viewer.clientHeight;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    });
    resizeObserver.observe(viewer);
    activeInnovation3D = { ...state, resizeObserver, frame: 0, startedAt: performance.now(), rebuildHouse: addHouse };
    if (model.dataset.model === "materials") {
      updateInnovation3D(model, model.querySelector("[data-house-style]"));
      updateInnovation3D(model, model.querySelector('[data-material-part="wall"]'));
      updateInnovation3D(model, model.querySelector('[data-material-part="roof"]'));
      updateInnovation3D(model, model.querySelector('[data-material-part="glazing"]'));
    }
    if (model.dataset.model === "floorplan") {
      model.querySelectorAll("[data-model-field]").forEach((control) => updateInnovation3D(model, control));
    }
    if (model.dataset.model === "prices") {
      model.querySelectorAll("[data-quote]").forEach((control) => updateInnovation3D(model, control));
    }
    if (model.dataset.model === "moodboard") updateInnovation3D(model, model.querySelector("[data-mood-palette]"));
    if (model.dataset.model === "sketch") updateInnovation3D(model, model.querySelector("[data-sketch-style]"));
    if (model.dataset.model === "sketch" && model.dataset.sketchImageUrl) {
      loadInnovationSketchTexture(model.dataset.sketchImageUrl, model);
    }
    status.hidden = true;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const render = (time) => {
      if (!innovationDialog.open || activeInnovation3D?.model !== model || generation !== innovation3DGeneration) return;
      if (!prefersReducedMotion) {
        const elapsed = (time - activeInnovation3D.startedAt) * .00012;
        state.orbitMeshes.forEach((ring, index) => { ring.rotation.x = .35 + elapsed * (index % 2 ? -1 : 1); ring.rotation.y = elapsed * .7; });
      }
      renderer.render(scene, camera);
      if (!prefersReducedMotion) activeInnovation3D.frame = window.requestAnimationFrame(render);
    };
    render(performance.now());
  } catch (error) {
    if (generation !== innovation3DGeneration) return;
    status.textContent = "Interactive 3D is unavailable. Check your connection or WebGL support.";
    status.hidden = false;
    console.error("SAFA feature 3D preview failed to initialize:", error);
  }
};

const updateInnovation3D = (model, target) => {
  const active = activeInnovation3D;
  if (!active || active.model !== model) return;
  const hex = (value) => Number.parseInt(value.replace("#", ""), 16);
  if (model.dataset.model === "floorplan" && target.matches("[data-model-field]")) {
    const floors = Number(model.querySelector('[data-model-field="floors"]').value);
    const bedrooms = Number(model.querySelector('[data-model-field="bedrooms"]').value);
    active.floorplanRooms.forEach((room, index) => {
      room.visible = floors > 1 || index < 3;
      room.scale.y = index < bedrooms ? 1.2 : .65;
      room.material.color.set(index < bedrooms ? ["#d6a34a", "#7994a5", "#8f9a88", "#b59468", "#697f91"][index % 5] : "#24354a");
    });
  }
  if (model.dataset.model === "materials" && target.matches("[data-material-part]")) {
    const mats = target.dataset.materialPart === "wall"
      ? active.wallMaterials
      : target.dataset.materialPart === "roof" ? active.roofMaterials : active.glazingMaterials;
    mats.forEach((entry) => entry.color.set(hex(target.dataset.color)));
    model.querySelectorAll(`[data-material-part="${target.dataset.materialPart}"]`).forEach((button) => button.classList.toggle("is-active", button === target));
  }
  if (model.dataset.model === "materials" && target.matches("[data-house-style], [data-house-floors]")) {
    const group = active.houseAssembly;
    if (group) {
      group.traverse((part) => {
        part.geometry?.dispose();
        if (Array.isArray(part.material)) part.material.forEach((entry) => {
          if (!active.sharedMaterials.has(entry)) entry.dispose();
        });
        else if (part.material && !active.sharedMaterials.has(part.material)) part.material.dispose();
      });
      active.modelRoot.remove(group);
    }
    active.wallMaterials.length = 0;
    active.roofMaterials.length = 0;
    active.glazingMaterials.length = 0;
    const style = model.querySelector("[data-house-style]").value;
    const floors = Number(model.querySelector("[data-house-floors]").value);
    const rebuild = active.rebuildHouse;
    rebuild(style, floors);
    const wallColor = model.querySelector('[data-material-part="wall"].is-active')?.dataset.color || "#e8e0d2";
    const roofColor = model.querySelector('[data-material-part="roof"].is-active')?.dataset.color || "#343a43";
    const glazingColor = model.querySelector('[data-material-part="glazing"].is-active')?.dataset.color || "#7796aa";
    active.wallMaterials.forEach((entry) => entry.color.set(hex(wallColor)));
    active.roofMaterials.forEach((entry) => entry.color.set(hex(roofColor)));
    active.glazingMaterials.forEach((entry) => entry.color.set(hex(glazingColor)));
    if (status) status.textContent = `${style === "villa" ? "Contemporary villa" : style === "traditional" ? "Traditional gable" : "Modern courtyard"} · ${floors} floor${floors === 1 ? "" : "s"} · live 3D update.`;
  }
  if (model.dataset.model === "materials" && target.matches("[data-house-finish]")) {
    const roughness = { smooth: .38, limestone: .94, textured: .78 }[target.value];
    active.wallMaterials.forEach((entry) => { entry.roughness = roughness; });
    if (status) status.textContent = `${target.selectedOptions[0].textContent} finish applied to the 3D walls.`;
  }
  if (model.dataset.model === "materials" && target.matches("[data-house-light]")) {
    const evening = target.value === "evening";
    active.scene.background.set(evening ? "#07111e" : "#0b1e37");
    active.keyLight.intensity = evening ? 1.1 : 2.5;
    active.rimLight.intensity = evening ? 32 : 25;
    if (status) status.textContent = `${evening ? "Evening" : "Daylight"} lighting updated in the 3D preview.`;
  }
  if (model.dataset.model === "voice" && (target.matches('[name="question"], [name="language"]') || target.matches('[data-model-form="voice"] button'))) {
    const core = active.modelRoot.children.find((part) => part.userData.role === "voice-core");
    const languageColors = { English: "#d6a34a", "தமிழ்": "#c97852", "हिन्दी": "#d29b45", "മലയാളം": "#718f6f" };
    if (core) {
      core.material.color.set(languageColors[model.querySelector('[name="language"]').value] || "#d6a34a");
      core.scale.setScalar(target.matches('[data-model-form="voice"] button') ? 1.18 : 1);
    }
  }
  if (model.dataset.model === "projects" && (target.matches("[data-gallery-step]") || target.matches("[data-gallery-index]"))) {
    const index = Number(model.dataset.index || 0);
    const colors = ["#bd9663", "#8999a4", "#b8a58a"];
    active.projectPanels.forEach((panel, panelIndex) => {
      panel.material.color.set(colors[(index + panelIndex) % colors.length]);
      panel.scale.y = panelIndex === index ? 1.2 : 1;
    });
  }
  if (model.dataset.model === "city" && target.matches("[data-city-zone]")) {
    active.cityBlocks.forEach((block, index) => {
      const selected = (index === target.parentElement.querySelectorAll("[data-city-zone]").length - 1) || (index % 3 === [...target.parentElement.querySelectorAll("[data-city-zone]")].indexOf(target));
      block.material.color.set(selected ? "#d6a34a" : "#60788c");
      block.scale.y = selected ? 1.24 : 1;
    });
  }
  if (model.dataset.model === "city" && target.matches("[data-city-location]")) {
    const offset = target.selectedIndex;
    active.cityBlocks.forEach((block, index) => {
      block.position.x = (index % 3 - 1) * 1.65 + Math.sin(offset * .5) * .22;
    });
  }
  if (model.dataset.model === "sketch" && target.matches("[data-sketch-style], [data-sketch-floors]")) {
    const style = model.querySelector("[data-sketch-style]").value;
    const floors = Number(model.querySelector("[data-sketch-floors]").value.slice(0, 1));
    active.houseAssembly?.traverse((part) => {
      if (!part.userData.role?.startsWith("house-")) return;
      part.material.wireframe = true;
      if (style === "Traditional") part.material.color.set("#c38f56");
      else if (style === "Tropical") part.material.color.set("#85a786");
      else if (style === "Minimalist") part.material.color.set("#d9dce0");
      else part.material.color.set("#c6a66c");
      if (part.userData.role === "house-wall") part.scale.y = floors / 2;
    });
  }
  if (model.dataset.model === "cutaway" && target.matches("[data-cutaway-toggle]")) {
    const action = target.dataset.cutawayToggle;
    if (action === "reset") {
      active.modelRoot.traverse((part) => {
        if (part.userData.role === "cutaway-roof" || part.userData.role === "cutaway-wall") part.visible = true;
      });
    } else {
      const role = action === "roof" ? "cutaway-roof" : "cutaway-wall";
      let visible = true;
      active.modelRoot.traverse((part) => { if (part.userData.role === role) visible = part.visible; });
      active.modelRoot.traverse((part) => { if (part.userData.role === role) part.visible = !visible; });
    }
  }
  if (model.dataset.model === "prices" && target.matches("[data-quote]")) {
    const values = ["a", "b"].map((key) => Math.max(0, Number(model.querySelector(`[data-quote="${key}"]`).value) || 0));
    const scale = Math.max(...values, 1);
    active.priceBars.forEach((bar, index) => {
      const height = .35 + values[index] / scale * 2;
      bar.scale.y = height / bar.geometry.parameters.height;
      bar.position.y = height / 2;
    });
  }
  if (model.dataset.model === "twin" && (target.matches("[data-twin-progress]") || target.matches("[data-twin-step]"))) {
    const progress = Number(model.querySelector("[data-twin-progress]").value) / 4;
    active.twinParts.forEach((part) => { part.material.color.set(progress > .7 ? "#b9945d" : "#e8e0d2"); });
    active.modelRoot.scale.y = .72 + progress * .28;
  }
  if (model.dataset.model === "moodboard" && target.matches("[data-mood-palette]")) {
    const palettes = { coastal: ["#e8e0d2", "#102746", "#d6a34a", "#b7c9c5"], earth: ["#d8c3a5", "#725943", "#aab6a0", "#ede1cc"], modern: ["#d9dce0", "#252a31", "#b97859", "#8c989f"], garden: ["#e8dfc8", "#495e48", "#9d7b52", "#9aafa0"] };
    active.modelRoot.children.filter((part) => part.userData.role === "mood-swatch").forEach((part, index) => part.material.color.set(hex(palettes[target.value][index])));
  }
  if (model.dataset.model === "journey" && (target.matches("[data-journey-step]") || target.matches("[data-journey-nav]"))) {
    const step = Number(model.dataset.step || 0);
    active.journeyNodes.forEach((node, index) => {
      node.material.color.set(index <= step ? "#d6a34a" : "#526a7d");
      node.scale.setScalar(index === step ? 1.35 : 1);
    });
  }
  if (model.dataset.model === "admin" && target.matches("[data-admin-tab]")) {
    active.modelRoot.children.filter((part) => part.userData.role === "admin-chart").forEach((bar, index) => {
      bar.material.color.set(target.dataset.adminTab === "projects" ? (index ? "#7694a5" : "#d6a34a") : target.dataset.adminTab === "materials" ? (index === 2 ? "#d6a34a" : "#879986") : "#718ba0");
    });
  }
  if (model.dataset.model === "proposal" && target.matches("[data-proposal-type]")) {
    const tint = { "New home": "#e4d7bd", "Villa or duplex": "#d6bb8a", Renovation: "#c6d2c6", "Planning or interiors": "#c3ccd8" }[target.value];
    active.modelRoot.children.filter((part) => part.userData.role === "proposal-sheet").forEach((part) => part.material.color.set(hex(tint)));
  }
  active.renderer.render(active.scene, active.camera);
};

const loadInnovationSketchTexture = (url, model) => {
  const active = activeInnovation3D;
  if (!active || active.model !== model || !active.sketchBoard) return;
  const image = new Image();
  image.addEventListener("load", () => {
    if (activeInnovation3D !== active) return;
    const texture = new active.THREE.Texture(image);
    texture.encoding = active.THREE.sRGBEncoding;
    texture.needsUpdate = true;
    const oldMaterial = active.sketchBoard.material;
    active.sketchBoard.material = new active.THREE.MeshBasicMaterial({ map: texture, side: active.THREE.DoubleSide });
    oldMaterial.dispose();
    const ratio = image.naturalWidth / image.naturalHeight;
    active.sketchBoard.geometry.dispose();
    active.sketchBoard.geometry = new active.THREE.PlaneGeometry(ratio > 1.7 ? 3 : 1.7 * ratio, ratio > 1.7 ? 3 / ratio : 1.7);
    active.renderer.render(active.scene, active.camera);
  });
  image.src = url;
};

const updateInnovationModel = (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const model = target.closest(".feature-model");
  if (!model) return;
  if (!target.matches("select") || event.type === "change") updateInnovation3D(model, target);
  const status = model.querySelector("[data-model-status]");
  if (model.dataset.model === "floorplan" && target.matches("[data-model-field]")) {
    const floors = model.querySelector('[data-model-field="floors"]').value;
    const bedrooms = model.querySelector('[data-model-field="bedrooms"]').value;
    model.dataset.bedrooms = bedrooms;
    const plan = model.querySelector(".model-floorplan");
    plan.dataset.floors = floors;
    plan.dataset.bedrooms = bedrooms;
    plan.querySelector(".plan-level-label").textContent = `${floors} LEVEL${floors === "1" ? "" : "S"} · ${bedrooms} BEDROOM${bedrooms === "1" ? "" : "S"}`;
    if (status) status.textContent = `${floors}-floor concept · ${bedrooms} bedroom${bedrooms === "1" ? "" : "s"}.`;
  }
  if (model.dataset.model === "materials" && target.matches("[data-material-part]")) {
    const part = target.dataset.materialPart;
    const color = target.dataset.color;
    const shape = model.querySelector(`.model-${part}-shape`);
    if (shape) shape.setAttribute("fill", color);
    model.querySelectorAll(`[data-material-part="${part}"]`).forEach((button) => button.classList.toggle("is-active", button === target));
    if (status) status.textContent = `${part === "wall" ? "Wall" : "Roof"} colour changed · visual sample only.`;
  }
  if (model.dataset.model === "voice" && target.matches('[name="question"], [name="language"]')) {
    const question = model.querySelector('[name="question"]').value.trim();
    if (status) status.textContent = question ? "Preview ready · submit to see a sample reply. No microphone or AI service is used." : "Type a sample question. No microphone or AI service is used.";
  }
  if (model.dataset.model === "sketch" && target.matches("[data-sketch-style], [data-sketch-floors]")) {
    const art = model.querySelector(".model-sketch-art");
    art.dataset.style = model.querySelector("[data-sketch-style]").value.toLowerCase();
    art.dataset.floors = model.querySelector("[data-sketch-floors]").value.slice(0, 1);
    if (status) status.textContent = `${model.querySelector("[data-sketch-style]").value} · ${model.querySelector("[data-sketch-floors]").value} concept. Select an image below for a local preview.`;
  }
  if (model.dataset.model === "projects" && (target.matches("[data-gallery-step]") || target.matches("[data-gallery-index]"))) {
    const images = [
      { src: "assets/service-home.jpg", alt: "Illustrative residential concept", caption: "Residential concept" },
      { src: "assets/service-villa.jpg", alt: "Illustrative villa concept", caption: "Villa concept" },
      { src: "assets/service-interior.jpg", alt: "Illustrative interior concept", caption: "Interior concept" },
    ];
    const current = Number(model.dataset.index || 0);
    const next = target.dataset.galleryIndex !== undefined
      ? Number(target.dataset.galleryIndex)
      : (current + Number(target.dataset.galleryStep) + images.length) % images.length;
    const item = images[next];
    model.dataset.index = String(next);
    const image = model.querySelector("[data-gallery-image]");
    image.src = item.src;
    image.alt = item.alt;
    model.querySelector("[data-gallery-caption]").textContent = `${item.caption} · illustrative`;
    model.querySelectorAll("[data-gallery-index]").forEach((button, index) => button.classList.toggle("is-active", index === next));
  }
  if (model.dataset.model === "city" && target.matches("[data-city-zone]")) {
    model.querySelectorAll("[data-city-zone]").forEach((button) => button.classList.toggle("is-active", button === target));
    if (status) status.textContent = `${target.dataset.cityZone} concept selected · no live map data is connected.`;
  }
  if (model.dataset.model === "city" && target.matches("[data-city-location]") && status) {
    status.textContent = target.value === "Choose a city"
      ? "Concept map only · no live map or local rules are connected."
      : `${target.value} selected for discussion · no maps or regulations were checked.`;
  }
  if (model.dataset.model === "cutaway" && target.matches("[data-cutaway-toggle]")) {
    const action = target.dataset.cutawayToggle;
    const svg = model.querySelector(".model-cutaway");
    if (action === "reset") {
      svg.dataset.cutawayView = "open";
      model.querySelectorAll("[data-cutaway-toggle]").forEach((button) => {
        if (button.dataset.cutawayToggle === "roof") button.textContent = "Hide roof";
        if (button.dataset.cutawayToggle === "walls") button.textContent = "Hide walls";
      });
      return;
    }
    const key = action === "roof" ? "roof" : "walls";
    const hidden = svg.dataset[`hide${key}`] !== "true";
    svg.dataset[`hide${key}`] = String(hidden);
    target.textContent = `${hidden ? "Show" : "Hide"} ${key}`;
  }
  if (model.dataset.model === "prices" && target.matches("[data-quote]")) {
    const rateA = Math.max(0, Number(model.querySelector('[data-quote="a"]').value) || 0);
    const rateB = Math.max(0, Number(model.querySelector('[data-quote="b"]').value) || 0);
    const quantity = Math.max(0, Number(model.querySelector('[data-quote="quantity"]').value) || 0);
    const totalA = rateA * quantity;
    const totalB = rateB * quantity;
    model.querySelector('[data-price-total="a"]').textContent = `₹${totalA.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
    model.querySelector('[data-price-total="b"]').textContent = `₹${totalB.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
    const scale = Math.max(totalA, totalB, 1);
    model.querySelector('[data-price-bar="a"]').style.width = `${totalA / scale * 100}%`;
    model.querySelector('[data-price-bar="b"]').style.width = `${totalB / scale * 100}%`;
    if (status) status.textContent = `Entered quote totals for ${quantity || 0} units · sample calculation only.`;
  }
  if (model.dataset.model === "twin" && (target.matches("[data-twin-progress]") || target.matches("[data-twin-step]"))) {
    const stages = ["Initial brief · sample", "Foundation · sample", "Structure · sample", "Finishes · sample", "Handover · sample"];
    const step = target.matches("[data-twin-step]") ? Number(target.dataset.twinStep) : Number(target.value);
    model.querySelector("[data-twin-progress]").value = String(step);
    model.querySelector("[data-twin-percent]").textContent = `${[0, 20, 45, 75, 100][step]}%`;
    model.querySelector("[data-twin-stage]").textContent = stages[step];
    model.querySelectorAll("[data-twin-step]").forEach((button, index) => button.classList.toggle("is-active", index === step));
  }
  if (model.dataset.model === "moodboard" && target.matches("[data-mood-palette], [data-mood-surface]")) {
    const palettes = {
      coastal: ["#e8e0d2", "#102746", "#d6a34a", "#b7c9c5"],
      earth: ["#d8c3a5", "#725943", "#aab6a0", "#ede1cc"],
      modern: ["#d9dce0", "#252a31", "#b97859", "#8c989f"],
      garden: ["#e8dfc8", "#495e48", "#9d7b52", "#9aafa0"],
    };
    const palette = palettes[model.querySelector("[data-mood-palette]").value];
    model.querySelectorAll("[data-mood-preview] span").forEach((swatch, index) => {
      swatch.style.backgroundColor = palette[index];
    });
    if (status) status.textContent = `${model.querySelector("[data-mood-palette]").selectedOptions[0].textContent} palette · ${model.querySelector("[data-mood-surface]").value} sample.`;
  }
  if (model.dataset.model === "proposal" && target.matches("[data-proposal-type]")) {
    const projectType = innovationTool.querySelector("#innovation-project-type");
    if (projectType) projectType.value = target.value;
    if (status) status.textContent = `${target.value} selected · the draft form below is ready to personalize.`;
  }
  if (model.dataset.model === "journey" && (target.matches("[data-journey-step]") || target.matches("[data-journey-nav]"))) {
    const steps = [
      ["Discover SAFA", "Meet the team and explore the construction journey."],
      ["Explore services", "Review the available construction and design services."],
      ["Preview designs", "Explore illustrative concepts and the interactive house designer."],
      ["Plan a project", "Prepare questions and discuss your project with the SAFA team."],
    ];
    const current = Number(model.dataset.step || 0);
    const next = target.matches("[data-journey-step]")
      ? Number(target.dataset.journeyStep)
      : (current + Number(target.dataset.journeyNav) + steps.length) % steps.length;
    model.dataset.step = String(next);
    model.querySelector("[data-journey-title]").textContent = steps[next][0];
    model.querySelector("[data-model-status]").textContent = steps[next][1];
    model.querySelector("[data-journey-fill]").style.width = `${next * 33.33}%`;
    model.querySelectorAll("[data-journey-step]").forEach((button, index) => button.classList.toggle("is-active", index === next));
  }
  if (model.dataset.model === "admin" && target.matches("[data-admin-tab]")) {
    const panels = {
      overview: ["Dashboard concept", ["Project records", "Not connected"], ["Customer access", "Secure login required"], ["Backend status", "Not configured"]],
      projects: ["Project management concept", ["Project list", "No records"], ["Progress updates", "Private backend required"], ["Customer access", "Not configured"]],
      materials: ["Materials management concept", ["Supplier catalogue", "Not connected"], ["Live pricing", "Not available"], ["Stock records", "Not configured"]],
    };
    model.querySelectorAll("[data-admin-tab]").forEach((button) => button.classList.toggle("is-active", button === target));
    const [title, ...rows] = panels[target.dataset.adminTab];
    model.querySelector("[data-admin-panel]").innerHTML = `<b>${title}</b>${rows.map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join("")}`;
  }
};

innovationTool.addEventListener("input", updateInnovationModel);
innovationTool.addEventListener("change", updateInnovationModel);
innovationTool.addEventListener("click", updateInnovationModel);
innovationTool.addEventListener("submit", (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || form.dataset.modelForm !== "voice") return;
  event.preventDefault();
  const question = form.elements.namedItem("question").value.trim();
  const language = form.elements.namedItem("language").value;
  const reply = form.parentElement.querySelector("[data-model-reply]");
  const isBudgetQuestion = question.toLowerCase().includes("budget") || question.toLowerCase().includes("cost");
  const replies = {
    English: isBudgetQuestion
      ? "A preliminary budget depends on location, area, materials, labour, structural design, and site conditions. Share your project details with SAFA for a discussion."
      : "I can help you explore SAFA services and prepare a home-planning brief. A qualified professional should confirm designs, approvals, and structural details.",
    "தமிழ்": isBudgetQuestion
      ? "முன்கணிப்பு செலவு இடம், பரப்பளவு, பொருட்கள், தொழிலாளர் கூலி, கட்டமைப்பு வடிவமைப்பு மற்றும் தள நிலைமைகளைப் பொறுத்தது. உங்கள் திட்ட விவரங்களை SAFA-வுடன் பகிர்ந்து ஆலோசிக்கவும்."
      : "SAFA சேவைகளை ஆராயவும், வீட்டு திட்டமிடல் விவரங்களைத் தயாரிக்கவும் உதவ முடியும். வடிவமைப்பு, அனுமதிகள் மற்றும் கட்டமைப்பு விவரங்களைத் தகுதியான நிபுணரிடம் உறுதிப்படுத்தவும்.",
    "हिन्दी": isBudgetQuestion
      ? "प्रारंभिक लागत स्थान, क्षेत्रफल, सामग्री, श्रम, संरचनात्मक डिज़ाइन और साइट की स्थितियों पर निर्भर करती है। चर्चा के लिए अपनी परियोजना की जानकारी SAFA के साथ साझा करें।"
      : "मैं SAFA की सेवाएँ समझने और घर की योजना का विवरण तैयार करने में मदद कर सकता हूँ। डिज़ाइन, अनुमतियों और संरचना की पुष्टि किसी योग्य पेशेवर से करें।",
    "മലയാളം": isBudgetQuestion
      ? "പ്രാഥമിക ചെലവ് സ്ഥലം, വിസ്തീർണം, സാമഗ്രികൾ, തൊഴിൽ, ഘടനാ രൂപകൽപ്പന, സൈറ്റിന്റെ സാഹചര്യം എന്നിവയെ ആശ്രയിച്ചിരിക്കുന്നു. ചർച്ചയ്ക്കായി നിങ്ങളുടെ പദ്ധതി വിവരങ്ങൾ SAFAയുമായി പങ്കിടുക."
      : "SAFA സേവനങ്ങൾ മനസ്സിലാക്കാനും വീടിന്റെ ആസൂത്രണ വിവരങ്ങൾ തയ്യാറാക്കാനും സഹായിക്കാം. രൂപകൽപ്പന, അനുമതികൾ, ഘടനാ വിശദാംശങ്ങൾ എന്നിവ യോഗ്യനായ വിദഗ്ധനോട് സ്ഥിരീകരിക്കുക.",
  };
  reply.textContent = `${language} · Sample reply: ${replies[language] || replies.English}`;
  reply.hidden = false;
});

const openInnovationPreview = (key, trigger) => {
  const preview = innovationPreviews[key];
  if (!preview) return;
  if (!trigger.closest(".innovation-card")) return;
  if (sketchPreviewUrl) {
    URL.revokeObjectURL(sketchPreviewUrl);
    sketchPreviewUrl = "";
  }
  innovationDialogTitle.textContent = preview.title;
  innovationDialogKicker.textContent = preview.status;
  innovationDialogCopy.textContent = preview.copy;
  innovationDialogVisual.replaceChildren();
  innovationDialogLink.href = preview.link;
  innovationDialogLink.innerHTML = `${preview.linkText} <span aria-hidden="true">↗</span>`;
  innovationTool.innerHTML = `${innovationModels[key] || ""}${key === "sketch" || key === "proposal" ? preview.tool || "" : ""}`;
  innovationTool.hidden = !innovationTool.innerHTML;
  innovationDialog.showModal();
  innovationTool.querySelectorAll("[data-model]").forEach((model) => {
    if (model.dataset.model === "floorplan") {
      model.dataset.bedrooms = model.querySelector('[data-model-field="bedrooms"]').value;
      model.querySelector(".model-floorplan").dataset.bedrooms = model.dataset.bedrooms;
    }
    if (model.dataset.model === "projects") {
      model.querySelectorAll("[data-gallery-index]").forEach((button, index) => button.classList.toggle("is-active", index === 0));
    }
    if (model.dataset.model === "moodboard") {
      model.querySelectorAll("[data-mood-preview] span").forEach((swatch, index) => {
        const colors = ["#e8e0d2", "#102746", "#d6a34a", "#b7c9c5"];
        swatch.style.backgroundColor = colors[index];
      });
    }
    if (model.dataset.model === "materials") {
      const controls = document.createElement("div");
      controls.className = "model-material-controls";
      controls.innerHTML = '<div class="model-toolbar"><label>Architecture style<select data-house-style><option value="modern">Modern courtyard</option><option value="villa">Contemporary villa</option><option value="traditional">Traditional gable</option></select></label><label>Floors<select data-house-floors><option value="1">Single storey</option><option value="2" selected>Two storey</option><option value="3">Three storey</option></select></label></div><div class="model-toolbar"><label>Exterior finish<select data-house-finish><option value="smooth">Smooth plaster</option><option value="limestone">Limestone</option><option value="textured">Textured render</option></select></label><label>Lighting<select data-house-light><option value="day">Daylight</option><option value="evening">Evening</option></select></label></div><div class="model-toolbar model-swatch-group"><fieldset><legend>Window glass</legend><button type="button" data-material-part="glazing" data-color="#7796aa" aria-label="Silver glass" style="--swatch:#7796aa"></button><button type="button" data-material-part="glazing" data-color="#a17b55" aria-label="Bronze glass" style="--swatch:#a17b55"></button><button type="button" data-material-part="glazing" data-color="#414d5b" aria-label="Smoky glass" style="--swatch:#414d5b"></button></fieldset></div>';
      model.querySelector("[data-model-status]").before(controls);
    }
  });

  const sketchInput = innovationTool.querySelector("#innovation-sketch-file");
  sketchInput?.addEventListener("change", () => {
    const file = sketchInput.files?.[0];
    const image = innovationTool.querySelector("#innovation-sketch-image");
    const status = innovationTool.querySelector("#innovation-sketch-status");
    if (sketchPreviewUrl) URL.revokeObjectURL(sketchPreviewUrl);
    sketchPreviewUrl = "";
    const model = innovationTool.querySelector('[data-model="sketch"]');
    delete model.dataset.sketchImageUrl;
    image.hidden = true;
    image.removeAttribute("src");
    if (!file) {
      status.textContent = "Your selected image stays in this browser tab.";
      return;
    }
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) {
      status.textContent = "Choose a PNG, JPEG, or WebP image smaller than 10 MB.";
      sketchInput.value = "";
      return;
    }
    sketchPreviewUrl = URL.createObjectURL(file);
    model.dataset.sketchImageUrl = sketchPreviewUrl;
    image.src = sketchPreviewUrl;
    image.hidden = false;
    loadInnovationSketchTexture(sketchPreviewUrl, model);
    status.textContent = `${file.name} is previewed locally. No AI conversion or upload was performed.`;
  });

  innovationTool.querySelector("#innovation-proposal-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const projectType = innovationTool.querySelector("#innovation-project-type").value;
    const location = innovationTool.querySelector("#innovation-project-location").value.trim() || "Not specified";
    const goal = innovationTool.querySelector("#innovation-project-goal").value.trim() || "To be discussed with the SAFA team.";
    const draft = [
      "SAFA CONSTRUCTION — Project discussion starter",
      "",
      `Project type: ${projectType}`,
      `Location: ${location}`,
      `Discussion priorities: ${goal}`,
      "",
      "Next step: review the project requirements, site conditions, design scope, approvals, materials, and schedule with the SAFA CONSTRUCTION team.",
      "",
      "This is a browser-generated discussion draft only, not an official proposal, quotation, approved design, or commitment. Any cost or scope must be confirmed by SAFA CONSTRUCTION after project review.",
    ].join("\n");
    const url = URL.createObjectURL(new Blob([draft], { type: "text/plain;charset=utf-8" }));
    const download = document.createElement("a");
    download.href = url;
    download.download = "safa-project-discussion-draft.txt";
    download.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    innovationTool.querySelector("#innovation-proposal-feedback").textContent = "Starter draft downloaded. It is not an official SAFA proposal or quotation.";
  });
  const featureModel = innovationTool.querySelector(".feature-model");
  if (featureModel) void startInnovation3D(featureModel);
};

document.querySelectorAll("[data-innovation-preview]").forEach((button) => {
  button.addEventListener("click", () => openInnovationPreview(button.dataset.innovationPreview, button));
});
document.querySelector("[data-open-safa-chat]")?.addEventListener("click", () => {
  document.querySelector("#safa-chat-toggle").click();
});
document.querySelector("#innovation-replay-intro")?.addEventListener("click", () => {
  document.querySelector("#replay-intro").click();
});
document.querySelector(".innovation-dialog-close").addEventListener("click", () => innovationDialog.close());
innovationDialog.addEventListener("close", () => {
  disposeInnovation3D();
  innovationDialogVisual.replaceChildren();
  if (sketchPreviewUrl) {
    URL.revokeObjectURL(sketchPreviewUrl);
    sketchPreviewUrl = "";
  }
});
innovationDialog.addEventListener("click", (event) => {
  if (event.target === innovationDialog) innovationDialog.close();
});
innovationDialogLink.addEventListener("click", () => innovationDialog.close());

const planningForm = document.querySelector("#planning-form");
const planningOutput = document.querySelector("#planning-result");
const planningEmpty = document.querySelector(".output-empty");
const addPlanningText = (parent, tagName, text, className) => {
  const element = document.createElement(tagName);
  element.textContent = text;
  if (className) element.className = className;
  parent.append(element);
  return element;
};
let planningBrief = "";
planningForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!planningForm.reportValidity()) return;
  const data = new FormData(planningForm);
  const plotArea = Number(data.get("plotArea"));
  const builtArea = Number(data.get("builtArea"));
  if (!Number.isFinite(plotArea) || plotArea < 300 || plotArea > 100000 ||
      !Number.isFinite(builtArea) || builtArea < 300 || builtArea > 50000) {
    planningForm.reportValidity();
    return;
  }

  const floors = Number(data.get("floors"));
  const bedrooms = Number(data.get("bedrooms"));
  const bathrooms = Number(data.get("bathrooms"));
  const style = data.get("style");
  const city = data.get("city") || "Not specified";
  const budgetLabels = {
    "under-30": "Under ₹30 lakh",
    "30-60": "₹30–60 lakh",
    "60-100": "₹60 lakh–₹1 crore",
    "over-100": "Over ₹1 crore",
    undecided: "Not decided yet",
  };
  const interests = [
    data.has("parking") ? "Parking" : "",
    data.has("outdoor") ? "Outdoor space" : "",
    data.has("workroom") ? "Work / study room" : "",
  ].filter(Boolean);
  const notes = data.get("notes") || "None provided";
  const averageFloorArea = Math.round(builtArea / floors);
  const lowEstimate = builtArea * SAMPLE_RATES.basic * (1 - SAMPLE_RATES.contingency);
  const highEstimate = builtArea * SAMPLE_RATES.luxury * (1 + SAMPLE_RATES.contingency);
  const planningPrompts = [
    `${bedrooms} bedroom${bedrooms === 1 ? "" : "s"} and ${bathrooms} bathroom${bathrooms === 1 ? "" : "s"} requested; discuss privacy and circulation with your architect.`,
    `${floors} floor${floors === 1 ? "" : "s"} across ${builtArea.toLocaleString("en-IN")} sq. ft. (about ${averageFloorArea.toLocaleString("en-IN")} sq. ft. per floor on average).`,
    interests.length ? `Priorities to discuss: ${interests.join(", ")}.` : "Decide whether parking or outdoor space should be a design priority.",
    "Ask a qualified professional to confirm local setbacks, site coverage, approvals, ventilation, and structural requirements.",
  ];
  planningBrief = [
    "SAFA CONSTRUCTION — Preliminary planning brief (demo mode; no AI connected)",
    `Plot area: ${plotArea.toLocaleString("en-IN")} sq. ft.`,
    `Desired built-up area: ${builtArea.toLocaleString("en-IN")} sq. ft.`,
    `Floors: ${floors}`,
    `Bedrooms: ${bedrooms}`,
    `Bathrooms: ${bathrooms}`,
    `Preferred style: ${style}`,
    `Approximate budget preference: ${budgetLabels[data.get("budget")]}`,
    `Location: ${city}`,
    `Priorities: ${interests.length ? interests.join(", ") : "Not specified"}`,
    `Special requirements: ${notes}`,
    "",
    "Discussion prompts:",
    ...planningPrompts.map((prompt) => `- ${prompt}`),
    "",
    `Very broad sample construction range: ${formatINR(lowEstimate)}–${formatINR(highEstimate)} before optional works. Sample assumptions only; not a SAFA quotation.`,
    "This brief is not AI-generated, an architectural design, engineering advice, or a construction drawing. Review with qualified professionals.",
  ].join("\n");

  planningEmpty.hidden = true;
  planningOutput.replaceChildren();
  planningOutput.hidden = false;
  planningOutput.classList.remove("planning-result-enter");
  requestAnimationFrame(() => planningOutput.classList.add("planning-result-enter"));
  addPlanningText(planningOutput, "span", "SAFA / PLAN 01", "output-index");
  addPlanningText(planningOutput, "h3", `${style} home · planning brief`);
  const summary = addPlanningText(planningOutput, "div", "", "output-list");
  addPlanningText(summary, "p", `Plot: ${plotArea.toLocaleString("en-IN")} sq. ft. · Built-up: ${builtArea.toLocaleString("en-IN")} sq. ft.`);
  addPlanningText(summary, "p", `${floors} floor${floors === 1 ? "" : "s"} · ${bedrooms} bedroom${bedrooms === 1 ? "" : "s"} · ${bathrooms} bathroom${bathrooms === 1 ? "" : "s"} · ${city}`);
  addPlanningText(planningOutput, "p", "Discussion prompts", "concept-tag");
  planningPrompts.forEach((prompt) => addPlanningText(planningOutput, "p", prompt));
  addPlanningText(planningOutput, "p", `Broad sample range: ${formatINR(lowEstimate)}–${formatINR(highEstimate)}. Not a quotation.`, "planning-budget");
  addPlanningText(planningOutput, "p", "Preliminary browser-only helper; not AI-generated, architect-approved, or construction-ready.", "planning-caveat");
  const actions = addPlanningText(planningOutput, "div", "", "planning-actions");
  const downloadButton = addPlanningText(actions, "button", "Download brief ↓", "text-link");
  downloadButton.type = "button";
  downloadButton.addEventListener("click", () => {
    const url = URL.createObjectURL(new Blob([planningBrief], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "safa-preliminary-planning-brief.txt";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  const enquiryLink = addPlanningText(actions, "a", "Add to enquiry ↗", "text-link");
  enquiryLink.href = "#contact";
  enquiryLink.addEventListener("click", () => {
    document.querySelector("#project-type").value = "Planning or interiors";
    document.querySelector("#contact-location").value = city === "Not specified" ? "" : city;
    document.querySelector("#requirements").value = planningBrief;
  });
});

const estimateForm = document.querySelector("#estimate-form");
const estimateResult = document.querySelector("#estimate-result");
const calculatorActions = document.querySelector("#calculator-actions");
let latestEstimate = null;

estimateForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!estimateForm.reportValidity()) return;
  const data = new FormData(estimateForm);
  const area = Number(data.get("area"));
  const houseType = data.get("houseType");
  const floors = Number(data.get("floors"));
  const quality = data.get("quality");
  if (!Number.isFinite(area) || area < 300 || area > 50000) {
    document.querySelector("#area").setCustomValidity("Enter an area between 300 and 50,000 square feet.");
    document.querySelector("#area").reportValidity();
    document.querySelector("#area").setCustomValidity("");
    return;
  }
  const baseRate = SAMPLE_RATES[quality];
  const baseCost = area * baseRate;
  const additions = [];
  if (data.has("interiors")) additions.push({ label: "Interiors (sample per sq. ft.)", amount: area * SAMPLE_RATES.addOns.interiors });
  if (data.has("kitchen")) additions.push({ label: "Modular kitchen (sample allowance)", amount: SAMPLE_RATES.addOns.kitchen });
  if (data.has("wall")) additions.push({ label: "Compound wall (sample allowance)", amount: SAMPLE_RATES.addOns.wall });
  if (data.has("landscaping")) additions.push({ label: "Landscaping (sample allowance)", amount: SAMPLE_RATES.addOns.landscaping });
  const addOnTotal = additions.reduce((total, item) => total + item.amount, 0);
  const subtotal = baseCost + addOnTotal;
  const contingency = subtotal * SAMPLE_RATES.contingency;
  const estimateTotal = subtotal + contingency;
  latestEstimate = { area, houseType, floors, quality, baseRate, baseCost, additions, subtotal, contingency, estimateTotal, location: data.get("location") || "Not specified" };
  const low = estimateTotal * 0.9;
  const high = estimateTotal * 1.1;
  const addParagraph = (text, className) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    if (className) paragraph.className = className;
    estimateResult.append(paragraph);
  };
  estimateResult.replaceChildren();
  const resultHeading = document.createElement("h3");
  resultHeading.textContent = "Illustrative budget range";
  estimateResult.append(resultHeading);
  addParagraph(`Construction (${area.toLocaleString("en-IN")} sq. ft. × ${formatINR(baseRate)}/sq. ft.): ${formatINR(baseCost)}`);
  additions.forEach((item) => addParagraph(`${item.label}: ${formatINR(item.amount)}`));
  addParagraph(`Indicative contingency (${Math.round(SAMPLE_RATES.contingency * 100)}%): ${formatINR(contingency)}`);
  addParagraph(`${formatINR(low)} – ${formatINR(high)}`, "result-total");
  const totalText = estimateResult.querySelector(".result-total");
  const totalStrong = document.createElement("strong");
  totalStrong.textContent = totalText.textContent;
  totalText.replaceChildren(totalStrong);
  addParagraph(`Midpoint: ${formatINR(estimateTotal)} · Indicative rate: ${formatINR(estimateTotal / area)}/sq. ft.`);
  addParagraph(`${houseType.replace("-", " ")} · ${floors} floor${floors === 1 ? "" : "s"} · ${quality[0].toUpperCase()}${quality.slice(1)} finish · ${latestEstimate.location}`);
  addParagraph("Sample only — not a quotation or guaranteed price.");
  estimateResult.hidden = false;
  calculatorActions.hidden = false;
  const whatsappEstimate = document.querySelector("#estimate-whatsapp");
  const whatsappNote = document.querySelector("#whatsapp-estimate-note");
  if (BUSINESS_CONTACT.whatsapp) {
    const message = `Hello SAFA CONSTRUCTION, I would like to discuss a ${houseType.replace("-", " ")} project. Built-up area: ${area} sq. ft.; floors: ${floors}; finish: ${quality}; illustrative range: ${formatINR(low)}–${formatINR(high)}. Location: ${latestEstimate.location}.`;
    whatsappEstimate.href = buildWhatsAppLink(message);
    whatsappEstimate.hidden = false;
    whatsappNote.hidden = true;
  }
});

document.querySelector("#print-estimate").addEventListener("click", () => window.print());
document.querySelector("#estimate-enquiry").addEventListener("click", () => {
  if (!latestEstimate) return;
  document.querySelector("#project-type").value = "New home";
  document.querySelector("#contact-location").value = latestEstimate.location === "Not specified" ? "" : latestEstimate.location;
  document.querySelector("#requirements").value = `Please discuss an illustrative construction estimate for ${latestEstimate.area} sq. ft., ${latestEstimate.floors} floor(s), ${latestEstimate.quality} finish. Sample range: ${formatINR(latestEstimate.estimateTotal * 0.9)}–${formatINR(latestEstimate.estimateTotal * 1.15)}.`;
});

const contactForm = document.querySelector("#contact-form");
const contactFeedback = document.querySelector("#contact-feedback");
const setFeedback = (message) => { contactFeedback.textContent = message; };

const contactLinks = {
  phone: document.querySelector('[data-contact-link="phone"]'),
  email: document.querySelector('[data-contact-link="email"]'),
  whatsapp: document.querySelector('[data-contact-link="whatsapp"]'),
};
if (BUSINESS_CONTACT.phone) {
  contactLinks.phone.href = `tel:${BUSINESS_CONTACT.phone.replace(/[^\d+]/g, "")}`;
  contactLinks.phone.querySelector("span").textContent = BUSINESS_CONTACT.phone;
  contactLinks.phone.classList.remove("is-unconfigured");
}
if (BUSINESS_CONTACT.email) {
  const subject = "Construction project enquiry";
  const body = [
    "Hello SAFA CONSTRUCTION,",
    "",
    "I would like to discuss a construction project.",
    "",
    "Name:",
    "Phone:",
    "Project type:",
    "Project location:",
    "Requirements:",
  ].join("\n");
  contactLinks.email.href = `mailto:${BUSINESS_CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  contactLinks.email.querySelector("span").textContent = BUSINESS_CONTACT.email;
  contactLinks.email.setAttribute("aria-label", `Email SAFA CONSTRUCTION at ${BUSINESS_CONTACT.email}`);
  contactLinks.email.classList.remove("is-unconfigured");
}
if (BUSINESS_CONTACT.whatsapp) {
  contactLinks.whatsapp.href = buildWhatsAppLink("Hello SAFA CONSTRUCTION, I would like to chat with your team about a construction project.");
  contactLinks.whatsapp.target = "_blank";
  contactLinks.whatsapp.rel = "noopener noreferrer";
  contactLinks.whatsapp.querySelector("span").textContent = "Chat with us";
  contactLinks.whatsapp.classList.remove("is-unconfigured");
}
Object.values(contactLinks).forEach((link) => link.addEventListener("click", (event) => {
  if (link.classList.contains("is-unconfigured")) {
    event.preventDefault();
    setFeedback("Company contact details are not configured yet. Add verified details in script.js.");
  }
}));

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;
  if (!BUSINESS_CONTACT.email) {
    setFeedback("Your details have not been sent or stored. Configure a verified company email in script.js, then try again.");
    return;
  }
  const data = new FormData(contactForm);
  const subject = encodeURIComponent(`SAFA CONSTRUCTION enquiry — ${data.get("projectType")}`);
  const body = encodeURIComponent([
    `Name: ${data.get("name")}`,
    `Phone: ${data.get("phone")}`,
    `Email: ${data.get("email") || "Not provided"}`,
    `Project type: ${data.get("projectType")}`,
    `Location: ${data.get("location") || "Not provided"}`,
    "",
    "Requirements:",
    data.get("requirements") || "Not provided",
  ].join("\n"));
  window.location.href = `mailto:${BUSINESS_CONTACT.email}?subject=${subject}&body=${body}`;
  setFeedback("Your email app should open with an enquiry draft. Send it there to contact SAFA CONSTRUCTION.");
});

const safaChatPanel = document.querySelector("#safa-chat-panel");
const safaChatToggle = document.querySelector("#safa-chat-toggle");
const safaChatClose = document.querySelector("#safa-chat-close");
const safaChatForm = document.querySelector("#safa-chat-form");
const safaChatInput = document.querySelector("#safa-chat-input");
const safaChatMessages = document.querySelector("#safa-chat-messages");
const safaChatSuggestions = document.querySelector("#safa-chat-suggestions");
const safaChatNotice = document.querySelector("#safa-chat-notice");
const safaChatLanguageSearch = document.querySelector("#safa-chat-language-search");
const safaChatLanguage = document.querySelector("#safa-chat-language");
const safaChatMic = document.querySelector("#safa-chat-mic");
const safaChatStatus = document.querySelector("#safa-chat-status");
const safaChatDock = document.querySelector(".safa-chat");
const CHAT_LANGUAGE_KEY = "safa-chat-language";
const CHAT_LANGUAGES = [
  ["auto", "Auto-detect", "Auto-detect"],
  ["en-IN", "English", "English"], ["ta-IN", "தமிழ்", "Tamil"],
  ["hi-IN", "हिन्दी", "Hindi"], ["ml-IN", "മലയാളം", "Malayalam"],
  ["te-IN", "తెలుగు", "Telugu"], ["kn-IN", "ಕನ್ನಡ", "Kannada"],
  ["ar-SA", "العربية", "Arabic"], ["es-ES", "Español", "Spanish"],
  ["fr-FR", "Français", "French"], ["de-DE", "Deutsch", "German"],
  ["zh-CN", "中文", "Chinese"], ["bn-IN", "বাংলা", "Bengali"],
  ["ur-PK", "اردو", "Urdu"], ["mr-IN", "मराठी", "Marathi"],
  ["ja-JP", "日本語", "Japanese"], ["pt-BR", "Português", "Portuguese"],
  ["it-IT", "Italiano", "Italian"], ["ko-KR", "한국어", "Korean"],
  ["ru-RU", "Русский", "Russian"], ["id-ID", "Bahasa Indonesia", "Indonesian"],
  ["th-TH", "ไทย", "Thai"], ["vi-VN", "Tiếng Việt", "Vietnamese"],
  ["tr-TR", "Türkçe", "Turkish"], ["nl-NL", "Nederlands", "Dutch"],
  ["pl-PL", "Polski", "Polish"], ["sv-SE", "Svenska", "Swedish"],
  ["fa-IR", "فارسی", "Persian"], ["ne-NP", "नेपाली", "Nepali"],
  ["si-LK", "සිංහල", "Sinhala"], ["pa-IN", "ਪੰਜਾਬੀ", "Punjabi"],
  ["gu-IN", "ગુજરાતી", "Gujarati"], ["or-IN", "ଓଡ଼ିଆ", "Odia"],
  ["as-IN", "অসমীয়া", "Assamese"],
];
let safaChatConversation = [];
let safaChatLastReply = "";
let safaChatRequestId = 0;

let initialChatLanguage = "en-IN";
try {
  const savedLanguage = window.sessionStorage.getItem(CHAT_LANGUAGE_KEY);
  if (CHAT_LANGUAGES.some(([code]) => code === savedLanguage)) initialChatLanguage = savedLanguage;
} catch (error) {
  console.warn("SAFA AI language preference could not be read; using English.", error);
}
CHAT_LANGUAGES.forEach(([code, nativeName, englishName]) => {
  const option = document.createElement("option");
  option.value = code;
  option.textContent = `${nativeName} · ${englishName}`;
  option.dataset.search = `${nativeName} ${englishName} ${code}`.toLocaleLowerCase();
  safaChatLanguage.append(option);
});
safaChatLanguage.value = initialChatLanguage;

const setSafaChatOpen = (open) => {
  safaChatPanel.hidden = !open;
  safaChatToggle.setAttribute("aria-expanded", String(open));
  if (open) {
    safaChatInput.focus();
  } else {
    safaChatToggle.focus();
  }
};

const addSafaChatMessage = (text, role, action) => {
  const message = document.createElement("div");
  message.className = `safa-chat-message ${role}`;
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  message.append(paragraph);
  if (action) {
    const link = document.createElement("a");
    link.className = "safa-chat-action";
    link.href = action.href;
    link.textContent = action.label;
    if (action.external) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    } else {
      link.addEventListener("click", () => setSafaChatOpen(false));
    }
    message.append(link);
  }
  safaChatMessages.append(message);
  safaChatMessages.scrollTop = safaChatMessages.scrollHeight;
};

const SAFA_COMMAND_REGISTRY = [
  {
    intent: "whatsapp",
    target: "whatsapp",
    patterns: [
      /\b(?:open|start|show|go to|take me to)\b.*\bwhats?app\b/i,
      /(?:வாட்ஸ்அப்|வாட்ஸ்அப்பில்).*(?:திற|செல்|தொடங்கு)|(?:திற|செல்).*(?:வாட்ஸ்அப்)/u,
      /(?:व्हाट्सऐप|व्हाट्सएप).*(?:खोल|दिखा|चलो|जाओ)|(?:खोल|चलो).*(?:व्हाट्सऐप|व्हाट्सएप)/u,
      /(?:വാട്സാപ്പ്|വാട്ട്സ്ആപ്പ്).*(?:തുറ|പോ|കാണി)|(?:തുറ|പോ).*(?:വാട്സാപ്പ്|വാട്ട്സ്ആപ്പ്)/u,
    ],
  },
  {
    intent: "home",
    target: "top",
    patterns: [
      /\b(?:open|show|go to|take me to|visit)\b.*\b(?:home|homepage|main page)\b/i,
      /(?:முகப்பு|முகப்புப் பக்கம்).*(?:திற|காட்டு|செல்)|(?:திற|காட்டு|செல்).*(?:முகப்பு)/u,
      /(?:होम|मुखपृष्ठ|मुख्य पेज).*(?:खोल|दिखा|ले चल)|(?:खोल|दिखा|ले चल).*(?:होम|मुखपृष्ठ)/u,
      /(?:ഹോം|പ്രധാന പേജ്|വീട്).*(?:തുറ|കാണി|കൊണ്ടുപോ)|(?:തുറ|കാണി|കൊണ്ടുപോ).*(?:ഹോം|പ്രധാന പേജ്)/u,
    ],
  },
  {
    intent: "projects",
    target: "projects",
    patterns: [
      /\b(?:show|open|view|go to|take me to|browse)\b.*\b(?:projects|portfolio|concepts)\b/i,
      /(?:திட்டங்கள்|ப்ராஜெக்ட்|கட்டிடங்கள்).*(?:காட்டு|திற|பார்)|(?:காட்டு|திற).*(?:திட்டங்கள்|ப்ராஜெக்ட்)/u,
      /(?:प्रोजेक्ट|परियोजना|प्रोजेक्ट्स).*(?:दिखा|खोल|देख)|(?:दिखा|खोल).*(?:प्रोजेक्ट|परियोजना)/u,
      /(?:പ്രോജക്ടുകൾ|പ്രോജക്ടുകള്‍|പ്രോജക്ട്|പദ്ധതികൾ|പദ്ധതികള്‍).*(?:കാണി|തുറ|കാണൂ)|(?:കാണി|തുറ).*(?:പ്രോജക്ടുകൾ|പ്രോജക്ടുകള്‍|പ്രോജക്ട്|പദ്ധതികൾ|പദ്ധതികള്‍)/u,
    ],
  },
  {
    intent: "designs",
    target: "house-studio",
    patterns: [
      /\b(?:open|show|view|go to|take me to)\b.*\b(?:house designs?|design studio|home designs?)\b/i,
      /(?:வீட்டு வடிவமைப்பு|வீட்டு டிசைன்|டிசைன் ஸ்டுடியோ).*(?:காட்டு|திற|பார்)|(?:காட்டு|திற).*(?:வீட்டு வடிவமைப்பு|வீட்டு டிசைன்)/u,
      /(?:घर का डिज़ाइन|घर का डिजाइन|हाउस डिज़ाइन|हाउस डिजाइन).*(?:दिखा|खोल|देख)|(?:दिखा|खोल).*(?:घर का डिज़ाइन|घर का डिजाइन)/u,
      /(?:വീടിന്റെ ഡിസൈൻ|വീട്ടു ഡിസൈൻ|ഡിസൈൻ സ്റ്റുഡിയോ).*(?:കാണി|തുറ|കാണൂ)|(?:കാണി|തുറ).*(?:വീടിന്റെ ഡിസൈൻ|വീട്ടു ഡിസൈൻ)/u,
    ],
  },
  {
    intent: "services",
    target: "services",
    patterns: [
      /\b(?:show|open|view|go to|take me to|list)\b.*\bservices\b/i,
      /(?:சேவைகள்|சேவை).*(?:காட்டு|திற|பார்)|(?:காட்டு|திற).*(?:சேவைகள்|சேவை)/u,
      /(?:सेवाएँ|सेवाएं|सेवा).*(?:दिखा|खोल|देख)|(?:दिखा|खोल).*(?:सेवाएँ|सेवाएं|सेवा)/u,
      /(?:സേവനങ്ങൾ|സേവനങ്ങള്‍|സേവനം).*(?:കാണി|തുറ|കാണൂ)|(?:കാണി|തുറ).*(?:സേവനങ്ങൾ|സേവനങ്ങള്‍|സേവനം)/u,
    ],
  },
  {
    intent: "estimate",
    target: "estimate",
    patterns: [
      /\b(?:open|show|go to|take me to|use|help me estimate|estimate)\b.*\b(?:cost|construction cost|budget|calculator|estimate)\b/i,
      /(?:செலவு|பட்ஜெட்|மதிப்பீடு).*(?:கணக்கி|காட்டு|திற|கணக்கிட)|(?:கணக்கி|காட்டு|திற).*(?:செலவு|பட்ஜெட்|மதிப்பீடு)/u,
      /(?:निर्माण लागत|खर्च|बजट|अनुमान).*(?:कैलकुलेटर|दिखा|खोल|गणना)|(?:कैलकुलेटर|दिखा|खोल).*(?:लागत|खर्च|बजट|अनुमान)/u,
      /(?:നിർമ്മാണ ചെലവ്|നിർമാണ ചെലവ്|ബജറ്റ്|ചെലവ്|എസ്റ്റിമേറ്റ്).*(?:കാൽക്കുലേറ്റർ|കാണി|തുറ|കണക്കാക്ക)|(?:കാൽക്കുലേറ്റർ|കാണി|തുറ).*(?:ചെലവ്|ബജറ്റ്|എസ്റ്റിമേറ്റ്)/u,
    ],
  },
  {
    intent: "contact",
    target: "contact",
    patterns: [
      /\b(?:contact|call|email|enquir(?:y|ies)|get in touch)\b.*\b(?:safa|team|construction|contact|us)?\b/i,
      /\b(?:open|show|go to|take me to)\b.*\bcontact\b/i,
      /(?:தொடர்பு|அழைப்பு|விசாரணை).*(?:திற|காட்டு|செல்)|(?:திற|காட்டு|செல்).*(?:தொடர்பு|அழைப்பு)/u,
      /(?:संपर्क|पूछताछ).*(?:दिखा|खोल|कर)|(?:दिखा|खोल).*(?:संपर्क)/u,
      /(?:ബന്ധപ്പെടുക|കോൺടാക്ട്|അന്വേഷണം).*(?:തുറ|കാണി|ചെയ്യ)|(?:തുറ|കാണി).*(?:ബന്ധപ്പെടുക|കോൺടാക്ട്)/u,
    ],
  },
  {
    intent: "planning",
    target: "planning-assistant",
    patterns: [
      /\b(?:open|show|go to|take me to)\b.*\b(?:planning|plan(?:ning)? assistant|home planner|plan your home)\b/i,
      /(?:வீட்டுத் திட்டம்|வீடு திட்டமிடல்|திட்டமிடல்).*(?:காட்டு|திற)|(?:காட்டு|திற).*(?:வீட்டுத் திட்டம்|திட்டமிடல்)/u,
      /(?:घर की योजना|घर का प्लान|प्लानिंग).*(?:दिखा|खोल)|(?:दिखा|खोल).*(?:घर की योजना|घर का प्लान)/u,
      /(?:വീട് പ്ലാൻ|വീട്ടുപദ്ധതി|പ്ലാനിംഗ്).*(?:കാണി|തുറ)|(?:കാണി|തുറ).*(?:വീട് പ്ലാൻ|വീട്ടുപദ്ധതി)/u,
    ],
  },
];

const SAFA_COMMAND_MESSAGES = {
  en: {
    home: "Opening the home page.",
    projects: "Opening the projects and concepts.",
    designs: "Opening the house design studio.",
    services: "Opening SAFA's services.",
    estimate: "Opening the sample construction cost calculator. Its result is preliminary, not a quote.",
    contact: "Opening SAFA CONSTRUCTION contact options.",
    planning: "Opening the preliminary home planning brief.",
    whatsapp: "Here is the configured WhatsApp enquiry link.",
    stopped: "Voice playback stopped.",
    repeated: "Repeating the previous answer.",
    changed: (language) => `Conversation language changed to ${language}.`,
    unclear: "I couldn't identify that website destination. Please name Home, Projects, House designs, Services, Cost estimate, Planning, Contact, or WhatsApp.",
  },
  ta: {
    home: "முகப்புப் பக்கத்தைத் திறக்கிறேன்.",
    projects: "திட்டங்கள் மற்றும் வடிவமைப்புகளைத் திறக்கிறேன்.",
    designs: "வீட்டு வடிவமைப்பு ஸ்டுடியோவைத் திறக்கிறேன்.",
    services: "SAFA சேவைகளைத் திறக்கிறேன்.",
    estimate: "மாதிரி கட்டுமானச் செலவு கணக்கைத் திறக்கிறேன். இது ஆரம்ப மதிப்பீடு மட்டுமே; quotation அல்ல.",
    contact: "SAFA CONSTRUCTION தொடர்பு விவரங்களைத் திறக்கிறேன்.",
    planning: "ஆரம்பநிலை வீட்டு திட்டமிடல் brief-ஐத் திறக்கிறேன்.",
    whatsapp: "WhatsApp விசாரணைக்கான இணைப்பு இதோ.",
    stopped: "குரல் பதில் நிறுத்தப்பட்டது.",
    repeated: "முந்தைய பதிலை மீண்டும் சொல்கிறேன்.",
    changed: (language) => `உரையாடல் மொழி ${language} ஆக மாற்றப்பட்டது.`,
    unclear: "எந்தப் பகுதியைத் திறக்க வேண்டும் என்று புரியவில்லை. முகப்பு, திட்டங்கள், வீட்டு வடிவமைப்பு, சேவைகள், செலவு கணக்கு, திட்டமிடல், தொடர்பு அல்லது WhatsApp என்று சொல்லுங்கள்.",
  },
  hi: {
    home: "मुखपृष्ठ खोल रहा हूँ।",
    projects: "प्रोजेक्ट और डिज़ाइन खोल रहा हूँ।",
    designs: "घर का डिज़ाइन स्टूडियो खोल रहा हूँ।",
    services: "SAFA की सेवाएँ खोल रहा हूँ।",
    estimate: "निर्माण लागत का नमूना कैलकुलेटर खोल रहा हूँ। यह शुरुआती अनुमान है, कोटेशन नहीं।",
    contact: "SAFA CONSTRUCTION के संपर्क विकल्प खोल रहा हूँ।",
    planning: "घर की शुरुआती योजना वाला brief खोल रहा हूँ।",
    whatsapp: "WhatsApp पूछताछ का लिंक यहाँ है।",
    stopped: "आवाज़ में जवाब देना रोक दिया गया है।",
    repeated: "पिछला जवाब फिर से बोल रहा हूँ।",
    changed: (language) => `बातचीत की भाषा ${language} कर दी गई है।`,
    unclear: "मुझे वेबसाइट का वह भाग समझ नहीं आया। कृपया मुखपृष्ठ, प्रोजेक्ट, घर का डिज़ाइन, सेवाएँ, लागत, योजना, संपर्क या WhatsApp कहें।",
  },
  ml: {
    home: "ഹോം പേജ് തുറക്കുന്നു.",
    projects: "പ്രോജക്ടുകളും ഡിസൈനുകളും തുറക്കുന്നു.",
    designs: "ഹോം ഡിസൈൻ സ്റ്റുഡിയോ തുറക്കുന്നു.",
    services: "SAFA സേവനങ്ങൾ തുറക്കുന്നു.",
    estimate: "നിർമ്മാണ ചെലവിന്റെ മാതൃകാ കാൽക്കുലേറ്റർ തുറക്കുന്നു. ഇത് പ്രാഥമിക കണക്കാണ്, ക്വട്ടേഷൻ അല്ല.",
    contact: "SAFA CONSTRUCTION ബന്ധപ്പെടാനുള്ള വിവരങ്ങൾ തുറക്കുന്നു.",
    planning: "പ്രാഥമിക ഹോം പ്ലാനിംഗ് brief തുറക്കുന്നു.",
    whatsapp: "WhatsApp അന്വേഷണത്തിനുള്ള ലിങ്ക് ഇതാ.",
    stopped: "ശബ്ദ മറുപടി നിർത്തി.",
    repeated: "മുൻ മറുപടി വീണ്ടും പറയാം.",
    changed: (language) => `സംഭാഷണ ഭാഷ ${language} ആക്കി മാറ്റി.`,
    unclear: "ഏത് വെബ്സൈറ്റ് ഭാഗമാണ് തുറക്കേണ്ടതെന്ന് മനസ്സിലായില്ല. ഹോം, പ്രോജക്ടുകൾ, ഹൗസ് ഡിസൈൻ, സേവനങ്ങൾ, ചെലവ്, പ്ലാനിംഗ്, കോൺടാക്റ്റ്, അല്ലെങ്കിൽ WhatsApp എന്ന് പറയൂ.",
  },
};

const commandMessage = (key) => {
  const language = safaChatLanguage.value.slice(0, 2);
  const messages = SAFA_COMMAND_MESSAGES[language] || SAFA_COMMAND_MESSAGES.en;
  return messages[key] || SAFA_COMMAND_MESSAGES.en[key];
};

const resolveSafaCommand = (message) => {
  const query = message.trim().toLocaleLowerCase();
  if (/^(?:stop speaking|stop voice|stop talking)$/i.test(query)
    || /(?:பேசுவதை நிறுத்து|குரலை நிறுத்து)/u.test(query)
    || /(?:बोलना बंद|आवाज़ बंद)/u.test(query)
    || /(?:സംസാരം നിർത്തൂ|ശബ്ദം നിർത്തൂ)/u.test(query)) {
    return { intent: "stop" };
  }
  if (/^(?:repeat|repeat your answer|say that again|repeat that)$/i.test(query)
    || /(?:மீண்டும் சொல்லு|பதில் மீண்டும்)/u.test(query)
    || /(?:फिर से बोलो|जवाब दोहराओ)/u.test(query)
    || /(?:വീണ്ടും പറയൂ|ഉത്തരം ആവർത്തിക്കൂ)/u.test(query)) {
    return { intent: "repeat" };
  }
  if (/^(?:close|close the assistant|close assistant|dismiss)$/i.test(query)
    || /(?:உதவியாளரை மூடு|மூடு)/u.test(query)
    || /(?:सहायक बंद|बंद करो)/u.test(query)
    || /(?:അസിസ്റ്റന്റ് അടയ്ക്കൂ|അടയ്ക്കൂ)/u.test(query)) {
    return { intent: "close" };
  }

  const languageCommand = /\b(?:switch|change|set|speak|talk|reply)\b|(?:மொழி.*(?:மாற்று|பேசு)|தமிழில் பேசு(?:ங்கள்)?|தமிழுக்கு மாறு|ஆங்கிலத்தில் பேசு(?:ங்கள்)?)|(?:भाषा.*(?:बदल|बोल)|(?:तमिल|हिंदी|हिन्दी|अंग्रेज़ी|अंग्रेजी) में बोलो)|(?:ഭാഷ.*(?:മാറ്റൂ|പറയൂ)|(?:തമിഴിൽ|മലയാളത്തിൽ|ഇംഗ്ലീഷിൽ) സംസാരിക്കൂ)/iu.test(query);
  if (languageCommand) {
    const aliases = [
      ["en-IN", /\b(?:english|անգ्रेज़ी|अंग्रेजी)\b|ஆங்கிலம்|ஆங்கிலத்தில்|ഇംഗ്ലീഷ്|ഇംഗ്ലീഷിൽ/u],
      ["ta-IN", /\b(?:tamil|தமிழ்)\b|தமிழில்|தமிழுக்கு|तमिल/u],
      ["hi-IN", /\b(?:hindi|हिंदी)\b|हिन्दी में|हिंदी में/u],
      ["ml-IN", /\b(?:malayalam|മലയാളം)\b|മലയാളത്തിൽ/u],
      ["te-IN", /\b(?:telugu|తెలుగు)\b/u],
      ["kn-IN", /\b(?:kannada|ಕನ್ನಡ)\b/u],
      ["bn-IN", /\b(?:bengali|বাংলা)\b/u],
      ["mr-IN", /\b(?:marathi|मराठी)\b/u],
      ["ur-PK", /\b(?:urdu|اردو)\b/u],
      ["ar-SA", /\b(?:arabic|العربية|عربي)\b/u],
      ["es-ES", /\b(?:spanish|español)\b/u],
      ["fr-FR", /\b(?:french|français)\b/u],
      ["de-DE", /\b(?:german|deutsch)\b/u],
      ["zh-CN", /\b(?:chinese|中文)\b/u],
    ];
    const language = aliases.find(([, pattern]) => pattern.test(query));
    if (language) return { intent: "language", languageCode: language[0] };
  }

  const command = SAFA_COMMAND_REGISTRY.find((entry) =>
    entry.patterns.some((pattern) => pattern.test(query))
  );
  if (command) return command;

  const navigationIntent = /\b(?:open|show|go to|take me to|navigate to|visit)\b|(?:திற|காட்டு|செல்|போ)|(?:खोल|दिखा|ले चल|जाओ)|(?:തുറ|കാണി|കൊണ്ടുപോ|പോ)/iu.test(query);
  if (navigationIntent && /\b(?:page|section|website|screen)\b|பக்கம்|பகுதி|पेज|पृष्ठ|വിഭാഗം|പേജ്/iu.test(query)) {
    return { intent: "unclear" };
  }
  return null;
};

const executeSafaCommand = (command) => {
  if (command.intent === "stop") {
    setSafaChatVoiceStatus("SAFA AI replies are displayed as text; there is no audio to stop.", "success");
    return;
  }
  if (command.intent === "repeat") {
    if (safaChatLastReply) {
      addSafaChatMessage(safaChatLastReply, "assistant");
      setSafaChatVoiceStatus(commandMessage("repeated"), "success");
    } else {
      setSafaChatVoiceStatus("There is no previous answer to repeat.", "ready");
    }
    return;
  }
  if (command.intent === "close") {
    setSafaChatOpen(false);
    return;
  }
  if (command.intent === "language") {
    safaChatLanguage.value = command.languageCode;
    updateSafaChatLanguage();
    const [, languageName] = currentChatLanguage();
    addSafaChatMessage(commandMessage("changed")(languageName), "assistant");
    setSafaChatVoiceStatus(commandMessage("changed")(languageName), "success");
    return;
  }
  if (command.intent === "unclear") {
    addSafaChatMessage(commandMessage("unclear"), "assistant");
    setSafaChatVoiceStatus("Please repeat the command and name a section.", "ready");
    return;
  }
  const target = command.target === "whatsapp"
    ? null
    : document.getElementById(command.target);
  if (target) {
    window.location.hash = command.target;
    target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  const action = command.intent === "whatsapp" && BUSINESS_CONTACT.whatsapp
    ? { href: buildWhatsAppLink("Hello SAFA CONSTRUCTION, I would like to chat with your team about a construction project."), label: "Open WhatsApp enquiry", external: true }
    : undefined;
  addSafaChatMessage(commandMessage(command.intent), "assistant", action);
  setSafaChatVoiceStatus(commandMessage(command.intent), "success");
  window.setTimeout(() => {
    if (safaChatDock.dataset.voiceState === "success") setSafaChatVoiceStatus("Command completed.", "ready");
  }, 1400);
};

const getSafaChatReply = (message) => {
  const query = message.toLocaleLowerCase();
  const tamilQuery = safaChatLanguage.value === "ta-IN" || /[\u0B80-\u0BFF]/.test(message);
  const tamil = (english, translated) => tamilQuery ? translated : english;

  if (/contact|phone|call|email|whatsapp|number|thodarbu|alaippu|மொபைல்|தொலைபேசி|தொடர்பு|வாட்ஸ்அப்|எண்/.test(query)) {
    return {
      text: tamil(
        "Use the Contact section to call or WhatsApp SAFA, or prepare an enquiry email on your device. The form opens a draft; it does not send or store your details.",
        "SAFA-வை அழைக்க அல்லது WhatsApp செய்ய Contact பகுதியில் உள்ள விவரங்களைப் பயன்படுத்துங்கள். Enquiry form உங்கள் சாதனத்தில் email draft-ஐத் தயாரிக்கும்; விவரங்களை அனுப்பவோ சேமிக்கவோ செய்யாது."
      ),
      action: { href: "#contact", label: tamil("Go to contact options", "Contact விவரங்களுக்குச் செல்லுங்கள்") },
    };
  }
  if (/cost|price|budget|rate|estimate|selavu|vilai|பட்ஜெட்|செலவு|விலை|மதிப்பீடு/.test(query)) {
    return {
      text: tamil(
        "Try the sample cost estimator with your built-up area, building type, floors, finish level, and location. Its range uses illustrative rates only; it is not a quote.",
        "Built-up area, building type, floors, finish level, location ஆகியவற்றை Cost Estimate-ல் கொடுத்து sample கணக்கைப் பாருங்கள். இது மாதிரி rate மட்டுமே; quotation அல்ல."
      ),
      action: { href: "#estimate", label: tamil("Open sample cost estimator", "Sample செலவு கணக்கைத் திறக்க") },
    };
  }
  if (/service|construction|villa|duplex|renovat|interior|civil|consult|sakkimanggulam|karuppayuruni|சேவை|கட்டுமானம்|வீடு|வில்லா/.test(query)) {
    return {
      text: tamil(
        "SAFA's listed services include home construction, villas and duplexes, architectural planning, interiors, renovation, turnkey construction, civil works, and project consultation. Ask SAFA to confirm availability for your location.",
        "SAFA வழங்கும் சேவைகளில் வீடு கட்டுதல், villa/duplex, architectural planning, interiors, renovation, turnkey construction, civil works, consultation ஆகியவை உள்ளன. உங்கள் இடத்திற்கான சேவை கிடைப்பதை SAFA-விடம் உறுதிப்படுத்துங்கள்."
      ),
      action: { href: "#services", label: tamil("Explore services", "சேவைகளைப் பாருங்கள்") },
    };
  }
  if (/family|household|kudumbam|குடும்பம்|20\s*(people|person|members|பேர்|நபர்)/.test(query)) {
    return {
      text: tamil(
        "For a family of 20, note the bedroom needs, shared and private spaces, accessibility, floors, and plot area in the planning brief. It supports up to 5 bedrooms, so add any larger-household details under Special requirements and review them with a qualified architect. This is preliminary guidance, not a floor plan.",
        "20 பேர் கொண்ட குடும்பத்திற்காக bedroom தேவைகள், பொதுவான/தனிப்பட்ட இடங்கள், accessibility, floors, plot area ஆகியவற்றை planning brief-ல் குறிப்பிடுங்கள். அதில் அதிகபட்சம் 5 bedrooms மட்டுமே உள்ளன; அதற்கு மேலான குடும்பத் தேவைகளை Special requirements-ல் எழுதி, qualified architect-உடன் ஆலோசிக்கவும். இது ஆரம்ப வழிகாட்டல் மட்டுமே; floor plan அல்ல."
      ),
      action: { href: "#planning-assistant", label: tamil("Open home planning brief", "வீட்டுத் திட்ட brief-ஐத் திறக்க") },
    };
  }
  if (/plan|design|bedroom|plot|floor|room|architect|layout|திட்டம்|வடிவமைப்பு|அறை|ப்ளாட்/.test(query)) {
    return {
      text: tamil(
        "The planning brief can organize plot and built-up areas, floors, bedrooms, bathrooms, preferred style, budget, and priorities. It is a preliminary browser tool, not an approved architectural or structural plan.",
        "Planning brief-ல் plot/built-up area, floors, bedrooms, bathrooms, style, budget, தேவைகள் ஆகியவற்றைத் தொகுக்கலாம். இது ஆரம்பநிலை browser கருவி மட்டுமே; அங்கீகரிக்கப்பட்ட architectural அல்லது structural plan அல்ல."
      ),
      action: { href: "#planning-assistant", label: tamil("Open home planning brief", "வீட்டுத் திட்ட brief-ஐத் திறக்க") },
    };
  }
  if (/hello|hi\b|hey\b|vanakkam|வணக்கம்|ஹலோ/.test(query)) {
    return {
      text: tamil(
        "Vanakkam! I can point you to services, a sample budget, the home planning brief, or SAFA's contact options.",
        "வணக்கம்! சேவைகள், sample budget, வீட்டுத் திட்ட brief அல்லது SAFA contact விவரங்களுக்கு வழிகாட்டுகிறேன்."
      ),
    };
  }
  return {
    text: tamil(
      "I can help with services, a sample cost estimate, the home planning brief, or contact options. Choose one of the suggestions below, or ask about one of those topics.",
      "சேவைகள், sample செலவு கணக்கு, வீட்டுத் திட்ட brief அல்லது contact விவரங்களில் உதவ முடியும். கீழே உள்ள பரிந்துரையைத் தேர்வு செய்யுங்கள் அல்லது அவற்றில் ஒன்றைப் பற்றிக் கேளுங்கள்."
    ),
  };
};

const setSafaChatVoiceStatus = (message, state = "ready") => {
  safaChatStatus.textContent = message;
  safaChatStatus.dataset.state = state;
  safaChatDock.dataset.voiceState = state;
};

const currentChatLanguage = () =>
  CHAT_LANGUAGES.find(([code]) => code === safaChatLanguage.value) || CHAT_LANGUAGES[0];

const isAutoChatLanguage = () => safaChatLanguage.value === "auto";

const syncSafaChatVoiceControls = () => {
  safaChatMic.disabled = !Recognition || safaChatInput.disabled || isAutoChatLanguage();
  const micLabel = safaChatListening ? "Stop mic" : safaChatRecognitionFailed ? "Retry mic" : "Start mic";
  safaChatMic.setAttribute("aria-pressed", String(safaChatListening));
  safaChatMic.setAttribute("aria-label", safaChatListening ? "Stop voice recognition" : safaChatRecognitionFailed ? "Retry voice recognition" : "Start voice recognition");
  safaChatMic.querySelector(".safa-mic-label").textContent = micLabel;
  safaChatMic.classList.toggle("is-active", safaChatListening);
  safaChatSpeakToggle.setAttribute("aria-pressed", String(safaChatVoiceReplies));
  safaChatSpeakToggle.textContent = safaChatVoiceReplies ? "Voice replies on" : "Voice replies off";
  safaChatSpeakToggle.classList.toggle("is-active", safaChatVoiceReplies);
  const browserSpeaking = Boolean(browserVoices?.speaking && !browserVoices?.paused);
  const cloudPlaying = Boolean(safaChatCloudAudio && !safaChatCloudAudio.paused && !safaChatCloudAudio.ended);
  const audioPaused = Boolean(safaChatCloudAudio?.paused && safaChatCloudAudio.currentTime > 0 && !safaChatCloudAudio.ended);
  safaChatPause.disabled = !browserSpeaking && !cloudPlaying;
  safaChatResume.disabled = !browserVoices?.paused && !audioPaused;
  safaChatStop.disabled = !browserSpeaking && !safaChatIsSpeaking && !browserVoices?.paused && !audioPaused;
};

const updateSafaChatLanguage = () => {
  const [languageCode, nativeName] = currentChatLanguage();
  const rightToLeft = languageCode.startsWith("ar") || languageCode.startsWith("ur");
  safaChatPanel.dir = rightToLeft ? "rtl" : "ltr";
  safaChatInput.dir = rightToLeft ? "rtl" : "auto";
  safaChatLanguageSearch.dir = "auto";
  try {
    window.sessionStorage.setItem(CHAT_LANGUAGE_KEY, languageCode);
  } catch (error) {
    console.warn("SAFA AI language preference could not be saved for this session.", error);
  }
  safaChatLastReply = "";
  setSafaChatVoiceStatus(`${nativeName} selected · type your question to chat with SAFA AI.`, "ready");
  safaChatNotice.textContent = window.location.protocol === "file:"
    ? "Website guide only · deploy to enable AI replies. SAFA AI chat is text-only."
    : "SAFA AI replies in text. Secure AI responses depend on server-side provider configuration.";
  if (isAutoChatLanguage()) {
    setSafaChatVoiceStatus(
      window.location.protocol === "file:"
        ? "Automatic language detection requires deploying and configuring SAFA AI."
        : "Automatic language detection uses configured SAFA AI for typed messages.",
      "ready"
    );
  }
};

const updateSafaChatVoices = async () => {
  const requestId = ++safaChatVoiceRequestId;
  const selectedCode = safaChatLanguage.value;
  if (selectedCode === "auto") {
    safaChatVoice.replaceChildren(new Option("Select a language for voice output", ""));
    safaChatVoice.disabled = true;
    return false;
  }
  const systemVoices = browserVoices?.getVoices() || [];
  const matchingSystemVoices = systemVoices.filter((voice) =>
    voice.lang.toLowerCase().startsWith(selectedCode.slice(0, 2).toLowerCase())
  );
  const selectedVoice = safaChatVoice.value;
  safaChatVoice.replaceChildren();
  if (matchingSystemVoices.length) {
    const systemGroup = document.createElement("optgroup");
    systemGroup.label = "Installed on this device";
    matchingSystemVoices.forEach((voice) => {
      const option = document.createElement("option");
      option.value = `browser:${voice.voiceURI}`;
      option.textContent = `${voice.name} · ${voice.lang}${voice.default ? " · default" : ""}`;
      systemGroup.append(option);
    });
    safaChatVoice.append(systemGroup);
  }
  let cloudVoices = [];
  if (window.location.protocol !== "file:") {
    try {
      const response = await fetch(`/api/speech?languageCode=${encodeURIComponent(selectedCode)}`, { cache: "no-store" });
      const result = await response.json();
      if (requestId !== safaChatVoiceRequestId || selectedCode !== safaChatLanguage.value) return;
      if (response.ok && Array.isArray(result.voices)) cloudVoices = result.voices;
      else if (response.status !== 503) {
        setSafaChatVoiceStatus(result.error || "Cloud voices could not be loaded. Installed voices remain available.", "error");
      }
    } catch (error) {
      if (requestId !== safaChatVoiceRequestId) return;
      console.warn("SAFA AI cloud voices could not be loaded.", error);
    }
  }
  if (cloudVoices.length) {
    const cloudGroup = document.createElement("optgroup");
    cloudGroup.label = `Cloud voices · ${currentChatLanguage()[1]}`;
    cloudVoices.sort((left, right) => {
      const score = (voice) =>
        (voice.gender === "FEMALE" ? 4 : voice.gender === "NEUTRAL" ? 2 : 0)
        + (/Neural2|Chirp3-HD|Wavenet/.test(voice.name) ? 1 : 0);
      return score(right) - score(left);
    });
    cloudVoices.forEach((voice) => {
      const option = document.createElement("option");
      option.value = `cloud:${voice.name}`;
      option.dataset.languageCode = voice.languageCode || selectedCode;
      option.textContent = `${voice.name} · ${voice.languageCode || selectedCode} · ${(voice.gender || "voice").toLowerCase()}`;
      cloudGroup.append(option);
    });
    safaChatVoice.append(cloudGroup);
  }
  const choices = [...matchingSystemVoices.map((voice) => `browser:${voice.voiceURI}`), ...cloudVoices.map((voice) => `cloud:${voice.name}`)];
  safaChatVoice.disabled = choices.length === 0;
  safaChatVoice.value = choices.includes(selectedVoice)
    ? selectedVoice
    : cloudVoices.length
      ? `cloud:${cloudVoices[0].name}`
      : choices[0] || "";
  if (requestId !== safaChatVoiceRequestId) return;
  if (!choices.length && safaChatVoiceReplies) {
    setSafaChatVoiceStatus(
      `No voice is available for ${currentChatLanguage()[1]}. Enable Google Cloud Text-to-Speech in Vercel or choose a supported language.`,
      "error"
    );
  } else if (!choices.length) {
    setSafaChatVoiceStatus(
      `No voice found for ${currentChatLanguage()[1]}. Configure Google Cloud Text-to-Speech or type your message.`,
      "ready"
    );
  } else if (!matchingSystemVoices.length && !cloudVoices.length && window.location.protocol === "file:") {
    setSafaChatVoiceStatus("Cloud voice options load after deployment; no matching voice is installed on this device.", "ready");
  } else {
    setSafaChatVoiceStatus(`Voice replies are off · ${currentChatLanguage()[1]} voice available when you enable them.`, "ready");
  }
  return choices.length > 0;
};

const stopSafaChatSpeech = () => {
  safaChatSpeechRequestId += 1;
  browserVoices?.cancel();
  if (safaChatCloudAudio) {
    safaChatCloudAudio.onplay = null;
    safaChatCloudAudio.onpause = null;
    safaChatCloudAudio.onended = null;
    safaChatCloudAudio.onerror = null;
    safaChatCloudAudio.pause();
    safaChatCloudAudio.currentTime = 0;
  }
  if (safaChatCloudAudioUrl) URL.revokeObjectURL(safaChatCloudAudioUrl);
  safaChatCloudAudio = null;
  safaChatCloudAudioUrl = null;
  safaChatIsSpeaking = false;
};

const speakWithBrowserVoice = (text, voice) => {
  if (!browserVoices || typeof SpeechSynthesisUtterance === "undefined") {
    setSafaChatVoiceStatus("No matching browser voice. Configure cloud voice or read the reply on screen.", "error");
    return;
  }
  const [languageCode, languageName] = currentChatLanguage();
  if (!voice) {
    setSafaChatVoiceStatus(`No installed speech voice was found for ${languageName}. Configure Google Cloud Text-to-Speech or read the reply on screen.`, "error");
    return;
  }
  browserVoices.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = languageCode;
  utterance.voice = voice;
  utterance.onstart = () => {
    safaChatIsSpeaking = true;
    setSafaChatVoiceStatus(`Speaking in ${languageName}. Use pause, resume, or stop to control playback.`, "speaking");
  };
  utterance.onend = () => {
    safaChatIsSpeaking = false;
    setSafaChatVoiceStatus(safaChatVoiceReplies ? `Voice replies are on · ${languageName}.` : "Voice replies are off.", "ready");
    syncSafaChatVoiceControls();
  };
  utterance.onerror = (event) => {
    safaChatIsSpeaking = false;
    setSafaChatVoiceStatus(`Voice playback failed (${event.error}). You can still read the reply.`, "error");
    syncSafaChatVoiceControls();
  };
  browserVoices.speak(utterance);
};

const speakWithCloudVoice = async (text, voiceName, voiceLanguageCode, requestId) => {
  const [, languageName] = currentChatLanguage();
  const response = await fetch("/api/speech", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: text.slice(0, 1800), languageCode: voiceLanguageCode, voiceName }),
  });
  if (!response.ok) {
    let message = "";
    try {
      const payload = await response.json();
      message = typeof payload.error === "string" ? payload.error : "";
    } catch (error) {
      console.warn("Cloud voice returned an unreadable error response.", error);
    }
    throw new Error(message || "Cloud voice is unavailable for this language.");
  }
  const blob = await response.blob();
  if (!blob.size) throw new Error("Cloud voice returned no audio.");
  if (requestId !== safaChatSpeechRequestId) return;
  safaChatCloudAudioUrl = URL.createObjectURL(blob);
  safaChatCloudAudio = new Audio(safaChatCloudAudioUrl);
  safaChatCloudAudio.onplay = () => {
    safaChatIsSpeaking = true;
    setSafaChatVoiceStatus(`Speaking with an AI-generated ${languageName} voice.`, "speaking");
    syncSafaChatVoiceControls();
  };
  safaChatCloudAudio.onpause = () => {
    safaChatIsSpeaking = false;
    syncSafaChatVoiceControls();
  };
  safaChatCloudAudio.onended = () => {
    safaChatIsSpeaking = false;
    setSafaChatVoiceStatus(`Voice reply finished · ${languageName}.`, "ready");
    syncSafaChatVoiceControls();
    if (safaChatCloudAudioUrl) URL.revokeObjectURL(safaChatCloudAudioUrl);
    safaChatCloudAudio = null;
    safaChatCloudAudioUrl = null;
  };
  safaChatCloudAudio.onerror = () => {
    safaChatIsSpeaking = false;
    setSafaChatVoiceStatus("Cloud audio could not be played. Check the browser's audio permission.", "error");
    syncSafaChatVoiceControls();
    if (safaChatCloudAudioUrl) URL.revokeObjectURL(safaChatCloudAudioUrl);
    safaChatCloudAudio = null;
    safaChatCloudAudioUrl = null;
  };
  try {
    await safaChatCloudAudio.play();
  } catch (error) {
    if (requestId !== safaChatSpeechRequestId) return;
    if (safaChatCloudAudioUrl) URL.revokeObjectURL(safaChatCloudAudioUrl);
    safaChatCloudAudio = null;
    safaChatCloudAudioUrl = null;
    setSafaChatVoiceStatus("Tap Voice replies on again to allow audio playback in this browser.", "error");
    syncSafaChatVoiceControls();
    throw error;
  }
};

const speakSafaChatReply = async (text) => {
  if (safaChatPanel.hidden || !safaChatVoiceReplies || !text) return;
  if (isAutoChatLanguage()) {
    setSafaChatVoiceStatus("Choose a specific language to select a matching voice. The reply remains available as text.", "error");
    return;
  }
  stopSafaChatSpeech();
  const requestId = safaChatSpeechRequestId;
  const selection = safaChatVoice.value;
  if (selection.startsWith("cloud:")) {
    try {
      const voiceLanguageCode = safaChatVoice.selectedOptions[0]?.dataset.languageCode || currentChatLanguage()[0];
      await speakWithCloudVoice(text, selection.slice("cloud:".length), voiceLanguageCode, requestId);
    } catch (error) {
      if (requestId !== safaChatSpeechRequestId) return;
      console.warn("SAFA AI cloud voice playback failed.", error);
      setSafaChatVoiceStatus(`${error.message} You can read the reply or choose another voice.`, "error");
    }
    return;
  }
  if (selection.startsWith("browser:")) {
    const voiceUri = selection.slice("browser:".length);
    const voice = browserVoices?.getVoices().find((item) => item.voiceURI === voiceUri);
    speakWithBrowserVoice(text, voice);
    return;
  }
  const languageCode = currentChatLanguage()[0];
  const voice = browserVoices?.getVoices().find((item) =>
    item.lang.toLowerCase().startsWith(languageCode.slice(0, 2).toLowerCase())
  );
  speakWithBrowserVoice(text, voice);
};

const getLocalSafaChatReply = (message) => {
  if (isAutoChatLanguage()) {
    return { text: "Automatic language detection needs the deployed SAFA AI service. Choose a specific language or deploy the secure AI endpoint." };
  }
  if (!["en-IN", "ta-IN"].includes(safaChatLanguage.value)) {
    return {
      text: `The local website guide currently replies in English and Tamil. For ${currentChatLanguage()[1]}, configure the secure SAFA AI service. You can continue using text chat in the meantime.`,
    };
  }
  return getSafaChatReply(message);
};

const requestSafaChatReply = async (message) => {
  if (window.location.protocol === "file:") {
    safaChatNotice.textContent = "Website guide only · deploy to Vercel and set OPENAI_API_KEY for AI replies. Avoid sensitive details.";
    return getLocalSafaChatReply(message);
  }
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        languageCode: safaChatLanguage.value,
        history: safaChatConversation.slice(-10),
      }),
    });
    if (!response.ok) {
      let detail = "";
      try {
        const payload = await response.json();
        detail = typeof payload.error === "string" ? payload.error : "";
      } catch (error) {
        console.warn("SAFA AI returned an unreadable error response.", error);
      }
      safaChatNotice.textContent = detail || "Secure AI is unavailable · showing the website guide instead.";
      return getLocalSafaChatReply(message);
    }
    const payload = await response.json();
    if (typeof payload.reply !== "string" || !payload.reply.trim()) {
      safaChatNotice.textContent = "Secure AI returned no reply · showing the website guide instead.";
      return getLocalSafaChatReply(message);
    }
    safaChatNotice.textContent =     "Secure AI connected · your typed message was sent to the configured AI provider.";
    return { text: payload.reply.trim() };
  } catch (error) {
    console.warn("SAFA AI service could not be reached; using website guidance.", error);
    safaChatNotice.textContent = "Secure AI is unreachable · showing the website guide instead.";
    return getLocalSafaChatReply(message);
  }
};

const submitSafaChatMessage = async (text) => {
  const message = text.trim();
  if (!message || safaChatInput.disabled) return;
  safaChatSuggestions.hidden = true;
  addSafaChatMessage(message, "user");
  safaChatInput.value = "";
  const command = resolveSafaCommand(message);
  if (command) {
    executeSafaCommand(command);
    if (command.intent !== "close") safaChatInput.focus();
    return;
  }
  safaChatInput.disabled = true;
  safaChatForm.querySelector("button").disabled = true;
  syncSafaChatVoiceControls();

  const typing = document.createElement("div");
  typing.className = "safa-chat-message assistant safa-chat-typing";
  typing.setAttribute("role", "status");
  typing.textContent = "SAFA AI is preparing a reply…";
  safaChatMessages.append(typing);
  safaChatMessages.scrollTop = safaChatMessages.scrollHeight;

  const requestId = ++safaChatRequestId;
  setSafaChatVoiceStatus("Preparing your reply…", "thinking");
  try {
    const reply = await requestSafaChatReply(message);
    if (requestId !== safaChatRequestId) return;
    typing.remove();
    addSafaChatMessage(reply.text, "assistant", reply.action);
    safaChatConversation.push({ role: "user", content: message }, { role: "assistant", content: reply.text });
    safaChatConversation = safaChatConversation.slice(-10);
    safaChatLastReply = reply.text;
    safaChatInput.disabled = false;
    safaChatForm.querySelector("button").disabled = false;
    syncSafaChatVoiceControls();
    setSafaChatVoiceStatus("Reply ready · text response shown above.", "ready");
    safaChatInput.focus();
  } catch (error) {
    if (requestId !== safaChatRequestId) return;
    typing.remove();
    safaChatInput.disabled = false;
    safaChatForm.querySelector("button").disabled = false;
    syncSafaChatVoiceControls();
    setSafaChatVoiceStatus("The reply could not be prepared. Please try again or use the website links.", "error");
    console.error("SAFA AI could not prepare a reply.", error);
  }
};

safaChatToggle.addEventListener("click", () => setSafaChatOpen(safaChatPanel.hidden));
safaChatClose.addEventListener("click", () => setSafaChatOpen(false));
safaChatSuggestions.addEventListener("click", (event) => {
  const suggestion = event.target.closest("[data-chat-prompt]");
  if (suggestion) void submitSafaChatMessage(suggestion.dataset.chatPrompt);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !safaChatPanel.hidden) setSafaChatOpen(false);
});

safaChatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  void submitSafaChatMessage(safaChatInput.value);
});

safaChatLanguage.addEventListener("change", updateSafaChatLanguage);
safaChatLanguageSearch.addEventListener("input", () => {
  const query = safaChatLanguageSearch.value.trim().toLocaleLowerCase();
  [...safaChatLanguage.options].forEach((option) => {
    option.hidden = Boolean(query) && !option.dataset.search.includes(query);
  });
  if (query && ![...safaChatLanguage.options].some((option) => option.value === safaChatLanguage.value && !option.hidden)) {
    const firstMatch = [...safaChatLanguage.options].find((option) => !option.hidden);
    if (firstMatch) {
      safaChatLanguage.value = firstMatch.value;
      updateSafaChatLanguage();
    }
  }
});

if (safaChatMic) {
const recognitionErrorMessage = (error) => {
  const messages = {
    "not-allowed": "Microphone access was denied. Allow microphone access in your browser settings, then try again.",
    "service-not-allowed": "Speech recognition is blocked by this browser. Allow microphone access or type your question.",
    "no-speech": "No speech was detected. Check your microphone and try again.",
    "audio-capture": "No working microphone was found. Connect a microphone or type your question.",
    "language-not-supported": `This browser does not support voice recognition in ${currentChatLanguage()[1]}. Choose another language or type your question.`,
    network: "The browser's speech recognition service is unavailable. Check your connection or type your question.",
  };
  return messages[error] || `Voice recognition stopped (${error}). You can type your question instead.`;
};

if (!Recognition) {
  safaChatMic.disabled = true;
  setSafaChatVoiceStatus("Speech recognition is not supported in this browser. You can type instead.", "error");
} else {
  safaChatRecognition = new Recognition();
  safaChatRecognition.continuous = false;
  safaChatRecognition.interimResults = true;
  safaChatRecognition.maxAlternatives = 1;
  safaChatRecognition.onstart = () => {
    stopSafaChatSpeech();
    safaChatRecognitionFailed = false;
    safaChatListening = true;
    safaChatDock.dataset.voiceState = "listening";
    safaChatMic.disabled = false;
    syncSafaChatVoiceControls();
    setSafaChatVoiceStatus(`Listening in ${currentChatLanguage()[1]} · speak now, then pause or stop.`, "listening");
  };
  safaChatRecognition.onresult = (event) => {
    let interim = "";
    let finalTranscript = "";
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const transcript = event.results[index][0].transcript;
      if (event.results[index].isFinal) finalTranscript += transcript;
      else interim += transcript;
    }
    if (interim) {
      safaChatInput.value = interim;
      setSafaChatVoiceStatus(`Listening · ${interim}`, "listening");
    }
    if (finalTranscript.trim()) {
      safaChatInput.value = finalTranscript.trim();
      setSafaChatVoiceStatus(`Recognized · ${finalTranscript.trim()}`, "ready");
      safaChatRecognition.stop();
      void submitSafaChatMessage(finalTranscript);
    }
  };
  safaChatRecognition.onerror = (event) => {
    safaChatListening = false;
    safaChatRecognitionFailed = true;
    safaChatInput.value = "";
    setSafaChatVoiceStatus(recognitionErrorMessage(event.error), "error");
    syncSafaChatVoiceControls();
  };
  safaChatRecognition.onend = () => {
    safaChatListening = false;
    syncSafaChatVoiceControls();
    if (!safaChatInput.disabled && !safaChatRecognitionFailed) {
      setSafaChatVoiceStatus("Listening stopped · you can type or start the microphone again.", "ready");
    }
  };
}

safaChatMic.addEventListener("click", () => {
  if (!safaChatRecognition || safaChatInput.disabled) return;
  if (isAutoChatLanguage()) {
    setSafaChatVoiceStatus("Browser speech recognition needs a specific language. Select one, or type a message for AI language detection.", "error");
    return;
  }
  if (safaChatListening) {
    safaChatRecognition.stop();
    setSafaChatVoiceStatus("Stopping microphone…", "ready");
    return;
  }
  if (!window.isSecureContext && window.location.protocol !== "file:") {
    setSafaChatVoiceStatus("Microphone access requires HTTPS or localhost. Type your question for now.", "error");
    return;
  }
  stopSafaChatSpeech();
  safaChatRecognition.lang = safaChatLanguage.value;
  try {
    safaChatRecognition.start();
    setSafaChatVoiceStatus(`Requesting microphone access for ${currentChatLanguage()[1]}…`, "listening");
  } catch (error) {
    setSafaChatVoiceStatus(`Could not start voice recognition (${error.message}). Check microphone permissions or type your question.`, "error");
  }
});

safaChatSpeakToggle.addEventListener("click", () => {
  safaChatVoiceReplies = !safaChatVoiceReplies;
  if (!safaChatVoiceReplies) {
    stopSafaChatSpeech();
    setSafaChatVoiceStatus("Voice replies are off. No response audio will play.", "ready");
  } else if (safaChatLastReply) {
    speakSafaChatReply(safaChatLastReply);
  } else {
    setSafaChatVoiceStatus("Voice replies are on. Responses will be spoken after you send a message.", "ready");
  }
  syncSafaChatVoiceControls();
});

safaChatPause.addEventListener("click", () => {
  if (safaChatCloudAudio && !safaChatCloudAudio.paused && !safaChatCloudAudio.ended) {
    safaChatCloudAudio.pause();
  } else if (browserVoices?.speaking && !browserVoices.paused) {
    browserVoices.pause();
  } else return;
  setSafaChatVoiceStatus("Speech paused · press Resume to continue.", "speaking");
  syncSafaChatVoiceControls();
});
safaChatResume.addEventListener("click", () => {
  if (safaChatCloudAudio?.paused && safaChatCloudAudio.currentTime > 0) {
    void safaChatCloudAudio.play().catch((error) => {
      setSafaChatVoiceStatus("Audio could not resume. Press Voice replies on again or try another voice.", "error");
      console.warn("SAFA AI audio could not resume.", error);
    });
  } else if (browserVoices?.paused) {
    browserVoices.resume();
  } else return;
  setSafaChatVoiceStatus(`Speaking in ${currentChatLanguage()[1]}.`, "speaking");
  syncSafaChatVoiceControls();
});
safaChatStop.addEventListener("click", () => {
  stopSafaChatSpeech();
  setSafaChatVoiceStatus("Speech stopped.", "ready");
});
safaChatVoice.addEventListener("change", () => {
  if (safaChatVoiceReplies && safaChatLastReply) void speakSafaChatReply(safaChatLastReply);
});
}

updateSafaChatLanguage();

const launchParams = new URLSearchParams(window.location.search);
if (launchParams.get("replayIntro") === "1") {
  beginIntro();
} else if (launchParams.get("openAssistant") === "1") {
  window.setTimeout(() => setSafaChatOpen(true), 150);
} else {
  try {
    if (window.sessionStorage.getItem(INTRO_SESSION_KEY) !== "played") {
      window.sessionStorage.setItem(INTRO_SESSION_KEY, "played");
      beginIntro();
    }
  } catch (error) {
    console.warn("SAFA intro session preference could not be saved; showing the intro for this visit.", error);
    beginIntro();
  }
}
