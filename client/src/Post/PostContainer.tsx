import { useReactiveVar } from '@apollo/client';
import { Box, Button, Card, IconButton } from '@mui/material';
import { userVar } from '../cache';
import { Post } from '../types/Post';
import PostComponent from './Post';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ReplyIcon from '@mui/icons-material/Reply';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';

interface PostContainerProps {
  post: Post;
  postKey: string;
}

export default function PostContainer(props: PostContainerProps) {
  const userDetail = useReactiveVar(userVar);

  return (
    <Card elevation={5} sx={{
      margin: 1,
      padding: 1,
      textAlign: 'center',
    }}>
      <PostComponent post={props.post} postKey={props.postKey} />
      <Box sx={{
        paddingTop: 1,
      }}>
        <Box component='span'>
          <IconButton size='small' sx={{
            fontSize: 14,
          }}>
            <NotificationsNoneIcon fontSize='inherit'/>
          </IconButton>
          <IconButton size='small' sx={{
            fontSize: 14,
          }}>
            <ReplyIcon fontSize='inherit' />
          </IconButton>
          <IconButton size='small' sx={{
            fontSize: 14,
          }}>
            <DoubleArrowIcon fontSize='inherit'/>
          </IconButton>
        </Box>
        <Box component='span' sx={{
          paddingLeft: 1,
        }}>
          <Button color='secondary'>
            {props.post.prevCount} prev
          </Button>
          <Button color='secondary'>
            {props.post.nextCount} next
          </Button>
        </Box>

      </Box>
    </Card>
  )
}