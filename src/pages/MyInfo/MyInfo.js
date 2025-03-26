import axios from "axios";
import {getUsersAPIUrl} from "../../getAPIUrls/getUsersAPIUrl";
import {useEffect, useState} from "react";
import styles from "../../css/MyInfo.module.css";
import {Button, Checkbox, Form, Input, message} from "antd";

function MyInfo() {
    const [clinician, setClinician] = useState()
    const [currForm] = Form.useForm();
    useEffect(() => {
        axios.get(`${getUsersAPIUrl()}/users/get_clinician_info`, {params: {"email": "walt.disney@disney.org"}} ).then(res => {
            if (res.status === 200) {
                setClinician(res?.data?.message)
            }
        })
    }, []);
    const submitForm = (fields) => {
        const payload = {
            notify_by_email: fields.notify_by_email,
            notify_by_phone: fields.notify_by_phone,
            phone_num: Number(fields.phone_num),
            email: fields.email
        }
        const url = `${getUsersAPIUrl()}/users/update_clinician_info`
        axios.patch(url, payload).then(res => {
           if (res.status === 200) {
               message.success('Your information was updated successfully.')
           } else {
               message.error("There was an error in updating your information")
           }
        })
    }
    useEffect(() => {
        if (clinician != null) {
            currForm.setFieldsValue({
                first_name: clinician.first_name,
                last_name: clinician.last_name,
                email: clinician.email,
                phone_num: clinician.phone_num,
                notify_by_phone: clinician.notify_by_phone === true,
                notify_by_email: clinician.notify_by_email === true,
            })
        }
    }, [clinician, currForm])
    return (<div className={styles.container}>
        <h1>My Personal Information</h1>
        <Form form={currForm} className={styles.form} initialValues={{
            first_name: "",
            last_name: "",
            email: "",
            phone_num: "",
            notify_by_phone: false,
            notify_by_email: false,
        }} onFinish={submitForm}>
            <div className={styles.row}>
                <div className={styles.inputField}>
                    <label>First Name</label>
                    <Form.Item name="first_name">
                        <Input disabled/>
                    </Form.Item>
                </div>
                <div className={styles.inputField}>
                    <label>Last Name</label>
                    <Form.Item name="last_name">
                        <Input disabled/>
                    </Form.Item>
                </div>
            </div>
            <div className={styles.row}>
                <div className={styles.inputField}>
                    <label>Email</label>
                    <Form.Item name="email">
                        <Input disabled/>
                    </Form.Item>
                </div>
                <div className={styles.inputField}>
                    <label>Phone Number</label>
                    <Form.Item name="phone_num">
                        <Input type="number"/>
                    </Form.Item>
                </div>
            </div>
            <div className={styles.row}>
                <div className={styles.inputField}>
                    <Form.Item name="notify_by_email" valuePropName="checked">
                        <Checkbox>Send Notifications to Email</Checkbox>
                    </Form.Item>
                </div>
                <div className={styles.inputField}>
                    <Form.Item name="notify_by_phone" valuePropName="checked">
                        <Checkbox>Send Notifications to Phone</Checkbox>
                    </Form.Item>
                </div>
            </div>
            <Button className={styles.startTreatmentBtn} type="primary" htmlType="submit">Update Settings</Button>
        </Form>
    </div>)
}

export default MyInfo