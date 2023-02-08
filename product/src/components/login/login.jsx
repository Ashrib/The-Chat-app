import "./login.css"
import { useState,useRef,useContext } from 'react';
import axios from "axios"
import {useNavigate} from "react-router-dom"
import { GlobalContext } from '../../context/context';
import 'bootstrap/dist/css/bootstrap.min.css';
import Toast from 'react-bootstrap/Toast';


let baseUrl = ""
if (window.location.href.split(":")[0] === "http") {
  baseUrl = "http://localhost:3000";
  
}

else{
  baseUrl = "https://the-chat-app-production.up.railway.app/"
}



function Login() {
  axios.defaults.withCredentials = true

    const firstRef = useRef(null);
    const secondRef = useRef(null);
    const [email,setEmail] =useState ("") 
    const [password,setPassword] =useState ("") 
    let navigate = useNavigate();
    const [showError,setShowError] = useState (""); 
    let { state, dispatch } = useContext(GlobalContext);


    const loginHandler = (event)=>{
        event.preventDefault()
        let errorDiv = document.getElementById("error")
        let alertDiv = document.getElementById("alert")


        axios.post(`${baseUrl}/api/v1/login`, {
            email:email,
            password:password
          },{ withCredentials: true })

          .then((response) => {
            console.log(response);
            event.target.reset();
            window.location.reload();
            dispatch({
              type: 'USER_LOGIN',
              payload: response.data.profile
            })

        
            

          }, (error) => {
            console.log(error);
            console.log(error.message)
            alertDiv.style.display = "flex";
            setShowError(error.message);
            
            
            
          });
      



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
                <h3>Account Login</h3>
                <form onSubmit={loginHandler}>
                    <input ref={firstRef} className="inp-email" type="email" placeholder="Enter Email" required 
                    onChange={(e) =>{
                      setEmail(e.target.value)
                    }} />

                    <input ref={secondRef} type="password" placeholder="Enter Password" required 
                    onChange={(e) =>{
                      setPassword(e.target.value)
                    }}/>
                  <div className="btn-div">
                    <button className="login-btn" type="submit">Login</button>
                  </div>
                </form>
                <a href="/signup">If haven't an account? Register Now.</a><br />
                <a href="/forget-password">Forget Password?</a> 

            </div>
          
        </div>
      );
      
      
    }
    

export default Login;
