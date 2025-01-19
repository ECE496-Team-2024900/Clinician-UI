import styles from '../../css/CreatePatient.module.css'
import { Form, Input, Row, Button, Col, message } from 'antd'
import { useState, useEffect } from 'react'
import { getUsersAPIUrl } from '../../getAPIUrls/getUsersAPIUrl'
import axios from 'axios'
import dayjs from 'dayjs';

function CreatePatient() {

    const [disableSubmit, setDisableSubmit] = useState(true) // boolean value for whether form submit button should be disabled
    const [errorMessage, setErrorMessage] = useState("") // error message in case patient creation is unsuccessful 
    const [errors, setErrors] = useState({ // boolean values for whether there's an error corresponding to each field in form
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        MRN: true,
        email: true,
        phoneNumber: true
    });
    const [fields, setFields] = useState({ // patient fields in form
        firstName: null,
        lastName: null,
        dateOfBirth: null,
        MRN: null,
        email: null,
        phoneNumber: null
    });
    const [currForm] = Form.useForm();

    const submitForm = async () => {
        setDisableSubmit(true);
        let fieldsToSet = {
            "first_name": fields.firstName,
            "last_name": fields.lastName,
            "date_of_birth": fields.dateOfBirth,
            "medical_ref_number": Number(fields.MRN),
            "email": fields.email,
            "phone_num": Number(fields.phoneNumber)
        };

        const url = `${getUsersAPIUrl()}/users/create_patient`;
        try {
            const response = await axios.put(url, fieldsToSet)
            if(response.status === 200) {
                message.success("Patient record created successfully.");
                setDisableSubmit(true);
                setErrorMessage("");
            } else {
                message.error("There was an error in creating the patient record. Record not created.");
                setDisableSubmit(false);
                setErrorMessage(response.data?.message);
            }
        } catch (error) {
            message.error("There was an error in creating the patient record. Record not created.");
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

    // Function to validate that a numerical value is entered in a field
    const inputNumberValidation = (_) => {
        const user_value = currForm.getFieldValue(_.field)
        if (isNaN(user_value) === false) {
            // Field has a number entered - set value 
            setFields(fields => ({
                ...fields,
                [_.field]: user_value,
            }))
            return Promise.resolve();
        }
        // Set error to true if field value is not a number
        setErrors(errors => ({
            ...errors,
            [_.field]: true,
        }))
        return Promise.reject('Not a number');
    }

    //Function to validate that a valid date is entered (for date of birth)
    const inputDateValidation = (_, value) => {
        const user_value = value ? dayjs(value).format('YYYY-MM-DD') : ''; // format date for comparing
        const today = dayjs().format('YYYY-MM-DD'); // today's date
        if (user_value && dayjs(user_value).isBefore(today)) { // Field value must be not null and must be a date prior to today
            setFields(fields => ({
                ...fields,
                dateOfBirth: user_value,
            }));
            return Promise.resolve();
        }
        // Set error to true if field value is not a valid date
        setErrors(errors => ({
            ...errors,
            dateOfBirth: true,
        }));
        return Promise.reject('Date of birth cannot be in the future.');
    };

    //Function to validate that a valid email address is entered
    const emailFormatValidation = (_) => {
        const user_value = currForm.getFieldValue(_.field);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //valid email format in regex
        if (emailRegex.test(user_value)) { //compare email entered against the regex format
            setFields(fields => ({
                ...fields,
                [_.field]: user_value,
            }))
            return Promise.resolve();
        }
        // Set error to true if field value is not a valid email
        setErrors(errors => ({
            ...errors,
            [_.field]: true,
        }))
        return Promise.reject('Invalid email format');
    };

    // Enable submit button if there are no errors with any of the fields, otherwise disable it
    useEffect(() => {
        if(Object.values(errors).every(error => error === false)) {
            setDisableSubmit(false);
        } else {
            setDisableSubmit(true);
        }
    }, [errors])

    return <div className={styles.container}>
        <h2 className={styles.pageTitle}>Create New Patient Demographic</h2>

        <Form form={currForm} onFinish={submitForm}>
            <Row>
                {/*First name field*/}
                <Col span={12}>
                    <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="firstName" label="First Name" rules={[
                            {
                                message: 'First name is required.',
                                validator: (_, value) => inputRequiredValidation(_, value)
                            }
                        ]}>
                        <Input placeholder='Please enter the first name' />
                    </Form.Item>
                </Col>
                {/*Last name field*/}
                <Col span={12}>
                    <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="lastName" label="Last Name" rules={[
                            {
                                message: 'Last Name is required.',
                                validator: (_, value) => inputRequiredValidation(_, value)
                            }
                        ]}>
                        <Input placeholder='Please enter the last name' />
                    </Form.Item>
                </Col>
            </Row>
            <Row className={styles.rowSpacing}>
                {/*Date of birth field*/}
                <Col span={12}>
                    <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="dateOfBirth" label="Date of Birth" rules={[
                            {
                                message: 'Date of birth is required.',
                                validator: (_, value) => inputRequiredValidation(_, value)
                            },
                            {
                                message: 'Invalid date format or future date.',
                                validator: inputDateValidation,
                            }
                        ]}>
                        {/*Date selector with only days before today enabled for selection*/}
                        <Input type="date" max={dayjs().format('YYYY-MM-DD')} placeholder='Please enter the date of birth' />
                    </Form.Item>
                </Col>
                {/*MRN field*/}
                <Col span={12}>
                    <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="MRN" label="Medical Reference Number (MRN)" rules={[
                            {
                                message: 'MRN is required.',
                                validator: (_, value) => inputRequiredValidation(_, value)
                            },
                            {
                                message: 'MRN must be a number. Note: please do not include spaces or hyphens.',
                                validator: (_, value) => inputNumberValidation(_, value)
                            }
                        ]}>
                        <Input placeholder='Please enter the MRN' />
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                {/*Email field*/}
                <Col span={12}>
                    <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="email" label="Email" rules={[
                            {
                                message: 'Email is required.',
                                validator: (_, value) => inputRequiredValidation(_, value)
                            },
                            {
                                message: 'Invalid email format.',
                                validator: (_, value) => emailFormatValidation(_, value)
                            }
                        ]}>
                        <Input placeholder='Please enter the email (eg. user@domain.com)' />
                    </Form.Item>
                </Col>
                {/*Phone number field*/}
                <Col span={12}>
                    <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="phoneNumber" label="Phone Number" rules={[
                            {
                                message: 'Phone number is required.',
                                validator: (_, value) => inputRequiredValidation(_, value)
                            },
                            {
                                message: 'Phone number must be a number. Note: please do not include spaces or hyphens.',
                                validator: (_, value) => inputNumberValidation(_, value)
                            }
                        ]}>
                        <Input placeholder='Please enter the phone number (eg. 1234567890)' />
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

export default CreatePatient;