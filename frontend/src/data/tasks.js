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
        subject: 'New Task: Build a Navbar',
        sender: 'client1@webdevcoach.fake',
        description: 'Create a simple navigation bar with links for Home and About.',
        body: 'Hey Dev! I need a basic navbar with links to Home and About. Should be clean and simple.',
        startingCode: defaultTemplate,
        expectedOutput: `<nav>\n  <ul>\n    <li><a href="#">Home</a></li>\n    <li><a href="#">About</a></li>\n  </ul>\n</nav>`
      },
      {
        id: 2,
        title: 'Add a Button',
        subject: 'Urgent: Add a Call-to-Action Button',
        sender: 'client2@webdevcoach.fake',
        description: 'Create a button that says Click Me.',
        body: 'Can you add a button that says "Click Me"? It should be visible on the homepage.',
        startingCode: defaultTemplate,
        expectedOutput: `<button>Click Me</button>`
      }
    ]
  }
];

export default projects;
