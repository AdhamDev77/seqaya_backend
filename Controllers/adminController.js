const mongoose = require('mongoose')

const adminLogin = async (req, res) => {
    const { username, password } = req.body;
    
    if(username == "admin" && password == "admin"){
        res.status(200).json(true)
    }else{
        res.status(400).json({error: "البيانات خاطئة"})
    }
}


module.exports = { adminLogin }