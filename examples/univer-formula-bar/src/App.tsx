import TextEditor from './Editor';

export default function App() {
    return (
        <div
            style={{
                width: '100vw',
                border: '1px solid black',
                color: 'black',
                fontFamily: 'monospace',
                lineHeight: '30px',
            }}
            autoFocus
        >
            <TextEditor></TextEditor>
        </div>
    );
}
