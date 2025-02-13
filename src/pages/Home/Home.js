import styles from "../../css/Home.module.css";
import {Avatar, Button, message} from "antd";
import {ArrowRightOutlined, UserOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
import axios from "axios";
import {getUsersAPIUrl} from "../../getAPIUrls/getUsersAPIUrl";
import {getTreatmentAPIUrl} from "../../getAPIUrls/getTreatmentAPIUrl";
import {useNavigate} from "react-router-dom";

function Home() {
    const [patients, setPatients] = useState([])
    const [clinician, setClinician] = useState()
    const [treatments, setTreatments] = useState([])
    const [wounds, setWounds] = useState([])
    const [vals, setVals] = useState(new Map());
    const navigate = useNavigate();

    const clinicianEmail = localStorage.getItem("email")
    const [patientMRNs, setPatientMRNs] = useState([])

    useEffect(() => {
        try {
            // Fetching all wounds under this clinician
            axios.post(`${getTreatmentAPIUrl()}/treatment/get_wounds`, {clinician_id: clinicianEmail}).then(res => {
                if (res.status === 200) {
                    const woundData = res.data
                    if(woundData) {
                        setWounds(woundData)
                        // Convering to set to find unique patient MRNs
                        const uniquePatients = [...new Set(woundData.map(wound => wound.patient_id))]
                        setPatientMRNs(uniquePatients)
                    }
                }
            })
            // Fetching clinician data
            axios.get(`${getUsersAPIUrl()}/users/get_clinician_info`, {params: {"email": clinicianEmail}} ).then(res => {
                if (res.status === 200) {
                    setClinician(res?.data?.message)
                }
            })
        } catch (error) {
            message.error("There was an error in retrieving data.")
        }
    }, []);

    useEffect(() => {
        // Getting patient data (depends on having patient MRNs)
        const fetchPatientDependentData = async () => {
            if(patientMRNs) {
                try {
                    // Creating promises to allow parallel execution
                    const patientPromises = patientMRNs.map(async (MRN) => {
                        const res = await axios.post(`${getUsersAPIUrl()}/users/get_patients`, { medical_ref_number: MRN });
                        return res.status === 200 ? res.data[0] : null;
                    });

                    // Running promises in parallel
                    const patientsArray = await Promise.all(patientPromises);

                    setPatients(patientsArray);
                } catch (error) {
                    message.error("There was an error in retrieving data.")
                }
            }
        };
        fetchPatientDependentData();
    }, [patientMRNs]); 

    useEffect(() => {
        // Getting treatment data (depends on having wound information)
        const fetchWoundDependentData = async () => {
            if(wounds) {
                try {
                    // Creating promises to allow parallel execution
                    const treatmentPromises = wounds.map(async (wound) => {
                        const res = await axios.post(`${getTreatmentAPIUrl()}/treatment/get_treatments`, { wound_id: wound.id });
                        return res.status === 200 ? res.data || [] : [];
                    });

                    // Running promises in parallel
                    const treatmentsArray = await Promise.all(treatmentPromises);
                    const treatmentsFlattenedArray = treatmentsArray.flat();

                    setTreatments(treatmentsFlattenedArray);
                } catch (error) {
                    message.error("There was an error in retrieving data.")
                }
            };
        }
        fetchWoundDependentData();
    }, [wounds]);

    useEffect(() => {
        const newVals = new Map(vals)
        treatments.forEach(treatment => {
            const woundIndex = wounds.findIndex(wd => wd?.['id'] === treatment?.["wound_id"])
            if (woundIndex !== -1) {
                const patient_id = wounds[woundIndex]?.['patient_id']
                const patientIndex = patients.findIndex(pt => pt?.['medical_ref_number'] === patient_id)
                if (patientIndex !== -1) {
                    const patientName = `${patients[patientIndex]?.['first_name']} ${patients[patientIndex]?.['last_name']}`
                    newVals.set(treatment?.["id"], patientName)
                }
            }
        })
        setVals(newVals)
    }, [wounds, treatments, patients]);

    return (<div className={styles.container}>
        {clinician !== undefined && <h1>{`Welcome, Dr. ${clinician?.['first_name']} ${clinician?.['last_name']}`}</h1>}
        <h2 style={{color: "#004AAD"}}>Patients</h2>
        <div className={styles.patientContainer}>
            {patients.length !== 0 && patients.map(patient => {
                return <div className={styles.patientAvatar}>
                    <Avatar
                        style={{background: "#DEEBF9"}}
                        size={64}
                        icon={<UserOutlined style={{color: "#004AAD"}}/>}
                    />
                    <span style={{color: "#004AAD"}}>{patient?.['first_name'] + " " + patient?.['last_name']}</span>
                </div>
            })}
        </div>
        <h2 style={{color: "#004AAD"}}>Schedule</h2>
        <div className={styles.scheduleContainer}>
            {treatments.length !== 0 && treatments.map(treatment => {
                return <div className={styles.treatmentWrapper}>
                    <Avatar style={{background: "white", color: "#004AAD"}}>{treatment?.["id"]}</Avatar>
                    <span>{`Treatment session at ${new Date(treatment?.['start_time_scheduled'])} for ${vals.get(treatment?.['id'])}`}</span>
                    <Button shape={"circle"} style={{background: "#004AAD"}} onClick={() => navigate("/treatment_session")} icon={<ArrowRightOutlined style={{color: "white"}}/>}/>
                </div>
            })}
        </div>
    </div>)
}

export default Home