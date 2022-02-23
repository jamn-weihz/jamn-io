import { gql, useApolloClient, useReactiveVar, useSubscription } from '@apollo/client';
import { surveyorVar } from '../cache';
import { FULL_POST_FIELDS, LINK_FIELDS, VOTE_FIELDS } from '../fragments';
import { SurveyorDetailType, SurveyorItem, SurveyorSlice } from '../types/Surveyor';
import { v4 as uuidv4 } from 'uuid';
import { Vote } from '../types/Vote';

const LINK_POSTS = gql`
  subscription LinkPosts($postIds: [String!]!) {
    linkPosts(postIds: $postIds) {
      ...LinkFields
      sourcePost {
        ...FullPostFields
      }
      targetPost {
        ...FullPostFields
      }
    }
  }
  ${LINK_FIELDS}
  ${FULL_POST_FIELDS}
`;

interface UpdateUnit {
  item: SurveyorItem;
  parent: SurveyorItem | null;
  isNext: boolean;
};

export default function useLinkPostsSubcription(postIds: string[]) {
  const client = useApolloClient();

  const surveyorDetail = useReactiveVar(surveyorVar);

  useSubscription(LINK_POSTS, {
    shouldResubscribe: true,
    variables: {
      postIds,
    },
    onSubscriptionData: ({subscriptionData: {data: {linkPosts}}}) => {
      console.log('linkPosts', linkPosts);

      client.cache.writeQuery({
        query: gql`
          query WriteLink {
            ...LinkFields
            sourcePost {
              ...FullPostFields
            }
            targetPost {
              ...FullPostFields
            }
          }
          ${LINK_FIELDS}
          ${FULL_POST_FIELDS}
        `,
        data: linkPosts,
      });

      const colIdToSurveyorState = {} as SurveyorDetailType;

      Object.keys(surveyorDetail).forEach(colId => {
        const surveyorState = surveyorDetail[colId];
        if (!surveyorState) return;
        const stack = surveyorState.stack.map((slice, i) => {
          const units = slice.items.map(item => {
            return {
              item, 
              parent: null,
              isNext: false,
            };
          }) as UpdateUnit[];

          const newItems = [];

          while (units.length) {
            const unit = units.shift() as UpdateUnit;

            const newItem = {
              ...unit.item,
              prev: unit.item.showPrev
                ? []
                : unit.item.prev,
              next: unit.item.showNext
                ? []
                : unit.item.next,
            } as SurveyorItem;

            if (
              unit.item.postId === linkPosts.sourcePostId &&
              unit.item.showNext &&
              !unit.item.next.some(item => item.linkId === linkPosts.id)
            ) {
              newItem.next.push({
                linkId: linkPosts.id,
                postId: linkPosts.targetPostId,
                postKey: uuidv4(),
                showPrev: false,
                showNext: false,
                prev: [],
                next: [],
                refresh: false,
              });
            }
            else if (
              unit.item.postId === linkPosts.targetPostId &&
              unit.item.showPrev &&
              !unit.item.prev.some(item => item.linkId === linkPosts.id)
            ) {
              newItem.prev.push({
                linkId: linkPosts.id,
                postId: linkPosts.sourcePostId,
                postKey: uuidv4(),
                showPrev: false,
                showNext: false,
                prev: [],
                next: [],
                refresh: false,
              });
            }
            if (unit.parent) {
              if (unit.isNext) {
                unit.parent.next.push(newItem);
              }
              else {
                unit.parent.prev.push(newItem);
              }
            }
            else {
              newItems.push(newItem);
            }

            if (unit.item.showPrev) {
              unit.item.prev.forEach(item => {
                units.push({
                  item,
                  parent: newItem,
                  isNext: false,
                });
              });
            }
            else if (unit.item.showNext) {
              unit.item.next.forEach(item => {
                units.push({
                  item,
                  parent: newItem,
                  isNext: true,
                })
              })
            }
          }
          return {
            ...slice,
            items: newItems,
          }
        }) as SurveyorSlice[];

        colIdToSurveyorState[colId] = {
          ...surveyorState,
          stack,
        };
      });
      
      surveyorVar(colIdToSurveyorState);
    }
  });
}