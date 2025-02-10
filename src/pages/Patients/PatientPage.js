import React from "react";
import { useParams } from "react-router-dom";

function PatientPage() {
    const { patientId } = useParams();

    return (
        <div>
            <h1>Patient Details</h1>
            <p>This is the page for patient ID: {patientId}</p>
        </div>
    );
}

export default PatientPage;
