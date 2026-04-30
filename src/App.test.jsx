import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { setSession, clearSession } from './utils/session';
import { addUser } from './utils/users';
import { addBlog } from './utils/blogs';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('public routes', () => {
    it('renders the landing page at /', () => {
      render(<App />);
      expect(screen.getByText('Your Space to')).toBeInTheDocument();
      expect(screen.getByText('Write')).toBeInTheDocument();
    });

    it('renders the login page at /login', async () => {
      // We need to render App and navigate to /login
      render(<App />);
      const loginLinks = screen.getAllByText('Login');
      // Click the first login link
      await userEvent.click(loginLinks[0]);
      await waitFor(() => {
        expect(screen.getByText('Welcome back')).toBeInTheDocument();
      });
    });

    it('renders the register page at /register', async () => {
      render(<App />);
      const getStartedLinks = screen.getAllByText(/Get Started/);
      await userEvent.click(getStartedLinks[0]);
      await waitFor(() => {
        expect(screen.getByText('Create your account')).toBeInTheDocument();
      });
    });
  });

  describe('protected route redirects', () => {
    it('redirects unauthenticated users from /blogs to /login', async () => {
      // Clear any session
      clearSession();

      render(<App />);

      // Manually navigate by going to login and checking redirect behavior
      // We'll use window.history to simulate navigation
      window.history.pushState({}, '', '/blogs');
      render(<App />);

      await waitFor(() => {
        expect(screen.getAllByText('Welcome back').length).toBeGreaterThan(0);
      });
    });

    it('redirects unauthenticated users from /admin to /login', async () => {
      clearSession();

      window.history.pushState({}, '', '/admin');
      render(<App />);

      await waitFor(() => {
        expect(screen.getAllByText('Welcome back').length).toBeGreaterThan(0);
      });
    });

    it('redirects unauthenticated users from /admin/users to /login', async () => {
      clearSession();

      window.history.pushState({}, '', '/admin/users');
      render(<App />);

      await waitFor(() => {
        expect(screen.getAllByText('Welcome back').length).toBeGreaterThan(0);
      });
    });
  });

  describe('role-based access control', () => {
    it('allows authenticated user to access /blogs', async () => {
      setSession({ username: 'testuser', role: 'user', displayName: 'Test User' });

      window.history.pushState({}, '', '/blogs');
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('All Blog Posts')).toBeInTheDocument();
      });
    });

    it('redirects non-admin user from /admin to /blogs', async () => {
      setSession({ username: 'testuser', role: 'user', displayName: 'Test User' });

      window.history.pushState({}, '', '/admin');
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('All Blog Posts')).toBeInTheDocument();
      });
    });

    it('redirects non-admin user from /admin/users to /blogs', async () => {
      setSession({ username: 'testuser', role: 'user', displayName: 'Test User' });

      window.history.pushState({}, '', '/admin/users');
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('All Blog Posts')).toBeInTheDocument();
      });
    });

    it('allows admin to access /admin', async () => {
      setSession({ username: 'admin', role: 'admin', displayName: 'Admin' });

      window.history.pushState({}, '', '/admin');
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });
    });

    it('allows admin to access /admin/users', async () => {
      setSession({ username: 'admin', role: 'admin', displayName: 'Admin' });

      window.history.pushState({}, '', '/admin/users');
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument();
      });
    });
  });

  describe('blog routes', () => {
    it('renders the blog create page at /blogs/new for authenticated users', async () => {
      setSession({ username: 'testuser', role: 'user', displayName: 'Test User' });

      window.history.pushState({}, '', '/blogs/new');
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Write a New Post')).toBeInTheDocument();
      });
    });

    it('renders the blog read page for an existing post', async () => {
      setSession({ username: 'testuser', role: 'user', displayName: 'Test User' });

      addBlog({
        title: 'Test Blog Post',
        content: 'This is test content for the blog post.',
        author: 'testuser',
        authorDisplay: 'Test User',
        authorRole: 'user',
      });

      const blogs = JSON.parse(localStorage.getItem('writespace_blogs'));
      const postId = blogs[0].id;

      window.history.pushState({}, '', `/blogs/${postId}`);
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
        expect(screen.getByText('This is test content for the blog post.')).toBeInTheDocument();
      });
    });

    it('shows post not found for invalid blog id', async () => {
      setSession({ username: 'testuser', role: 'user', displayName: 'Test User' });

      window.history.pushState({}, '', '/blogs/nonexistent-id');
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Post not found')).toBeInTheDocument();
      });
    });

    it('renders the blog edit page for an existing post owned by user', async () => {
      setSession({ username: 'testuser', role: 'user', displayName: 'Test User' });

      addBlog({
        title: 'Editable Post',
        content: 'Content to edit.',
        author: 'testuser',
        authorDisplay: 'Test User',
        authorRole: 'user',
      });

      const blogs = JSON.parse(localStorage.getItem('writespace_blogs'));
      const postId = blogs[0].id;

      window.history.pushState({}, '', `/blogs/${postId}/edit`);
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Edit Post')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Editable Post')).toBeInTheDocument();
      });
    });
  });

  describe('login flow', () => {
    it('redirects already authenticated user away from login page', async () => {
      setSession({ username: 'testuser', role: 'user', displayName: 'Test User' });

      window.history.pushState({}, '', '/login');
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('All Blog Posts')).toBeInTheDocument();
      });
    });

    it('redirects already authenticated admin away from login page to admin', async () => {
      setSession({ username: 'admin', role: 'admin', displayName: 'Admin' });

      window.history.pushState({}, '', '/login');
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument();
      });
    });

    it('redirects already authenticated user away from register page', async () => {
      setSession({ username: 'testuser', role: 'user', displayName: 'Test User' });

      window.history.pushState({}, '', '/register');
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('All Blog Posts')).toBeInTheDocument();
      });
    });
  });

  describe('navigation', () => {
    it('renders navbar with correct links for authenticated user', async () => {
      setSession({ username: 'testuser', role: 'user', displayName: 'Test User' });

      window.history.pushState({}, '', '/blogs');
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('All Blogs')).toBeInTheDocument();
        expect(screen.getByText('Write')).toBeInTheDocument();
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });
    });

    it('renders navbar with Users link for admin', async () => {
      setSession({ username: 'admin', role: 'admin', displayName: 'Admin' });

      window.history.pushState({}, '', '/admin');
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Users')).toBeInTheDocument();
      });
    });

    it('does not render Users link for regular user', async () => {
      setSession({ username: 'testuser', role: 'user', displayName: 'Test User' });

      window.history.pushState({}, '', '/blogs');
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('All Blog Posts')).toBeInTheDocument();
      });

      expect(screen.queryByText('Users')).not.toBeInTheDocument();
    });

    it('navigates to blog list when clicking All Blogs link', async () => {
      setSession({ username: 'testuser', role: 'user', displayName: 'Test User' });

      addBlog({
        title: 'Navigation Test Post',
        content: 'Content for navigation test.',
        author: 'testuser',
        authorDisplay: 'Test User',
        authorRole: 'user',
      });

      window.history.pushState({}, '', '/blogs/new');
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Write a New Post')).toBeInTheDocument();
      });

      const allBlogsLink = screen.getByText('All Blogs');
      await userEvent.click(allBlogsLink);

      await waitFor(() => {
        expect(screen.getByText('All Blog Posts')).toBeInTheDocument();
      });
    });
  });

  describe('empty states', () => {
    it('shows empty state on blog list when no posts exist', async () => {
      setSession({ username: 'testuser', role: 'user', displayName: 'Test User' });

      window.history.pushState({}, '', '/blogs');
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('No posts yet')).toBeInTheDocument();
        expect(screen.getByText('Write Your First Post')).toBeInTheDocument();
      });
    });
  });
});