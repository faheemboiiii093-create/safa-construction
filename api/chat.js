const { readAdminSession } = require("../lib/admin-auth");

const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY_MESSAGES = 10;
const MAX_REQUEST_BYTES = 12000;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

const languages = new Map([
  ["en-IN", "English"], ["ta-IN", "Tamil"], ["hi-IN", "Hindi"],
  ["ml-IN", "Malayalam"], ["te-IN", "Telugu"], ["kn-IN", "Kannada"],
  ["ar-SA", "Arabic"], ["es-ES", "Spanish"], ["fr-FR", "French"],
  ["de-DE", "German"], ["zh-CN", "Chinese"], ["bn-IN", "Bengali"],
  ["ur-PK", "Urdu"], ["mr-IN", "Marathi"], ["ja-JP", "Japanese"],
  ["pt-BR", "Portuguese"], ["it-IT", "Italian"], ["ko-KR", "Korean"],
  ["ru-RU", "Russian"], ["id-ID", "Indonesian"], ["th-TH", "Thai"],
  ["vi-VN", "Vietnamese"], ["tr-TR", "Turkish"], ["nl-NL", "Dutch"],
  ["pl-PL", "Polish"], ["sv-SE", "Swedish"], ["fa-IR", "Persian"],
  ["ne-NP", "Nepali"], ["si-LK", "Sinhala"], ["pa-IN", "Punjabi"],
  ["gu-IN", "Gujarati"], ["or-IN", "Odia"], ["as-IN", "Assamese"],
]);

const SYSTEM_PROMPT = [
  "You are SAFA AI, the helpful construction website assistant for SAFA CONSTRUCTION in India.",
  "Reply in the selected language specified in the request. If the language is set to auto-detect, identify the language of the latest user message and reply in that language and script. Use clear, natural phrasing and explain technical construction terms simply.",
  "You may explain the site's listed services, the preliminary home planning brief, and its illustrative cost estimator.",
  "Never invent company services, project availability, completed projects, prices, quotes, approvals, timelines, or contact details.",
  "The website's cost estimate is illustrative, not a quote; its planning brief is not an architectural or structural plan.",
  "For construction estimates, ask concise follow-up questions about missing details such as location, built-up area, floors, finish level, and scope. Explain that any estimate is preliminary and depends on location, materials, labour, structural design, and site conditions.",
  "For structural, legal, code-compliance, safety, or site-specific decisions, recommend a qualified local architect or engineer.",
  "Do not request sensitive personal information. Keep replies concise and useful.",
].join(" ");

const sendJson = (res, status, payload) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Use POST to send a chat message." });
  }
  if (!readAdminSession(req)) {
    return sendJson(res, 401, { error: "Admin sign-in is required to use the SAFA AI assistant." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return sendJson(res, 503, { error: "The SAFA AI service is not configured yet." });
  }

  let body = req.body;
  if (typeof body === "string") {
    if (Buffer.byteLength(body, "utf8") > MAX_REQUEST_BYTES) {
      return sendJson(res, 413, { error: "The chat request is too large." });
    }
    try {
      body = JSON.parse(body);
    } catch {
      return sendJson(res, 400, { error: "The chat request must contain valid JSON." });
    }
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return sendJson(res, 400, { error: "The chat request must contain a message." });
  }
  if (Buffer.byteLength(JSON.stringify(body), "utf8") > MAX_REQUEST_BYTES) {
    return sendJson(res, 413, { error: "The chat request is too large." });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return sendJson(res, 400, { error: `Messages must contain 1-${MAX_MESSAGE_LENGTH} characters.` });
  }

  const languageCode = typeof body.languageCode === "string" ? body.languageCode : "";
  const language = languageCode === "auto"
    ? "automatic detection from the latest user message"
    : languages.get(languageCode);
  if (!language) {
    return sendJson(res, 400, { error: "Choose a supported conversation language." });
  }

  const history = Array.isArray(body.history)
    ? body.history.slice(-MAX_HISTORY_MESSAGES).flatMap((item) => {
      if (!item || !["user", "assistant"].includes(item.role) || typeof item.content !== "string") return [];
      const content = item.content.trim().slice(0, MAX_MESSAGE_LENGTH);
      return content ? [{ role: item.role, content }] : [];
    })
    : [];
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: `${SYSTEM_PROMPT} The user's selected language is ${language} (${languageCode}).` },
          ...history,
          { role: "user", content: message },
        ],
        max_tokens: 500,
        temperature: 0.4,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error("SAFA AI provider returned HTTP", response.status);
      return sendJson(res, 502, { error: "The AI provider could not complete this reply. Please try again." });
    }

    const result = await response.json();
    const reply = result.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      console.error("SAFA AI provider returned an empty reply.");
      return sendJson(res, 502, { error: "The AI provider returned an empty reply. Please try again." });
    }

    return sendJson(res, 200, { reply: reply.trim().slice(0, 3000), languageCode });
  } catch (error) {
    console.error("SAFA AI provider request failed:", error.name === "AbortError" ? "timeout" : error.message);
    return sendJson(res, 502, { error: "SAFA AI is temporarily unavailable. Please try again." });
  } finally {
    clearTimeout(timeout);
  }
};
