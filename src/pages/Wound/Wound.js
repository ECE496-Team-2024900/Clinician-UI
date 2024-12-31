import styles from "../../css/Wound.module.css";
import {getTreatmentAPIUrl} from "../../getAPIUrls/getTreatmentAPIUrl";
import {useEffect, useState} from "react";
import axios from "axios";
import {Button, Image} from "antd";
import {ArrowLeftOutlined, ArrowRightOutlined} from "@ant-design/icons";

function Wound() {
    const [wound, setWound] = useState({'id': 1}) // set to random value for now
    const [imageIndex, setImageIndex] = useState(0)
    const [vals, setVals] = useState(new Map());
    const url = `${getTreatmentAPIUrl()}/treatment/get_all_images_for_wound?wound=${wound?.id}`;
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
    }, []);

    return <div className={styles.container}>
        <h1>Wound</h1>
        <div className={styles.container2}>
            <div style={{width: "50vw"}}/>
            <div className={styles.container3}>
                <h2>Wound History</h2>
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
                <Image src={Array.from(vals.keys())[imageIndex]} width={"50vh"} height={"46vh"}/>
                <div className={styles.labelContainer}>
                    <h3>{`Image taken during treatment ${vals.get(Array.from(vals.keys())[imageIndex])}`}</h3>
                </div>
            </div>
        </div>
    </div>
}

export default Wound;
