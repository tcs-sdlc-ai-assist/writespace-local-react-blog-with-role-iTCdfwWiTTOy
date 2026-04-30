# WriteSpace

A distraction-free writing platform built with React and Vite. WriteSpace lets users create, read, edit, and delete blog posts in a clean, minimal interface with role-based access control — all powered by localStorage.

## Tech Stack

- **React 18** — UI framework
- **Vite 5** — Build tool and dev server
- **React Router 6** — Client-side routing
- **Tailwind CSS 3** — Utility-first styling
- **Vitest** — Unit and component testing
- **Testing Library** — React component testing utilities
- **uuid** — Unique ID generation for posts
- **PropTypes** — Runtime prop validation

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens the app at [http://localhost:5173](http://localhost:5173).

### Build

```bash
npm run build
```

Outputs production-ready files to the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Run Tests

```bash
npm run test
```

## Folder Structure

```
writespace/
├── index.html                  # HTML entry point
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── vitest.config.js            # Vitest configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── vercel.json                 # Vercel deployment config
├── .env.example                # Example environment variables
├── src/
│   ├── main.jsx                # React entry point
│   ├── App.jsx                 # Router and route definitions
│   ├── App.test.jsx            # Integration tests for routing
│   ├── index.css               # Tailwind CSS imports
│   ├── components/
│   │   ├── Avatar.jsx          # Role-based avatar component
│   │   ├── BlogCard.jsx        # Blog post summary card
│   │   ├── ConfirmDialog.jsx   # Reusable confirmation modal
│   │   ├── Navbar.jsx          # Authenticated navigation bar
│   │   ├── ProtectedRoute.jsx  # Route guard with auth/role checks
│   │   └── StatCard.jsx        # Admin dashboard stat card
│   ├── pages/
│   │   ├── LandingPage.jsx     # Public landing page
│   │   ├── LoginPage.jsx       # Login form
│   │   ├── RegisterPage.jsx    # Registration form
│   │   ├── BlogListPage.jsx    # Blog post listing
│   │   ├── BlogReadPage.jsx    # Full blog post view
│   │   ├── BlogEditPage.jsx    # Create/edit blog post form
│   │   ├── AdminDashboard.jsx  # Admin overview dashboard
│   │   └── UserManagement.jsx  # Admin user CRUD
│   ├── utils/
│   │   ├── session.js          # Session read/write/clear helpers
│   │   ├── session.test.js     # Session utility tests
│   │   ├── users.js            # User CRUD helpers
│   │   ├── users.test.js       # User utility tests
│   │   ├── blogs.js            # Blog CRUD helpers
│   │   └── blogs.test.js       # Blog utility tests
│   └── tests/
│       └── setup.js            # Test setup (jest-dom)
```

## Route Map

| Path              | Component         | Access          |
| ----------------- | ----------------- | --------------- |
| `/`               | LandingPage       | Public          |
| `/login`          | LoginPage         | Public          |
| `/register`       | RegisterPage      | Public          |
| `/blogs`          | BlogListPage      | Authenticated   |
| `/blogs/new`      | BlogEditPage      | Authenticated   |
| `/blogs/:id`      | BlogReadPage      | Authenticated   |
| `/blogs/:id/edit` | BlogEditPage      | Authenticated   |
| `/admin`          | AdminDashboard    | Admin only      |
| `/admin/users`    | UserManagement    | Admin only      |

## Role-Based Access Control

| Action                  | Admin | User  |
| ----------------------- | ----- | ----- |
| View all blog posts     | ✅    | ✅    |
| Create blog posts       | ✅    | ✅    |
| Edit own blog posts     | ✅    | ✅    |
| Edit any blog post      | ✅    | ❌    |
| Delete own blog posts   | ✅    | ✅    |
| Delete any blog post    | ✅    | ❌    |
| Access admin dashboard  | ✅    | ❌    |
| Manage users            | ✅    | ❌    |
| Delete any user         | ✅    | ❌    |

### Default Admin Account

- **Username:** `admin`
- **Password:** `admin`

The admin account is hardcoded and cannot be deleted.

## localStorage Schema

All data is persisted in the browser's localStorage under the following keys:

### `writespace_session`

```json
{
  "username": "jdoe",
  "role": "user",
  "displayName": "Jane Doe"
}
```

### `writespace_users`

```json
[
  {
    "username": "jdoe",
    "displayName": "Jane Doe",
    "password": "pass1234",
    "role": "user",
    "created": "2024-06-01T12:00:00.000Z"
  }
]
```

### `writespace_blogs`

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "My First Post",
    "content": "Hello world!",
    "author": "jdoe",
    "authorDisplay": "Jane Doe",
    "authorRole": "user",
    "created": "2024-06-01T12:00:00.000Z",
    "updated": "2024-06-01T12:00:00.000Z"
  }
]
```

## Environment Variables

Environment variables are optional. Copy `.env.example` to `.env.local` to customize:

| Variable         | Description              | Default      |
| ---------------- | ------------------------ | ------------ |
| `VITE_APP_TITLE` | Application title        | `WriteSpace` |

## Deployment

### Vercel

The project includes a `vercel.json` with SPA rewrites configured. To deploy:

1. Push the repository to GitHub, GitLab, or Bitbucket.
2. Import the project in [Vercel](https://vercel.com).
3. Vercel auto-detects Vite — no additional configuration needed.
4. The build command (`vite build`) and output directory (`dist`) are detected automatically.

Alternatively, deploy via the Vercel CLI:

```bash
npx vercel --prod
```

### Other Platforms

For any static hosting platform:

1. Run `npm run build` to generate the `dist/` directory.
2. Upload the contents of `dist/` to your hosting provider.
3. Configure a catch-all rewrite so all routes serve `index.html` (required for client-side routing).

## License

Private — All rights reserved.