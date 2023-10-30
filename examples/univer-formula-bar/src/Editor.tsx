import React, { useEffect, useRef } from 'react';

import { highlightFormula } from './utils/highlighter';

// adapted from https://codepen.io/brianmearns/pen/YVjZWw

interface TextSegment {
    text: string;
    node: Node;
}

const TextEditor: React.FunctionComponent = () => {
    const editorRef = useRef<HTMLDivElement>(null);
    const selectionRef = useRef<HTMLDivElement>(null);

    const getTextSegments = (element: Node): TextSegment[] => {
        const textSegments: TextSegment[] = [];
        Array.from(element.childNodes).forEach((node: Node) => {
            switch (node.nodeType) {
                case Node.TEXT_NODE:
                    textSegments.push({ text: node.nodeValue || '', node });
                    break;

                case Node.ELEMENT_NODE:
                    textSegments.splice(
                        textSegments.length,
                        0,
                        ...(Array.isArray(getTextSegments(node)) ? getTextSegments(node) : [])
                    );
                    break;

                default:
                    throw new Error(`Unexpected node type: ${node.nodeType}`);
            }
        });
        return textSegments;
    };

    const updateEditor = async () => {
        const sel = window.getSelection();
        const editorElement = editorRef.current as HTMLDivElement;
        const textSegments = getTextSegments(editorElement);
        const textContent = textSegments.map(({ text }) => text).join('');
        let anchorIndex: number | null = null;
        let focusIndex: number | null = null;
        let currentIndex = 0;
        textSegments.forEach(({ text, node }) => {
            if (node === sel?.anchorNode) {
                anchorIndex = currentIndex + (sel?.anchorOffset ?? 0);
            }
            if (node === sel?.focusNode) {
                focusIndex = currentIndex + (sel?.focusOffset ?? 0);
            }
            currentIndex += text.length;
        });

        editorElement.innerHTML = await highlightFormula(textContent);

        restoreSelection(anchorIndex, focusIndex);
    };

    const restoreSelection = (absoluteAnchorIndex: number | null, absoluteFocusIndex: number | null): void => {
        const sel = window.getSelection();
        const editorElement = editorRef.current as HTMLDivElement;
        const textSegments = getTextSegments(editorElement);
        let anchorNode: Node = editorElement;
        let anchorIndex = 0;
        let focusNode: Node = editorElement;
        let focusIndex = 0;
        let currentIndex = 0;
        textSegments.forEach(({ text, node }) => {
            const startIndexOfNode = currentIndex;
            const endIndexOfNode = startIndexOfNode + text.length;
            if (
                startIndexOfNode <= (absoluteAnchorIndex as number) &&
                (absoluteAnchorIndex as number) <= endIndexOfNode
            ) {
                anchorNode = node;
                anchorIndex = (absoluteAnchorIndex as number) - startIndexOfNode;
            }
            if (
                startIndexOfNode <= (absoluteFocusIndex as number) &&
                (absoluteFocusIndex as number) <= endIndexOfNode
            ) {
                focusNode = node;
                focusIndex = (absoluteFocusIndex as number) - startIndexOfNode;
            }
            currentIndex += text.length;
        });

        sel!.setBaseAndExtent(anchorNode, anchorIndex, focusNode, focusIndex);
    };

    useEffect(() => {
        updateEditor();
        const editorElement = editorRef.current as HTMLDivElement;
        editorElement.addEventListener('input', updateEditor);
    }, []);

    return (
        <>
            <div id="editor" contentEditable ref={editorRef}>
                =ABS(A1-A3 ) + 3
            </div>
            <div id="selection" ref={selectionRef} />
        </>
    );
};

export default TextEditor;
