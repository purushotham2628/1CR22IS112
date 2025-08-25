const express = require("express");
const crypto = require("crypto");
const { saveMapping, getMapping } = require("../lib/store");
const { log } = require("logging-middleware");

const router = express.Router();

function makeCode(len = 6) {
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const bytes = crypto.randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

/**
 * POST /shorten
 * { longUrl: "https://example.com" }
 * -> { shortUrl, longUrl }
 */
router.post("/shorten", async (req, res) => {
  try {
    const { longUrl } = req.body || {};
    if (!longUrl || typeof longUrl !== "string") {
      await log("backend", "warn", "controller", "longUrl missing/invalid");
      return res.status(400).json({ error: "longUrl is required" });
    }

    // Basic URL validation:
    try {
      const u = new URL(longUrl);
      if (!(u.protocol === "http:" || u.protocol === "https:")) {
        throw new Error("protocol");
      }
    } catch {
      await log("backend", "warn", "controller", "invalid URL format");
      return res.status(400).json({ error: "invalid url" });
    }

    // Generate unique code (retry a few times if collision)
    let code = null;
    for (let i = 0; i < 5; i++) {
      const candidate = makeCode(6 + i); // increase length if needed
      if (!getMapping(candidate)) {
        code = candidate;
        break;
      }
    }
    if (!code) {
      await log("backend", "error", "service", "failed to generate code");
      return res.status(503).json({ error: "try again" });
    }

    saveMapping(code, longUrl);
    const shortUrl = `${req.protocol}://${req.get("host")}/${code}`;
    await log("backend", "info", "service", `short created ${code} -> ${longUrl}`);

    return res.status(200).json({ shortUrl, longUrl });
  } catch (e) {
    await log("backend", "fatal", "controller", `shorten error: ${e.message}`);
    return res.status(500).json({ error: "server error" });
  }
});

/**
 * GET /:code  -> 302 redirect
 */
router.get("/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const rec = getMapping(code);
    if (!rec) {
      await log("backend", "warn", "handler", `not found ${code}`);
      return res.status(404).json({ error: "not found" });
    }
    await log("backend", "info", "handler", `redirect ${code} -> ${rec.url}`);
    return res.redirect(302, rec.url);
  } catch (e) {
    await log("backend", "error", "handler", `redirect error: ${e.message}`);
    return res.status(500).json({ error: "server error" });
  }
});

module.exports = router;
