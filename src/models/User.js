const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
      maxlength: 254
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    role: {
      type: String,
      enum: ["admin", "student"],
      default: "student",
      immutable: true
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 30,
      default: ""
    },
    course: {
      type: String,
      trim: true,
      maxlength: 100,
      default: ""
    },
    enrollmentNo: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
      maxlength: 50
    },
    dateOfBirth: {
      type: Date
    },
    address: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(document, result) {
        delete result.password;
        delete result.__v;
        return result;
      }
    }
  }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
