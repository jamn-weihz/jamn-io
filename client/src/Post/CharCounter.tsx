import { Box } from '@mui/material';

interface CharCounterProps {
  count: number;
  limit: number;
}
export default function CharCounter(props: CharCounterProps) {
  const percentage = Math.round(100 * props.count / props.limit);
  return (
    <Box style={{
      display: 'flex',
      flexDirection: 'row',
      color: props.count >= props.limit ? 'red' : 'dimgrey',
      fontSize: 10,
    }}>
      <Box style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
      <svg
        height='20'
        width='20'
        viewBox='0 0 20 20'
      >
        <circle
          r='8'
          cx='10'
          cy='10'
          fill='#e9ecef'
        />
        <circle
          r='2'
          cx='10'
          cy='10'
          fill='transparent'
          stroke='currentColor'
          strokeWidth='10'
          strokeDasharray={`calc(${percentage} * 31.4 * 0.36 / 100) 31.4`}
          transform='rotate(-90) translate(-20)'
        />
        <circle
          r='4'
          cx='10'
          cy='10'
          fill='white'
        />
      </svg>
      </Box>
      &nbsp;
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        textAlign: 'left',
        cursor: 'text',
      }}>
        {props.count}/{props.limit} characters
      </Box>
    </Box>
  )
}