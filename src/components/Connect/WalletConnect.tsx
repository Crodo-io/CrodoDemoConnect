import * as React from 'react';
import {observer} from "mobx-react";
import {Alert, Button, CircularProgress} from "@mui/material";
import ConnectStore from "../../stores/ConnectClass";
import ConnectService from "../../services/ConnectServiceClass";

export const WalletConnect = observer(() => {
    let wallet = ConnectService.wallets.find(item => item.name === ConnectStore.selectedWallet);
    return (
        <div className="text-center py-4">
            <div className="mb-4">

                {(() => {
                    switch(ConnectStore.connectingProgress) {
                        case 'connecting':
                            return <div>
                                <h6>
                                    {ConnectStore.connectingMessage.open ?
                                        'Connect wallet'
                                        :
                                        `Please, confirm in ${ConnectService.getProviderTitle()} window`
                                    }
                                </h6>
                                {ConnectStore.check_auth ? <Alert icon={false} severity="warning" className="mt-3">
                                    <div className="mb-2">If you don't see the {ConnectService.getProviderTitle()} window, then</div>
                                    <Button onClick={() => { window.location.reload(); }} >Reload this page</Button>
                                </Alert> : ''}
                            </div>;
                        case 'changing_network':
                            return <h6>Changing network</h6>;
                        case 'adding_network':
                            return <h6>Please, confirm to add Cronos network in {ConnectService.getProviderTitle()} window</h6>;
                        case 'check_auth':
                            return <h6>Authorization check ...</h6>;
                        case 'confirm_auth':
                            return <h6>Please, confirm login in {ConnectService.getProviderTitle()} window</h6>;
                        case 'add_auth':
                            return <h6>Authorization ...</h6>;
                    }
                })()}
            </div>
            {wallet ?
                <div className="mb-4"><img style={{width: 48}} src={wallet.icon} alt={wallet.name}/></div>
                :
                ''
            }
            {ConnectStore.connectingMessage.open ?
                <Alert severity={ConnectStore.connectingMessage.type}>{ConnectStore.connectingMessage.text}</Alert>
                :
                <CircularProgress size={32} color="inherit"/>
            }
        </div>
    );
})