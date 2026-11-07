const form = document.querySelector("#admin-login-form");
const status = document.querySelector("#login-status");
const submitButton = form.querySelector("button[type='submit']");
const passwordInput = document.querySelector("#admin-password");
const passwordToggle = document.querySelector("#password-toggle");

passwordToggle?.addEventListener("click", () => {
  const shouldShow = passwordInput.type === "password";
  passwordInput.type = shouldShow ? "text" : "password";
  passwordToggle.textContent = shouldShow ? "Hide" : "Show";
  passwordToggle.setAttribute("aria-pressed", String(shouldShow));
  passwordToggle.setAttribute("aria-label", shouldShow ? "Hide password" : "Show password");
  passwordInput.focus();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (window.location.protocol === "file:") {
    status.textContent = "Admin sign-in must run through the SAFA website on HTTPS or a local Vercel development server. Opening this file directly cannot authenticate securely.";
    return;
  }

  submitButton.disabled = true;
  status.textContent = "Checking admin credentials…";

  try {
    const response = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      cache: "no-store",
      body: JSON.stringify({
        email: form.elements.email.value,
        password: form.elements.password.value,
      }),
    });
    const responseText = await response.text();
    let result = {};
    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch {
      throw new Error("The sign-in service could not respond correctly. Please open the deployed HTTPS website and try again.");
    }
    if (!response.ok) throw new Error(result.error || "Sign-in failed. Please try again.");

    const requestedPath = new URLSearchParams(window.location.search).get("next");
    let destination = "/tools/future-lab.html";
    if (requestedPath) {
      const requestedUrl = new URL(requestedPath, window.location.origin);
      if (requestedUrl.origin === window.location.origin &&
          requestedUrl.pathname.startsWith("/tools/")) {
        destination = `${requestedUrl.pathname}${requestedUrl.search}${requestedUrl.hash}`;
      }
    }
    window.location.replace(destination);
  } catch (error) {
    status.textContent = error.message;
    submitButton.disabled = false;
  }
});
