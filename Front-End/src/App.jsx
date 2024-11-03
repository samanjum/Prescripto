import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './Pages/Home'
import Doctors from './Pages/Doctors'
import About from './Pages/About'
import Contact from './Pages/Contact'
import Myappointments from './Pages/Myappointments'
import Myprofile from './Pages/Myprofile'
import Appointment from './Pages/Appointment'
import Navbar from './Components/Navbar'
import Login from './Pages/Login'
import Footer from './Components/Footer'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



const App = () => {
  return (
    <div className='mx-4 sm:mx-[10%]'>
      <ToastContainer/>
      <Navbar/>
      <Routes>
<Route path='/' element={<Home/>}/>
<Route path='/doctors' element={<Doctors/>}/>
<Route path='/doctors/:speciality' element={<Doctors/>}/>
<Route path='/about' element={<About/>}/>
<Route path='/contact' element={<Contact/>}/>
<Route path='/login' element={<Login/>}/>
<Route path='/my-appointments' element={<Myappointments/>}/>
<Route path='/my-profile' element={<Myprofile/>}/>
<Route path='/appointment/:docId' element={<Appointment/>}/>

      </Routes>

      <Footer/>
    </div>
  )
}

export default App
