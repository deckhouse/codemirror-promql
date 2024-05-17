"use strict";
// Copyright 2021 The Prometheus Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFunction = exports.ValueType = void 0;
var lezer_promql_1 = require("@prometheus-io/lezer-promql");
var ValueType;
(function (ValueType) {
    ValueType["none"] = "none";
    ValueType["vector"] = "vector";
    ValueType["scalar"] = "scalar";
    ValueType["matrix"] = "matrix";
    ValueType["string"] = "string";
})(ValueType || (exports.ValueType = ValueType = {}));
// promqlFunctions is a list of all functions supported by PromQL, including their types.
// Based on https://github.com/prometheus/prometheus/blob/master/promql/parser/functions.go#L26
var promqlFunctions = (_a = {},
    _a[lezer_promql_1.Abs] = {
        name: 'abs',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Absent] = {
        name: 'absent',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.AbsentOverTime] = {
        name: 'absent_over_time',
        argTypes: [ValueType.matrix],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Acos] = {
        name: 'acos',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Acosh] = {
        name: 'acosh',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Asin] = {
        name: 'asin',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Asinh] = {
        name: 'asinh',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Atan] = {
        name: 'atan',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Atanh] = {
        name: 'atanh',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.AvgOverTime] = {
        name: 'avg_over_time',
        argTypes: [ValueType.matrix],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Ceil] = {
        name: 'ceil',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Changes] = {
        name: 'changes',
        argTypes: [ValueType.matrix],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Clamp] = {
        name: 'clamp',
        argTypes: [ValueType.vector, ValueType.scalar, ValueType.scalar],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.ClampMax] = {
        name: 'clamp_max',
        argTypes: [ValueType.vector, ValueType.scalar],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.ClampMin] = {
        name: 'clamp_min',
        argTypes: [ValueType.vector, ValueType.scalar],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Cos] = {
        name: 'cos',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Cosh] = {
        name: 'Cosh',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.CountOverTime] = {
        name: 'count_over_time',
        argTypes: [ValueType.matrix],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.DaysInMonth] = {
        name: 'days_in_month',
        argTypes: [ValueType.vector],
        variadic: 1,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.DayOfMonth] = {
        name: 'day_of_month',
        argTypes: [ValueType.vector],
        variadic: 1,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.DayOfWeek] = {
        name: 'day_of_week',
        argTypes: [ValueType.vector],
        variadic: 1,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.DayOfYear] = {
        name: 'day_of_year',
        argTypes: [ValueType.vector],
        variadic: 1,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Deg] = {
        name: 'deg',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Delta] = {
        name: 'delta',
        argTypes: [ValueType.matrix],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Deriv] = {
        name: 'deriv',
        argTypes: [ValueType.matrix],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Exp] = {
        name: 'exp',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Floor] = {
        name: 'floor',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.HistogramAvg] = {
        name: 'histogram_avg',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.HistogramCount] = {
        name: 'histogram_count',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.HistogramFraction] = {
        name: 'histogram_fraction',
        argTypes: [ValueType.scalar, ValueType.scalar, ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.HistogramQuantile] = {
        name: 'histogram_quantile',
        argTypes: [ValueType.scalar, ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.HistogramStdDev] = {
        name: 'histogram_stddev',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.HistogramStdVar] = {
        name: 'histogram_stdvar',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.HistogramSum] = {
        name: 'histogram_sum',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.HoltWinters] = {
        name: 'holt_winters',
        argTypes: [ValueType.matrix, ValueType.scalar, ValueType.scalar],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Hour] = {
        name: 'hour',
        argTypes: [ValueType.vector],
        variadic: 1,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Idelta] = {
        name: 'idelta',
        argTypes: [ValueType.matrix],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Increase] = {
        name: 'increase',
        argTypes: [ValueType.matrix],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Irate] = {
        name: 'irate',
        argTypes: [ValueType.matrix],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.LabelReplace] = {
        name: 'label_replace',
        argTypes: [ValueType.vector, ValueType.string, ValueType.string, ValueType.string, ValueType.string],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.LabelJoin] = {
        name: 'label_join',
        argTypes: [ValueType.vector, ValueType.string, ValueType.string, ValueType.string],
        variadic: -1,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.LastOverTime] = {
        name: 'last_over_time',
        argTypes: [ValueType.matrix],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Ln] = {
        name: 'ln',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Log10] = {
        name: 'log10',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Log2] = {
        name: 'log2',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.MadOverTime] = {
        name: 'mad_over_time',
        argTypes: [ValueType.matrix],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.MaxOverTime] = {
        name: 'max_over_time',
        argTypes: [ValueType.matrix],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.MinOverTime] = {
        name: 'min_over_time',
        argTypes: [ValueType.matrix],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Minute] = {
        name: 'minute',
        argTypes: [ValueType.vector],
        variadic: 1,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Month] = {
        name: 'month',
        argTypes: [ValueType.vector],
        variadic: 1,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.OKDefined] = {
        name: 'ok_defined',
        argTypes: [ValueType.matrix],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.OKReplaceNone] = {
        name: 'ok_replace_nan',
        argTypes: [ValueType.matrix, ValueType.scalar, ValueType.scalar],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.OKZeroIfNone] = {
        name: 'ok_zero_if_none',
        argTypes: [ValueType.matrix],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.OPDefined] = {
        name: 'op_defined',
        argTypes: [ValueType.matrix],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.OPReplaceNone] = {
        name: 'op_replace_nan',
        argTypes: [ValueType.matrix, ValueType.scalar, ValueType.scalar],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.OPZeroIfNone] = {
        name: 'op_zero_if_none',
        argTypes: [ValueType.matrix],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Pi] = {
        name: 'pi',
        argTypes: [],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.PredictLinear] = {
        name: 'predict_linear',
        argTypes: [ValueType.matrix, ValueType.scalar],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.PresentOverTime] = {
        name: 'present_over_time',
        argTypes: [ValueType.matrix],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.QuantileOverTime] = {
        name: 'quantile_over_time',
        argTypes: [ValueType.scalar, ValueType.matrix],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Rad] = {
        name: 'rad',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Rate] = {
        name: 'rate',
        argTypes: [ValueType.matrix],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Resets] = {
        name: 'resets',
        argTypes: [ValueType.matrix],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Round] = {
        name: 'round',
        argTypes: [ValueType.vector, ValueType.scalar],
        variadic: 1,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Scalar] = {
        name: 'scalar',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.scalar,
    },
    _a[lezer_promql_1.Sgn] = {
        name: 'sgn',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Sin] = {
        name: 'sin',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Sinh] = {
        name: 'Sinh',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Sort] = {
        name: 'sort',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.SortDesc] = {
        name: 'sort_desc',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.SortByLabel] = {
        name: 'sort_by_label',
        argTypes: [ValueType.vector, ValueType.string],
        variadic: -1,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.SortByLabelDesc] = {
        name: 'sort_by_label_desc',
        argTypes: [ValueType.vector, ValueType.string],
        variadic: -1,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Sqrt] = {
        name: 'sqrt',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.StddevOverTime] = {
        name: 'stddev_over_time',
        argTypes: [ValueType.matrix],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.StdvarOverTime] = {
        name: 'stdvar_over_time',
        argTypes: [ValueType.matrix],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.SumOverTime] = {
        name: 'sum_over_time',
        argTypes: [ValueType.matrix],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Tan] = {
        name: 'tan',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Tanh] = {
        name: 'tanh',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Time] = {
        name: 'time',
        argTypes: [],
        variadic: 0,
        returnType: ValueType.scalar,
    },
    _a[lezer_promql_1.Timestamp] = {
        name: 'timestamp',
        argTypes: [ValueType.vector],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Vector] = {
        name: 'vector',
        argTypes: [ValueType.scalar],
        variadic: 0,
        returnType: ValueType.vector,
    },
    _a[lezer_promql_1.Year] = {
        name: 'year',
        argTypes: [ValueType.vector],
        variadic: 1,
        returnType: ValueType.vector,
    },
    _a);
function getFunction(id) {
    return promqlFunctions[id];
}
exports.getFunction = getFunction;
//# sourceMappingURL=function.js.map