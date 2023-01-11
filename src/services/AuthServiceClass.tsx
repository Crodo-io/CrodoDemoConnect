import ConnectStore from "../stores/ConnectClass"
import base64 from 'base-64';
import ConnectService from "./ConnectServiceClass";
import ConnectError from "../errors/ConnectError";

export interface UserObject {
    address: string,
    name: string,
}

class AuthServiceClass {
    checkAuth = async () => {
        if (ConnectStore.getUser(ConnectStore.address)) {
            return true;
        } else if (this.getRefreshToken() && this.getAccessToken()) {

            //ToDo: Request to backend
            /*
            const requestOptions = {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    refresh_token: this.getRefreshToken(),
                    access_token: this.getAccessToken(),
                    address: ConnectStore.address,
                })
            };
            let response = await fetch(process.env.REACT_APP_API_URL + '/auth/check', requestOptions);
            const isJson = response.headers.get('content-type')?.includes('application/json');
            let result = isJson && await response.json();
            */

            let result:any = {
                user: {
                    address: ConnectStore.address,
                    name: 'Example',
                },
            }

            if (!result.error) {
                ConnectStore.handleSetLogin(result.user);
                return true;
            } else {
                return false;
            }

        } else {
            return false;
        }
    }

    getUniqueId = async () => {
        //ToDo: Request to backend

        /*
        const requestOptions = {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                address: ConnectStore.address,
                partner_id: this.getPartnerId(),
            })
        };
        let response = await fetch(process.env.REACT_APP_API_URL + '/auth/get_unique_id', requestOptions);
        const isJson = response.headers.get('content-type')?.includes('application/json');
        let result = isJson && await response.json();
        */

        let result:any = {
            id: 'example_id',
        };

        if (!result.error) {
            return result.id;
        } else {
            throw new ConnectError(result.error.message, result.error.code_name);
        }
    }

    addAuth = async (_signature: string) => {
        ConnectStore.handleSetConnectingProgress('add_auth');
        //ToDo: Request to backend
        /*
        const requestOptions = {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                address: ConnectStore.address,
                signature: _signature,
            })
        };
        let response = await fetch(process.env.REACT_APP_API_URL + '/auth/login', requestOptions);
        const isJson = response.headers.get('content-type')?.includes('application/json');
        let result = isJson && await response.json();
        */

        let result:any = {
            access_token: 'example',
            refresh_token: 'example',
            user: {
                address: ConnectStore.address,
                name: 'Example'
            },
        }

        if (!result.error) {
            this.setAccessToken(result.access_token);
            this.setRefreshToken(result.refresh_token);
            ConnectStore.handleSetLogin(result.user);
            return result;
        } else {
            throw new ConnectError(result.error.message, result.error.code_name);
        }
    }

    getAuthString = () => {
        return 'Basic ' + base64.encode(ConnectStore.address + ':' + this.getRefreshToken() + ':' + this.getAccessToken());
    }

    getHeaders = () => {
        return {
            'Content-Type': 'application/json',
            'Authorization': this.getAuthString()
        };
    }

    getPartnerId() {
        return (localStorage.getItem('partner') ? localStorage.getItem('partner') : null);
    }

    getRefreshToken() {
        return (localStorage.getItem('refresh_token_' + ConnectStore.address) ?? '');
    }
    getAccessToken() {
        return (localStorage.getItem('access_token_' + ConnectStore.address) ?? '');
    }

    setRefreshToken(value: string) {
        return localStorage.setItem('refresh_token_' + ConnectStore.address, value);
    }
    setAccessToken(value: string) {
        return localStorage.setItem('access_token_' + ConnectStore.address, value);
    }

    delRefreshToken() {
        return localStorage.removeItem('refresh_token_' + ConnectStore.address);
    }
    delAccessToken() {
        return localStorage.removeItem('access_token_' + ConnectStore.address);
    }

    Login = async () => {
        let id = await this.getUniqueId();
        let signature = await ConnectService.signMessage(`Sign this message for login in Crodo.io Unique id = ${id}`);
        if (signature) {
            return await this.addAuth(signature);
        }
    }

    Logout = () => {
        this.delRefreshToken();
        this.delAccessToken();
        ConnectService.setProviderName('');
        ConnectStore.handleRemoveLogin(ConnectStore.address);
    }

    constructor() {

    }
}
const AuthService = new AuthServiceClass();
export default AuthService;

export { AuthServiceClass };