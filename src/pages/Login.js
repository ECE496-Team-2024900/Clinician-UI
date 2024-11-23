import { Button, Input, Typography } from 'antd';
import logo from "../assets/logo.png"
import styles from "../css/Login.module.css";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

function Login() {
    const navigate = useNavigate(); 

    const handleButtonClick = () => {
        //navigate("/home"); // NOTE: Update once the next page is implemented
    };

    return(
        <div className={styles.page}>
            <img src={logo} alt={"logo"} width={"50%"} height={"100%"}/>
            <div className={styles.form}>
                <Title class={styles.title}>
                    Welcome back
                </Title>
                <Title class={styles.subtitle} level={2}>
                    Please enter your email
                </Title>
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