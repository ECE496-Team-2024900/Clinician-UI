import styles from '../../css/Patients.module.css'
import { Button, Input, List } from 'antd'
import { UnorderedListOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react'
import { getUsersAPIUrl } from '../../getAPIUrls/getUsersAPIUrl'
import axios from 'axios'
import {useNavigate} from "react-router-dom";

function Patients() {

    const {Search} = Input;
    const navigate = useNavigate();

    const [searchResults, setSearchResults] = useState("")

    const onSearch = async (val) => {
        if (val !== "") {
            try {
                const response = await axios.get(`${getUsersAPIUrl()}/users/search_patients`, {
                    params: { query: val.trim() },
                });
                if (response.status === 200) {
                    setSearchResults(response.data.message);
                } else {
                    setSearchResults("");
                }
            } catch (error) {
                console.error("Error fetching search results:", error);
                setSearchResults("");
            }
        } else {
            try {
                const res = await axios.get(`${getUsersAPIUrl()}/users/find_all_patients`);
                if (res.status === 200) {
                    setSearchResults(res.data.message);
                }
            } catch (error) {
                console.error("Error fetching all patients:", error);
            }
        }
    };

    useEffect(() => {
        axios.get(`${getUsersAPIUrl()}/users/find_all_patients`).then(res => {
            if (res.status === 200) {
                setSearchResults(res?.data?.message)
            }
        })
    }, []);

    return <div className={styles.container}>
        <h2 className={styles.pageTitle}>Patients</h2>
        <div className={styles.searchAndButtonContainer}>
        <Search
          className={styles.search}
          onSearch={onSearch}
          placeholder={"Search for patients..."}
          prefix={
            <span className={styles.searchIcon}>
                <UnorderedListOutlined />
            </span>
          }
          size="large"
        />
        <Button
            className={styles.createButton}
            type="primary"
            size="large"
            onClick={() => navigate("/create_patient")}
        >
            Create New Patient Demographic
        </Button>
    </div>
        <List
            className={styles.list}
            header={<div className={styles.listHeader}>Name</div>}
            bordered
            pagination={{
                pageSize: 8,
                align: 'center'
            }}
            dataSource={searchResults}
            renderItem={(item) => (
                <List.Item className={styles.listItem}>
                    {item.first_name + " " + item.last_name}
                </List.Item>
            )}
        />
    </div>
}

export default Patients;

