// Type definitions for ag-grid v9.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Component } from "../../widgets/component";
import { ICellEditorComp } from "./iCellEditor";
export declare class SelectCellEditor extends Component implements ICellEditorComp {
    private focusAfterAttached;
    private eSelect;
    constructor();
    init(params: any): void;
    afterGuiAttached(): void;
    focusIn(): void;
    getValue(): any;
}
