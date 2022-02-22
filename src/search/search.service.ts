import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import algoliasearch, {SearchClient, SearchIndex} from 'algoliasearch';
import { Post } from 'src/posts/post.entity';

@Injectable()
export class SearchService {
  constructor(
    private readonly configService: ConfigService,
  ) {
    this.client = algoliasearch(
      configService.get('ALGOLIA_APP_ID'),
      configService.get('ALGOLIA_API_KEY'),
    )
    this.index = this.client.initIndex(configService.get('ALGOLIA_INDEX_NAME'))
  }

  client: SearchClient
  index: SearchIndex

  mapPostsToRecords(posts: Post[]) {
    return posts.map(post => {
      const record = {
        ...post,
        __typename: 'Post',
        objectID: post.id,
      };
      return record;
    });
  }

  async savePosts(posts: Post[]) {
    const records = this.mapPostsToRecords(posts);
    try {
      const result = await this.index.saveObjects(records);
      console.log(result);
    } catch (e) {
      console.error(e);
    }
  }

  async partialUpdatePosts(posts: Post[]) {
    const records = this.mapPostsToRecords(posts);
    try {
      const result = await this.index.partialUpdateObjects(records);
      console.log(result)
    } catch (e) {
      console.error(e);
    }
  }
}
