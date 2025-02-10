import Login from './pages/Login.js';
import React, { useEffect, useState } from "react";
import { MeetingProvider } from "@videosdk.live/react-sdk";
import { authToken } from "./API";
import axios from "axios";
import { getTreatmentAPIUrl } from "./getAPIUrls/getTreatmentAPIUrl";
import styles from "./App.module.css";
import { Button } from "antd";
import { HomeOutlined, UnorderedListOutlined } from "@ant-design/icons";
import CreatePatient from "./pages/CreatePatient/CreatePatient";
import Patients from "./pages/Patients/Patients";
import TreatmentParameters from "./pages/TreatmentParameters/TreatmentParameters";
import { Route, Routes, useNavigate } from "react-router-dom";
import Home from "./pages/Home/Home";
import { useCookies } from "react-cookie";
import PatientPage from "./pages/Patients/PatientPage"; // Imported the new blank patient page

function App() {
    const [meetingId, setMeetingId] = useState(null);
    const [cookies] = useCookies(['cookie-name']);

    useEffect(() => {
        const interval = setInterval(async () => {
            let apiRes = null;
            try {
                apiRes = await axios.get(`${getTreatmentAPIUrl()}/treatment/get_video_call_id`);
            } catch (err) {
                console.error(err);
            } finally {
                if (apiRes?.data?.message !== "") {
                    setMeetingId(apiRes?.data?.message);
                }
            }
        }, 5000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    const onMeetingLeave = () => {
        setMeetingId(null);
    };

    return (
        <div className={styles.homePage}>
            {authToken && meetingId ? (
                <MeetingProvider
                    config={{
                        meetingId,
                        micEnabled: true,
                        webcamEnabled: true,
                        name: "clinician",
                    }}
                    token={authToken}
                >
                    {/* Meeting View component here */}
                </MeetingProvider>
            ) : (
                <div className={styles.container}>{cookies["email"] !== "" && <SideMenu />}<Content /></div>
            )}
        </div>
    );
}

function Content() {
    const [cookies, setCookie] = useCookies(['cookie-name']);
    useEffect(() => {
        setCookie("email", "");
    }, []);
    return (
        <div>
            <Routes>
                <Route path="/" element={cookies["email"] !== "" ? <Home /> : <Login />} />
                <Route path="/treatment_session" element={<TreatmentParameters />} />
                <Route path="/patients" element={<Patients />} />
                <Route path="/create_patient" element={<CreatePatient />} />
                <Route path="/patient/:patientId" element={<PatientPage />} /> {/* Added route for the new patient page */}
            </Routes>
        </div>
    );
}

function SideMenu() {
    const navigate = useNavigate();
    return (
        <div className={styles.sideMenu}>
            <div className={styles.buttonContainer2}>
                <Button shape={"round"} className={styles.button} icon={<HomeOutlined style={{ color: "#004AAD" }} />} onClick={() => navigate("/")} />
                <span style={{ color: "white" }}>Home</span>
            </div>
            <div className={styles.buttonContainer2}>
                <Button shape={"round"} className={styles.button} icon={<UnorderedListOutlined style={{ color: "#004AAD" }} />} onClick={() => navigate("/patients")} />
                <span style={{ color: "white" }}>Patients</span>
            </div>
        </div>
    );
}

export default App;
