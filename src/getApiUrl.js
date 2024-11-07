const hostOptions = {
    local: "http://127.0.0.1:5000",
    production: "https://backend-services-and-db.onrender.com"
}
export function getAPIUrl() {
    if(window.location.hostname === "localhost") {
        return hostOptions.local
    }
    return hostOptions.production
};