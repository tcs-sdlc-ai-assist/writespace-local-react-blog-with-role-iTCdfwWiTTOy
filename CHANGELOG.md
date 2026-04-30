# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-06-01

### Added

- **Public Landing Page** — Adaptive navbar, hero section with gradient background, feature highlights grid, latest posts preview, and footer.
- **Authentication** — Login and registration forms with gradient card UI, client-side validation, and session management via localStorage.
- **Blog CRUD** — Full create, read, edit, and delete functionality for blog posts with title/content validation and character counters.
- **Blog List** — Responsive grid layout (1/2/3 columns) displaying post cards with title, excerpt, author avatar, date, and edit icon.
- **Blog Read View** — Full post display with author avatar, display name, formatted date, edit/delete controls, and back navigation.
- **Blog Edit/Create Form** — Shared form component for creating new posts and editing existing ones with ownership enforcement.
- **Admin Dashboard** — Gradient banner, stat cards (total posts, users, admins, regular users), quick-action buttons, and recent posts list with edit/delete controls.
- **User Management** — Admin-only page with responsive table/card list of all users, create user form with role selection, and delete functionality.
- **Role-Based Access Control** — Two roles (admin, user) with route guards via ProtectedRoute component. Admins can manage all content and users; regular users can only manage their own posts.
- **Default Admin Account** — Hardcoded admin account (username: `admin`, password: `admin`) that cannot be deleted.
- **Session Management** — Session read/write/clear helpers persisting to `writespace_session` in localStorage.
- **User Persistence** — User CRUD helpers persisting to `writespace_users` in localStorage with validation and duplicate detection.
- **Blog Persistence** — Blog CRUD helpers persisting to `writespace_blogs` in localStorage with UUID generation, ownership checks, and validation.
- **Navigation** — Authenticated navbar with role-based links, avatar chip with display name, logout dropdown, mobile hamburger menu, and active link highlighting.
- **Confirmation Dialogs** — Reusable modal component for delete confirmations on posts and users.
- **Avatar Component** — Role-based avatar display (crown emoji for admin, book emoji for user) with customizable styling.
- **Stat Card Component** — Reusable card for displaying labeled numeric values with icons on the admin dashboard.
- **Responsive Design** — Tailwind CSS utility-first styling with mobile-first responsive breakpoints across all pages.
- **Client-Side Routing** — React Router v6 with public routes, authenticated routes, and admin-only routes.
- **Vercel Deployment** — Configuration file with SPA rewrites for client-side routing support.
- **Test Suite** — Comprehensive unit tests for session, users, and blogs utilities, plus integration tests for routing and access control using Vitest and Testing Library.