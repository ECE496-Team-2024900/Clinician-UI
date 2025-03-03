import { useState, useEffect } from 'react'
import { getTreatmentAPIUrl } from '../../getAPIUrls/getTreatmentAPIUrl'
import axios from 'axios'
import {Button, DatePicker, Form, Input, message, Modal, Popover, TimePicker} from 'antd';
import styles from "../../css/WoundDetails.module.css";
import {
    CloseOutlined,
    EditOutlined,
    FlagFilled,
    PlusOutlined
} from "@ant-design/icons";
import {getUsersAPIUrl} from "../../getAPIUrls/getUsersAPIUrl";

function WoundDetails() {
    const [pastTreatments, setPastTreatments] = useState([]); // keeping track of past treatments for this wound and patient
    const [overlay, setOverlay] = useState("")
    const [date, setDate] = useState(null)
    const [latestTreatment, setLatestTreatment] = useState(undefined)

    // Temporary variables - replace once logic implemented for it
    const woundId = 1
    const patientId = 1

    useEffect(() => {
        // fetching past treatments
        const fetchPastTreatments = async () => {
            setLatestTreatment("")
            const url = `${getTreatmentAPIUrl()}/treatment/get_treatments?patient_id=${patientId}&wound_id=${woundId}`;
            axios.get(url)
            .then((response) => {
                // if there are no errors and past treatmentts are available, storing them in use state
                if(response.status === 200) {
                    setPastTreatments(response.data);
                    for (let elem in response.data) {
                        const dateTime = new Date(elem.start_time_scheduled)
                        if (latestTreatment === undefined || dateTime > latestTreatment) {
                            setLatestTreatment(dateTime)
                        }
                    }
                }
            })
            .catch(() => {
                message.error("There was an error in retrieving past treatments.");
            });
        }
        fetchPastTreatments()
    }, [pastTreatments])

    // helper function to format date from 'YYYY-mm-dd' to 'weekday, month date, year' (e.g. Tuesday, November 26, 2024)
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return date.toLocaleDateString('en-US', options);
    };

    const deleteSession = (treatment) => {
        const url = `${getTreatmentAPIUrl()}/treatment/cancel_treatment?id=${treatment.session_number}`;
        axios.delete(url).then(() => {
            setPastTreatments([])
            const emailUrl = `${getUsersAPIUrl()}/users/send_email`
            const phoneUrl = `${getUsersAPIUrl()}/users/send_message`
            const payload = {
                "id": patientId,
                "type": "patient",
                "message": `Your treatment session on \`${treatment.date_scheduled}\` is cancelled.`
            }
            axios.post(emailUrl, payload).then()
            axios.post(phoneUrl, payload).then()
        }).catch(() => {
            message.error("There was an error in cancelling the treatment.");
        });
    }

    const onFinish = (values) => {
        console.log(values)
        if (overlay === "create") {
           const payload = {
               "wound_id": woundId,
               "session_number": pastTreatments.length,
               "date_scheduled": new Date(values.date_scheduled).toISOString().substring(0, 10),
               "start_time_scheduled": new Date(values.start_time_scheduled).toISOString(),
               "started": false,
               "paused": false,
               "completed": false,
           }
           const url = `${getTreatmentAPIUrl()}/treatment/add_treatment`;
           axios.post(url, payload).then(() => {
               setPastTreatments([])
               const emailUrl = `${getUsersAPIUrl()}/users/send_email`
               const phoneUrl = `${getUsersAPIUrl()}/users/send_message`
               const payload = {
                   "id": patientId,
                   "type": "patient",
                   "message": `Your treatment session is scheduled on \`${treatment.date_scheduled}\`.`
               }
               axios.post(emailUrl, payload).then()
               axios.post(phoneUrl, payload).then()
           }).catch(() => {
               message.error("There was an error in creating the treatment.");
           })
        } else {
            const payload = {
                "date_scheduled": new Date (values.date_scheduled).toISOString().substring(0,10),
                "start_time_scheduled": new Date(values.start_time_scheduled).toISOString()
            }
            const index = overlay.replace("edit-","")
            const treatment = pastTreatments[index]
            const url = `${getTreatmentAPIUrl()}/treatment/parameters/set?id=${treatment.session_number}`;
            axios.put(url, payload).then(() => {
                if (treatment.reschedule_requested === true) {
                    const payload = {
                        "id": treatment.session_number,
                        "reschedule_requested": false
                    }
                    const url = `${getTreatmentAPIUrl()}/treatment/request_reschedule}`;
                    axios.put(url, payload).then(() => {
                        const emailUrl = `${getUsersAPIUrl()}/users/send_email`
                        const phoneUrl = `${getUsersAPIUrl()}/users/send_message`
                        const payload = {
                            "id": patientId,
                            "type": "patient",
                            "message": `Your treatment session is rescheduled to \`${treatment.date_scheduled}\`.`
                        }
                        axios.post(emailUrl, payload).then()
                        axios.post(phoneUrl, payload).then()
                    }).catch(() => {
                        message.error("There was an error in removing the reschedule request.");
                    })
                }
                setPastTreatments([])
            }).catch(() => {
                message.error("There was an error in creating the treatment.");
            })
        }
        setOverlay("")
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h3>Treatment Sessions</h3>
                <Button disabled={overlay !== ""} style={{background: "#004AAD"}} icon={<PlusOutlined style={{color: "white"}}/>} onClick={() => setOverlay("create")}/>
                <Popover
                    open={overlay !== ""}
                    content={<div>
                        <div className={styles.header}>
                            <h3 style={{color:"#004aad"}}>{`${overlay === "create" ? "Schedule" : "Reschedule"} Treatment Session`}</h3>
                            <Button icon={<CloseOutlined style={{color: "#004AAD"}}/>} style={{borderColor: "white"}} onClick={() => setOverlay("")}/>
                        </div>
                        <Form onFinish={onFinish}>
                            <Form.Item name="date_scheduled"><DatePicker value={new Date(date)} onChange={date => setDate(date)} style={{width: "250px"}}/></Form.Item>
                            <Form.Item name="start_time_scheduled"><TimePicker value={new Date(date).getTime()} onChange={time => {
                                if (new Date(date).setHours(time.hours, time.minutes, time.seconds) - new Date(latestTreatment).getHours() >= 24) {
                                    setDate(new Date(date).setHours(time.hours, time.minutes, time.seconds))
                                } else {
                                    message.error("treatment must be scheduled at least 24 hours after last treatment")
                                }
                            }} style={{width: "250px"}}/></Form.Item>
                            <Form.Item><Button type="primary" style={{background: "#004aad"}} htmlType={"submit"}>Submit</Button></Form.Item>
                        </Form>
                    </div>}/>
            </div>
          <table className={styles.treatmentTable}>
            <thead>
              <tr>
                <th></th>
                <th>#</th>
                <th>Date</th>
                <th>Time</th>
                <th>Reschedule?</th>
                <th>Cancel?</th>
              </tr>
            </thead>
            <tbody>
              {pastTreatments.map((treatment, index) => (
                  <tr key={treatment.session_number}>
                      <td>{treatment.reschedule_requested ? <FlagFilled/> : <></>}</td>
                      <td>{treatment.session_number}</td>
                      <td>{formatDate(treatment.date_scheduled)}</td>
                      <td>{treatment.start_time}</td>
                      <td><Button disabled={overlay !== ""} style={{background: "#004AAD"}} icon={<EditOutlined style={{color: "white"}}/>}
                                  onClick={e => setOverlay(`edit-${index}`)}/></td>
                      <td><Button style={{background: "red"}} icon={<CloseOutlined style={{color: "white"}}/>}
                                  onClick={e => deleteSession(treatment)}/></td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
    );
}

export default WoundDetails;
