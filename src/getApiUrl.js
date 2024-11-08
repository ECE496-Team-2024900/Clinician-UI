const hostOptions = {
    local: "http://127.0.0.1:5000",
    production: "deployment-url"
}
export function getAPIUrl() {
    if(window.location.hostname === "localhost") {
        return hostOptions.local
    }
    return hostOptions.production
};