// tasks.js

const defaultTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>

  </style>
</head>
<body>
  

  <script>

  </script>
</body>
</html>`;


const projects = [
  {
    id: 1,
    name: 'HTML Basics',
    tasks: [
      {
        id: 1,
        title: 'Build a Navbar',
        description: 'Create a simple navigation bar with links for Home and About.',
        startingCode: defaultTemplate,
        expectedOutput: `<nav>\n  <ul>\n    <li><a href="#">Home</a></li>\n    <li><a href="#">About</a></li>\n  </ul>\n</nav>`
      },
      {
        id: 2,
        title: 'Add a Button',
        description: 'Create a button that says Click Me.',
        startingCode: defaultTemplate,
        expectedOutput: `<button>Click Me</button>`
      }
    ]
  }
];

export default projects;
