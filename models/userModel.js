const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const usersSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    dob: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    comm_id: {
      type: String,
    },
    approved: { type: Boolean, default: false },
    admin: { type: Boolean, default: false },
    isMos: {
      type: Boolean,
      required: true,
    },
    isMosReq: {
      type: Boolean,
      required: true,
    },
    isMosOld: {
      type: Boolean,
      default: false,
    },
    mos_cv: {
      type: String,
      default: "",
    },
    mos_image: {
      type: String,
      default: "",
    },
    toggable_asars: [{ type: mongoose.Schema.Types.ObjectId, ref: "Asar" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", usersSchema);
