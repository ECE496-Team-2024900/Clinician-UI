import styles from '../../css/Patients.module.css'
import { Button, Input, List } from 'antd'
import { UnorderedListOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react'
import { getUsersAPIUrl } from '../../getAPIUrls/getUsersAPIUrl'
import axios from 'axios'
import {useNavigate} from "react-router-dom";

function Patients() {

    const {Search} = Input; //Search bar
    const navigate = useNavigate();

    const [searchResults, setSearchResults] = useState("") //Search results

    // Function for behaviour on search
    const onSearch = async (val) => {
        //If a search query is filled into the search bar, filter search results
        if (val !== "") {
            try {
                // Retrieve patient records given the search query
                const response = await axios.get(`${getUsersAPIUrl()}/users/search_patients`, {
                    params: { query: val.trim() },
                });
                if (response.status === 200) {
                    // Records successfully returned, set to search results
                    setSearchResults(response.data.message);
                } else {
                    setSearchResults("");
                }
            } catch (error) {
                console.error("Error fetching search results:", error);
                setSearchResults("");
            }
        //If search bar is empty, search results include all patients
        } else {
            try {
                // Retrieve all patient records and set to search results 
                const res = await axios.get(`${getUsersAPIUrl()}/users/find_all_patients`);
                if (res.status === 200) {
                    setSearchResults(res.data.message);
                }
            } catch (error) {
                console.error("Error fetching all patients:", error);
            }
        }
    };

    // Default is to retrieve all patients and displaying as search results
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
        {/*Search bar*/}
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
        {/*Create patient button*/}
        <Button
            className={styles.createButton}
            type="primary"
            size="large"
            onClick={() => navigate("/create_patient")}
        >
            Create New Patient Demographic
        </Button>
    </div>
        {/*List of search results*/}
        <List
            className={styles.list}
            {/*Column name is the patient's name*/}
            header={<div className={styles.listHeader}>Name</div>}
            bordered
            {/*Display 8 records per page*/}
            pagination={{
                pageSize: 8,
                align: 'center'
            }}
            dataSource={searchResults}
            {/*Display the patient's first and last name*/}
            renderItem={(item) => (
                <List.Item className={styles.listItem}>
                    {item.first_name + " " + item.last_name}
                </List.Item>
            )}
        />
    </div>
}

export default Patients;

