// Type definitions for ag-grid v9.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { RowNode } from "../entities/rowNode";
export interface StageExecuteParams {
    rowNode: RowNode;
    newRowNodes?: RowNode[];
}
export interface IRowNodeStage {
    execute(params: StageExecuteParams): any;
}
