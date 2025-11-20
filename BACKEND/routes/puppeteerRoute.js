import express from "express";
import puppeteer from "puppeteer";

const router = express.Router();

// Example: Automate a download process
router.get("/download", async (req, res) => {
  try {
    // Launch Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Navigate to the page you want to download from
    await page.goto("https://example.com", { waitUntil: "networkidle2" });

    // Example: Take a screenshot (can be replaced with download logic)
    const screenshotBuffer = await page.screenshot();

    await browser.close();

    // Send the file to frontend
    res.set("Content-Type", "image/png");
    res.send(screenshotBuffer);
  } catch (error) {
    console.error("Puppeteer error:", error);
    res.status(500).json({ message: "Puppeteer download failed", error });
  }
});

export default router;
