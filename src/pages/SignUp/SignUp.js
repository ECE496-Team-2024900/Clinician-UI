import { Button, Input, Form, message } from 'antd';
import logo from "../../assets/logo.png"
import styles from "../../css/SignUp.module.css";
import {useCookies} from "react-cookie";
import {useNavigate, useLocation} from "react-router-dom";
import { useState, useEffect } from 'react'
import { auth } from '../../firebaseConfig'
import { createUserWithEmailAndPassword, signInWithRedirect, getRedirectResult, OAuthProvider } from 'firebase/auth';
import { getUsersAPIUrl } from '../../getAPIUrls/getUsersAPIUrl'
import axios from 'axios'

function SignUp() {
    const [cookies, setCookie] = useCookies(['cookie-name']);
    const navigate = useNavigate();
    const [currForm] = Form.useForm();
    const [submitDisabled, setSubmitDisabled] = useState(true)
    const location = useLocation();
    const { email } = location.state;
    const [errors, setErrors] = useState({
        firstName: true,
        lastName: true,
        password: true,
        confirmPassword: true
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
            const password = currForm.getFieldValue("password")
            // adding user (email and password) to firebase
            await createUserWithEmailAndPassword(auth, email, password);
            const fieldsToUpdate = {
                "first_name": currForm.getFieldValue("firstName"),
                "last_name": currForm.getFieldValue("lastName"),
                "email": email,
            };
            // adding user information (all but password) to our DB
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
                message.error("There was an error in updating the parameters. Treatment approval not sent.");
            });
            // logging user in via microsoft
            const provider = new OAuthProvider('microsoft.com');
            provider.setCustomParameters({
                login_hint: email,
            });
            signInWithRedirect(auth, provider);
            const result = await getRedirectResult(auth); 
            if (result) {
                message.success("User logged in successfully with Microsoft.");
                setCookie("email", email);
                navigate('/');
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

    // checking if password meets firebase's criteria
    const passwordValidation = (_, value) => {
        const hasLetter = /[A-Za-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

        currForm.validateFields(['confirmPassword']); // checking ig updated password matches confirmed password
        if (value && value.length >= 6 && hasLetter && hasNumber && hasSpecialChar) {
            setErrors(errors => ({
                ...errors,
                [_.field]: false,
            }));
            return Promise.resolve();
        }
        setErrors(errors => ({
            ...errors,
            [_.field]: true,
        }));
        return Promise.reject('Password does not meet criteria');
    };

    // checking if confirmed password matches password field
    const confirmPasswordValidation = (_, value) => {
        const password = currForm.getFieldValue("password");
        if (value && value === password) {
            setErrors(errors => ({
                ...errors,
                [_.field]: false,
            }));
            return Promise.resolve();
        }
        setErrors(errors => ({
            ...errors,
            [_.field]: true,
        }));
        return Promise.reject('Passwords do not match');
    };

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
                    <Form.Item name="firstName" rules={[
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
                    <Form.Item name="lastName" rules={[
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
                    <Form.Item name="password" rules={[
                        {
                            message: (
                                <>
                                    Password must be at least: <br />
                                    1. 6 characters long <br />
                                    2. Contain letters, numbers, and a special character.
                                </>
                            ),
                            validator: passwordValidation
                        }
                    ]}>
                        <Input.Password 
                            placeholder="Your password"
                            className={styles.input_field}
                        />
                    </Form.Item>
                    <Form.Item name="confirmPassword" rules={[
                        {
                            message: 'Passwords do not match.',
                            validator: confirmPasswordValidation
                        }
                    ]}>
                        <Input.Password 
                            placeholder="Confirm password"
                            className={styles.input_field}
                        />
                    </Form.Item>
                    <Button type="primary" className={styles.enter_button} onClick={submitNewUser} disabled={submitDisabled}>
                        Enter
                    </Button>
                </Form>
            </div>
        </div>
    );
}

export default SignUp;
