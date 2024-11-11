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
import {getAPIUrl} from "./getApiUrl";
import styles from "./App.module.css"
import {Modal, Spin} from "antd";

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
                    //
                    url={videoStream}
                    wrapper={"span"}
                    style={{display: "flex"}}
                    //
                    width={"50vw"}
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
    return (
        <div>
            <button onClick={() => end()}>End Meeting</button>
            <button onClick={() => toggleMic()}>Toggle Mic</button>
            <button onClick={() => toggleWebcam()}>Toggle Cam</button>
            <button onClick={() => flipCam()}>Flip Cam</button>
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
        const interval = setInterval(() => {
            axios.get(`${getAPIUrl()}/treatment/get_video_call_id`).then(res => {
                if (res.data !== "") {
                    setMeetingId(res.data)
                }
            })
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
            </MeetingProvider> : <div></div>}
        </div>
    );
}

export default App;