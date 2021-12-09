const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const checkAuth = require('../middleware/check-auth')
const jwtdecode = require('jwt-decode')

const apis = require('../schema/api_s')
const User = require('../schema/usrer_s')
const { token } = require('morgan')
var c
var l
var desc = []
var name = []
var dt
var con
var message
var condition
var mes
var condo

router.get('/', (req,res,next)=>{
    res.status(200).json({message:"Welcome"})
})

router.post('/look', (req,res,next)=>{
    l = req.body.res
    console.log(l)
    apis.find({ description : { "$regex": l, "$options": "i" }})
    .select('email description')
    .then(docs =>{   
        res.status(200).json(docs)
    }) 
    .catch(err =>{
        console.log("dfdfddf " +err)
        res.status(404).json({err:err})
    })
})

router.get('/signup.html', (req,res,next)=>{
    
    res.render('signup', {message:mes, con:condo})
    
})

router.get('/signin.html', (req,res,next)=>{
   
    res.render('signin', {message:mes, con:condo}) 

})

router.get('/page.html/:idd', (req,res,next)=>{
    apis.findById(req.params.idd).exec()
    .then(docs =>{
        const dt = {
             id: req.params.idd,
             name: docs.email,
             desc: docs.description,
             code: docs.code
        }
        res.status(200).json(dt)
    })
    .catch(err =>{
        console.log("req "+req.params.idd)
        console.log(err)
        res.status(404).json({error:err})
    })
})

router.post('/addc.html', (req,res,next)=>{
    const data={
        email: req.body.name,
        desc: req.body.desc,
        code: req.body.code
    }
    const api = new apis({
        _id:  new mongoose.Types.ObjectId(),
        email: req.body.name,
        description: req.body.desc,
        code: req.body.code 
    })
    api.save()
    .then(result=>{
        console.log(result)
        res.status(200).json({result:"Added"})
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({error:err})
    })
})

router.get('/user/:idd', (req,res,next)=>{
    apis.find({email: req.params.idd}).exec()
    .then(docs=>{
        console.log(docs)
       res.status(200).json(docs)
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({error:err})
    })
})

router.post('/see/:idd', (req,res,next)=>{
    apis.find({ description : { "$regex": l, "$options": "i" }}).select('email description _id')
    .then(docs =>{
        res.res.json(docs)
        name = []
    })
    .catch(err =>{
        console.log(err)
        res.status(401).json({error:err})
    })
})

router.post('/addusers', (req,res,next)=>{
    User.find({email: req.body.email}).exec()
    .then(result=>{
        if(result.length > 0){
            console.log("mo " +result)
            res.status(500).json({"message":  "This Email already belongs to a user"})
            return
        }
        else{
            bcrypt.hash(req.body.password, 10, (err,hash)=>{
                if(err){
                     console.log("this "+err)
                     res.status(500).json({error:err})
                     return
                }else{
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash
                    })  
                    user.save()
                    .then(result=>{
                        console.log("fg "+result)
                        res.status(200).json({message:"User created"})
                        return
                    })
                    .catch(err=>{
                        console.log(err)
                        res.status(500).json({Error:err})
                    })
                }
            })
        }
    })
      
})

router.post('/allow', (req,res,next)=>{
    var op = req.body.email
    User.findOne({ email: req.body.email})
    .exec()
    .then(
        result => {
            if(result.length < 1){
                console.log("E no enter" + result)
                return res.status(404).json({message:"Invalid login parameters"})               
      }
         bcrypt.compare(req.body.password, result.password, (err, result) => {
            console.log(result) 
             if(err){
                 console.log("First one "+ err)
                 return res.status(500).json({message:"Invalid login parameters"}) 
             }
             if(result){
                 const token = jwt.sign({
                     email: result.email,
                     userId: result._id,
                    }, process.env.JWT_KEY, {
                        expiresIn: "1h"
                    })
                console.log("Treu dta")
                
                const tokenn= token
                // const ab = jwt.decode(token, options={"verify_signature": true})
                // JSON.stringify(jwtdecode(token))
                


                return res.status(200).json({message: "Auth successsful",
                                            token: token}) 
             }
             console.log("Last one")
             return res.status(404).json({message: "Invalid login parameters"}) 
         }) 
      }
)
    .catch(error =>{console.log(error)})
})

router.get('/your/:token/:name', checkAuth, (req,res,next)=>{
        res.status(200).json({name:req.params.name})

})


module.exports = router