import styles from "../../css/Schedule.module.css";
import {useEffect, useState} from "react";
import axios from "axios";
import {getTreatmentAPIUrl} from "../../getAPIUrls/getTreatmentAPIUrl";
import { Calendar } from "antd";
import {getUsersAPIUrl} from "../../getAPIUrls/getUsersAPIUrl";
import {useNavigate} from "react-router-dom";

function Schedule() {
    const [patients, setPatients] = useState([])
    const [treatments, setTreatments] = useState([])
    const [wounds, setWounds] = useState([])
    const [vals, setVals] = useState(new Map());
    const navigate = useNavigate()

    const clinicianEmail = localStorage.getItem("email")
    const [patientMRNs, setPatientMRNs] = useState([])


    // useEffect(() => {
    //     axios.get(`${getUsersAPIUrl()}/users/find_all_patients`).then(res => {
    //         if (res.status === 200) {
    //             setPatients(res?.data?.message)
    //         }
    //     })
    //     axios.get(`${getTreatmentAPIUrl()}/treatment/get_all_treatments` ).then(res => {
    //         if (res.status === 200) {
    //             setTreatments(res?.data?.message)
    //         }
    //     })
    //     axios.get(`${getTreatmentAPIUrl()}/treatment/get_all_wounds` ).then(res => {
    //         if (res.status === 200) {
    //             setWounds(res?.data?.message)
    //         }
    //     })
    // }, []);

    useEffect(() => {
        if (auth.currentUser == null) {
            navigate("/")
        }
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

    const dateCellRender = (value) => {
        const listData = treatments?.filter(treatment => new Date(treatment.date_scheduled).getDate() === new Date(value).getDate() &&  new Date(treatment.date_scheduled).getMonth() === new Date(value).getMonth() &&  new Date(treatment.date_scheduled).getFullYear() === new Date(value).getFullYear())
        return (
            <ul className="events">
                {listData.map((item) => (
                    <li key={item.id} onClick={() => navigate(`/treatment_session_details/${item.id}`, { state: {woundId: item.wound_id} })}>{`Treatment session: ${vals.get(item.id)}, ${new Date(item.start_time_scheduled).toLocaleTimeString()}`}</li>
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