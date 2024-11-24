import styles from '../../css/TreatmentParameters.module.css'
import { Form, Input, Row, Checkbox, Button, Col, message, Tooltip, Image } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { getTreatmentAPIUrl } from '../../getAPIUrls/getTreatmentAPIUrl'
import { getHardwareAPIUrl } from '../../getAPIUrls/getHardwareAPIUrl'
import axios from 'axios'


function TreatmentParameters() {
    const [treatment, setTreatment] = useState({'id': 1}) // set to random value for now
    const [disableSubmit, setDisableSubmit] = useState(true)
    const [errors, setErrors] = useState({
        drugVolume: false,
        solventVolume: false,
        laserPowerLevel: false,
        delayBetweenDrugAndLight: false,
        delayBetweenLightAndSolvent: false,
        acknowledgment: true
    });
    const [fields, setFields] = useState({
        drugVolume: null,
        solventVolume: null,
        laserPowerLevel: null,
        delayBetweenDrugAndLight: null,
        delayBetweenLightAndSolvent: null,
    });
    const [prevTreatmentParameters, setPrevTreatmentParameters] = useState({
        drugVolume: null,
        solventVolume: null,
        laserPowerLevel: null,
        delayBetweenDrugAndLight: null,
        delayBetweenLightAndSolvent: null,
        imageUrls: null
    });

    const [prevForm] = Form.useForm();
    const [currForm] = Form.useForm();

    useEffect(() => {
        const getPrevTreatmentParameters = async () => {
            const today = new Date().toISOString().split('T')[0];
            const url = `${getTreatmentAPIUrl()}/treatment/parameters/prev?id=${treatment?.id}&date=${today}`;

            axios.get(url)
            .then((response) => {
                if(response.status === 200) {
                    setPrevTreatmentParameters({
                        drugVolume: response.data.drug_volume_required,
                        solventVolume: response.data.wash_volume_required,
                        laserPowerLevel: response.data.laser_power_required,
                        delayBetweenDrugAndLight: response.data.first_wait,
                        delayBetweenLightAndSolvent: response.data.second_wait,
                        imageUrls: (response.data.image_urls) ? response.data.image_urls : null
                    });
                } else if(response.status === 204) {
                    message.success("This patient has no previous treatment.")
                }
            })
            .catch(() => {
                message.error("There was an error in retrieving patient parameters.");
            });
        }
        if(treatment?.id) {
            getPrevTreatmentParameters();
        }
      }, [])

      useEffect(() => {
        prevForm.setFieldsValue(prevTreatmentParameters);
        currForm.setFieldsValue(prevTreatmentParameters);
    }, [prevTreatmentParameters]);

    const submitForm = async () => {
        setDisableSubmit(true);
        let fieldsToUpdate = {
            "drug_volume_required": Number(fields.drugVolume),
            "wash_volume_required": Number(fields.solventVolume),
            "laser_power_required": Number(fields.laserPowerLevel),
            "first_wait": Number(fields.delayBetweenDrugAndLight),
            "second_wait": Number(fields.delayBetweenLightAndSolvent)
        };

        const url = `${getTreatmentAPIUrl()}/treatment/parameters/set?id=${treatment?.id}`;
        await axios.put(url, fieldsToUpdate)
                .then((response) => {
                    if(response.status === 200) {
                        message.success("Treatment parameters set successfully. Now sending treatment approval to start treatment...");
                        axios.get(`${getHardwareAPIUrl()}/hardware/approval?id=${treatment?.id}`)
                            .then((response) => {
                                if(response.status === 200) {
                                    message.success("Treatment approval sent successfully.")
                                } else {
                                    message.error("There was an error is sending your treatment approval.")
                                }
                            })
                    } else {
                        message.error("There was an error in updating the parameters. Treatment approval not sent.");
                    }
                    setDisableSubmit(false);
                })
                .catch(() => {
                    message.error("There was an error in updating the parameters. Treatment approval not sent.");
                });
    }

    const inputNumberValidation = (_, value) => {
        if (isNaN(value) === false) {
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

    return <div className={styles.container}>
        <h2 className={styles.pageTitle}>Previous Treatment Parameters</h2>
        <Form form={prevForm}>
            <h3 className={styles.pageSubtitle}>Dosages</h3>
            <Row>
                <Col span={12}>
                    <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="drugVolume" label="Drug Volume (mL)">
                        <Input readOnly/>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="solventVolume" label="Solvent Volume (mL)">
                        <Input readOnly/>
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={12}>
                    <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="laserPowerLevel" label="Laser Power Level (W)">
                        <Input readOnly/>
                    </Form.Item>
                </Col>
            </Row>
            <h3 className={styles.pageSubtitle}>Wait Times</h3>
            <Row>
                <Col span={12}>
                    <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="delayBetweenDrugAndLight" label="Delay between Drug Administration and Light Irradiation (s)">
                        <Input readOnly/>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="delayBetweenLightAndSolvent" label="Delay between Light Irradiation and Solvent Administration (s)">
                        <Input readOnly/>
                    </Form.Item>
                </Col>
            </Row>
            <div className={styles.imageContainer}>
            {prevTreatmentParameters.imageUrls?.map((item) => {
                {console.log(item)}
                return <Image
                    className={styles.prevImage}
                    width={600}
                    src={item}
                />
            })}
            </div>
        </Form>

        <br />
        <br />
        <br />
        <br />
        <br />

        <h2 className={styles.pageTitle}>{"Current Treatment Parameters"} <Tooltip title="Current treatment parameters have been filled with the parameters used in this patient's previous treatment (if this patient had a previous treatment).">
            <InfoCircleOutlined />
        </Tooltip></h2>
  
        <Form form={currForm} onFinish={submitForm}>
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
                        <Input placeholder='Please enter the required drug volume' />
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
                        <Input placeholder='Please enter the required solvent volume' />
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
                        <Input placeholder='Please enter the required laser power level' />
                    </Form.Item>
                </Col>
            </Row>
            <h3 className={styles.pageSubtitle}>Wait Times</h3>
            <Row>
                <Col span={12}>
                    <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="delayBetweenDrugAndLight" label="Delay between Drug Administration and Light Irradiation (s)" rules={[
                            {
                                message: 'Wait time is required.',
                                validator: (_, value) => inputRequiredValidation(_, value)
                            },
                            {
                                message: 'Wait time must be a number.',
                                validator: (_, value) => inputNumberValidation(_, value)
                            }
                        ]}>
                        <Input placeholder='Please enter the required delay' />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item className={styles.inputField} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} name="delayBetweenLightAndSolvent" label="Delay between Light Irradiation and Solvent Administration (s)" rules={[
                            {
                                message: 'Wait time is required.',
                                validator: (_, value) => inputRequiredValidation(_, value)
                            },
                            {
                                message: 'Wait time must be a number.',
                                validator: (_, value) => inputNumberValidation(_, value)
                            }
                        ]}>
                        <Input placeholder='Please enter the required delay' />
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