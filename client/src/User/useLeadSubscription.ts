import { gql, Reference, useApolloClient, useSubscription } from '@apollo/client';
import { LEAD_FIELDS } from '../fragments';

const LEAD = gql`
  subscription Lead($userId: String!) {
    lead(userId: $userId) {
      ...LeadFields
      leaderUser {
        id
        name
        color
      }
      followerUser {
        id
        name
        color
      }
    }
  }
  ${LEAD_FIELDS}
`;

export default function useLeadSubscription(userId: string) {
  const client = useApolloClient();

  useSubscription(LEAD, {
    variables: {
      userId,
    },
    onSubscriptionData: ({subscriptionData: {data: {lead}}}) => {
      console.log(lead);
      client.cache.writeQuery({
        query: gql`
          query WriteLead {
            ...LeadFields
            leaderUser {
              id
              name
              color
            }
            followerUser {
              id
              name
              color
            }
          }
          ${LEAD_FIELDS}
        `,
        data: lead
      });

      const newRef = client.cache.writeFragment({
        id: client.cache.identify(lead),
        fragment: LEAD_FIELDS,
        data: lead,
      })

      client.cache.modify({
        id: client.cache.identify(lead.leaderUser),
        fields: {
          followers: (cachedRefs, {readField}) => {
            if (lead.deleteDate) {
              return cachedRefs.filter((ref: Reference) => readField('id', ref) !== lead.id);
            }
            else {
              const isPresent = cachedRefs.some((ref: Reference) => readField('id', ref) === lead.id)
              if (isPresent) return cachedRefs;
              return [...cachedRefs, newRef];
            }
          }
        }
      });

      client.cache.modify({
        id: client.cache.identify(lead.followerUser),
        fields: {
          followers: (cachedRefs, {readField}) => {
            if (lead.deleteDate) {
              return cachedRefs.filter((ref: Reference) => readField('id', ref) !== lead.id);
            }
            else {
              const isPresent = cachedRefs.some((ref: Reference) => readField('id', ref) === lead.id)
              if (isPresent) return cachedRefs;
              return [...cachedRefs, newRef];
            }
          }
        }
      });
    }
  })

}