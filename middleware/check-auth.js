const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')

module.exports = (req,res, next)=>{
    try{
    const decoded = jwt.verify(req.params.token, process.env.JWT_KEY)
    req.userData = decoded
    
    next()
    }catch(err){
        return res.render('signin')
    }
    
}