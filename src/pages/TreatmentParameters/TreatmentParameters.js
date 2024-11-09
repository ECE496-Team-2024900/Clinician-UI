import styles from '../../css/TreatmentParameters.module.css'
import { Form, Input, Row, Checkbox, Button, Col, message } from 'antd'
import { useState, useEffect } from 'react'
import { getTreatmentAPIUrl } from '../../getAPIUrls/getTreatmentAPIUrl'
import axios from 'axios'


function TreatmentParameters() {
    const [treatment, setTreatment] = useState({'id': 1}) // set to random value for now
    const [disableSubmit, setDisableSubmit] = useState(true)
    const [errors, setErrors] = useState({
        drugVolume: true,
        solventVolume: true,
        laserPowerLevel: true,
        DelayBetweenDrugAndLight: true,
        DelayBetweenLightAndSolvent: true,
        acknowledgment: true
    });
    const [fields, setFields] = useState({
        drugVolume: null,
        solventVolume: null,
        laserPowerLevel: null,
        DelayBetweenDrugAndLight: null,
        DelayBetweenLightAndSolvent: null,
    });

    const submitForm = async () => {
        setDisableSubmit(true);
        let fieldsToUpdate = {
            "drug_volume_required": Number(fields.drugVolume),
            "wash_volume_required": Number(fields.solventVolume),
            "laser_power_required": Number(fields.laserPowerLevel),
            "first_wait": Number(fields.DelayBetweenDrugAndLight),
            "second_wait": Number(fields.DelayBetweenLightAndSolvent)
        };
        const url = `${getTreatmentAPIUrl()}/parameters/set?id=${treatment?.id}`;
        await axios.post(url, fieldsToUpdate)
                .then((response) => {
                    if(response.status == 200) {
                        message.success("Treatment parameters set successfully.");
                    } else {
                        message.error("There was an error in updating the parameters.");
                    }
                    setDisableSubmit(false);
                });
    }

    const inputNumberValidation = (_, value) => {
        if (isNaN(value) == false) {
            setFields(fields => ({
                ...fields,
                [_.field]: value,
            }))
            return Promise.resolve();
        }
        setErrors(errors => ({
            ...errors,
            [_.field]: true,
        }))
        return Promise.reject('Not a number');
    }

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
    
    const acknowledgmentValidation = (_, checked) => {
        if(checked) {
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
        return Promise.reject('Acknowledgment must be checked');
    }

    useEffect(() => {
        console.log(errors)
        if(Object.values(errors).every(error => error === false)) {
            setDisableSubmit(false);
        } else {
            setDisableSubmit(true);
        }
    }, [errors])

    return <div className = {styles.container}>
        <h2 className={styles.pageTitle}>Current Treatment Parameters</h2>
        <Form onFinish={submitForm}>
            <h3 className={styles.pageSubtitle}>Dosages</h3>
            <Row>
                <Col span={12}>
                    <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="drugVolume" label="Drug Volume (mL)" rules={[
                            {
                                message: 'Drug volume is required.',
                                validator: (_, value) => inputRequiredValidation(_, value)
                            },
                            {
                                message: 'Drug volume must be a number.',
                                validator: (_, value) => inputNumberValidation(_, value)
                            }
                        ]}>
                        <Input placeholder='Please enter the required drug volume'></Input>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="solventVolume" label="Solvent Volume (mL)" rules={[
                            {
                                message: 'Solvent volume is required.',
                                validator: (_, value) => inputRequiredValidation(_, value)
                            },
                            {
                                message: 'Solvent volume must be a number.',
                                validator: (_, value) => inputNumberValidation(_, value)
                            }
                        ]}>
                        <Input placeholder='Please enter the required solvent volume'></Input>
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={12}>
                    <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="laserPowerLevel" label="Laser Power Level (W)" rules={[
                            {
                                message: 'Laser power level is required.',
                                validator: (_, value) => inputRequiredValidation(_, value)
                            },
                            {
                                message: 'Laser power level must be a number.',
                                validator: (_, value) => inputNumberValidation(_, value)
                            }
                        ]}>
                        <Input placeholder='Please enter the required laser power level'></Input>
                    </Form.Item>
                </Col>
            </Row>
            <h3 className={styles.pageSubtitle}>Wait Times</h3>
            <Row>
                <Col span={12}>
                    <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="DelayBetweenDrugAndLight" label="Delay between Drug Administration and Light Irradiation (s)" rules={[
                            {
                                message: 'Wait time is required.',
                                validator: (_, value) => inputRequiredValidation(_, value)
                            },
                            {
                                message: 'Wait time must be a number.',
                                validator: (_, value) => inputNumberValidation(_, value)
                            }
                        ]}>
                        <Input placeholder='Please enter the required delay'></Input>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="DelayBetweenLightAndSolvent" label="Delay between Light Irradiation and Solvent Administration (s)" rules={[
                            {
                                message: 'Wait time is required.',
                                validator: (_, value) => inputRequiredValidation(_, value)
                            },
                            {
                                message: 'Wait time must be a number.',
                                validator: (_, value) => inputNumberValidation(_, value)
                            }
                        ]}>
                        <Input placeholder='Please enter the required delay'></Input>
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Form.Item className={styles.acknowledgment} name="acknowledgment" valuePropName="checked" rules={[
                        {
                            message: 'Checking this acknowledgment is required.',
                            validator: (_, checked) => acknowledgmentValidation(_, checked)
                        }
                    ]}>
                    <Checkbox className={styles.acknowledgmentText}> I understand that clicking the button below indicates my approval for this treatment. Once I click it, the parameters for this treatment cannot be changed and the treatment will begin.</Checkbox>
                </Form.Item>
            </Row>
            <Button disabled={disableSubmit} className={styles.startTreatmentBtn} id="report-submit-btn" type="primary" htmlType="submit" block>Start Treatment</Button>
        </Form>
    </div>
}

export default TreatmentParameters;