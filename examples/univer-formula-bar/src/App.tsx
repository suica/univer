import TextEditor from './Editor';

export default function App() {
    return (
        <div
            style={{
                border: '1px solid black',
                color: 'black',
                fontFamily: 'monospace',
                lineHeight: '30px',
                padding: '20px',
                margin: '30px',
            }}
            autoFocus
            spellCheck={false}
        >
            <TextEditor></TextEditor>
        </div>
    );
}
