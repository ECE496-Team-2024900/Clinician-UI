import { useState, useEffect } from 'react'
import { getTreatmentAPIUrl } from '../../getAPIUrls/getTreatmentAPIUrl'
import axios from 'axios'
import { message } from 'antd';
import styles from "../../css/WoundDetails.module.css";

function WoundDetails() {
    const [pastTreatments, setPastTreatments] = useState([]);

    // Temporary variables - replace once logic implemented for it
    const woundId = 1
    const patientId = 1

    useEffect(() => {
        const fetchPastTreatments = async () => {
            const url = `${getTreatmentAPIUrl()}/treatment/get_past_patient_treatments?patient_id=${patientId}&wound_id=${woundId}`;
            axios.get(url)
            .then((response) => {
                if(response.status === 200) {
                    setPastTreatments(response.data);
                }
            })
            .catch(() => {
                message.error("There was an error in retrieving past treatments.");
            });
        }
        fetchPastTreatments()
    }, [])

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

    return (
        <div className={styles.page}>
          <h3>Treatment Sessions</h3>
          <table className={styles.treatmentTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {pastTreatments.map((treatment) => (
                <tr key={treatment.session_number}>
                  <td>{treatment.session_number}</td>
                  <td>{formatDate(treatment.date_scheduled)}</td>
                  <td>{treatment.start_time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
}

export default WoundDetails;