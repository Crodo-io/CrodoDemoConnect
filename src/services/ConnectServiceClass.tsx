import {DeFiWeb3Connector} from "deficonnect";
import WalletConnectProvider from "@walletconnect/ethereum-provider";
import ConnectStore from "../stores/ConnectClass";
import metamask_icon from "../assets/images/wallets/metamask.svg";
import defi_wallet_icon from "../assets/images/wallets/defi_wallet.svg";
import pc_wallet_icon from "../assets/images/wallets/pc_wallet.svg";
import wallet_connect_icon from "../assets/images/wallets/wallet_connect.svg";
import Web3 from "web3";
import ConnectError from "../errors/ConnectError";
import AuthService from "./AuthServiceClass";

declare let window: any;

export interface NetworkItem {
    name: string,
    chain_id: number,
    tokenName: string,
    symbol: string,
    decimals: number,
    rpcUrls: Array<string>,
    blockExplorerUrls: Array<string>,
}

export interface Network {
    testnet: NetworkItem,
    mainnet: NetworkItem;
}

export interface WalletItem {
    name: string,
    title: string,
    icon: string,
    link: string,
}

class ConnectServiceClass {
    provider: any;

    web3: Web3 | undefined;

    chain: keyof Network = 'mainnet';

    networks: Network = {
        testnet: {
            name: 'Cronos testnet 3',
            chain_id: 338,
            tokenName: 'Tectonic CRO',
            symbol: 'TCRO',
            decimals: 18,
            rpcUrls: ['https://evm-t3.cronos.org/'],
            blockExplorerUrls: ['https://cronos.org/explorer/testnet3 '],
        },
        mainnet: {
            name: 'Cronos',
            chain_id: 25,
            tokenName: 'CRO',
            symbol: 'CRO',
            decimals: 18,
            rpcUrls: ['https://evm.cronos.org'],
            blockExplorerUrls: ['https://cronos.org/explorer/'],
        }
    }

    wallets: Array<WalletItem> = [
        {
            name: 'metamask',
            title: 'Metamask',
            icon: metamask_icon,
            link: '',
        },
        {
            name: 'defi_wallet',
            title: 'DeFi Wallet',
            icon: defi_wallet_icon,
            link: '',
        },
        {
            name: 'desktop_wallet',
            title: 'Desktop Wallet',
            icon: pc_wallet_icon,
            link: 'https://crypto.org/desktopwallet',
        },
        {
            name: 'wallet_connect',
            title: 'Wallet connect',
            icon: wallet_connect_icon,
            link: '',
        }
    ];



    /**
     * Getting the object of the selected wallet
     */
    getProvider = () => {
        return this.wallets.find(item => item.name === this.getProviderName());
    }

    getProviderTitle = () => {
        let wallet = this.getProvider();
        return wallet ? wallet.title : 'Not found';
    }

    /**
     * Receiving the selected wallet
     */
    getProviderName() {
        return localStorage.getItem('provider_name');
    }

    /**
     * Remembering the selected wallet
     * @param name Wallet name
     */
    setProviderName = (name: string) => {
        ConnectStore.handleSelectWallet(name);
        return localStorage.setItem('provider_name', name);
    }

    constructor() {
        if (navigator.userAgent.toLowerCase().indexOf('defiwallet') >= 0) {
            this.connectProvider('defi_wallet', false).then();
        } else if (window.ethereum && window.ethereum.isDesktopWallet) {
            this.connectProvider('pc_wallet', false).then();
        } else {
            switch (this.getProviderName()) {
                case 'defi_wallet':
                    this.connectProvider('defi_wallet', true).then();
                    break;
                case 'pc_wallet':
                    this.connectProvider('pc_wallet', true).then();
                    break;
                case 'wallet_connect':
                    this.connectProvider('wallet_connect', true).then();
                    break;
                default:
                    if (window.ethereum) {
                        this.connectProvider('metamask', true).then();
                    } else {
                        ConnectStore.handleChangeCheckAuth(false);
                    }
                    break;
            }
        }
    }

    /**
     * Connect to wallet
     * @param name Wallet name
     * @param load true if connect after page load
     */
    connectProvider = async (name: string, load = false) => {
        ConnectStore.handleSetConnecting(true);
        //If the wallet is selected by the user, remember the choice
        if (!load)
            this.setProviderName(name);

        let network = this.networks[this.chain];

        switch (name) {
            case 'defi_wallet':
                //Since the connection is lost when the page is refreshed - reset the selected wallet
                if (load)
                    this.setProviderName('');

                let connector = new DeFiWeb3Connector({
                    supportedChainIds: [network.chain_id],
                    rpc: {
                        [network.chain_id]: network.rpcUrls[0],
                    },
                    pollingInterval: 15000,
                });

                try {
                    await connector.activate();
                    this.provider = await connector.getProvider();
                } catch (e: any) {
                    //If connection error - reset the selected wallet
                    if (!load)
                        this.setProviderName('');
                    throw new ConnectError(e.message);
                }
                break;
            case 'wallet_connect':
                //Since the connection is lost when the page is refreshed - reset the selected wallet
                if (load)
                    this.setProviderName('');

                //Hack due to problems in the previous session
                localStorage.removeItem('walletconnect');

                this.provider = new WalletConnectProvider({
                    rpc: {
                        [network.chain_id]: network.rpcUrls[0],
                    },
                    chainId: network.chain_id,
                    qrcodeModalOptions: {
                        mobileLinks: [],
                        desktopLinks: [],
                    },
                });
                try {
                    await this.provider.enable();
                } catch (e: any) {
                    //If connection error - reset the selected wallet
                    if (!load)
                        this.setProviderName('');
                    throw new ConnectError(e.message);
                }
                break;
            case 'pc_wallet':
                this.provider = window.ethereum;
                break;
            default:
                //If the user uses multiple wallets, metamask is the priority
                if (window.ethereum.isMetaMask) {
                    this.provider = window.ethereum;
                } else {
                    this.provider = (window.web3 ? window.web3.currentProvider : window.ethereum);
                }
        }

        if (this.provider) {
            this.web3 = new Web3(this.provider);
            this.provider.on('connect', this.onConnect);
            this.provider.on('chainChanged', this.onChainChanged);
            this.provider.on('accountsChanged', this.onAccountsChanged);
            this.provider.on('disconnect', this.onDisconnect);
            await this.getAccount();
        }
    }

    /**
     * Execute eth_accounts
     */
    getAccount = async () => {
        // If wallet is pc_wallet then immediately connect
        if (this.getProviderName() === 'pc_wallet' &&  this.provider.isDesktopWallet) {
            await this.requestAccount();
        } else {
            try {
                await this.provider.request({
                    method: 'eth_accounts',
                });
                await this.onAccountsChanged();
            } catch (error: any) {
                console.error('getAccount', error);
                this.onDisconnect();
            } finally {
                ConnectStore.handleChangeCheckAuth(false);
            }
        }
    }

    /**
     * Execute eth_requestAccounts
     */
    requestAccount = async () => {
        try {
            await this.provider.request({method: 'eth_requestAccounts'});
            await this.onAccountsChanged();
        } catch (error: any) {
            if (error.code === -32002) { //If window already open
                throw new ConnectError('Please, open ' + this.getProviderTitle() + ' window and confirm connection', 'opened_window');
            } else {
                this.onDisconnect();
                let msg;
                switch (error.code) {
                    case 4001:
                        msg = 'You rejected confirm';
                        break;
                    default:
                        msg = error.message;
                }
                throw new ConnectError(msg);
            }
        }
    }

    /**
     * Sign message for login
     * @param message
     */
    signMessage = async (message: string) => {
        if (this.web3) {
            return await this.web3.eth.personal.sign(
                message,
                ConnectStore.address,
                ''
            );
        } else {
            console.error('signMessage', 'this.web3 dont exist');
        }
    }

    /**
     * Add network
     */
    addChain = async () => {
        ConnectStore.handleSetConnectingProgress('adding_network');
        try {
            await this.provider.request({
                method: "wallet_addEthereumChain",
                params: [
                    {
                        chainId: '0x' + this.networks[this.chain].chain_id.toString(16),
                        chainName: this.networks[this.chain].name,
                        nativeCurrency: {
                            name: this.networks[this.chain].tokenName,
                            symbol: this.networks[this.chain].symbol,
                            decimals: this.networks[this.chain].decimals,
                        },
                        rpcUrls: this.networks[this.chain].rpcUrls,
                        blockExplorerUrls: this.networks[this.chain].blockExplorerUrls,
                    },
                ],
            });
        } catch (error: any) {
            if (error.code === -32002) {
                throw new ConnectError('Please, open ' + this.getProviderTitle() + ' window and confirm add network', 'opened_window');
            } else {
                throw new ConnectError('Error: ' + error.code + ' ' + error.message);
            }
        }
    }

    /**
     * Try to change network
     */
    changeNetwork = async () => {
        ConnectStore.handleSetConnectingProgress('changing_network');
        try {
            await this.provider.request({
                method: "wallet_switchEthereumChain",
                params: [
                    {
                        chainId: '0x' + this.networks[this.chain].chain_id.toString(16),
                    },
                ],
            });
        } catch (error: any) {
            console.error(error.code, error);
            if (error.code === -32002) { //If window already open
                throw new ConnectError('Please, open ' + this.getProviderTitle() + ' window and confirm change network', 'opened_window');
            } else if ((error.code === 4902) || (error.code === -32603)) {
                await this.addChain();
            } else {
                throw new ConnectError('Error: ' + error.code + ' ' + error.message);
            }
        }
    }

    /**
     * Main connect function
     * @param wallet if exist - connect to wallet
     */
    fullConnect = async (wallet: string = '') => {
        ConnectStore.handleCloseConnectingError();
        if (navigator.userAgent.toLowerCase().indexOf('defiwallet') >= 0) {
            wallet = 'defi_wallet';
        } else if (window.ethereum && window.ethereum.isDesktopWallet) {
            wallet = 'pc_wallet';
        }
        if (wallet) {
            try {
                ConnectStore.handleSetConnectingProgress('connecting');
                if ((wallet === 'defi_wallet') && (!window.ethereum || !window.ethereum.isWalletConnect)) {
                    ConnectStore.handleCloseWindow();
                }
                await this.connectProvider(wallet, false);
                switch (wallet) {
                    case 'defi_wallet':
                        //await this.provider.enable();
                        break;
                    default:
                        await this.requestAccount();
                }
                this.compareNetwork();
                if (ConnectStore.warning_change_network) {
                    await this.changeNetwork();
                }

                ConnectStore.handleSetConnectingProgress('check_auth');
                let auth = await AuthService.checkAuth();

                if (!auth) {
                    ConnectStore.handleSetConnectingProgress('confirm_auth');
                    await AuthService.Login();
                }

                ConnectStore.handleCloseWindow();
            } catch (error: any) {
                if (error.name === 'ConnectError') {
                    if (error.code_name === 'opened_window') {
                        ConnectStore.handleOpenConnectingError(error.message, 'warning')
                    } else {
                        ConnectStore.handleOpenConnectingError(error.message, 'error');
                    }
                } else {
                    ConnectStore.handleOpenConnectingError('Error: ' + error.message, 'error');
                }
            }
        } else {
            ConnectStore.handleOpenWindow();
        }
    }

    /**
     * Compare chain id
     */
    compareNetwork = () => {
        let chain_id = this.provider.chainId;
        if (this.networks[this.chain].chain_id === parseInt(chain_id)) {
            ConnectStore.handleWarningChangeNetwork(false);
        } else {
            ConnectStore.handleWarningChangeNetwork(true);
        }
    }

    /* Events */
    onConnect = async (data: object) => {
        await this.getAccount();
    }

    onChainChanged = () => {
        this.compareNetwork();
    }

    onAccountsChanged = async () => {
        if (this.web3) {
            let accounts = await this.web3.eth.getAccounts();
            ConnectStore.handleChangeCheckAuth(false);
            if (accounts.length > 0) {
                ConnectStore.handleSetAddress(accounts[0]);
                await AuthService.checkAuth();
                this.onChainChanged();
                ConnectStore.handleConnect();
            }
        } else {
            console.error('onAccountsChanged', 'this.web3 is undefined');
        }
    }

    onDisconnect = () => {
        ConnectStore.handleDisconnect();
    }
    /* End events */
}
const ConnectService = new ConnectServiceClass();
export default ConnectService;
export { ConnectServiceClass };