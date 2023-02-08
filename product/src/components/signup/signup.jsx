import "./signup.css"
import { useState,useRef } from 'react';
import axios from "axios"
import {useNavigate} from "react-router-dom"
import { storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {v4} from "uuid"
import 'bootstrap/dist/css/bootstrap.min.css';
import Toast from 'react-bootstrap/Toast';

let baseUrl = ""
if (window.location.href.split(":")[0] === "http") {
  baseUrl = "http://localhost:3000";
  
}
else{
    baseUrl = "the-chat-app-production.up.railway.app"
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
    const [showError,setShowError] = useState (""); 
    const [imageUpload,setImageUpload] =useState (null) 





    const signUpHandler = (event)=>{
        event.preventDefault();
        let errorDiv = document.getElementById("error")
        let alertDiv = document.getElementById("alert")

        // let imageRef = ref(storage,`profileImages/${imageUpload?.name + v4()}`);

    // uploadBytes(imageRef, imageUpload).then((snapshot) =>{
    //   console.log("Firebase Storage",snapshot)

    //   getDownloadURL(snapshot.ref)
    //   .then(
        // () =>{
        // console.log("ImageURL", url)
            axios.post(`${baseUrl}/api/v1/signup`, {
                firstName: firstName,
                lastName: lastName,
                email:email,
                password:password,
                profileImage:null
            })

            .then((response) => {
                console.log(response);
                event.target.reset();
                navigate("/")
                

            }, (error) => {
                console.log(error);
            console.log(error.message)
            alertDiv.style.display = "flex";
            setShowError(error.message);
            });

        // }
        // )
    //     .catch((e) =>{
    //         console.log("Image Url Error", e)
    // 
    //     })
    
    // })
//     .catch((e) =>{
//       console.log("Storage Error", e)
// 
//     })
    }
    
    const closeHandler = () =>{
        let alertDiv = document.getElementById("alert")
        alertDiv.style.display = "none"
  
    }


    return (
<div className='main-div'>
            <div className="error-alert" id="alert">
            <Toast >
            <Toast.Header closeButton={false}>
              <strong className="me-auto">Error</strong>
              <small className="err-close" onClick={closeHandler} closeButton={false}>X</small>
            </Toast.Header>
            <Toast.Body>{showError}</Toast.Body>
          </Toast>

          </div>

            <div className='content-div'>
                <h3>Register</h3>
                <form onSubmit={signUpHandler}>
                    <div className="names-inp">
                        <input ref={firstRef} type="text" placeholder="First Name" required onChange={(e) =>{
                            setFirstName(e.target.value)

                        }} />
                        <input ref={secondRef} type="text" placeholder="last Name" required onChange={(e) =>{
                            setLastName(e.target.value)

                        }} />

                    </div>

                    
                    <input ref={thirdRef} className="inp-email" type="email" placeholder="Enter Email" required onChange={(e) =>{
                            setEmail(e.target.value)

                        }} />
                    <input ref={fourthRef} type="password" placeholder="Enter Password" required onChange={(e) =>{
                            setPassword(e.target.value)

                        }} />
                    {/* <input ref={fifthRef} type="file" required  name='profilePic' accept='image/png, image/jpg, image.jpeg'  id='imgInput' onChange={(e) => {
                       setImageUpload(e.target.files[0])
                    }}/> */}
                    <div className="btn-div">
                    <button className="signup-btn" type="submit">Sign UP</button>
                    </div>
                </form>
                <a href="/">Already have an account? Login</a>

            </div>
          
        </div>
      );


}


export default Signup;