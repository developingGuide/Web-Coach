import Editor from "@monaco-editor/react";

function HtmlCodeEditor({code, setCode, matchOver}) {
  return (
    <Editor
      height="100%"
      defaultLanguage="html"
      defaultValue="<h1>Hello</h1>"
      theme="vs-dark"
      value={code}
      onChange={(value) => setCode(value)}
      options={{
        tabCompletion: "on", // enable tab completion for snippets
        quickSuggestions: true,
        suggestOnTriggerCharacters: true,
        autoClosingBrackets: "always",
        autoClosingQuotes: "always",
        readOnly: matchOver,
        minimap: { enabled: false },
      }}
      onMount={(editor, monaco) => {
        monaco.languages.registerCompletionItemProvider("html", {
          provideCompletionItems: () => {
            const tags = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "div", "section", "button", "form", "nav", "input", "li", "ul", "ol"];
            const suggestions = tags.map(tag => ({
              label: tag,
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: `<${tag}>$1</${tag}>`,
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: `${tag} tag`,
            }));
            return { suggestions };
          },
        });
      }}
    />
  );
}

export default HtmlCodeEditor