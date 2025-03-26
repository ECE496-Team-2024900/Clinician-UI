import clientHost from "./clientHost" 

const hostOptions = {
    local: "http://127.0.0.1:8002",
    production: "https://user-cyt8.onrender.com"
}
export function getUsersAPIUrl() {
    if(clientHost !== "localhost") {
        return hostOptions.local
    }
    return hostOptions.production
};