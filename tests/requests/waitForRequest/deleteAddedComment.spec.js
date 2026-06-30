import { test } from '../../_fixtures/fixtures';
import { ViewArticlePage } from '../../../src/ui/pages/article/ViewArticlePage';
import { createArticle } from '../../../src/ui/actions/articles/createArticle';
import { signUpUser } from '../../../src/ui/actions/auth/signUpUser';
import { expect } from '../../../src/common/helpers/pw';

/*
Preconditions:
1. Sign up User1
2. Sign up User 2
3. Create article as User1

Test:
1. Open article as User2
2. Add new comment to the article and 
  wait for request to the /api/articles/{slug}/comments 
  - assert the request url contains 'comments'
  - assert the request method is POST
3. Remove just added comment and
  wait for request to the /api/articles/{slug}/comments/{commentId} 
  - assert the request url contains 'comments'
  - assert the request method is DELETE
*/

test.use({ contextsNumber: 2, usersNumber: 2 });

test.beforeEach(async ({ pages, users, articleWithoutTags }) => {
  await signUpUser(pages[0], users[0], 1);
  await signUpUser(pages[1], users[1], 2);
  await createArticle(pages[0], articleWithoutTags, 1);
});

test(
  'Delete just added comment to article created by another user',
  async ({ articleWithoutTags, pages }) => {
    const viewArticlePage = new ViewArticlePage(pages[1], 2);

    await viewArticlePage.open(articleWithoutTags.url);

    const commentText = 'Test comment';

    const addCommentRequest =
      await viewArticlePage.addCommentAndWaitForRequest(commentText);

    expect(addCommentRequest.url()).toContain('comments');
    expect(addCommentRequest.method()).toEqual('POST');

    const deleteCommentRequest =
      await viewArticlePage.deleteCommentAndWaitForRequest(commentText);

    expect(deleteCommentRequest.url()).toContain('comments');
    expect(deleteCommentRequest.method()).toEqual('DELETE');
  },
);
