import express from "express";
import puppeteer from "puppeteer";

const router = express.Router();

router.get("/download", async (req, res) => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto("https://example.com", { waitUntil: "networkidle2" });

    const buffer = await page.screenshot();
    await browser.close();

    res.set("Content-Type", "image/png");
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ message: "Puppeteer error" });
  }
});

export default router;
