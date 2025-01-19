import styles from '../../css/TreatmentSessionDetails.module.css'
import { Form, Input, Row, Col, message, Image } from 'antd'
import { useState, useEffect } from 'react'
import { getTreatmentAPIUrl } from '../../getAPIUrls/getTreatmentAPIUrl'
import axios from 'axios'
import { useLocation } from "react-router-dom";

function TreatmentSessionDetails() {

    const location = useLocation(); 

    // All the fields related to treatment session that will be displayed
    const [fields, setFields] = useState({
        completed: false,
        dateTimeScheduled: null,
        drugVolumeRequired: null,
        solventVolumeRequired: null,
        laserPowerRequired: null,
        delayBetweenDrugAndLight: null,
        delayBetweenLightAndSolvent: null,
        drugVolumeAdministered: null,
        solventVolumeAdministered: null,
        laser1PowerDelivered: null,
        laser2PowerDelivered: null,
        laser3PowerDelivered: null,
        laser4PowerDelivered: null,
        drugAdministrationDuration: null,
        lightAdministrationDuration: null,
        solventAdministrationDuration: null,
        startTime: null,
        endTime: null,
        sessionNumber: null,
        painScore: null,
        imageUrls: null,
        notes: null,
        issues: null
    });

    // Form component
    const [form] = Form.useForm();

    // Retrieving details of the treatment session with the id specified in the webpage url at the top
    useEffect(() => {
            const url = `${getTreatmentAPIUrl()}/treatment/parameters/get?id=${location.pathname.split("/")[2]}`;
            axios.get(url)
            .then((response) => {
                if(response.status === 200) { // Successfully retrieved data
                    // Set each of the fields we need to display in the form using the data retrieved
                    setFields({
                        completed: response.data.completed,
                        dateTimeScheduled: formatDate(response.data.start_time_scheduled),
                        drugVolumeRequired: response.data.drug_volume_required,
                        solventVolumeRequired: response.data.wash_volume_required,
                        laserPowerRequired: response.data.laser_power_required,
                        delayBetweenDrugAndLight: response.data.first_wait,
                        delayBetweenLightAndSolvent: response.data.second_wait,
                        drugVolumeAdministered: response.data.drug_volume_administered,
                        solventVolumeAdministered: response.data.wash_volume_administered,
                        laser1PowerDelivered: response.data.power_delivered_by_laser_1,
                        laser2PowerDelivered: response.data.power_delivered_by_laser_2,
                        laser3PowerDelivered: response.data.power_delivered_by_laser_3,
                        laser4PowerDelivered: response.data.power_delivered_by_laser_4,
                        drugAdministrationDuration: response.data.estimated_duration_for_drug_administration,
                        lightAdministrationDuration: response.data.estimated_duration_for_light_administration,
                        solventAdministrationDuration: response.data.estimated_duration_for_wash_administration,
                        startTime: formatDate(response.data.start_time),
                        endTime: formatDate(response.data.end_time),
                        sessionNumber: response.data.session_number,
                        painScore: response.data.pain_score,
                        imageUrls: (response.data.image_urls) ? response.data.image_urls : null,
                        notes: response.data.notes,
                        issues: response.data.issues
                    });
                } else if(response.status === 204) { // The specified treatment session record wasn't found
                    message.error("No treatment session found for the given id.")
                }
            })
            .catch(() => { // Error occurred in the api call
                message.error("There was an error in retrieving treatment session details.");
            });
      }, [location.pathname.split("/")[2]])

    // Set the values of the form's fields
    useEffect(() => {
        form.setFieldsValue(fields);
    }, [fields]);

    // Helper function to format date from 'YYYY-mm-dd hh:mm:ss' to 'weekday, month date, year at hour:minutes:seconds AM/PM' (e.g. "Tuesday, November 26, 2024 at 10:13:56 AM")
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true //for displaying am/pm instead of 24-hour time
        };
        return date.toLocaleDateString('en-US', options);
    };

    return (
        <div className={styles.container}>
            {/*Page title indicates session number (eg. session 1 is first session for that wound) and its scheduled date and time*/}
            <h2 className={styles.pageTitle}>{"Treatment Session #"}{fields.sessionNumber}{": "}{fields.dateTimeScheduled}</h2>
            {/*Page subtitle indicates whether the treatment session is completed or not*/}
            <h3 className={styles.pageSubtitle}>{"Session status: "}{fields.completed ? "Complete" : "Incomplete"}</h3>
            <Form form={form}>
            {/*Fields to display when it is an upcoming treatment session*/}
            {!fields.completed && (
                <div>
                    {/*Dosage information (for drug, solvent, laser power)*/}
                    <h3 className={styles.formSubtitle}>{"Dosages (Values can be modified at the time of session)"}</h3>
                    <Row>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="drugVolumeRequired" label="Drug Volume (mL)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="solventVolumeRequired" label="Solvent Volume (mL)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="laserPowerRequired" label="Laser Power Level (W)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                    </Row>
                    {/*Wait time information (between drug and light and between light and solvent)*/}
                    <h3 className={styles.formSubtitle}>{"Wait Times (Values can be modified at the time of session)"}</h3>
                    <Row>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="delayBetweenDrugAndLight" label="Delay between Drug Administration and Light Irradiation (seconds)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="delayBetweenLightAndSolvent" label="Delay between Light Irradiation and Solvent Administration (seconds)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                    </Row>
                </div>
            )}
            {/*Fields to display when it is a complete treatment session*/}
            {fields.completed && (
                <div>
                    {/*Time/duration information (start/end times, wait times, durations for drug, light and solvent administrations)*/}
                    <h3 className={styles.formSubtitle}>Times and Durations</h3>
                    <Row>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="startTime" label="Session Start Time">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="endTime" label="Session End Time">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="delayBetweenDrugAndLight" label="Delay between Drug Administration and Light Irradiation (seconds)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="delayBetweenLightAndSolvent" label="Delay between Light Irradiation and Solvent Administration (seconds)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="drugAdministrationDuration" label="Duration of Drug Administration (seconds)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="lightAdministrationDuration" label="Duration of Light Administration (seconds)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="solventAdministrationDuration" label="Duration of Solvent Administration (seconds)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                    </Row>
                    {/*Dosage information (for drug, solvent, laser power)*/}
                    <h3 className={styles.formSubtitle}>Dosages</h3>
                    <Row>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="drugVolumeAdministered" label="Drug Volume Administered (mL)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="solventVolumeAdministered" label="Solvent Volume Administered (mL)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="laser1PowerDelivered" label="Power Delivered by Laser 1 (W)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="laser2PowerDelivered" label="Power Delivered by Laser 2 (W)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="laser3PowerDelivered" label="Power Delivered by Laser 3 (W)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="laser4PowerDelivered" label="Power Delivered by Laser 4 (W)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                    </Row>
                    {/*Other information like clinician notes, technical issues, and patient pain score*/}
                    <h3 className={styles.formSubtitle}>Other Details</h3>
                    <Row>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="notes" label="Clinician Notes">
                                <Input.TextArea readOnly rows={4} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="issues" label="Technical Issues">
                                <Input.TextArea readOnly rows={4} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="painScore" label="Patient Pain Score on Scale of 1-10 (1 being none, 10 being extreme)">
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                    </Row>
                    {/*Display all wound images*/}
                    <h3 className={styles.formSubtitle}>Wound Images</h3>
                    <div className={styles.imageContainer}>
                        {fields.imageUrls?.map((item, index) => {
                            return <Image
                                key={index}
                                className={styles.image}
                                src={item}
                                preview={false}
                                alt={`Wound image ${index + 1}`}
                            />
                        })}
                    </div>
                </div>
            )}
            </Form>
        </div>
    )
}

export default TreatmentSessionDetails