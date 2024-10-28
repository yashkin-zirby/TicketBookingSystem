const Location = {
    getPath(){
        return window.location.href.replace(window.location.protocol + "//" + window.location.host, "");
    },
    getFullHost() {
        return window.location.protocol + "//" + window.location.host;
    },
}
export default Location;