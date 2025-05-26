const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const mosSchema = new Schema(
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
    password: {
      type: String,
      required: true,
    },
    dob: {
      type: String,
      required: true,
    },
    comm_id: {type: String, default: '68346a4ebc6a442971a8c112'},
    approved: { type: Boolean, default: true },
    admin: { type: Boolean, default: true },
    isMos: {
      type: Boolean,
      default: true,
    },
    isMosReq: {
      type: Boolean,
      default: false,
    },
    isMosOld: {
      type: Boolean,
      default: true,
    },
    mos_cv: {
      type: String,
      default: "",
    },
    mos_image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Mos", mosSchema);
