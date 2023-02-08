import axios from "axios";
import { useEffect, useState, useContext } from 'react';
import { GlobalContext } from '../../context/context';
import 'bootstrap/dist/css/bootstrap.min.css';
import moment from 'moment';
import { useParams } from "react-router-dom";
import { FaUserCircle } from 'react-icons/fa';
import { BsChevronDown} from 'react-icons/bs';
import { RxPaperPlane} from 'react-icons/rx';
import { io } from "socket.io-client";
import Toast from 'react-bootstrap/Toast';
import { Link } from "react-router-dom";
import boopSfx from "../../assets/notification.mp3";
import Spinner from 'react-bootstrap/Spinner';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

import "./chat.css"

let baseUrl = ""
if (window.location.href.split(":")[0] === "http") {
  baseUrl = "http://localhost:3000";
  
}

else{
  baseUrl = "https://chat-app-with-socketio-production.up.railway.app"
}


function ChatScreen() {

    let { state, dispatch } = useContext(GlobalContext);
    const { id } = useParams();


    const [writeMessage, setWriteMessage] = useState("");
    const [conversation, setConversation] = useState(null);
    const [recipientProfile, setRecipientProfile] = useState({});
    const [show, setShow] = useState(true);
    const audio = new Audio(boopSfx);
    const [notifications, setNotifications] = useState([]);
    const [deleteForMe, setDeleteForMe] = useState(null)




    const getMessages = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/v1/messages/${id}`)
            console.log("response: ", response.data);
            setConversation(response.data)

        } catch (error) {
            console.log("error in getting all tweets", error);
        }
    }


    const getRecipientProfile = async () => {
        try {
            let response = await axios.get(
                `${baseUrl}/api/v1/profile/${id}`,
                {
                    withCredentials: true
                });

            console.log("RecipientProfile: ", response);
            setRecipientProfile(response.data)
        } catch (error) {
            console.log("axios error: ", error);
        }
    }
    


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
        console.log("subscribed: ", `${state.user._id}-${id}`);

        socket.on(`${state.user._id}-${id}`, function (data) {
            console.log("socket Data " , data);
            setConversation(prev => [data,...prev ])

        });

        socket.on(`personal-channel-${state.user._id}`, function (data) {
            console.log("socket push data: ", data);
            setNotifications(prev => [...prev, data])
            audio.play()
        });


        return () => {
            socket.close();
        }
    }, [])

    useEffect(() => {
        getRecipientProfile();
        getMessages();

    }, [])


    const sendMessage = async (e) => {
        if (e) e.preventDefault();

        try {
            const response = await axios.post(`${baseUrl}/api/v1/message`, {
                to: id,
                text: writeMessage,
            })
            console.log("response: ", response.data);
            getMessages();
            e.target.reset()
        } catch (error) {
            console.log("error in getting all tweets", error);
        }
    }

    const dismissNotification = (notification) => {
        setNotifications(
            allNotifications => allNotifications.filter(eachItem => eachItem._id !== notification._id)
        )
        setShow(false)
    }


    const deleteMsgForMeHandler = async (msgId) =>{
        try {
            const response = await axios.post(`${baseUrl}/api/v1/deleteMsgForMe/`, {_id : msgId})
            console.log("Message Visibility Response", response)
            getMessages()

            
        } catch (error) {
            console.log("Message visibility request for change failed ", error)
            
        }


      
    }


    return (
        <div className="main-div">
            <div className="chat-subDiv">
               
                <div className="chatNav">
                  <img src={(!recipientProfile.profileImage)?"https://img.icons8.com/material-rounded/256/user.png":recipientProfile?.profileImage} alt="users profile" height="45" width="45" />
                  <p>{recipientProfile?.firstName} {recipientProfile?.lastName}</p> 
                  <p className="onlineStatus">{(recipientProfile?.isOnline === true)? "Online" : "Offline"}</p>
                  <a href="/" className="homeLink">Back</a>

                </div>
                <div className='chatNotificationView' >
                    {
                    notifications.map((eachNotification, index) => {
                        return <div key={index} className="item">
                                    <Toast style={{marginTop:"10px"}}>
                                    <strong className="me-auto" style={{paddingLeft:"10px" ,fontSize:"18px", paddingTop:"20px", textTransform:"capitalize"}}>{eachNotification.from.firstName} {eachNotification.from.lastName}</strong>
                                    <div onClick={() => { dismissNotification(eachNotification) }} className="close"> X </div>
                                    <a href={`/chat/${eachNotification.from._id}`}>
                                        <Toast.Body>{eachNotification.text.slice(0, 100)}</Toast.Body>
                                    </a>

                                    </Toast>
                        
                                </div>
                    })
                    }

                  </div>

                <div className="chatBox">
                    <div className="messagesDiv">
                        {(conversation?.length) ?
                            conversation?.map((eachMessage, index) => {

                                return <div key={index}>
                                            {(eachMessage.from.firstName == state.user.firstName && eachMessage.from.lastName == state.user.lastName)?
                                                <div className="myMsg">
                                                    <div className="myMsgTxt">{eachMessage.text} </div>
                                                    <div className="myTime">{moment(eachMessage.createdOn).fromNow()}</div>

                                                </div> 
                                                :
                                                    <div className={(eachMessage?.visibility !== true) ? "visibility" : "recipientMsg"}>
                                                        <div className= "resMsgTxt">
                                                                <Dropdown className="chatDrop">
                                                                    <Dropdown.Toggle variant="secondary" className="chatDropToggle">
                                                                        <BsChevronDown className="msgMenu"/>
                                                                    </Dropdown.Toggle>

                                                                    <Dropdown.Menu variant="dark">
                                                                        <Dropdown.Item onClick={ () =>{deleteMsgForMeHandler(eachMessage?._id)  }}>
                                                                            Delete for me
                                                                        </Dropdown.Item>
                                                                        <Dropdown.Item>
                                                                            Delete for everyone
                                                                        </Dropdown.Item>
                                                                    </Dropdown.Menu>
                                                                </Dropdown>

                                                           
                                                            
                                                            {eachMessage.text}

                                                            {/* <button onClick={ () =>{
                                                                deleteMsgForMeHandler(eachMessage?._id)
                                                            }}>Delete</button> */}
                                                             <div className="resTime">{moment(eachMessage.createdOn).fromNow()}</div>


                                                        </div>



                                                    </div>

                                                

                                            }

                                        </div>
                            })
                            : null
                        }
                        
                        {(conversation?.length === 0 ? "Start chatting with your first message..." : null)}
                        <div style={{position:"absolute", top:"50%",left: "50%"}}>
                            {(conversation === null ? <Spinner animation="grow" variant="primary" /> : null)}
                        </div>

                    </div>
                        <div className="sentMsgDiv">
                            <form onSubmit={sendMessage}>
                                <input type="text" placeholder='Type a message' onChange={(e) => [
                                    setWriteMessage(e.target.value)
                                ]} required maxLength="200"/>
                            <button type="submit"><RxPaperPlane  className="sentBtn"/></button>
                            </form>
                        </div>
                </div>
                
            </div>

        </div>
    );
}

export default ChatScreen;
