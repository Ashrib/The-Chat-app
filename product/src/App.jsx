import './App.css';
import {Route,Routes,Link,Navigate} from "react-router-dom"
import Home from "./components/home/home"
import Login from "./components/login/login"
import Signup from "./components/signup/signup"
import {useState,useEffect,useContext} from "react"
import axios from 'axios';
import { GlobalContext } from './context/context';
import 'bootstrap/dist/css/bootstrap.min.css';
import Spinner from 'react-bootstrap/Spinner';
import UpdatePassword from './components/update-pass/update';
import ForgetPass from './components/forget-pass/forget';
import ForgetPassWithSms from './components/forget-pass-with-sms/sms';
import ChatScreen from './components/chat_screen/chat';


axios.defaults.withCredentials = true

function App() {
  let { state, dispatch } = useContext(GlobalContext);
  console.log(state)

  useEffect(() => {
    let baseUrl = ""
    if (window.location.href.split(":")[0] === "http") {
      baseUrl = "http://localhost:3000";
      
    }
    else{
      baseUrl = "https://chat-app-with-socketio-production.up.railway.app"
    }
  

    const getProfile = async () => {

      try {
        let response = await axios.get(`${baseUrl}/api/v1/profile`, {
          withCredentials: true
        })
        console.log("Profile: ", response);
        dispatch({
          type: 'USER_LOGIN',
          payload:response.data
        })
      } catch (error) {

        console.log("axios error: ", error);
        dispatch({
          type: 'USER_LOGOUT'
        })
      }



    }
    getProfile();

  }, [])

  useEffect(() => {

    // Add a request interceptor
    axios.interceptors.request.use(function (config) {
      // Do something before request is sent
      config.withCredentials = true;
      return config;
    }, function (error) {
      // Do something with request error
      return Promise.reject(error);
    });

    // Add a response interceptor
    axios.interceptors.response.use(function (response) {
      // Any status code that lie within the range of 2xx cause this function to trigger
      // Do something with response data
      return response;
    }, function (error) {
      // Any status codes that falls outside the range of 2xx cause this function to trigger
      // Do something with response error
      if (error?.response?.status === 401) {
        dispatch({
          type: 'USER_LOGOUT'
        })
      }
      return Promise.reject(error);
    });
  }, [])




  

  return (
    <div>
       {/* {(state.isLogin == false)?

         :
         null
        }   */}

         {
         (state?.isLogin === true) ?
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/update-password" element={<UpdatePassword />} />
              <Route path="/chat/:id" element={<ChatScreen />} />






            </Routes>   
          :
            null
        } 


        {    
         (state.isLogin === false) ?

            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forget-password" element={<ForgetPass />} />
              <Route path="*" element={<Login/>}/>
              <Route path="/forget-pass-with-sms" element={<ForgetPassWithSms />} />




              

            </Routes>   
          :
            null
        }  
         

         { 
         (state.isLogin === null) ?
          <div className='loadingScreen'>
              <Spinner animation="border" variant="danger" />
                <p>Loading...</p>

          
            
          </div>
           
          :
            null
         } 

        




    </div>
      
  );
}

export default App;