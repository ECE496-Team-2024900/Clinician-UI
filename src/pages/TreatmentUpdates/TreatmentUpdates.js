import styles from '../../css/TreatmentUpdates.module.css'
import { useState, useEffect } from 'react'
import { getHardwareAPIUrl } from '../../getAPIUrls/getHardwareAPIUrl'
import axios from 'axios'
import { message } from 'antd'

function TreatmentUpdates() {
    const [treatment, setTreatment] = useState({'id': 1}) // set to random value for now
    const [treatmentProgress, setTreatmentProgress] = useState("")
    const [sensorData, setSensorData] = useState("")

    useEffect(() => {
        // function fetches current treatment progress 
        const getTreatmentProgress = async () => {
            const url = `${getHardwareAPIUrl()}/hardware/get_treatment_progress?id=${treatment?.id}`;
            
            axios.get(url)
            .then((response) => {
                //no error, set treatment progress string
                if(response.status === 200) {
                    if (response.data.message != "No data") {
                        setTreatmentProgress(`${response.data.message}% complete`)
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
            const url = `${getHardwareAPIUrl()}/hardware/get_sensor_data_updates?id=${treatment?.id}`;

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

    }, [treatment.id]);

    // Function to format \n characters so they actually show up in separate lines
    const formatNewLinesInText = (text) => {
        return text.split('\n').map((str, index) => (
          <span key={index}>
            {str}
            <br />
          </span>
        ));
      };

    return <div className={styles["outer-container"]}>
                <div className={styles.container}>
                    <div className={styles["treatment-box"]}>
                        <h2>Treatment Progress</h2>
                        <p>{treatmentProgress}</p>
                    </div>

                    <div className={styles["sensor-box"]}>
                        <h2>Sensor Data</h2>
                        <p>{formatNewLinesInText(sensorData)}</p>
                    </div>
                </div>
            </div>
}

export default TreatmentUpdates;