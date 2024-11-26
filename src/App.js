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
import { getUsersAPIUrl } from "./getAPIUrls/getUsersAPIUrl"
import styles from "./App.module.css"
import {Avatar, Button, Menu, Modal, Spin} from "antd";
import {ArrowRightOutlined, HomeOutlined, UserOutlined} from "@ant-design/icons";
import TreatmentParameters from "./pages/TreatmentParameters/TreatmentParameters";
import {Route, Routes, useNavigate} from "react-router-dom";
import Home from "./pages/Home/Home";

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

function Controls() {
    const { end, toggleMic, toggleWebcam, getWebcams, changeWebcam } = useMeeting();
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
            navigate("/treatment_session")
        })
    }
    return (
        <div className={styles.buttonContainer}>
            <Button type={"primary"} style={{background: "#004AAD"}} onClick={() => endMeeting()}>End Meeting</Button>
            <Button type={"primary"} style={{background: "#004AAD"}} onClick={() => toggleMic()}>Toggle Mic</Button>
            <Button type={"primary"} style={{background: "#004AAD"}} onClick={() => toggleWebcam()}>Toggle Cam</Button>
            <Button type={"primary"} style={{background: "#004AAD"}} onClick={() => flipCam()}>Flip Cam</Button>
        </div>
    );
}

function MeetingView(props) {
    const [joined, setJoined] = useState(null);
    //Get the method which will be used to join the meeting.
    //We will also get the participants list to display all participants
    const { join, participants } = useMeeting({
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
                    <Controls />
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

    useEffect(() => {
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
    }, [])

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
            </MeetingProvider> : <div className={styles.container}><SideMenu/><Content/></div>}
        </div>
    );
}

function Content() {
    return (
        <div>
            <Routes>
                <Route path="/" element={<Login />}></Route>
                <Route path="/home" element={<Home />}></Route>
                <Route path="/treatment_session" element={<TreatmentParameters />}></Route>
            </Routes>
        </div>
    );
}

function SideMenu() {
    const navigate = useNavigate()
    return (
        <div className={styles.sideMenu}>
            <div className={styles.buttonContainer2}>
                <Button shape={"round"} className={styles.button} icon={<HomeOutlined style={{color: "#004AAD"}}/>} onClick={() => navigate("/home")}/>
                <span style={{color: "white"}}>Home</span>
            </div>
        </div>
    )
}

export default App;