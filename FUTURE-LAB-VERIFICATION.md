# SAFA Future Lab — implementation and verification

## Access

The Future Lab is linked from the main navigation and the Innovation Studio on the home page. Its hub at `tools/future-lab.html` has live search and four category filters. Each of the 15 entries opens its own addressable page, and each feature page links back to the hub, the existing 13 Innovation Studio tools, and the main site. All `/tools/` routes and their supporting assets require a valid admin session; unauthenticated requests redirect to admin sign-in and return to the requested route after successful sign-in. The homepage Innovation Studio previews and SAFA AI assistant are hidden unless the admin session check succeeds. Chat and speech API requests also require an admin session.

| # | Category | Feature | Individual page | Browser interaction / availability |
|---|---|---|---|---|
| 1 | 3D & Immersive | VR House Walkthrough | `tools/vr-house-walkthrough.html` | Rotatable 3D house, room viewpoints, recenter, and an explicit WebXR immersive-VR support check. VR requires a compatible device, browser, and secure context. |
| 2 | Design Studio | Interactive Room Customizer | `tools/interactive-room-customizer.html` | Change room wall/floor/furniture samples, view the 3D room, and save the configuration to this browser's local storage. |
| 3 | Design Studio | Architecture Style Matcher | `tools/architecture-style-matcher.html` | Enter priorities, floors, and rooms for a rule-based design suggestion and corresponding procedural house concept. Not AI. |
| 4 | Guided Experiences | Plot-to-Property Journey | `tools/plot-to-property-journey.html` | Five-step project guide with previous/next controls and local-only step saving. No project is tracked. |
| 5 | Planning & Intelligence | Comfort Design Assistant | `tools/comfort-design-assistant.html` | Produce general shade/daylight/ventilation discussion prompts from form selections. No weather, site, or code analysis. |
| 6 | Guided Experiences | Blueprint Transformation Animation | `tools/blueprint-transformation.html` | Play, pause, replay, and adjust a blueprint-style-to-massing 3D visual transition. Not a construction sequence. |
| 7 | Design Studio | Facade Material Swap | `tools/facade-material-swap.html` | Change the procedural house's facade/roof colours and style; download a visual finish brief. No product or supplier catalogue. |
| 8 | Design Studio | Interior Lighting Studio | `tools/interior-lighting-studio.html` | Change room type, lighting mood, and visual brightness in the 3D room. No lux or electrical calculation. |
| 9 | 3D & Immersive | Interactive Miniature House | `tools/interactive-miniature-house.html` | Rotate and zoom a multi-floor house massing concept; switch floor visibility and inspect a general concept label. |
| 10 | Planning & Intelligence | Customer Requirements Checklist | `tools/customer-requirements-checklist.html` | Save a project checklist locally or download it. No enquiry or customer-data service is configured. |
| 11 | 3D & Immersive | SAFA Hologram Mode | `tools/safa-hologram-mode.html` | Toggle a translucent, scan-line style on the 3D concept and change its glow. Screen effect only, not a physical hologram. |
| 12 | Guided Experiences | Build My House in Seconds | `tools/build-my-house.html` | Generate a procedural local 3D house massing from style, floors, and finish selections. No architectural drawing or AI generation. |
| 13 | Planning & Intelligence | Living Home Simulator | `tools/living-home-simulator.html` | Adjust illustrative daylight, shade, and ventilation scenarios. No sensors, energy model, or temperature prediction. |
| 14 | Planning & Intelligence | Blueprint Intelligence | `tools/blueprint-intelligence.html` | Preview an eligible image locally and calculate area only from dimensions the visitor enters. No OCR, AI drawing interpretation, or validation. |
| 15 | Guided Experiences | SAFA Mission Mode | `tools/safa-mission-mode.html` | Create, review, locally save, and download a project discussion brief. It is not submitted to SAFA and is not a quote or proposal. |

## Verification performed

- Browser-loaded `tools/future-lab.html`: all 15 cards, all five filters, and all 15 feature links were present.
- Browser-loaded individual 3D routes: a rendered Three.js canvas was present on the VR walkthrough, room customizer, architecture matcher, and blueprint-intelligence pages.
- Exercised the room customizer's wall and room selections and local-save action; the visible status correctly stated that data was saved only on the device.
- Exercised architecture-style matching; the result reflected the selected priority, floors, and room count and explicitly identified the recommendation as rule-based, not AI.
- Exercised the VR action on an unsupported device; the page reported WebXR unavailability and kept the browser 3D view available.
- Exercised entered-dimension area calculation; 12 × 8 metres displayed as 96.00 square metres with a note that the uploaded drawing was not interpreted.
- Shared feature pages provide responsive and reduced-motion CSS; 3D scenes support pointer, touch, and keyboard rotation/zoom, and fall back to a labelled illustration if WebGL or the Three.js CDN cannot load.

## Integration and limits

These are browser-side demonstrations, not configured enterprise services. VR depends on WebXR hardware/browser support and a secure origin. Three.js is loaded from the existing external CDN and requires network access. AI-backed style/image understanding, OCR, live weather/maps, supplier pricing, energy simulation, project accounts, private customer records, and enquiry submission are not connected. Local storage is device/browser-specific and is not a backup or a customer account. Visual house and room geometry is generated for demonstration and must not be used as measured drawings, structural advice, estimates, approvals, or construction instructions.

The existing home-page 3D House Designer also accepts a self-contained `.glb` up to 30 MB for local preview and material customization. A visitor can target an individual mesh or all meshes, choose a colour and finish, restore the source materials, or remove the imported model. The uploaded geometry is not remodeled, and the model file is never sent to a server. `.gltf`, `.obj`, `.fbx`, `.stl`, external linked textures, and meshes without an editable material are not supported by this importer. The attached reference image is a website screenshot, not a 3D model file.

The custom-model flow was exercised in the browser with a locally generated GLB: model parsing, mesh selection, colour/finish apply, original-material restore, and returning to the built-in house model all succeeded. A model-loader CDN 404 was caught during the first validation, so the loader source was changed to the verified Three.js r128 distribution and the full import/edit/remove flow was retested successfully.
