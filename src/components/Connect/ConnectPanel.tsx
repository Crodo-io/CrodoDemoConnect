import React from "react";
import {observer} from "mobx-react";
import Button from "@mui/material/Button";
import ConnectService from "../../services/ConnectServiceClass";
import ConnectStore from "../../stores/ConnectClass";
import AuthService from "../../services/AuthServiceClass";

export const ConnectPanel = observer(() => {
    const openWindow = () => {
        ConnectService.fullConnect().then();
    }
    let not_login = (ConnectStore.check_auth || !ConnectStore.connected || ConnectStore.warning_change_network || !ConnectStore.user[ConnectStore.address]);
    return <div className="py-4">
        <h2 className="pb-4">This is a demonstration of connecting wallets to the Cronos Network</h2>
        {not_login ?
            <Button variant="contained" onClick={openWindow}>{ConnectStore.getConnectButtonTitle()}</Button>
            :
            <div>
                <div className="mb-4">Connected to {ConnectStore.address}</div>
                <Button variant="contained" onClick={AuthService.Logout}>Logout</Button>
            </div>
        }
    </div>;
});