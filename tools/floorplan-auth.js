const verifyFloorPlanAdmin = async () => {
  document.body.textContent = "Verifying admin access…";
  try {
    const response = await fetch("/api/admin-session", {
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Admin session check returned HTTP ${response.status}.`);
    const session = await response.json();
    if (session.authorized !== true) {
      const loginUrl = new URL("../admin-login.html", window.location.href);
      loginUrl.searchParams.set("next", "/tools/floor-plan-generator.html");
      window.location.replace(loginUrl);
      return;
    }

    const featureScript = document.createElement("script");
    featureScript.src = "feature-pages.js";
    featureScript.onerror = () => {
      document.body.textContent = "The admin floor-plan workspace could not be loaded. Please refresh or contact the site administrator.";
    };
    document.body.append(featureScript);
  } catch (error) {
    document.body.textContent = "The admin-only floor plan requires the secured SAFA website deployment. Access could not be verified.";
    console.error("SAFA admin access check failed.", error);
  }
};

void verifyFloorPlanAdmin();
