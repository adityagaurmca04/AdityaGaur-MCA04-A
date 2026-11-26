const express = require("express");
const User = require("../models/User");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();
const studentFields = ["name", "email", "password", "phone", "course", "enrollmentNo", "dateOfBirth", "address"];
const selfServiceFields = ["name", "phone", "course", "dateOfBirth", "address"];

function pickFields(source, allowedFields) {
  return Object.fromEntries(
    allowedFields.filter((field) => Object.prototype.hasOwnProperty.call(source, field))
      .map((field) => [field, source[field]])
  );
}

router.use(authenticate);

router.get("/me", authorize("student"), async (req, res, next) => {
  try {
    const student = await User.findById(req.user.id);
    return res.json({ student });
  } catch (error) {
    return next(error);
  }
});

router.patch("/me", authorize("student"), async (req, res, next) => {
  try {
    const updates = pickFields(req.body, selfServiceFields);
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No editable profile fields provided" });
    }

    const student = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true
    });
    return res.json({ student });
  } catch (error) {
    return next(error);
  }
});

router.get("/", authorize("admin"), async (req, res, next) => {
  try {
    const students = await User.find({ role: "student" }).sort({ name: 1 });
    return res.json({ students });
  } catch (error) {
    return next(error);
  }
});

router.post("/", authorize("admin"), async (req, res, next) => {
  try {
    const studentData = pickFields(req.body, studentFields);
    if (!studentData.name || !studentData.email || !studentData.password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    if (typeof studentData.password !== "string" || studentData.password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const student = await User.create(studentData);
    return res.status(201).json({ student });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", authorize("admin"), async (req, res, next) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: "student" });
    if (!student) return res.status(404).json({ message: "Student not found" });
    return res.json({ student });
  } catch (error) {
    return next(error);
  }
});

router.patch("/:id", authorize("admin"), async (req, res, next) => {
  try {
    const updates = pickFields(req.body, studentFields.filter((field) => field !== "password"));
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No student fields provided" });
    }
    const student = await User.findOneAndUpdate(
      { _id: req.params.id, role: "student" },
      updates,
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ message: "Student not found" });
    return res.json({ student });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", authorize("admin"), async (req, res, next) => {
  try {
    const student = await User.findOneAndDelete({ _id: req.params.id, role: "student" });
    if (!student) return res.status(404).json({ message: "Student not found" });
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
