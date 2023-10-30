import React, { useCallback, useEffect, useRef, useState } from 'react';

import { CompletionItem, highlightFormula } from './utils/highlighter';

// adapted from https://codepen.io/brianmearns/pen/YVjZWw

interface TextSegment {
    text: string;
    node: Node;
}

function CompletionList({ list, cursor }: { list: CompletionItem[]; cursor: number }) {
    if (list.length === 0) {
        return <div>HIDDEN</div>;
    }
    return (
        <ul>
            {list.map((item, index) => {
                const selected = index === cursor;
                return (
                    <li style={{ background: selected ? '#ddd' : undefined, width: '400px' }}>
                        <span style={{ fontSize: '20px' }}>{item.title}</span>
                        {selected ? <div style={{ fontSize: '15px', color: 'grey' }}>{item.subtitle}</div> : undefined}
                    </li>
                );
            })}
        </ul>
    );
}

function useCompletionListManager() {
    const [cursor, setCursor] = useState(0);
    const [completionList, setCompletionList] = useState<CompletionItem[]>([]);
    const listRef = useRef(completionList);
    const moveCursorUp = useCallback(() => {
        const length = listRef.current.length;
        if (length) {
            setCursor((cursor - 1 + length) % length);
        } else {
            setCursor(0);
        }
    }, [completionList.length, cursor]);
    const moveCursorDown = useCallback(() => {
        const length = listRef.current.length;
        if (length) {
            setCursor((cursor + 1) % length);
        } else {
            setCursor(0);
        }
    }, [completionList.length, cursor]);
    return {
        cursor,
        completionList,
        setCompletionList: (list: CompletionItem[]) => {
            setCompletionList(list);
            listRef.current = list;
        },
        moveCursorDown,
        moveCursorUp,
    };
}

const TextEditor: React.FunctionComponent = () => {
    const { completionList, cursor, setCompletionList, moveCursorDown, moveCursorUp } = useCompletionListManager();

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

        const { completionList, output } = await highlightFormula(textContent, anchorIndex ?? 0);
        editorElement.innerHTML = output;

        setCompletionList(completionList);

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

    const updateCompletionList = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                moveCursorUp();
            } else if (e.code === 'ArrowDown') {
                e.preventDefault();
                moveCursorDown();
            } else if (e.code === 'Tab') {
                e.preventDefault();
            }
        },
        [moveCursorDown, moveCursorUp]
    );

    useEffect(() => {
        updateEditor();
        const editorElement = editorRef.current as HTMLDivElement;
        // TODO: remove listener
        editorElement.addEventListener('input', updateEditor);
        editorElement.addEventListener('keydown', updateCompletionList);
        return () => {
            editorElement.removeEventListener('input', updateEditor);
            editorElement.removeEventListener('keydown', updateCompletionList);
        };
    }, [updateCompletionList]);

    return (
        <>
            <div id="editor" contentEditable ref={editorRef} style={{ padding: '5px' }}>
                =ABS(A1-A3 ) + 3
            </div>
            <div id="selection" ref={selectionRef} />
            <br />
            <div>Completion List</div>
            <CompletionList list={completionList} cursor={cursor}></CompletionList>
        </>
    );
};

export default TextEditor;
