import { SyntaxNode } from '@lezer/common';
export declare function walkBackward(node: SyntaxNode | null, exit: number): SyntaxNode | null;
export declare function containsAtLeastOneChild(node: SyntaxNode, ...child: (number | string)[]): boolean;
export declare function containsChild(node: SyntaxNode, ...child: (number | string)[]): boolean;
