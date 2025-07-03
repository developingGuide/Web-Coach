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
    image: "https://placehold.co/300x150",
    description: "Start your journey with HTML essentials",
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
  }, 
  {
    id: 2,
    name: 'CSS Basics',
    image: "https://placehold.co/300x150",
    description: "Learn how to style your pages with CSS",
    tasks: [
      {
        id: 101,
        title: 'Center a Div',
        subject: 'Client Request: Center This Box',
        sender: 'client3@webdevcoach.fake',
        description: 'Make a div that’s centered on the page.',
        body: 'Hey! I need a div that’s centered. Make it look nice!',
        startingCode: defaultTemplate,
        expectedOutput: `<div style="display:flex;justify-content:center;align-items:center;height:100vh;"><div>Centered Box</div></div>`
      },
      {
        id: 102,
        title: 'Add a Background Color',
        subject: 'Quick Task: Background Color',
        sender: 'client4@webdevcoach.fake',
        description: 'Add a background color to the page.',
        body: 'Can you change the background color to lightblue? Thanks!',
        startingCode: defaultTemplate,
        expectedOutput: `<body style="background-color:lightblue;"></body>`
      }
    ]
  }
];

export default projects;
