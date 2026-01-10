import express from "express";
import Message from "../models/Message.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* USER: send complaint */
router.post("/send", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "user")
      return res.status(403).json({ message: "Only users can send complaints" });

    const { category, title, message } = req.body;

    if (!title || !message)
      return res.status(400).json({ message: "Title & message are required" });

    const complaint = new Message({
      userId: req.user._id,
      adminId: req.user.adminId,
      title,
      message,
      category: category || "General"
    });

    await complaint.save();
    res.json({ message: "Complaint sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* USER: view own messages */
router.get("/my-messages", verifyToken, async (req, res) => {
  if (req.user.role !== "user")
    return res.status(403).json({ message: "Only users can view messages" });

  const msgs = await Message.find({ userId: req.user._id }).sort({
    createdAt: -1
  });

  res.json(msgs);
});

/* ADMIN: view all complaints */
router.get("/admin/messages", verifyToken, verifyAdmin, async (req, res) => {
  const msgs = await Message.find({ adminId: req.user._id })
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  res.json(msgs);
});

/* ADMIN: reply */
router.put("/reply/:id", verifyToken, verifyAdmin, async (req, res) => {
  const { reply } = req.body;

  const updated = await Message.findByIdAndUpdate(
    req.params.id,
    { reply, status: "answered" },
    { new: true }
  );

  res.json({ message: "Reply sent", updated });
});

/* ADMIN: delete a message */
router.delete("/delete/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const deleted = await Message.findOneAndDelete({
      _id: req.params.id,
      adminId: req.user._id
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Message not found or unauthorized"
      });
    }

    res.json({ message: "Message deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error deleting message" });
  }
});

export default router;
