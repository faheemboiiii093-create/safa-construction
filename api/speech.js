const { readAdminSession } = require("../lib/admin-auth");

const MAX_TEXT_LENGTH = 1800;
const MAX_REQUEST_BYTES = 5000;
const GOOGLE_TTS_URL = "https://texttospeech.googleapis.com/v1";
const SUPPORTED_LANGUAGES = new Set([
  "en-IN", "ta-IN", "hi-IN", "ml-IN", "te-IN", "kn-IN", "ar-SA",
  "es-ES", "fr-FR", "de-DE", "zh-CN", "bn-IN", "ur-PK", "mr-IN",
  "ja-JP", "pt-BR", "it-IT", "ko-KR", "ru-RU", "id-ID", "th-TH",
  "vi-VN", "tr-TR", "nl-NL", "pl-PL", "sv-SE", "fa-IR", "ne-NP",
  "si-LK", "pa-IN", "gu-IN", "or-IN", "as-IN",
]);
const SUPPORTED_LANGUAGE_BASES = new Set(
  [...SUPPORTED_LANGUAGES].map((languageCode) => languageCode.split("-")[0])
);

const sendJson = (res, status, payload) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
};

const parseBody = (body) => {
  if (typeof body !== "string") return body;
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
};

module.exports = async (req, res) => {
  if (!["GET", "POST"].includes(req.method)) {
    res.setHeader("Allow", "GET, POST");
    return sendJson(res, 405, { error: "Use GET to list voices or POST to synthesize speech." });
  }
  if (!readAdminSession(req)) {
    return sendJson(res, 401, { error: "Admin sign-in is required to use SAFA voice features." });
  }

  const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY;
  if (!apiKey) {
    return sendJson(res, 503, { error: "Cloud voice is not configured. Use an installed browser voice or type instead." });
  }

  const body = req.method === "POST" ? parseBody(req.body) : null;
  if (req.method === "POST" && (!body || typeof body !== "object" || Array.isArray(body))) {
    return sendJson(res, 400, { error: "The speech request must contain valid JSON." });
  }
  if (req.method === "POST" && Buffer.byteLength(JSON.stringify(body), "utf8") > MAX_REQUEST_BYTES) {
    return sendJson(res, 413, { error: "The speech request is too large." });
  }

  const languageCode = req.method === "GET"
    ? (typeof req.query?.languageCode === "string" ? req.query.languageCode : "")
    : (typeof body.languageCode === "string" ? body.languageCode : "");
  const languageBase = languageCode.split("-")[0];
  const supportedSynthesisLanguage = SUPPORTED_LANGUAGES.has(languageCode)
    || (/^[a-z]{2,3}-[A-Z]{2,3}$/.test(languageCode) && SUPPORTED_LANGUAGE_BASES.has(languageBase));
  if (req.method === "GET" ? !SUPPORTED_LANGUAGES.has(languageCode) : !supportedSynthesisLanguage) {
    return sendJson(res, 400, { error: "Choose a supported SAFA AI conversation language." });
  }

  if (req.method === "POST") {
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text || text.length > MAX_TEXT_LENGTH) {
      return sendJson(res, 400, { error: `Speech text must contain 1-${MAX_TEXT_LENGTH} characters.` });
    }
    const voiceName = typeof body.voiceName === "string" ? body.voiceName : "";
    if (voiceName && (!voiceName.startsWith(`${languageBase}-`) || !/^[a-zA-Z0-9-]{1,100}$/.test(voiceName))) {
      return sendJson(res, 400, { error: "Choose a voice provided for the selected language." });
    }
  }

  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(), 20000);
  try {
    const endpoint = req.method === "GET"
      ? `${GOOGLE_TTS_URL}/voices?languageCode=${encodeURIComponent(languageBase)}`
      : `${GOOGLE_TTS_URL}/text:synthesize`;
    const providerResponse = await fetch(endpoint, req.method === "GET" ? {
      headers: { "x-goog-api-key": apiKey },
      signal: timeoutController.signal,
    } : {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        input: { text: body.text.trim() },
        voice: {
          languageCode,
          ...(body.voiceName ? { name: body.voiceName } : {}),
          ssmlGender: "FEMALE",
        },
        audioConfig: { audioEncoding: "MP3" },
      }),
      signal: timeoutController.signal,
    });

    if (!providerResponse.ok) {
      let providerMessage = "";
      try {
        const result = await providerResponse.json();
        providerMessage = result.error?.message || "";
      } catch (error) {
        console.warn("Google Cloud TTS returned an unreadable error response.", error);
      }
      if (providerMessage) console.error("Google Cloud TTS request failed:", providerMessage.slice(0, 300));
      const unavailable = providerResponse.status === 400 || providerResponse.status === 404;
      return sendJson(res, unavailable ? 422 : 502, {
        error: unavailable
          ? "A cloud voice is not available for this language or text. Try a browser voice or another language."
          : "Cloud voice is temporarily unavailable. Try again or use a browser voice.",
      });
    }

    const result = await providerResponse.json();
    if (req.method === "GET") {
      const voices = (Array.isArray(result.voices) ? result.voices : [])
        .map((voice) => {
          const matchingLanguageCode = voice.languageCodes?.find((code) => code === languageCode)
            || voice.languageCodes?.find((code) => code.split("-")[0] === languageBase);
          return matchingLanguageCode ? { voice, matchingLanguageCode } : null;
        })
        .filter(Boolean)
        .map(({ voice, matchingLanguageCode }) => ({
          name: voice.name,
          gender: voice.ssmlGender,
          languageCode: matchingLanguageCode,
          naturalSampleRateHertz: voice.naturalSampleRateHertz,
        }))
        .filter((voice) => voice.name);
      return sendJson(res, 200, { languageCode, voices });
    }

    if (typeof result.audioContent !== "string" || !result.audioContent) {
      console.error("Google Cloud TTS returned no audio content.");
      return sendJson(res, 502, { error: "Cloud voice returned no audio. Try again or use a browser voice." });
    }
    const audio = Buffer.from(result.audioContent, "base64");
    res.statusCode = 200;
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", String(audio.length));
    res.setHeader("Cache-Control", "no-store");
    return res.end(audio);
  } catch (error) {
    console.error("Google Cloud TTS request failed:", error.name === "AbortError" ? "timeout" : error.message);
    return sendJson(res, 502, { error: "Cloud voice is temporarily unavailable. Try again or use a browser voice." });
  } finally {
    clearTimeout(timeout);
  }
};
