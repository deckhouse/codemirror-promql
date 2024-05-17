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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getType = void 0;
var lezer_promql_1 = require("@prometheus-io/lezer-promql");
var types_1 = require("../types");
// Based on https://github.com/prometheus/prometheus/blob/d668a7efe3107dbdcc67bf4e9f12430ed8e2b396/promql/parser/ast.go#L191
function getType(node) {
    var _a;
    if (!node) {
        return types_1.ValueType.none;
    }
    switch (node.type.id) {
        case lezer_promql_1.AggregateExpr:
            return types_1.ValueType.vector;
        case lezer_promql_1.VectorSelector:
            return types_1.ValueType.vector;
        case lezer_promql_1.OffsetExpr:
            return getType(node.firstChild);
        case lezer_promql_1.StringLiteral:
            return types_1.ValueType.string;
        case lezer_promql_1.NumberLiteral:
            return types_1.ValueType.scalar;
        case lezer_promql_1.MatrixSelector:
            return types_1.ValueType.matrix;
        case lezer_promql_1.SubqueryExpr:
            return types_1.ValueType.matrix;
        case lezer_promql_1.ParenExpr:
            return getType(node.getChild('Expr'));
        case lezer_promql_1.UnaryExpr:
            return getType(node.getChild('Expr'));
        case lezer_promql_1.BinaryExpr:
            var lt = getType(node.firstChild);
            var rt = getType(node.lastChild);
            if (lt === types_1.ValueType.scalar && rt === types_1.ValueType.scalar) {
                return types_1.ValueType.scalar;
            }
            return types_1.ValueType.vector;
        case lezer_promql_1.FunctionCall:
            var funcNode = (_a = node.firstChild) === null || _a === void 0 ? void 0 : _a.firstChild;
            if (!funcNode) {
                return types_1.ValueType.none;
            }
            return (0, types_1.getFunction)(funcNode.type.id).returnType;
        case lezer_promql_1.StepInvariantExpr:
            return getType(node.getChild('Expr'));
        default:
            return types_1.ValueType.none;
    }
}
exports.getType = getType;
//# sourceMappingURL=type.js.map