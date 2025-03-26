import { useState, useEffect } from 'react'
import { getTreatmentAPIUrl } from '../../getAPIUrls/getTreatmentAPIUrl'
import axios from 'axios'
import {Button, DatePicker, Form, Input, message, Popover, TimePicker, Image, Checkbox} from 'antd';
import styles from "../../css/WoundDetails.module.css";
import {
    CloseOutlined,
    EditOutlined,
    FlagFilled,
    PlusOutlined
} from "@ant-design/icons";
import {getUsersAPIUrl} from "../../getAPIUrls/getUsersAPIUrl";
import {ArrowLeftOutlined, ArrowRightOutlined} from "@ant-design/icons";

function WoundDetails() {
    const [treatments, setTreatments] = useState([]); // keeping track of past treatments for this wound and patient
    const [overlay, setOverlay] = useState("")
    const [date, setDate] = useState(null)
    const [latestTreatment, setLatestTreatment] = useState(undefined)
    const [wound, setWound] = useState(undefined)
    const [imageIndex, setImageIndex] = useState(0)
    const [vals, setVals] = useState(new Map());
    const [updated, setUpdated] = useState(Date.now());

        // Temporary variables - replace once logic implemented for it
    const woundId = 1
    const patientId = 1

    const url = `${getTreatmentAPIUrl()}/treatment/get_all_images_for_wound?wound=${woundId}`;
    const woundUrl = `${getTreatmentAPIUrl()}/treatment/get_wound?id=${woundId}`;
    const updateWoundStatusUrl = `${getTreatmentAPIUrl()}/treatment/update_wound_status`;
    
    useEffect( () => {
         axios.get(url).then((response) => {
             if (response.status === 200) {
                 const newVals = new Map(vals)
                 response.data.message.forEach(val => {
                    val.image_urls.forEach(url => {
                        newVals.set(url, val.id)
                    })
                })
                 setVals(newVals)
            }
        })
        axios.get(woundUrl).then((response)=> {
            if (response.status === 200) {
                setWound(response.data.message)
            }
        })
    }, [woundId]);

    const handleTreatedChange = (e) => {
        const newTreatedStatus = e.target.checked;
        setWound({ ...wound, treated: newTreatedStatus });  // Update UI state immediately

        axios.post(updateWoundStatusUrl, {
            wound_id: woundId,
            treated: newTreatedStatus
        })
            .catch(error => {
                message.error("There was an error in setting wound status.")
            });
    };

    useEffect(() => {
        // fetching past treatments
        const fetchTreatments = async () => {
            setLatestTreatment("")
            const url = `${getTreatmentAPIUrl()}/treatment/get_treatments?patient_id=${patientId}&wound_id=${woundId}`;
            axios.get(url)
            .then((response) => {
                // if there are no errors and past treatmentts are available, storing them in use state
                if(response.status === 200) {
                    setTreatments(response.data);
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
        fetchTreatments()
    }, [patientId, woundId, updated])

    // helper function to format date from 'YYYY-mm-dd' to 'weekday, month date, year' (e.g. Tuesday, November 26, 2024)
    const formatDate = (dateString) => {
        const date = new Date(dateString + "T00:00:00");
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formattedTime = (timeString) => {
        return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const deleteSession = (treatment) => {
        const url = `${getTreatmentAPIUrl()}/treatment/cancel_treatment?id=${treatment.id}`;
        axios.delete(url).then(() => {
            setTreatments([])
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
        if (overlay === "create") {
           const payload = {
               "wound_id": woundId,
               "session_number": treatments.length,
               "date_scheduled": new Date(values.date_scheduled).toISOString().substring(0, 10),
               "start_time_scheduled": values.start_time_scheduled.format("HH:mm"),
               "started": false,
               "paused": false,
               "completed": false,
           }
           const url = `${getTreatmentAPIUrl()}/treatment/add_treatment`;
           axios.post(url, payload).then(() => {
               setTreatments([])
               const emailUrl = `${getUsersAPIUrl()}/users/send_email`
               const phoneUrl = `${getUsersAPIUrl()}/users/send_message`
               const payload = {
                   "id": patientId,
                   "type": "patient",
                   "message": `Your treatment session is scheduled on \`${values.date_scheduled}\`.`
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
            console.log(index)
            const treatment = treatments[index]
            console.log(treatment)
            const url = `${getTreatmentAPIUrl()}/treatment/parameters/set?id=${treatment.id}`;
            axios.put(url, payload).then(() => {
                if (treatment.reschedule_requested === true) {
                    const payload = {
                        "reschedule_requested": false
                    }
                    const url = `${getTreatmentAPIUrl()}/treatment/request_reschedule?id=${treatment.id}`;
                    axios.put(url, payload).then(() => {
                    }).catch(() => {
                        message.error("There was an error in removing the reschedule request.");
                    })
                }
                const emailUrl = `${getUsersAPIUrl()}/users/send_email`
                const phoneUrl = `${getUsersAPIUrl()}/users/send_message`
                const payload = {
                    "id": patientId,
                    "type": "patient",
                    "message": `Your treatment session is rescheduled to \`${treatment.date_scheduled}\`.`
                }
                axios.post(emailUrl, payload).then()
                axios.post(phoneUrl, payload).then()
                setUpdated(Date.now())
            }).catch(() => {
                message.error("There was an error in creating the treatment.");
            })
        }
        setOverlay("")
    }

    return (
        <div className={styles.container}>
            <h1>Wound</h1>
            <div className={styles.container2}>
                <div className={styles.fieldsContainer}>
                    <div className={styles.fieldContainer}>
                        <h3>Wound ID</h3>
                        {wound !== undefined && <Input readOnly defaultValue={wound?.id}/>}
                        <h3>Date Added</h3>
                        {wound !== undefined && <Input readOnly defaultValue={wound?.date_added}/>}
                        <h3>Device ID</h3>
                        {wound !== undefined && <Input readOnly defaultValue={wound?.device_id}/>}
                    </div>
                    <div className={styles.fieldContainer}>
                        <h3>Infection Type</h3>
                        {wound !== undefined && <Input readOnly defaultValue={wound?.infection_type}/>}
                        <h3>Infection Location</h3>
                        {wound !== undefined && <Input readOnly defaultValue={wound?.infection_location}/>}
                        <h3>Wound Completely Treated</h3>
                        {wound !== undefined && (
                            <Checkbox
                                checked={wound?.treated}
                                onChange={handleTreatedChange}
                            >
                                {wound.treated ? "Yes" : "No"}
                            </Checkbox>
                        )}

                    </div>
                </div>
                <div className={styles.container3}>
                    <h3>Wound History</h3>
                    <div className={styles.arrowContainer}>
                        <Button
                            shape={"circle"}
                            disabled={imageIndex === 0}
                            onClick={() => setImageIndex(imageIndex-1)}
                            style={{background: "#004AAD"}}
                            icon={<ArrowLeftOutlined style={{color: "white"}}/>}
                        />
                        <Button
                            shape={"circle"}
                            disabled={imageIndex === vals.size-1}
                            onClick={() => setImageIndex(imageIndex+1)}
                            style={{background: "#004AAD"}}
                            icon={<ArrowRightOutlined style={{color: "white"}}/>}
                        />
                    </div>
                    <div className={styles.imageContainer}>
                        <Image src={Array.from(vals.keys())[imageIndex]} width={"25vh"} height={"25vh"}/>
                        <div className={styles.labelContainer}>
                            <p>{`Image taken during treatment ${vals.get(Array.from(vals.keys())[imageIndex])}`}</p>
                        </div>
                    </div>
                </div>
            </div>
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
                                setDate(new Date(date).setHours(time.hours, time.minutes, time.seconds))
                            }} style={{width: "250px"}}/></Form.Item>
                            <Form.Item><Button type="primary" style={{background: "#004aad"}} htmlType={"submit"}>Submit</Button></Form.Item>
                        </Form>
                    </div>}/>
            </div>
          <table className={styles.treatmentTable}>
            <thead>
              <tr>
                <th>Request</th>
                <th>#</th>
                <th>Date</th>
                <th>Time</th>
                <th>Reschedule?</th>
                <th>Cancel?</th>
              </tr>
            </thead>
            <tbody>
              {treatments.map((treatment, index) => (
                  <tr key={treatment.session_number}>
                      <td>{treatment.reschedule_requested ? <FlagFilled/> : <></>}</td>
                      <td>{treatment.session_number}</td>
                      <td>{formatDate(treatment.date_scheduled)}</td>
                      <td>{formattedTime(treatment.start_time_scheduled)}</td>
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
