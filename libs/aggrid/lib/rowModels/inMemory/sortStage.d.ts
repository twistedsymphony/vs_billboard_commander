// Type definitions for ag-grid v9.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { StageExecuteParams } from "../../interfaces/iRowNodeStage";
export declare class SortStage {
    private gridOptionsWrapper;
    private sortService;
    execute(params: StageExecuteParams): void;
}
