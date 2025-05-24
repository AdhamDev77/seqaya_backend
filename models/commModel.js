const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const commSchema = new Schema(
  {
    comm_name: {
      type: String,
      required: true,
    },
    comm_email: {
      type: String,
      required: true,
    },
    comm_password: {
      type: String,
      required: true,
    },
    comm_dob: {
      type: String,
      required: true,
    },
    comm_file: {
      type: String,
      required: true,
    },
    comm_asar: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asar' }],
    approved: { type: Boolean, default: false },
    pendingMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    approvedMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comm", commSchema);
