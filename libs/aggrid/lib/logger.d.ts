// Type definitions for ag-grid v9.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
export declare class LoggerFactory {
    private logging;
    private setBeans(gridOptionsWrapper);
    create(name: string): Logger;
}
export declare class Logger {
    private logging;
    private name;
    constructor(name: string, logging: boolean);
    log(message: string): void;
}
