(() => {
  const signOutButton = document.querySelector("#future-sign-out");
  signOutButton?.addEventListener("click", async () => {
    signOutButton.disabled = true;
    await fetch("/api/admin-logout", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Origin": window.location.origin },
      cache: "no-store",
    }).catch(() => {});
    window.location.replace("../index.html");
  });

  const definitions = window.SAFAFutureFeatures || {};
  const featureId = document.body.dataset.feature;
  if (!featureId && document.querySelector("#future-feature-grid")) {
    const grid = document.querySelector("#future-feature-grid");
    let selectedCategory = "All";
    const render = () => {
      const query = document.querySelector("#future-search").value.trim().toLowerCase();
      const entries = Object.values(definitions).filter((feature) =>
        (selectedCategory === "All" || feature.category === selectedCategory) &&
        `${feature.title} ${feature.category} ${feature.description}`.toLowerCase().includes(query));
      grid.replaceChildren(...entries.map((feature, index) => {
        const card = document.createElement("article");
        card.className = "future-feature-card";
        const number = document.createElement("span");
        number.className = "future-card-number";
        number.textContent = String(index + 1).padStart(2, "0");
        const category = document.createElement("span");
        category.className = "future-card-category";
        category.textContent = feature.category;
        const title = document.createElement("h3");
        title.textContent = feature.title;
        const description = document.createElement("p");
        description.textContent = feature.description;
        const status = document.createElement("small");
        status.textContent = feature.status;
        const link = document.createElement("a");
        link.className = "gold-button";
        link.href = feature.route;
        link.textContent = "Open feature";
        card.append(number, category, title, description, status, link);
        return card;
      }));
      document.querySelector("#future-results").textContent = `${entries.length} of 15 features shown.`;
    };
    document.querySelector("#future-search").addEventListener("input", render);
    document.querySelectorAll("[data-future-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        selectedCategory = button.dataset.futureFilter;
        document.querySelectorAll("[data-future-filter]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        render();
      });
    });
    render();
    return;
  }
  if (!featureId || !definitions[featureId]) return;

  const feature = definitions[featureId];
  const status = document.querySelector("[data-future-status]");
  const setStatus = (message) => { if (status) status.textContent = message; };
  const sceneHost = document.querySelector("[data-future-scene]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let currentView = "front";
  let renderer;
  let scene;
  let camera;
  let renderScene;
  let house;
  let animationTimer;
  let blueprintImageUrl = "";
  let drag = null;
  let cameraAngle = 0;
  let cameraElevation = 0.2;
  let cameraRadius = 9;
  let currentGlow = "#65d9d0";
  const sceneOverrides = {};
  const journeySteps = [
    "01 · Understand your plot: note the location, dimensions, access, and documents to discuss with a qualified professional.",
    "02 · Define your needs: list rooms, accessibility priorities, preferred style, and budget range.",
    "03 · Develop a concept: review layout options, site conditions, and design priorities with qualified professionals.",
    "04 · Verify the project: confirm surveys, engineering, approvals, scope, materials, costs, and schedule with the project team.",
    "05 · Plan construction: agree responsibilities, safety arrangements, quality checks, and communication before work begins.",
  ];
  if (featureId === "future-room-customizer") {
    try {
      const saved = localStorage.getItem("safa-room-customizer");
      if (saved) {
        const values = JSON.parse(saved);
        if (!values || typeof values !== "object" || Array.isArray(values)) throw new Error("Saved room settings are invalid.");
        Object.entries(values).forEach(([name, value]) => {
          const control = document.querySelector(`[data-scene-control="${name}"]`);
          if (control && [...control.options].some((option) => option.value === value)) control.value = value;
        });
      }
    } catch (error) {
      setStatus(`Could not restore the saved room settings: ${error.message}`);
    }
  }
  if (featureId === "future-plot-journey") {
    try {
      const saved = localStorage.getItem("safa-plot-journey-step");
      if (saved !== null) {
        const step = Number(saved);
        if (!Number.isInteger(step) || step < 0 || step >= journeySteps.length) throw new Error("Saved journey step is invalid.");
        const journey = document.querySelector(".journey-progress");
        journey.dataset.journeyStep = String(step);
        journey.querySelector("[data-journey-copy]").textContent = journeySteps[step];
      }
    } catch (error) {
      setStatus(`Could not restore the saved journey step: ${error.message}`);
    }
  }
  ["checklist", "mission"].forEach((kind) => {
    const form = document.querySelector(`[data-future-form="${kind}"]`);
    if (!form) return;
    try {
      const saved = localStorage.getItem(`safa-${kind}-${featureId}`);
      if (!saved) return;
      const values = JSON.parse(saved);
      if (!values || typeof values !== "object" || Array.isArray(values)) throw new Error("Saved draft is invalid.");
      Object.entries(values).forEach(([name, value]) => {
        const field = form.elements.namedItem(name);
        if (field && typeof value === "string") field.value = value;
      });
      setStatus("A locally saved draft was restored from this browser. It has not been sent to SAFA.");
    } catch (error) {
      setStatus(`Could not restore the saved draft: ${error.message}`);
    }
  });

  const loadThree = () => new Promise((resolve, reject) => {
    if (window.THREE) return resolve(window.THREE);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.onload = () => window.THREE ? resolve(window.THREE) : reject(new Error("3D library did not initialize"));
    script.onerror = () => reject(new Error("3D library could not be loaded"));
    document.head.append(script);
  });
  const makeMaterial = (THREE, color, options = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.76, metalness: 0.04, ...options });
  const box = (THREE, group, name, dimensions, position, material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...dimensions), material);
    mesh.name = name;
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };
  const getControl = (name) => sceneOverrides[name] ?? document.querySelector(`[data-scene-control="${name}"]`)?.value;
  const drawScene = (THREE) => {
    if (!renderer || !scene) return;
    if (house) {
      house.traverse((item) => {
        item.geometry?.dispose();
        if (Array.isArray(item.material)) item.material.forEach((material) => material.dispose());
        else item.material?.dispose();
      });
      scene.remove(house);
    }
    house = new THREE.Group();
    const isRoom = feature.model === "room";
    const isBlueprint = feature.model === "blueprint";
    const holo = sceneHost.classList.contains("is-hologram") || featureId === "future-hologram-mode" && sceneHost.dataset.hologram === "true";
    currentGlow = getControl("glow") || currentGlow;
    const opacity = holo ? 0.56 : 1;
    const wallColor = getControl("wall") || "#e8dfd0";
    const roofColor = getControl("roof") || "#34383b";
    const floorColor = getControl("floor") || "#8b6447";
    const roomType = getControl("room") || "Living room";
    const material = (color, additional = {}) => makeMaterial(THREE, isBlueprint ? "#c7a750" : color, {
      transparent: holo || isBlueprint,
      opacity: isBlueprint ? 0.78 : opacity,
      wireframe: isBlueprint,
      emissive: holo ? color : "#000000",
      emissiveIntensity: holo ? 0.34 : 0,
      ...additional,
    });
    const groundMat = material(isRoom ? "#151d27" : "#111c28");
    box(THREE, house, "ground", [9, 0.16, 7], [0, -0.16, 0], groundMat);
    if (isRoom) {
      const wall = material(wallColor);
      const floor = material(floorColor);
      box(THREE, house, "room-floor", [5.2, 0.12, 4.3], [0, 0, 0], floor);
      box(THREE, house, "back-wall", [5.2, 3, 0.12], [0, 1.5, -2.1], wall);
      box(THREE, house, "left-wall", [0.12, 3, 4.3], [-2.55, 1.5, 0], wall);
      const furnitureColor = roomType === "Bedroom" ? "#566b81" : roomType === "Study" ? "#687b68" : "#92725b";
      box(THREE, house, roomType === "Bedroom" ? "bed" : roomType === "Study" ? "desk" : "sofa", [1.75, 0.65, 0.72], [-0.45, 0.43, -1.1], material(furnitureColor));
      box(THREE, house, "table", [1.05, 0.12, 0.72], [0.15, 0.47, 0.1], material(roomType === "Study" ? "#8b7156" : "#b79a69"));
      box(THREE, house, "window", [1.25, 1.2, 0.08], [1.1, 1.75, -2], material("#75a9b9", { metalness: 0.24 }));
      const lightMode = getControl("lighting") || "warm";
      const brightness = Number(getControl("brightness") || 75) / 100;
      scene.children.find((item) => item.isHemisphereLight)?.intensity && (scene.children.find((item) => item.isHemisphereLight).intensity = 0.55 + brightness);
      scene.children.find((item) => item.isPointLight)?.color.set(lightMode === "warm" ? "#ffc477" : lightMode === "daylight" ? "#c8e5ff" : "#fff1d9");
      scene.children.find((item) => item.isPointLight)?.intensity && (scene.children.find((item) => item.isPointLight).intensity = 1.8 * brightness);
    } else {
      const floorsValue = getControl("floors");
      const floors = floorsValue === "upper" ? 2 : Number(floorsValue || document.querySelector('[name="floors"]')?.value || 2);
      const wall = material(wallColor);
      const trim = material(roofColor);
      const levelHeight = 1.5;
      box(THREE, house, "foundation", [3.8, 0.2, 2.8], [0, 0, 0], trim);
      for (let level = 0; level < Math.max(1, Math.min(3, floors || 2)); level++) {
        const y = 0.85 + level * levelHeight;
        box(THREE, house, `wall-${level}`, [3.5, 1.5, 2.5], [0, y, 0], wall);
        box(THREE, house, `window-left-${level}`, [0.58, 0.58, 0.08], [-0.96, y + 0.12, 1.28], material(holo ? currentGlow : "#537f91", { metalness: 0.2 }));
        box(THREE, house, `window-right-${level}`, [0.58, 0.58, 0.08], [0.96, y + 0.12, 1.28], material(holo ? currentGlow : "#537f91", { metalness: 0.2 }));
        box(THREE, house, `side-window-${level}`, [0.08, 0.55, 0.6], [1.78, y + 0.12, -0.48], material(holo ? currentGlow : "#537f91"));
        if (level === 0) box(THREE, house, "entrance", [0.55, 1.05, 0.08], [0, 0.62, 1.29], trim);
      }
      const roof = box(THREE, house, "roof", [4.05, 0.18, 3.05], [0, 0.95 + floors * levelHeight, 0], trim);
      if (getControl("style") === "Traditional" || getControl("style") === "Courtyard") {
        const cap = new THREE.Mesh(new THREE.ConeGeometry(2.65, 1.05, 4), trim);
        cap.name = "pitched-roof";
        cap.position.set(0, 1.32 + floors * levelHeight, 0);
        cap.rotation.y = Math.PI / 4;
        cap.castShadow = true;
        house.add(cap);
        roof.visible = false;
      }
      if (featureId === "future-miniature-house" && floorsValue === "1") {
        house.children.filter((part) => part.name.endsWith("-1") || part.name === "pitched-roof" || part.name === "roof").forEach((part) => { part.visible = false; });
      }
      if (featureId === "future-miniature-house" && floorsValue === "upper") {
        house.children.filter((part) => ["wall-0", "window-left-0", "window-right-0", "side-window-0", "entrance"].includes(part.name)).forEach((part) => { part.visible = false; });
      }
      if (featureId === "future-living-simulator") {
        const daylight = Number(getControl("daylight") || 65) / 100;
        const shade = Number(getControl("shade") || 35) / 100;
        scene.children.find((item) => item.isHemisphereLight)?.intensity && (scene.children.find((item) => item.isHemisphereLight).intensity = 0.45 + daylight * 0.8 - shade * 0.22);
      }
    }
    scene.add(house);
    if (isBlueprint) {
      const stage = Number(getControl("stage") || 100) / 100;
      house.children.forEach((mesh) => {
        mesh.material.opacity = 0.2 + stage * 0.65;
        mesh.material.wireframe = stage < 58;
        mesh.material.color.set(stage < 58 ? "#e7c96e" : "#b8a164");
      });
    }
    if (featureId === "future-hologram-mode") {
      house.traverse((item) => { if (item.material) item.material.color.set(holo ? currentGlow : item.material.color); });
      sceneHost.classList.toggle("is-hologram", holo);
    }
    renderer.render(scene, camera);
  };
  const startThree = async () => {
    try {
      const THREE = await loadThree();
      scene = new THREE.Scene();
      scene.background = new THREE.Color("#08172d");
      camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      camera.position.set(7, 5.4, 8);
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      sceneHost.replaceChildren(renderer.domElement);
      scene.add(new THREE.HemisphereLight("#fff0d4", "#182638", 1.05));
      const key = new THREE.DirectionalLight("#fff0d4", 2.1);
      key.position.set(5, 9, 7);
      key.castShadow = true;
      scene.add(key);
      const fill = new THREE.PointLight("#d49a48", 1.4, 24);
      fill.position.set(-4, 5, -2);
      scene.add(fill);
      drawScene(THREE);
      const resize = () => {
        if (!renderer || !camera) return;
        const bounds = sceneHost.getBoundingClientRect();
        const width = Math.max(250, bounds.width);
        const height = Math.max(230, bounds.height);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
      };
      new ResizeObserver(resize).observe(sceneHost);
      resize();
      const render = () => {
        if (!renderer) return;
        if (!prefersReducedMotion && !drag && featureId !== "future-vr-walkthrough") cameraAngle += 0.0018;
        const viewScale = currentView === "front" ? 1 : currentView === "upper" ? 0.85 : 0.5;
        const viewElevation = currentView === "upper" ? 2.8 : currentView === "front" ? 4.2 : 1.8;
        camera.position.set(
          Math.sin(cameraAngle) * cameraRadius * viewScale,
          viewElevation + cameraElevation * 3,
          Math.cos(cameraAngle) * cameraRadius * viewScale,
        );
        camera.lookAt(0, 1.1, 0);
        renderer.render(scene, camera);
      };
      renderScene = render;
      renderer.setAnimationLoop(prefersReducedMotion ? null : render);
      sceneHost.addEventListener("pointerdown", (event) => { drag = { x: event.clientX, y: event.clientY }; sceneHost.setPointerCapture(event.pointerId); });
      sceneHost.addEventListener("pointermove", (event) => {
        if (!drag) return;
        cameraAngle += (event.clientX - drag.x) * 0.009;
        cameraElevation = Math.max(-0.5, Math.min(0.9, cameraElevation + (event.y - drag.y) * 0.003));
        drag = { x: event.clientX, y: event.clientY };
        if (prefersReducedMotion) renderScene();
      });
      sceneHost.addEventListener("pointerup", () => { drag = null; });
      sceneHost.addEventListener("pointercancel", () => { drag = null; });
      sceneHost.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          cameraAngle += event.key === "ArrowLeft" ? -0.16 : 0.16;
        } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          cameraElevation = Math.max(-0.5, Math.min(0.9, cameraElevation + (event.key === "ArrowUp" ? 0.08 : -0.08)));
        } else if (event.key === "+" || event.key === "=") {
          cameraRadius = Math.max(4, cameraRadius - 0.8);
        } else if (event.key === "-") {
          cameraRadius = Math.min(18, cameraRadius + 0.8);
        } else if (event.key === "Home") {
          cameraAngle = 0;
          cameraElevation = 0.2;
          cameraRadius = 9;
        } else {
          return;
        }
        event.preventDefault();
        if (prefersReducedMotion) renderScene();
      });
      sceneHost.addEventListener("wheel", (event) => {
        event.preventDefault();
        cameraRadius = Math.max(4, Math.min(18, cameraRadius * (event.deltaY > 0 ? 1.06 : 0.94)));
        if (prefersReducedMotion) renderScene();
      }, { passive: false });
      sceneHost.addEventListener("click", (event) => {
        if (featureId === "future-miniature-house" && !drag) setStatus("Selected a sample house zone. This is a conceptual massing model without measured or structural details.");
      });
    } catch (error) {
      sceneHost.classList.add("future-scene-fallback");
      sceneHost.innerHTML = '<div class="future-fallback-house" aria-hidden="true"><span></span><i></i><b></b></div><p class="future-scene-error" role="status">Interactive 3D could not load in this browser. The feature controls remain available; enable WebGL and allow the Three.js CDN to see the model.</p>';
      setStatus("3D preview unavailable: " + error.message + ". Controls and local planning functions remain available.");
    }
  };
  startThree();

  document.querySelectorAll("[data-scene-control]").forEach((control) => {
    control.addEventListener("input", () => {
      if (featureId === "future-blueprint-transform" && control.dataset.sceneControl === "stage") setStatus(`Visual transition stage: ${control.value}%. This does not represent construction progress.`);
      else if (featureId === "future-living-simulator") setStatus("Scenario updated. This concept does not calculate energy use, temperature, or measured daylight.");
      else if (featureId === "future-hologram-mode" && control.dataset.sceneControl === "glow") currentGlow = control.value;
      else if (featureId === "future-room-customizer") setStatus("Room preview updated. Your choices are visual samples, not a verified product specification.");
      else if (featureId === "future-lighting-studio") setStatus("Lighting mood preview updated. No lux or electrical load is calculated.");
      else setStatus("3D concept updated. No measured site, structural, or supplier data is represented.");
      if (window.THREE && renderer) drawScene(window.THREE);
    });
    control.addEventListener("change", () => {
      if (featureId === "future-vr-walkthrough" && control.dataset.sceneControl === "view") {
        currentView = control.value;
        setStatus(`Showing the ${control.selectedOptions[0].text.toLowerCase()} viewpoint of the illustrative house concept.`);
      } else if (featureId === "future-miniature-house") setStatus("Floor selection updated on the conceptual model.");
      if (window.THREE && renderer) drawScene(window.THREE);
      if (prefersReducedMotion) renderScene?.();
    });
  });

  const download = (text, filename) => {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const formText = (form) => Object.fromEntries(new FormData(form).entries());
  const prompts = {
    "Warm and sunny": "Discuss external shade, deep overhangs, and limiting unwanted afternoon heat with a local designer.",
    "Humid and rainy": "Discuss cross-ventilation, rain protection, moisture-resistant details, and local drainage conditions.",
    "Cooler seasons": "Discuss orientation, useful daylight, and locally suitable insulation and glazing.",
    "Not sure": "Confirm local climate conditions and seasonal sun paths before choosing shading or ventilation strategies.",
  };
  document.querySelectorAll("[data-future-form]").forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = formText(form);
    if (form.dataset.futureForm === "style") {
      const match = { shade: "Tropical / courtyard forms", simple: "Contemporary minimal forms", heritage: "Traditional gable forms", nature: "Earth-and-timber forms" }[values.priority];
      sceneOverrides.style = values.priority === "simple" ? "Modern" : values.priority === "heritage" ? "Traditional" : "Courtyard";
      sceneOverrides.wall = values.priority === "nature" ? "#b7a387" : values.priority === "heritage" ? "#d2b594" : values.priority === "shade" ? "#c2c1ac" : "#e8dfd0";
      sceneOverrides.floors = values.floors;
      if (window.THREE && renderer) drawScene(window.THREE);
      setStatus(`Suggested starting point: ${match}, with ${values.floors} floors and about ${values.rooms} requested rooms. This simple rule-based match is not AI and needs architect review.`);
    } else if (form.dataset.futureForm === "comfort") {
      const recommendation = `${prompts[values.climate]} Priority: ${values.priority.toLowerCase()}. Plot direction entered: ${values.direction}. These are general questions, not a site-specific climate analysis.`;
      setStatus(recommendation);
    } else if (form.dataset.futureForm === "build") {
      Object.assign(sceneOverrides, { wall: values.wall, roof: values.roof, style: values.style, floors: values.floors });
      if (window.THREE && renderer) drawScene(window.THREE);
      setStatus(`Generated a browser-side ${values.floors}-floor ${values.style.toLowerCase()} massing concept. It is not an architectural drawing, quote, permit, or construction-ready design.`);
    } else if (form.dataset.futureForm === "blueprint") {
      const width = Number(values.width);
      const length = Number(values.length);
      if (!Number.isFinite(width) || !Number.isFinite(length) || width <= 0 || length <= 0) return setStatus("Enter valid positive dimensions before calculating.");
      const area = width * length;
      setStatus(`Entered dimensions: ${width} × ${length} ${values.units}; area ${area.toFixed(2)} square ${values.units}. This arithmetic does not interpret the drawing or verify dimensions.`);
    } else if (form.dataset.futureForm === "checklist" || form.dataset.futureForm === "mission") {
      const storageKey = `safa-${form.dataset.futureForm}-${featureId}`;
      try {
        localStorage.setItem(storageKey, JSON.stringify(values));
      } catch (error) {
        return setStatus(`Could not save in this browser: ${error.message}`);
      }
      const summary = Object.entries(values).map(([key, value]) => `${key}: ${value || "Not specified"}`).join("\n");
      if (form.dataset.futureForm === "mission") {
        document.querySelector("#mission-summary")?.remove();
        const output = document.createElement("pre");
        output.id = "mission-summary";
        output.className = "tool-result future-summary";
        output.textContent = `SAFA project discussion draft\n${summary}\n\nThis local draft is not an enquiry, quote, proposal, or project status.`;
        form.after(output);
      }
      setStatus("Draft saved in this browser only. It was not sent to SAFA or stored in a customer account.");
    }
  }));

  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-future-action]");
    if (!button) return;
    const action = button.dataset.futureAction;
    if (action === "recenter") {
      cameraAngle = 0;
      cameraElevation = 0.2;
      cameraRadius = 9;
      if (camera) camera.position.set(7, 5.4, 8);
      renderScene?.();
      setStatus("3D camera view reset.");
    } else if (action === "reset") {
      document.querySelectorAll("[data-scene-control]").forEach((control) => { control.selectedIndex = 0; if (control.type === "range") control.value = control.defaultValue; });
      if (window.THREE && renderer) drawScene(window.THREE);
      setStatus("Room preview reset to the visual sample.");
    } else if (action === "save-room") {
      const design = Object.fromEntries([...document.querySelectorAll("[data-scene-control]")].map((control) => [control.dataset.sceneControl, control.value]));
      try {
        localStorage.setItem("safa-room-customizer", JSON.stringify(design));
        setStatus("Room design saved on this device. It is not synced or submitted.");
      } catch (error) { setStatus(`Could not save in this browser: ${error.message}`); }
    } else if (action === "save-brief") {
      const values = [...document.querySelectorAll("[data-scene-control]")].map((control) => `${control.dataset.sceneControl}: ${control.selectedOptions?.[0]?.text || control.value}`);
      download(`SAFA CONSTRUCTION — visual design brief\n${values.join("\n")}\n\nConcept only; not a supplier specification or construction instruction.`, `${featureId}-brief.txt`);
      setStatus("Visual design brief downloaded; choices are not verified product specifications.");
    } else if (action === "journey-prev" || action === "journey-next") {
      const container = document.querySelector(".journey-progress");
      const next = Math.max(0, Math.min(journeySteps.length - 1, Number(container.dataset.journeyStep) + (action === "journey-next" ? 1 : -1)));
      container.dataset.journeyStep = String(next);
      container.querySelector("[data-journey-copy]").textContent = journeySteps[next];
      setStatus(`Step ${next + 1} of ${journeySteps.length}. This is a general guide; no project progress is recorded.`);
    } else if (action === "journey-save") {
      try {
        localStorage.setItem("safa-plot-journey-step", document.querySelector(".journey-progress").dataset.journeyStep);
        setStatus("Journey step saved in this browser only.");
      } catch (error) { setStatus(`Could not save in this browser: ${error.message}`); }
    } else if (action === "play" || action === "replay") {
      clearInterval(animationTimer);
      const range = document.querySelector('[data-scene-control="stage"]');
      if (action === "replay") range.value = 0;
      animationTimer = setInterval(() => {
        range.value = Math.min(100, Number(range.value) + 2);
        range.dispatchEvent(new Event("input", { bubbles: true }));
        if (Number(range.value) >= 100) clearInterval(animationTimer);
      }, prefersReducedMotion ? 80 : 35);
      setStatus("Playing an illustrative blueprint-to-massing transition. It is not a construction sequence.");
    } else if (action === "pause") {
      clearInterval(animationTimer);
      setStatus("Visual transition paused.");
    } else if (action === "hologram") {
      const enabled = button.getAttribute("aria-pressed") !== "true";
      button.setAttribute("aria-pressed", String(enabled));
      sceneHost.dataset.hologram = String(enabled);
      button.textContent = enabled ? "Disable hologram effect" : "Enable hologram effect";
      sceneHost.classList.toggle("is-hologram", enabled);
      if (window.THREE && renderer) drawScene(window.THREE);
      setStatus(enabled ? "Hologram-style screen effect enabled; this is not a physical hologram." : "Hologram-style screen effect disabled.");
    } else if (action === "download-checklist" || action === "download-mission") {
      const form = document.querySelector(`[data-future-form="${action === "download-mission" ? "mission" : "checklist"}"]`);
      if (!form.reportValidity()) return;
      const values = formText(form);
      download(`SAFA CONSTRUCTION — local ${action === "download-mission" ? "mission brief" : "requirements checklist"}\n${Object.entries(values).map(([key, value]) => `${key}: ${value || "Not specified"}`).join("\n")}\n\nThis is a browser-generated draft only, not a submission, proposal, quote, or commitment.`, `safa-${action}.txt`);
      setStatus("Local draft downloaded. No customer enquiry has been sent.");
    } else if (action === "vr") {
      if (!navigator.xr || !renderer?.xr) {
        setStatus("VR is unavailable: this browser or device does not expose WebXR immersive VR. Use the interactive 3D view instead.");
        return;
      }
      try {
        const supported = await navigator.xr.isSessionSupported("immersive-vr");
        if (!supported) {
          setStatus("This device does not report immersive VR support. Use the interactive 3D view instead.");
          return;
        }
        renderer.xr.enabled = true;
        const session = await navigator.xr.requestSession("immersive-vr");
        renderer.setAnimationLoop(renderScene);
        await renderer.xr.setSession(session);
        setStatus("Immersive VR session started. Exit VR using your headset controls.");
        session.addEventListener("end", () => {
          if (prefersReducedMotion) renderer.setAnimationLoop(null);
          setStatus("VR session ended. The browser 3D view is still available.");
          renderScene();
        });
      } catch (error) {
        if (prefersReducedMotion) renderer?.setAnimationLoop(null);
        setStatus(`Could not start VR: ${error.message}. Continue with the browser 3D view.`);
      }
    }
  });

  const fileInput = document.querySelector("[data-blueprint-file]");
  fileInput?.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    const image = document.querySelector("[data-blueprint-preview]");
    if (blueprintImageUrl) URL.revokeObjectURL(blueprintImageUrl);
    blueprintImageUrl = "";
    image.hidden = true;
    image.removeAttribute("src");
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) {
      fileInput.value = "";
      setStatus("Choose a PNG, JPEG, or WebP image no larger than 10 MB.");
      return;
    }
    blueprintImageUrl = URL.createObjectURL(file);
    image.src = blueprintImageUrl;
    image.hidden = false;
    setStatus("Image preview loaded locally. No OCR, AI interpretation, or drawing validation is connected.");
  });
  window.addEventListener("beforeunload", () => {
    clearInterval(animationTimer);
    if (blueprintImageUrl) URL.revokeObjectURL(blueprintImageUrl);
    renderer?.setAnimationLoop(null);
    renderer?.dispose();
  });
})();
