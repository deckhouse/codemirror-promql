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
exports.containsChild = exports.containsAtLeastOneChild = exports.walkBackward = void 0;
// walkBackward will iterate other the tree from the leaf to the root until it founds the given `exit` node.
// It returns null if the exit is not found.
function walkBackward(node, exit) {
    for (;;) {
        if (!node || node.type.id === exit) {
            return node;
        }
        node = node.parent;
    }
    return null;
}
exports.walkBackward = walkBackward;
function containsAtLeastOneChild(node) {
    var child = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        child[_i - 1] = arguments[_i];
    }
    var cursor = node.cursor();
    if (!cursor.next()) {
        // let's try to move directly to the children level and
        // return false immediately if the current node doesn't have any child
        return false;
    }
    var result = false;
    do {
        result = child.some(function (n) { return cursor.type.id === n || cursor.type.name === n; });
    } while (!result && cursor.nextSibling());
    return result;
}
exports.containsAtLeastOneChild = containsAtLeastOneChild;
function containsChild(node) {
    var child = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        child[_i - 1] = arguments[_i];
    }
    var cursor = node.cursor();
    if (!cursor.next()) {
        // let's try to move directly to the children level and
        // return false immediately if the current node doesn't have any child
        return false;
    }
    var i = 0;
    do {
        if (cursor.type.is(child[i])) {
            i++;
        }
    } while (i < child.length && cursor.nextSibling());
    return i >= child.length;
}
exports.containsChild = containsChild;
//# sourceMappingURL=path-finder.js.map