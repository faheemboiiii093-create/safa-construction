const { readAdminSession } = require("../lib/admin-auth");

module.exports = (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: "Use GET to check admin access." }));
  }
  res.statusCode = 200;
  return res.end(JSON.stringify({ authorized: readAdminSession(req) }));
};
