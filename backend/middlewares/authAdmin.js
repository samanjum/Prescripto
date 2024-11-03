import jwt from 'jsonwebtoken'

//admin authentication middleware

const authAdmin = async(req,res,next)=>{
  console.log(req.headers);
  
  try{
    const {atoken} = req.headers
    console.log("hello", atoken)
    if(!atoken){
      return res.json({success:false,message:'Not Authorized Login Again'})
    } 
    const token_decode = jwt.verify(atoken,process.env.JWT_SECRET)
    if(token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD){
      return res.json({success:false,message:'Not Authorized Login Again again'})
    }
    next()
  }
  catch(error){
    console.log(error)
    res.json({success:false,message:error.message})
  }
}

export default authAdmin