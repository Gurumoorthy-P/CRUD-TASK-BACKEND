import { Router, Request, Response } from "express";
import User from "../models/user";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    if (!firstName || !lastName || !email || (phone === undefined || phone === null)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const phoneNumber = Number(phone);
    if (Number.isNaN(phoneNumber)) {
      return res.status(400).json({ message: "Phone must be a number" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    const created = await User.create({ firstName, lastName, email, phone: phoneNumber });
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone } = req.body;

    const updateObj: any = { firstName, lastName, email };
    if (phone !== undefined) {
      const phoneNumber = Number(phone);
      if (Number.isNaN(phoneNumber)) {
        return res.status(400).json({ message: "Phone must be a number" });
      }
      updateObj.phone = phoneNumber;
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      updateObj,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
