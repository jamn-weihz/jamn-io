import { gql, useLazyQuery } from '@apollo/client';
import { Box, Card } from '@mui/material';
import { useEffect, useState } from 'react';
import ColBar from '../Col/ColBar';
import { FULL_POST_FIELDS } from '../fragments';
import Loading from '../Loading';
import NotFound from '../NotFound';
import { Col } from '../types/Col';
import { Post } from '../types/Post';
import PostComponent from './PostComponent';
import { v4 as uuidv4 } from 'uuid'; 
import Surveyor from '../Surveyor/Surveyor';

const GET_POST = gql`
  query GetPost($postId: String!) {
    getPost(postId: $postId) {
      ...FullPostFields
    }
  }
  ${FULL_POST_FIELDS}
`;

interface PostColProps {
  col: Col;
  id: string;
}
export default function PostCol(props: PostColProps) {
  const [post, setPost] = useState(null as Post | null);
  const [isLoading, setIsLoading] = useState(false);
  const [itemId] = useState(uuidv4());

  const [getPost] = useLazyQuery(GET_POST, {
    onError: error => {
      console.error(error);
      setIsLoading(false);
    },
    onCompleted: data => {
      if (isLoading) {
        console.log(data);
        setIsLoading(false)
        setPost(data.getPost)
      }
    }
  });

  useEffect(() => {
    setIsLoading(true);
    getPost({
      variables: {
        postId: props.id, 
      }
    })
  }, [props.id]);

  if (isLoading) return <Loading />

  return (
    <Box sx={{
      height: '100%'
    }}>
      <ColBar col={props.col} />
      {
        post?.id
          ? <Box>
              <Card elevation={5} sx={{
                margin: 1,
              }}>
                <PostComponent post={post} col={props.col} itemId={itemId} />
              </Card>
            </Box>
          : <NotFound />
      }
    </Box>
  )
}