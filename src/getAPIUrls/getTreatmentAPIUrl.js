import { clientHost } from "./clientHost.js";

const hostOptions = {
    local: "http://127.0.0.1:8000",
    production: "https://treatment-t0m8.onrender.com"
} 
export function getTreatmentAPIUrl() {
    if(clientHost !== "production") {
        return hostOptions.local
    }
    return hostOptions.production
};