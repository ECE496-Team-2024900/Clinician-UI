import styles from "../../css/Wound.module.css";
import {getTreatmentAPIUrl} from "../../getAPIUrls/getTreatmentAPIUrl";
import {useEffect, useState} from "react";
import axios from "axios";
import {Button, Col, Form, Image, Input, Row} from "antd";
import {ArrowLeftOutlined, ArrowRightOutlined} from "@ant-design/icons";

function Wound() {
    const [woundId, setWoundId] = useState(1)
    const [wound, setWound] = useState(undefined)
    const [prevForm] = Form.useForm();
    const [imageIndex, setImageIndex] = useState(0)
    const [vals, setVals] = useState(new Map());
    const url = `${getTreatmentAPIUrl()}/treatment/get_all_images_for_wound?wound=${woundId}`;
    const woundUrl = `${getTreatmentAPIUrl()}/treatment/get_wound?id=${woundId}`;
    useEffect( () => {
         axios.get(url).then((response) => {
             if (response.status === 200) {
                 const newVals = new Map(vals)
                 response.data.message.forEach(val => {
                    val.image_urls.forEach(url => {
                        newVals.set(url, val.id)
                    })
                })
                 setVals(newVals)
            }
        })
        axios.get(woundUrl).then((response)=> {
            if (response.status === 200) {
                console.log(response.data.message)
                setWound(response.data.message)
            }
        })
    }, []);

    return <div className={styles.container}>
        <h1>Wound</h1>
        <div className={styles.container2}>
            <div className={styles.fieldsContainer}>
                <div className={styles.fieldContainer}>
                    <h3>Wound ID</h3>
                    {wound !== undefined && <Input disabled defaultValue={wound?.id}/>}
                    <h3>Date Added</h3>
                    {wound !== undefined && <Input disabled defaultValue={wound?.date_added}/>}
                    <h3>Device ID</h3>
                    {wound !== undefined && <Input disabled defaultValue={wound?.device_id}/>}
                </div>
                <div className={styles.fieldContainer}>
                    <h3>Infection Type</h3>
                    {wound !== undefined && <Input disabled defaultValue={wound?.infection_type}/>}
                    <h3>Infection Location</h3>
                    {wound !== undefined && <Input disabled defaultValue={wound?.infection_location}/>}
                    <h3>Wound Completely Treated</h3>
                    {wound !== undefined && <Input disabled defaultValue={wound?.treated === true ? "Yes" : "No"}/>}
                </div>
            </div>
            <div className={styles.container3}>
                <h3>Wound History</h3>
                <div className={styles.arrowContainer}>
                    <Button
                        shape={"circle"}
                        disabled={imageIndex === 0}
                        onClick={() => setImageIndex(imageIndex-1)}
                        style={{background: "#004AAD"}}
                        icon={<ArrowLeftOutlined style={{color: "white"}}/>}
                    />
                    <Button
                        shape={"circle"}
                        disabled={imageIndex === vals.size-1}
                        onClick={() => setImageIndex(imageIndex+1)}
                        style={{background: "#004AAD"}}
                        icon={<ArrowRightOutlined style={{color: "white"}}/>}
                    />
                </div>
                <div className={styles.imageContainer}>
                    <Image src={Array.from(vals.keys())[imageIndex]} width={"25vh"} height={"25vh"}/>
                    <div className={styles.labelContainer}>
                        <p>{`Image taken during treatment ${vals.get(Array.from(vals.keys())[imageIndex])}`}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
}

export default Wound;
