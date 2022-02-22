import Surveyor from './Surveyor/Surveyor';
import { v4 as uuidv4 } from 'uuid'; 
import { useState } from 'react';
import { Box } from '@mui/material';

interface SearchProps {
  i: number;
}
export default function Search(props: SearchProps) {
  const [context, setContext] = useState({
    id: uuidv4(),
  });

  return (
    <Box sx={{
      width: 320,
      border: '1px solid lavender'
    }}>
      <Surveyor context={context}/>
    </Box>
  )
}