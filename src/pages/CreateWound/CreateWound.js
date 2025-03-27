import styles from '../../css/CreateWound.module.css'
import { Form, Input, Row, Button, Col, message } from 'antd'
import { useState, useEffect } from 'react'
import { getTreatmentAPIUrl } from '../../getAPIUrls/getTreatmentAPIUrl'
import { useSearchParams } from "react-router-dom";
import axios from 'axios';
import dayjs from 'dayjs';

function CreateWound() {
    const [searchParams, setSearchParams] = useSearchParams();

    const clinicianEmail = localStorage.get("email")
    const patient_id = searchParams.get("patient_id"); // to use later for patient id when creating wound

    const [disableSubmit, setDisableSubmit] = useState(true) // boolean value for whether form submit button should be disabled
    const [errorMessage, setErrorMessage] = useState("") // error message in case wound creation is unsuccessful 
    const [errors, setErrors] = useState({ // boolean values for whether there's an error corresponding to each field in form
        infectionType: true,
        infectionLocation: true,
        deviceId: true
    });
    const [fields, setFields] = useState({ // wound fields in form
        infectionType: null,
        infectionLocation: null,
        deviceId: null
    });
    const [currForm] = Form.useForm();

    // Triggered when form's submit button is clicked
    const submitForm = async () => {
        setDisableSubmit(true);
        // Wound fields
        let fieldsToSet = {
            "infection_type": fields.infectionType,
            "infection_location": fields.infectionLocation,
            "device_id": fields.deviceId,
            "patient_id": patient_id,
            "clinician_id": clinicianEmail,
            "treated": Boolean(false),
            "date_added": dayjs().format("YYYY-MM-DD")
        };

        // Call backend api function for creating wound and display success/error message
        const url = `${getTreatmentAPIUrl()}/treatment/create_wound`;
        try {
            const response = await axios.put(url, fieldsToSet)
            if(response.status === 200) {
                message.success("Wound record created successfully.");
                setDisableSubmit(true);
                setErrorMessage("");
            } else {
                message.error("There was an error in creating the wound record. Record not created.");
                setDisableSubmit(false);
                setErrorMessage(response.data?.message);
            }
        } catch (error) {
            message.error("There was an error in creating the wound record. Record not created.");
            setDisableSubmit(false);
            setErrorMessage(error.response?.data?.message || error.message);
        }
    }
    
    // Function to validate that a field value is not null
    const inputRequiredValidation = (_) => {
        const user_value = currForm.getFieldValue(_.field).toString()
        if(user_value !== null && user_value.trim() !== '') {
            // Field is not null - set value and set error to false
            setErrors(errors => ({
                ...errors,
                [_.field]: false,
            }))
            setFields(fields => ({
                ...fields,
                [_.field]: user_value,
            }))
            return Promise.resolve();
        }
        // Set error to true if field is null
        setErrors(errors => ({
            ...errors,
            [_.field]: true,
        }))
        return Promise.reject('Required field');
    }

    // Enable submit button if there are no errors with any of the fields, otherwise disable it
    useEffect(() => {
        if(Object.values(errors).every(error => error === false)) {
            setDisableSubmit(false);
        } else {
            setDisableSubmit(true);
        }
    }, [errors])

    return <div className={styles.container}>
        <h2 className={styles.pageTitle}>Create New Wound</h2>
        <Form form={currForm} onFinish={submitForm}>
            <Row>
                {/*Infection type field*/}
                <Col span={12}>
                    <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="infectionType" label="Infection Type" rules={[
                            {
                                message: 'Infection Type is required.',
                                validator: (_, value) => inputRequiredValidation(_, value)
                            }
                        ]}>
                        <Input placeholder='Please enter the infection type' />
                    </Form.Item>
                </Col>
                {/*Infection location field*/}
                <Col span={12}>
                    <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="infectionLocation" label="Infection Location" rules={[
                            {
                                message: 'Infection location is required.',
                                validator: (_, value) => inputRequiredValidation(_, value)
                            }
                        ]}>
                        <Input placeholder='Please enter the infection location' />
                    </Form.Item>
                </Col>
            </Row>
            <Row className={styles.rowSpacing}>
                {/*Device id field*/}
                <Col span={12}>
                    <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="deviceId" label="Device ID" rules={[
                            {
                                message: 'Device ID is required.',
                                validator: (_, value) => inputRequiredValidation(_, value)
                            }
                        ]}>
                        <Input placeholder='Please enter the device ID' />
                    </Form.Item>
                </Col>
            </Row>
            {/*Submit button*/}
            <Button disabled={disableSubmit} className={styles.submitBtn} id="report-submit-btn" type="primary" htmlType="submit" block>Submit</Button>
            {/*Error message in case of errors when creating record*/}
            <div className={styles.errorMessage}>
                {errorMessage}
            </div>
        </Form>
    </div>
}

export default CreateWound;