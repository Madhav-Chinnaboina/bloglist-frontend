import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [title,setTitle] = useState('')
  const [author,setAuthor] = useState('')
  const [url,setUrl] = useState('')
  const [notification,setNotification]=useState('');

  // ✅ handle login
  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({ username, password })
      blogService.setToken(user.token)
      window.localStorage.setItem('loggedBlogUser',JSON.stringify(user));
      setUser(user)
      setUsername('')
      setPassword('')
    } catch  {
      setErrorMessage('wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  // ✅ login form must return JSX
  const loginForm = () => (
    <>
    <h2>Log in to the application </h2>
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
const handleLogout = ()=>{
  window.localStorage.clear()
  setUser('');
}
const handleNewBlogs = async(event)=>{
  event.preventDefault()
  const newBlog = {
    title:title,
    author:author,
    url:url,
    user:user.id
  }
  const returnedBlog = await blogService.create(newBlog)
  setNotification(`a new Blog ${returnedBlog.title} has been added`)
  setTimeout(()=>{
    setNotification('')
  },5000)
}
  const blogForm = () => (
    <div>
      <h2>blogs</h2>
      <p>{user.name} logged in</p> <button onClick={handleLogout}>logout</button>
      <h2> Create New Blogs</h2>
      <form onSubmit= {handleNewBlogs}>
       <p> <label>title:<input type="text"
        value={title}
        onChange={({target})=>setTitle(target.value)}/>
        </label>
        </p>
        <p>
        <label>author:<input type="text"
        value={author}
        onChange={({target})=>setAuthor(target.value)}/>
        </label>
        </p>
        <p>
        <label>url:<input type="text"
        value={url}
        onChange={({target})=>setUrl(target.value)}/>
        </label>
        </p>
        <button type="submit">create</button>
      </form>
      {blogs.map(blog => (
        <Blog key={blog.id} blog={blog} />
      ))}
    </div>
  )

  useEffect(() => {
    blogService.getAll().then(blogs => setBlogs(blogs))
  }, [])

  useEffect(()=>{
    const loggedBlogUser = window.localStorage.getItem('loggedBlogUser');
    if(loggedBlogUser){
      const user = JSON.parse(loggedBlogUser)
      setUser(user)
      blogService.setToken(user.token)
    }
  },[])
  return (
    <div>
      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
      {notification && <div style ={{color:'green'}}>{notification}</div>}
      {!user && loginForm()}
      {user && blogForm()}
    </div>
  )
}

export default App
