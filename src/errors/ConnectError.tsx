class ConnectError extends Error {
    code_name: string;
    constructor(message: string, code_name: string = '') {
        super();
        this.message = message;
        this.code_name = code_name;
        this.name = 'ConnectError';
    }
}

export default ConnectError;