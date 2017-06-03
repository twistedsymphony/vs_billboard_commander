// Type definitions for ag-grid v9.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
export declare class BorderLayout {
    private static TEMPLATE_FULL_HEIGHT;
    private static TEMPLATE_NORMAL;
    private static TEMPLATE_DONT_FILL;
    private eNorthWrapper;
    private eSouthWrapper;
    private eEastWrapper;
    private eWestWrapper;
    private eCenterWrapper;
    private eOverlayWrapper;
    private eCenterRow;
    private eNorthChildLayout;
    private eSouthChildLayout;
    private eEastChildLayout;
    private eWestChildLayout;
    private eCenterChildLayout;
    private isLayoutPanel;
    private fullHeight;
    private layoutActive;
    private eGui;
    private id;
    private childPanels;
    private centerHeightLastTime;
    private centerWidthLastTime;
    private centerLeftMarginLastTime;
    private visibleLastTime;
    private sizeChangeListeners;
    private overlays;
    constructor(params: any);
    addSizeChangeListener(listener: Function): void;
    fireSizeChanged(): void;
    private setupPanels(params);
    private setupPanel(content, ePanel);
    getGui(): HTMLElement;
    doLayout(): boolean;
    private layoutChild(childPanel);
    private layoutHeight();
    private layoutHeightFullHeight();
    private layoutHeightNormal();
    getCentreHeight(): number;
    private layoutWidth();
    setEastVisible(visible: any): void;
    private setupOverlays();
    hideOverlay(): void;
    showOverlay(key: string): void;
}
