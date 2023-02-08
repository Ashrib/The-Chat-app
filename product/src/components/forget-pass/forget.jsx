import axios from "axios"
import {useState,useContext,useRef} from 'react';
import {useNavigate} from "react-router-dom"

import "./forget.css"




let baseUrl = ""
if (window.location.href.split(":")[0] === "http") {
  baseUrl = "http://localhost:3000";
  
}

else{
  baseUrl = "https://chat-app-with-socketio-production.up.railway.app"
}


function ForgetPass() {
    const [verifyEmail, setVerifyEmail] = useState(null)
    const [isOtpSent, setIsOtpSent] = useState(false)
    const [otp, setOtp] = useState(null)
    const [newPass, setNewPass] = useState(null)
    let navigate = useNavigate();




    const OtpRequestHandler = (()=>{
        axios.post(`${baseUrl}/api/v1/forget-password`, {
            email:verifyEmail,
          },{ withCredentials: true })

          .then((response) => {
            console.log(response.data.message);
            setIsOtpSent(true)
          }, (error) => {
            console.log(error);    
          });
      

       }) 

    const changePassHandler = ((e)=>{
      e.preventDefault()
      axios.post(`${baseUrl}/api/v1/forget-password-2`, {
          email:verifyEmail,
          otp:otp,
          newPassword:newPass
        },{ withCredentials: true })

        .then((response) => {
          console.log(response.data.message);
          navigate("/")

        }, (error) => {
          console.log(error);    
        });
     }) 



    return(
      
      
        <div className="mainn-div">
           <nav className='nav'>
                <img src="https://img.icons8.com/fluency/512/twitter.png" alt="" height="40" width="40" />

                <div className='right-side'>
                <a href="/">Login</a>
                <a href="/signup">Sign Up</a>

                </div>     
            </nav>
          <div className="sub-div">


          
         <h3>Reset Your Password</h3>

          {(isOtpSent == false)?
          <div>
            <input type="email" placeholder="Enter Email" onChange={(e) =>{
                setVerifyEmail(e.target.value)
             }}/>

             <button onClick={OtpRequestHandler}>Send OTP</button>
             <a href="forget-pass-with-sms" style={{display:"none"}}>Send SMS?</a>

          </div>
    
          :
          <div>
            <form onSubmit={changePassHandler}>
              <input type="number" placeholder="Enter Your OTP"onChange={(e) =>{
                setOtp(e.target.value)
             }} /> 
              <input type="text" placeholder="Enter Your New Password"onChange={(e) =>{
                setNewPass(e.target.value)
             }}
              />
              <button type="submit">Update</button>

            </form>
            

          </div>
          }
           
           </div>

        </div>
     
    )

}

export default ForgetPass