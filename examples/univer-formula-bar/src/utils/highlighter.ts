import { tokenize } from 'excel-formula-tokenizer';

enum TokenKind {
    Function,
    Range,
    Number,
    LPar,
    RPar,
    Operator,
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
    console.log({ tokens });

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

export const highlightFormula = (text: string, cursorAt = 0) =>
    // const tokenBefore = () => {};
    // const posToToken = () => {};
    // FIXME: this tokenizer has no text range information, and does not handle blank correctly
    Promise.resolve(text).then(tokenize).then(markTokensWithRange).then(colorizeToken).then(tokenToString);
