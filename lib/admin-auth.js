const crypto = require("crypto");

const ADMIN_EMAIL = "safaconstruction62@gmail.com";
const ADMIN_SESSION_COOKIE = "safa_admin_session";
const ADMIN_SESSION_SECONDS = 8 * 60 * 60;

const isSameOrigin = (origin, host) => {
  try {
    return Boolean(origin) && new URL(origin).host === host;
  } catch {
    return false;
  }
};

const getAdminConfig = () => {
  const password = process.env.SAFA_ADMIN_PASSWORD || "";
  const sessionSecret = process.env.SAFA_ADMIN_SESSION_SECRET || "";
  if (password.length < 14) {
    return { error: "SAFA_ADMIN_PASSWORD must be at least 14 characters long." };
  }
  if (Buffer.byteLength(sessionSecret, "utf8") < 32) {
    return { error: "SAFA_ADMIN_SESSION_SECRET must contain at least 32 bytes." };
  }
  return { email: ADMIN_EMAIL, password, sessionSecret };
};

const constantTimeEqual = (actual, expected) => {
  const actualBytes = Buffer.from(actual, "utf8");
  const expectedBytes = Buffer.from(expected, "utf8");
  return actualBytes.length === expectedBytes.length && crypto.timingSafeEqual(actualBytes, expectedBytes);
};

const signAdminSession = (email, secret, now = Date.now()) => {
  const payload = Buffer.from(JSON.stringify({
    email,
    expiresAt: Math.floor(now / 1000) + ADMIN_SESSION_SECONDS,
  })).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
};

const readAdminSession = (req) => {
  const config = getAdminConfig();
  if (config.error) return false;
  const cookieHeader = req.headers.cookie || "";
  const token = cookieHeader.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`))
    ?.slice(ADMIN_SESSION_COOKIE.length + 1);
  if (!token) return false;

  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return false;
  const expectedSignature = crypto.createHmac("sha256", config.sessionSecret).update(payload).digest();
  let actualSignature;
  try {
    actualSignature = Buffer.from(signature, "base64url");
  } catch {
    return false;
  }
  if (actualSignature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(actualSignature, expectedSignature)) return false;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return session.email === config.email &&
      Number.isInteger(session.expiresAt) &&
      session.expiresAt > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
};

module.exports = {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_SECONDS,
  ADMIN_EMAIL,
  constantTimeEqual,
  getAdminConfig,
  isSameOrigin,
  readAdminSession,
  signAdminSession,
};
