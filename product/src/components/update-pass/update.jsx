import { GlobalContext } from '../../context/context';
import axios from "axios"
import {useState,useContext,useRef} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Toast from 'react-bootstrap/Toast';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import ToastContainer from 'react-bootstrap/ToastContainer';


import "./update.css"






let baseUrl = ""
if (window.location.href.split(":")[0] === "http") {
  baseUrl = "http://localhost:3000";
  
}
else{
  baseUrl = "https://the-chat-app-production.up.railway.app/"
}



function UpdatePassword() {
    let { state, dispatch } = useContext(GlobalContext);
    const [currentPass, setCurrentPass] = useState(null)
    const [newPass, setNewPass] = useState(null)
    const firstRef = useRef(null);
    const secondRef = useRef(null);
    const [isSpinner, setIsSpinner] = useState(null)
    const [show, setShow] = useState(false);

    if (isSpinner === true) {
        document.querySelector(".spinnerDiv").style.display = "block"
        
      }
    
    if (isSpinner === false) {
        document.querySelector(".spinnerDiv").style.display = "none"
    }
    



    const logoutHandler = () =>{
        axios.get(`${baseUrl}/api/v1/logout`,{
        withCredentials: true
        })
    
        .then((response) => {
        console.log(response);
        setIsSpinner(true)
        setTimeout(() => {
            setIsSpinner(false);
            dispatch({
                type: 'USER_LOGOUT',
                payload: null
            })
        }, 2000);
       
        }, (error) => {
        console.log(error);
        });
    
    }

    const updatePasswordHandler=(e) =>{
        let errorDiv = document.getElementById("error")
        let alertDiv = document.getElementById("alert")
        e.preventDefault()
        axios.post(`${baseUrl}/api/v1/change-password`,{
            currentPassword: currentPass,
            password: newPass
        },{withCredentials: true})
        .then((response) => {
            console.log(response);
            setIsSpinner(true)
            setTimeout(() => {
                setIsSpinner(false);
                setShow(true)
                e.target.reset()
            }, 3000);
    
        }, (error) => {
            console.log(error);
            alertDiv.style.display = "block"
            errorDiv.textContent = error?.response?.data
           
            


        });
        


    }

    const closeHandler = () =>{
        let alertDiv = document.getElementById("alert")
        alertDiv.style.display = "none"
  
      }
    

    return(
        <div className='main-div'>
            <div className="alerts-div" id="alert">
                <div className="error-div">
                <p id="error"></p>
                <button onClick={closeHandler}>Ok</button>

            </div>
          </div>

            <div className='spinnerDiv'>
                <div className='spinner'>
                    <Spinner animation="grow" variant="danger" />
                </div>

            </div>
            <ToastContainer position='bottom-end' className='toast-div'>
                <Toast onClose={() => setShow(false)} show={show} delay={3000} autohide>
                    <Toast.Body className='txt'>Password change successfully </Toast.Body>
                </Toast>
            </ToastContainer>

            <div className='leftPannel'>

                <div className='icons'>
                <p><a href="/"><img src="https://img.icons8.com/fluency/512/twitter.png" alt="twitter logo" height="40" width="40" /></a> </p>
                <p><a href="/profile"><img src="https://img.icons8.com/material-rounded/512/gender-neutral-user.png" alt="profile" title='profile' height="40" width="40" /></a></p> 
                <p><img src={state?.user?.profileImage} alt='account' height="40" width="40" onClick={logoutHandler}/></p> 
                <p><a href="update-password"><img src="https://img.icons8.com/ios-glyphs/512/approve-and-update.png" alt='account' height="40" width="40"/></a></p> 
                </div>
            </div>

            <div className='center-div'>
                <h3>Update Password</h3>
                <form onSubmit={updatePasswordHandler}>
                    <input type="text" ref={firstRef} placeholder='Enter Your Current Password' onChange={(e) =>{
                        setCurrentPass(e.target.value)

                    }} required />
                    <input type="text" ref={secondRef} placeholder='Enter Your New Password'onChange={(e) =>{
                        setNewPass(e.target.value)

                    }} required
                      />
                    <Button variant="outline-primary" type='submit' className='updates'>Update</Button>



                </form>
                

            </div>
        </div>

        
    )

}

export default UpdatePassword