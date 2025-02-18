import { useState, useEffect } from 'react'
import { getTreatmentAPIUrl } from '../../getAPIUrls/getTreatmentAPIUrl'
import axios from 'axios'
import {Button, message, Modal} from 'antd';
import styles from "../../css/WoundDetails.module.css";
import {CloseOutlined, FlagFilled, PlusCircleFilled, PlusCircleOutlined, PlusOutlined} from "@ant-design/icons";

function WoundDetails() {
    const [pastTreatments, setPastTreatments] = useState([]); // keeping track of past treatments for this wound and patient
    const [overlay, setOverlay] = useState(false)

    // Temporary variables - replace once logic implemented for it
    const woundId = 1
    const patientId = 1

    useEffect(() => {
        // fetching past treatments
        const fetchPastTreatments = async () => {
            const url = `${getTreatmentAPIUrl()}/treatment/get_treatments?patient_id=${patientId}&wound_id=${woundId}`;
            axios.get(url)
            .then((response) => {
                // if there are no errors and past treatmentts are available, storing them in use state
                if(response.status === 200) {
                    setPastTreatments(response.data);
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

    const deleteSession = (id) => {
        const url = `${getTreatmentAPIUrl()}/treatment/cancel_treatment?id=${id}`;
        axios.delete(url).then(() => {
            setPastTreatments([])
        }).catch(() => {
            message.error("There was an error in cancelling the treatment.");
        });
        //todo: send message to patient once messaging flow complete
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h3>Treatment Sessions</h3>
                <Button style={{background: "#004AAD"}} icon={<PlusOutlined style={{color: "white"}}/>} onClick={() => setOverlay(true)}/>
            </div>
          <table className={styles.treatmentTable}>
            <thead>
              <tr>
                <th></th>
                <th>#</th>
                <th>Date</th>
                <th>Time</th>
                <th>Cancel?</th>
              </tr>
            </thead>
            <tbody>
              {pastTreatments.map((treatment) => (
                <tr key={treatment.session_number}>
                  <td>{treatment.reschedule_requested ? <FlagFilled/> : <></>}</td>
                  <td>{treatment.session_number}</td>
                  <td>{formatDate(treatment.date_scheduled)}</td>
                  <td>{treatment.start_time}</td>
                  <td><Button style={{background: "red"}} icon={<CloseOutlined style={{color: "white"}}/>} onClick={e => deleteSession(treatment.session_number)}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
}

export default WoundDetails;
