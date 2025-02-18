import styles from '../../css/PatientDetails.module.css';
import { Button, List } from 'antd';
import { useState, useEffect } from 'react';
import { getTreatmentAPIUrl } from '../../getAPIUrls/getTreatmentAPIUrl';
import axios from 'axios';
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function PatientDetails() {

    const navigate = useNavigate();

    const location = useLocation(); 
    const [wounds, setWounds] = useState(""); //List of wounds for the patient

    //Get the list of wounds given the patient MRN specified in the url
    useEffect(() => {
        axios.post(`${getTreatmentAPIUrl()}/treatment/get_wounds`, {patient_id: location.pathname.split("/")[2]}).then(res => {
            try {
                if (res.status === 200) {
                    setWounds(res.data);
                } else {
                    setWounds("");
                }
            } catch (error) {
                console.error("Error fetching wounds: ", error);
            }
        });
    }, [location.pathname.split("/")[2]]);

    return <div className={styles.container}>
        <h2 className={styles.pageTitle}>Existing Patient Demographic</h2>
        <div className={styles.subtitleAndButtonContainer}>
            <h3 className={styles.pageSubtitle}>Wounds</h3>
            {/*Button for creating a new wound for patient*/}
            <Button
                className={styles.createButton}
                type="primary"
                size="large"
                onClick={() => navigate(`/create_wound?patient_id=${location.pathname.split("/")[2]}`)}
            >
                Create New Wound
            </Button>
        </div>
        {/*List of all the patient's wounds (past and ongoing)*/}
        <List
            className={styles.list}
            header={
                <div className={styles.listHeader}>
                    <span>Location</span> {/*Location of wound column*/}
                    <span className={styles.treatedColumn}>Treated</span> {/*Treated column (yes/no)*/}
                </div>
            }
            bordered
            //Set the max number of wounds to show at once in the list
            pagination={{ 
                pageSize: 4,
                align: 'center'
            }}
            dataSource={wounds}
            renderItem={(item) => ( 
                //Wounds in the list are sorted such that all treated wounds are at the end of the list and ongoing wounds are at the beginning
                //Colour-coded with treated wounds being grey and ongoing being blue
                <List.Item className={`${styles.listItem} ${item.treated ? styles.treated : styles.notTreated}`}>
                    <span>{item.infection_location}</span>
                    <span className={styles.treatedStatus}>
                        {item.treated ? "Yes" : "No"}
                    </span>
                </List.Item>
            )}
        />
    </div>
}

export default PatientDetails;