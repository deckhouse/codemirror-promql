import { EditorState } from '@codemirror/state';
import { SyntaxNode } from '@lezer/common';
import { VectorMatching } from '../types';
export declare function buildVectorMatching(state: EditorState, binaryNode: SyntaxNode): VectorMatching | null;
