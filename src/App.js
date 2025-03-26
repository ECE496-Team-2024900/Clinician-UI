import Login from './pages/Login.js';
import React, { useEffect } from "react";
import styles from "./App.module.css"
import { Button, message } from "antd";
import {
    HomeOutlined,
    LogoutOutlined,
    UsergroupAddOutlined, ClockCircleOutlined
} from "@ant-design/icons";
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
import Schedule from "./pages/Schedule/Schedule";
import {Footer} from "antd/es/layout/layout";

function App() {
    const [cookies] = useCookies(['cookie-name']);
    return (
        <div className={styles.homePage}>
            <div className={styles.container}>{cookies["email"] !== "" && <SideMenu/>}
                <Content/>
            </div>
            <Footer className={styles.footer}>{"© 2025 University of Toronto Department of Electrical and Computer Engineering Capstone Design Project Team 2024900 (Faatima Abidi, Nilofer Hyder, Shreya Setlur, Zoya Chishtie)"}</Footer>
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
                <Route path="/schedule" element={<Schedule />}></Route>
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
                <Button shape={"round"} className={styles.button} icon={<UsergroupAddOutlined style={{color: "#004AAD"}}/>} onClick={() => navigate("/patients")}/>
                <span style={{color: "white"}}>Patients</span>
            </div>
            {/*Add button to side menu for accessing schedule*/}
            <div className={styles.buttonContainer2}>
                <Button shape={"round"} className={styles.button} icon={<ClockCircleOutlined style={{color: "#004AAD"}}/>} onClick={() => navigate("/schedule")}/>
                <span style={{color: "white"}}>Schedule</span>
            </div>
        </div>
    )
}

export default App;
