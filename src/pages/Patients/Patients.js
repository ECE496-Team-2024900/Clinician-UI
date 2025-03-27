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
    const clinicianPatients = JSON.parse(localStorage.getItem("patients"))

    const searchPatients = (query) => {
        if (!query.trim()) {
            // nothing to search for
            setSearchResults(clinicianPatients)
            return
        }
    
        const searchTerms = query.trim().split(/\s+/);
        const searchedPatients = clinicianPatients.filter(patient => {
            const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
            
            if (searchTerms.length === 1) {
                return (
                    patient.first_name.toLowerCase().includes(searchTerms[0]) || 
                    patient.last_name.toLowerCase().includes(searchTerms[0])
                );
            } else {
                return searchTerms.every(term => fullName.includes(term));
            }
        });
        setSearchResults(searchedPatients)
    };
    

    // Function for behaviour on search
    const onSearch = async (val) => {
        //If a search query is filled into the search bar, filter search results
        if (val !== "") {
            try {
                // Retrieve patient records given the search query
                searchPatients(val.trim())
            } catch (error) {
                console.error("Error fetching search results:", error);
                setSearchResults("");
            }
        //If search bar is empty, search results include all patients
        } else {
            try {
                setSearchResults(clinicianPatients)
            } catch (error) {
                console.error("Error fetching all patients:", error);
            }
        }
    };

    // Default is to retrieve all patients and displaying as search results
    useEffect(() => {
        setSearchResults(clinicianPatients)
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
            //Column name is the patient's name
            header={<div className={styles.listHeader}>Name</div>}
            bordered
            //Display 8 records per page
            pagination={{
                pageSize: 8,
                align: 'center'
            }}
            dataSource={searchResults}
            //Display the patient's first and last name
            renderItem={(item) => (
                <List.Item className={styles.listItem} onClick={() => navigate(`/patient_details/${item.medical_ref_number}`)}>
                    {item.first_name + " " + item.last_name}
                </List.Item>
            )}
        />
    </div>
}

export default Patients;

