const Makal = require('../models/makalModel')
const validator = require('validator')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const getMakals = async (req, res) => {
    const makal = await Makal.find({}).sort({createdAt: -1})
    res.status(200).json(makal)
}

const getMakalByCategory = async (req, res) => {
    const {category} = req.params

    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "لا يوجد مقال"})
    }

    const makals = await Makal.find({makal_type: category})

    if(!makals){
        return res.status(404).json({error: "المقال غير موجود"})
    }

    res.status(200).json(makals)
}

const createMakal = async (req, res) => {
    try {
      const { makal_title, makal_description,makal_type, makal_link, makal_img } = req.body;
        console.log(req.body)
      // Validate required fields
      if (!makal_title || !makal_description || !makal_type || !makal_link || !makal_img) {
        return res.status(400).json({ error: "يجب ملأ جميع الخانات من فضلك" });
      }
  
      // Create user
      const makal = await Makal.create({ makal_title, makal_description,makal_type, makal_link, makal_img });
  
  
      // Send success response
      res.status(200).json({makal}); // Use 201 for successful creation
    } catch (error) {
      // Handle potential errors
      console.error(error); // Log the error for debugging
      res.status(500).json({ error: "حدث خطأ اثناء إنشاء المقال"}); // Generic error message
    }}

const deleteMakal = async (req, res) => {
    const {id} = req.params

    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "لا يوجد مقال"})
    }

    const makal = await Makal.findOneAndDelete({_id: id})

    if(!makal){
        return res.status(404).json({error: "المقال غير موجودة"})
    }

    res.status(200).json(makal)
}

module.exports = {getMakals , getMakalByCategory , createMakal, deleteMakal }