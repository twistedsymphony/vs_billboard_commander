// Type definitions for ag-grid v9.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { RowNode } from "../entities/rowNode";
export declare class FloatingRowModel {
    private gridOptionsWrapper;
    private eventService;
    private context;
    private floatingTopRows;
    private floatingBottomRows;
    init(): void;
    isEmpty(floating: string): boolean;
    isRowsToRender(floating: string): boolean;
    getRowAtPixel(pixel: number, floating: string): number;
    setFloatingTopRowData(rowData: any[]): void;
    setFloatingBottomRowData(rowData: any[]): void;
    private createNodesFromData(allData, isTop);
    getFloatingTopRowData(): RowNode[];
    getFloatingBottomRowData(): RowNode[];
    getFloatingTopTotalHeight(): number;
    getFloatingTopRowCount(): number;
    getFloatingBottomRowCount(): number;
    getFloatingTopRow(index: number): RowNode;
    getFloatingBottomRow(index: number): RowNode;
    forEachFloatingTopRow(callback: (rowNode: RowNode, index: number) => void): void;
    forEachFloatingBottomRow(callback: (rowNode: RowNode, index: number) => void): void;
    getFloatingBottomTotalHeight(): number;
    private getTotalHeight(rowNodes);
}
