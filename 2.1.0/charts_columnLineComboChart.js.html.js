tui.util.defineNamespace("fedoc.content", {});
fedoc.content["charts_columnLineComboChart.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview Column and Line Combo chart.\n * @author NHN Ent.\n *         FE Development Lab &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar calculator = require('../helpers/calculator');\nvar renderUtil = require('../helpers/renderUtil');\nvar ChartBase = require('./chartBase');\nvar axisTypeMixer = require('./axisTypeMixer');\nvar comboTypeMixer = require('./comboTypeMixer');\nvar ColumnChartSeries = require('../series/columnChartSeries');\nvar LineChartSeries = require('../series/lineChartSeries');\n\nvar ColumnLineComboChart = tui.util.defineClass(ChartBase, /** @lends ColumnLineComboChart.prototype */ {\n    /**\n     * Column and Line Combo chart.\n     * @constructs ColumnLineComboChart\n     * @extends ChartBase\n     * @param {Array.&lt;Array>} rawData raw data\n     * @param {object} theme chart theme\n     * @param {object} options chart options\n     */\n    init: function(rawData, theme, options) {\n        var chartTypesMap;\n\n        this.className = 'tui-combo-chart';\n\n        chartTypesMap = this._makeChartTypesMap(rawData.series, options.yAxis);\n\n        tui.util.extend(this, chartTypesMap);\n\n        ChartBase.call(this, {\n            rawData: rawData,\n            theme: theme,\n            options: options,\n            hasAxes: true,\n            isVertical: true,\n            seriesNames: chartTypesMap.seriesNames\n        });\n\n        /**\n         * yAxis options map\n         * @type {object}\n         */\n        this.yAxisOptionsMap = this._makeYAxisOptionsMap(chartTypesMap.chartTypes, options.yAxis);\n        this._addComponents(chartTypesMap);\n    },\n\n    /**\n     * Make yAxis options map.\n     * @param {Array.&lt;string>} chartTypes chart types\n     * @param {?object} yAxisOptions yAxis options\n     * @returns {{column: ?object, line: ?object}} options map\n     * @private\n     */\n    _makeYAxisOptionsMap: function(chartTypes, yAxisOptions) {\n        var optionsMap = {};\n        yAxisOptions = yAxisOptions || {};\n        tui.util.forEachArray(chartTypes, function(chartType, index) {\n            optionsMap[chartType] = yAxisOptions[index] || yAxisOptions;\n        });\n\n        return optionsMap;\n    },\n\n    /**\n     * Make chart types map.\n     * @param {object} rawSeriesData raw series data\n     * @param {object} yAxisOption option for y axis\n     * @returns {object} chart types map\n     * @private\n     */\n    _makeChartTypesMap: function(rawSeriesData, yAxisOption) {\n        var seriesNames = tui.util.keys(rawSeriesData).sort(),\n            optionChartTypes = this._getYAxisOptionChartTypes(seriesNames, yAxisOption),\n            chartTypes = optionChartTypes.length ? optionChartTypes : seriesNames,\n            validChartTypes = tui.util.filter(optionChartTypes, function(chartType) {\n                return rawSeriesData[chartType].length;\n            }),\n            chartTypesMap;\n\n        if (validChartTypes.length === 1) {\n            chartTypesMap = {\n                chartTypes: validChartTypes,\n                seriesNames: validChartTypes,\n                optionChartTypes: !optionChartTypes.length ? optionChartTypes : validChartTypes\n            };\n        } else {\n            chartTypesMap = {\n                chartTypes: chartTypes,\n                seriesNames: seriesNames,\n                optionChartTypes: optionChartTypes\n            };\n        }\n\n        return chartTypesMap;\n    },\n\n    /**\n     * Make data for adding series component.\n     * @param {Array.&lt;string>} seriesNames - series names\n     * @returns {Array.&lt;object>}\n     * @private\n     */\n    _makeDataForAddingSeriesComponent: function(seriesNames) {\n        var seriesClasses = {\n            column: ColumnChartSeries,\n            line: LineChartSeries\n        };\n        var optionsMap = this._makeOptionsMap(seriesNames);\n        var themeMap = this._makeThemeMap(seriesNames);\n        var dataProcessor = this.dataProcessor;\n        var serieses = tui.util.map(seriesNames, function(seriesName) {\n            var chartType = dataProcessor.findChartType(seriesName);\n            var data = {\n                allowNegativeTooltip: true,\n                chartType: chartType,\n                seriesName: seriesName,\n                options: optionsMap[seriesName],\n                theme: themeMap[seriesName]\n            };\n\n            return {\n                name: seriesName + 'Series',\n                SeriesClass: seriesClasses[chartType],\n                data: data\n            };\n        });\n\n        return serieses;\n    },\n\n    /**\n     * Add components\n     * @param {object} chartTypesMap chart types map\n     * @private\n     */\n    _addComponents: function(chartTypesMap) {\n        var axes = [\n            {\n                name: 'yAxis',\n                chartType: chartTypesMap.chartTypes[0],\n                isVertical: true\n            },\n            {\n                name: 'xAxis',\n                isLabel: true\n            }\n        ];\n        var serieses = this._makeDataForAddingSeriesComponent(chartTypesMap.seriesNames);\n\n        if (chartTypesMap.optionChartTypes.length) {\n            axes.push({\n                name: 'rightYAxis',\n                chartType: chartTypesMap.chartTypes[1],\n                isVertical: true\n            });\n        }\n\n        this._addComponentsForAxisType({\n            chartType: this.options.chartType,\n            seriesNames: chartTypesMap.seriesNames,\n            axis: axes,\n            series: serieses,\n            plot: true\n        });\n    },\n\n    /**\n     * Get y axis option chart types.\n     * @param {Array.&lt;string>} chartTypes chart types\n     * @param {object} yAxisOptions y axis options\n     * @returns {Array.&lt;string>} chart types\n     * @private\n     */\n    _getYAxisOptionChartTypes: function(chartTypes, yAxisOptions) {\n        var resultChartTypes = chartTypes.slice(),\n            isReverse = false,\n            optionChartTypes;\n\n        yAxisOptions = yAxisOptions ? [].concat(yAxisOptions) : [];\n\n        if (yAxisOptions.length === 1 &amp;&amp; !yAxisOptions[0].chartType) {\n            resultChartTypes = [];\n        } else if (yAxisOptions.length) {\n            optionChartTypes = tui.util.map(yAxisOptions, function(option) {\n                return option.chartType;\n            });\n\n            tui.util.forEachArray(optionChartTypes, function(chartType, index) {\n                isReverse = isReverse || (chartType &amp;&amp; resultChartTypes[index] !== chartType || false);\n            });\n\n            if (isReverse) {\n                resultChartTypes.reverse();\n            }\n        }\n\n        return resultChartTypes;\n    },\n\n    /**\n     * Create AxisScaleMake for y axis.\n     * @param {number} index - index of this.chartTypes\n     * @param {boolean} isSingleYAxis - whether single y axis or not.\n     * @returns {AxisScaleMaker}\n     * @private\n     */\n    _createYAxisScaleMaker: function(index, isSingleYAxis) {\n        var chartType = this.chartTypes[index];\n        var yAxisOption = this.yAxisOptionsMap[chartType];\n        var additionalParams = {\n            isSingleYAxis: !!isSingleYAxis\n        };\n\n        return this._createAxisScaleMaker(yAxisOption, 'yAxis', null, chartType, additionalParams);\n    },\n\n    /**\n     * Make map for AxisScaleMaker of axes(xAxis, yAxis).\n     * @returns {Object.&lt;string, AxisScaleMaker>}\n     * @private\n     */\n    _makeAxisScaleMakerMap: function() {\n        var isSingleYAxis = this.optionChartTypes.length &lt; 2;\n        var axisScaleMakerMap = {\n            yAxis: this._createYAxisScaleMaker(0, isSingleYAxis)\n        };\n\n        if (!isSingleYAxis) {\n            axisScaleMakerMap.rightYAxis = this._createYAxisScaleMaker(1);\n        }\n\n        return axisScaleMakerMap;\n    },\n\n    /**\n     * Increase yAxis tick count.\n     * @param {number} increaseTickCount increase tick count\n     * @param {object} yAxisData yAxis data\n     * @private\n     */\n    _increaseYAxisTickCount: function(increaseTickCount, yAxisData) {\n        var formatFunctions = this.dataProcessor.getFormatFunctions(),\n            labels;\n\n        yAxisData.limit.max += yAxisData.step * increaseTickCount;\n        labels = calculator.makeLabelsFromLimit(yAxisData.limit, yAxisData.step);\n        yAxisData.labels = renderUtil.formatValues(labels, formatFunctions, 'yAxis');\n        yAxisData.tickCount += increaseTickCount;\n        yAxisData.validTickCount += increaseTickCount;\n    },\n\n    /**\n     * Update tick count to make the same tick count of y Axes(yAxis, rightYAxis).\n     * @param {{yAxis: object, rightYAxis: object}} axesData - axesData\n     * @private\n     */\n    _updateYAxisTickCount: function(axesData) {\n        var yAxisData = axesData.yAxis;\n        var rightYAxisData = axesData.rightYAxis;\n        var tickCountDiff = rightYAxisData.tickCount - yAxisData.tickCount;\n\n        if (tickCountDiff > 0) {\n            this._increaseYAxisTickCount(tickCountDiff, yAxisData);\n        } else if (tickCountDiff &lt; 0) {\n            this._increaseYAxisTickCount(-tickCountDiff, rightYAxisData);\n        }\n    },\n\n    /**\n     * On change selected legend.\n     * @param {Array.&lt;?boolean> | {line: ?Array.&lt;boolean>, column: ?Array.&lt;boolean>}} checkedLegends checked legends\n     */\n    onChangeCheckedLegends: function(checkedLegends) {\n        var rawData = this._filterCheckedRawData(this.rawData, checkedLegends);\n        var chartTypesMap = this._makeChartTypesMap(rawData.series, this.options.yAxis);\n\n        tui.util.extend(this, chartTypesMap);\n\n        ChartBase.prototype.onChangeCheckedLegends.call(this, checkedLegends, rawData, chartTypesMap);\n    }\n});\n\naxisTypeMixer.mixin(ColumnLineComboChart);\ncomboTypeMixer.mixin(ColumnLineComboChart);\n\n/**\n * Make axes data, used in a axis component like yAxis, xAxis, rightYAxis.\n * @returns {object} axes data\n * @private\n * @override\n */\nColumnLineComboChart.prototype._makeAxesData = function() {\n    var axisScaleMakerMap = this._getAxisScaleMakerMap();\n    var yAxisOptionsMap = this.yAxisOptionsMap;\n    var yAxisOptions = yAxisOptionsMap[this.chartTypes[0]];\n    var axesData = {\n        xAxis: this._makeAxisData(null, this.options.xAxis),\n        yAxis: this._makeAxisData(axisScaleMakerMap.yAxis, yAxisOptions, true)\n    };\n\n    if (axisScaleMakerMap.rightYAxis) {\n        yAxisOptions = yAxisOptionsMap[this.chartTypes[1]];\n        axesData.rightYAxis = this._makeAxisData(axisScaleMakerMap.rightYAxis, yAxisOptions, true, true);\n        axesData.rightYAxis.aligned = axesData.xAxis.aligned;\n        this._updateYAxisTickCount(axesData);\n    }\n\n    return axesData;\n};\n\n\nmodule.exports = ColumnLineComboChart;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"