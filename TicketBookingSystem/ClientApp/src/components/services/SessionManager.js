const SessionManager = {
    permissions : {
        can_add_concert : "Permissions.CanAddConcert",
        can_add_promocode : "Permissions.CanAddPromocode",
        can_use_manager_panel : "Permissions.CanUseManagerPanel"
    },
    checkPermission(permission){
        var claims = JSON.parse(sessionStorage.getItem("userClaims"));
        if(claims == null || claims.findIndex(n=>n===permission) < 0)return false;
        return true;
    },
    setUserProfileImage(imagePath) {
        return sessionStorage.setItem("imagePath", imagePath);
    },
    getUserProfileImage() {
        return sessionStorage.getItem("imagePath");
    },
    getUserEmail() {
        return sessionStorage.getItem("email");
    },
    getUserName() {
        return sessionStorage.getItem("userName");
    },
    hasUserSession() {
        return sessionStorage.getItem("userName") != null;
    },
    setUserSession(user) {
        sessionStorage.setItem('userName', user.username);
        sessionStorage.setItem('imagePath', user.imagePath);
        sessionStorage.setItem('email', user.email);
        sessionStorage.setItem('userClaims', JSON.stringify(user.claims));
    },
    checkAuth() {
        return this.sendRequest("/users/Claims", "GET");
    },

    removeUserSession(){
        sessionStorage.removeItem('userName');
        sessionStorage.removeItem('imagePath');
        sessionStorage.removeItem('email');
        sessionStorage.removeItem('userClaims');
    },
    loginWithGoogle() {
        let payload = {
            method: "POST",
            redirect: 'follow',
            headers: {
                mode: 'no-cors',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        }
        return fetch("/users/GoogleLogin", payload)
            .then(function (response) {
                if (!response.ok)
                    throw Error(response.statusText);
                return response.json();
            }).then(function (result) {
                return result;
            }).catch(function (error) {
                console.log(error);
            });
    },
    replaceHttpSymbols(queryString) {
        return queryString.toString().replaceAll("%", "%25")
            .replaceAll("\n","%0A")
            .replaceAll(" ", "%20")
            .replaceAll("!", "%21")
            .replaceAll("\"", "%22")
            .replaceAll("#", "%23")
            .replaceAll("$", "%24")
            .replaceAll("&", "%26")
            .replaceAll("'", "%27")
            .replaceAll("(", "%28")
            .replaceAll(")", "%29")
            .replaceAll("+", "%2B")
            .replaceAll(",", "%2C")
            .replaceAll("/", "%2F")
            .replaceAll(":", "%3A")
            .replaceAll(";", "%3B")
            .replaceAll("<", "%3C")
            .replaceAll("=", "%3D")
            .replaceAll(">", "%3E")
            .replaceAll("?", "%3F")
            .replaceAll("@", "%40")
            .replaceAll("[", "%5B")
            .replaceAll("\\", "%5C")
            .replaceAll("]", "%5D")
            .replaceAll("^", "%5E")
            .replaceAll("`", "%60")
            .replaceAll("{", "%7B")
            .replaceAll("|", "%7C")
            .replaceAll("}", "%7D")
            .replaceAll("~", "%7E");
    },
    sendRequest(endPoint, method, bodyObj = null, ...params){
        if (params.length > 0 && params[0] != null) {
            endPoint += "?";
            for (let param of params) {
                if (param == null) continue;
                for (let key in param) {
                    if (param[key] == null || param[key].length === 0) continue;
                    if (!endPoint.endsWith("?")) endPoint += "&";
                       endPoint += key + "=" + this.replaceHttpSymbols(param[key]);
                }
            }
        }
        let payload = {
        method: method,
          headers: {
            "access-control-allow-origin" : "*",
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
        if (bodyObj) {
            if (bodyObj instanceof FormData) {
                payload = {
                    method: method,
                    body: bodyObj
                }
            } else
                payload["body"] = JSON.stringify(bodyObj);
        }
        return fetch(endPoint, payload)
            .then(function(response) {
            if (!response.ok)
                throw Error(response.statusText);
            return response.json();
        }).then(function(result) {
            return result;
        }).catch(function(error) {
            console.log(error);
        });
    }
}

export default SessionManager;