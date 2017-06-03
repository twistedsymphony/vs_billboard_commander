// Type definitions for ag-grid v9.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { ICellRendererFunc, ICellRendererComp } from "./cellRenderers/iCellRenderer";
/** Class to use a cellRenderer. */
export declare class CellRendererService {
    private cellRendererFactory;
    private context;
    /** Uses a cellRenderer, and returns the cellRenderer object if it is a class implementing ICellRenderer.
     * @cellRendererKey: The cellRenderer to use. Can be: a) a class that we call 'new' on b) a function we call
     *                   or c) a string that we use to look up the cellRenderer.
     * @params: The params to pass to the cell renderer if it's a function or a class.
     * @eTarget: The DOM element we will put the results of the html element into *
     * @return: If options a, it returns the created class instance */
    useCellRenderer(cellRendererKey: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string, eTarget: HTMLElement, params: any): ICellRendererComp;
    private checkForDeprecatedItems(cellRenderer);
    private doesImplementICellRenderer(cellRenderer);
    private lookUpCellRenderer(cellRendererKey);
}
