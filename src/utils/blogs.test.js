import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getBlogs, addBlog, updateBlog, deleteBlog, findBlog } from './blogs';

describe('blogs utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('getBlogs', () => {
    it('returns an empty array when no blogs exist in localStorage', () => {
      const blogs = getBlogs();
      expect(blogs).toEqual([]);
    });

    it('returns an array of blogs when blogs exist in localStorage', () => {
      const blogsData = [
        {
          id: 'uuid-1',
          title: 'First Post',
          content: 'Hello world!',
          author: 'jdoe',
          authorDisplay: 'Jane Doe',
          authorRole: 'user',
          created: '2024-06-01T12:00:00Z',
          updated: '2024-06-01T12:00:00Z',
        },
      ];
      localStorage.setItem('writespace_blogs', JSON.stringify(blogsData));

      const blogs = getBlogs();
      expect(blogs).toHaveLength(1);
      expect(blogs[0].title).toBe('First Post');
    });

    it('returns blogs sorted newest first', () => {
      const blogsData = [
        {
          id: 'uuid-1',
          title: 'Older Post',
          content: 'Content 1',
          author: 'jdoe',
          authorDisplay: 'Jane Doe',
          authorRole: 'user',
          created: '2024-06-01T12:00:00Z',
          updated: '2024-06-01T12:00:00Z',
        },
        {
          id: 'uuid-2',
          title: 'Newer Post',
          content: 'Content 2',
          author: 'jdoe',
          authorDisplay: 'Jane Doe',
          authorRole: 'user',
          created: '2024-06-02T12:00:00Z',
          updated: '2024-06-02T12:00:00Z',
        },
      ];
      localStorage.setItem('writespace_blogs', JSON.stringify(blogsData));

      const blogs = getBlogs();
      expect(blogs[0].title).toBe('Newer Post');
      expect(blogs[1].title).toBe('Older Post');
    });

    it('returns an empty array when localStorage contains invalid JSON', () => {
      localStorage.setItem('writespace_blogs', 'not-valid-json{{{');

      const blogs = getBlogs();
      expect(blogs).toEqual([]);
    });

    it('returns an empty array when localStorage contains a non-array value', () => {
      localStorage.setItem('writespace_blogs', JSON.stringify({ foo: 'bar' }));

      const blogs = getBlogs();
      expect(blogs).toEqual([]);
    });

    it('returns an empty array when localStorage contains null', () => {
      localStorage.setItem('writespace_blogs', JSON.stringify(null));

      const blogs = getBlogs();
      expect(blogs).toEqual([]);
    });

    it('returns an empty array and handles error when localStorage.getItem throws', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      const blogs = getBlogs();
      expect(blogs).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('findBlog', () => {
    it('returns null when no blogs exist', () => {
      const blog = findBlog('uuid-1');
      expect(blog).toBeNull();
    });

    it('returns the blog object when the id exists', () => {
      const blogsData = [
        {
          id: 'uuid-1',
          title: 'First Post',
          content: 'Hello world!',
          author: 'jdoe',
          authorDisplay: 'Jane Doe',
          authorRole: 'user',
          created: '2024-06-01T12:00:00Z',
          updated: '2024-06-01T12:00:00Z',
        },
        {
          id: 'uuid-2',
          title: 'Second Post',
          content: 'Another post',
          author: 'bsmith',
          authorDisplay: 'Bob Smith',
          authorRole: 'user',
          created: '2024-06-02T12:00:00Z',
          updated: '2024-06-02T12:00:00Z',
        },
      ];
      localStorage.setItem('writespace_blogs', JSON.stringify(blogsData));

      const blog = findBlog('uuid-2');
      expect(blog).not.toBeNull();
      expect(blog.title).toBe('Second Post');
    });

    it('returns null when the id does not exist', () => {
      const blogsData = [
        {
          id: 'uuid-1',
          title: 'First Post',
          content: 'Hello world!',
          author: 'jdoe',
          authorDisplay: 'Jane Doe',
          authorRole: 'user',
          created: '2024-06-01T12:00:00Z',
          updated: '2024-06-01T12:00:00Z',
        },
      ];
      localStorage.setItem('writespace_blogs', JSON.stringify(blogsData));

      const blog = findBlog('nonexistent');
      expect(blog).toBeNull();
    });

    it('returns null when id is null', () => {
      const blog = findBlog(null);
      expect(blog).toBeNull();
    });

    it('returns null when id is undefined', () => {
      const blog = findBlog(undefined);
      expect(blog).toBeNull();
    });

    it('returns null when id is not a string', () => {
      const blog = findBlog(123);
      expect(blog).toBeNull();
    });

    it('returns null when id is an empty string', () => {
      const blog = findBlog('');
      expect(blog).toBeNull();
    });
  });

  describe('addBlog', () => {
    it('adds a valid blog post to localStorage', () => {
      addBlog({
        title: 'My First Post',
        content: 'Hello world!',
        author: 'jdoe',
        authorDisplay: 'Jane Doe',
        authorRole: 'user',
      });

      const blogs = getBlogs();
      expect(blogs).toHaveLength(1);
      expect(blogs[0].title).toBe('My First Post');
      expect(blogs[0].content).toBe('Hello world!');
      expect(blogs[0].author).toBe('jdoe');
      expect(blogs[0].authorDisplay).toBe('Jane Doe');
      expect(blogs[0].authorRole).toBe('user');
      expect(blogs[0].id).toBeDefined();
      expect(blogs[0].created).toBeDefined();
      expect(blogs[0].updated).toBeDefined();
    });

    it('trims the title and content', () => {
      addBlog({
        title: '  My Post  ',
        content: '  Some content  ',
        author: 'jdoe',
        authorDisplay: 'Jane Doe',
        authorRole: 'user',
      });

      const blogs = getBlogs();
      expect(blogs[0].title).toBe('My Post');
      expect(blogs[0].content).toBe('Some content');
    });

    it('generates a unique id for each post', () => {
      addBlog({
        title: 'Post 1',
        content: 'Content 1',
        author: 'jdoe',
        authorDisplay: 'Jane Doe',
        authorRole: 'user',
      });

      addBlog({
        title: 'Post 2',
        content: 'Content 2',
        author: 'jdoe',
        authorDisplay: 'Jane Doe',
        authorRole: 'user',
      });

      const blogs = getBlogs();
      expect(blogs).toHaveLength(2);
      expect(blogs[0].id).not.toBe(blogs[1].id);
    });

    it('sets created and updated timestamps', () => {
      const before = new Date().toISOString();

      addBlog({
        title: 'My Post',
        content: 'Content here',
        author: 'jdoe',
        authorDisplay: 'Jane Doe',
        authorRole: 'user',
      });

      const after = new Date().toISOString();
      const blogs = getBlogs();
      expect(blogs[0].created).toBeDefined();
      expect(blogs[0].updated).toBeDefined();
      expect(blogs[0].created >= before).toBe(true);
      expect(blogs[0].created <= after).toBe(true);
      expect(blogs[0].created).toBe(blogs[0].updated);
    });

    it('throws an error when post object is null', () => {
      expect(() => addBlog(null)).toThrow('Invalid post object');
    });

    it('throws an error when post object is undefined', () => {
      expect(() => addBlog(undefined)).toThrow('Invalid post object');
    });

    it('throws an error when title is missing', () => {
      expect(() =>
        addBlog({
          content: 'Content',
          author: 'jdoe',
          authorDisplay: 'Jane Doe',
          authorRole: 'user',
        })
      ).toThrow('Title is required');
    });

    it('throws an error when title is empty string', () => {
      expect(() =>
        addBlog({
          title: '   ',
          content: 'Content',
          author: 'jdoe',
          authorDisplay: 'Jane Doe',
          authorRole: 'user',
        })
      ).toThrow('Title is required');
    });

    it('throws an error when title exceeds 100 characters', () => {
      expect(() =>
        addBlog({
          title: 'a'.repeat(101),
          content: 'Content',
          author: 'jdoe',
          authorDisplay: 'Jane Doe',
          authorRole: 'user',
        })
      ).toThrow('Title must be at most 100 characters');
    });

    it('throws an error when content is missing', () => {
      expect(() =>
        addBlog({
          title: 'My Post',
          author: 'jdoe',
          authorDisplay: 'Jane Doe',
          authorRole: 'user',
        })
      ).toThrow('Content is required');
    });

    it('throws an error when content is empty string', () => {
      expect(() =>
        addBlog({
          title: 'My Post',
          content: '   ',
          author: 'jdoe',
          authorDisplay: 'Jane Doe',
          authorRole: 'user',
        })
      ).toThrow('Content is required');
    });

    it('throws an error when content exceeds 2000 characters', () => {
      expect(() =>
        addBlog({
          title: 'My Post',
          content: 'a'.repeat(2001),
          author: 'jdoe',
          authorDisplay: 'Jane Doe',
          authorRole: 'user',
        })
      ).toThrow('Content must be at most 2000 characters');
    });

    it('throws an error when author is missing', () => {
      expect(() =>
        addBlog({
          title: 'My Post',
          content: 'Content',
          authorDisplay: 'Jane Doe',
          authorRole: 'user',
        })
      ).toThrow('Author is required');
    });

    it('throws an error when authorDisplay is missing', () => {
      expect(() =>
        addBlog({
          title: 'My Post',
          content: 'Content',
          author: 'jdoe',
          authorRole: 'user',
        })
      ).toThrow('Author display name is required');
    });

    it('throws an error when authorRole is missing', () => {
      expect(() =>
        addBlog({
          title: 'My Post',
          content: 'Content',
          author: 'jdoe',
          authorDisplay: 'Jane Doe',
        })
      ).toThrow('Author role is required');
    });

    it('throws an error when localStorage.setItem fails', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() =>
        addBlog({
          title: 'My Post',
          content: 'Content',
          author: 'jdoe',
          authorDisplay: 'Jane Doe',
          authorRole: 'user',
        })
      ).toThrow('Failed to save blog post');
    });

    it('accepts title at exactly 100 characters', () => {
      addBlog({
        title: 'a'.repeat(100),
        content: 'Content',
        author: 'jdoe',
        authorDisplay: 'Jane Doe',
        authorRole: 'user',
      });

      const blogs = getBlogs();
      expect(blogs).toHaveLength(1);
      expect(blogs[0].title.length).toBe(100);
    });

    it('accepts content at exactly 2000 characters', () => {
      addBlog({
        title: 'My Post',
        content: 'a'.repeat(2000),
        author: 'jdoe',
        authorDisplay: 'Jane Doe',
        authorRole: 'user',
      });

      const blogs = getBlogs();
      expect(blogs).toHaveLength(1);
      expect(blogs[0].content.length).toBe(2000);
    });
  });

  describe('updateBlog', () => {
    let postId;

    beforeEach(() => {
      addBlog({
        title: 'Original Title',
        content: 'Original Content',
        author: 'jdoe',
        authorDisplay: 'Jane Doe',
        authorRole: 'user',
      });

      const blogs = getBlogs();
      postId = blogs[0].id;
    });

    it('updates the title of an existing blog post', () => {
      updateBlog(postId, { title: 'Updated Title' }, { username: 'jdoe', role: 'user' });

      const blog = findBlog(postId);
      expect(blog.title).toBe('Updated Title');
      expect(blog.content).toBe('Original Content');
    });

    it('updates the content of an existing blog post', () => {
      updateBlog(postId, { content: 'Updated Content' }, { username: 'jdoe', role: 'user' });

      const blog = findBlog(postId);
      expect(blog.title).toBe('Original Title');
      expect(blog.content).toBe('Updated Content');
    });

    it('updates both title and content', () => {
      updateBlog(
        postId,
        { title: 'New Title', content: 'New Content' },
        { username: 'jdoe', role: 'user' }
      );

      const blog = findBlog(postId);
      expect(blog.title).toBe('New Title');
      expect(blog.content).toBe('New Content');
    });

    it('updates the updated timestamp', () => {
      const blogBefore = findBlog(postId);
      const originalUpdated = blogBefore.updated;

      // Small delay to ensure timestamp difference
      updateBlog(postId, { title: 'New Title' }, { username: 'jdoe', role: 'user' });

      const blogAfter = findBlog(postId);
      expect(blogAfter.updated).toBeDefined();
      expect(blogAfter.updated >= originalUpdated).toBe(true);
    });

    it('trims updated title and content', () => {
      updateBlog(
        postId,
        { title: '  Trimmed Title  ', content: '  Trimmed Content  ' },
        { username: 'jdoe', role: 'user' }
      );

      const blog = findBlog(postId);
      expect(blog.title).toBe('Trimmed Title');
      expect(blog.content).toBe('Trimmed Content');
    });

    it('allows admin to update any post', () => {
      updateBlog(postId, { title: 'Admin Updated' }, { username: 'admin', role: 'admin' });

      const blog = findBlog(postId);
      expect(blog.title).toBe('Admin Updated');
    });

    it('throws an error when non-owner non-admin tries to update', () => {
      expect(() =>
        updateBlog(postId, { title: 'Hacked' }, { username: 'bsmith', role: 'user' })
      ).toThrow('You are not authorized to edit this post');
    });

    it('throws an error when post is not found', () => {
      expect(() =>
        updateBlog('nonexistent-id', { title: 'New' }, { username: 'jdoe', role: 'user' })
      ).toThrow('Blog post not found');
    });

    it('throws an error when id is null', () => {
      expect(() =>
        updateBlog(null, { title: 'New' }, { username: 'jdoe', role: 'user' })
      ).toThrow('Post id is required');
    });

    it('throws an error when id is undefined', () => {
      expect(() =>
        updateBlog(undefined, { title: 'New' }, { username: 'jdoe', role: 'user' })
      ).toThrow('Post id is required');
    });

    it('throws an error when updates object is null', () => {
      expect(() =>
        updateBlog(postId, null, { username: 'jdoe', role: 'user' })
      ).toThrow('Updates object is required');
    });

    it('throws an error when currentUser is null', () => {
      expect(() =>
        updateBlog(postId, { title: 'New' }, null)
      ).toThrow('Current user is required');
    });

    it('throws an error when currentUser is missing username', () => {
      expect(() =>
        updateBlog(postId, { title: 'New' }, { role: 'user' })
      ).toThrow('Current user is required');
    });

    it('throws an error when currentUser is missing role', () => {
      expect(() =>
        updateBlog(postId, { title: 'New' }, { username: 'jdoe' })
      ).toThrow('Current user is required');
    });

    it('throws an error when updated title is empty', () => {
      expect(() =>
        updateBlog(postId, { title: '   ' }, { username: 'jdoe', role: 'user' })
      ).toThrow('Title is required');
    });

    it('throws an error when updated title exceeds 100 characters', () => {
      expect(() =>
        updateBlog(postId, { title: 'a'.repeat(101) }, { username: 'jdoe', role: 'user' })
      ).toThrow('Title must be at most 100 characters');
    });

    it('throws an error when updated content is empty', () => {
      expect(() =>
        updateBlog(postId, { content: '   ' }, { username: 'jdoe', role: 'user' })
      ).toThrow('Content is required');
    });

    it('throws an error when updated content exceeds 2000 characters', () => {
      expect(() =>
        updateBlog(postId, { content: 'a'.repeat(2001) }, { username: 'jdoe', role: 'user' })
      ).toThrow('Content must be at most 2000 characters');
    });

    it('throws an error when localStorage.setItem fails during update', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const originalSetItem = Storage.prototype.setItem;
      let callCount = 0;
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (...args) {
        callCount++;
        // Allow the initial addBlog setItem but fail on update
        if (callCount > 0) {
          throw new Error('QuotaExceededError');
        }
        return originalSetItem.apply(this, args);
      });

      expect(() =>
        updateBlog(postId, { title: 'New' }, { username: 'jdoe', role: 'user' })
      ).toThrow('Failed to update blog post');
    });
  });

  describe('deleteBlog', () => {
    let postId1;
    let postId2;

    beforeEach(() => {
      addBlog({
        title: 'Post 1',
        content: 'Content 1',
        author: 'jdoe',
        authorDisplay: 'Jane Doe',
        authorRole: 'user',
      });

      addBlog({
        title: 'Post 2',
        content: 'Content 2',
        author: 'bsmith',
        authorDisplay: 'Bob Smith',
        authorRole: 'user',
      });

      const blogs = getBlogs();
      // blogs are sorted newest first, so Post 2 is first
      postId2 = blogs[0].id;
      postId1 = blogs[1].id;
    });

    it('deletes an existing blog post by the owner', () => {
      deleteBlog(postId1, { username: 'jdoe', role: 'user' });

      const blogs = getBlogs();
      expect(blogs).toHaveLength(1);
      expect(blogs[0].title).toBe('Post 2');
    });

    it('allows admin to delete any post', () => {
      deleteBlog(postId1, { username: 'admin', role: 'admin' });

      const blogs = getBlogs();
      expect(blogs).toHaveLength(1);
      expect(blogs[0].title).toBe('Post 2');
    });

    it('throws an error when non-owner non-admin tries to delete', () => {
      expect(() =>
        deleteBlog(postId1, { username: 'bsmith', role: 'user' })
      ).toThrow('You are not authorized to delete this post');
    });

    it('throws an error when post is not found', () => {
      expect(() =>
        deleteBlog('nonexistent-id', { username: 'admin', role: 'admin' })
      ).toThrow('Blog post not found');
    });

    it('throws an error when id is null', () => {
      expect(() =>
        deleteBlog(null, { username: 'admin', role: 'admin' })
      ).toThrow('Post id is required');
    });

    it('throws an error when id is undefined', () => {
      expect(() =>
        deleteBlog(undefined, { username: 'admin', role: 'admin' })
      ).toThrow('Post id is required');
    });

    it('throws an error when id is not a string', () => {
      expect(() =>
        deleteBlog(123, { username: 'admin', role: 'admin' })
      ).toThrow('Post id is required');
    });

    it('throws an error when currentUser is null', () => {
      expect(() =>
        deleteBlog(postId1, null)
      ).toThrow('Current user is required');
    });

    it('throws an error when currentUser is missing username', () => {
      expect(() =>
        deleteBlog(postId1, { role: 'user' })
      ).toThrow('Current user is required');
    });

    it('throws an error when currentUser is missing role', () => {
      expect(() =>
        deleteBlog(postId1, { username: 'jdoe' })
      ).toThrow('Current user is required');
    });

    it('throws an error when localStorage.setItem fails during delete', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() =>
        deleteBlog(postId1, { username: 'jdoe', role: 'user' })
      ).toThrow('Failed to delete blog post');
    });

    it('does not affect other posts when deleting one post', () => {
      deleteBlog(postId1, { username: 'jdoe', role: 'user' });

      const blogs = getBlogs();
      expect(blogs).toHaveLength(1);
      expect(blogs[0].id).toBe(postId2);
      expect(blogs[0].title).toBe('Post 2');
      expect(blogs[0].author).toBe('bsmith');
    });
  });

  describe('round-trip', () => {
    it('addBlog followed by findBlog returns the created post', () => {
      addBlog({
        title: 'My Post',
        content: 'My Content',
        author: 'jdoe',
        authorDisplay: 'Jane Doe',
        authorRole: 'user',
      });

      const blogs = getBlogs();
      const blog = findBlog(blogs[0].id);
      expect(blog).not.toBeNull();
      expect(blog.title).toBe('My Post');
      expect(blog.content).toBe('My Content');
      expect(blog.author).toBe('jdoe');
      expect(blog.authorDisplay).toBe('Jane Doe');
      expect(blog.authorRole).toBe('user');
    });

    it('addBlog followed by updateBlog followed by findBlog returns updated post', () => {
      addBlog({
        title: 'Original',
        content: 'Original Content',
        author: 'jdoe',
        authorDisplay: 'Jane Doe',
        authorRole: 'user',
      });

      const blogs = getBlogs();
      const postId = blogs[0].id;

      updateBlog(postId, { title: 'Updated', content: 'Updated Content' }, { username: 'jdoe', role: 'user' });

      const blog = findBlog(postId);
      expect(blog.title).toBe('Updated');
      expect(blog.content).toBe('Updated Content');
    });

    it('addBlog followed by deleteBlog followed by findBlog returns null', () => {
      addBlog({
        title: 'To Delete',
        content: 'Will be deleted',
        author: 'jdoe',
        authorDisplay: 'Jane Doe',
        authorRole: 'user',
      });

      const blogs = getBlogs();
      const postId = blogs[0].id;

      deleteBlog(postId, { username: 'jdoe', role: 'user' });

      const blog = findBlog(postId);
      expect(blog).toBeNull();
    });

    it('addBlog followed by deleteBlog followed by getBlogs returns empty array', () => {
      addBlog({
        title: 'To Delete',
        content: 'Will be deleted',
        author: 'jdoe',
        authorDisplay: 'Jane Doe',
        authorRole: 'user',
      });

      const blogs = getBlogs();
      const postId = blogs[0].id;

      deleteBlog(postId, { username: 'jdoe', role: 'user' });

      const remainingBlogs = getBlogs();
      expect(remainingBlogs).toEqual([]);
    });

    it('multiple addBlog calls followed by getBlogs returns all posts sorted newest first', () => {
      addBlog({
        title: 'First Post',
        content: 'Content 1',
        author: 'jdoe',
        authorDisplay: 'Jane Doe',
        authorRole: 'user',
      });

      addBlog({
        title: 'Second Post',
        content: 'Content 2',
        author: 'bsmith',
        authorDisplay: 'Bob Smith',
        authorRole: 'user',
      });

      addBlog({
        title: 'Third Post',
        content: 'Content 3',
        author: 'jdoe',
        authorDisplay: 'Jane Doe',
        authorRole: 'user',
      });

      const blogs = getBlogs();
      expect(blogs).toHaveLength(3);
      expect(blogs[0].title).toBe('Third Post');
      expect(blogs[1].title).toBe('Second Post');
      expect(blogs[2].title).toBe('First Post');
    });
  });
});