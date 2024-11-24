import "./App.css";
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
import {UserOutlined} from "@ant-design/icons";

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
    const [patients, setPatients] = useState([])
    const [clinician, setClinician] = useState()

    useEffect(() => {
        axios.get(`${getUsersAPIUrl()}/users/find_all_patients`).then(res => {
            if (res.status === 200) {
                setPatients(res?.data?.message)
            }
        })
        axios.get(`${getUsersAPIUrl()}/users/get_clinician_info`, {params: {"email": "walt.disney@disney.org"}} ).then(res => {
            if (res.status === 200) {
                setClinician(res?.data?.message)
            }
        })
    }, []);

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
            <h1>{`Welcome, Dr. ${clinician?.['first_name']} ${clinician?.['last_name']}`}</h1>
            <h2 style={{color: "#004AAD"}}>Patients</h2>
            <div className={styles.patientContainer}>
            {patients.length !== 0 && patients.map(patient => {
                return <div className={styles.patientAvatar}><Avatar style={{background: "#DEEBF9"}} size={64} icon={<UserOutlined style={{color: "#004AAD"}}/>}/><span style={{color: "#004AAD"}}>{patient?.['first_name'] + " " + patient?.['last_name']}</span></div>
            })}
            </div>
            <h2 style={{color: "#004AAD"}}>Schedule</h2>
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
            </MeetingProvider> : <div></div>}
        </div>
    );
}

export default App;