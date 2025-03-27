import styles from '../../css/TreatmentSessionDetails.module.css'
import {Form, Input, Row, Col, message, Image, Button, Spin, Modal} from 'antd'
import React, {useState, useEffect, useRef, useMemo} from 'react'
import { getHardwareAPIUrl } from '../../getAPIUrls/getHardwareAPIUrl'
import { getTreatmentAPIUrl } from '../../getAPIUrls/getTreatmentAPIUrl'
import axios from 'axios'
import {useLocation, useNavigate} from "react-router-dom";
import ReportGeneration from '../../utilities/ReportGeneration/ReportGeneration'
import {createCameraVideoTrack, MeetingProvider, useMeeting, useParticipant} from "@videosdk.live/react-sdk";
import ReactPlayer from "react-player";
import {authToken} from "../../API";

function TreatmentSessionDetails() {

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
            <span style={{height: "48vw", width: "48vw", background: "black"}}>
                    <audio ref={micRef} autoPlay playsInline muted={isLocal}/>
                    {webcamOn && (
                        <ReactPlayer
                            //
                            playsinline // extremely crucial prop
                            pip={false}
                            light={false}
                            controls={false}
                            muted={true}
                            playing={true}
                            height={"48vw"}
                            width={"48vw"}
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
        const {end, toggleMic, toggleWebcam, getWebcams, changeWebcam, localParticipant} = useMeeting();
        const {webcamStream, webcamOn, captureImage} = useParticipant(
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
            end()
            if (props.completed === true) {
                navigate("/post_treatment_session")
            } else {
                navigate("/treatment_session", { state: {preTreatment: true} })
            }
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
                axios.put(`${getTreatmentAPIUrl()}/treatment/remove_video_call_id?id=${treatmentId}`).then( )
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
                        <Controls participantId={[...participants.keys()].filter(id => id !== localParticipant.id)?.[0]} completed={props.completed} />
                        <div style={{display: "flex", flexDirection: "row", gap: "20px"}}>
                        {[...participants.keys()].map((participantId) => (
                            <ParticipantView
                                participantId={participantId}
                                key={participantId}
                            />
                        ))}
                        </div>
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

    const location = useLocation(); 

    // All the fields related to treatment session that will be displayed
    const [fields, setFields] = useState({
        completed: false,
        dateTimeScheduled: null,
        drugVolumeRequired: null,
        solventVolumeRequired: null,
        laserPowerRequired: null,
        delayBetweenDrugAndLight: null,
        delayBetweenLightAndSolvent: null,
        drugVolumeAdministered: null,
        solventVolumeAdministered: null,
        laser1PowerDelivered: null,
        laser2PowerDelivered: null,
        laser3PowerDelivered: null,
        laser4PowerDelivered: null,
        drugAdministrationDuration: null,
        lightAdministrationDuration: null,
        solventAdministrationDuration: null,
        startTime: null,
        endTime: null,
        sessionNumber: null,
        painScore: null,
        imageUrls: null,
        notes: null,
        issues: null
    });

    // Form component
    const [form] = Form.useForm();

    // Retrieving report data if the treatment is complete
    const [fileData, setFileData] = useState(null);

    const treatmentId = location.pathname.split("/")[2]

    // Treatment progress and sensor data strings
    const [treatmentProgress, setTreatmentProgress] = useState("")
    const [sensorData, setSensorData] = useState("")

    const [meetingId, setMeetingId] = useState(null);

    useEffect(() => {
        if(meetingId) {
            return;
        }

        const interval = setInterval(async () => {
            let apiRes = null
            try {
                //apiRes = await axios.get(`${getTreatmentAPIUrl()}/treatment/get_video_call_id?id=${treatmentId}`)
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

    // Retrieving details of the treatment session with the id specified in the webpage url at the top
    useEffect(() => {
            const url = `${getTreatmentAPIUrl()}/treatment/parameters/get?id=${treatmentId}`;
            axios.get(url)
            .then((response) => {
                if(response.status === 200) { // Successfully retrieved data
                    // Set each of the fields we need to display in the form using the data retrieved
                    setFields({
                        completed: response.data.completed,
                        dateTimeScheduled: formatDate(response.data.start_time_scheduled),
                        drugVolumeRequired: response.data.drug_volume_required,
                        solventVolumeRequired: response.data.wash_volume_required,
                        laserPowerRequired: response.data.laser_power_required,
                        delayBetweenDrugAndLight: response.data.first_wait,
                        delayBetweenLightAndSolvent: response.data.second_wait,
                        drugVolumeAdministered: response.data.drug_volume_administered,
                        solventVolumeAdministered: response.data.wash_volume_administered,
                        laser1PowerDelivered: response.data.power_delivered_by_laser_1,
                        laser2PowerDelivered: response.data.power_delivered_by_laser_2,
                        laser3PowerDelivered: response.data.power_delivered_by_laser_3,
                        laser4PowerDelivered: response.data.power_delivered_by_laser_4,
                        drugAdministrationDuration: response.data.estimated_duration_for_drug_administration,
                        lightAdministrationDuration: response.data.estimated_duration_for_light_administration,
                        solventAdministrationDuration: response.data.estimated_duration_for_wash_administration,
                        startTime: formatDate(response.data.start_time),
                        endTime: formatDate(response.data.end_time),
                        sessionNumber: response.data.session_number,
                        painScore: response.data.pain_score,
                        imageUrls: (response.data.image_urls) ? response.data.image_urls : null,
                        notes: response.data.notes,
                        issues: response.data.issues
                    });
                    // Retrieving report object if this treatment was marked as complete
                    if(response.data.completed) {
                        axios.get(`${getTreatmentAPIUrl()}/treatment/get_report?id=${treatmentId}`)
                        .then((reportResponse) => {
                            if(reportResponse.status == 200) {
                                setFileData(reportResponse.data.report_data)
                            }
                        })
                    }
                } else if(response.status === 204) { // The specified treatment session record wasn't found
                    message.error("No treatment session found for the given id.")
                }
            })
            .catch(() => { // Error occurred in the api call
                message.error("There was an error in retrieving treatment session details.");
            });
      }, [location.pathname.split("/")[2]])

    // Set the values of the form's fields
    useEffect(() => {
        form.setFieldsValue(fields);
    }, [fields]);

    // Helper function to format date from 'YYYY-mm-dd hh:mm:ss' to 'weekday, month date, year at hour:minutes:seconds AM/PM' (e.g. "Tuesday, November 26, 2024 at 10:13:56 AM")
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true //for displaying am/pm instead of 24-hour time
        };
        return date.toLocaleDateString('en-US', options);
    };

    // Retrieve and set treatment progress and sensor data from device (poll every 5 seconds)
    useEffect(() => {
        // function fetches current treatment progress 
        const getTreatmentProgress = async () => {
            const url = `${getHardwareAPIUrl()}/hardware/get_treatment_progress?id=${treatmentId}`;

            axios.get(url)
            .then((response) => {
                //no error, set treatment progress string
                if(response.status === 200) {
                    if (response.data.message != "No data") {
                        setTreatmentProgress(`${response.data.message} complete`)
                    } else {
                        setTreatmentProgress(response.data.message)
                    }
                } else { //error
                    setTreatmentProgress(`Unable to retrieve treatment progress: ${response.data.message}`)
                }
            })
            .catch(() => {
                message.error("There was an error in retrieving treatment progress.");
            });
        };

        // function fetches current sensor data
        const getSensorData = async () => {
            const url = `${getHardwareAPIUrl()}/hardware/get_sensor_data_updates?id=${treatmentId}`;

            axios.get(url)
            .then((response) => {
                //no error, set sensor data string
                if(response.status === 200) {
                    console.log("Backend Response:", response.data.message);
                    setSensorData(response.data.message)
                } else { //error
                    setSensorData(`Unable to retrieve sensor data: ${response.data.message}`)
                }
            })
            .catch(() => {
                message.error("There was an error in retrieving sensor data.");
            });
        };

        // Poll every 5 seconds
        const interval = setInterval(() => {
            getTreatmentProgress();
            getSensorData();
        }, 5000);

        // Run the functions once immediately
        getTreatmentProgress();
        getSensorData();

        return () => clearInterval(interval); // Cleanup interval

    }, [treatmentId]);

    // Function to format \n characters so they actually show up in separate lines when displayed
    const formatNewLinesInText = (text) => {
        return text.split('\n').map((str, index) => (
          <span key={index}>
            {str}
            <br />
          </span>
        ));
    };

    // Function to extract phase name and progress percentage from treatment progress string
    // Input: string of the format phase name-percentage% (eg. "Photosensitizer-20%")
    const parseTreatmentProgress = (progressString) => {
        if (!progressString || typeof progressString !== "string") {
            return { phase: "No data", percentage: "No data" };
        }
    
        const parts = progressString.split("-");
        if (parts.length !== 2) {
            return { phase: "No data", percentage: "No data" };
        }
    
        return { phase: parts[0].trim(), percentage: parts[1].trim() };
    };

    return (
        <div className={styles.container}>
            {authToken && meetingId ? <MeetingProvider
                config={{
                    meetingId,
                    micEnabled: true,
                    webcamEnabled: true,
                    name: "clinician",
                }}
                token={authToken}
            >
                <MeetingView meetingId={meetingId} onMeetingLeave={onMeetingLeave} completed={fields.completed} />
            </MeetingProvider> :
            <div>
            {/*Page title indicates session number (eg. session 1 is first session for that wound) and its scheduled date and time*/}
            <h1>{"Treatment Session #"}{fields.sessionNumber}{": "}{fields.dateTimeScheduled}</h1>
            {/*Page subtitle indicates whether the treatment session is completed or not*/}
            <Row className={styles.topRow}>
                <h3 className={styles.pageSubtitle}>
                    {"Session status: "}{fields.completed ? "Complete" : "Incomplete"}
                </h3>
                {fileData && (
                    <div className={styles.rightAlign}>
                        <ReportGeneration fileData={fileData}/>
                    </div>
                )}
            </Row>
            <Form form={form}>
            {/*Fields to display when it is an upcoming treatment session*/}
            {!fields.completed && (
                <div>
                    {/*Dosage information (for drug, solvent, laser power)*/}
                    <h3 className={styles.formSubtitle}>{"Dosages (Values can be modified at the time of session)"}</h3>
                    <Row>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="drugVolumeRequired" label="Drug Volume (mL)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="solventVolumeRequired" label="Solvent Volume (mL)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="laserPowerRequired" label="Laser Power Level (W)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                    </Row>
                    {/*Wait time information (between drug and light and between light and solvent)*/}
                    <h3 className={styles.formSubtitle}>{"Wait Times (Values can be modified at the time of session)"}</h3>
                    <Row>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="delayBetweenDrugAndLight" label="Delay between Drug Administration and Light Irradiation (seconds)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="delayBetweenLightAndSolvent" label="Delay between Light Irradiation and Solvent Administration (seconds)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                    </Row>
                </div>
            )}
            {/*Fields to display when it is a complete treatment session*/}
            {fields.completed && (
                <div>
                    {/*Time/duration information (start/end times, wait times, durations for drug, light and solvent administrations)*/}
                    <h3 className={styles.formSubtitle}>Times and Durations</h3>
                    <Row>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="startTime" label="Session Start Time">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="endTime" label="Session End Time">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="delayBetweenDrugAndLight" label="Delay between Drug Administration and Light Irradiation (seconds)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="delayBetweenLightAndSolvent" label="Delay between Light Irradiation and Solvent Administration (seconds)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="drugAdministrationDuration" label="Duration of Drug Administration (seconds)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="lightAdministrationDuration" label="Duration of Light Administration (seconds)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="solventAdministrationDuration" label="Duration of Solvent Administration (seconds)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                    </Row>
                    {/*Dosage information (for drug, solvent, laser power)*/}
                    <h3 className={styles.formSubtitle}>Dosages</h3>
                    <Row>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="drugVolumeAdministered" label="Drug Volume Administered (mL)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="solventVolumeAdministered" label="Solvent Volume Administered (mL)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="laser1PowerDelivered" label="Power Delivered by Laser 1 (W)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="laser2PowerDelivered" label="Power Delivered by Laser 2 (W)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="laser3PowerDelivered" label="Power Delivered by Laser 3 (W)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="laser4PowerDelivered" label="Power Delivered by Laser 4 (W)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                    </Row>
                    {/*Other information like clinician notes, technical issues, and patient pain score*/}
                    <h3 className={styles.formSubtitle}>Other Details</h3>
                    <Row>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="notes" label="Clinician Notes">
                                <Input.TextArea readOnly rows={4} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="issues" label="Technical Issues">
                                <Input.TextArea readOnly rows={4} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="painScore" label="Patient Pain Score on Scale of 1-10 (1 being none, 10 being extreme)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                    </Row>
                    {/*Display all wound images*/}
                    <h3 className={styles.formSubtitle}>Wound Images</h3>
                    <div className={styles.imageContainer}>
                        {fields.imageUrls?.map((item, index) => {
                            return <Image
                                key={index}
                                className={styles.image}
                                src={item}
                                preview={false}
                                alt={`Wound image ${index + 1}`}
                            />
                        })}
                    </div>
                </div>
            )}
            </Form>
            <div className={styles.progressAndSensorContainer}>
                <div className={styles["treatment-box"]}>
                    <h2>Current Treatment Phase</h2>
                    <p>{parseTreatmentProgress(treatmentProgress).phase}</p>
                    <h2>Phase Progress</h2>
                    <p>{parseTreatmentProgress(treatmentProgress).percentage}</p>
                </div>
                <div className={styles["sensor-box"]}>
                    <h2>Sensor Data</h2>
                    <p>{formatNewLinesInText(sensorData)}</p>
                </div>
            </div>
        </div>}
        </div>
    )
}

export default TreatmentSessionDetails