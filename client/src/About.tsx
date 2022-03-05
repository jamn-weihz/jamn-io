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
            textAlign: 'center',
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
          JAMN is a social medium that allows you to link between posts.
          <Box sx={{
            marginTop: 1,
          }}>
            These links are different from hyperlinks in that they support bidirectional travel.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 1
          }}>
            This means that the directionality of a link is not reserved for expressing 
            the limitation in the direction of travel.

            Instead, it can be used to express more meaningful orderings, i.e.         
          <Box sx={{
            marginTop: 1,
            marginLeft: 2,
          }}>
            Logical (from prior to posterior)
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 2,
          }}>
            Hierarchical (from general to specific)
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 2,
          }}>
            Preferential (from equivalent to preferred equivalent)
          </Box>
          </Box>
          <Box sx={{
            marginTop:1
          }}>
            The ability to vote on links yields a demographically weighted directed graph.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 1,
          }}>
            Picture a flowchart where each link is labeled
            with a number (a weight) indicating the amount of upvotes people have
            submitted for that link. 
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 2,
          }}>
            Imagine a presidential debate were formatted in this manner.
            Where people could post questions and
            validate the logical transitions made between posts,
            voting on links to direct the flow of the conversation.
          </Box> 
          <Box sx={{
            marginTop:1,
            marginLeft: 1,
          }}>
            The weighting of the links helps you prioritize which links to follow when
            there are many options available, thus facilitating search.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 2,
          }}>
            Imagine that each post is a search query, and the 
            neighboring posts are search results. Ranked by the vote of
            the people. No blackbox. Just raw demographic data.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft:2,
          }}>
            Instead of creating a map of the Web by crawling hyperlinks, 
            then returning curated search results to you; what if we made the
            structure of the Web available to you directly. You wouldn't have to
            rely on something to tell you the PageRank, because you can
            see the number of citations directly.
          </Box>
          <Box sx={{
            marginTop: 1,
          }}>
            Filter the votes on these links by demographic
            to see the opinons of a specific groups of people.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 1,
          }}>
            For instance, view the subgraph where links are weighted
            only by the people you follow. This tailors the organization
            of the graph, and thus the search results, to your personal taste.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 1,
          }}>
            Or, view the subgraph where the weight of each person's vote is
            determined by the people who follow them, where the weight of a follower
            is determined by the number of people who follow them, and so on--
            a sort of PageRank for users.
          </Box>
          <Box sx={{
            marginTop: 1,
          }}>
            Weight votes not just with clicks, but with money. If you can 
            weight votes via direct democracy and via republic, you can also 
            do so via capitalism.
          </Box>
        </Card>
        <Card elevation={5} sx={{
          margin:1,
          padding:1,
        }}>
          JAMN intends to function as a hybrid web2/3 app
          that allows you to post and link freely,
          while enabling you to commit select posts and links to a distributed ledger.
          <Box sx={{
            marginTop:1,
          }}>
            We intend to tokenize users and posts 
            so that you can have shared ownership of these two types of objects.
          </Box>
          <Box sx={{
            marginTop: 1,
          }}>
            
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