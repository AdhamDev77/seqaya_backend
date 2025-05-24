const mongoose = require('mongoose');
const Asar = require('../models/asarModel');
const Draft_Asar = require('../models/draftAsarModel'); // Assuming Draft_Asar model is required
const Comm = require('../models/commModel')

const getDraftAsar = async (req, res) => {
    try {
        const draft_asar = await Draft_Asar.find({}).sort({ createdAt: -1 });
        res.status(200).json(draft_asar);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "حدث خطأ أثناء الحصول على المسودات" });
    }
};

const getOneDraftAsar = async (req, res) => {
    const { id } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "لا يوجد قياس أثر" });
        }

        const draft_asar = await Draft_Asar.findById(id);

        if (!draft_asar) {
            return res.status(404).json({ error: "قياس الأثر غير موجودة" });
        }

        res.status(200).json(draft_asar);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "حدث خطأ أثناء الحصول على قياس الأثر" });
    }
};

const createDraftAsar = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    try {
        const { project_info, project_goals_1, project_goals_2, project_tahlils, m3neen, project_natiga, mod5alat } = req.body;

        let asar = await Asar.findById(id);

        // Check if Asar exists, if not, create it
        if (!id || !asar) {
            asar = await Asar.create({project_info});
            const comm = await Comm.findById(id)
            const existingAsarArray = comm.comm_asar; // Assuming comm_asar is an array
            
            // Append the new asar object to the existing array
            existingAsarArray.push(asar._id); // Assuming you're storing only the IDs
            
            // Update the comm with the modified asar array
            comm.comm_asar = existingAsarArray;
            await comm.save();
        } else {
            asar = await Asar.findById(id);
            // Check if Asar exists
        }

        let mod5alatNumber;
const parsedMod5alat = parseInt(mod5alat);
if (!isNaN(parsedMod5alat)) {
    mod5alatNumber = parsedMod5alat;
} else {
    mod5alatNumber = 0;
}

        // Create draft Asar
        const draft_Asar = await Draft_Asar.create({
            project_info, project_goals_1, project_goals_2, project_tahlils, m3neen, project_natiga, mod5alat: mod5alatNumber
        });

        const updatedAsar = {
            ...(asar.toObject ? asar.toObject() : asar), // Check if asar is null or has toObject method
            draft: draft_Asar._id
        };

        await Asar.findByIdAndUpdate(asar._id, updatedAsar);

        res.status(200).json(asar);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "حدث خطأ أثناء إنشاء قياس الأثر" });
    }
};


const deleteDraftAsar = async (req, res) => {
    const { id } = req.params;
    try {
        // Find the Asar document by ID
        const asar = await Asar.findById(id);

        // Check if the Asar document has a draft
        if (!asar || !asar.draft) {
            return res.status(404).json({ error: "القياس غير موجود أو ليس لديه مسودة" });
        }

        // Delete the draft Asar document
        await Draft_Asar.findByIdAndDelete(asar.draft);

        // Update the Asar document to remove the draft reference
        asar.draft = undefined;
        await asar.save();

        res.status(200).json({ message: "تم حذف المسودة بنجاح" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "حدث خطأ أثناء حذف المسودة" });
    }
};

const updateDraftAsar = async (req, res) => {
    const { id } = req.params;
    try {
        // Find the Asar document by ID
        const asar = await Asar.findById(id);

        // Check if the Asar document has a draft
        if (!asar || !asar.draft) {
            return res.status(404).json({ error: "القياس غير موجود أو ليس لديه مسودة" });
        }

        // Find the draft Asar document by ID
        const draftAsar = await Draft_Asar.findById(asar.draft);

        // Check if the draft Asar document exists
        if (!draftAsar) {
            return res.status(404).json({ error: "المسودة غير موجودة" });
        }

        // Update the draft Asar document with the new data
        const { project_info, project_goals_1, project_goals_2, project_tahlils, m3neen, project_natiga, mod5alat } = req.body;
        draftAsar.project_info = project_info;
        draftAsar.project_goals_1 = project_goals_1;
        draftAsar.project_goals_2 = project_goals_2;
        draftAsar.project_tahlils = project_tahlils;
        draftAsar.m3neen = m3neen;
        draftAsar.project_natiga = project_natiga;
        draftAsar.mod5alat = mod5alat;

        asar.project_info = project_info;
        
        // Save the updated draft Asar document
        await draftAsar.save();

        // Update the Asar document with the same data

        // Save the updated Asar document
        await asar.save();

        res.status(200).json({ message: "تم تحديث المسودة والقياس بنجاح" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "حدث خطأ أثناء تحديث المسودة والقياس" });
    }
};


module.exports = { getDraftAsar, getOneDraftAsar, createDraftAsar, updateDraftAsar, deleteDraftAsar };
