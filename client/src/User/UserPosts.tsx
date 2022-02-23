import { Box } from '@mui/material';
import { User } from '../types/User';

interface UserPostsProps {
  user: User;
}

export default function UserPosts(props: UserPostsProps) {
  if (!props.user.focus) return null;
  return (
    <Box>
    </Box>
  )
}