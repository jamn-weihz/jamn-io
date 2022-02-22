import { Box } from '@mui/material';
import PostContainer from '../Post/PostContainer';
import { User } from '../types/User';

interface UserPostsProps {
  user: User;
}

export default function UserPosts(props: UserPostsProps) {
  if (!props.user.focus) return null;
  return (
    <Box>
      <PostContainer post={props.user.focus} instanceId={props.user.id} />
    </Box>
  )
}