import { test } from '../../_fixtures/fixtures';
import { expect } from '../../../src/common/helpers/pw';
import { ROUTES } from '../../../src/api/constants/apiRoutes';

/*
Test:
1. Open sign in page
2. Create a new method within the 'SignInPage' class that 
  click the 'Sign in' button and wais for the request sent to the /api/users 
3. Assert the request URL is equal to the expected
4. Assert the request method is POST 
*/

test('Click `Sign in` and check request sent', async ({ signInPage }) => {
  await signInPage.open();

  const request = await signInPage.clickSignInButtonAndWaitForRequest();

  expect(new URL(request.url()).pathname).toEqual(ROUTES.users.login);
  expect(request.method()).toEqual('POST');
});
