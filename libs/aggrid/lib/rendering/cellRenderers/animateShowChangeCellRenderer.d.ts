// Type definitions for ag-grid v9.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { ICellRenderer } from "./iCellRenderer";
import { Component } from "../../widgets/component";
export declare class AnimateShowChangeCellRenderer extends Component implements ICellRenderer {
    private static TEMPLATE;
    private params;
    private lastValue;
    private eValue;
    private eDelta;
    private refreshCount;
    constructor();
    init(params: any): void;
    private showDelta(params, delta);
    private setTimerToRemoveDelta();
    private hideDeltaValue();
    refresh(params: any): void;
}
