const ADMIN_EMAIL = "safaconstruction62@gmail.com";
const SESSION_COOKIE = "safa_admin_session";

const hasValidAdminSession = async (request) => {
  const password = process.env.SAFA_ADMIN_PASSWORD;
  const secret = process.env.SAFA_ADMIN_SESSION_SECRET;
  if (!password || password.length < 14 ||
      !secret || new TextEncoder().encode(secret).length < 32) return false;

  const cookieHeader = request.headers.get("cookie") || "";
  const token = cookieHeader.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1);
  if (!token) return false;

  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return false;
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const payloadBytes = new TextEncoder().encode(payload);
    const signatureBytes = Uint8Array.from(atob(signature.replace(/-/g, "+").replace(/_/g, "/")), (character) => character.charCodeAt(0));
    if (!await crypto.subtle.verify("HMAC", key, signatureBytes, payloadBytes)) return false;

    const decodedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const session = JSON.parse(atob(decodedPayload));
    return session.email === ADMIN_EMAIL &&
      Number.isInteger(session.expiresAt) &&
      session.expiresAt > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
};

export const config = {
  matcher: [
    "/tools/future-lab.html",
    "/tools/vr-house-walkthrough.html",
    "/tools/interactive-room-customizer.html",
    "/tools/architecture-style-matcher.html",
    "/tools/plot-to-property-journey.html",
    "/tools/comfort-design-assistant.html",
    "/tools/blueprint-transformation.html",
    "/tools/facade-material-swap.html",
    "/tools/interior-lighting-studio.html",
    "/tools/interactive-miniature-house.html",
    "/tools/customer-requirements-checklist.html",
    "/tools/safa-hologram-mode.html",
    "/tools/build-my-house.html",
    "/tools/living-home-simulator.html",
    "/tools/blueprint-intelligence.html",
    "/tools/safa-mission-mode.html",
  ],
  runtime: "nodejs",
};

export default async function middleware(request: Request) {
  if (await hasValidAdminSession(request)) return;

  const loginUrl = new URL("/admin-login.html", request.url);
  const requestedUrl = new URL(request.url);
  loginUrl.searchParams.set("next", `${requestedUrl.pathname}${requestedUrl.search}`);
  return new Response(null, {
    status: 302,
    headers: {
      Location: loginUrl.toString(),
      "Cache-Control": "no-store",
    },
  });
}
