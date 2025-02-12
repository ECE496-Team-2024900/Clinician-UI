import styles from '../../css/PatientPage.module.css'; // Updated CSS module import
import { Form, Input, Row, Col, message, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { getUsersAPIUrl } from '../../getAPIUrls/getUsersAPIUrl';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function PatientPage() {
    const { patientId } = useParams(); // Get patient ID from URL
    const [loading, setLoading] = useState(true);
    const [patientData, setPatientData] = useState(null);
    const [currForm] = Form.useForm();

    useEffect(() => {
        // Fetch patient data from API
        axios.get(`${getUsersAPIUrl()}/users/get_patients`, { medical_ref_number: Number(patientId) })
            .then(res => {
                if (res.status === 200) {
                    setPatientData(res.data.message);
                } else {
                    message.error("Failed to fetch patient data.");
                }
            })
            .catch(error => {
                console.error("Error fetching patient data:", error);
                message.error("An error occurred while retrieving patient details.");
            })
            .finally(() => setLoading(false));
    }, [patientId]);

    return (
        <div className={styles.container}>
            <h2 className={styles.pageTitle}>Existing Patient Demographic</h2>

            {loading ? (
                <Spin size="large" />
            ) : patientData ? (
                <Form form={currForm} className={styles.form} initialValues={{
                    firstName: patientData.first_name,
                    lastName: patientData.last_name,
                    dateOfBirth: patientData.date_of_birth,
                    MRN: patientData.medical_ref_number,
                    email: patientData.email,
                    phoneNumber: patientData.phone_num
                }}>
                    <div className={styles.row}>
                        <div className={styles.inputField}>
                            <label>First Name</label>
                            <Input value={patientData.first_name} disabled />
                        </div>
                        <div className={styles.inputField}>
                            <label>Last Name</label>
                            <Input value={patientData.last_name} disabled />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.inputField}>
                            <label>Date of Birth</label>
                            <Input value={patientData.date_of_birth} disabled />
                        </div>
                        <div className={styles.inputField}>
                            <label>MRN</label>
                            <Input value={patientData.medical_ref_number} disabled />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.inputField}>
                            <label>Email</label>
                            <Input value={patientData.email} disabled />
                        </div>
                        <div className={styles.inputField}>
                            <label>Phone Number</label>
                            <Input value={patientData.phone_num} disabled />
                        </div>
                    </div>
                </Form>
            ) : (
                <p className={styles.errorMessage}>Patient data not found.</p>
            )}
        </div>
    );
}

export default PatientPage;
