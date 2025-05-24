const mongoose = require("mongoose");
const Asar = require("../models/asarModel");
const Users = require("../models/userModel");
const Comm = require("../models/commModel");
const Draft_Asar = require("../models/draftAsarModel");

const getAsar = async (req, res) => {
  const asar = await Asar.find({}).sort({ createdAt: -1 });
  res.status(200).json(asar);
};

const getAsarQuick = async (req, res) => {
  try {
    const asar = await Asar.find({}, "project_info project_natiga").sort({
      createdAt: -1,
    });
    res.status(200).json(asar);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching Asar data", error: error.message });
  }
};

const getOneAsar = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "لا يوجد قياس أثر" });
  }

  const asar = await Asar.findById(id).populate("draft");

  if (!asar) {
    return res.status(404).json({ error: "قياس الأثر غير موجودة" });
  }

  res.status(200).json(asar);
};

const getOneAsarQuick = async (req, res) => {
    const { id } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "لا يوجد قياس أثر" });
    }
  
    try {
      const asar = await Asar.findById(id)
        .select("project_info project_natiga")
        .populate("draft", "project_info project_natiga"); // Assuming you want these fields from the draft
  
      if (!asar) {
        return res.status(404).json({ error: "قياس الأثر غير موجود" });
      }
  
      res.status(200).json(asar);
    } catch (error) {
      res.status(500).json({ error: "حدث خطأ أثناء استرجاع قياس الأثر", details: error.message });
    }
  };

const addUserToToggableUsers = async (req, res) => {
  const { id } = req.params; // Asar ID
  const { userId } = req.body; // User ID to addd

  try {
    const asar = await Asar.findById(id);
    const user = await Users.findById(userId);
    console.log(user);

    if (!asar) {
      return res.status(404).json({ message: "Asar not found" });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is already in the array
    if (
      asar.toggable_users.includes(userId) ||
      user.toggable_asars.includes(id)
    ) {
      return res
        .status(400)
        .json({ message: "User already exists in the toggable_users array" });
    }

    // Add user to the toggable_users array
    asar.toggable_users.push(userId);
    user.toggable_asars.push(id);
    await asar.save();
    await user.save();

    res
      .status(200)
      .json({ message: "User added to toggable_users array", asar });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeUserFromToggableUsers = async (req, res) => {
  const { id } = req.params; // Asar ID
  const { userId } = req.body; // User ID to remove

  try {
    const asar = await Asar.findById(id);
    const user = await Users.findById(userId);

    if (!asar) {
      return res.status(404).json({ message: "Asar not found" });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is in the array
    const userIndex = asar.toggable_users.indexOf(userId);
    const asarIndex = user.toggable_asars.indexOf(id);
    if (userIndex === -1) {
      return res
        .status(400)
        .json({ message: "User not found in the toggable_users array" });
    }
    if (asarIndex === -1) {
      return res
        .status(400)
        .json({ message: "Asar not found in the toggable_asars array" });
    }

    // Remove user from the toggable_users array
    asar.toggable_users.splice(userIndex, 1);
    user.toggable_asars.splice(asarIndex, 1);
    await asar.save();
    await user.save();

    res
      .status(200)
      .json({ message: "User removed from toggable_users array", asar });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAsar = async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  try {
    const {
      project_info,
      project_goals_1,
      project_goals_2,
      project_tahlils,
      m3neen,
      project_natiga,
      mod5alat,
    } = req.body;

    const draft_asar = await Draft_Asar.create({
      project_info,
      project_goals_1,
      project_goals_2,
      project_tahlils,
      m3neen,
      project_natiga,
      mod5alat,
    });

    let kema_mogtama3ya = 0;

    for (let i = 0; i < project_natiga.length; i++) {
      kema_mogtama3ya += project_natiga[i].total_years;
    }
    let mod5alatNumber;
    const parsedMod5alat = parseInt(mod5alat);
    if (!isNaN(parsedMod5alat)) {
      mod5alatNumber = parsedMod5alat;
    } else {
      mod5alatNumber = 0;
    }

    let safy_kema_mogtama3ya = Math.round(kema_mogtama3ya - mod5alatNumber);
    let aed = kema_mogtama3ya / mod5alatNumber;

    // Create comm
    const asar = await Asar.create({
      project_info,
      project_goals_1,
      project_goals_2,
      project_tahlils,
      m3neen,
      project_natiga,
      mod5alat: mod5alatNumber,
      kema_mogtama3ya,
      safy_kema_mogtama3ya,
      aed,
      draft: draft_asar._id,
    });

    const comm = await Comm.findById(id);
    const existingAsarArray = comm.comm_asar; // Assuming comm_asar is an array

    // Append the new asar object to the existing array
    existingAsarArray.push(asar._id); // Assuming you're storing only the IDs

    // Update the comm with the modified asar array
    comm.comm_asar = existingAsarArray;
    await comm.save();

    res.status(200).json(asar);
  } catch (error) {
    // Handle potential errors
    console.error(error); // Log the error for debugging
    res.status(500).json({ error: "حدث خطأ أثناء إنشاء قياس الأثر" }); // Generic error message
  }
};

const deleteAsar = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "لا يوجد قياس أثر" });
  }

  let asar;
  try {
    asar = await Asar.findById(id);
  } catch (error) {
    console.error("Error finding Asar:", error);
    return res.status(500).json({ error: "خطأ في الخادم" });
  }

  if (!asar) {
    return res.status(404).json({ error: "قياس الأثر غير موجود" });
  }

  // Find the comm associated with the asar
  let comm;
  try {
    comm = await Comm.findOne({ comm_asar: asar._id });
  } catch (error) {
    console.error("Error finding Comm:", error);
    return res.status(500).json({ error: "خطأ في الخادم" });
  }

  if (!comm) {
    return res.status(404).json({ error: "لا يوجد مجتمع مرتبط بقياس الأثر" });
  }

  // Remove the ID of the deleted asar from the comm's asar array
  const indexOfDeletedAsar = comm.comm_asar.indexOf(asar._id);
  if (indexOfDeletedAsar !== -1) {
    comm.comm_asar.splice(indexOfDeletedAsar, 1);
  }

  try {
    // Save the updated comm document
    await comm.save();

    // Delete the asar
    await Asar.findByIdAndDelete(id);

    res.status(200).json(asar);
  } catch (error) {
    console.error("Error deleting Asar:", error);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
};

const updateAsar = async (req, res) => {
  const { id } = req.params; // Get the Asar ID from URL parameters
  console.log(req.body); // Log the request body for debugging purposes

  try {
    // Destructuring the request body to extract all needed fields
    const {
      project_info,
      project_goals_1,
      project_goals_2,
      project_tahlils,
      m3neen,
      project_natiga,
      mod5alat,
    } = req.body;

    // Calculate the total community value (kema_mogtama3ya) from project results
    let kema_mogtama3ya = 0;
    project_natiga.forEach((natiga) => {
      kema_mogtama3ya += natiga.total_years;
    });

    // Parse and validate the mod5alat value, defaulting to 0 if not a number
    let mod5alatNumber = parseInt(mod5alat, 10);
    if (isNaN(mod5alatNumber)) {
      mod5alatNumber = 0;
    }

    // Calculate the net community value and AED
    let safy_kema_mogtama3ya = Math.round(kema_mogtama3ya - mod5alatNumber);
    let aed =
      mod5alatNumber !== 0
        ? (kema_mogtama3ya / mod5alatNumber)
        : 0;

    // Update the Asar document in the database
    const asar = await Asar.findOneAndUpdate(
      { _id: id },
      {
        project_info,
        project_goals_1,
        project_goals_2,
        project_tahlils,
        m3neen,
        project_natiga,
        mod5alat: mod5alatNumber,
        kema_mogtama3ya,
        safy_kema_mogtama3ya,
        aed,
      },
      { new: true, runValidators: true } // Return the updated object and run schema validators
    );

    // Handle case where the Asar could not be found
    if (!asar) {
      return res.status(404).json({ error: "Asar not found" });
    }

    // Send the updated Asar data back as a response
    res.status(200).json(asar);
  } catch (error) {
    console.error(error); // Log the error for further debugging
    res
      .status(500)
      .json({ error: "An error occurred while updating the Asar" }); // Provide a general error message
  }
};

module.exports = {
  getAsar,
  getAsarQuick,
  getOneAsar,
  getOneAsarQuick,
  createAsar,
  updateAsar,
  deleteAsar,
  addUserToToggableUsers,
  removeUserFromToggableUsers,
};
