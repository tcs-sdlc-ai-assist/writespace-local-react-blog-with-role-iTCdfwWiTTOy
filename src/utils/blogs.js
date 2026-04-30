import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'writespace_blogs';

/**
 * Retrieves all blog posts from localStorage, sorted newest-first.
 * @returns {Array<{ id: string, title: string, content: string, author: string, authorDisplay: string, authorRole: string, created: string, updated: string }>} Array of blog post objects.
 */
export function getBlogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const blogs = JSON.parse(raw);
    if (!Array.isArray(blogs)) {
      return [];
    }
    return blogs.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
  } catch (e) {
    console.error('Failed to read blogs from localStorage:', e);
    return [];
  }
}

/**
 * Finds a blog post by id.
 * @param {string} id - The post id to search for.
 * @returns {{ id: string, title: string, content: string, author: string, authorDisplay: string, authorRole: string, created: string, updated: string } | null} The blog post object or null if not found.
 */
export function findBlog(id) {
  if (!id || typeof id !== 'string') {
    return null;
  }
  const blogs = getBlogs();
  const blog = blogs.find((b) => b.id === id);
  return blog || null;
}

/**
 * Adds a new blog post to localStorage.
 * @param {{ title: string, content: string, author: string, authorDisplay: string, authorRole: string }} post - The post to add.
 * @throws {Error} If validation fails or localStorage write fails.
 */
export function addBlog(post) {
  if (!post || typeof post !== 'object') {
    throw new Error('Invalid post object');
  }

  const { title, content, author, authorDisplay, authorRole } = post;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    throw new Error('Title is required');
  }

  if (title.trim().length > 100) {
    throw new Error('Title must be at most 100 characters');
  }

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new Error('Content is required');
  }

  if (content.trim().length > 2000) {
    throw new Error('Content must be at most 2000 characters');
  }

  if (!author || typeof author !== 'string') {
    throw new Error('Author is required');
  }

  if (!authorDisplay || typeof authorDisplay !== 'string') {
    throw new Error('Author display name is required');
  }

  if (!authorRole || typeof authorRole !== 'string') {
    throw new Error('Author role is required');
  }

  const now = new Date().toISOString();

  const newPost = {
    id: uuidv4(),
    title: title.trim(),
    content: content.trim(),
    author: author,
    authorDisplay: authorDisplay,
    authorRole: authorRole,
    created: now,
    updated: now,
  };

  const blogs = getBlogs();
  blogs.push(newPost);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blogs));
  } catch (e) {
    console.error('Failed to write blogs to localStorage:', e);
    throw new Error('Failed to save blog post. localStorage may be full or unavailable.');
  }
}

/**
 * Updates a blog post by id.
 * @param {string} id - The id of the post to update.
 * @param {{ title?: string, content?: string }} updates - The fields to update.
 * @param {{ username: string, role: string }} currentUser - The currently logged-in user.
 * @throws {Error} If the post is not found, the user is unauthorized, validation fails, or localStorage write fails.
 */
export function updateBlog(id, updates, currentUser) {
  if (!id || typeof id !== 'string') {
    throw new Error('Post id is required');
  }

  if (!updates || typeof updates !== 'object') {
    throw new Error('Updates object is required');
  }

  if (!currentUser || typeof currentUser !== 'object' || !currentUser.username || !currentUser.role) {
    throw new Error('Current user is required');
  }

  const blogs = getBlogs();
  const index = blogs.findIndex((b) => b.id === id);

  if (index === -1) {
    throw new Error('Blog post not found');
  }

  const blog = blogs[index];

  if (currentUser.role !== 'admin' && blog.author !== currentUser.username) {
    throw new Error('You are not authorized to edit this post');
  }

  if (updates.title !== undefined) {
    if (typeof updates.title !== 'string' || updates.title.trim().length === 0) {
      throw new Error('Title is required');
    }
    if (updates.title.trim().length > 100) {
      throw new Error('Title must be at most 100 characters');
    }
    blog.title = updates.title.trim();
  }

  if (updates.content !== undefined) {
    if (typeof updates.content !== 'string' || updates.content.trim().length === 0) {
      throw new Error('Content is required');
    }
    if (updates.content.trim().length > 2000) {
      throw new Error('Content must be at most 2000 characters');
    }
    blog.content = updates.content.trim();
  }

  blog.updated = new Date().toISOString();
  blogs[index] = blog;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blogs));
  } catch (e) {
    console.error('Failed to write blogs to localStorage:', e);
    throw new Error('Failed to update blog post. localStorage may be full or unavailable.');
  }
}

/**
 * Deletes a blog post by id.
 * @param {string} id - The id of the post to delete.
 * @param {{ username: string, role: string }} currentUser - The currently logged-in user.
 * @throws {Error} If the post is not found, the user is unauthorized, or localStorage write fails.
 */
export function deleteBlog(id, currentUser) {
  if (!id || typeof id !== 'string') {
    throw new Error('Post id is required');
  }

  if (!currentUser || typeof currentUser !== 'object' || !currentUser.username || !currentUser.role) {
    throw new Error('Current user is required');
  }

  const blogs = getBlogs();
  const index = blogs.findIndex((b) => b.id === id);

  if (index === -1) {
    throw new Error('Blog post not found');
  }

  const blog = blogs[index];

  if (currentUser.role !== 'admin' && blog.author !== currentUser.username) {
    throw new Error('You are not authorized to delete this post');
  }

  blogs.splice(index, 1);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blogs));
  } catch (e) {
    console.error('Failed to write blogs to localStorage:', e);
    throw new Error('Failed to delete blog post. localStorage may be full or unavailable.');
  }
}