import styles from "../../css/Home.module.css";
import {Avatar, Button} from "antd";
import {ArrowRightOutlined, UserOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
import axios from "axios";
import {getUsersAPIUrl} from "../../getAPIUrls/getUsersAPIUrl";
import {getTreatmentAPIUrl} from "../../getAPIUrls/getTreatmentAPIUrl";
import {useNavigate} from "react-router-dom";
import { auth } from "../../firebaseConfig"


function Home() {
    const [patients, setPatients] = useState([])
    const [clinician, setClinician] = useState()
    const [treatments, setTreatments] = useState([])
    const [wounds, setWounds] = useState([])
    const [vals, setVals] = useState(new Map());
    const navigate = useNavigate();

    useEffect(() => {
        if (auth.currentUser == null) {
            navigate("/")
        }
    }, []);

    useEffect(() => {
        axios.get(`${getUsersAPIUrl()}/users/get_all_patients`).then(res => {
            if (res.status === 200) {
                setPatients(res?.data?.message)
            }
        })
        axios.get(`${getUsersAPIUrl()}/users/get_clinician_info`, {params: {"email": "walt.disney@disney.org"}} ).then(res => {
            if (res.status === 200) {
                setClinician(res?.data?.message)
            }
        })
        axios.get(`${getTreatmentAPIUrl()}/treatment/get_all_treatments` ).then(res => {
            if (res.status === 200) {
                setTreatments(res?.data?.message)
            }
        })
        axios.get(`${getTreatmentAPIUrl()}/treatment/get_all_wounds` ).then(res => {
            if (res.status === 200) {
                setWounds(res?.data?.message)
            }
        })
    }, []);

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
                return <Button className={styles.patientAvatar} onClick={() => navigate(`/patient_details/${patient.medical_ref_number}`)}>
                    <Avatar
                        style={{background: "#DEEBF9"}}
                        size={64}
                        icon={<UserOutlined style={{color: "#004AAD"}}/>}
                    />
                    <span style={{color: "#004AAD"}}>{patient?.['first_name'] + " " + patient?.['last_name']}</span>
                </Button>
            })}
        </div>
        <h2 style={{color: "#004AAD"}}>Schedule</h2>
        <div className={styles.scheduleContainer}>
            {treatments.length !== 0 && treatments.map(treatment => {
                return <div className={styles.treatmentWrapper}>
                    <span>{`Treatment session at ${new Date(treatment?.['start_time_scheduled'])} for ${vals.get(treatment?.['id'])}`}</span>
                    <Button shape={"circle"} style={{background: "#004AAD"}} onClick={() => navigate(`/treatment_session_details/${treatment?.['id']}`)} icon={<ArrowRightOutlined style={{color: "white"}}/>}/>
                </div>
            })}
        </div>
    </div>)
}

export default Home
