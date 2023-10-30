import { tokenize } from 'excel-formula-tokenizer';

enum TokenKind {
    Function = 'function',
    Range = 'range',
    Number = 'number',
    LPar = 'lpar',
    RPar = 'rpar',
    Operator = 'operator',
}

const TokenKindToColor: Record<TokenKind, string> = {
    [TokenKind.Function]: 'black',
    [TokenKind.Range]: 'orange',
    [TokenKind.Number]: 'blue',
    [TokenKind.Operator]: 'red',
    [TokenKind.LPar]: 'grey',
    [TokenKind.RPar]: 'grey',
};

type Token = ReturnType<typeof tokenize>[number];

interface TokenWithRange {
    start: number;
    end: number;
    value: string;
    kind: TokenKind;
}

interface ColorizedToken extends TokenWithRange {
    color: string;
    background?: string;
}

function markTokensWithRange(tokens: Token[]): TokenWithRange[] {
    const tokensWithRange: TokenWithRange[] = [];
    let lengthSum = 0;
    for (const token of tokens) {
        switch (token.type) {
            case 'function':
                if (token.subtype === 'start') {
                    const functionToken: TokenWithRange = {
                        start: lengthSum,
                        end: lengthSum + token.value.length,
                        kind: TokenKind.Function,
                        value: token.value,
                    };
                    lengthSum += token.value.length;
                    tokensWithRange.push(functionToken);
                    const lParToken: TokenWithRange = {
                        start: lengthSum,
                        end: lengthSum + 1,
                        kind: TokenKind.LPar,
                        value: '(',
                    };
                    tokensWithRange.push(lParToken);
                    lengthSum++;
                    break;
                } else {
                    const rParToken: TokenWithRange = {
                        start: lengthSum,
                        end: lengthSum + 1,
                        kind: TokenKind.RPar,
                        value: ')',
                    };
                    tokensWithRange.push(rParToken);
                    lengthSum++;
                    break;
                }
            case 'operand':
                if (token.subtype === 'range') {
                    if (/[.*0-9]/.test(token.value)) {
                        const numToken: TokenWithRange = {
                            start: lengthSum,
                            end: lengthSum + token.value.length,
                            kind: TokenKind.Range,
                            value: token.value,
                        };
                        tokensWithRange.push(numToken);
                        lengthSum += numToken.value.length;
                        // return `<span style='color:orange'>${token.value}</span>`;
                    } else {
                        // unknown
                        const unknownFunctionToken: TokenWithRange = {
                            start: lengthSum,
                            end: lengthSum + token.value.length,
                            kind: TokenKind.Function,
                            value: token.value,
                        };
                        tokensWithRange.push(unknownFunctionToken);
                        lengthSum += unknownFunctionToken.value.length;
                    }
                    break;
                } else if (token.subtype === 'number') {
                    const numberToken: TokenWithRange = {
                        start: lengthSum,
                        end: lengthSum + token.value.length,
                        kind: TokenKind.Number,
                        value: token.value,
                    };
                    tokensWithRange.push(numberToken);
                    lengthSum += numberToken.value.length;
                    break;
                }
                break;
            default:
                if (token.type.startsWith('operator')) {
                    const operatorToken: TokenWithRange = {
                        start: lengthSum,
                        end: lengthSum + token.value.length,
                        kind: TokenKind.Operator,
                        value: token.value,
                    };
                    tokensWithRange.push(operatorToken);
                }
                lengthSum += token.value.length;
        }
    }
    return tokensWithRange;
}

function colorizeToken(tokens: TokenWithRange[]): ColorizedToken[] {
    const res: ColorizedToken[] = [];
    return tokens.map((token): ColorizedToken => {
        const color = TokenKindToColor[token.kind];
        return { ...token, color };
    });
}

function tokenToString(tokens: ColorizedToken[]): string {
    return tokens
        .map((token) => {
            const color = `color: ${token.color}`;
            const background = token.background ? `background: ${token.background}` : '';
            return `<span style='${color};${background}'>${token.value}</span>`;
        })
        .join('');
}
const getCompletionList = (tokens: TokenWithRange[], cursorAt: number | undefined): CompletionItem[] => {
    if (cursorAt === undefined) {
        return [];
    }
    const allFunctions: CompletionItem[] = [
        {
            title: 'ABS',
            subtitle: '绝对值函数',
        },
        {
            title: 'SIN',
            subtitle: '正弦函数',
        },
        {
            title: 'ASIN',
            subtitle: '反正弦函数',
        },
        {
            title: 'SUM',
            subtitle: '求和函数',
        },
    ];
    const tokenAtCursor = tokens.find((token) => cursorAt === token.end && token.kind === TokenKind.Function);
    if (tokenAtCursor === undefined) {
        return [];
    }
    const searchValue = tokenAtCursor?.value ?? '';
    const items: CompletionItem[] = allFunctions.filter((x) =>
        x.title.toLowerCase().startsWith(searchValue.toLowerCase())
    );
    return items;
};

function isPar(token: TokenWithRange) {
    return [TokenKind.LPar, TokenKind.RPar].includes(token.kind);
}

const MatchedPairBackgroundColor = '#ddd';
const UnmatchedPairBackgroundColor = '#ff8080';

const parenthesesMatching = (colorizedTokens: ColorizedToken[], cursorAt: number) => {
    const indexOfToken = colorizedTokens.findIndex((token) => cursorAt === token.end && isPar(token));

    if (indexOfToken >= 0) {
        const token = colorizedTokens[indexOfToken];
        token.background = MatchedPairBackgroundColor;
        let matchedToken = null;
        let balanceCounter = 0;
        if (token.kind === TokenKind.RPar) {
            for (let i = indexOfToken; i >= 0; i--) {
                if (colorizedTokens[i].kind === TokenKind.LPar) {
                    balanceCounter--;
                } else if (colorizedTokens[i].kind === TokenKind.RPar) {
                    balanceCounter++;
                }
                if (balanceCounter === 0) {
                    matchedToken = colorizedTokens[i];
                    break;
                }
            }
        } else if (token.kind === TokenKind.LPar) {
            for (let i = indexOfToken; i < colorizedTokens.length; i++) {
                if (colorizedTokens[i].kind === TokenKind.LPar) {
                    balanceCounter--;
                } else if (colorizedTokens[i].kind === TokenKind.RPar) {
                    balanceCounter++;
                }
                if (balanceCounter === 0) {
                    matchedToken = colorizedTokens[i];
                    break;
                }
            }
        }
        token.background = UnmatchedPairBackgroundColor;
        if (matchedToken) {
            token.background = matchedToken.background = MatchedPairBackgroundColor;
        }
    }
    return colorizedTokens;
};
export interface CompletionItem {
    title: string;
    subtitle: string;
    value?: string;
}

export const highlightFormula = async (text: string, cursorAt: number) =>
    // const tokenBefore = () => {};
    // const posToToken = () => {};
    // FIXME: this tokenizer has no genuine text range information, hence only works for formulas with no spaces
    Promise.resolve(text)
        .then(tokenize)
        .then(markTokensWithRange)
        .then(colorizeToken)
        .then((x) => parenthesesMatching(x, cursorAt))
        .then((tokens) => {
            const output = tokenToString(tokens);
            const completionList = getCompletionList(tokens, cursorAt);
            return { output, completionList };
        });
