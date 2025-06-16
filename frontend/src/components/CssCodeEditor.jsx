import Editor from '@monaco-editor/react';

function CssCodeEditor({code, setCode, matchOver}) {
    return (
        <Editor
        height="100%"
        language="css"
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value)}
        options={{
            tabCompletion: "on",
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
            readOnly: matchOver,
            minimap: { enabled: false },
        }}
        onMount={(editor, monaco) => {
            monaco.languages.registerCompletionItemProvider("css", {
            provideCompletionItems: () => {
                const snippets = [
                {
                    label: "flex",
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: "display: flex;",
                    documentation: "Apply flexbox layout",
                },
                {
                    label: "m10",
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: "margin: 10px;",
                    documentation: "Set margin to 10px",
                },
                {
                    label: "center-flex",
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: `display: flex;\njustify-content: center;\nalign-items: center;`,
                    documentation: "Center content using flexbox",
                },
                ];

                return { suggestions: snippets };
            },
            });
        }}
        />
    )
}

export default CssCodeEditor