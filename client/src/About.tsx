import { Box, Card, Link, Typography } from '@mui/material';
import ColBar from './Col/ColBar';
import { ColUnit } from './types/Col';
import logo from './favicon-32x32.png';

interface AboutProps {
  colUnit: ColUnit;
}
export default function About(props: AboutProps) {
  return (
    <Box sx={{
      height: '100%',
    }}>
      <ColBar colUnit={props.colUnit} />
      <Box sx={{
        height: 'calc(100% - 70px)',
        overflow: 'scroll',
        textAlign: 'center',
      }}>
        <Card elevation={5} sx={{
          margin: 1,
          padding: 1,
        }}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center'
          }}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
              <img src={logo} />
            </Box>
            <Box sx={{
              marginLeft: 1,
            }}>
              <Typography variant='overline' sx={{
                fontSize: 20,
              }}>
                JAMN.IO
              </Typography>
            </Box>
          </Box>
          <Box sx={{
            marginTop: 1,
          }}>
            Find people with skills and interests that complement your own.
            <Box sx={{
              marginTop: 1,
            }}>
              So you can meet up with them and jam.
            </Box>
          </Box>
        </Card>
        <Card elevation={5} sx={{
          margin:1,
          padding:1,
        }}>
          JAMN is a social medium that allows you to link between posts
          <Box sx={{
            marginTop: 1,
          }}>
            These links are different from hyperlinks in that they support bidirectional travel.
          </Box>
          <Box sx={{
            marginTop:1
          }}>
            The ability to vote on links yields the structure of a weighted directed graph.
          </Box>
          <Box sx={{
            marginTop:1
          }}>
            This helps you find more of what you want, including the unknown unknowns.
          </Box>
        </Card>
        <Card elevation={5} sx={{
          margin:1,
          padding:1,
        }}>
          Contact us at <Link href='mailto: contact@jamn.io'>contact@jamn.io</Link>
        </Card>
      </Box>
    </Box>
  );

}