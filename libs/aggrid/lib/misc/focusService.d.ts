// Type definitions for ag-grid v9.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
/** THIS IS NOT USED - it was something Niall was working on, but doesn't work well with popup editors */
export declare class FocusService {
    private gridCore;
    private columnController;
    private destroyMethods;
    private listeners;
    addListener(listener: (focusEvent: FocusEvent) => void): void;
    removeListener(listener: (focusEvent: FocusEvent) => void): void;
    private init();
    private onFocus(focusEvent);
    private getCellForFocus(focusEvent);
    private informListeners(event);
    private destroy();
}
