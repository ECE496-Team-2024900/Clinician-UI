import { Button, Input } from 'antd';
import logo from "../assets/logo.png";
import styles from "../css/Login.module.css";
import {useCookies} from "react-cookie";
import {useNavigate} from "react-router-dom";

function Login() {
    const [cookies, setCookie] = useCookies(['cookie-name']);
    const navigate = useNavigate();

    // Button click handler for logging in
    // Set the cookie using email and reload page, which would redirect to the clinician's home page
    const handleButtonClick = () => {
        setCookie("email", "walt.disney@disney.org");
        window.location.reload()
    };

    return (
        <div className={styles.page}>
            {/*Display product logo on left half of screen*/}
            <img src={logo} alt={"logo"} width={"50%"} height={"100%"} />
            <div className={styles.form}>
                <h1 className={styles.title}>
                    Welcome back
                </h1>
                {/*Prompt user for their email in order to log in*/}
                <h2 className={styles.subtitle}>
                    Please enter your email
                </h2>
                <Input 
                    placeholder="Your email" 
                    className={styles.email_input}
                    allowClear
                />
                {/*Enter button after typing in email, trigger handleButtonClick function when clicked*/}
                <Button type="primary" className={styles.enter_button} onClick={handleButtonClick}>
                    Enter
                </Button>
            </div>
        </div>
    );
}

export default Login;
