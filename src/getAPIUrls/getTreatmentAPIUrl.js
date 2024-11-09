const hostOptions = {
    local: "http://127.0.0.1:8000",
    production: "https://3.21.241.51/"
} 
export function getTreatmentAPIUrl() {   
    if(window.location.hostname === "localhost") {
        return hostOptions.local
    }
    return hostOptions.production
};