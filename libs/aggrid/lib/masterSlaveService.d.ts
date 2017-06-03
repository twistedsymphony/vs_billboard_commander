// Type definitions for ag-grid v9.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { ColumnChangeEvent } from "./columnChangeEvent";
import { Column } from "./entities/column";
export declare class MasterSlaveService {
    private gridOptionsWrapper;
    private columnController;
    private gridPanel;
    private eventService;
    private logger;
    private consuming;
    private setBeans(loggerFactory);
    init(): void;
    private fireEvent(callback);
    private onEvent(callback);
    private fireColumnEvent(event);
    fireHorizontalScrollEvent(horizontalScroll: number): void;
    onScrollEvent(horizontalScroll: number): void;
    getMasterColumns(event: ColumnChangeEvent): Column[];
    getColumnIds(event: ColumnChangeEvent): string[];
    onColumnEvent(event: ColumnChangeEvent): void;
}
