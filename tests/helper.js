import { expect } from '@playwright/test'
const loginUser = async (page, { username, password }) => {
  await page.getByLabel('username').fill(username)
  await page.getByLabel('password').fill(password)
  const loginButton = page.getByRole('button', { name: /login/i })
  await expect(loginButton).toBeVisible({ timeout: 5000 })
  await expect(loginButton).toBeEnabled({ timeout: 5000 })
  await loginButton.click()
}

const createNewBlog = async (page, { title, author, url }) => {
  const createButton = page.getByRole('button', { name: /create/i })
  await expect(createButton).toBeVisible({ timeout: 5000 })
  await expect(createButton).toBeEnabled({ timeout: 5000 })
  await createButton.click()

  await page.getByLabel('title:').fill(title)
  await page.getByLabel('author:').fill(author)
  await page.getByLabel('url:').fill(url)

  const submitButton = page.getByRole('button', { name: /create/i })
  await expect(submitButton).toBeVisible({ timeout: 5000 })
  await submitButton.click()
}

export { createNewBlog, loginUser }
