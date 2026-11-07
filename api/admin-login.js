const {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_SECONDS,
  constantTimeEqual,
  getAdminConfig,
  isSameOrigin,
  signAdminSession,
} = require("../lib/admin-auth");

const sendJson = (res, status, payload) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
};

module.exports = (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Use POST to sign in." });
  }
  const origin = req.headers.origin;
  if (!isSameOrigin(origin, req.headers.host)) {
    return sendJson(res, 403, { error: "Sign-in requests must come from this website." });
  }

  const config = getAdminConfig();
  if (config.error) {
    console.error("SAFA admin sign-in is not configured:", config.error);
    return sendJson(res, 503, { error: "Admin sign-in is not configured. Ask the site administrator to finish deployment setup." });
  }

  let body = req.body;
  if (typeof body === "string") {
    if (Buffer.byteLength(body, "utf8") > 2048) {
      return sendJson(res, 413, { error: "The sign-in request is too large." });
    }
    try {
      body = JSON.parse(body);
    } catch {
      return sendJson(res, 400, { error: "The sign-in request must contain valid JSON." });
    }
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return sendJson(res, 400, { error: "Enter your admin email and password." });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : "";
  const password = typeof body.password === "string" ? body.password.slice(0, 256) : "";
  if (!constantTimeEqual(email, config.email) || !constantTimeEqual(password, config.password)) {
    return sendJson(res, 401, { error: "The email or password is incorrect." });
  }

  const token = signAdminSession(config.email, config.sessionSecret);
  const secure = process.env.NODE_ENV === "production" || req.headers["x-forwarded-proto"] === "https";
  res.setHeader("Set-Cookie", [
    `${ADMIN_SESSION_COOKIE}=${token}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Strict",
    `Max-Age=${ADMIN_SESSION_SECONDS}`,
    secure ? "Secure" : "",
  ].filter(Boolean).join("; "));
  return sendJson(res, 200, { ok: true });
};
