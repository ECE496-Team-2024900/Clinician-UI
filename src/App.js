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
import {
    ArrowRightOutlined,
    HomeOutlined,
    UnorderedListOutlined,
    UserOutlined,
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

function ParticipantView(props) {
    const micRef = useRef(null);
    const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName } =
        useParticipant(props.participantId);

    const videoStream = useMemo(() => {
        if (webcamOn && webcamStream) {
            const mediaStream = new MediaStream();
            mediaStream.addTrack(webcamStream.track);
            return mediaStream;
        }
    }, [webcamStream, webcamOn]);

    useEffect(() => {
        if (micRef.current) {
            if (micOn && micStream) {
                const mediaStream = new MediaStream();
                mediaStream.addTrack(micStream.track);

                micRef.current.srcObject = mediaStream;
                micRef.current
                    .play()
                    .catch((error) =>
                        console.error("videoElem.current.play() failed", error)
                    );
            } else {
                micRef.current.srcObject = null;
            }
        }
    }, [micStream, micOn]);

    return (
        <span style={{width: "50vw", display: "flex"}}>
            <audio ref={micRef} autoPlay playsInline muted={isLocal} />
            {webcamOn && (
                <ReactPlayer
                    //
                    playsinline // extremely crucial prop
                    pip={false}
                    light={false}
                    controls={false}
                    muted={true}
                    playing={true}
                    height={"300px"}
                    width={"300px"}
                    //
                    url={videoStream}
                    //
                    onError={(err) => {
                        console.log(err, "participant video error");
                    }}
                />
            )}
        </span>
    );
}

function Controls(props) {
    const { end, toggleMic, toggleWebcam, getWebcams, changeWebcam, localParticipant } = useMeeting();
    const { webcamStream, webcamOn, captureImage } = useParticipant(
        props.participantId
    );
    const navigate = useNavigate()
    const [frontFacing, setFrontFacing] = useState(false)
    const flipCam = async () => {
        const devices = await getWebcams()
        const customTrack = await createCameraVideoTrack({
            cameraId: devices[0].deviceId,
            facingMode: frontFacing ? "BACK" : "FRONT",
            optimizationMode: "motion",
            multiStream: false,
        });
        setFrontFacing(!frontFacing)
        changeWebcam(customTrack)
    }
    const endMeeting = async () => {
        axios.put(`${getTreatmentAPIUrl()}/treatment/remove_video_call_id`,{id: 1} ).then(res => {
            end()
            navigate("/treatment_session", { state: {preTreatment: true} })
        })
    }

    const takeAndUploadScreenshot = async () => {
        if (webcamOn && webcamStream) {
            const base64 = await captureImage({}); // captureImage will return base64 string
            axios.put(`${getTreatmentAPIUrl()}/treatment/add_image`, {image: base64, id: 1} ).then(res => {
                console.log("image saved successfully")
            })
        } else {
            console.error("Camera must be on to capture an image");
        }
    }

    return (
        <div className={styles.buttonContainer}>
            <Button type={"primary"} style={{background: "#004AAD"}} onClick={() => endMeeting()}>End Meeting</Button>
            <Button type={"primary"} style={{background: "#004AAD"}} onClick={() => toggleMic()}>Toggle Mic</Button>
            <Button type={"primary"} style={{background: "#004AAD"}} onClick={() => toggleWebcam()}>Toggle Cam</Button>
            <Button type={"primary"} style={{background: "#004AAD"}} onClick={() => flipCam()}>Flip Cam</Button>
            <Button type={"primary"} style={{background: "#004AAD"}} onClick={() => takeAndUploadScreenshot()}>Take Screenshot</Button>
        </div>
    );
}

function MeetingView(props) {
    const [joined, setJoined] = useState(null);
    const { join, participants, localParticipant } = useMeeting({
        //Get the method which will be used to join the meeting.
        //We will also get the participants list to display all participants
        //callback for when meeting is joined successfully
        onMeetingJoined: () => {
            setJoined("JOINED");
        },
        //callback for when meeting is ended
        onMeetingLeft: () => {
            props.onMeetingLeave();
        },
    });
    const joinMeeting = () => {
        setJoined("JOINING");
        join();
    };

    return (
        <div className="container">
            {joined && joined === "JOINED" ? (
                <div>
                    <Controls participantId={[...participants.keys()].filter(id => id !== localParticipant.id)?.[0]} />
                    {[...participants.keys()].map((participantId) => (
                        <ParticipantView
                            participantId={participantId}
                            key={participantId}
                        />
                    ))}
                </div>
            ) : joined && joined === "JOINING" ? (
                <Spin fullscreen={true} tip={"Joining the meeting..."} />
            ) : (
                <Modal
                    closable={false}
                    styles={{content: { backgroundColor: '#004AAD', color: "white" }, header: { backgroundColor: '#004AAD', color: "white" }}}
                    open={true}
                    okButtonProps={{style: {backgroundColor: "white", color: "#004AAD" }}}
                    cancelButtonProps={{ style: { display: 'none' } }}
                    title={<span style={{color: "white"}}>{"Please join the video call"}</span>}
                    onOk={joinMeeting}
                    okText={"Join"}>
                    {"The treatment for patient has begun. Please join the video call."}
                </Modal>
            )}
        </div>
    );
}

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
            {authToken && meetingId ? <MeetingProvider
                config={{
                    meetingId,
                    micEnabled: true,
                    webcamEnabled: true,
                    name: "clinician",
                }}
                token={authToken}
            >
                <MeetingView meetingId={meetingId} onMeetingLeave={onMeetingLeave} />
            </MeetingProvider> : <div className={styles.container}>{cookies["email"] !== "" && <SideMenu/>}<Content/></div>}
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
