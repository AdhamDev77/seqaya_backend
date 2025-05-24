const Cons = require('../models/consModel')
const validator = require('validator')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const getCons = async (req, res) => {
    const cons = await Cons.find({}).sort({createdAt: -1})
    res.status(200).json(cons)
}

const getOneCon = async (req, res) => {
    const {id} = req.params

    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "لا يوجد استشارة"})
    }

    const cons = await Cons.findById(id)

    if(!cons){
        return res.status(404).json({error: "الاستشارة غير موجود"})
    }

    res.status(200).json(cons)
}

const createCons = async (req, res) => {
    try {
      const { cons_name, cons_subject,cons_mos, cons_phone, cons_message, cons_comment,cons_asar, cons_time, cons_seen} = req.body;
        console.log(req.body)
      // Validate required fields
  
      // Create user
      const cons = await Cons.create({
        cons_name,
        cons_phone,
        cons_mos,
        cons_subject,
        cons_message,
        cons_comment,
        cons_asar,
        cons_time,
        cons_seen
      });
  
  
      // Send success response
      res.status(201).json({cons}); // Use 201 for successful creation
    } catch (error) {
      // Handle potential errors
      console.error(error); // Log the error for debugging
      res.status(500).json({ error: "حدث خطأ اثناء إنشاء الاستشارة"}); // Generic error message
    }}

const deleteCon = async (req, res) => {
    const {id} = req.params

    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "لا يوجد استشارة"})
    }

    const cons = await Cons.findOneAndDelete({_id: id})

    if(!cons){
        return res.status(404).json({error: "الاستشارة غير موجودة"})
    }

    res.status(200).json(cons)
}

const updateCon = async (req, res) => {
    const {id} = req.params

    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "لا يوجد استشارة"})
    }

    const con = await Cons.findOneAndUpdate({_id: id}, {...req.body})

    if(!con){
        return res.status(404).json({error: "الاستشارة غير موجودة"})
    }

    res.status(200).json(con)
}

module.exports = {getCons , getOneCon , createCons, deleteCon, updateCon}