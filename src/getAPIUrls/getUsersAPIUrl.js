import { clientHost } from "./clientHost.js";

const hostOptions = {
    local: "http://127.0.0.1:8002",
    production: "https://user-cyt8.onrender.com"
}
export function getUsersAPIUrl() {
    if(clientHost !== "production") {
        return hostOptions.local
    }
    return hostOptions.production
};