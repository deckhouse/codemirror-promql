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
exports.buildVectorMatching = void 0;
var lezer_promql_1 = require("@prometheus-io/lezer-promql");
var types_1 = require("../types");
var path_finder_1 = require("./path-finder");
function buildVectorMatching(state, binaryNode) {
    var e_1, _a, e_2, _b;
    if (!binaryNode || binaryNode.type.id !== lezer_promql_1.BinaryExpr) {
        return null;
    }
    var result = {
        card: types_1.VectorMatchCardinality.CardOneToOne,
        matchingLabels: [],
        on: false,
        include: [],
    };
    var modifierClause = binaryNode.getChild(lezer_promql_1.MatchingModifierClause);
    if (modifierClause) {
        result.on = modifierClause.getChild(lezer_promql_1.On) !== null;
        var labelNode = modifierClause.getChild(lezer_promql_1.GroupingLabels);
        var labels = labelNode ? labelNode.getChildren(lezer_promql_1.LabelName) : [];
        try {
            for (var labels_1 = __values(labels), labels_1_1 = labels_1.next(); !labels_1_1.done; labels_1_1 = labels_1.next()) {
                var label = labels_1_1.value;
                result.matchingLabels.push(state.sliceDoc(label.from, label.to));
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (labels_1_1 && !labels_1_1.done && (_a = labels_1.return)) _a.call(labels_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var groupLeft = modifierClause.getChild(lezer_promql_1.GroupLeft);
        var groupRight = modifierClause.getChild(lezer_promql_1.GroupRight);
        var group = groupLeft || groupRight;
        if (group) {
            result.card = groupLeft ? types_1.VectorMatchCardinality.CardManyToOne : types_1.VectorMatchCardinality.CardOneToMany;
            var labelNode_1 = group.nextSibling;
            var labels_3 = (labelNode_1 === null || labelNode_1 === void 0 ? void 0 : labelNode_1.getChildren(lezer_promql_1.LabelName)) || [];
            try {
                for (var labels_2 = __values(labels_3), labels_2_1 = labels_2.next(); !labels_2_1.done; labels_2_1 = labels_2.next()) {
                    var label = labels_2_1.value;
                    result.include.push(state.sliceDoc(label.from, label.to));
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (labels_2_1 && !labels_2_1.done && (_b = labels_2.return)) _b.call(labels_2);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
    }
    var isSetOperator = (0, path_finder_1.containsAtLeastOneChild)(binaryNode, lezer_promql_1.And, lezer_promql_1.Or, lezer_promql_1.Unless);
    if (isSetOperator && result.card === types_1.VectorMatchCardinality.CardOneToOne) {
        result.card = types_1.VectorMatchCardinality.CardManyToMany;
    }
    return result;
}
exports.buildVectorMatching = buildVectorMatching;
//# sourceMappingURL=vector.js.map