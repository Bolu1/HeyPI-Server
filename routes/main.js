const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const checkAuth = require('../middleware/check-auth')
const apis = require('../schema/api_s')
const User = require('../schema/usrer_s')
const Question = require('../schema/question_s')
const papis = require('../schema/private_api_s')
const { token } = require('morgan')


var l
var mes
var condo

router.get('/', (req,res,next)=>{ 
    res.status(200).json({message:"Welcome"})
})

router.post('/look', (req,res,next)=>{
    const pageSize = 10
    const page = parseInt(req.query.page || "0")
    l = req.body.search
    apis.find({ description : { "$regex": l, "$options": "i" }})
    .limit(pageSize)
    .skip(pageSize*page)
    .select('email description')
    .then(docs =>{   
        res.status(200).json(docs)
    }) 
    .catch(err =>{
        res.status(404).json({err:err})
    })
})


router.get('/getApis', async(req,res)=>{
    try{
        const Apis = await apis.aggregate([{$sample: {size: 10}}])
        res.status(201).json(Apis)
    }catch(err){
        res.status(404).send("Not Found")
    }
})

router.get('/page.html/:idd', (req,res,next)=>{
    apis.findById(req.params.idd).exec()
    .then(docs =>{
        const dt = {
             id: req.params.idd,
             name: docs.email,
             desc: docs.description,
             lang: docs.language,
             code: docs.code
        }
        res.status(200).json(dt)
    })
    .catch(err =>{
        console.log(err)
        res.status(404).json({error:err})
    })
})

router.post('/addc', (req,res,next)=>{
    console.log( req.body.language)
    const api = new apis({
        _id:  new mongoose.Types.ObjectId(),
        email: "admin",
        description: req.body.description,
        code: req.body.code,
        language: req.body.language,
        question_id: req.body.id || "",
        date: Date.now()
    })
    api.save()
    .then(result=>{
        res.status(200).json({result:"Added"})
    })
    .catch(err=>{
        res.status(500).json({error:err})
    })
})

router.get('/user/:idd', (req,res,next)=>{
    apis.find({email: req.params.idd}).exec()
    .then(docs=>{
       res.status(200).json(docs)
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({error:err})
    })
})

router.post('/see', checkAuth, (req,res,next)=>{
    
    const pageSize = 10
    const page = parseInt(req.query.page || "0")
    const l = req.body.search
    apis.find({ 
        email: req.body.name,
        description : { "$regex": l, "$options": "i" }})
        .limit(pageSize)
    .skip(pageSize*page)
    .then(docs =>{
        res.status(200).json(docs)
    })
    .catch(err =>{
        res.status(401).json({error:err})
    })
})

router.post('/addusers', (req,res,next)=>{
    User.find({email: req.body.email}).exec()
    .then(result=>{
        if(result.length > 0){
            res.status(500).json({message:  "This Email already belongs to a user"})
            return
        }
        else{
            if(req.body.password){
            bcrypt.hash(req.body.password, 10, (err,hash)=>{
                if(err){
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
                        res.status(500).json({message:err})
                    })
                }
            })
        }else{
            res.status(500).json({message:"Password too short"})
        }}
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
            console.log("this ",result) 
             if(err){
                 console.log("First one "+ err)
                 return res.status(500).json({message:"Invalid login parameters"}) 
             }
             if(result){
                 const token = jwt.sign({
                     email: req.body.email,
                     userId: result._id,
                    }, process.env.JWT_KEY, {
                        expiresIn: "1h"
                    })
                console.log("Treu dta "+req.body.email)
                const tokenn= token
                return res.status(200).json({message: "Auth successsful",
                                            token: token,
                                            email: req.body.email
                                        }) 
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

router.post('/community/search', (req,res,next)=>{
    const pageSize = 10
    const page = parseInt(req.query.page || "0")
    l = req.body.search
    Question.find({ title : { "$regex": l, "$options": "i" }})
    .limit(pageSize)
    .skip(page * pageSize)
    .then(docs =>{   
        res.status(200).json(docs)
    }) 
    .catch(err =>{
        console.log("dfdfddf " +err)
        res.status(404).json({err:err})
    })
})

router.get('/getQuestions', async(req,res)=>{
    try{
        const question = await Question.aggregate([{$sample: {size: 10}}])
        console.log(question)
        res.status(201).json(question)
    }catch(err){
        console.log(err)
        res.status(404).send("Not Found")
    }
})

router.get('/findQuestions', async(req,res)=>{
    try{
        console.log(req.query)
        const question = await Question.findOne({_id:req.query.id})
        console.log(question)
        res.status(201).json(question)
    }catch(err){
        console.log(err)
        res.status(404).send("Not Found")
    }
})

router.post('/answers', (req,res,next)=>{
    const pageSize = 10
    console.log(req.body.id)
    const page = parseInt(req.query.page || "0")
    apis.find({question_id: req.body.id})
    .limit(pageSize)
    .skip(page * pageSize)
    .exec()
    .then(docs=>{
        console.log(docs)
       res.status(200).json(docs)
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({error:err})
    })
})

router.post('/askq', (req,res,next)=>{

    const que = new Question({
        _id:  new mongoose.Types.ObjectId(),
        email: req.body.name,
        description: req.body.description,
        date: Date.now(),
        title: req.body.title,
        language: req.body.language 
    })
    
    que.save()
    .then(result=>{
        
        res.status(200).json({result:"Added"})
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({error:err})
    })
})

router.post('/community/adda', checkAuth, (req,res,next)=>{
    const api = new apis({
        _id:  new mongoose.Types.ObjectId(),
        email: req.body.name,
        description: req.body.desc,
        code: req.body.code,
        language:req.body.language,
        access: "Public",
        date: Date.now(),
        question_id: req.params.id


    })
    api.save()
    .then(result=>{
        res.status(200).json({result:"Added"})
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({error:err})
    })
})


router.post('/addp.html', checkAuth, (req,res,next)=>{

    const papis = new apis({
        _id:  new mongoose.Types.ObjectId(),
        email: req.body.name,
        description: req.body.desc,
        code: req.body.code,
        language:req.body.language,
        access: req.body.access,
        date: Date.now()
    })
    papis.save()
    .then(result=>{
        res.status(200).json({result:"Private Api Added"})
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({error:err})
    })
})

router.post('/userp', checkAuth, (req,res,next)=>{
    const pageSize = 10
    const page = parseInt(req.query.page || "0")
    const l = req.body.search
    papis.find({
        email: req.body.name,
        description : { "$regex": l, "$options": "i" }
        })
        .limit(pageSize)
    .skip(pageSize*page)
        .exec()
    .then(docs=>{
       res.status(200).json(docs)
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({error:err})
    })
})

router.delete('/deleteapi', checkAuth, (req,res,next)=>{
    apis.findByIdAndDelete({_id: req.body.id}).then(docs=>{
        res.status(200).json(docs)
    }).catch(err =>{
        console.log(err)
        res.status(500).json({error:err})
    })
})

router.delete('/deletepapis', checkAuth, (req,res,next)=>{
    papis.findByIdAndDelete({id: req.body.id}).then(docs=>{
        res.status(200).json(docs)
    }).catch(err =>{
        console.log(err)
        res.status(500).json({error:err})
    })
})

router.delete('/deleteuser/:id', checkAuth, (req,res,next)=>{
    Users.findByIdAndRemove(req.params.id).then(docs=>{
        res.status(200).json(docs)
    }).catch(err =>{
        console.log(err)
        res.status(500).json({error:err})
    })
})

router.patch('/profile/:id', checkAuth, (req,res,next)=>{
    const id = req.params.id

    Users.findByIdAndUpdate(_id, image_name,  )
})




    


module.exports = router