# TriSwift - Triathlon Activity Tracking Tool

**Live App**: https://triswift-frontend.fly.dev/

TriSwift is a full-stack fitness tracking app designed specifically with traithletes in mind. It enables users to log and track swimming, cycling, and running workouts, either individually or as part of a triathlon, including transition times between activities. The app provides running totals, automated personal records and target pace calculator functions.

Features & Guide

# User Authentication
- Sign up, log in, and access protected routes using JWT-based authentication.
- New users can sign up via the `/signup` page with name, email, and password.
- Returning users log in on the `/login` page. A valid token is stored locally to keep them logged in (1-hour expiry).
- Logging out clears the token and redirects to the login screen.

# Session & Activity Logging
- Log swim, bike, or run activities — individually or as multi-sport triathlon sessions.
- Navigate to `/dashboard` to view past sessions.
- Click "Add Session" to log a new workout.
- Choose a session type (Run, Swim, Bike, or Multi-Sport), date, and opitonally add weather details.
- Click "Next" to move to Activity Form.

- For Run, Swim or Bike Session types, enter a time and distance, and optionally heart rate and other meterics.
- Click "Submit Activity" to save the activity to the session.

- Activities include distance (km or meters), duration, heart rate, and more.

-Transition Tracking: T1 & T2 times between activities
-Personal Records: Automatically genreated based on added activities.
-Pace Calculator: Tool to calcualte pace for target race times.

-GraphQL API for Optimized Queries
-Dockerized Deployment & CI/CD Pipeline

Backend Tech Stack
-Node.js + Express – Server-side logic
-PostgreSQL – Relational database for structured workout data
-GraphQL + Apollo Server – Optimized API querying
-JWT Authentication – Secure user authentication
-Docker – Containerized backend setup
-CI/CD with GitHub Actions – Automated deployment


Frontend Tech Stack
-React + TypeScript – Modern UI development
-Apollo Client – GraphQL data fetching


Contact Details
-Email: swilliamson_0907@outlook.com
-Github: https://github.com/samw0907/TriSwift

Working hours diary can be found in the workingHoursDiary.md in the TriSwift root directory.