import clientHost from "./clientHost" 

const hostOptions = {
    local: "http://127.0.0.1:8001",
    production: "https://hardware-comm.onrender.com"
} 
export function getHardwareAPIUrl() {   
    if(clientHost !== "production") {
        return hostOptions.local
    }
    return hostOptions.production
};