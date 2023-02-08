import "./signup.css"
import { useState,useRef } from 'react';
import axios from "axios"
import {useNavigate} from "react-router-dom"
import { storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {v4} from "uuid"

let baseUrl = ""
if (window.location.href.split(":")[0] === "http") {
  baseUrl = "http://localhost:3000";
  
}
else{
    baseUrl = "https://the-chat-app-production.up.railway.app/"
  }

function Signup() {
    axios.defaults.withCredentials = true

    const firstRef = useRef(null);
    const secondRef = useRef(null);
    const thirdRef = useRef(null);
    const fourthRef = useRef(null);
    const fifthRef = useRef(null);
    const [firstName,setFirstName] =useState ("") 
    const [lastName,setLastName] =useState ("") 
    const [email,setEmail] =useState ("") 
    const [password,setPassword] =useState ("") 
    let navigate = useNavigate();
    const [imageUpload,setImageUpload] =useState (null) 









    const signUpHandler = (event)=>{
        event.preventDefault()
        let errorDiv = document.getElementById("error")
        let alertDiv = document.getElementById("alert")

        let imageRef = ref(storage,`profileImages/${imageUpload?.name + v4()}`);

    uploadBytes(imageRef, imageUpload).then((snapshot) =>{
      console.log("Firebase Storage",snapshot)

      getDownloadURL(snapshot.ref)
      .then((url) =>{
        console.log("ImageURL", url)
            axios.post(`${baseUrl}/api/v1/signup`, {
                firstName: firstName,
                lastName: lastName,
                email:email,
                password:password,
                profileImage:url
            })

            .then((response) => {
                console.log(response);
                event.target.reset();
                navigate("/")
                

            }, (error) => {
                console.log(error);
                alertDiv.style.display = "block"
                errorDiv.textContent = error?.response?.data?.message
            });

        })
        .catch((e) =>{
            console.log("Image Url Error", e)
    
        })
    
    })
    .catch((e) =>{
      console.log("Storage Error", e)

    })

      

        
      



    }
    
    const closeHandler = () =>{
        let alertDiv = document.getElementById("alert")
        alertDiv.style.display = "none"
  
    }


    return (

        <div className='main-div'>
            <nav className='nav'>
                <img src="https://img.icons8.com/fluency/512/twitter.png" alt="" height="40" width="40" />

                <div className='right-side'>
                    <a href="/">Login</a>
                    <a href="/signup">Sign Up</a>

                </div>     
            </nav>           
            <div className="alerts-div" id="alert">
                <div className="error-div">
                    <p id="error"></p>
                    <button onClick={closeHandler}>Ok</button>

                </div>


            </div>


            <div className='sub-div'>
                <h3>Register Yourself</h3>
                <form onSubmit={signUpHandler}>
                    <div className="name-div">
                        <input ref={firstRef} type="text" placeholder="First Name" required onChange={(e) =>{
                            setFirstName(e.target.value)

                        }} />
                        <input ref={secondRef} type="text" placeholder="last Name" required onChange={(e) =>{
                            setLastName(e.target.value)

                        }} />

                    </div>

                    
                    <input ref={thirdRef} className="mail-input" type="email" placeholder="Enter Email" required onChange={(e) =>{
                            setEmail(e.target.value)

                        }} />
                    <input ref={fourthRef} type="password" placeholder="Enter Password" required onChange={(e) =>{
                            setPassword(e.target.value)

                        }} />
                    <label className="profileImg">Profile Picture</label>

                    <input ref={fifthRef} type="file" required  name='profilePic' accept='image/png, image/jpg, image.jpeg'  id='imgInput' onChange={(e) => {
                            setImageUpload(e.target.files[0])
                    }}/>

                    <button type="submit">Register</button>
                </form>
                <a href="/">Already have an account LogIn.</a>

                
                

            </div>
          
        </div>
      );


}


export default Signup;