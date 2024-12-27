import styles from '../../css/CreatePatient.module.css'
import { Form, Input, Row, Button, Col, message } from 'antd'
import { useState, useEffect } from 'react'
import { getUsersAPIUrl } from '../../getAPIUrls/getUsersAPIUrl'
import axios from 'axios'
import dayjs from 'dayjs';

function CreatePatient() {

    const [disableSubmit, setDisableSubmit] = useState(true)
    const [errorMessage, setErrorMessage] = useState("")
    const [errors, setErrors] = useState({
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        MRN: true,
        email: true,
        confirmEmail: true,
        phoneNumber: true,
        confirmPhoneNumber: true
    });
    const [fields, setFields] = useState({
        firstName: null,
        lastName: null,
        dateOfBirth: null,
        MRN: null,
        email: null,
        confirmEmail: null,
        phoneNumber: null,
        confirmPhoneNumber: null
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

    const inputRequiredValidation = (_) => {
        const user_value = currForm.getFieldValue(_.field).toString()
        if(user_value !== null && user_value.trim() !== '') {
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
        setErrors(errors => ({
            ...errors,
            [_.field]: true,
        }))
        return Promise.reject('Required field');
    }

    const inputNumberValidation = (_) => {
        const user_value = currForm.getFieldValue(_.field)
        if (isNaN(user_value) === false) {
            setFields(fields => ({
                ...fields,
                [_.field]: user_value,
            }))
            return Promise.resolve();
        }
        setErrors(errors => ({
            ...errors,
            [_.field]: true,
        }))
        return Promise.reject('Not a number');
    }

    const inputDateValidation = (_, value) => {
        const user_value = value ? dayjs(value).format('YYYY-MM-DD') : '';
        const today = dayjs().format('YYYY-MM-DD');
        if (user_value && dayjs(user_value).isBefore(today)) {
            setFields(fields => ({
                ...fields,
                dateOfBirth: user_value,
            }));
            return Promise.resolve();
        }
        setErrors(errors => ({
            ...errors,
            dateOfBirth: true,
        }));
        return Promise.reject('Date of birth cannot be in the future.');
    };

    const emailFormatValidation = (_) => {
        const user_value = currForm.getFieldValue(_.field);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(user_value)) {
            setFields(fields => ({
                ...fields,
                [_.field]: user_value,
            }))
            return Promise.resolve();
        }
        setErrors(errors => ({
            ...errors,
            [_.field]: true,
        }))
        return Promise.reject('Invalid email format');
    };

    const confirmEmailValidation = (_) => {
        const email = currForm.getFieldValue('email');
        const confirmEmail = currForm.getFieldValue('confirmEmail');
    
        if (email === confirmEmail) {
            setFields(fields => ({
                ...fields,
                [_.field]: confirmEmail,
            }))
            return Promise.resolve();
        }
        setErrors(errors => ({
            ...errors,
            [_.field]: true,
        }))
        return Promise.reject('Email addresses do not match');
    };
    
    const confirmPhoneNumberValidation = (_) => {
        const phoneNumber = currForm.getFieldValue('phoneNumber');
        const confirmPhoneNumber = currForm.getFieldValue('confirmPhoneNumber');
    
        if (phoneNumber === confirmPhoneNumber) {
            setFields(fields => ({
                ...fields,
                [_.field]: confirmPhoneNumber,
            }))
            return Promise.resolve();
        }
        setErrors(errors => ({
            ...errors,
            [_.field]: true,
        }))
        return Promise.reject('Phone numbers do not match');
    };

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
                        <Input type="date" max={dayjs().format('YYYY-MM-DD')} placeholder='Please enter the date of birth' />
                    </Form.Item>
                </Col>
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
                <Col span={12}>
                    <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="confirmEmail" label="Confirm Email" rules={[
                            {
                                message: 'Email confirmation is required.',
                                validator: (_, value) => inputRequiredValidation(_, value)
                            },
                            {
                                message: 'Email addresses do not match.',
                                validator: (_, value) => confirmEmailValidation(_, value)
                            }
                        ]}>
                        <Input placeholder='Please confirm the email' />
                    </Form.Item>
                </Col>
            </Row>
            <Row>
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
                <Col span={12}>
                    <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="confirmPhoneNumber" label="Confirm Phone Number" rules={[
                            {
                                message: 'Phone number is required.',
                                validator: (_, value) => inputRequiredValidation(_, value)
                            },
                            {
                                message: 'Phone numbers do not match.',
                                validator: (_, value) => confirmPhoneNumberValidation(_, value)
                            }
                        ]}>
                        <Input placeholder='Please confirm the phone number' />
                    </Form.Item>
                </Col>
            </Row>
            <Button disabled={disableSubmit} className={styles.submitBtn} id="report-submit-btn" type="primary" htmlType="submit" block>Submit</Button>
            <div className={styles.errorMessage}>
                {errorMessage}
            </div>
        </Form>
    </div>
}

export default CreatePatient;