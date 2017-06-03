// Type definitions for ag-grid v9.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { IFilterParams, IDoesFilterPassParams, SerializedFilter } from "../interfaces/iFilter";
import { ComparableBaseFilter } from "./baseFilter";
export interface SerializedTextFilter extends SerializedFilter {
    filter: string;
    type: string;
}
export interface TextComparator {
    (filter: string, gridValue: any, filterText: string): boolean;
}
export interface ITextFilterParams extends IFilterParams {
    textCustomComparator?: TextComparator;
}
export declare class TextFilter extends ComparableBaseFilter<string, ITextFilterParams, SerializedTextFilter> {
    private eFilterTextField;
    private filterText;
    private comparator;
    static DEFAULT_COMPARATOR: TextComparator;
    customInit(): void;
    modelFromFloatingFilter(from: string): SerializedTextFilter;
    getApplicableFilterTypes(): string[];
    bodyTemplate(): string;
    initialiseFilterBodyUi(): void;
    refreshFilterBodyUi(): void;
    afterGuiAttached(): void;
    filterValues(): string;
    doesFilterPass(params: IDoesFilterPassParams): boolean;
    private onFilterTextFieldChanged();
    setFilter(filter: string): void;
    getFilter(): string;
    resetState(): void;
    serialize(): SerializedTextFilter;
    parse(model: SerializedTextFilter): void;
    setType(filterType: string): void;
}
