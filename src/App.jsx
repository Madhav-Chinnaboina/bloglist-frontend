import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm' 
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [notification, setNotification] = useState(null) 
  const [blogCreationVisible,setBlogCreationVisible] = useState(false)

 const handleVisibility=()=>{
  setBlogCreationVisible(!blogCreationVisible);
 }
  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({ username, password })
      blogService.setToken(user.token)
      window.localStorage.setItem('loggedBlogUser', JSON.stringify(user))
      setUser(user)
      setUsername('')
      setPassword('')
    } catch {
      setErrorMessage('wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogUser')
    setUser(null)
  }

 
  const loginForm = () => (
    <>
      <h2>Log in to application</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>
            username
            <input
              type="text"
              value={username}
              onChange={({ target }) => setUsername(target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            password
            <input
              type="password"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />
          </label>
        </div>
        <button type="submit">login</button>
      </form>
    </>
  )

 
  const blogForm = () => {
    const updatedBlogs = [...blogs].sort((a,b)=>b.likes - a.likes);
    const hideWhenVisible = { display : blogCreationVisible? 'none' : ''}
    const showWhenVisible ={ display : blogCreationVisible? '' : 'none'}
    return (
    <div>
      <h2>blogs</h2>
      <p>{user.name} logged in</p>
      <button onClick={handleLogout}>logout</button>
      <div style={hideWhenVisible}>
        <button onClick={handleVisibility}>
          Create new blog
        </button>
      </div>
    <div style={showWhenVisible}>
      <BlogForm
        user={user}
        setBlogs={setBlogs}
        blogs={blogs}
        setNotification={setNotification}
        handleVisibility={handleVisibility}
      />
    </div>
      {updatedBlogs.map((blog) => (
        <Blog key={blog.id} blog={blog} blogs={blogs} setBlogs={setBlogs} user={user}/>
      ))}
    </div>
    )
  }

 
  useEffect(() => {
    blogService.getAll().then((blogs) => setBlogs(blogs))
  }, [])

 
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  return (
    <div>
      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
      {notification && <div style={{ color: 'green' }}>{notification}</div>}
      {!user && loginForm()}
      {user && blogForm()}
    </div>
  )
}

export default App
