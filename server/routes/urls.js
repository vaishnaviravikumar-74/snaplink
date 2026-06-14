const express = require("express");
const { customAlphabet } = require("nanoid");
const { readDB, writeDB } = require("../models/db");
const { protect } = require("../middleware/auth");

const router = express.Router();
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 6);
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

// POST /api/urls — shorten
router.post("/", protect, (req, res) => {
  try {
    let { originalUrl } = req.body;
    if (!originalUrl) return res.status(400).json({ message: "URL is required" });
    if (!/^https?:\/\//i.test(originalUrl)) originalUrl = "https://" + originalUrl;

    const db = readDB();
    let shortCode;
    do { shortCode = nanoid(); } while (db.urls.find((u) => u.shortCode === shortCode));

    const url = {
      id: newId(),
      shortCode,
      originalUrl,
      userId: req.user.id,
      clickCount: 0,
      lastVisited: null,
      createdAt: new Date().toISOString(),
    };
    db.urls.push(url);
    writeDB(db);

    res.status(201).json({ ...url, shortUrl: `${process.env.BASE_URL}/${shortCode}` });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/urls — all links for user
router.get("/", protect, (req, res) => {
  const db = readDB();
  const urls = db.urls
    .filter((u) => u.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((u) => ({ ...u, shortUrl: `${process.env.BASE_URL}/${u.shortCode}` }));
  res.json(urls);
});

// GET /api/urls/:id/analytics
router.get("/:id/analytics", protect, (req, res) => {
  const db = readDB();
  const url = db.urls.find((u) => u.id === req.params.id && u.userId === req.user.id);
  if (!url) return res.status(404).json({ message: "Link not found" });

  const clicks = db.clicks.filter((c) => c.urlId === url.id);

  // Last 7 days trend
  const now = new Date();
  const trend = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const count = clicks.filter((c) => c.timestamp.slice(0, 10) === dateStr).length;
    trend.push({ date: dateStr, count });
  }

  // Device breakdown
  const deviceMap = clicks.reduce((acc, c) => {
    acc[c.device] = (acc[c.device] || 0) + 1;
    return acc;
  }, {});

  res.json({
    url: { ...url, shortUrl: `${process.env.BASE_URL}/${url.shortCode}` },
    totalClicks: clicks.length,
    lastVisited: url.lastVisited,
    trend,
    deviceBreakdown: deviceMap,
  });
});

// DELETE /api/urls/:id
router.delete("/:id", protect, (req, res) => {
  const db = readDB();
  const idx = db.urls.findIndex((u) => u.id === req.params.id && u.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ message: "Link not found" });
  db.clicks = db.clicks.filter((c) => c.urlId !== req.params.id);
  db.urls.splice(idx, 1);
  writeDB(db);
  res.json({ message: "Deleted successfully" });
});

module.exports = router;
