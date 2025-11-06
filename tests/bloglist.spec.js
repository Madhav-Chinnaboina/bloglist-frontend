import { test, expect } from '@playwright/test'
import { createNewBlog,loginUser } from './helper.js'
const backend = 'http://localhost:3003'
test.describe.serial('Blog app', () => {
  test.beforeEach(async({ page,request }) => {
    await request.post(`${backend}/api/testing/reset`)
    await request.post(`${backend}/api/users`,{
      data:{
        name: 'Madhav',
        username: 'maddy',
        password: 'maddy'
      }
    })
    await page.goto('/')
  })
  test('Login form is shown', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
  })
  test('Login',async ({ page }) => {
    await loginUser(page, { username: 'maddy', password: 'maddy' })
    await expect(page.getByText('Madhav logged in')).toBeVisible()
  })
  test('failed login',async ({ page }) => {
    await page.getByLabel('username')
      .fill('maddy')
    await page.getByLabel('password').fill('wrong')
    await page.getByRole('button',{ name:'login' }).click()
    await expect(page.getByText('Madhav logged in')).not.toBeVisible()
  })
  test('logged user can create blog',async ({ page }) => {
    await loginUser(page, { username: 'maddy', password: 'maddy' })
    await createNewBlog(page, {
      title: 'it is a new blog',
      author: 'maddy',
      url: 'https://1234'
    })
    await expect(
      page.getByTestId('blog-summary').filter({
        hasText: /it is a new blog/
      }).last()
    ).toBeVisible()

  })
  test('blog can be liked', async ({ page }) => {
    await loginUser(page, { username: 'maddy', password: 'maddy' })

    const uniqueTitle = `Test Blog ${Date.now()}`
    await createNewBlog(page, { title: uniqueTitle, author: 'Madhav', url: 'https://example.com' })
    const blog = page.locator('[data-testid="blog"]').filter({ hasText: uniqueTitle })
    await expect(blog).toHaveCount(1, { timeout: 10000 })

    const viewButton = blog.getByRole('button', { name: /view/i })
    await viewButton.click()

    const likeButton = blog.getByRole('button', { name: /like/i })
    await likeButton.click()

    await expect(blog.getByTestId('like')).toHaveText(/likes\s*1/, { timeout: 5000 })
  })

  test('blog can be deleted by creator', async ({ page }) => {
    await loginUser(page, { username: 'maddy', password: 'maddy' })

    const uniqueTitle = `Deletable Blog ${Date.now()}`
    await createNewBlog(page, { title: uniqueTitle, author: 'Madhav', url: 'https://example.com' })

    let blog = page.locator('[data-testid="blog"]').filter({ hasText: uniqueTitle })
    await expect(blog).toHaveCount(1, { timeout: 10000 })

    const viewButton = blog.getByRole('button', { name: /view/i })
    await viewButton.click()

    page.once('dialog', async dialog => dialog.accept())
    const removeButton = blog.getByRole('button', { name: /remove/i })
    await removeButton.click()

    // Query again to ensure it’s gone
    blog = page.locator('[data-testid="blog"]').filter({ hasText: uniqueTitle })
    await expect(blog).toHaveCount(0, { timeout: 10000 })
  })
  test('only creator can see delete button', async ({ page,request }) => {
    await loginUser(page, { username: 'maddy', password: 'maddy' })

    const uniqueTitle = `Protected Blog ${Date.now()}`
    await createNewBlog(page, { title: uniqueTitle, author: 'Madhav', url: 'https://example.com' })

    // Logout current user
    await page.getByRole('button', { name: /logout/i }).click()

    // Create a new user
    await request.post(`${backend}/api/users`, {
      data: {
        name: 'Another User',
        username: 'another',
        password: 'anotherpass'
      }
    })

    // Login as the new user
    await loginUser(page, { username: 'another', password: 'anotherpass' })

    const blog = page.locator('[data-testid="blog"]').filter({ hasText: uniqueTitle })
    await expect(blog).toHaveCount(1, { timeout: 10000 })

    const viewButton = blog.getByRole('button', { name: /view/i })
    await viewButton.click()

    const removeButton = blog.getByRole('button', { name: /remove/i })
    await expect(removeButton).toHaveCount(0)
  })
  test('blogs are ordered by likes', async ({ page }) => {
    await loginUser(page, { username: 'maddy', password: 'maddy' })

    const blogs = [
      { title: 'Least Liked Blog', author: 'Author1', url: 'http://example.com/1' },
      { title: 'Moderately Liked Blog', author: 'Author2', url: 'http://example.com/2' },
      { title: 'Most Liked Blog', author: 'Author3', url: 'http://example.com/3' }
    ]

    // Create blogs and ensure visibility
    for (const blog of blogs) {
      await createNewBlog(page, blog)
      const createdBlog = page.locator('[data-testid="blog"]').filter({ hasText: blog.title }).first()
      await createdBlog.waitFor({ state: 'visible', timeout: 15000 })
    }

    // Add likes
    const likeCounts = [1, 3, 5]
    for (let i = 0; i < blogs.length; i++) {
      const blog = page.locator('[data-testid="blog"]').filter({ hasText: blogs[i].title }).first()
      const viewButton = blog.getByRole('button', { name: /view/i })
      await expect(viewButton).toBeVisible({ timeout: 5000 })
      await viewButton.click()

      const likeButton = blog.getByRole('button', { name: /like/i })
      const likeCounter = blog.getByTestId('like')

      for (let j = 0; j < likeCounts[i]; j++) {
        await likeButton.click()
        await expect(likeCounter).toHaveText(`likes ${j + 1}`, { timeout: 5000 })
      }
    }

    // Give backend time to persist likes
    await page.waitForTimeout(500)

    await page.reload()

    const blogElements = page.locator('[data-testid="blog"]')
    const blogCount = await blogElements.count()
    const likesArray = []

    for (let i = 0; i < blogCount; i++) {
      const blog = blogElements.nth(i)
      const viewButton = blog.getByRole('button', { name: /view/i })
      await viewButton.click()
      const likeText = await blog.getByTestId('like').innerText()
      likesArray.push(parseInt(likeText.replace('likes', '').trim(), 10))
    }

    const sortedLikes = [...likesArray].sort((a, b) => b - a)
    expect(likesArray).toEqual(sortedLikes)
  })

})

