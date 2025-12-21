# 🏊‍♂️ TriSwift – Triathlon Activity Tracking Tool

Live App: [https://triswift-frontend.fly.dev](https://triswift-frontend.fly.dev)  
GitHub: [samw0907/TriSwift](https://github.com/samw0907/TriSwift)

---

## Overview

TriSwift is a full-stack activity tracking app built specifically for triathletes.  
It enables users to log swim, bike, and run workouts — individually or as part of a multi-sport triathlon — including transition times between disciplines.

TriSwift automatically calculates personal records, provides a target pace calculator, and visualizes training totals across multiple timeframes.

---

## Core Features

- Secure Authentication – Sign up, log in, and access protected routes via JWT-based authentication.  
- Multi-Sport Session Logging – Record swim, bike, run, and transition segments within one session.  
- Session Dashboard – Filter and sort past workouts by sport, distance, or date.  
- Personal Records – Automatically updated best times per distance and discipline.  
- Totals Graphs – Interactive distance and duration charts for progress tracking.  
- Pace Calculator – Calculate required pace or speed to hit race goals.  

---

## Tech Stack

Frontend:  
React · TypeScript · Apollo Client · React Router · Playwright · Vitest  

Backend:  
Node.js · Express · GraphQL (Apollo Server) · PostgreSQL · Sequelize · JWT Auth  

Infrastructure: 
Docker · GitHub Actions (CI/CD) · Fly.io (Frontend + Backend + PostgreSQL)

---

## Architecture Overview

TriSwift follows a*modular full-stack architecture:
- Backend: Express + GraphQL API for querying sessions, activities, and user data.
- Frontend: React + Apollo Client for real-time state and GraphQL data management.
- Database: PostgreSQL for structured relational storage (users, sessions, activities, transitions, personal records).
- Authentication: JWT tokens stored client-side with one-hour expiry.
- Deployment: Containerized with Docker, deployed to Fly.io with CI/CD via GitHub Actions.

---

## Screens & Pages

- `/login` – User login  
- `/signup` – New user registration  
- `/dashboard` – View, add, and edit sessions  
- `/records` – Automatically calculated personal bests  
- `/home` – Overview of totals and performance charts  
- `/paceCalculator` – Race pace estimation tool  

---

## Future Enhancements

- Integration with the Strava API for importing external activities  
- Map-based progress visualizations  
- Push notifications for training reminders  
- Dark/light theme synchronization  

---

## About the Developer

Sam Williamson – Full Stack Developer  
 swilliamson_0907@outlook.com  
 [Portfolio](https://samwilliamson.dev) (coming soon)  
 [GitHub](https://github.com/samw0907)

---

## Development Summary

Total project time: ~175 hours (Open University Final Project)  
Time log available in [`workingHoursDiary.md`](./workingHoursDiary.md)
