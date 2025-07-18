import { Editor } from "@monaco-editor/react";

function JsCodeEditor({code, setCode, matchOver}) {
  return (
    <Editor
    height="100%"
      language="javascript"
      theme="vs-dark"
      value={code}
      onChange={(value) => setCode(value)}
      options={{
        tabCompletion: "on",
        quickSuggestions: true,
        suggestOnTriggerCharacters: true,
        wordBasedSuggestions: true,
        readOnly: matchOver,
        minimap: { enabled: false },
      }}
      onMount={(editor, monaco) => {
        monaco.languages.registerCompletionItemProvider("javascript", {
          provideCompletionItems: () => {
            const suggestions = [
              {
                label: "clg",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: "console.log($1);",
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "Console log",
              },
              {
                label: "fn",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: "function $1() {\n\t$2\n}",
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "Function declaration",
              },
              {
                label: "afn",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: "const $1 = ($2) => {\n\t$3\n};",
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "Arrow function",
              },
            ];
            return { suggestions };
          },
        });
      }}
    />
  );
}

export default JsCodeEditor