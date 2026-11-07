(() => {
  const loginUrl = new URL("../admin-login.html", window.location.href);
  loginUrl.searchParams.set("next", window.location.pathname);

  document.body.hidden = true;

  fetch("/api/admin-session", {
    credentials: "same-origin",
    cache: "no-store",
  })
    .then((response) => {
      if (!response.ok) throw new Error(`Admin session check returned HTTP ${response.status}.`);
      return response.json();
    })
    .then((session) => {
      if (session.authorized !== true) {
        window.location.replace(loginUrl);
        return;
      }
      document.body.hidden = false;
    })
    .catch((error) => {
      console.warn("SAFA Future Lab access could not be verified.", error);
      window.location.replace(loginUrl);
    });
})();
