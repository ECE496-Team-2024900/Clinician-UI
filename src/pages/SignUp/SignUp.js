import { Button, Input, Form, message, Col } from 'antd';
import logo from "../../assets/logo.png"
import styles from "../../css/SignUp.module.css";
import {useNavigate, useLocation} from "react-router-dom";
import { useState, useEffect } from 'react'
import { auth } from '../../firebaseConfig'
import { signInWithRedirect, getRedirectResult, OAuthProvider } from 'firebase/auth';
import { getUsersAPIUrl } from '../../getAPIUrls/getUsersAPIUrl'
import axios from 'axios'

function SignUp() {
    const navigate = useNavigate();
    const [currForm] = Form.useForm();
    const [submitDisabled, setSubmitDisabled] = useState(true)
    const location = useLocation();
    const { email } = location.state;
    const [errors, setErrors] = useState({
        firstName: true,
        lastName: true
    });

    // setting if submit is disabled based on whether there are errors
    useEffect(() => {
        if(Object.values(errors).every(error => error === false)) {
            setSubmitDisabled(false);
        } else {
            setSubmitDisabled(true);
        }
    }, [errors])

    // creating a new user
    const submitNewUser = async () => {
        try {
            const fieldsToUpdate = {
                "first_name": currForm.getFieldValue("firstName"),
                "last_name": currForm.getFieldValue("lastName"),
                "email": email,
            };
            // adding user information to our DB
            const url = `${getUsersAPIUrl()}/users/add_clinician`;
            await axios.put(url, fieldsToUpdate)
                .then((response) => {
                    if(response.status === 200) {
                        message.success("User created successfully");
                    } else {
                        message.error("We encountered an issue - please try again.");
                    }
                })
                .catch(() => {
                    message.error("There was an error in creating user.");
                });
            if (window.location.hostname === "localhost") {
                auth.currentUser = { uid: "testUser123", email: "test@example.com" }; // Fake user
                navigate("/home")
            } else {
                const provider = new OAuthProvider('microsoft.com');
                provider.setCustomParameters({
                    login_hint: email,
                });
                signInWithRedirect(auth, provider);
                const result = await getRedirectResult(auth);
                if (result) {
                    message.success("User logged in successfully with Microsoft.");
                    navigate('/home');
                }
            }
        } catch {
            message.error("We encountered an issue - please try again.")
        }
    };

    // checking if input field is provided
    const inputRequiredValidation = (_, value) => {
        if(value !== null && value.trim() !== '') {
            setErrors(errors => ({
                ...errors,
                [_.field]: false,
            }))
            return Promise.resolve();
        }
        setErrors(errors => ({
            ...errors,
            [_.field]: true,
        }))
        return Promise.reject('Required field');
    }

    return (
        <div className={styles.page}>
            <img src={logo} alt={"logo"} width={"50%"} height={"100%"} />
            <div className={styles.form}>
                <h1 className={styles.title}>
                    Welcome
                </h1>
                <h2 className={styles.subtitle}>
                    Please enter your details to get started
                </h2>
                <Form form={currForm}>
                    <Col span={12}>
                        <Form.Item name="firstName" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} label={<span className={styles.inputTitle}>First Name</span>} rules={[
                            {
                                message: 'First name is required.',
                                validator: (_, value) => inputRequiredValidation(_, value)
                            }
                        ]}>
                            <Input
                                placeholder="Your first name"
                                className={styles.input_field}
                                allowClear
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="lastName" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} label={<span className={styles.inputTitle}>Last Name</span>} rules={[
                            {
                                message: 'Last name is required.',
                                validator: (_, value) => inputRequiredValidation(_, value)
                            }
                        ]}>
                            <Input
                                placeholder="Your last name"
                                className={styles.input_field}
                                allowClear
                            />
                        </Form.Item>
                    </Col>
                    <Button type="primary" className={styles.enter_button} onClick={submitNewUser} disabled={submitDisabled}>
                        Enter
                    </Button>
                </Form>
            </div>
        </div>
    );
}

export default SignUp;