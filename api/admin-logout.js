const { ADMIN_SESSION_COOKIE, isSameOrigin } = require("../lib/admin-auth");

module.exports = (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: "Use POST to sign out." }));
  }
  const origin = req.headers.origin;
  if (!isSameOrigin(origin, req.headers.host)) {
    res.statusCode = 403;
    return res.end(JSON.stringify({ error: "Sign-out requests must come from this website." }));
  }
  const secure = process.env.NODE_ENV === "production" || req.headers["x-forwarded-proto"] === "https";
  res.setHeader("Set-Cookie", [
    `${ADMIN_SESSION_COOKIE}=`,
    "HttpOnly",
    "Path=/",
    "SameSite=Strict",
    "Max-Age=0",
    secure ? "Secure" : "",
  ].filter(Boolean).join("; "));
  res.statusCode = 200;
  return res.end(JSON.stringify({ ok: true }));
};
