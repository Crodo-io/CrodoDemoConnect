import {makeAutoObservable} from 'mobx';
import {AlertColor} from "@mui/material";
import {UserObject} from "../services/AuthServiceClass";

interface ConnectingMessage {
    open: boolean,
    type: AlertColor | undefined,
    text: string,
}
class ConnectClass {
    selectedWallet = '';

    openWindow = false;

    address = '';

    warning_change_network = false;

    connecting = false;

    connected = false;

    connectingProgress = '';

    connectingMessage: ConnectingMessage = {open: false, type: undefined, text: ''};

    check_auth = true;

    user: any = {};

    constructor() {
        makeAutoObservable(this);
    }

    handleSelectWallet = (name: string) => {
        this.selectedWallet = name;
    }

    handleOpenWindow = () => {
        this.handleSetConnecting(false);
        this.handleCloseConnectingError();
        this.openWindow = true;
    }

    handleCloseWindow = () => {
        this.openWindow = false;
    }

    handleSetConnectingProgress = (value: string) => {
        this.connectingProgress = value;
    }

    handleWarningChangeNetwork = (flag: boolean) => {
        this.warning_change_network = flag;
    }

    handleSetAddress = (address: string) => {
        this.address = address.toLowerCase();
    }

    handleConnect = () => {
        this.connected = true;
    }

    handleDisconnect = () => {
        console.log('handleDisconnect');
        this.connected = false;
        this.connecting = false;
        this.address = '';
    }

    /**
     * Set false after page load and checking auth
     * @param flag
     */
    handleChangeCheckAuth = (flag: boolean) => {
        this.check_auth = flag;
    }

    handleSetConnecting = (flag: boolean) => {
        this.connecting = flag;
    }

    handleCloseConnectingError = () => {
        this.connectingMessage.open = false;
    }

    handleOpenConnectingError = (text: string, type: AlertColor) => {
        this.connectingMessage = {
            open: true,
            text: text,
            type: type,
        }
    }

    handleRemoveLogin = (address: string) => {
        address = address.toLowerCase();
        if (this.user[address]) {
            delete this.user[address];
        }
    }

    handleSetLogin = (user: UserObject) => {
        this.user[user.address] = user;
    }

    getUser = (address: string) => {
        return (this.user[address] ? this.user[address] : false);
    }

    getConnectButtonTitle = () => {
        return this.connected ?
            this.warning_change_network ?
                'Change network'
                :
                this.user[this.address] ?
                    'Connected'
                    :
                    'Sign in'
            :
            'Connect wallet';
    }
}

const ConnectStore = new ConnectClass();
export default ConnectStore;
export { ConnectClass };