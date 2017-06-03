/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v9.1.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var popupService_1 = require("../widgets/popupService");
var valueService_1 = require("../valueService");
var columnController_1 = require("../columnController/columnController");
var textFilter_1 = require("./textFilter");
var numberFilter_1 = require("./numberFilter");
var context_1 = require("../context/context");
var eventService_1 = require("../eventService");
var events_1 = require("../events");
var dateFilter_1 = require("./dateFilter");
var componentProvider_1 = require("../componentProvider");
var FilterManager = (function () {
    function FilterManager() {
        this.allFilters = {};
        this.quickFilter = null;
        this.availableFilters = {
            'text': textFilter_1.TextFilter,
            'number': numberFilter_1.NumberFilter,
            'date': dateFilter_1.DateFilter
        };
    }
    FilterManager.prototype.init = function () {
        this.eventService.addEventListener(events_1.Events.EVENT_ROW_DATA_CHANGED, this.onNewRowsLoaded.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_NEW_COLUMNS_LOADED, this.onNewColumnsLoaded.bind(this));
        this.quickFilter = this.parseQuickFilter(this.gridOptionsWrapper.getQuickFilterText());
        // check this here, in case there is a filter from the start
        this.checkExternalFilter();
    };
    FilterManager.prototype.registerFilter = function (key, Filter) {
        this.availableFilters[key] = Filter;
    };
    FilterManager.prototype.setFilterModel = function (model) {
        var _this = this;
        if (model) {
            // mark the filters as we set them, so any active filters left over we stop
            var modelKeys = Object.keys(model);
            utils_1.Utils.iterateObject(this.allFilters, function (colId, filterWrapper) {
                utils_1.Utils.removeFromArray(modelKeys, colId);
                var newModel = model[colId];
                _this.setModelOnFilterWrapper(filterWrapper.filter, newModel);
            });
            // at this point, processedFields contains data for which we don't have a filter working yet
            utils_1.Utils.iterateArray(modelKeys, function (colId) {
                var column = _this.columnController.getPrimaryColumn(colId);
                if (!column) {
                    console.warn('Warning ag-grid setFilterModel - no column found for colId ' + colId);
                    return;
                }
                var filterWrapper = _this.getOrCreateFilterWrapper(column);
                _this.setModelOnFilterWrapper(filterWrapper.filter, model[colId]);
            });
        }
        else {
            utils_1.Utils.iterateObject(this.allFilters, function (key, filterWrapper) {
                _this.setModelOnFilterWrapper(filterWrapper.filter, null);
            });
        }
        this.onFilterChanged();
    };
    FilterManager.prototype.setModelOnFilterWrapper = function (filter, newModel) {
        if (typeof filter.setModel !== 'function') {
            console.warn('Warning ag-grid - filter missing setModel method, which is needed for setFilterModel');
            return;
        }
        filter.setModel(newModel);
    };
    FilterManager.prototype.getFilterModel = function () {
        var result = {};
        utils_1.Utils.iterateObject(this.allFilters, function (key, filterWrapper) {
            // because user can provide filters, we provide useful error checking and messages
            var filter = filterWrapper.filter;
            if (typeof filter.getModel !== 'function') {
                console.warn('Warning ag-grid - filter API missing getModel method, which is needed for getFilterModel');
                return;
            }
            var model = filter.getModel();
            if (utils_1.Utils.exists(model)) {
                result[key] = model;
            }
        });
        return result;
    };
    // returns true if any advanced filter (ie not quick filter) active
    FilterManager.prototype.isAdvancedFilterPresent = function () {
        return this.advancedFilterPresent;
    };
    FilterManager.prototype.setAdvancedFilterPresent = function () {
        var atLeastOneActive = false;
        utils_1.Utils.iterateObject(this.allFilters, function (key, filterWrapper) {
            if (filterWrapper.filter.isFilterActive()) {
                atLeastOneActive = true;
            }
        });
        this.advancedFilterPresent = atLeastOneActive;
    };
    FilterManager.prototype.updateFilterFlagInColumns = function () {
        utils_1.Utils.iterateObject(this.allFilters, function (key, filterWrapper) {
            var filterActive = filterWrapper.filter.isFilterActive();
            filterWrapper.column.setFilterActive(filterActive);
        });
    };
    // returns true if quickFilter or advancedFilter
    FilterManager.prototype.isAnyFilterPresent = function () {
        return this.isQuickFilterPresent() || this.advancedFilterPresent || this.externalFilterPresent;
    };
    FilterManager.prototype.doesFilterPass = function (node, filterToSkip) {
        var data = node.data;
        var colKeys = Object.keys(this.allFilters);
        for (var i = 0, l = colKeys.length; i < l; i++) {
            var colId = colKeys[i];
            var filterWrapper = this.allFilters[colId];
            // if no filter, always pass
            if (filterWrapper === undefined) {
                continue;
            }
            if (filterWrapper.filter === filterToSkip) {
                continue;
            }
            // don't bother with filters that are not active
            if (!filterWrapper.filter.isFilterActive()) {
                continue;
            }
            if (!filterWrapper.filter.doesFilterPass) {
                console.error('Filter is missing method doesFilterPass');
            }
            var params = {
                node: node,
                data: data
            };
            if (!filterWrapper.filter.doesFilterPass(params)) {
                return false;
            }
        }
        // all filters passed
        return true;
    };
    FilterManager.prototype.parseQuickFilter = function (newFilter) {
        if (utils_1.Utils.missing(newFilter) || newFilter === "") {
            return null;
        }
        if (this.gridOptionsWrapper.isRowModelInfinite()) {
            console.warn('ag-grid: cannot do quick filtering when doing virtual paging');
            return null;
        }
        return newFilter.toUpperCase();
    };
    // returns true if it has changed (not just same value again)
    FilterManager.prototype.setQuickFilter = function (newFilter) {
        var parsedFilter = this.parseQuickFilter(newFilter);
        if (this.quickFilter !== parsedFilter) {
            this.quickFilter = parsedFilter;
            this.onFilterChanged();
        }
    };
    FilterManager.prototype.checkExternalFilter = function () {
        this.externalFilterPresent = this.gridOptionsWrapper.isExternalFilterPresent();
    };
    FilterManager.prototype.onFilterChanged = function () {
        this.eventService.dispatchEvent(events_1.Events.EVENT_BEFORE_FILTER_CHANGED);
        this.setAdvancedFilterPresent();
        this.updateFilterFlagInColumns();
        this.checkExternalFilter();
        utils_1.Utils.iterateObject(this.allFilters, function (key, filterWrapper) {
            if (filterWrapper.filter.onAnyFilterChanged) {
                filterWrapper.filter.onAnyFilterChanged();
            }
        });
        this.eventService.dispatchEvent(events_1.Events.EVENT_FILTER_CHANGED);
        this.eventService.dispatchEvent(events_1.Events.EVENT_AFTER_FILTER_CHANGED);
    };
    FilterManager.prototype.isQuickFilterPresent = function () {
        return this.quickFilter !== null;
    };
    FilterManager.prototype.doesRowPassOtherFilters = function (filterToSkip, node) {
        return this.doesRowPassFilter(node, filterToSkip);
    };
    FilterManager.prototype.doesRowPassFilter = function (node, filterToSkip) {
        //first up, check quick filter
        if (this.isQuickFilterPresent()) {
            if (!node.quickFilterAggregateText) {
                this.aggregateRowForQuickFilter(node);
            }
            if (node.quickFilterAggregateText.indexOf(this.quickFilter) < 0) {
                //quick filter fails, so skip item
                return false;
            }
        }
        //secondly, give the client a chance to reject this row
        if (this.externalFilterPresent) {
            if (!this.gridOptionsWrapper.doesExternalFilterPass(node)) {
                return false;
            }
        }
        //lastly, check our internal advanced filter
        if (this.advancedFilterPresent) {
            if (!this.doesFilterPass(node, filterToSkip)) {
                return false;
            }
        }
        //got this far, all filters pass
        return true;
    };
    FilterManager.prototype.aggregateRowForQuickFilter = function (node) {
        var _this = this;
        var stringParts = [];
        var columns = this.columnController.getAllPrimaryColumns();
        columns.forEach(function (column) {
            var value = _this.valueService.getValue(column, node);
            var valueAfterCallback;
            var colDef = column.getColDef();
            if (column.getColDef().getQuickFilterText) {
                var params = {
                    value: value,
                    node: node,
                    data: node.data,
                    column: column,
                    colDef: colDef
                };
                valueAfterCallback = column.getColDef().getQuickFilterText(params);
            }
            else {
                valueAfterCallback = value;
            }
            if (valueAfterCallback && valueAfterCallback !== '') {
                stringParts.push(valueAfterCallback.toString().toUpperCase());
            }
        });
        node.quickFilterAggregateText = stringParts.join('_');
    };
    FilterManager.prototype.onNewRowsLoaded = function () {
        utils_1.Utils.iterateObject(this.allFilters, function (key, filterWrapper) {
            if (filterWrapper.filter.onNewRowsLoaded) {
                filterWrapper.filter.onNewRowsLoaded();
            }
        });
        this.updateFilterFlagInColumns();
        this.setAdvancedFilterPresent();
    };
    FilterManager.prototype.createValueGetter = function (column) {
        var that = this;
        return function valueGetter(node) {
            return that.valueService.getValue(column, node);
        };
    };
    FilterManager.prototype.getFilterComponent = function (column) {
        var filterWrapper = this.getOrCreateFilterWrapper(column);
        return filterWrapper.filter;
    };
    FilterManager.prototype.getOrCreateFilterWrapper = function (column) {
        var filterWrapper = this.cachedFilter(column);
        if (!filterWrapper) {
            filterWrapper = this.createFilterWrapper(column);
            this.allFilters[column.getColId()] = filterWrapper;
        }
        return filterWrapper;
    };
    FilterManager.prototype.cachedFilter = function (column) {
        return this.allFilters[column.getColId()];
    };
    FilterManager.prototype.createFilterInstance = function (column) {
        var filter = column.getFilter();
        var filterIsComponent = typeof filter === 'function';
        var filterIsName = utils_1.Utils.missing(filter) || typeof filter === 'string';
        var FilterClass;
        if (filterIsComponent) {
            // if user provided a filter, just use it
            FilterClass = filter;
            // now create filter (had to cast to any to get 'new' working)
            this.assertMethodHasNoParameters(FilterClass);
        }
        else if (filterIsName) {
            var filterName = filter;
            FilterClass = this.getFilterFromCache(filterName);
        }
        else {
            console.error('ag-Grid: colDef.filter should be function or a string');
            return null;
        }
        var filterInstance = new FilterClass();
        this.checkFilterHasAllMandatoryMethods(filterInstance, column);
        this.context.wireBean(filterInstance);
        return filterInstance;
    };
    FilterManager.prototype.checkFilterHasAllMandatoryMethods = function (filterInstance, column) {
        // help the user, check the mandatory methods exist
        ['getGui', 'isFilterActive', 'doesFilterPass', 'getModel', 'setModel'].forEach(function (methodName) {
            var methodIsMissing = !filterInstance[methodName];
            if (methodIsMissing) {
                throw "Filter for column " + column.getColId() + " is missing method " + methodName;
            }
        });
    };
    FilterManager.prototype.createParams = function (filterWrapper) {
        var _this = this;
        var filterChangedCallback = this.onFilterChanged.bind(this);
        var filterModifiedCallback = function () { return _this.eventService.dispatchEvent(events_1.Events.EVENT_FILTER_MODIFIED); };
        var doesRowPassOtherFilters = this.doesRowPassOtherFilters.bind(this, filterWrapper.filter);
        var colDef = filterWrapper.column.getColDef();
        var params = {
            column: filterWrapper.column,
            colDef: colDef,
            rowModel: this.rowModel,
            filterChangedCallback: filterChangedCallback,
            filterModifiedCallback: filterModifiedCallback,
            valueGetter: this.createValueGetter(filterWrapper.column),
            doesRowPassOtherFilter: doesRowPassOtherFilters,
            context: this.gridOptionsWrapper.getContext(),
            $scope: filterWrapper.scope
        };
        if (colDef.filterParams) {
            utils_1.Utils.assign(params, colDef.filterParams);
        }
        return params;
    };
    FilterManager.prototype.createFilterWrapper = function (column) {
        var filterWrapper = {
            column: column,
            filter: null,
            scope: null,
            gui: null
        };
        filterWrapper.filter = this.createFilterInstance(column);
        this.initialiseFilterAndPutIntoGui(filterWrapper);
        return filterWrapper;
    };
    FilterManager.prototype.initialiseFilterAndPutIntoGui = function (filterWrapper) {
        // first up, create child scope if needed
        if (this.gridOptionsWrapper.isAngularCompileFilters()) {
            filterWrapper.scope = this.$scope.$new();
            filterWrapper.scope.context = this.gridOptionsWrapper.getContext();
        }
        var params = this.createParams(filterWrapper);
        filterWrapper.filter.init(params);
        var eFilterGui = document.createElement('div');
        eFilterGui.className = 'ag-filter';
        var guiFromFilter = filterWrapper.filter.getGui();
        // for backwards compatibility with Angular 1 - we
        // used to allow providing back HTML from getGui().
        // once we move away from supporting Angular 1
        // directly, we can change this.
        if (typeof guiFromFilter === 'string') {
            guiFromFilter = utils_1.Utils.loadTemplate(guiFromFilter);
        }
        eFilterGui.appendChild(guiFromFilter);
        if (filterWrapper.scope) {
            filterWrapper.gui = this.$compile(eFilterGui)(filterWrapper.scope)[0];
        }
        else {
            filterWrapper.gui = eFilterGui;
        }
    };
    FilterManager.prototype.getFilterFromCache = function (filterType) {
        var defaultFilterType = this.enterprise ? 'set' : 'text';
        var defaultFilter = this.availableFilters[defaultFilterType];
        if (utils_1.Utils.missing(filterType)) {
            return defaultFilter;
        }
        if (!this.enterprise && filterType === 'set') {
            console.warn('ag-Grid: Set filter is only available in Enterprise ag-Grid');
            filterType = 'text';
        }
        if (this.availableFilters[filterType]) {
            return this.availableFilters[filterType];
        }
        else {
            console.error('ag-Grid: Could not find filter type ' + filterType);
            return this.availableFilters[defaultFilter];
        }
    };
    FilterManager.prototype.onNewColumnsLoaded = function () {
        this.destroy();
    };
    // destroys the filter, so it not longer takes part
    FilterManager.prototype.destroyFilter = function (column) {
        var filterWrapper = this.allFilters[column.getColId()];
        if (filterWrapper) {
            this.disposeFilterWrapper(filterWrapper);
            this.onFilterChanged();
        }
    };
    FilterManager.prototype.disposeFilterWrapper = function (filterWrapper) {
        filterWrapper.filter.setModel(null);
        if (filterWrapper.filter.destroy) {
            filterWrapper.filter.destroy();
        }
        filterWrapper.column.setFilterActive(false);
        delete this.allFilters[filterWrapper.column.getColId()];
    };
    FilterManager.prototype.destroy = function () {
        var _this = this;
        utils_1.Utils.iterateObject(this.allFilters, function (key, filterWrapper) {
            _this.disposeFilterWrapper(filterWrapper);
        });
    };
    FilterManager.prototype.assertMethodHasNoParameters = function (theMethod) {
        var getRowsParams = utils_1.Utils.getFunctionParameters(theMethod);
        if (getRowsParams.length > 0) {
            console.warn('ag-grid: It looks like your filter is of the old type and expecting parameters in the constructor.');
            console.warn('ag-grid: From ag-grid 1.14, the constructor should take no parameters and init() used instead.');
        }
    };
    return FilterManager;
}());
__decorate([
    context_1.Autowired('$compile'),
    __metadata("design:type", Object)
], FilterManager.prototype, "$compile", void 0);
__decorate([
    context_1.Autowired('$scope'),
    __metadata("design:type", Object)
], FilterManager.prototype, "$scope", void 0);
__decorate([
    context_1.Autowired('gridOptionsWrapper'),
    __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
], FilterManager.prototype, "gridOptionsWrapper", void 0);
__decorate([
    context_1.Autowired('gridCore'),
    __metadata("design:type", Object)
], FilterManager.prototype, "gridCore", void 0);
__decorate([
    context_1.Autowired('popupService'),
    __metadata("design:type", popupService_1.PopupService)
], FilterManager.prototype, "popupService", void 0);
__decorate([
    context_1.Autowired('valueService'),
    __metadata("design:type", valueService_1.ValueService)
], FilterManager.prototype, "valueService", void 0);
__decorate([
    context_1.Autowired('columnController'),
    __metadata("design:type", columnController_1.ColumnController)
], FilterManager.prototype, "columnController", void 0);
__decorate([
    context_1.Autowired('rowModel'),
    __metadata("design:type", Object)
], FilterManager.prototype, "rowModel", void 0);
__decorate([
    context_1.Autowired('eventService'),
    __metadata("design:type", eventService_1.EventService)
], FilterManager.prototype, "eventService", void 0);
__decorate([
    context_1.Autowired('enterprise'),
    __metadata("design:type", Boolean)
], FilterManager.prototype, "enterprise", void 0);
__decorate([
    context_1.Autowired('context'),
    __metadata("design:type", context_1.Context)
], FilterManager.prototype, "context", void 0);
__decorate([
    context_1.Autowired('componentProvider'),
    __metadata("design:type", componentProvider_1.ComponentProvider)
], FilterManager.prototype, "componentProvider", void 0);
__decorate([
    context_1.PostConstruct,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FilterManager.prototype, "init", null);
__decorate([
    context_1.PreDestroy,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FilterManager.prototype, "destroy", null);
FilterManager = __decorate([
    context_1.Bean('filterManager')
], FilterManager);
exports.FilterManager = FilterManager;
