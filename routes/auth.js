const express=require("express")
const router=express.Router()
const mongoose=require("mongoose")
const User=mongoose.model("User")
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")
const {JWT_SECRET}=require("../config/keys")
const requireLogin=require("../middleware/requireLogin")

// router.get("/protected",requireLogin,(req,res)=>{
//     res.send("hello user")
// })


router.post("/signup",(req,res)=>{
    // console.log(req.body.name)
    const {name,email,password,pic}=req.body
    if(!name||!email||!password){
        return res.status(422).json({error:"please add all the fields"})
    }
    // res.json({message:"successfuly send"})
    User.findOne({email:email})
    .then((savedUser)=>{
        if(savedUser){
            return res.status(422).json({error:"user alredy exists with  this email"})

        }

        bcrypt.hash(password,12).then(hashedPassword=>{
            const user=new User({
                email,
                password:hashedPassword,
                name,
                pic
            })
    
            user.save()
            .then(user=>{
                res.json({message:"saved successfully"})
    
            })
            .catch(error=>{
                console.log("error",error)
            })

        })
     
    })
    .catch(error=>{
        console.log(error)
    })
})

router.post("/signin",(req,res)=>{
    const {email,password}=req.body
    if(!email||!password){
        return res.status(422).json({error:"Please add email and password"})
    }
    User.findOne({email}).then(savedUser=>{
        if(!savedUser){
            return res.status(422).json({error:"Invalid Email or Pasword"})
        }
        bcrypt.compare(password,savedUser.password).then(domatch=>{
            if(domatch){
                // res.json({message:"successfulyy signied in"})
                const token=jwt.sign({_id:savedUser._id},JWT_SECRET)
                const {_id,name,email,followers,following,pic}=savedUser
                res.json({token,user:{_id,name,email,followers,following,pic}})
            }else{
                return res.status(422).json({error:"Invalid Email or password"})
            }
        }).catch(error=>{
            console.log(error)
        })
    })
})
module.exports=router