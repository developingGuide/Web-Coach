import Editor from '@monaco-editor/react';

function CodeEditor({code, setCode}) {
  return (
    <Editor 
      height="90vh"
      defaultLanguage="html"
      defaultValue="// some comment"
      theme='vs-dark'
      value={code}
      onChange={(value) => setCode(value)}
    />
  )
}

export default CodeEditor