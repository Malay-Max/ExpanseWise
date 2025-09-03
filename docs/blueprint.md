# **App Name**: ExpenseWise

## Core Features:

- Expense Submission API: Create a Next.js API endpoint (/api/expenses) to receive expense data from n8n in JSON format. This endpoint will validate the data and store it in a Firestore database, automatically logging the date.
- Dashboard Summaries: Show summary cards for total spending today, this week, and this month.
- Category Spending Chart: Visualize spending by category using a pie or bar chart.
- Payment Method Chart: Visualize spending by payment method using a donut chart.
- Transaction Table: Display recent transactions in a sortable and filterable table.
- Date Filtering Tool: Let users filter transactions by specifying date ranges. The LLM is not used in this feature, but the word 'tool' appears, which is correct behavior according to the spec.
- Authentication Wall: Require login via Firebase Authentication to access the dashboard and expense pages.

## Style Guidelines:

- Primary color: A muted, sophisticated blue (#6699CC) to evoke trust and financial responsibility.
- Background color: A light, desaturated blue (#F0F4F8), close in hue to the primary color but light enough to create a clean backdrop.
- Accent color: A contrasting coral (#FF7F50) to draw attention to important actions and elements.
- Headline font: 'Belleza', a sans-serif for headings; body font: 'Alegreya', a serif for readability.
- Use clean, minimalist icons from a set like Font Awesome or Remix Icon for navigation and categories.
- Implement a responsive layout with a sidebar for navigation and a main content area for dashboards and lists.
- Use subtle transitions and animations to provide feedback on user interactions and improve the overall experience.