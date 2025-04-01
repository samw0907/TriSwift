# TriSwift - Triathlon Activity Tracking Tool

**Live App**:` https://triswift-frontend.fly.dev/ `

TriSwift is a full-stack fitness tracking app designed specifically with traithletes in mind. It enables users to log and track swimming, cycling, and running workouts, either individually or as part of a triathlon, including transition times between activities. The app provides running totals, automated personal records and target pace calculator functions.

------------------------------
### Features & Guide ###

# User Authentication
- Sign up, log in, and access protected routes using JWT-based authentication.
- New users can sign up via the `/signup` page with name, email, and password.
- Returning users log in on the `/login` page. A valid token is stored locally to keep them logged in (1-hour expiry).
- Logging out clears the token and redirects to the login screen.

# Landing Page
- Displayed at any of the routes when not logged in, displays links for `/login` or `/signup` and explains the features.

# Session & Activity Logging
- Log swim, bike, or run activities — individually or as multi-sport triathlon sessions.
- Navigate to `/dashboard` to view past sessions.
- Click `Add Session` to log a new workout.
- Choose a session type (Run, Swim, Bike, or Multi-Sport), date, and opitonally add weather details.
- Click `Next` to move to Activity Form.

- For Run, Swim or Bike Session types, enter a time and distance, and optionally heart rate and other metrics.
- Click `Submit Activity` to save the activity to the session.

- For Multisport Session types, select and an activity type, enter a time, and optionally heart rate and other metrics
- Click `Submit Activity` to save the activity and move to the transition form.
- Enter Previous and Next sports, and enter a transtion time, and optioanlly comments.
- Click `Submit Transition` to save the transition and move to the next activity form.
- Continue this for as many activities/transtions as desired and when finished click `Save & Close`.

- Sessions are displayed as cards that can be expanded with `Show Details`, edited, or deleted.
- Clicking `Show Details` also brings up the acitivty detials, allowing editing and deleting of activities

# Session Filters & Sorting
- Use the `Show Filters` button on the dashboard to narrow down sessions by sport type, date, and distance range.
- Sorting can also be applied based on date (asc, desc) or distance (asc, desc).

# Home
- Navigate to `/home` to view.
- Displays explanantion of features and running totals for each sport type over differnet time periods.
- Displays a `Totals Graph` filterable by sport and time period, showing total distances acheived over time.

# Personal Records
- Automatically calculated based on your saved activities.
- Navigate to `/records` to view record tables
- Filter by sport, each table showing best 3 results for a range of event distances.
- Records are updated automatically when better results are logged, or activites are edited.

# Pace Calculator
- Estimate the average pace required to meet target race times.
- Navigate to `paceCalculator` in the navbar.
- Select a sport, select a preset race distance or enter a cusotm distace, then enter a target finish time.
- The tool displays required pace to hit your goal (min/km Runs, min/100m Swims, km/h Bikes).

-------------------------------------

# Backend Tech Stack
-Node.js + Express – Server-side logic
-PostgreSQL – Relational database for structured workout data
-GraphQL + Apollo Server – Optimized API querying
-JWT Authentication – Secure user authentication
-Docker – Containerized backend setup
-CI/CD with GitHub Actions – Automated deployment

# Frontend Tech Stack
-React + TypeScript – Modern UI development
-Apollo Client – GraphQL data fetching

---------------------------------------------------

# Contact Details
-Email: swilliamson_0907@outlook.com
-Github: https://github.com/samw0907/TriSwift

# Time Diary
Working hours diary can be found in the workingHoursDiary.md in the TriSwift root directory.