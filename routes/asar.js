const express = require("express");
const Asar = require("../models/asarModel");
const requireAuth = require("../middleware/requireAuth");
const {
  getAsar,
  getAsarQuick,
  getOneAsar,
  getOneAsarQuick,
  createAsar,
  updateAsar,
  deleteAsar,
  addUserToToggableUsers,
  removeUserFromToggableUsers,
} = require("../Controllers/asarController");

const router = express.Router();

//router.use(requireAuth)

router.get("/", getAsar);

router.get("/quick", getAsarQuick);

router.get("/:id", getOneAsar);

router.get("/quick/:id", getOneAsarQuick);

router.post("/:id", createAsar);

router.post("/toggle/:id", addUserToToggableUsers);

router.post("/untoggle/:id", removeUserFromToggableUsers);

router.delete("/:id", deleteAsar);

router.patch("/:id", updateAsar);

module.exports = router;
