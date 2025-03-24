import React, { useContext, useState } from 'react'
import './LeftSidebar.css'
import assets from '../../assets/assets'
import { useNavigate } from 'react-router-dom'
import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'

const LeftSidebar = () => {

    const navigate = useNavigate();
    /*const {userData} = useContext(AppContext);*/
    const {chatData,userData} = useContext(AppContext);
    const {chatUser,setChatUser,setMessagesId,messageId} = useContext(AppContext);
    const [user,setUser] = useState(null);
    const [showSearch,setShowSearch] = useState(false);


    const inputHandler = async (e) => {
        try {
            const input = e.target.value;
            if (input) {
                setShowSearch(true);
                const userRef = collection(db,'users');
                const q = query(userRef,where("username","==",input.toLowerCase()));
                const querySnap = await getDocs(q);
                if(!querySnap.empty && querySnap.docs[0].data().id !== userData.id){
                    let userExist = false
                    chatData.map((user)=>{
                        if (user.rId === querySnap.docs[0].data().id) {
                            userExist=true;
                        }
                    })
                    if (!userExist) {
                        setUser(querySnap.docs[0].data());
                    }
                } 
                else{
                    setUser(null);
                }
            }
            else{
                setShowSearch(false);
            }
            

        } catch (error) {
            
        }
    }

    const addChat = async ()=>{
        const messagesRef = collection(db,"messages");
        const chatsRef = collection(db,"chats")
        try {
            const newMessagesRef = doc(messagesRef);
            await setDoc(newMessagesRef,{
                createAt:serverTimestamp(),
                messages:[]
            })

            await updateDoc(doc(chatsRef,user.id),{
                chatsData:arrayUnion({
                    messageId:newMessagesRef.id,
                    lastMessage:"",
                    rId:userData.id,
                    updateAt:Date.now(),
                    messageSeen:true
                })
            })

            await updateDoc(doc(chatsRef,userData.id),{
                chatsData:arrayUnion({
                    messageId:newMessagesRef.id,
                    lastMessage:"",
                    rId:user.id,
                    updateAt:Date.now(),
                    messageSeen:true
                })
            })
        } catch (error) {
            
        }
    }

        const setChat = async (item) =>{
            setMessagesId(item.messageId);
            setChatUser(item)
        }



  return (
    <div className='ls'>
      <div className="ls-top">
        <div className="ls-nav">
            <img src={assets.logo} className='logo'/>
            <div className="menu">
                <img src={assets.menu_icon} alt="" />
                <div className="sub-menu">
                    <p onClick={()=>navigate('/profile')}>Edit Profile</p>
                    <hr />
                    <p>Logout</p>
                </div>
            </div>
        </div>
        
        <div className="ls-search">
                <img src={assets.search_icon} alt="" />
                <input onChange={inputHandler} type="text" placeholder='Search here..' />
            </div>
        </div>
        <div className="ls-list">
            {showSearch && user 
            ? <div onClick={addChat} className='friends ass-user'>
            <img src={user.avatar} alt="" />
                <p>{user.name}</p>
            </div>
            : 
            chatData && chatData.length > 0 ? (
                chatData.map((item, index) => {
                  
                  return (
                    <div onClick={() => setChat(item)} key={index} className="friends">
                      {/* Check if userData and avatar exist before rendering */}
                      {item.userData && item.userData.avatar ? (
                        <img src={assets.profile_img} alt={item.userData.name || "User Avatar"} />
                      ) : (
                        <img src={assets.profile_img} alt="Default Avatar" /> // Fallback for missing avatar
                      )}
                      <div>
                        <p>{item.userData ? item.userData.name : "Unknown User"}</p>
                        <span>{item.lastMessage}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>No chats available</p> // Optional: message if no data
              )
              
              
              
            }
        </div>
    </div>
  )
}

export default LeftSidebar 

