import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import {observer} from "mobx-react";
import ConnectService, {WalletItem} from "../../services/ConnectServiceClass";

interface WalletListItemConnectProps {
    wallet: WalletItem
}
const WalletListItemConnect = (props: WalletListItemConnectProps) => {
    return <>
        <ListItemAvatar>
            <Avatar variant="square" sx={{ bgcolor: 'transparent' }}>
                <img style={{width: '100%'}} src={props.wallet.icon} alt={props.wallet.name}/>
            </Avatar>
        </ListItemAvatar>
        <ListItemText primary={props.wallet.title} />
    </>;
}

export const WalletList = observer(() => {
    return (
        <div>
            <List sx={{ pt: 0 }}>
                {ConnectService.wallets.map((wallet) => (
                    wallet.link ?
                        <a key={wallet.name} className="no-style-a" target="_blank" href={wallet.link}><ListItem button><WalletListItemConnect wallet={wallet}/></ListItem></a>
                    :
                        <ListItem button onClick={() => ConnectService.fullConnect(wallet.name)} key={wallet.name}><WalletListItemConnect wallet={wallet}/></ListItem>
                ))}
            </List>
        </div>
    );
})