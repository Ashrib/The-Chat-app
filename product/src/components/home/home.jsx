import "./home.css"
import {GlobalContext} from "../../context/context"
import axios from "axios";
import moment from 'moment';
import InfiniteScroll from 'react-infinite-scroller';
import { useEffect, useState, useContext,useRef } from 'react';
import { Link } from "react-router-dom";
import { BsSearch,BsThreeDotsVertical } from 'react-icons/bs';
import { FaUserCircle } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { io } from "socket.io-client";
import Toast from 'react-bootstrap/Toast';
import boopSfx from "../../assets/notification.mp3";
import Spinner from 'react-bootstrap/Spinner';







let baseUrl = ""
if (window.location.href.split(":")[0] === "http") {
  baseUrl = "http://localhost:3000";
  
}

else{
  baseUrl = "https://the-chat-app-production.up.railway.app/"
}



function Home (){
  let { state, dispatch } = useContext(GlobalContext);
  console.log("State", state)

  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const [show, setShow] = useState(true);
  const audio = new Audio(boopSfx);

 


  useEffect(() => {

    const socket = io(state.baseUrlSocketIo, {
        withCredentials: true
    });

    socket.on('connect', function () {
        console.log("connected")
    });
    socket.on('disconnect', function (message) {
        console.log("Socket disconnected from server: ", message);
    });
    socket.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
    });

    console.log("subscribed: ", `personal-channel-${state.user._id}`);

    socket.on(`personal-channel-${state.user._id}`, function (data) {
        console.log("socket push data: ", data);
        setNotifications(prev => [...prev, data])
        audio.play();
       
    });

    return () => {
        socket.close();
    }

  }, [])



  useEffect(() => {

      getUsers();

  }, [])

  const getUsers = async (e) => {
      if (e) e.preventDefault();

      try {
          const response = await axios.get(`${baseUrl}/api/v1/users?q=${searchTerm}`)
          console.log("response: ", response.data);
          setUsers(response.data)

      } catch (error) {
          console.log("error in getting all tweets", error);
      }
  }

  const logoutHandler = () =>{
    axios.post(`${baseUrl}/api/v1/logout`,{
      email:state.user.email
    },{
      withCredentials: true
    })

    .then((response) => {
      console.log(response);
      dispatch({
        type: 'USER_LOGOUT',
        payload: null
    })


    }, (error) => {
      console.log(error);
    });
  }



  
  const dismissNotification = (notification) => {
    setNotifications(
        allNotifications => allNotifications.filter(eachItem => eachItem._id !== notification._id)
    )
    setShow(false)
  }



  return (
      <div className="main-div">
        
        <div className="home-subDiv">
                
        <div className='notificationView' >
            {
              notifications.map((eachNotification, index) => {
                  return <div key={index} className="item">
                    
                            <Toast style={{marginTop:"10px"}}>
                              <strong className="me-auto" style={{paddingLeft:"10px" ,fontSize:"18px", paddingTop:"20px", textTransform:"capitalize"}}>{eachNotification.from.firstName} {eachNotification.from.lastName}</strong>
                              <div onClick={() => { dismissNotification(eachNotification) }} className="close"> X </div>
                              <Link to={`/chat/${eachNotification.from._id}`}>
                                  <Toast.Body>{eachNotification.text.slice(0, 100)}</Toast.Body>
                              </Link>

                            </Toast>
                
                           </div>
              })
            }

          </div>

     

         
          <div className="homeNav">
            <img src={state.user.profileImage} alt="Profile Photo" height="40" width="40" />
            <Dropdown className="drop">
              <Dropdown.Toggle className="dropToggle" id="dropdown-button-dark-example1" variant="secondary">
                <BsThreeDotsVertical className="menu"/>
              </Dropdown.Toggle>

              <Dropdown.Menu variant="dark">
                <Dropdown.Item onClick={logoutHandler}>Log Out</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

           



          </div>
         <div className="left-pannel">
   

              <form onSubmit={getUsers}>
          
                  {/* <button type="submit">Search</button> */}
                  <InputGroup size="sm" className="mb-3">
                      <Button className="search-btn" variant="outline-secondary" id="button-addon1" type="submit">
                         <BsSearch/>
                      </Button>   
                      <Form.Control
                        aria-label="Example text with button addon"
                        aria-describedby="inputGroup-sizing-sm"
                        type="search"
                        placeholder="Search or start new chat"
                        onChange={(e) => [
                          setSearchTerm(e.target.value)
                        ]}
                        required
                      />
                  </InputGroup>
              </form>

              {(users?.length) ?
                  users?.map((eachUser, index) => {
                     
                    return <div className='userListItem' key={index}>
                            <Link to={`/chat/${eachUser._id}`}>
                              <div className="user">
                                <img src={(!eachUser.profileImg)?"https://img.icons8.com/material-rounded/256/user.png":eachUser?.profileImg} alt="users profile" height="45" width="45" />
                                <p>{eachUser?.firstName} {eachUser?.lastName}</p>
                                {(eachUser.isOnline === true)?
                                  <img src="https://img.icons8.com/emoji/1x/green-circle-emoji.png" alt="online dot" height="10" width="10" className="onlineDot" />:
                                  null
                                 }
                              
                              </div>
                          
                            </Link>
                           </div>
                  })
                  : null
              }
              {(users?.length === 0 ? "No users found" : null)}
              <div style={{position:"absolute", top:"50%",left: "50%"}}>
                {(users === null ? <Spinner animation="grow" variant="primary" /> : null)}
              </div>
        
          </div>


       
         
        </div>
      </div>
  );

  
}

export default Home

