import Login from './pages/Login.js';
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    MeetingProvider,
    MeetingConsumer,
    useMeeting,
    useParticipant, createCameraVideoTrack,
} from "@videosdk.live/react-sdk";
import { authToken } from "./API";
import ReactPlayer from "react-player";
import axios from "axios";
import { getTreatmentAPIUrl } from "./getAPIUrls/getTreatmentAPIUrl"
import styles from "./App.module.css"
import {Avatar, Button, Menu, message, Modal, Spin} from "antd";
import {ArrowRightOutlined, HomeOutlined, UnorderedListOutlined, UserOutlined, LogoutOutlined} from "@ant-design/icons";
import CreatePatient from "./pages/CreatePatient/CreatePatient";
import CreateWound from "./pages/CreateWound/CreateWound";
import Patients from "./pages/Patients/Patients";
import PatientDetails from "./pages/PatientDetails/PatientDetails";
import TreatmentParameters from "./pages/TreatmentParameters/TreatmentParameters";
import TreatmentSessionDetails from "./pages/TreatmentSessionDetails/TreatmentSessionDetails";
import {Route, Routes, useNavigate} from "react-router-dom";
import Home from "./pages/Home/Home";
import SignUp from './pages/SignUp/SignUp.js';
import {useCookies} from "react-cookie";
import PostTreatment from './pages/PostTreatment/PostTreatment.js';
import WoundDetails from './pages/WoundDetails/WoundDetails.js';
import { signOut } from "firebase/auth";
import { auth } from "./firebaseConfig.js"

function App() {
    const [meetingId, setMeetingId] = useState(null);
    const [cookies] = useCookies(['cookie-name']);


    useEffect(() => {
        if(meetingId) return;
                
        const interval = setInterval(async () => {
            let apiRes = null
            try {
                apiRes = await axios.get(`${getTreatmentAPIUrl()}/treatment/get_video_call_id`)
            } catch (err) {
                console.error(err);
            } finally {
                if (apiRes?.data?.message !== "") {
                    setMeetingId(apiRes?.data?.message)
                }
            }
        }, 5000)
        return () => {
            clearInterval(interval)
        }
    }, [meetingId])

    //This will set Meeting Id to null when meeting is left or ended
    const onMeetingLeave = () => {
        setMeetingId(null);
    };

    return (
        <div className={styles.homePage}>
            <div className={styles.container}>{cookies["email"] !== "" && <SideMenu/>}
                <Content/>
            </div>
        </div>
    );
}

function Content() {
    const [cookies, setCookie] = useCookies(['cookie-name']);
    useEffect(() => {
        setCookie("email", "")
    }, []);
    return (
        <div>
            <Routes>
                <Route path="/" element={cookies["email"] !== "" ? <Home /> : <Login/>}></Route>
                <Route path="/treatment_session" element={<TreatmentParameters />}></Route>
                <Route path="/treatment_session_details/:id" element={<TreatmentSessionDetails />}></Route>
                <Route path="/post_treatment_session" element={<PostTreatment />}></Route>
                <Route path="/wound_details" element={<WoundDetails />}></Route>
                <Route path="/sign-up" element={<SignUp />}></Route>
                <Route path="/patients" element={<Patients />}></Route>
                <Route path="/create_patient" element={<CreatePatient />}></Route>
                <Route path="/patient_details/:mrn" element={<PatientDetails />}></Route>
                <Route path="/create_wound" element={<CreateWound />}></Route>
            </Routes>
        </div>
    );
}

function SideMenu() {
    const navigate = useNavigate()

    // logging user out
    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/");
            window.location.reload()
        } catch (error) {
            message.error("Error logging out - please try again ");
        }
    };
    return (
        <div className={styles.sideMenu}>
            <div className={styles.buttonContainer2}>
                <Button shape={"round"} className={styles.button} icon={<LogoutOutlined style={{color: "#004AAD"}}/>} onClick={handleLogout}/>
                <span style={{color: "white"}}>Logout</span>
            </div>
            <br />
            <div className={styles.buttonContainer2}>
                <Button shape={"round"} className={styles.button} icon={<HomeOutlined style={{color: "#004AAD"}}/>} onClick={() => navigate("/")}/>
                <span style={{color: "white"}}>Home</span>
            </div>
            {/*Add button to side menu for accessing (or creating) patient records*/}
            <div className={styles.buttonContainer2}>
                <Button shape={"round"} className={styles.button} icon={<UnorderedListOutlined style={{color: "#004AAD"}}/>} onClick={() => navigate("/patients")}/>
                <span style={{color: "white"}}>Patients</span>
            </div>
        </div>
    )
}

export default App;
