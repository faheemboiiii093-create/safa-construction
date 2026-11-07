const home = "../index.html";
const features = {
  "floor-plan": {
    title: "AI Floor Plan Generator",
    status: "PRELIMINARY BROWSER BRIEF · NO AI PLAN GENERATION",
    description: "Start a home-planning brief with your plot, preferred floor count, and room requirements. This page organizes discussion points; it does not draw or approve a floor plan.",
    link: `${home}#planning-assistant`,
    linkText: "Open the detailed planning assistant",
    content: '<form id="floor-plan-form" class="tool-form"><div class="field-pair"><label>Plot width<input name="width" type="number" min="10" max="500" value="40" required></label><label>Plot length<input name="length" type="number" min="10" max="500" value="60" required></label></div><div class="field-pair"><label>Units<select name="units"><option value="ft">Feet</option><option value="m">Metres</option></select></label><label>Road direction<select name="road"><option>North</option><option>South</option><option>East</option><option>West</option></select></label></div><div class="field-pair"><label>Floors<select name="floors"><option>1</option><option selected>2</option><option>3</option></select></label><label>Bedrooms<select name="bedrooms"><option>1</option><option>2</option><option selected>3</option><option>4</option><option>5</option></select></label></div><div class="field-pair"><label>Bathrooms<select name="bathrooms"><option>1</option><option>2</option><option selected>3</option><option>4</option></select></label><label>Style<select name="style"><option>Modern</option><option>Traditional</option><option>Tropical</option><option>Minimalist</option></select></label></div><div class="field-pair"><label><span><input name="parking" type="checkbox"> Include parking</span></label><label><span><input name="balcony" type="checkbox"> Include balcony</span></label></div><label>Location (optional)<input name="location" maxlength="80" placeholder="City or area"></label><div class="tool-actions"><button class="gold-button" type="submit">Generate conceptual layout</button><button class="secondary-button" id="plan-alternate" type="button" disabled>Alternative layout</button></div></form><div id="plan-workspace" class="plan-workspace" hidden><div class="plan-toolbar"><button class="secondary-button" id="plan-floor-toggle" type="button">Show floor 2</button><label class="zoom-control">Zoom<input id="plan-zoom" type="range" min="70" max="140" value="100"></label><button class="secondary-button" id="plan-export-svg" type="button">Export SVG</button><button class="secondary-button" id="plan-export-json" type="button">Export JSON</button></div><p class="plan-hint">Drag a room to move it. Drag its gold corner handle to change its size; use Shift + arrow keys to resize. Room dimensions and area update live. Concept blocks only; not a construction-ready plan.</p><div id="plan-canvas" class="plan-canvas" aria-label="Editable conceptual floor plan"></div><p class="tool-result" id="floor-plan-result" role="status" aria-live="polite"></p></div>',
  },
  materials: {
    title: "Smart Material Selector",
    status: "LIVE 3D EXTERIOR DESIGNER",
    description: "Explore exterior style, colour, finish, roof, glazing, floor count, and lighting on the existing interactive 3D house concept.",
    link: `${home}#house-studio`,
    linkText: "Launch the 3D material designer",
    content: '<p>The designer is part of the main SAFA site. Its concept materials are visual samples, not supplier-confirmed products or prices.</p><div class="material-board"><label>Surface<select id="material-surface"><option value="wall">Exterior wall</option><option value="roof">Roof</option><option value="glazing">Window glazing</option></select></label><div class="material-swatches" id="material-swatches"></div><p id="material-selection" role="status">Warm ivory · visual sample only</p><div class="tool-actions"><button class="secondary-button" id="material-compare" type="button">Compare selections</button><a class="secondary-button" id="material-preview-link" href="../index.html#house-studio">Preview chosen finish on 3D house ↗</a></div><div class="material-comparison" id="material-comparison" hidden></div></div>',
  },
  voice: {
    title: "SAFA AI Text Assistant",
    status: "MULTILINGUAL TEXT CHAT",
    description: "Ask SAFA AI about the website, home planning, or preliminary construction estimates in a supported written language.",
    link: `${home}?openAssistant=1#top`,
    linkText: "Open SAFA AI assistant",
    content: '<p>SAFA AI is text-only. Choose a conversation language and type your question. Secure AI replies require the Vercel endpoint and its server-side provider key to be configured.</p><div class="voice-demo-reply">Ask about services, home planning, or a preliminary construction budget. Replies appear here as readable text.</div><a class="gold-button" href="../index.html?openAssistant=1#top">Launch SAFA AI ↗</a>',
  },
  projects: {
    title: "Cinematic Project Explorer",
    status: "INTERACTIVE 3D GALLERY",
    description: "Browse illustrative SAFA service and design images in the site's interactive 3D gallery. The gallery displays image cards; it is not a set of full 3D building models.",
    link: `${home}#projects`,
    linkText: "Open project explorer",
    content: '<p>Choose a project or service image to open its presentation. Drag to rotate the image display and use the arrows to browse.</p><div class="project-preview-grid"><button type="button" data-project-image="../assets/service-home.jpg" aria-label="Open residential concept"><img src="../assets/service-home.jpg" alt="Illustrative residential concept"><span>Residential concept</span></button><button type="button" data-project-image="../assets/service-villa.jpg" aria-label="Open villa concept"><img src="../assets/service-villa.jpg" alt="Illustrative villa concept"><span>Villa concept</span></button><button type="button" data-project-image="../assets/service-interior.jpg" aria-label="Open interior concept"><img src="../assets/service-interior.jpg" alt="Illustrative interior concept"><span>Interior concept</span></button></div><div class="project-lightbox" id="project-lightbox" hidden><button type="button" id="project-lightbox-close" aria-label="Close project preview">×</button><img id="project-lightbox-image" alt=""><p>Illustrative concept image · not a completed SAFA project</p></div>',
  },
  city: {
    title: "Smart City Explorer",
    status: "LOCATION NOTES · MAPS AND REGULATIONS NOT CONNECTED",
    description: "Record a location to carry into your project discussion. This does not search maps, check local building codes, or verify a site.",
    link: `${home}#planning-assistant`,
    linkText: "Continue to detailed planning",
    content: '<div class="city-model" aria-label="Animated conceptual city block illustration"><div class="city-skyline"><button type="button" data-city-zone="Homes" aria-label="Select conceptual homes zone"></button><button type="button" data-city-zone="Community" aria-label="Select conceptual community zone"></button><button type="button" data-city-zone="Green space" aria-label="Select conceptual green space zone"></button><button type="button" data-city-zone="Civic building" aria-label="Select conceptual civic building zone"></button><button type="button" data-city-zone="Mixed use" aria-label="Select conceptual mixed use zone"></button><button type="button" data-city-zone="Homes" aria-label="Select conceptual homes zone"></button></div><div class="city-road"></div><div class="city-ground"></div><span class="city-disclaimer">CONCEPT ONLY · NOT A SURVEYED CITY</span></div><p class="city-zone-status" id="city-zone-status" role="status" aria-live="polite">Select a conceptual block to highlight it.</p><form id="city-form" class="tool-form"><label>Project city or area<input name="location" maxlength="100" placeholder="Enter a location" required></label><button class="gold-button" type="submit">Prepare location note</button></form><p class="tool-result" id="city-result" role="status" aria-live="polite"></p>',
  },
  sketch: {
    title: "Sketch-to-House AI",
    status: "LOCAL IMAGE PREVIEW · AI CONVERSION NOT CONNECTED",
    description: "Preview a sketch file locally in your browser. The image is not uploaded; this site does not currently convert it into a generated house or 3D model.",
    link: `${home}#house-studio`,
    linkText: "Explore the existing 3D house designer",
    content: '<label class="upload-dropzone" for="sketch-file"><span class="upload-icon" aria-hidden="true">✎</span><strong>Choose a sketch image</strong><span>PNG, JPEG, WebP · up to 10 MB · local preview only</span><input id="sketch-file" type="file" accept="image/png,image/jpeg,image/webp"></label><div class="field-pair"><label>Preferred style<select id="sketch-style"><option>Modern</option><option>Traditional</option><option>Tropical</option><option>Minimalist</option></select></label><label>Floors<select id="sketch-floors"><option>1 floor</option><option selected>2 floors</option><option>3 floors</option></select></label></div><p id="sketch-status" class="tool-result" role="status" aria-live="polite">Your image stays in this browser tab.</p><img id="sketch-preview" class="image-preview" alt="Local sketch preview" hidden>',
  },
  cutaway: {
    title: "3D House Cutaway Mode",
    status: "NOT AVAILABLE · APPROVED INTERIOR MODEL REQUIRED",
    description: "The current 3D house is exterior massing only. A furnished interior model, approved structural representation, and additional 3D implementation are needed before a cutaway can be explored.",
    link: `${home}#house-studio`,
    linkText: "Open the available exterior 3D designer",
    content: '<div class="cutaway-demo"><div class="cutaway-building" id="cutaway-building" data-wall="shown" data-floor="both"><div class="cutaway-floor cutaway-upper"><span>BEDROOM</span><span>BATH</span><span>BALCONY</span></div><div class="cutaway-floor cutaway-lower"><span>LIVING</span><span>KITCHEN</span><span>ENTRY</span></div></div><p>Illustrative room-zone schematic · not an architectural or structural model</p></div><div class="tool-actions"><button class="secondary-button" id="cutaway-wall" type="button">Hide sample wall</button><button class="secondary-button" id="cutaway-floor" type="button">Show upper floor only</button></div><div class="availability-note"><strong>Sample interaction only</strong><p>This labelled schematic demonstrates controls, not a real 3D cutaway or verified dimensions.</p></div>',
  },
  prices: {
    title: "Material Price Comparison",
    status: "SAMPLE COST ESTIMATE · NO LIVE SUPPLIER PRICES",
    description: "Compare broad illustrative construction-budget ranges with the existing calculator. Product-specific material prices, supplier availability, delivery, and stock are not connected.",
    link: `${home}#estimate`,
    linkText: "Open the sample cost estimator",
    content: '<p>Enter prices from supplier quotes you already have. The calculator does not retrieve live prices or verify suppliers.</p><form id="compare-form" class="tool-form"><div class="price-row"><label>Material A<input name="aName" value="Quote A" maxlength="50"></label><label>Rate (₹ / unit)<input name="aRate" type="number" min="0" step="0.01" value="0" required></label></div><div class="price-row"><label>Material B<input name="bName" value="Quote B" maxlength="50"></label><label>Rate (₹ / unit)<input name="bRate" type="number" min="0" step="0.01" value="0" required></label></div><div class="field-pair"><label>Quantity<input name="quantity" type="number" min="0.01" step="0.01" value="1" required></label><label>Wastage allowance (%)<input name="wastage" type="number" min="0" max="50" step="0.5" value="0"></label></div><button class="gold-button" type="submit">Compare entered quotes</button></form><div class="compare-result" id="compare-result" role="status" aria-live="polite" hidden></div><p>Supplier, specifications, delivery, taxes, and quotation date must be verified separately. Estimates are not a SAFA quote.</p>',
  },
  "digital-twin": {
    title: "Digital Twin Project Viewer",
    status: "PRIVATE PROJECT DATA NOT CONNECTED",
    description: "A secure project viewer needs verified customer sign-in, private project records, and approved site data. This page does not show fabricated schedules, photos, budgets, or progress.",
    link: `${home}#tracking`,
    linkText: "Read project update requirements",
    content: '<div class="twin-scene"><div class="twin-model"><span></span><span></span><span></span><span></span></div><div class="twin-orbit"></div><div class="twin-label">SAMPLE MODEL · OFFLINE</div></div><div class="availability-note"><strong>No live project record is available.</strong><p>Milestones, images, budgets, and status are private project data and must come from an authorized, authenticated system. This visual is a decorative placeholder, not a project twin.</p></div>',
  },
  moodboard: {
    title: "AI Design Moodboard",
    status: "BROWSER COLOUR BOARD · AI IMAGE GENERATION NOT CONNECTED",
    description: "Try a simple palette preview in this browser. Your selection is not uploaded or saved, and no AI-generated images are created.",
    link: `${home}#house-studio`,
    linkText: "Apply design choices in the 3D studio",
    content: '<div class="field-pair"><label>Design theme<select id="mood-select"><option value="coastal">Tropical</option><option value="earth">Traditional</option><option value="modern">Luxury modern</option><option value="minimal">Minimalist</option><option value="industrial">Industrial</option></select></label><label>Room or surface<select id="mood-room"><option>Living room</option><option>Kitchen</option><option>Bedroom</option><option>Exterior</option></select></label></div><div id="moodboard" class="moodboard" aria-label="Colour palette preview"><span></span><span></span><span></span></div><div class="moodboard-items" id="moodboard-items"><button type="button" data-mood-item="Wall finish">＋ Wall finish</button><button type="button" data-mood-item="Floor tile">＋ Floor tile</button><button type="button" data-mood-item="Wood tone">＋ Wood tone</button></div><ul id="moodboard-list" class="moodboard-list" aria-label="Selected moodboard items"></ul><p id="mood-status" class="tool-result" role="status" aria-live="polite"></p><button class="secondary-button" id="mood-export" type="button">Download moodboard brief</button>',
  },
  proposal: {
    title: "Instant Project Proposal Generator",
    status: "DOWNLOADABLE DISCUSSION DRAFT · NOT AN OFFICIAL PROPOSAL",
    description: "Prepare a short project discussion draft on this device. It is not a formal SAFA proposal, construction scope, confirmed estimate, or commitment.",
    link: `${home}#contact`,
    linkText: "Continue to project enquiry",
    content: '<form id="proposal-form" class="tool-form"><div class="field-pair"><label>Customer name (optional)<input name="customer" maxlength="100" placeholder="Name"></label><label>Project type<select name="type"><option>New home</option><option>Villa or duplex</option><option>Renovation</option><option>Planning or interiors</option></select></label></div><div class="field-pair"><label>Project location<input name="location" maxlength="100" placeholder="City or area"></label><label>Plot dimensions<input name="plot" maxlength="80" placeholder="e.g. 40 × 60 ft"></label></div><div class="field-pair"><label>Preferred style<select name="style"><option>Modern</option><option>Traditional</option><option>Tropical</option><option>Minimalist</option><option>Luxury modern</option></select></label><label>Number of floors<select name="floors"><option>1</option><option selected>2</option><option>3</option></select></label></div><div class="field-pair"><label>Target budget (optional)<input name="budget" maxlength="80" placeholder="Range or undecided"></label><label>Preferred schedule (optional)<input name="schedule" maxlength="100" placeholder="To be discussed"></label></div><label>Requested services or materials<input name="services" maxlength="250" placeholder="Planning, construction, interiors…"></label><label>Special requirements<textarea name="goals" maxlength="800" rows="4" placeholder="Priorities, approximate area, or questions"></textarea></label><div class="tool-actions"><button class="gold-button" type="submit">Download discussion draft</button><button class="secondary-button" id="proposal-print" type="button">Print draft</button></div></form><p id="proposal-status" class="tool-result" role="status" aria-live="polite"></p>',
  },
  journey: {
    title: "Interactive 3D Website Journey",
    status: "CINEMATIC INTRO · SOUND OFF BY DEFAULT",
    description: "Replay the SAFA brand introduction, skip it at any time, then continue through the website's 3D architecture and project gallery.",
    link: `${home}?replayIntro=1#top`,
    linkText: "Replay the SAFA introduction",
    content: '<p>The introduction does not autoplay sound. Use its visible Skip control to go straight to the site. Or explore each studio directly here.</p><div class="journey-path"><a href="floor-plan-generator.html"><span>01</span><strong>Plan</strong><small>Conceptual layout</small></a><i aria-hidden="true"></i><a href="material-selector.html"><span>02</span><strong>Design</strong><small>Materials & finishes</small></a><i aria-hidden="true"></i><a href="project-explorer.html"><span>03</span><strong>Explore</strong><small>Concept gallery</small></a><i aria-hidden="true"></i><a href="voice-assistant.html"><span>04</span><strong>Ask SAFA</strong><small>AI assistant</small></a><i aria-hidden="true"></i><a href="../index.html#contact"><span>05</span><strong>Enquire</strong><small>Talk to SAFA</small></a></div><a class="gold-button" href="../index.html?replayIntro=1#top">Replay cinematic introduction ↗</a>',
  },
  admin: {
    title: "Administration Dashboard",
    status: "ADMIN SIGN-IN · PRIVATE BUSINESS DATA NOT CONNECTED",
    description: "The floor-plan workspace is restricted to the configured admin account. Customer records, business management tools, and a private database are not connected.",
    link: `${home}#contact`,
    linkText: "Contact SAFA about secure project management",
    content: '<div class="admin-console" aria-label="Illustration of planned administration workspace"><div class="admin-console-bar"><span></span><span></span><span></span><strong>SAFA / OPERATIONS</strong></div><div class="admin-console-body"><div><i></i><i></i><i></i><i></i></div><section><span></span><span></span><span></span></section></div><p>VISUAL CONCEPT ONLY · NO ADMIN DATA CONNECTED</p></div><ul class="admin-requirements"><li>Private sign-in protects the floor-plan workspace</li><li>Private customer records and business database are not configured</li><li>Use a strong password stored in Vercel environment variables</li></ul><a class="gold-button" href="../admin-login.html">Admin sign in ↗</a>',
  },
};

const allFeatures = { ...features, ...(window.SAFAFutureFeatures || {}) };
const feature = allFeatures[document.body.dataset.feature];
if (!feature) {
  document.body.textContent = "This SAFA feature page could not be found.";
} else {
  document.title = `${feature.title} | SAFA CONSTRUCTION`;
  document.body.dataset.featurePage = document.body.dataset.feature;
  const studioOrder = ["floor-plan", "materials", "voice", "projects", "city", "sketch", "cutaway", "prices", "digital-twin", "moodboard", "proposal", "journey", "admin"];
  const studioNames = {
    "floor-plan": "Floor plan", materials: "Materials", voice: "SAFA AI", projects: "Projects",
    city: "City explorer", sketch: "Sketch-to-house", cutaway: "3D cutaway", prices: "Price compare",
    "digital-twin": "Digital twin", moodboard: "Moodboard",     proposal: "Proposal", journey: "3D journey", admin: "Admin setup",
  };
  const studioRoutes = {
    "floor-plan": "floor-plan-generator.html", materials: "material-selector.html", voice: "voice-assistant.html",
    projects: "project-explorer.html", city: "smart-city-explorer.html", sketch: "sketch-to-house.html",
    cutaway: "house-cutaway.html", prices: "material-price-comparison.html",
    "digital-twin": "digital-twin-viewer.html", moodboard: "design-moodboard.html",
    proposal: "project-proposal.html", journey: "website-journey.html", admin: "admin-dashboard.html",
  };
  const futureOrder = Object.keys(window.SAFAFutureFeatures || {});
  const futureNames = Object.fromEntries(futureOrder.map((id) => [id, allFeatures[id].title]));
  const futureRoutes = Object.fromEntries(futureOrder.map((id) => [id, allFeatures[id].route]));
  const isFutureFeature = Boolean(feature.category);
  const featureOrder = isFutureFeature ? futureOrder : studioOrder;
  const navigationOrder = document.body.dataset.feature === "floor-plan"
    ? featureOrder
    : featureOrder.filter((id) => id !== "floor-plan");
  const featureNames = isFutureFeature ? futureNames : studioNames;
  const featureRoutes = isFutureFeature ? futureRoutes : studioRoutes;
  const currentIndex = featureOrder.indexOf(document.body.dataset.feature);
  const featureNavigation = navigationOrder.map((id) =>
    `<a href="${featureRoutes[id]}"${id === document.body.dataset.feature ? ' aria-current="page"' : ""}>${String(featureOrder.indexOf(id) + 1).padStart(2, "0")} ${featureNames[id]}</a>`
  ).join("");
  const allToolsLink = isFutureFeature
    ? '<a href="future-lab.html">All 15 Future Lab features</a><a href="../index.html#innovation-studio">13 Innovation Studio tools</a>'
    : '<a href="../index.html#innovation-studio">13 Innovation Studio tools</a><a href="future-lab.html">Explore Future Lab</a>';
  const futureScene = isFutureFeature
    ? `<section class="future-feature" data-future-feature="${document.body.dataset.feature}"><div class="future-scene-wrap"><div class="future-scene" data-future-scene="${feature.model}" role="application" tabindex="0" aria-label="Interactive 3D ${feature.title} concept. Drag or use arrow keys to rotate; use plus and minus keys to zoom."><p class="future-scene-loading" data-future-loading>Loading interactive 3D concept…</p></div><span class="future-scene-caption">INTERACTIVE BROWSER CONCEPT · NOT A CONSTRUCTION MODEL</span></div><div class="future-feature-controls">${feature.controls}</div></section>`
    : "";
  const launchMarkup = isFutureFeature
    ? '<a class="gold-button feature-launch" href="../index.html#contact">Discuss a project with SAFA <span aria-hidden="true">↗</span></a>'
    : `<a class="gold-button feature-launch" href="${feature.link}">${feature.linkText} <span aria-hidden="true">↗</span></a>`;
  document.body.innerHTML = `
    <a class="skip-link" href="#feature-main">Skip to feature</a>
    <header class="feature-header"><a href="../index.html" aria-label="SAFA Construction home"><img src="../assets/safa-construction-logo-navy.png" alt="SAFA Construction"></a><nav aria-label="Feature navigation">${allToolsLink}<a href="../index.html#top">Main website</a></nav></header>
    <main id="feature-main" class="feature-main">
      <a class="back-link" href="${isFutureFeature ? "future-lab.html" : "../index.html#innovation-studio"}">← Back to ${isFutureFeature ? "SAFA Future Lab" : "all tools"}</a>
      <section class="feature-panel" aria-labelledby="feature-title">
        <div class="feature-hero"><div class="feature-copy"><p class="eyebrow">SAFA CONSTRUCTION · INDIVIDUAL FEATURE</p><p class="feature-status">${feature.status}</p><h1 id="feature-title">${feature.title}</h1><p class="feature-description">${feature.description}</p></div><div class="feature-blueprint" aria-hidden="true"><svg viewBox="0 0 360 260"><path d="M34 112 180 32l146 80M57 101v125h246V101M34 112v128h292V112M88 126h68v55H88zm116 0h68v55h-68zm-116 72h68v28H88zm116 0h68v28h-68zM18 242h324M48 96v144M312 96v144"/></svg><span>DESIGN / ${String(currentIndex + 1).padStart(2, "0")}</span></div></div>
        <div class="feature-content">${futureScene}${feature.content || ""}</div>
        <div class="feature-launch-row">${launchMarkup}<span class="concept-caption">PRELIMINARY DIGITAL DESIGN · REVIEW WITH QUALIFIED PROFESSIONALS</span></div>
      </section>
      <nav class="feature-switcher" aria-label="Switch between individual SAFA tools">${featureNavigation}</nav>
    </main>
    <footer class="feature-footer"><a href="../index.html">SAFA CONSTRUCTION</a><span>BUILDING YOUR VISION</span></footer>`;

  if (document.body.dataset.feature === "floor-plan") {
    const logoutButton = document.createElement("button");
    logoutButton.type = "button";
    logoutButton.className = "admin-sign-out";
    logoutButton.textContent = "Sign out";
    document.querySelector(".feature-header nav").append(logoutButton);
    logoutButton.addEventListener("click", async () => {
      logoutButton.disabled = true;
      try {
        const response = await fetch("/api/admin-logout", {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
        });
        if (!response.ok) throw new Error(`Sign-out returned HTTP ${response.status}.`);
        window.location.replace("../index.html");
      } catch (error) {
        logoutButton.disabled = false;
        console.error("SAFA admin sign-out failed.", error);
      }
    });
  }

  let sketchUrl = "";
  let currentPlan = [];
  let alternateLayout = false;
  let selectedPlanFloor = 1;
  let planMetadata = null;
  const renderPlan = (data) => {
    const svgNamespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNamespace, "svg");
    svg.setAttribute("viewBox", "0 0 720 460");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", `Editable conceptual floor ${selectedPlanFloor} plan`);
    svg.classList.add("editable-floor-plan");
    const outer = document.createElementNS(svgNamespace, "rect");
    outer.setAttribute("x", "18");
    outer.setAttribute("y", "18");
    outer.setAttribute("width", "684");
    outer.setAttribute("height", "410");
    outer.setAttribute("class", "plan-outline");
    svg.append(outer);
    const bedroomCount = Number(data.get("bedrooms"));
    const bathroomCount = Number(data.get("bathrooms"));
    const mainRooms = selectedPlanFloor === 1
      ? [
          { name: "Living", x: 22, y: 22, w: 330, h: 190 },
          { name: "Kitchen", x: 356, y: 22, w: 176, h: 190 },
          { name: "Dining", x: 536, y: 22, w: 162, h: 190 },
        ]
      : [
          { name: "Family lounge", x: 22, y: 22, w: 330, h: 190 },
          { name: "Primary suite", x: 356, y: 22, w: 176, h: 190 },
          { name: "Study / flex", x: 536, y: 22, w: 162, h: 190 },
        ];
    const rooms = [
      ...mainRooms,
      ...Array.from({ length: bedroomCount }, (_, index) => {
        const roomWidth = 680 / bedroomCount;
        return { name: `Bedroom ${index + 1}`, x: 20 + index * roomWidth, y: 216, w: roomWidth - 4, h: 100 };
      }),
      ...Array.from({ length: bathroomCount }, (_, index) => {
        const roomWidth = 355 / bathroomCount;
        return { name: bathroomCount > 1 ? `Bathroom ${index + 1}` : "Bathroom", x: 22 + index * roomWidth, y: 322, w: roomWidth - 4, h: 102 };
      }),
      { name: "Circulation", x: 382, y: 322, w: 170, h: 102 },
      { name: data.has("parking") ? "Parking" : data.has("balcony") ? "Balcony" : "Open court", x: 556, y: 322, w: 142, h: 102 },
    ];
    currentPlan = rooms.map((room) => ({
      ...room,
      name: alternateLayout
        ? room.name === "Kitchen" ? "Dining" : room.name === "Dining" ? "Kitchen" : room.name
        : room.name,
    }));
    currentPlan.forEach((room, index) => {
      const group = document.createElementNS(svgNamespace, "g");
      group.setAttribute("class", "plan-room");
      group.setAttribute("tabindex", "0");
      group.setAttribute("role", "group");
      group.setAttribute("aria-label", `${room.name}, drag to move; resize with its gold corner handle or Shift plus arrow keys`);
      group.dataset.index = String(index);
      group.dataset.x = String(room.x);
      group.dataset.y = String(room.y);
      const rectangle = document.createElementNS(svgNamespace, "rect");
      rectangle.setAttribute("x", String(room.x));
      rectangle.setAttribute("y", String(room.y));
      rectangle.setAttribute("width", String(room.w));
      rectangle.setAttribute("height", String(room.h));
      rectangle.setAttribute("rx", "3");
      const text = document.createElementNS(svgNamespace, "text");
      text.setAttribute("class", "plan-room-name");
      text.setAttribute("x", String(room.x + room.w / 2));
      text.setAttribute("y", String(room.y + room.h / 2 - 3));
      text.textContent = room.name;
      const sizeText = document.createElementNS(svgNamespace, "text");
      sizeText.setAttribute("x", String(room.x + room.w / 2));
      sizeText.setAttribute("y", String(room.y + room.h / 2 + 18));
      sizeText.setAttribute("class", "plan-room-size");
      const resizeHandle = document.createElementNS(svgNamespace, "circle");
      resizeHandle.setAttribute("cx", String(room.x + room.w));
      resizeHandle.setAttribute("cy", String(room.y + room.h));
      resizeHandle.setAttribute("r", "8");
      resizeHandle.setAttribute("class", "plan-room-resize");
      resizeHandle.setAttribute("aria-hidden", "true");
      group.append(rectangle, text, sizeText, resizeHandle);
      svg.append(group);
    });
    const windows = document.createElementNS(svgNamespace, "path");
    windows.setAttribute("d", "M130 18h70M390 18h58M18 90v55M702 112v60");
    windows.setAttribute("class", "plan-windows");
    svg.append(windows);
    const door = document.createElementNS(svgNamespace, "path");
    door.setAttribute("d", "M352 85a32 32 0 0 1 32 32M536 255a30 30 0 0 1 30 30M180 212v24");
    door.setAttribute("class", "plan-doors");
    svg.append(door);
    const road = document.createElementNS(svgNamespace, "text");
    road.setAttribute("x", "360");
    road.setAttribute("y", "451");
    road.setAttribute("class", "plan-road");
    road.textContent = `ROAD · ${data.get("road")} · CONCEPT ENTRY`;
    svg.append(road);
    const canvas = document.querySelector("#plan-canvas");
    canvas.replaceChildren(svg);
    canvas.style.setProperty("--plan-zoom", `${document.querySelector("#plan-zoom").value}%`);
    canvas.dataset.floor = String(selectedPlanFloor);
    const updateRoomGeometry = (group, room) => {
      const plotWidth = Number(planMetadata.get("width"));
      const plotLength = Number(planMetadata.get("length"));
      const units = planMetadata.get("units");
      const width = (room.w / 684 * plotWidth).toFixed(1);
      const length = (room.h / 410 * plotLength).toFixed(1);
      group.dataset.x = String(room.x);
      group.dataset.y = String(room.y);
      group.setAttribute("aria-label", `${room.name}, ${width} by ${length} ${units}, ${((Number(width) * Number(length))).toFixed(1)} square ${units}; drag to move, resize with its gold corner handle or Shift plus arrow keys`);
      const rectangle = group.querySelector("rect");
      rectangle.setAttribute("x", String(room.x));
      rectangle.setAttribute("y", String(room.y));
      rectangle.setAttribute("width", String(room.w));
      rectangle.setAttribute("height", String(room.h));
      const centerX = room.x + room.w / 2;
      const centerY = room.y + room.h / 2;
      const roomName = group.querySelector(".plan-room-name");
      roomName.setAttribute("x", String(centerX));
      roomName.setAttribute("y", String(centerY - 3));
      const size = group.querySelector(".plan-room-size");
      size.setAttribute("x", String(centerX));
      size.setAttribute("y", String(centerY + 18));
      size.textContent = `${width} × ${length} ${units} · ${(Number(width) * Number(length)).toFixed(1)} ${units}²`;
      const handle = group.querySelector(".plan-room-resize");
      handle.setAttribute("cx", String(room.x + room.w));
      handle.setAttribute("cy", String(room.y + room.h));
    };
    canvas.querySelectorAll(".plan-room").forEach((group) => {
      let start = null;
      const move = (event) => {
        if (!start) return;
        const point = svg.createSVGPoint();
        point.x = event.clientX;
        point.y = event.clientY;
        const local = point.matrixTransform(svg.getScreenCTM().inverse());
        const room = currentPlan[Number(group.dataset.index)];
        if (start.mode === "resize") {
          const minWidth = Math.max(36, 6 / Number(planMetadata.get("width")) * 684);
          const minHeight = Math.max(28, 6 / Number(planMetadata.get("length")) * 410);
          room.w = Math.round(Math.max(minWidth, Math.min(700 - room.x, start.w + local.x - start.pointerX)));
          room.h = Math.round(Math.max(minHeight, Math.min(420 - room.y, start.h + local.y - start.pointerY)));
        } else {
          room.x = Math.round(Math.max(20, Math.min(700 - room.w, start.x + local.x - start.pointerX)));
          room.y = Math.round(Math.max(20, Math.min(420 - room.h, start.y + local.y - start.pointerY)));
        }
        updateRoomGeometry(group, room);
        validatePlanOverlap();
      };
      group.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        const local = svg.createSVGPoint();
        local.x = event.clientX;
        local.y = event.clientY;
        const point = local.matrixTransform(svg.getScreenCTM().inverse());
        const room = currentPlan[Number(group.dataset.index)];
        start = {
          mode: event.target.closest(".plan-room-resize") ? "resize" : "move",
          x: room.x,
          y: room.y,
          w: room.w,
          h: room.h,
          pointerX: point.x,
          pointerY: point.y,
        };
        svg.setPointerCapture(event.pointerId);
      });
      svg.addEventListener("pointermove", move);
      svg.addEventListener("pointerup", () => { start = null; });
      svg.addEventListener("pointercancel", () => { start = null; });
      group.addEventListener("keydown", (event) => {
        if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
        event.preventDefault();
        const room = currentPlan[Number(group.dataset.index)];
        const delta = event.shiftKey ? 12 : 4;
        if (event.shiftKey) {
          const minWidth = Math.max(36, 6 / Number(planMetadata.get("width")) * 684);
          const minHeight = Math.max(28, 6 / Number(planMetadata.get("length")) * 410);
          room.w = Math.round(Math.max(minWidth, Math.min(700 - room.x, room.w + (event.key === "ArrowLeft" ? -delta : event.key === "ArrowRight" ? delta : 0))));
          room.h = Math.round(Math.max(minHeight, Math.min(420 - room.y, room.h + (event.key === "ArrowUp" ? -delta : event.key === "ArrowDown" ? delta : 0))));
        } else {
          room.x = Math.round(Math.max(20, Math.min(700 - room.w, room.x + (event.key === "ArrowLeft" ? -delta : event.key === "ArrowRight" ? delta : 0))));
          room.y = Math.round(Math.max(20, Math.min(420 - room.h, room.y + (event.key === "ArrowUp" ? -delta : event.key === "ArrowDown" ? delta : 0))));
        }
        updateRoomGeometry(group, room);
        validatePlanOverlap();
      });
      updateRoomGeometry(group, currentPlan[Number(group.dataset.index)]);
    });
    validatePlanOverlap();
  };
  const validatePlanOverlap = () => {
    let overlaps = false;
    currentPlan.forEach((room, index) => {
      const group = document.querySelector(`.plan-room[data-index="${index}"]`);
      const collides = currentPlan.some((other, otherIndex) => otherIndex !== index &&
        room.x < other.x + other.w && room.x + room.w > other.x &&
        room.y < other.y + other.h && room.y + room.h > other.y);
      group?.classList.toggle("is-overlapping", collides);
      overlaps ||= collides;
    });
    const result = document.querySelector("#floor-plan-result");
    document.querySelector("#plan-export-svg").disabled = overlaps;
    document.querySelector("#plan-export-json").disabled = overlaps;
    result.textContent = overlaps
      ? "Some concept rooms overlap. Move them apart before exporting. A professional must verify all dimensions, structure, safety, and local rules."
      : `Floor ${selectedPlanFloor} concept layout · ${currentPlan.length} editable room zones. Not an architectural drawing or approval.`;
  };
  document.querySelector("#floor-plan-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const width = Number(data.get("width"));
    const length = Number(data.get("length"));
    if (!Number.isFinite(width) || width < 10 || width > 500 || !Number.isFinite(length) || length < 10 || length > 500) {
      document.querySelector("#floor-plan-result").textContent = "Enter valid plot dimensions between 10 and 500 units. Local planning rules have not been verified.";
      return;
    }
    planMetadata = data;
    selectedPlanFloor = 1;
    alternateLayout = false;
    document.querySelector("#plan-workspace").hidden = false;
    document.querySelector("#plan-alternate").disabled = false;
    document.querySelector("#plan-floor-toggle").hidden = Number(data.get("floors")) < 2;
    document.querySelector("#plan-floor-toggle").textContent = Number(data.get("floors")) > 1 ? "Show floor 2" : "Single floor";
    renderPlan(planMetadata);
  });
  document.querySelector("#plan-alternate")?.addEventListener("click", () => {
    alternateLayout = !alternateLayout;
    renderPlan(planMetadata);
  });
  document.querySelector("#plan-floor-toggle")?.addEventListener("click", (event) => {
    const floors = Number(planMetadata?.get("floors") || 1);
    selectedPlanFloor = selectedPlanFloor % floors + 1;
    event.currentTarget.textContent = `Show floor ${selectedPlanFloor % floors + 1}`;
    renderPlan(planMetadata);
  });
  document.querySelector("#plan-zoom")?.addEventListener("input", (event) => {
    document.querySelector("#plan-canvas").style.setProperty("--plan-zoom", `${event.currentTarget.value}%`);
  });
  document.querySelector("#plan-export-svg")?.addEventListener("click", () => {
    const svg = document.querySelector("#plan-canvas svg");
    if (!svg || document.querySelector("#plan-export-svg").disabled) return;
    const exportSvg = svg.cloneNode(true);
    const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
    style.textContent = ".plan-outline{fill:#102746;stroke:#d6a34a;stroke-width:2}.plan-room rect{fill:#132f4d;stroke:#e3c173;stroke-width:1.3}.plan-room:nth-of-type(2n) rect{fill:#20374e}.plan-room text{fill:#f5eddb;font:12px Arial;text-anchor:middle}.plan-room .plan-room-size{fill:#d8c690;font:9px Arial}.plan-room-resize{display:none}.plan-windows{fill:none;stroke:#8de0ed;stroke-width:5;stroke-linecap:round}.plan-doors{fill:none;stroke:#ffe0a0;stroke-width:1.3;stroke-dasharray:4 4}.plan-road{fill:#f2d596;font:9px Arial;text-anchor:middle;letter-spacing:2px}";
    exportSvg.prepend(style);
    downloadText(new XMLSerializer().serializeToString(exportSvg), `safa-concept-floor-${selectedPlanFloor}.svg`, "image/svg+xml");
  });
  document.querySelector("#plan-export-json")?.addEventListener("click", () => {
    if (!planMetadata || document.querySelector("#plan-export-json").disabled) return;
    const result = { ...Object.fromEntries(planMetadata.entries()), selectedFloor: selectedPlanFloor, rooms: currentPlan, conceptualOnly: true };
    downloadText(JSON.stringify(result, null, 2), `safa-concept-floor-${selectedPlanFloor}.json`, "application/json");
  });

  document.querySelector("#city-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const location = new FormData(event.currentTarget).get("location").trim();
    document.querySelector("#city-result").textContent = `${location} added to this local planning note. Maps, local regulations, and site conditions have not been checked.`;
  });
  document.querySelectorAll("[data-city-zone]").forEach((zone) => {
    zone.addEventListener("click", () => {
      document.querySelectorAll("[data-city-zone]").forEach((item) => item.classList.toggle("is-selected", item === zone));
      document.querySelector("#city-zone-status").textContent = `Conceptual ${zone.dataset.cityZone} zone selected. This illustration is not a surveyed or approved plan.`;
    });
  });

  document.querySelector("#sketch-file")?.addEventListener("change", (event) => {
    const file = event.currentTarget.files?.[0];
    const image = document.querySelector("#sketch-preview");
    const status = document.querySelector("#sketch-status");
    if (sketchUrl) URL.revokeObjectURL(sketchUrl);
    sketchUrl = "";
    image.hidden = true;
    image.removeAttribute("src");
    if (!file) {
      status.textContent = "Your image stays in this browser tab.";
      return;
    }
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) {
      status.textContent = "Choose a PNG, JPEG, or WebP image smaller than 10 MB.";
      event.currentTarget.value = "";
      return;
    }
    sketchUrl = URL.createObjectURL(file);
    image.src = sketchUrl;
    image.hidden = false;
    status.textContent = `${file.name} is previewed locally. It was not uploaded or converted by AI.`;
  });
  window.addEventListener("pagehide", () => {
    if (sketchUrl) URL.revokeObjectURL(sketchUrl);
  });

  document.querySelector("#mood-select")?.addEventListener("change", (event) => {
    const palettes = {
      coastal: { colors: ["#e8e0d2", "#102746", "#d6a34a"], label: "Coastal ivory · soft ivory, navy, and warm gold." },
      earth: { colors: ["#d8c3a5", "#725943", "#aab6a0"], label: "Earth & timber · sandstone, walnut, and sage." },
      modern: { colors: ["#d9dce0", "#252a31", "#b97859"], label: "Modern charcoal · cool stone, charcoal, and clay." },
      minimal: { colors: ["#f1eee7", "#c8c1b5", "#89919a"], label: "Minimalist · warm white, limestone, and quiet grey." },
      industrial: { colors: ["#59636d", "#252a31", "#a88b58"], label: "Industrial · slate, charcoal, and muted brass." },
    };
    const palette = palettes[event.currentTarget.value];
    document.querySelectorAll("#moodboard span").forEach((swatch, index) => { swatch.style.backgroundColor = palette.colors[index]; });
    document.querySelector("#mood-status").textContent = `${document.querySelector("#mood-room").value} · ${palette.label}`;
  });
  document.querySelector("#mood-select")?.dispatchEvent(new Event("change"));
  document.querySelector("#mood-room")?.addEventListener("change", () => document.querySelector("#mood-select").dispatchEvent(new Event("change")));
  document.querySelectorAll("[data-mood-item]").forEach((button) => {
    button.addEventListener("click", () => {
      const list = document.querySelector("#moodboard-list");
      const item = document.createElement("li");
      item.textContent = button.dataset.moodItem;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "Remove";
      remove.setAttribute("aria-label", `Remove ${button.dataset.moodItem}`);
      remove.addEventListener("click", () => item.remove());
      item.append(remove);
      list.append(item);
    });
  });
  document.querySelector("#mood-export")?.addEventListener("click", () => {
    const items = [...document.querySelectorAll("#moodboard-list li")].map((item) => item.firstChild.textContent);
    const palette = document.querySelector("#mood-status").textContent;
    downloadText([
      "SAFA CONSTRUCTION — Browser moodboard concept",
      `Theme: ${document.querySelector("#mood-select").selectedOptions[0].text}`,
      `Room / surface: ${document.querySelector("#mood-room").value}`,
      `Palette: ${palette}`,
      `Selected inspiration: ${items.join(", ") || "None added"}`,
      "This is a local colour/inspiration brief, not AI-generated imagery or a supplier product specification.",
    ].join("\n"), "safa-browser-moodboard.txt");
  });

  const materialCatalog = {
    wall: [
      { value: "#e8e0d2", name: "Warm ivory" },
      { value: "#aab6a0", name: "Sage stone" },
      { value: "#555555", name: "Deep charcoal" },
      { value: "#b97859", name: "Clay terracotta" },
    ],
    roof: [
      { value: "charcoal", color: "#34383b", name: "Charcoal metal" },
      { value: "slate", color: "#59636d", name: "Natural slate" },
      { value: "terracotta", color: "#a9583b", name: "Terracotta tile" },
    ],
    glazing: [
      { value: "clear", color: "#73797d", name: "Clear silver" },
      { value: "bronze", color: "#929292", name: "Soft silver tint" },
      { value: "smoky", color: "#555b60", name: "Smoked graphite" },
    ],
  };
  const selectedMaterials = new Map();
  const renderMaterialSwatches = () => {
    const surface = document.querySelector("#material-surface").value;
    const container = document.querySelector("#material-swatches");
    const options = materialCatalog[surface];
    container.replaceChildren(...options.map((material) => {
      const button = document.createElement("button");
      const isWall = surface === "wall";
      button.type = "button";
      button.dataset.value = material.value;
      button.dataset.color = isWall ? material.value : material.color;
      button.setAttribute("aria-label", material.name);
      button.setAttribute("aria-pressed", String(selectedMaterials.get(surface)?.value === material.value));
      button.style.setProperty("--swatch", button.dataset.color);
      button.classList.toggle("is-selected", selectedMaterials.get(surface)?.value === material.value);
      button.addEventListener("click", () => {
        selectedMaterials.set(surface, material);
        container.querySelectorAll("button").forEach((item) => {
          item.classList.toggle("is-selected", item === button);
          item.setAttribute("aria-pressed", String(item === button));
        });
        document.querySelector("#material-selection").textContent = `${material.name} · visual sample only`;
        const parameter = surface === "wall" ? "houseColor" : surface === "roof" ? "houseRoof" : "houseGlazing";
        document.querySelector("#material-preview-link").href = `../index.html?${parameter}=${encodeURIComponent(material.value)}#house-studio`;
      });
      return button;
    }));
    const previouslySelected = selectedMaterials.get(surface);
    const first = container.querySelector("button");
    const selected = previouslySelected
      ? [...container.querySelectorAll("button")].find((button) => button.dataset.value === previouslySelected.value)
      : first;
    selected?.click();
  };
  document.querySelector("#material-surface")?.addEventListener("change", renderMaterialSwatches);
  if (document.querySelector("#material-surface")) renderMaterialSwatches();
  document.querySelector("#material-compare")?.addEventListener("click", () => {
    const swatches = [...document.querySelectorAll("#material-swatches button")];
    const comparison = document.querySelector("#material-comparison");
    comparison.hidden = false;
    comparison.replaceChildren(...swatches.map((button) => {
      const chip = document.createElement("span");
      chip.style.backgroundColor = button.dataset.color;
      chip.title = button.getAttribute("aria-label");
      chip.setAttribute("aria-label", button.getAttribute("aria-label"));
      return chip;
    }));
  });

  document.querySelectorAll("[data-project-image]").forEach((button) => {
    button.addEventListener("click", () => {
      const lightbox = document.querySelector("#project-lightbox");
      const image = document.querySelector("#project-lightbox-image");
      image.src = button.dataset.projectImage;
      image.alt = button.querySelector("img").alt;
      lightbox.hidden = false;
      lightbox.focus?.();
    });
  });
  document.querySelector("#project-lightbox-close")?.addEventListener("click", () => {
    document.querySelector("#project-lightbox").hidden = true;
    document.querySelector("#project-lightbox-image").removeAttribute("src");
  });
  document.querySelector("#project-lightbox")?.addEventListener("click", (event) => {
    if (event.target.id === "project-lightbox") document.querySelector("#project-lightbox-close").click();
  });

  document.querySelector("#cutaway-wall")?.addEventListener("click", (event) => {
    const building = document.querySelector("#cutaway-building");
    const hidden = building.dataset.wall !== "hidden";
    building.dataset.wall = hidden ? "hidden" : "shown";
    event.currentTarget.textContent = hidden ? "Reveal sample wall" : "Hide sample wall";
  });
  document.querySelector("#cutaway-floor")?.addEventListener("click", (event) => {
    const building = document.querySelector("#cutaway-building");
    const upperOnly = building.dataset.floor !== "upper";
    building.dataset.floor = upperOnly ? "upper" : "both";
    event.currentTarget.textContent = upperOnly ? "Show both sample floors" : "Show upper floor only";
  });

  document.querySelector("#compare-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const rateA = Number(data.get("aRate"));
    const rateB = Number(data.get("bRate"));
    const quantity = Number(data.get("quantity"));
    const wastage = Number(data.get("wastage"));
    if ([rateA, rateB, quantity, wastage].some((value) => !Number.isFinite(value)) || quantity <= 0 || wastage < 0 || wastage > 50) {
      document.querySelector("#compare-result").textContent = "Enter valid rates and quantity. Wastage must be between 0 and 50%.";
      document.querySelector("#compare-result").hidden = false;
      return;
    }
    const totalA = rateA * quantity * (1 + wastage / 100);
    const totalB = rateB * quantity * (1 + wastage / 100);
    const currency = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);
    const output = document.querySelector("#compare-result");
    output.replaceChildren();
    output.hidden = false;
    [
      `${String(data.get("aName") || "Quote A")} · ${currency(totalA)}`,
      `${String(data.get("bName") || "Quote B")} · ${currency(totalB)}`,
      `Calculated from your entered rates and quantity (${quantity}) with ${wastage}% wastage. Prices are user-entered and not verified.`,
    ].forEach((line) => {
      const p = document.createElement("p");
      p.textContent = line;
      output.append(p);
    });
  });

  const buildProposalDraft = (data) => [
      "SAFA CONSTRUCTION — Preliminary project discussion draft",
      "",
      `Customer: ${String(data.get("customer") || "").trim() || "Not specified"}`,
      `Project type: ${data.get("type")}`,
      `Location: ${String(data.get("location") || "").trim() || "Not specified"}`,
      `Plot dimensions: ${String(data.get("plot") || "").trim() || "Not specified"}`,
      `Preferred style: ${data.get("style")}`,
      `Number of floors: ${data.get("floors")}`,
      `Requested services / materials: ${String(data.get("services") || "").trim() || "To be discussed"}`,
      `Target budget: ${String(data.get("budget") || "").trim() || "Not specified"}`,
      `Preferred schedule: ${String(data.get("schedule") || "").trim() || "To be discussed"}`,
      "",
      "Customer requirements:",
      String(data.get("goals") || "").trim() || "To be discussed with the SAFA team.",
      "",
      "Concept overview: To be developed after project discussion and professional review.",
      "Proposed scope: To be confirmed by SAFA CONSTRUCTION after review; no work scope is approved by this draft.",
      "Materials: No supplier products or prices are specified by this draft.",
      "Preliminary cost: Not calculated; a project-specific quotation requires review of the approved scope and site conditions.",
      "Milestones: Schedule to be discussed after scope, approvals, and site conditions are reviewed.",
      "Assumptions and exclusions: Local approvals, structural design, fire safety, accessibility, detailed drawings, site conditions, taxes, and supplier prices are not verified here.",
      "Next step: Discuss requirements with SAFA CONSTRUCTION and obtain professional review.",
      "",
      "This is a browser-generated discussion draft only, not an official proposal, quotation, approved design, or commitment.",
    ].join("\n");
  const showProposalPrintout = (draft) => {
    const printout = document.querySelector("#proposal-printout") || document.createElement("article");
    printout.id = "proposal-printout";
    printout.textContent = draft;
    if (!printout.isConnected) document.body.append(printout);
    printout.hidden = false;
  };
  document.querySelector("#proposal-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const draft = buildProposalDraft(new FormData(event.currentTarget));
    downloadText(draft, "safa-project-discussion-draft.txt");
    const output = document.querySelector("#proposal-status");
    output.textContent = "Preliminary discussion draft prepared. Not an official proposal or quotation.";
    showProposalPrintout(draft);
  });
  document.querySelector("#proposal-print")?.addEventListener("click", () => {
    const form = document.querySelector("#proposal-form");
    if (!form.reportValidity()) return;
    showProposalPrintout(buildProposalDraft(new FormData(form)));
    window.setTimeout(() => window.print(), 80);
  });
}

function downloadText(text, filename, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
