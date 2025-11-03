import { useState } from 'react'
import blogService from '../services/blogs'

const BlogForm = ({ user, setBlogs, blogs, setNotification,handleVisibility }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const handleNewBlogs = async (event) => {
    event.preventDefault()

    const newBlog = {
      title,
      author,
      url,
      user: user.id,
    }

    const returnedBlog = await blogService.create(newBlog)
    setBlogs(blogs.concat(returnedBlog))

    setNotification(`A new blog "${returnedBlog.title}" by ${returnedBlog.author} added`)
    setTimeout(() => {
      setNotification(null)
    }, 5000)


    setTitle('')
    setAuthor('')
    setUrl('')
    handleVisibility()
  }

  return (
    <div>
      <h2>Create new blog</h2>
      <form onSubmit={handleNewBlogs}>
        <p>
          <label>
            title:
            <input
              type="text"
              value={title}
              onChange={({ target }) => setTitle(target.value)}
            />
          </label>
        </p>
        <p>
          <label>
            author:
            <input
              type="text"
              value={author}
              onChange={({ target }) => setAuthor(target.value)}
            />
          </label>
        </p>
        <p>
          <label>
            url:
            <input
              type="text"
              value={url}
              onChange={({ target }) => setUrl(target.value)}
            />
          </label>
        </p>
        <button type="submit">create</button>
        <button type="button" onClick={handleVisibility}>
            cancel
        </button>
      </form>
    </div>
  )
}

export default BlogForm
