const Mos = require('../models/mosModel')
const Comm = require('../models/commModel')
const validator = require('validator')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET)
}

const getMos = async (req, res) => {
    const users = await Mos.find({}).sort({createdAt: -1})
    res.status(200).json(users)
}

const getOneMos = async (req, res) => {
    const {id} = req.params

    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "لا يوجد مستخدم"})
    }

    const user = await Mos.findById(id)

    if(!user){
        return res.status(404).json({error: "المستخدم غير موجود"})
    }

    res.status(200).json(user)
}

const createMos = async (req, res) => {
    try {
    const { comm_name, comm_email, comm_password, comm_dob} = req.body;

      // Validate required fields
    if (!comm_name || !comm_email || !comm_password || !comm_dob) {
        return res.status(400).json({ error: "يجب ملأ جميع الخانات من فضلك" });
    }

    const comm = await Comm.findById('68346a4ebc6a442971a8c112');


      // Validate email format
    if (!validator.isEmail(comm_email)) {
        return res.status(400).json({ error: "البريد الالكتروني خاطئ" });
        }

      // Check for existing user
    const exists = await Mos.findOne({ comm_email });
    if (exists) {
        return res.status(400).json({ error: "البريد الالكتروني مستخدم" });
    }

    if (!comm) {
        return res.status(404).json({ error: 'المؤسسة غير موجودة' });
    }

      // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(comm_password, salt);

      // Create user
    const mos = await Mos.create({
        name: comm_name,
        email: comm_email,
        password: hash,
        dob: comm_dob,
    });

    comm.approvedMembers.push(mos._id);
    await comm.save();

      // Generate token
    const token = createToken(mos._id);

      // Send success response
      res.status(201).json({ mos, token }); // Use 201 for successful creation
    } catch (error) {
      // Handle potential errors
      console.error(error); // Log the error for debugging
      res.status(500).json({ error: "حدث خطأ أثناء إنشاء المستخدم" }); // Generic error message
    }}

const logMos = async (req, res) => {
    const {comm_email, comm_password} = req.body

    const mos = await Mos.findOne({ email: comm_email })

    if(!mos){
        res.status(400).json({error: "البريد الالكتروني خاطئ"})
    }else{
        const token = createToken(mos._id)
        const match = await bcrypt.compare(comm_password, mos.comm_password)
        if(!match){
            res.status(404).json({error: "كلمة المرور الخاظئة"})
        }else{
            res.status(200).json({mos, token})
            
        }
    }

}
const deleteMos = async (req, res) => {
    const {id} = req.params

    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "لا يوجد مستخدم"})
    }

    const mos = await Mos.findOneAndDelete({_id: id})

    if(!mos){
        return res.status(404).json({error: "المستخدم غير موجود"})
    }

    res.status(200).json(mos)
}

module.exports = {getOneMos,logMos , getMos, deleteMos, createMos}