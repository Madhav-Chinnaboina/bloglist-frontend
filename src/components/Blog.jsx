import { useState } from 'react'
import blogService from '../services/blogs'
const Blog = ({ blog,blogs,setBlogs,user }) => {
  const [view,setView]=useState(false)
  const showView = { display:view?'none':'' }
  const hideView = { display:view?'':'none' }
  const toggleView = () => {
    setView(!view)
  }
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }
  const handleDelete = async() => {
    if(window.confirm(`remove blog ${blog.title}`)){
      await blogService.deleteBlog(blog.id)
      setBlogs(blogs.filter( b => b.id!==blog.id))
    }
  }
  const handleLike= async () => {
    const updatedBlog = {
      likes:blog.likes+1,
    }
    const returned = await blogService.update(blog.id,updatedBlog)
    setBlogs(blogs.map( e => e.id===blog.id?returned:e))
  }
  return (
    <div style={blogStyle} >
      <div style={showView} data-testid="blog-summary">
        {blog.title} {blog.author}
        <button onClick={toggleView}>view</button><br/>
      </div>
      <div style={hideView} data-testid="blog-details">
        {blog.title} {blog.author}<br/>
        <button onClick={toggleView}>hide</button><br/>
        {blog.url}<br/>
    likes {blog.likes} <button type="button" onClick={handleLike}>like</button><br/>
        {blog.user?.name || blog.user?.username || 'Unknown user'}
        {user && blog.user && user.username===blog.user.username && (<button type="button"onClick={handleDelete}>remove</button>)}
        <br/>
      </div>
    </div>
  )
}

export default Blog