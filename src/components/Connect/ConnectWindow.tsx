import * as React from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import {observer} from "mobx-react";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import ConnectStore from "../../stores/ConnectClass";
import {WalletConnect} from "./WalletConnect";
import {WalletList} from "./WalletList";
import {IconButton} from "@mui/material";
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

export const ConnectWindow = observer(() => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const backToWallets = () => {
        ConnectStore.handleSetConnecting(false)
        ConnectStore.handleCloseConnectingError();
    }
    return (
        <Dialog fullScreen={fullScreen} onClose={ConnectStore.handleCloseWindow} open={ConnectStore.openWindow}>
            <DialogTitle style={{minWidth: 330}} className="d-flex align-items-center">
                {ConnectStore.connecting || ConnectStore.connectingMessage.open ?
                    <IconButton onClick={backToWallets} className="mr-3 flex-grow-0 flex-shrink-0" aria-label="Back">
                        <ArrowBackIosRoundedIcon/>
                    </IconButton>
                    :
                    ''
                }
                <div className="flex-grow-1 mr-3">
                    Connecting wallet
                </div>
                <IconButton
                    className="flex-grow-0 flex-shrink-0"
                    aria-label="close"
                    onClick={ConnectStore.handleCloseWindow}
                >
                    <CloseRoundedIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                {ConnectStore.connecting || ConnectStore.connectingMessage.open ?
                    <WalletConnect/>
                    :
                    <WalletList/>
                }
            </DialogContent>
        </Dialog>
    );
})