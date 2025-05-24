const Users = require('../models/userModel')
const Comm = require('../models/commModel')
const validator = require('validator')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET)
}

const getUsers = async (req, res) => {
    const users = await Users.find({}).sort({createdAt: -1})
    res.status(200).json(users)
}

const getMosOld = async (req, res) => {
    try {
        const users = await Users.find({ isMosOld: true }).sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
const getMosReq = async (req, res) => {
    try {
        const users = await Users.find({ isMosReq: true }).sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getMos = async (req, res) => {
    try {
        const users = await Users.find({ isMos: true }).sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getOneUser = async (req, res) => {
    const {id} = req.params

    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "لا يوجد مستخدم"})
    }

    const user = await Users.findById(id)

    if(!user){
        return res.status(404).json({error: "المستخدم غير موجود"})
    }

    res.status(200).json(user)
}


const createUser = async (req, res) => {
    try {
    const { name, email, phone, password, dob, gender, comm_id , isMos, isMosReq } = req.body;

      // Validate required fields
    if (!name || !phone || !email || !password || !dob || !gender || !comm_id) {
        return res.status(400).json({ error: "يجب ملأ جميع الخانات من فضلك" });
    }

    const comm = await Comm.findById(comm_id);


      // Validate email format
    if (!validator.isEmail(email)) {
        return res.status(400).json({ error: "البريد الالكتروني خاطئ" });
        }

      // Check for existing user
    const exists = await Users.findOne({ email });
    if (exists) {
        return res.status(400).json({ error: "البريد الالكتروني مستخدم" });
    }

    if (!comm) {
        return res.status(404).json({ error: 'المؤسسة غير موجودة' });
    }

      // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

      // Create user
    const user = await Users.create({
        comm_id,
        name,
        email,
        phone,
        password: hash,
        dob,
        gender,
        isMos,
        isMosReq
    });

    comm.pendingMembers.push(user._id);
    await comm.save();

      // Generate token
    const token = createToken(user._id);

      // Send success response
      res.status(201).json({ user, token }); // Use 201 for successful creation
    } catch (error) {
      // Handle potential errors
      console.error(error); // Log the error for debugging
      res.status(500).json({ error: "حدث خطأ أثناء إنشاء المستخدم" }); // Generic error message
    }}
    
    const changePassword = async (req, res) => {
        const { currentPassword, newPassword } = req.body;
        const {id} = req.params;
        if (currentPassword == "" || newPassword == ""){
            return res.status(404).json({ error: 'يجل ملأ جميع الخانات' });
        }
        try {
            const user = await Users.findById(id)
            if (!user) {
                return res.status(404).json({ error: 'لا يوجد مستخدم' });
            }
    
            // Verify the current password
            if (!bcrypt.compareSync(currentPassword, user.password)) {
                return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });
            }
    
            // Hash the new password
            const saltRounds = 10; // Number of salt rounds for bcrypt hashing
            const hashedPassword = bcrypt.hashSync(newPassword, saltRounds);
    
            // Update the user's password (You might want to use a database update query here)
            user.password = hashedPassword;
            await user.save(); // Save the updated user to the database
    
            return res.status(200).json({ error: 'تم تغيير كلمة المرور بنجاح' });
        } catch (error) {
            // Handle potential errors
            console.error(error); // Log the error for debugging
            res.status(500).json({ error: "حدث خطأ أثناء تغيير كلمة المرور" }); // Generic error message
        }
    };
    
    

const logUser = async (req, res) => {
    const {email, password} = req.body

    const user = await Users.findOne({ email })

    if(!user){
        res.status(400).json({error: "البريد الالكتروني خاطئ"})
    }else{
        const token = createToken(user._id)
        const match = await bcrypt.compare(password, user.password)
        if(!match){
            res.status(404).json({error: "كلمة المرور الخاظئة"})
        }else{
            if(user.approved == false){
                res.status(404).json({error: "يجب أن يتم قبولك في المؤسسة أولا"})
            }else{
res.status(200).json({user, token})
            }
            
        }
    }

}
const deleteUser = async (req, res) => {
    const {id} = req.params

    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "لا يوجد مستخدم"})
    }

    const user = await Users.findOneAndDelete({_id: id})

    if(!user){
        return res.status(404).json({error: "المستخدم غير موجود"})
    }

    res.status(200).json(user)
}

const updateUser = async (req, res) => {
    const {id} = req.params

    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "لا يوجد مستخدم"})
    }

    const user = await Users.findOneAndUpdate({_id: id}, {...req.body})

    if(!user){
        return res.status(404).json({error: "المستخدم غير موجود"})
    }

    res.status(200).json(user)
}

module.exports = {createUser,logUser , getUsers, getOneUser, deleteUser, updateUser, getMosReq, getMos,getMosOld,changePassword}