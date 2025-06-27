import Editor from "@monaco-editor/react";

function HtmlCodeEditor({code, setCode, matchOver}) {
  return (
    <Editor
      height="100%"
      defaultLanguage="html"
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
            const tags = [
              "h1",
              "h2",
              "h3",
              "h4",
              "h5",
              "h6",
              "p",
              "div",
              "section",
              "button",
              "form",
              "nav",
              "input",
              "li",
              "ul",
              "ol",
              "a"
            ];
            const tagSuggestions = tags.map(tag => ({
              label: tag,
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: `<${tag}>$1</${tag}>`,
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: `${tag} tag`,
            }));

            const boilerplateSnippet = {
              label: "!",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>$1</title>
</head>
<body>
  $2
</body>
</html>`,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: "Basic HTML5 boilerplate",
              filterText: "!",
              range: {
                startLineNumber: editor.getPosition().lineNumber,
                startColumn: editor.getPosition().column - 1, // go back 1 character to remove "!"
                endLineNumber: editor.getPosition().lineNumber,
                endColumn: editor.getPosition().column,
              },
            };

            return {
              suggestions: [...tagSuggestions, boilerplateSnippet],
            };
          },
          triggerCharacters: ["!"],
        });
      }}
    />
  );
}

export default HtmlCodeEditor