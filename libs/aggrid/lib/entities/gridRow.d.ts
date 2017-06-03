// Type definitions for ag-grid v9.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { GridCell } from "./gridCell";
import { Column } from "./column";
export declare class GridRow {
    floating: string;
    rowIndex: number;
    constructor(rowIndex: number, floating: string);
    isFloatingTop(): boolean;
    isFloatingBottom(): boolean;
    isNotFloating(): boolean;
    equals(otherSelection: GridRow): boolean;
    toString(): string;
    getGridCell(column: Column): GridCell;
    before(otherSelection: GridRow): boolean;
}
