




import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/usermodel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudaniry } from "cloudinary";
import doctorModel from "../models/doctormodel.js";
import appointmentModel from "../models/appointmentModel.js";
import razorpay from "razorpay";

// Initialize Razorpay instance
const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// API to register user
// const registerUser = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !password || !email) {
//       return res.json({ success: false, message: "Missing Details" });
//     }

//     if (!validator.isEmail(email)) {
//       return res.json({ success: false, message: "Enter valid Email" });
//     }

//     if (password.length < 8) {
//       return res.json({ success: false, message: "Enter Strong Password" });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const newUser = new userModel({ name, email, password: hashedPassword });
//     const user = await newUser.save();

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

//     res.json({ success: true, token });
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };


const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !password || !email) {
      return res.json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter valid Email" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Enter Strong Password" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({ name, email, password: hashedPassword });
    const user = await newUser.save();

    console.log("User registered successfully:", user); // Log the saved user

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    console.log("Registration error:", error);
    res.json({ success: false, message: error.message });
  }
};


// API for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get user profile data
const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const userData = await userModel.findById(userId).select("-password");

    res.json({ success: true, userData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update user profile
const updateProfile = async (req, res) => {
  try {
    const { userId, name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Data Missing" });
    }

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    });

    if (imageFile) {
      const imageUpload = await cloudaniry.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageURL = imageUpload.secure_url;

      await userModel.findByIdAndUpdate(userId, { image: imageURL });
    }

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to book appointment
const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;
    const docData = await doctorModel.findById(docId).select("-password");
    console.log('Value of docData is: ', docData)

    if (!docData.available) {
      return res.json({ success: false, message: "Doctor is not available" });
    }

    let slots_booked = docData.slots_booked;

    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: "Slot is not available" });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    const userData = await userModel.findById(userId).select("-password");
    delete docData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    res.json({ success: true, message: "Appointment Booked" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API for user appointment list for frontend my-appointment page
const listAppointment = async (req, res) => {
  try {
    const { userId } = req.body;
    const appointments = await appointmentModel.find({ userId });

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData.userId !== userId) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(docId);

    let slots_booked = doctorData.slots_booked;
    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e) => e !== slotTime
    );

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to make payment of appointment using Razorpay
const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData || appointmentData.cancelled) {
      return res.json({
        success: false,
        message: "Appointment Cancelled or not found",
      });
    }

    const options = {
      amount: appointmentData.amount * 100,
      currency: process.env.CURRENCY,
      receipt: appointmentId,
    };

    console.log("Creating order with options:", options);
    const order = await razorpayInstance.orders.create(options);

    res.json({ success: true, order });
  } catch (error) {
    console.log("Order creation error:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to verify payment
const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

  if (orderInfo.status === 'paid'){
      await appointmentModel.findByIdAndUpdate(orderInfo.receipt,{payment:true})
      res.json({success:true,message:"Payment Successful"})
  } 
else{
  res.json({success:false,message:"Payment Failed"})

}

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay,
};
