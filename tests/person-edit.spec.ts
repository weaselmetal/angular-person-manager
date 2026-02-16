import { test, expect } from '@playwright/test';

test('Admin changes the name of person 100', async ({ page }) => {

  // for this test to work, make sure:
  // you ran `npm run db:reset` once before the test. can be run again while json-server is running.
  // you started json-server for tests via `npm run backend:test`

  // login with the right role
  await page.goto('http://localhost:4200/login');
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'testtest');
  await page.click('input[type="submit"]');

  // we should end up on the person overview page
  await expect(page).toHaveURL('http://localhost:4200/persons');

  // make sure we really change the name (.not.)
  await expect(page.locator('body')).not.toContainText('New Name');

  // go to the edit page
  await page.goto('http://localhost:4200/persons/100/edit-td');

  // assert that we see the original name of the person
  const nameInput = page.locator('input[name="name"]');
  await expect(nameInput).toHaveValue('Test User');

  // change the person's name
  await nameInput.fill('New Name');

  // save the changes ...
  const saveBtn = page.locator('button[type="submit"]');
  await expect(saveBtn).toHaveText('Save');

  // the async validator will need 1.5s to determine if the name is valid.
  // by default, playwright waits some time (5s) when an expectation is
  // not true right away. that's the reason we also check form.pending now.
  await expect(saveBtn).toBeEnabled();
  await saveBtn.click();

    // we should be back to the overview
  await expect(page).toHaveURL('http://localhost:4200/persons');
  
  // a very coarse check if we find 'New Name' in the body
  await expect(page.locator('body')).toContainText('New Name');
});