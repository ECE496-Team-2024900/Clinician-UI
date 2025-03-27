import {Button, Input, Form, message, Col} from 'antd';
import logo from "../assets/logo.png";
import styles from "../css/Login.module.css";
import {useNavigate} from "react-router-dom";
import { OAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { useState, useEffect } from 'react'
import { getUsersAPIUrl } from '../getAPIUrls/getUsersAPIUrl'
import axios from 'axios'
import {auth} from "../firebaseConfig"

function Login() {
    const navigate = useNavigate();
    const [currForm] = Form.useForm();
    const [submitDisabled, setSubmitDisabled] = useState(true)
    const [errors, setErrors] = useState({
        emailRequired: true,
        emailDomain: true
    });

    // setting submit disable depending on errors
    useEffect(() => {
        if(Object.values(errors).every(error => error === false)) {
            setSubmitDisabled(false);
        } else {
            setSubmitDisabled(true);
        }
    }, [errors])

    // navigating to welcome page after login
    useEffect(() => {
        const fetchResult = async () => {
            const result = await getRedirectResult(auth);
            if (result) {
                navigate('/home');
            }
        };
        fetchResult();
    }, [navigate]);

    // ensuring email has been provided
    const emailRequiredValidation = (_, value) => {
        if(value !== null && value.trim() !== '') {
            setErrors(errors => ({
                ...errors,
                emailRequired: false,
            }))
            return Promise.resolve();
        }
        setErrors(errors => ({
            ...errors,
            emailRequired: true,
        }))
        return Promise.reject('Required field');
    }

    // ensuring email domain is UHN
    const emailDomainValidation = (_, value) => {
        if(value.endsWith('@uhn.ca')) {
            setErrors(errors => ({
                ...errors,
                emailDomain: false,
            }))
            return Promise.resolve();
        }
        setErrors(errors => ({
            ...errors,
            emailDomain: true,
        }))
        return Promise.reject('Wrong email domain');
    }

    // returns true if the email is registered, else returns false
    async function emailRegistered(email) {
        const url = `${getUsersAPIUrl()}/users/check_if_clinician_exists?email=${email}`;
        try {
            const response = await axios.get(url);
            if (response.status === 200) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return false;
        }
    }

    // submitting email to log user in (if they are registered with app)
    const submitEmail = async () => {
        const email = currForm.getFieldValue("emailInput")
        const isRegistered = await emailRegistered(email)
        if (isRegistered) {
            localStorage.setItem("email", email);
            if (window.location.hostname === "localhost") {
                auth.currentUser = { uid: "testUser123", email: email }; // Fake user
                navigate("/home")
            } else {
                // redirect to Microsoft login
                const provider = new OAuthProvider('microsoft.com');
                provider.setCustomParameters({
                    login_hint: email
                });
                signInWithRedirect(auth, provider);
                try {
                    const result = await getRedirectResult(auth);
                    if (result) {
                        navigate('/');
                    }
                } catch (error) {
                    message.error("Login failed - please try again");
                }
            }
        } else {
            // navigate to sign-up page if the user is not registered
            navigate('/sign-up', { state: { email: email } });
        }
    };

    return (
        <div className={styles.page}>
            {/*Display product logo on left half of screen*/}
            <img src={logo} alt={"logo"} width={"50%"} height={"100%"} />
                <Form form={currForm} className={styles.form}>
                    <h1 className={styles.title}>
                        Welcome back
                    </h1>
                    {/*Prompt user for their email in order to log in*/}
                    <h2 className={styles.subtitle}>
                        Please enter your email
                    </h2>
                    <Form.Item name="emailInput" rules={[
                        {
                            message: 'Email is required.',
                            validator: (_, value) => emailRequiredValidation(_, value)
                        },
                        {
                            message: 'Email must be part of the UHN domain.',
                            validator: (_, value) => emailDomainValidation(_, value)
                        }
                    ]}>
                        <Input
                            placeholder="Your email"
                            className={styles.email_input}
                            allowClear
                        />
                    </Form.Item>
                    <h2 className={styles.subtitle}>
                        Please enter your password
                    </h2>
                    <Form.Item>
                        <Input
                            placeholder="Your password"
                            className={styles.email_input}
                            allowClear
                            type={"password"}
                        />
                    </Form.Item>
                    <Button type="primary" className={styles.enter_button} onClick={submitEmail}
                            disabled={submitDisabled}>
                        Enter
                    </Button>
                </Form>
        </div>
    );
}

export default Login;