import { Button, Input } from 'antd';
import logo from "../assets/logo.png";
import styles from "../css/Login.module.css";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate(); 

    const handleButtonClick = () => {
        navigate("/home"); // NOTE: Update once the next page is implemented
    };

    return (
        <div className={styles.page}>
            <img src={logo} alt={"logo"} width={"50%"} height={"100%"} />
            <div className={styles.form}>
                <h1 className={styles.title}>
                    Welcome back
                </h1>
                <h2 className={styles.subtitle}>
                    Please enter your email
                </h2>
                <Input 
                    placeholder="Your email" 
                    className={styles.email_input}
                    allowClear
                />
                <Button type="primary" className={styles.enter_button} onClick={handleButtonClick}>
                    Enter
                </Button>
            </div>
        </div>
    );
}

export default Login;
