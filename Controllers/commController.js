const Comm = require('../models/commModel')
const Users = require('../models/userModel')
const validator = require('validator')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');
const path = require('path');

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "notifications@socialvaluearabia.org",
    pass: "ZE&y9abZTNb6nT", // Consider using environment variables for this
  },
  secure: true, // Use secure connection
  tls: {
    rejectUnauthorized: false // Sometimes needed for certain email providers
  }
});


const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET, { expiresIn: '7d'})
}

const getComm = async (req, res) => {
    const comm = await Comm.find({}).sort({createdAt: -1})
    res.status(200).json(comm)
}

const getOneComm = async (req, res) => {
    const {id} = req.params

    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "لا يوجد مؤسسة"})
    }

    const comm = await Comm.findById(id)

    if(!comm){
        return res.status(404).json({error: "المؤسسة غير موجودة"})
    }

    res.status(200).json(comm)
}


const createComm = async (req, res) => {
    try {
      const { comm_name, comm_email, comm_password, comm_file , comm_dob} = req.body
  
      // Validate required fields
      if (!comm_name || !comm_email || !comm_password || !comm_file || !comm_dob) {
        return res.status(400).json({ error: "يجب ملأ جميع الخانات من فضلك" });
      }
  
      // Validate email format
      if (!validator.isEmail(comm_email)) {
        return res.status(400).json({ error: "البريد الالكتروني ليس بالشكل الصحيح" });
      }
  
      // Check for existing comm
      const exists = await Comm.findOne({ comm_email });
      if (exists) {
        return res.status(400).json({ error: "البريد الالكتروني مؤسسة" });
      }
  
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(comm_password, salt);
  
      // Create comm
      const comm = await Comm.create({
        comm_name, comm_email, comm_password: hash, comm_file , comm_dob
      });
  
      // Generate token
      const token = createToken(comm._id);
  
      // Send success response
      res.status(201).json({ comm, token }); // Use 201 for successful creation
    } catch (error) {
      // Handle potential errors
      console.error(error); // Log the error for debugging
      res.status(500).json({ error: "حدث خطأ أثناء إنشاء المؤسسة" }); // Generic error message
    }}
    
const logComm = async (req, res) => {
    const {comm_email, comm_password} = req.body

    const comm = await Comm.findOne({ comm_email });



    if(!comm){
        res.status(400).json({error: "البريد الالكتروني خاطئ"})
    }else{
      if(comm.approved != true){
        res.status(400).json({error: "لم يتم قبول الحساب بعد, حاول لاحقا"})
      }
        const token = createToken(comm._id)
        const match = await bcrypt.compare(comm_password, comm.comm_password)
        if(!match){
            res.status(404).json({error: "كلمة المرور الخاظئة"})
        }else{
            if(comm.approved == false){
                res.status(400).json({error: "انتظر حتى يتم قبولك و جرب مرة أخري"})
            }else{
                res.status(200).json({comm, token})
            }
    }
    }




}

const deleteComm = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "لا يوجد مؤسسة" });
  }

  let comm;
  try {
      // Find the community by ID
      comm = await Comm.findById(id);
  } catch (error) {
      console.error("Error finding community:", error);
      return res.status(500).json({ error: "خطأ في الخادم" });
  }

  if (!comm) {
      return res.status(404).json({ error: "المؤسسة غير موجود" });
  }

  // Get the IDs of users in pendingUsers and approvedUsers arrays
  const userIdsToDelete = [...comm.pendingMembers, ...comm.approvedMembers];

  // Delete users
  for (const userId of userIdsToDelete) {
      try {
          await Users.findByIdAndDelete(userId);
      } catch (error) {
          console.error("Error deleting user:", error);
          // Handle error as per your requirement
      }
  }

  try {
      // Delete the community
      await Comm.findByIdAndDelete(id);
      res.status(200).json(comm);
  } catch (error) {
      console.error("Error deleting community:", error);
      res.status(500).json({ error: "خطأ في الخادم" });
  }
};



const approveComm = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "لا يوجد مؤسسة" });
  }

  const comm = await Comm.findOneAndUpdate({ _id: id }, { approved: true });

  if (!comm) {
    return res.status(404).json({ error: "المؤسسة غير موجود" });
  }

  // Send approval email to the comm
  const mailOptions = {
    from: "notifications@socialvaluearabia.org", // Sender email
    to: comm.comm_email, // Recipient email (the comm's email)
    subject: 'تم قبول طلب انضمامك', // Email subject
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; text-align: center;">
        <img src="cid:logo" alt="Logo" style="width: 150px; margin-bottom: 20px;" />
        <h2 style="color: #4CAF50;">مرحبًا ${comm.comm_name},</h2>
        <p style="font-size: 16px;">نود إعلامك بأن طلب انضمامك إلى منصتنا قد تم قبوله بنجاح.</p>
        <p style="font-size: 16px;">يمكنك الآن تسجيل الدخول إلى حسابك والبدء في استخدام جميع الخدمات المتاحة.</p>
        <p style="font-size: 16px;">نشكرك على ثقتك بنا ونتطلع إلى تقديم أفضل الخدمات لك.</p>
        <a href="https://a3mk.netlify.app/login" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">تسجيل الدخول</a>
        <p style="font-size: 16px; margin-top: 20px;">مع تحياتنا،<br/>فريق <strong>منصتنا</strong></p>
      </div>
    `,
    // attachments: [
    //   {
    //     filename: 'logo.png',
    //     path: path.join(__dirname, '../assets/logo.png'), // Path to your logo file
    //     cid: 'logo', // Unique ID for embedding the image in the email
    //   },
    // ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ error: 'حدث خطأ أثناء إرسال البريد الإلكتروني' });
    } else {
      console.log('Email sent:', info.response);
      res.status(200).json({ message: 'تم قبول المؤسسة وإرسال البريد الإلكتروني بنجاح', comm });
    }
  });
};

const getFalseComm = async (req, res) => {
        const unapprovedComms = await Comm.find({ approved: false });
        res.status(200).json(unapprovedComms)
  }

const getTrueComm = async (req, res) => {
        const unapprovedComms = await Comm.find({ approved: true });
        res.status(200).json(unapprovedComms)
  }

  const approveMember = async (req, res) => {
    try {
      const comm_id = req.params.id;
      const user_id = req.body.id;
  
      // Find the community and user
      const comm = await Comm.findById(comm_id);
      const user = await Users.findOneAndUpdate({ _id: user_id }, { approved: true });
  
      if (!comm) {
        return res.status(404).json({ error: 'المؤسسة غير موجودة' });
      }
      if (!user) {
        return res.status(404).json({ error: 'المستخدم غير موجود' });
      }
  
      // Check if user is in pending members
      const pendingIndex = comm.pendingMembers.indexOf(user_id);
      if (pendingIndex === -1) {
        return res.status(400).json(comm.pendingMembers);
      }
  
      // Remove user from pending members and add to approved members
      comm.pendingMembers.splice(pendingIndex, 1);
      comm.approvedMembers.push(user_id);
  
      await comm.save();
      await user.save();
  
      // Send approval email to the user
      const mailOptions = {
        from: "notifications@socialvaluearabia.org", // Sender email
        to: user.email, // Recipient email (the user's email)
        subject: 'تم قبول طلب انضمامك', // Email subject
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; text-align: center;">
            <h2 style="color: #4CAF50;">مرحبًا ${user.name},</h2>
            <p style="font-size: 16px;">نود إعلامك بأن طلب انضمامك إلى <strong>${comm.comm_name}</strong> قد تم قبوله بنجاح.</p>
            <a href="https://a3mk.netlify.app/login" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">تسجيل الدخول</a>
          </div>
        `,
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          return res.status(500).json({ error: 'حدث خطأ أثناء إرسال البريد الإلكتروني' });
        } else {
          console.log('Email sent:', info.response);
          res.status(200).json({ message: 'تم قبول العضو وإرسال البريد الإلكتروني بنجاح' });
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'حدثت مشكلة أثناء قبول العضو' });
    }
  };

  const removeMember = async (req, res) => {
    try {
      const comm_id = req.params.id;
      const user_id = req.body.id;

      
  
      const comm = await Comm.findById(comm_id);
      if (!comm) {
        return res.status(404).json({ error: 'المؤسسة غير موجودة' });
      }
  
      // Check if user is in pending members
      const index = comm.approvedMembers.indexOf(user_id);
      const user = await Users.findOneAndDelete({_id: user_id})
      if (index === -1) {
        return res.status(400).json({ error: 'المسخدم غير منضم أو موجود ' });
      }
  
      // Remove user from pending members and add to approved members
      comm.approvedMembers.splice(index, 1);
      await comm.save();
  
      res.json({ message: 'تم رفد العضو' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'حدثت مشكلة اثناء قبول العضو' });
    }
  }
  

module.exports = {createComm,logComm,getOneComm,approveComm,getComm,deleteComm,getFalseComm,getTrueComm,approveMember,removeMember}