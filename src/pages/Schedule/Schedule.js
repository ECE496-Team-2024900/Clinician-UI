import styles from "../../css/Schedule.module.css";
import {useEffect, useState} from "react";
import axios from "axios";
import {getTreatmentAPIUrl} from "../../getAPIUrls/getTreatmentAPIUrl";
import { Calendar } from "antd";
import {getUsersAPIUrl} from "../../getAPIUrls/getUsersAPIUrl";

function Schedule() {
    const [patients, setPatients] = useState([])
    const [treatments, setTreatments] = useState([])
    const [wounds, setWounds] = useState([])
    const [vals, setVals] = useState(new Map());

    useEffect(() => {
        axios.get(`${getUsersAPIUrl()}/users/get_all_patients`).then(res => {
            if (res.status === 200) {
                setPatients(res?.data?.message)
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

    const dateCellRender = (value) => {
        const listData = treatments.filter(treatment => new Date(treatment.date_scheduled).getDate() === value)
        return (
            <ul className="events">
                {listData.map((item) => (
                    <li key={item.id}>{`Treatment session: ${vals.get(item.id)}, ${new Date(item.start_time_scheduled).toLocaleTimeString()}`}</li>
                ))}
            </ul>
        );
    };


    const cellRender = (current, info) => {
        if (info.type === 'date') return dateCellRender(current);
        return info.originNode;
    };

    return (<div className={styles.container}>
        <Calendar cellRender={cellRender}/>
    </div>)
}

export default Schedule