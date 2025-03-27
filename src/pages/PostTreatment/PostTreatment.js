import { getUsersAPIUrl } from '../../getAPIUrls/getUsersAPIUrl';
import { getTreatmentAPIUrl } from '../../getAPIUrls/getTreatmentAPIUrl';
import { useState, useEffect } from 'react';
import { message, Button } from 'antd';
import axios from 'axios';
import ReportGeneration from '../../utilities/ReportGeneration/ReportGeneration';
import styles from '../../css/PostTreatment.module.css'
import { SaveOutlined } from '@ant-design/icons';
import {useLocation} from "react-router-dom";

function PostTreatment() {

    const location = useLocation()
    const data = location.state;

    // Assuming that the following 4 fields are provided by the previous page
    const patientEmail = data.patientEmail
    const treatmentId = data.treatmentId;
    const clinicianEmail = localStorage.getItem("email")
    const woundId = data.woundId;

    const [patientData, setPatientData] = useState(null);
    const [treatmentData, setTreatmentData] = useState(null);
    const [clinicianData, setClinicianData] = useState(null);
    const [woundData, setWoundData] = useState(null);
    const [fileData, setFileData] = useState(null);

    // saving report
    const saveReport = async () => {
        try {
            if (!fileData) { // checking if file data has been set
                message.error("File unavailable.");
                return;
            }
    
            const response = await axios.put(`${getTreatmentAPIUrl()}/treatment/add_report?id=${treatmentId}`, { fileData });
    
            // error checking
            if (response.status === 201) {
                message.success("Report added successfully.");
            } else {
                message.error("Failed to add the report.");
            }
        } catch (error) {
            message.error("An error occurred while saving the report.");
        }
    };

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                // Fetch patient information
                const patientResponse = await axios.get(
                    `${getUsersAPIUrl()}/users/get_patient_info?email=${patientEmail}`
                );
                if (patientResponse.status === 200) {
                    const data = patientResponse.data.message;
                    setPatientData({
                        firstName: data.first_name,
                        lastName: data.last_name,
                        phoneNumber: data.phone_number.toString(),
                        mrn: data.medical_ref_number.toString(),
                        deviceUsed: data.medical_device_id,
                        dateOfBirth: data.date_of_birth.toString()
                    });
                } else {
                    message.error("Error retrieving patient information.");
                }

                // Fetch treatment information
                const treatmentResponse = await axios.get(
                    `${getTreatmentAPIUrl()}/treatment/parameters/get?id=${treatmentId}`
                );
                if (treatmentResponse.status === 200) {
                    const data = treatmentResponse.data;
                    setTreatmentData({
                        notes: data.notes,
                        drugVolume: data.drug_volume_administered,
                        solventVolume: data.wash_volume_administered,
                        laserPower1: data.power_delivered_by_laser_1,
                        laserPower2: data.power_delivered_by_laser_2,
                        laserPower3: data.power_delivered_by_laser_3,
                        laserPower4: data.power_delivered_by_laser_4,
                        firstWait: data.first_wait.toString(),
                        secondWait: data.second_wait.toString(),
                        estimatedDurationForDrug: data.estimated_duration_for_drug_administration.toString(),
                        estimatedDurationForLight: data.estimated_duration_for_light_administration.toString(),
                        estimatedDurationForWash: data.estimated_duration_for_wash_administration.toString(),
                        issues: data.issues,
                        startTime: data.start_time.toString(),
                        endTime: data.end_time.toString(),
                        sessionNumber: data.session_number.toString(),
                        painScore: data.pain_score.toString(),
                        imageUrls: ["https://t3.ftcdn.net/jpg/07/84/19/86/360_F_784198690_4iOOWmDumjnUiP85gFJdZ5lXHzEq1ojS.jpg"],
                        woundChanging: String(data.wound_changing),
                        medicineLot: data.medicine_lot
                    });
                } else {
                    message.error("Error retrieving treatment information.");
                }
                // Fetch clinician information
                const clinicianResponse = await axios.get(
                    `${getUsersAPIUrl()}/users/get_clinician_info?email=${clinicianEmail}`
                );
                if (clinicianResponse.status === 200) {
                    const data = clinicianResponse.data.message;
                    setClinicianData({
                        firstName: data.first_name,
                        lastName: data.last_name
                    })
                } else {
                    message.error("Error retrieving clinician information.");
                }
                 // Fetch wound information
                const woundResponse = await axios.get(
                    `${getTreatmentAPIUrl()}/treatment/get_wound_info?id=${woundId}`
                );
                if (woundResponse.status === 200) {
                    const data = woundResponse.data;
                    setWoundData({
                        treated: data.treated ? "Yes": "No"
                    })
                } else {
                    message.error("Error retrieving wound information.");
                }
            } catch (error) {
                message.error("An error occurred while fetching data.");
            }
        };

        fetchReportData();
    }, [woundId, treatmentId, patientEmail, clinicianEmail]);

    // setting file data if patient data and treatment data have been fetched
    useEffect(() => {
        // only setting data if all of it has been successfully fetched
        if (patientData && treatmentData && clinicianData && woundData) {
            setFileData({
                name: {
                    fullName: `${patientData.firstName} ${patientData.lastName}`,
                    mrn: patientData.mrn,
                    treatmentId: treatmentId.toString(),
                },
                title: "Medical Report",
                sections: [
                    {
                        title: "Patient Identification",
                        fields: [
                            { name: "First Name", content: patientData.firstName, inlineContent: true },
                            { name: "Last Name", content: patientData.lastName, inlineContent: true },
                            { name: "Phone Number", content: patientData.phoneNumber, inlineContent: true },
                            { name: "Email", content: patientEmail, inlineContent: true },
                            { name: "Date of Birth", content: patientData.dateOfBirth, inlineContent: true },
                            { name: "Medical Reference Number", content: patientData.mrn, inlineContent: true },
                            { name: "Medical Device Identifier", content: patientData.deviceUsed, inlineContent: true }
                        ],
                    },
                    {
                        title: "Clinician Identification",
                        fields: [
                            { name: "First Name", content: clinicianData.firstName, inlineContent: true },
                            { name: "Last Name", content: clinicianData.lastName, inlineContent: true },
                            { name: "Email", content: clinicianEmail, inlineContent: true },
                        ],
                    },
                    {
                        title: "Wound Details",
                        fields: [
                            { name: "Treated", content: woundData.treated, inlineContent: true }
                        ]
                    },
                    {
                        title: "Treatment Details",
                        fields: [
                            { name: "Session Number", content: treatmentData.sessionNumber, inlineContent: true},
                            { name: "Start Time", content: `${treatmentData.startTime}`, inlineContent: true },
                            { name: "End Time", content: `${treatmentData.endTime}`, inlineContent: true },
                            { name: "Patient's Pain Score", content: treatmentData.painScore, inlineContent: true },
                            { name: "Medicine LOT", content: `${treatmentData.medicineLot} mL`, inlineContent: true },
                            { name: "Drug Volume", content: `${treatmentData.drugVolume} mL`, inlineContent: true },
                            { name: "Solvent Volume", content: `${treatmentData.solventVolume} mL`, inlineContent: true },
                            { name: "Laser 1's Power Level", content: `${treatmentData.laserPower1} mW`, inlineContent: true },
                            { name: "Laser 2's Power Level", content: `${treatmentData.laserPower2} mW`, inlineContent: true },
                            { name: "Laser 3's Power Level", content: `${treatmentData.laserPower3} mW`, inlineContent: true },
                            { name: "Laser 4's Power Level", content: `${treatmentData.laserPower4} mW`, inlineContent: true },
                            { name: "Delay Between Drug And Light Administration", content: `${treatmentData.firstWait} s`, inlineContent: false },
                            { name: "Delay Between Light and Solvent Administration", content: `${treatmentData.secondWait} s`, inlineContent: false },
                            { name: "Estimated Duration for Drug Administration", content: `${treatmentData.estimatedDurationForDrug} s`, inlineContent: false },
                            { name: "Estimated Duration for Light Administration", content: `${treatmentData.estimatedDurationForLight} s`, inlineContent: false },
                            { name: "Images", type: "imageArray", content: treatmentData.imageUrls }
                        ],
                    },
                    {
                        title: "Treatment Analysis",
                        fields: [
                            { name: "Wound Changing", content: treatmentData.woundChanging, inlineContent: true},
                            { name: "Clinician Notes", content: treatmentData.notes, inlineContent: false},
                            { name: "Clinician-noted Issues", type: "textArray", content: treatmentData.issues }
                        ]
                    },
                ],
            });
        }
    }, [patientData, treatmentData, clinicianData, woundData]);

    return (
        <div className={styles.container}>
            {fileData ?
            <>
                <ReportGeneration fileData={fileData} />
                <Button icon={<SaveOutlined />} size="large" className={styles.saveButton} onClick={() => saveReport()}>Save Report</Button>
            </>
            : <p>Loading report preperations...</p>
            }
        </div>
    );
}

export default PostTreatment;