const express = require("express");
const UAParser = require("ua-parser-js");
const { readDB, writeDB } = require("../models/db");

const router = express.Router();
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

router.get("/:shortCode", (req, res) => {
  try {
    const { shortCode } = req.params;
    if (shortCode.startsWith("api")) return res.status(404).json({ message: "Not found" });

    const db = readDB();
    const urlIdx = db.urls.findIndex((u) => u.shortCode === shortCode);
    if (urlIdx === -1) return res.status(404).send("Short link not found");

    const url = db.urls[urlIdx];

    // Parse device
    const ua = UAParser(req.headers["user-agent"]);
    const device = ua.device.type || "desktop";
    const browser = ua.browser.name || "unknown";

    // Record click
    db.clicks.push({ id: newId(), urlId: url.id, timestamp: new Date().toISOString(), ip: req.ip, device, browser });

    // Update stats
    db.urls[urlIdx].clickCount = (db.urls[urlIdx].clickCount || 0) + 1;
    db.urls[urlIdx].lastVisited = new Date().toISOString();

    writeDB(db);
    res.redirect(url.originalUrl);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
