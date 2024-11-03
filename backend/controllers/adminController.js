import validator from "validator"
import bcrypt from "bcrypt"
import {v2 as cloudinary } from "cloudinary"
import doctorModel from "../models/doctormodel.js"
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js"
import userModel from "../models/usermodel.js"

// api for adding doctor
const addDoctor = async(req,res)=>{

  try{
   const{ name, email, password, speciality, degree, experience, about, fees, address} = req.body
  const imageFile = req.file
console.log('imagefile',imageFile);


   // checking for all data
   if(!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address){
    return res.json({success:false,message:"Detail Missing"})
   }
   //validating email format
   if(!validator.isEmail(email)){
    return res.json({success:false,message:"Please enter valid Email"})
   }

   // validating strong passwoord
   if(password.length < 8){
    return res.json({success:false,message:" Please Enter a Strong Password"})
   }

  // hashing doctor pasword
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)
  let imageUrl;
  // upload image to cloudinary
  if(imageFile){
const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type:"image"})
 imageUrl = imageUpload.secure_url
  }
  else {
    // Set a default image URL if no image is uploaded
    imageUrl = "https://img.freepik.com/premium-vector/vector-doctor-medical-hospital-health-medicine-illustration-care-man-clinic-people-profes_1013341-112928.jpg?semt=ais_hybrid";  // Replace with your default image URL
  }
console.log(imageUrl);


const doctorData = {
  name,
  email,
  image:imageUrl,
  password:hashedPassword,
  speciality,
  degree,
  experience,
  about,
  fees,
  address,
  date:Date.now()
}

const newDoctor = new doctorModel(doctorData)
await newDoctor.save()

res.json({success:true,message:"Doctor Added"})


  } catch(error){
    console.log(error)
    res.json({success:false,message:error.message})
  }
}


//Api for admin login

const loginAdmin = async (req,res) =>{
  try {
    const {email,password}= req.body

    if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
      const token = jwt.sign(email+password,process.env.JWT_SECRET)
       res.json({success:true,token})
    }
    else{
      res.json({success:false,message:"Invalid Credentials"})
    }
  }
  catch(error){
    console.log(error)
    res.json({success:false,message:error.message})
  }
}

// api to get all doctor list for admin panel

const allDoctors = async(req,res)=>{
try{
const doctors = await doctorModel.find({}).select('-password')
res.json({success:true,doctors})
}
catch(error){
  console.log(error);
  res.json({success:false,message:error.message})
}
}


//api to get all appoint list 
const appointmentAdmin = async(req,res)=>{

try {
  const appointments = await appointmentModel.find({})
  res.json({success:true,appointments})
} catch (error) {
  console.log(error);
  res.json({success:false,message:error.message})
}

}

//api for appointment cancellation
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(docId);

    let slots_booked = doctorData.slots_booked;
    slots_booked[slotDate] = slots_booked[slotDate].filter(
      e => e !== slotTime
    );

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api to get dashboard data for admin panel
const adminDashboard = async (req,res) =>{
  try {

    const doctors = await doctorModel.find({})
    const users = await userModel.find({})
    const appointments = await appointmentModel.find({})

    const dashData = {
      doctors: doctors.length,
      appointments:appointments.length,
      patients:users.length,
      latestAppointment: appointments.reverse().slice(0,5)
    }

    res.json({success:true, dashData})

    
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: 'error.message' });
  }
}

export{addDoctor,loginAdmin,allDoctors,appointmentAdmin,appointmentCancel, adminDashboard}



