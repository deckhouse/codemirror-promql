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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HybridComplete = exports.analyzeCompletion = exports.computeStartCompletePosition = exports.ContextKind = void 0;
var lezer_promql_1 = require("@prometheus-io/lezer-promql");
var parser_1 = require("../parser");
var promql_terms_1 = require("./promql.terms");
var language_1 = require("@codemirror/language");
var autocompleteNodes = {
    matchOp: promql_terms_1.matchOpTerms,
    binOp: promql_terms_1.binOpTerms,
    duration: promql_terms_1.durationTerms,
    binOpModifier: promql_terms_1.binOpModifierTerms,
    atModifier: promql_terms_1.atModifierTerms,
    functionIdentifier: promql_terms_1.functionIdentifierTerms,
    aggregateOp: promql_terms_1.aggregateOpTerms,
    aggregateOpModifier: promql_terms_1.aggregateOpModifierTerms,
    number: promql_terms_1.numberTerms,
};
// ContextKind is the different possible value determinate by the autocompletion
var ContextKind;
(function (ContextKind) {
    // dynamic autocompletion (required a distant server)
    ContextKind[ContextKind["MetricName"] = 0] = "MetricName";
    ContextKind[ContextKind["LabelName"] = 1] = "LabelName";
    ContextKind[ContextKind["LabelValue"] = 2] = "LabelValue";
    // static autocompletion
    ContextKind[ContextKind["Function"] = 3] = "Function";
    ContextKind[ContextKind["Aggregation"] = 4] = "Aggregation";
    ContextKind[ContextKind["BinOpModifier"] = 5] = "BinOpModifier";
    ContextKind[ContextKind["BinOp"] = 6] = "BinOp";
    ContextKind[ContextKind["MatchOp"] = 7] = "MatchOp";
    ContextKind[ContextKind["AggregateOpModifier"] = 8] = "AggregateOpModifier";
    ContextKind[ContextKind["Duration"] = 9] = "Duration";
    ContextKind[ContextKind["Offset"] = 10] = "Offset";
    ContextKind[ContextKind["Bool"] = 11] = "Bool";
    ContextKind[ContextKind["AtModifiers"] = 12] = "AtModifiers";
    ContextKind[ContextKind["Number"] = 13] = "Number";
})(ContextKind || (exports.ContextKind = ContextKind = {}));
function getMetricNameInGroupBy(tree, state) {
    // There should be an AggregateExpr as parent of the GroupingLabels.
    // Then we should find the VectorSelector child to be able to find the metric name.
    var currentNode = (0, parser_1.walkBackward)(tree, lezer_promql_1.AggregateExpr);
    if (!currentNode) {
        return '';
    }
    var metricName = '';
    currentNode.cursor().iterate(function (node) {
        // Continue until we find the VectorSelector, then look up the metric name.
        if (node.type.id === lezer_promql_1.VectorSelector) {
            metricName = getMetricNameInVectorSelector(node.node, state);
            if (metricName) {
                return false;
            }
        }
    });
    return metricName;
}
function getMetricNameInVectorSelector(tree, state) {
    // Find if there is a defined metric name. Should be used to autocomplete a labelValue or a labelName
    // First find the parent "VectorSelector" to be able to find then the subChild "Identifier" if it exists.
    var currentNode = (0, parser_1.walkBackward)(tree, lezer_promql_1.VectorSelector);
    if (!currentNode) {
        // Weird case that shouldn't happen, because "VectorSelector" is by definition the parent of the LabelMatchers.
        return '';
    }
    currentNode = currentNode.getChild(lezer_promql_1.Identifier);
    if (!currentNode) {
        return '';
    }
    return state.sliceDoc(currentNode.from, currentNode.to);
}
function arrayToCompletionResult(data, from, to, includeSnippet, span) {
    if (includeSnippet === void 0) { includeSnippet = false; }
    if (span === void 0) { span = true; }
    var options = data;
    if (includeSnippet) {
        options.push.apply(options, __spreadArray([], __read(promql_terms_1.snippets), false));
    }
    return {
        from: from,
        to: to,
        options: options,
        validFor: span ? /^[a-zA-Z0-9_:]+$/ : undefined,
    };
}
// computeStartCompleteLabelPositionInLabelMatcherOrInGroupingLabel calculates the start position only when the node is a LabelMatchers or a GroupingLabels
function computeStartCompleteLabelPositionInLabelMatcherOrInGroupingLabel(node, pos) {
    // Here we can have two different situations:
    // 1. `metric{}` or `sum by()` with the cursor between the bracket
    // and so we have increment the starting position to avoid to consider the open bracket when filtering the autocompletion list.
    // 2. `metric{foo="bar",} or `sum by(foo,)  with the cursor after the comma.
    // Then the start number should be the current position to avoid to consider the previous labelMatcher/groupingLabel when filtering the autocompletion list.
    var start = node.from + 1;
    if (node.firstChild !== null) {
        // here that means the LabelMatchers / GroupingLabels has a child, which is not possible if we have the expression `metric{}`. So we are likely trying to autocomplete the label list after a comma
        start = pos;
    }
    return start;
}
// computeStartCompletePosition calculates the start position of the autocompletion.
// It is an important step because the start position will be used by CMN to find the string and then to use it to filter the CompletionResult.
// A wrong `start` position will lead to have the completion not working.
// Note: this method is exported only for testing purpose.
function computeStartCompletePosition(node, pos) {
    var _a, _b, _c, _d, _e, _f, _g;
    var start = node.from;
    if (node.type.id === lezer_promql_1.LabelMatchers || node.type.id === lezer_promql_1.GroupingLabels) {
        start = computeStartCompleteLabelPositionInLabelMatcherOrInGroupingLabel(node, pos);
    }
    else if (node.type.id === lezer_promql_1.FunctionCallBody ||
        (node.type.id === lezer_promql_1.StringLiteral && (((_a = node.parent) === null || _a === void 0 ? void 0 : _a.type.id) === lezer_promql_1.UnquotedLabelMatcher || ((_b = node.parent) === null || _b === void 0 ? void 0 : _b.type.id) === lezer_promql_1.QuotedLabelMatcher))) {
        // When the cursor is between bracket, quote, we need to increment the starting position to avoid to consider the open bracket/ first string.
        start++;
    }
    else if (node.type.id === lezer_promql_1.OffsetExpr ||
        (node.type.id === lezer_promql_1.NumberLiteral && ((_c = node.parent) === null || _c === void 0 ? void 0 : _c.type.id) === 0 && ((_d = node.parent.parent) === null || _d === void 0 ? void 0 : _d.type.id) === lezer_promql_1.SubqueryExpr) ||
        (node.type.id === 0 &&
            (((_e = node.parent) === null || _e === void 0 ? void 0 : _e.type.id) === lezer_promql_1.OffsetExpr ||
                ((_f = node.parent) === null || _f === void 0 ? void 0 : _f.type.id) === lezer_promql_1.MatrixSelector ||
                (((_g = node.parent) === null || _g === void 0 ? void 0 : _g.type.id) === lezer_promql_1.SubqueryExpr && (0, parser_1.containsAtLeastOneChild)(node.parent, lezer_promql_1.Duration))))) {
        start = pos;
    }
    return start;
}
exports.computeStartCompletePosition = computeStartCompletePosition;
// analyzeCompletion is going to determinate what should be autocompleted.
// The value of the autocompletion is then calculate by the function buildCompletion.
// Note: this method is exported for testing purpose only. Do not use it directly.
function analyzeCompletion(state, node) {
    var e_1, _a;
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
    var result = [];
    switch (node.type.id) {
        case 0: // 0 is the id of the error node
            if (((_b = node.parent) === null || _b === void 0 ? void 0 : _b.type.id) === lezer_promql_1.OffsetExpr) {
                // we are likely in the given situation:
                // `metric_name offset 5` that leads to this tree:
                // `OffsetExpr(VectorSelector(Identifier),Offset,⚠)`
                // Here we can just autocomplete a duration.
                result.push({ kind: ContextKind.Duration });
                break;
            }
            if (((_c = node.parent) === null || _c === void 0 ? void 0 : _c.type.id) === lezer_promql_1.UnquotedLabelMatcher || ((_d = node.parent) === null || _d === void 0 ? void 0 : _d.type.id) === lezer_promql_1.QuotedLabelMatcher) {
                // In this case the current token is not itself a valid match op yet:
                //      metric_name{labelName!}
                result.push({ kind: ContextKind.MatchOp });
                break;
            }
            if (((_e = node.parent) === null || _e === void 0 ? void 0 : _e.type.id) === lezer_promql_1.MatrixSelector) {
                // we are likely in the given situation:
                // `metric_name{}[5]`
                // We can also just autocomplete a duration
                result.push({ kind: ContextKind.Duration });
                break;
            }
            if (((_f = node.parent) === null || _f === void 0 ? void 0 : _f.type.id) === lezer_promql_1.SubqueryExpr && (0, parser_1.containsAtLeastOneChild)(node.parent, lezer_promql_1.Duration)) {
                // we are likely in the given situation:
                //    `rate(foo[5d:5])`
                // so we should autocomplete a duration
                result.push({ kind: ContextKind.Duration });
                break;
            }
            // when we are in the situation 'metric_name !', we have the following tree
            // VectorSelector(Identifier,⚠)
            // We should try to know if the char '!' is part of a binOp.
            // Note: as it is quite experimental, maybe it requires more condition and to check the current tree (parent, other child at the same level ..etc.).
            var operator_1 = state.sliceDoc(node.from, node.to);
            if (promql_terms_1.binOpTerms.filter(function (term) { return term.label.includes(operator_1); }).length > 0) {
                result.push({ kind: ContextKind.BinOp });
            }
            break;
        case lezer_promql_1.Identifier:
            // sometimes an Identifier has an error has parent. This should be treated in priority
            if (((_g = node.parent) === null || _g === void 0 ? void 0 : _g.type.id) === 0) {
                var errorNodeParent = node.parent.parent;
                if ((errorNodeParent === null || errorNodeParent === void 0 ? void 0 : errorNodeParent.type.id) === lezer_promql_1.StepInvariantExpr) {
                    // we are likely in the given situation:
                    //   `expr @ s`
                    // we can autocomplete start / end
                    result.push({ kind: ContextKind.AtModifiers });
                    break;
                }
                if ((errorNodeParent === null || errorNodeParent === void 0 ? void 0 : errorNodeParent.type.id) === lezer_promql_1.AggregateExpr) {
                    // it matches 'sum() b'. So here we can autocomplete:
                    // - the aggregate operation modifier
                    // - the binary operation (since it's not mandatory to have an aggregate operation modifier)
                    result.push({ kind: ContextKind.AggregateOpModifier }, { kind: ContextKind.BinOp });
                    break;
                }
                if ((errorNodeParent === null || errorNodeParent === void 0 ? void 0 : errorNodeParent.type.id) === lezer_promql_1.VectorSelector) {
                    // it matches 'sum b'. So here we also have to autocomplete the aggregate operation modifier only
                    // if the associated identifier is matching an aggregation operation.
                    // Note: here is the corresponding tree in order to understand the situation:
                    // VectorSelector(
                    //   Identifier,
                    //   ⚠(Identifier)
                    // )
                    var operator_2 = getMetricNameInVectorSelector(node, state);
                    if (promql_terms_1.aggregateOpTerms.filter(function (term) { return term.label === operator_2; }).length > 0) {
                        result.push({ kind: ContextKind.AggregateOpModifier });
                    }
                    // It's possible it also match the expr 'metric_name unle'.
                    // It's also possible that the operator is also a metric even if it matches the list of aggregation function.
                    // So we also have to autocomplete the binary operator.
                    //
                    // The expr `metric_name off` leads to the same tree. So we have to provide the offset keyword too here.
                    result.push({ kind: ContextKind.BinOp }, { kind: ContextKind.Offset });
                    break;
                }
                if (errorNodeParent && (0, parser_1.containsChild)(errorNodeParent, 'Expr')) {
                    // this last case can appear with the following expression:
                    // 1. http_requests_total{method="GET"} off
                    // 2. rate(foo[5m]) un
                    // 3. sum(http_requests_total{method="GET"} off)
                    // For these different cases we have this kind of tree:
                    // Parent (
                    //    ⚠(Identifier)
                    // )
                    // We don't really care about the parent, here we are more interested if in the siblings of the error node, there is the node 'Expr'
                    // If it is the case, then likely we should autocomplete the BinOp or the offset.
                    result.push({ kind: ContextKind.BinOp }, { kind: ContextKind.Offset });
                    break;
                }
            }
            // As the leaf Identifier is coming for different cases, we have to take a bit time to analyze the tree
            // in order to know what we have to autocomplete exactly.
            // Here is some cases:
            // 1. metric_name / ignor --> we should autocomplete the BinOpModifier + metric/function/aggregation
            // 2. sum(http_requests_total{method="GET"} / o) --> BinOpModifier + metric/function/aggregation
            // Examples above give a different tree each time and ends up to be treated in this case.
            // But they all have the following common tree pattern:
            // Parent( ...,
            //         ... ,
            //         VectorSelector(Identifier)
            //       )
            //
            // So the first things to do is to get the `Parent` and to determinate if we are in this configuration.
            // Otherwise we would just have to autocomplete the metric / function / aggregation.
            var parent_1 = (_h = node.parent) === null || _h === void 0 ? void 0 : _h.parent;
            if (!parent_1) {
                // this case can be possible if the topNode is not anymore PromQL but MetricName.
                // In this particular case, then we just want to autocomplete the metric
                result.push({ kind: ContextKind.MetricName, metricName: state.sliceDoc(node.from, node.to) });
                break;
            }
            // now we have to know if we have two Expr in the direct children of the `parent`
            var containExprTwice = (0, parser_1.containsChild)(parent_1, 'Expr', 'Expr');
            if (containExprTwice) {
                if (parent_1.type.id === lezer_promql_1.BinaryExpr && !(0, parser_1.containsAtLeastOneChild)(parent_1, 0)) {
                    // We are likely in the case 1 or 5
                    result.push({ kind: ContextKind.MetricName, metricName: state.sliceDoc(node.from, node.to) }, { kind: ContextKind.Function }, { kind: ContextKind.Aggregation }, { kind: ContextKind.BinOpModifier }, { kind: ContextKind.Number });
                    // in  case the BinaryExpr is a comparison, we should autocomplete the `bool` keyword. But only if it is not present.
                    // When the `bool` keyword is NOT present, then the expression looks like this:
                    // 			BinaryExpr( ..., Gtr , ... )
                    // When the `bool` keyword is present, then the expression looks like this:
                    //      BinaryExpr( ..., Gtr , BoolModifier(...), ... )
                    if ((0, parser_1.containsAtLeastOneChild)(parent_1, lezer_promql_1.Eql, lezer_promql_1.Gte, lezer_promql_1.Gtr, lezer_promql_1.Lte, lezer_promql_1.Lss, lezer_promql_1.Neq) && !(0, parser_1.containsAtLeastOneChild)(parent_1, lezer_promql_1.BoolModifier)) {
                        result.push({ kind: ContextKind.Bool });
                    }
                }
            }
            else {
                result.push({ kind: ContextKind.MetricName, metricName: state.sliceDoc(node.from, node.to) }, { kind: ContextKind.Function }, { kind: ContextKind.Aggregation });
                if (parent_1.type.id !== lezer_promql_1.FunctionCallBody && parent_1.type.id !== lezer_promql_1.MatrixSelector) {
                    // it's too avoid to autocomplete a number in situation where it shouldn't.
                    // Like with `sum by(rat)`
                    result.push({ kind: ContextKind.Number });
                }
            }
            break;
        case lezer_promql_1.PromQL:
            if (node.firstChild !== null && node.firstChild.type.id === 0) {
                // this situation can happen when there is nothing in the text area and the user is explicitly triggering the autocompletion (with ctrl + space)
                result.push({ kind: ContextKind.MetricName, metricName: '' }, { kind: ContextKind.Function }, { kind: ContextKind.Aggregation }, { kind: ContextKind.Number });
            }
            break;
        case lezer_promql_1.GroupingLabels:
            // In this case we are in the given situation:
            //      sum by () or sum (metric_name) by ()
            // so we have or to autocomplete any kind of labelName or to autocomplete only the labelName associated to the metric
            result.push({ kind: ContextKind.LabelName, metricName: getMetricNameInGroupBy(node, state) });
            break;
        case lezer_promql_1.LabelMatchers:
            // In that case we are in the given situation:
            //       metric_name{} or {}
            // so we have or to autocomplete any kind of labelName or to autocomplete only the labelName associated to the metric
            result.push({ kind: ContextKind.LabelName, metricName: getMetricNameInVectorSelector(node, state) });
            break;
        case lezer_promql_1.LabelName:
            if (((_j = node.parent) === null || _j === void 0 ? void 0 : _j.type.id) === lezer_promql_1.GroupingLabels) {
                // In this case we are in the given situation:
                //      sum by (myL)
                // So we have to continue to autocomplete any kind of labelName
                result.push({ kind: ContextKind.LabelName });
            }
            else if (((_k = node.parent) === null || _k === void 0 ? void 0 : _k.type.id) === lezer_promql_1.UnquotedLabelMatcher) {
                // In that case we are in the given situation:
                //       metric_name{myL} or {myL}
                // so we have or to continue to autocomplete any kind of labelName or
                // to continue to autocomplete only the labelName associated to the metric
                result.push({ kind: ContextKind.LabelName, metricName: getMetricNameInVectorSelector(node, state) });
            }
            break;
        case lezer_promql_1.StringLiteral:
            if (((_l = node.parent) === null || _l === void 0 ? void 0 : _l.type.id) === lezer_promql_1.UnquotedLabelMatcher || ((_m = node.parent) === null || _m === void 0 ? void 0 : _m.type.id) === lezer_promql_1.QuotedLabelMatcher) {
                // In this case we are in the given situation:
                //      metric_name{labelName=""} or metric_name{"labelName"=""}
                // So we can autocomplete the labelValue
                // Get the labelName.
                // By definition it's the firstChild: https://github.com/promlabs/lezer-promql/blob/0ef65e196a8db6a989ff3877d57fd0447d70e971/src/promql.grammar#L250
                var labelName = '';
                if (((_o = node.parent.firstChild) === null || _o === void 0 ? void 0 : _o.type.id) === lezer_promql_1.LabelName) {
                    labelName = state.sliceDoc(node.parent.firstChild.from, node.parent.firstChild.to);
                }
                else if (((_p = node.parent.firstChild) === null || _p === void 0 ? void 0 : _p.type.id) === lezer_promql_1.QuotedLabelName) {
                    labelName = state.sliceDoc(node.parent.firstChild.from, node.parent.firstChild.to).slice(1, -1);
                }
                // then find the metricName if it exists
                var metricName = getMetricNameInVectorSelector(node, state);
                // finally get the full matcher available
                var matcherNode = (0, parser_1.walkBackward)(node, lezer_promql_1.LabelMatchers);
                var labelMatcherOpts = [lezer_promql_1.QuotedLabelName, lezer_promql_1.QuotedLabelMatcher, lezer_promql_1.UnquotedLabelMatcher];
                var labelMatchers = [];
                try {
                    for (var labelMatcherOpts_1 = __values(labelMatcherOpts), labelMatcherOpts_1_1 = labelMatcherOpts_1.next(); !labelMatcherOpts_1_1.done; labelMatcherOpts_1_1 = labelMatcherOpts_1.next()) {
                        var labelMatcherOpt = labelMatcherOpts_1_1.value;
                        labelMatchers = labelMatchers.concat((0, parser_1.buildLabelMatchers)(matcherNode ? matcherNode.getChildren(labelMatcherOpt) : [], state));
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (labelMatcherOpts_1_1 && !labelMatcherOpts_1_1.done && (_a = labelMatcherOpts_1.return)) _a.call(labelMatcherOpts_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                result.push({
                    kind: ContextKind.LabelValue,
                    metricName: metricName,
                    labelName: labelName,
                    matchers: labelMatchers,
                });
            }
            else if (((_r = (_q = node.parent) === null || _q === void 0 ? void 0 : _q.parent) === null || _r === void 0 ? void 0 : _r.type.id) === lezer_promql_1.GroupingLabels) {
                // In this case we are in the given situation:
                //      sum by ("myL")
                // So we have to continue to autocomplete any kind of labelName
                result.push({ kind: ContextKind.LabelName });
            }
            else if (((_t = (_s = node.parent) === null || _s === void 0 ? void 0 : _s.parent) === null || _t === void 0 ? void 0 : _t.type.id) === lezer_promql_1.LabelMatchers) {
                // In that case we are in the given situation:
                //       {""} or {"metric_"}
                // since this is for the QuotedMetricName we need to continue to autocomplete for the metric names
                result.push({ kind: ContextKind.MetricName, metricName: state.sliceDoc(node.from, node.to).slice(1, -1) });
            }
            break;
        case lezer_promql_1.NumberLiteral:
            if (((_u = node.parent) === null || _u === void 0 ? void 0 : _u.type.id) === 0 && ((_v = node.parent.parent) === null || _v === void 0 ? void 0 : _v.type.id) === lezer_promql_1.SubqueryExpr) {
                // Here we are likely in this situation:
                //     `go[5d:4]`
                // and we have the given tree:
                // SubqueryExpr(
                //   VectorSelector(Identifier),
                //   Duration, Duration, ⚠(NumberLiteral)
                // )
                // So we should continue to autocomplete a duration
                result.push({ kind: ContextKind.Duration });
            }
            else {
                result.push({ kind: ContextKind.Number });
            }
            break;
        case lezer_promql_1.Duration:
        case lezer_promql_1.OffsetExpr:
            result.push({ kind: ContextKind.Duration });
            break;
        case lezer_promql_1.FunctionCallBody:
            // In this case we are in the given situation:
            //       sum() or in rate()
            // with the cursor between the bracket. So we can autocomplete the metric, the function and the aggregation.
            result.push({ kind: ContextKind.MetricName, metricName: '' }, { kind: ContextKind.Function }, { kind: ContextKind.Aggregation });
            break;
        case lezer_promql_1.Neq:
            if (((_w = node.parent) === null || _w === void 0 ? void 0 : _w.type.id) === lezer_promql_1.MatchOp) {
                result.push({ kind: ContextKind.MatchOp });
            }
            else if (((_x = node.parent) === null || _x === void 0 ? void 0 : _x.type.id) === lezer_promql_1.BinaryExpr) {
                result.push({ kind: ContextKind.BinOp });
            }
            break;
        case lezer_promql_1.EqlSingle:
        case lezer_promql_1.EqlRegex:
        case lezer_promql_1.NeqRegex:
        case lezer_promql_1.MatchOp:
            result.push({ kind: ContextKind.MatchOp });
            break;
        case lezer_promql_1.Pow:
        case lezer_promql_1.Mul:
        case lezer_promql_1.Div:
        case lezer_promql_1.Mod:
        case lezer_promql_1.Add:
        case lezer_promql_1.Sub:
        case lezer_promql_1.Eql:
        case lezer_promql_1.Gte:
        case lezer_promql_1.Gtr:
        case lezer_promql_1.Lte:
        case lezer_promql_1.Lss:
        case lezer_promql_1.And:
        case lezer_promql_1.Unless:
        case lezer_promql_1.Or:
        case lezer_promql_1.BinaryExpr:
            result.push({ kind: ContextKind.BinOp });
            break;
    }
    return result;
}
exports.analyzeCompletion = analyzeCompletion;
// HybridComplete provides a full completion result with or without a remote prometheus.
var HybridComplete = /** @class */ (function () {
    function HybridComplete(prometheusClient, maxMetricsMetadata) {
        if (maxMetricsMetadata === void 0) { maxMetricsMetadata = 10000; }
        this.prometheusClient = prometheusClient;
        this.maxMetricsMetadata = maxMetricsMetadata;
    }
    HybridComplete.prototype.getPrometheusClient = function () {
        return this.prometheusClient;
    };
    HybridComplete.prototype.promQL = function (context) {
        var e_2, _a;
        var _this = this;
        var state = context.state, pos = context.pos;
        var tree = (0, language_1.syntaxTree)(state).resolve(pos, -1);
        var contexts = analyzeCompletion(state, tree);
        var asyncResult = Promise.resolve([]);
        var completeSnippet = false;
        var span = true;
        var _loop_1 = function (context_1) {
            switch (context_1.kind) {
                case ContextKind.Aggregation:
                    completeSnippet = true;
                    asyncResult = asyncResult.then(function (result) {
                        return result.concat(autocompleteNodes.aggregateOp);
                    });
                    break;
                case ContextKind.Function:
                    completeSnippet = true;
                    asyncResult = asyncResult.then(function (result) {
                        return result.concat(autocompleteNodes.functionIdentifier);
                    });
                    break;
                case ContextKind.BinOpModifier:
                    asyncResult = asyncResult.then(function (result) {
                        return result.concat(autocompleteNodes.binOpModifier);
                    });
                    break;
                case ContextKind.BinOp:
                    asyncResult = asyncResult.then(function (result) {
                        return result.concat(autocompleteNodes.binOp);
                    });
                    break;
                case ContextKind.MatchOp:
                    asyncResult = asyncResult.then(function (result) {
                        return result.concat(autocompleteNodes.matchOp);
                    });
                    break;
                case ContextKind.AggregateOpModifier:
                    asyncResult = asyncResult.then(function (result) {
                        return result.concat(autocompleteNodes.aggregateOpModifier);
                    });
                    break;
                case ContextKind.Duration:
                    span = false;
                    asyncResult = asyncResult.then(function (result) {
                        return result.concat(autocompleteNodes.duration);
                    });
                    break;
                case ContextKind.Offset:
                    asyncResult = asyncResult.then(function (result) {
                        return result.concat([{ label: 'offset' }]);
                    });
                    break;
                case ContextKind.Bool:
                    asyncResult = asyncResult.then(function (result) {
                        return result.concat([{ label: 'bool' }]);
                    });
                    break;
                case ContextKind.AtModifiers:
                    asyncResult = asyncResult.then(function (result) {
                        return result.concat(autocompleteNodes.atModifier);
                    });
                    break;
                case ContextKind.Number:
                    asyncResult = asyncResult.then(function (result) {
                        return result.concat(autocompleteNodes.number);
                    });
                    break;
                case ContextKind.MetricName:
                    asyncResult = asyncResult.then(function (result) {
                        return _this.autocompleteMetricName(result, context_1);
                    });
                    break;
                case ContextKind.LabelName:
                    asyncResult = asyncResult.then(function (result) {
                        return _this.autocompleteLabelName(result, context_1);
                    });
                    break;
                case ContextKind.LabelValue:
                    asyncResult = asyncResult.then(function (result) {
                        return _this.autocompleteLabelValue(result, context_1);
                    });
            }
        };
        try {
            for (var contexts_1 = __values(contexts), contexts_1_1 = contexts_1.next(); !contexts_1_1.done; contexts_1_1 = contexts_1.next()) {
                var context_1 = contexts_1_1.value;
                _loop_1(context_1);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (contexts_1_1 && !contexts_1_1.done && (_a = contexts_1.return)) _a.call(contexts_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return asyncResult.then(function (result) {
            return arrayToCompletionResult(result, computeStartCompletePosition(tree, pos), pos, completeSnippet, span);
        });
    };
    HybridComplete.prototype.autocompleteMetricName = function (result, context) {
        var _this = this;
        if (!this.prometheusClient) {
            return result;
        }
        var metricCompletion = new Map();
        return this.prometheusClient
            .metricNames(context.metricName)
            .then(function (metricNames) {
            var e_3, _a;
            var _b;
            try {
                for (var metricNames_1 = __values(metricNames), metricNames_1_1 = metricNames_1.next(); !metricNames_1_1.done; metricNames_1_1 = metricNames_1.next()) {
                    var metricName = metricNames_1_1.value;
                    metricCompletion.set(metricName, { label: metricName, type: 'constant' });
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (metricNames_1_1 && !metricNames_1_1.done && (_a = metricNames_1.return)) _a.call(metricNames_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
            // avoid to get all metric metadata if the prometheus server is too big
            if (metricNames.length <= _this.maxMetricsMetadata) {
                // in order to enrich the completion list of the metric,
                // we are trying to find the associated metadata
                return (_b = _this.prometheusClient) === null || _b === void 0 ? void 0 : _b.metricMetadata();
            }
        })
            .then(function (metricMetadata) {
            var e_4, _a, e_5, _b;
            if (metricMetadata) {
                try {
                    for (var metricCompletion_1 = __values(metricCompletion), metricCompletion_1_1 = metricCompletion_1.next(); !metricCompletion_1_1.done; metricCompletion_1_1 = metricCompletion_1.next()) {
                        var _c = __read(metricCompletion_1_1.value, 2), metricName = _c[0], node = _c[1];
                        // For histograms and summaries, the metadata is only exposed for the base metric name,
                        // not separately for the _count, _sum, and _bucket time series.
                        var metadata = metricMetadata[metricName.replace(/(_count|_sum|_bucket)$/, '')];
                        if (metadata) {
                            if (metadata.length > 1) {
                                try {
                                    // it means the metricName has different possible helper and type
                                    for (var metadata_1 = (e_5 = void 0, __values(metadata)), metadata_1_1 = metadata_1.next(); !metadata_1_1.done; metadata_1_1 = metadata_1.next()) {
                                        var m = metadata_1_1.value;
                                        if (node.detail === '') {
                                            node.detail = m.type;
                                        }
                                        else if (node.detail !== m.type) {
                                            node.detail = 'unknown';
                                            node.info = 'multiple different definitions for this metric';
                                        }
                                        if (node.info === '') {
                                            node.info = m.help;
                                        }
                                        else if (node.info !== m.help) {
                                            node.info = 'multiple different definitions for this metric';
                                        }
                                    }
                                }
                                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                                finally {
                                    try {
                                        if (metadata_1_1 && !metadata_1_1.done && (_b = metadata_1.return)) _b.call(metadata_1);
                                    }
                                    finally { if (e_5) throw e_5.error; }
                                }
                            }
                            else if (metadata.length === 1) {
                                var _d = metadata[0], type = _d.type, help = _d.help;
                                if (type === 'histogram' || type === 'summary') {
                                    if (metricName.endsWith('_count')) {
                                        type = 'counter';
                                        help = "The total number of observations for: ".concat(help);
                                    }
                                    if (metricName.endsWith('_sum')) {
                                        type = 'counter';
                                        help = "The total sum of observations for: ".concat(help);
                                    }
                                    if (metricName.endsWith('_bucket')) {
                                        type = 'counter';
                                        help = "The total count of observations for a bucket in the histogram: ".concat(help);
                                    }
                                }
                                node.detail = type;
                                node.info = help;
                            }
                        }
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (metricCompletion_1_1 && !metricCompletion_1_1.done && (_a = metricCompletion_1.return)) _a.call(metricCompletion_1);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
            return result.concat(Array.from(metricCompletion.values()));
        });
    };
    HybridComplete.prototype.autocompleteLabelName = function (result, context) {
        if (!this.prometheusClient) {
            return result;
        }
        return this.prometheusClient.labelNames(context.metricName).then(function (labelNames) {
            return result.concat(labelNames.map(function (value) { return ({ label: value, type: 'constant' }); }));
        });
    };
    HybridComplete.prototype.autocompleteLabelValue = function (result, context) {
        if (!this.prometheusClient || !context.labelName) {
            return result;
        }
        return this.prometheusClient.labelValues(context.labelName, context.metricName, context.matchers).then(function (labelValues) {
            return result.concat(labelValues.map(function (value) { return ({ label: value, type: 'text' }); }));
        });
    };
    return HybridComplete;
}());
exports.HybridComplete = HybridComplete;
//# sourceMappingURL=hybrid.js.map