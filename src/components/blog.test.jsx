import { render,screen } from '@testing-library/react'
import Blog from './Blog'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import blogService from '../services/blogs'
import BlogForm from './BlogForm'
vi.mock('../services/blogs', () => ({
  default: {
    update: vi.fn(),
  }
}))

test('renders the blog\'s title and author only ',() => {
  const newBlog = {
    title: 'Testing with Vitest & React Testing Library',
    author: 'Madhav',
    url: 'https://test-blog.dev',
    likes:7
  }
  render(<Blog blog={newBlog}/>)
  const summary = screen.getByTestId('blog-summary')
  expect(summary).toHaveTextContent(/Testing with Vitest & React Testing Library/)
  expect(summary).toHaveTextContent(/Madhav/)
  const hidden = screen.getByTestId('blog-details')
  expect(hidden).not.toBeVisible()
})

test('makes url and likes visible upon click',async () => {
  const user = userEvent.setup()
  const newBlog = {
    title: 'Testing with Vitest & React Testing Library',
    author: 'Madhav',
    url: 'https://test-blog.dev',
    likes: 7,
    user: { name: 'Test User' }
  }
  render(<Blog blog={ newBlog }/>)
  const button = screen.getByRole('button',{ name:/view/ })
  await user.click(button)
  expect(screen.getByText(/https:\/\/test-blog.dev/)).toBeDefined()
  expect(screen.getByText(/likes/)).toBeDefined()
})

test('clicking like button twice', async () => {
  const userEventInstance = userEvent.setup()
  const mockSetBlogs = vi.fn()

  blogService.update.mockResolvedValue({
    id: '123',
    title: 'Testing with Vitest & React Testing Library',
    author: 'Madhav',
    url: 'https://test-blog.dev',
    likes: 8,
    user: { name: 'Test User', username: 'testuser' }
  })

  const newBlog = {
    id: '123',
    title: 'Testing with Vitest & React Testing Library',
    author: 'Madhav',
    url: 'https://test-blog.dev',
    likes: 7,
    user: { name: 'Test User', username: 'testuser' }
  }

  render(
    <Blog
      blog={newBlog}
      blogs={[newBlog]}
      setBlogs={mockSetBlogs}
      user={{ username: 'other' }}
    />
  )

  await userEventInstance.click(screen.getByRole('button', { name: /view/i }))

  const like = screen.getByRole('button', { name: /like/i })

  await userEventInstance.click(like)
  await userEventInstance.click(like)

  expect(blogService.update).toHaveBeenCalledTimes(2)
})

test('test new blog form calls event handler with correct details', async () => {
  const user = userEvent.setup()
  const mockHandler = vi.fn()
  render(<BlogForm createBlog={mockHandler}/>)
  const title = screen.getByPlaceholderText(/title/)
  const author = screen.getByPlaceholderText(/author/)
  const url = screen.getByPlaceholderText(/url/)
  const submit = screen.getByRole('button',{ name:/create/ })

  await user.type(title,'react testing')
  await user.type(author,'madhav')
  await user.type(url,'https://testing.dev')
  await user.click(submit)
  expect(mockHandler).toHaveBeenCalledTimes(1)
  expect(mockHandler).toHaveBeenCalledWith({
    title: 'react testing',
    author: 'madhav',
    url: 'https://testing.dev',
  })
})