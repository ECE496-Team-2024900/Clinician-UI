import { getUsersAPIUrl } from '../../getAPIUrls/getUsersAPIUrl';
import { getTreatmentAPIUrl } from '../../getAPIUrls/getTreatmentAPIUrl';
import { useState, useEffect } from 'react';
import { message, Button } from 'antd';
import axios from 'axios';
import ReportGeneration from '../../utilities/ReportGeneration/ReportGeneration';
import styles from '../../css/PostTreatment.module.css'

function PostTreatment() {
    const patientEmail = "mickey.mouse@disney.org"; // Assuming this is provided by the previous page
    const treatmentId = 1; // Assuming this is provided by the previous page

    const [patientData, setPatientData] = useState(null);
    const [treatmentData, setTreatmentData] = useState(null);
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
                        phoneNumber: data.phone_num.toString(),
                        mrn: data.medical_ref_number.toString(),
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
                        drugVolume: data.drug_volume_administered,
                        solventVolume: data.wash_volume_administered,
                        laserPower1: data.power_delivered_by_laser_1,
                        laserPower2: data.power_delivered_by_laser_2,
                        laserPower3: data.power_delivered_by_laser_3,
                        laserPower4: data.power_delivered_by_laser_4,
                    });
                } else {
                    message.error("Error retrieving treatment information.");
                }
            } catch (error) {
                message.error("An error occurred while fetching data.");
            }
        };

        fetchReportData();
    }, [patientEmail, treatmentId]);

    // setting file data if patient data and treatment data have been fetched
    useEffect(() => {
        if (patientData && treatmentData) {
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
                        ],
                    },
                    {
                        title: "Treatment Dosages",
                        fields: [
                            { name: "Drug Volume", content: `${treatmentData.drugVolume} mL`, inlineContent: true },
                            { name: "Solvent Volume", content: `${treatmentData.solventVolume} mL`, inlineContent: true },
                            { name: "Laser 1's Power Level", content: `${treatmentData.laserPower1} mW`, inlineContent: true },
                            { name: "Laser 2's Power Level", content: `${treatmentData.laserPower2} mW`, inlineContent: true },
                            { name: "Laser 3's Power Level", content: `${treatmentData.laserPower3} mW`, inlineContent: true },
                            { name: "Laser 4's Power Level", content: `${treatmentData.laserPower4} mW`, inlineContent: true },
                        ],
                    },
                ],
            });
        }
    }, [patientData, treatmentData, treatmentId]);

    return (
        <div className={styles.container}>
            {fileData ? <ReportGeneration fileData={fileData} /> : <p>Loading report preperations...</p>}
            <Button onClick={() => saveReport()}>Save Report</Button>
        </div>
    );
}

export default PostTreatment;