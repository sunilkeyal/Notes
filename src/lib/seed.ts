import type { Note } from "@/types";

export const SEED_NOTES: Note[] = [
  {
    id: "root-1",
    title: "Meeting Notes",
    type: "folder",
    isExpanded: true,
    lastUpdated: "2025-05-28T14:30:00Z",
    children: [
      {
        id: "note-1",
        title: "Sprint Planning",
        type: "note",
        content:
          "<h1>Sprint Planning — Week 24</h1><p><strong>Date:</strong> Monday, June 1</p><h2>Attendees</h2><ul><li>Alice (PM)</li><li>Bob (Dev)</li><li>Carol (Design)</li></ul><h2>Agenda</h2><ol><li>Review last sprint</li><li>Prioritize backlog</li><li>Assign tasks</li></ol><blockquote>Focus on shipping the dashboard MVP by Friday.</blockquote>",
        children: [],
        lastUpdated: "2025-05-28T14:30:00Z",
      },
      {
        id: "note-2",
        title: "Design Review",
        type: "note",
        content:
          "<h1>Design Review</h1><p>Reviewed the new <u>component library</u> mockups. Overall direction looks solid.</p><h2>Feedback</h2><ul><li>Increase contrast on secondary buttons</li><li>Add <em>hover states</em> for cards</li><li>Consistent border radius across all inputs</li></ul>",
        children: [],
        lastUpdated: "2025-05-27T10:15:00Z",
      },
    ],
  },
  {
    id: "root-2",
    title: "Personal",
    type: "folder",
    isExpanded: true,
    lastUpdated: "2025-05-30T09:00:00Z",
    children: [
      {
        id: "note-3",
        title: "Reading List",
        type: "note",
        content:
          "<h1>Reading List</h1><p>Books and articles to read this quarter:</p><ul><li><p><strong>Atomic Habits</strong> — James Clear</p></li><li><p><strong>Designing Data-Intensive Applications</strong> — Martin Kleppmann</p></li><li><p><a href='https://react.dev'>React 19 documentation</a></p></li></ul>",
        children: [],
        lastUpdated: "2025-05-26T18:45:00Z",
      },
      {
        id: "note-4",
        title: "Travel Plans",
        type: "note",
        content:
          "<h1>Summer Trip</h1><p>Planning a trip to <strong>Japan</strong> in October.</p><h2>To-Do</h2><ul><li><p>Book flights — <s>NRT</s> HND</p></li><li><p>Reserve hotels in Tokyo &amp; Kyoto</p></li><li><p>Get <em>Pocket Wi-Fi</em></p></li></ul><p><br/></p>",
        children: [],
        lastUpdated: "2025-05-25T22:00:00Z",
      },
      {
        id: "note-5",
        title: "Recipes",
        type: "note",
        content:
          "<h1>Favorite Recipes</h1><p>A collection of go-to recipes.</p><h2>Pasta Aglio e Olio</h2><p>Simple garlic and oil pasta. Ready in 15 minutes.</p>",
        children: [],
        lastUpdated: "2025-05-24T16:20:00Z",
      },
      {
        id: "note-6",
        title: "Pasta Carbonara",
        type: "note",
        content:
          "<h1>Carbonara</h1><p>The <em>real</em> Italian way — <strong>no cream</strong>.</p><h2>Ingredients</h2><ul><li><p>Spaghetti</p></li><li><p>Guanciale</p></li><li><p>Eggs</p></li><li><p>Pecorino Romano</p></li></ul>",
        children: [],
        lastUpdated: "2025-05-23T11:10:00Z",
      },
    ],
  },
  {
    id: "note-7",
    title: "Project Ideas",
    type: "note",
    content:
      "<h1>Side Projects</h1><p>A running list of ideas I want to explore:</p><ol><li><p>Open-source <code>markdown</code> editor</p></li><li><p>CLI tool for API scaffolding</p></li><li><p>Dashboard for personal finances</p></li></ol>",
    children: [],
    lastUpdated: "2025-05-22T08:30:00Z",
  },
];
