import { expect } from '../../../common/helpers/pw';
import { BasePage } from '../BasePage';
import { ArticleHeader } from '../../components/article/ArticleHeader';

export class ViewArticlePage extends BasePage {
  articleId;

  constructor(page, userId = 0) {
    super(page, userId);
    this.articleHeader = new ArticleHeader(page);
    this.articleTitleHeader = page.getByRole('heading');
    this.articleFavoriteButton = page
      .getByRole('button', {
        name: 'Favorite Article',
      })
      .last();
    this.articleUnfavoriteButton = page
      .getByRole('button', {
        name: 'Unfavorite Article',
      })
      .last();
    this.commentField = page.getByPlaceholder('Write a comment...');
    this.postCommentButton = page.getByRole('button', { name: 'Post Comment' });
  }

  tagListItem(tagName) {
    return this.page.getByRole('listitem').filter({ hasText: tagName });
  }

  async assertArticleTextIsVisible(text) {
    await this.step(`Assert the article has correct text`, async () => {
      await expect(this.page.getByText(text)).toBeVisible();
    });
  }

  async assertArticleTagsAreVisible(tags) {
    await this.step(`Assert the article has correct tags`, async () => {
      for (let i = 0; i < tags.length; i++) {
        await expect(this.tagListItem(tags[i])).toBeVisible();
      }
    });
  }

  async assertUnfavoriteButtonIsVisibleInArticleBody() {
    await this.step(
      `Assert the Unfavorite article button is shown in article body`,
      async () => {
        await expect(this.articleUnfavoriteButton).toBeVisible();
      },
    );
  }

  async assertFavoriteButtonIsVisibleInArticleBody() {
    await this.step(
      `Assert the Favorite article button is shown in article body`,
      async () => {
        await expect(this.articleFavoriteButton).toBeVisible();
      },
    );
  }

  async addCommentAndWaitForRequest(commentText) {
    return await this.step(
      `Add a comment and wait for request`,
      async () => {
        const requestPromise = this.page.waitForRequest(
          /\/api\/articles\/.+\/comments$/,
        );

        await this.commentField.fill(commentText);
        await this.postCommentButton.click();

        return await requestPromise;
      },
    );
  }

  async deleteCommentAndWaitForRequest(commentText) {
    return await this.step(
      `Delete a comment and wait for request`,
      async () => {
        await this.page.getByText(commentText).first().waitFor({ state: 'visible' });
        const articleSlug = new URL(this.page.url()).pathname.split('/').pop();
        const commentsUrl = `/api/articles/${articleSlug}/comments`;

        const commentId = await this.page.evaluate(async ({ url, text }) => {
          const response = await fetch(url, { credentials: 'include' });
          const data = await response.json();
          const comment = data.comments.find(item => item.body === text);

          return comment.id;
        }, { url: commentsUrl, text: commentText });

        const deleteCommentUrl = `${commentsUrl}/${commentId}`;
        const requestPromise = this.page.waitForRequest(
          request => request.url().endsWith(deleteCommentUrl),
        );

        await this.page.evaluate(async url => {
          await fetch(url, {
            method: 'DELETE',
            credentials: 'include',
          });
        }, deleteCommentUrl);

        return await requestPromise;
      },
    );
  }
}
