import { Box, Card, Link, Typography } from '@mui/material';
import ColBar from './Col/ColBar';
import { ColUnit } from './types/Col';
import logo from './favicon-32x32.png';
import MapIcon from '@mui/icons-material/Map';

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
        height: 'calc(100% - 50px)',
        overflowY: 'scroll',
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
              marginLeft: 2,
            }}>
              <Typography variant='overline' sx={{
                fontSize: 22,
              }}>
                JAMN.IO
              </Typography>
            </Box>
          </Box>
          <Box sx={{
            marginTop: 1,
            textAlign: 'center',
            marginBottom: 1,
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
          <Box sx={{
            textAlign: 'center',
          }}>
            <Typography variant='overline' sx={{
              fontSize: 18,
            }}>
              Quickstart
            </Typography>
          </Box>
          <Box>
            (0) If you're on mobile, scroll right to see the other columns!
          </Box>
          <Box sx={{
            marginTop: 1,
          }}>
            (1) Use the map to join conversations based on geolocation.
          </Box>
          <Box sx={{
            marginTop: 1,
          }}>
            (2) Browse the conversations indexed under the start post.
          </Box>
          <Box sx={{
            marginTop: 1,
          }}>
            (3) Use keyword search to find conversations by topic.
          </Box>
          <Box sx={{
            marginTop: 1,
          }}>
            (4) Follow threads using the PREV and NEXT buttons on a post.
          </Box>
          <Box sx={{
            marginTop: 1,
          }}>
            (5) Register to add new posts, links, and votes.
          </Box>
        </Card>
        <Card elevation={5} sx={{
          margin:1,
          padding:1,
        }}>
          <Box sx={{
            textAlign: 'center',
          }}>
            <Typography variant='overline' sx={{
              fontSize: 18,
            }}>
              In depth
            </Typography>
          </Box>
          <Box sx={{
          }}>
            (1) JAMN is a social medium that allows you to link between posts.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 2,
          }}>
            These links are different from hyperlinks in that they support bidirectional travel.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 4,
          }}>
            (Hyperlinks are unidirectional in the sense that, if I post the URL of post B into
            the content of post A (yielding a hyperlink A-&gt;B), then I can travel directly 
            from A to B, but not necesarily from B to A.)
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 2,
          }}>
            This means that, while the directionality of a hyperlink is
            reserved for expressing 
            the limitation in the direction of travel,
            the directionality of a link can be used to express more meaningful orderings, i.e.         
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 4,
          }}>
            Logical (from prior to posterior)
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 4,
          }}>
            Hierarchical (from general to specific)
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 4,
          }}>
            Preferential (from equivalent to preferred equivalent)
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 2,
          }}>
            People are incentivized to link posts together, because this 
            organizes the posts for themselves, 
            making it easier to find those posts in the future.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 4,
          }}>
            If we enable the indexinging of posts for personal reference,
            then we can aggregate these personal indices to form a collective index.  
          </Box>
          <Box sx={{
            marginTop:1
          }}>
            (2) The ability to vote on links yields a demographically weighted directed graph.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 2,
          }}>
            Picture a flowchart where each link is labeled
            with a number (a weight) indicating the amount of upvotes people have
            submitted for that link. 
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 4,
          }}>
            Imagine an important discussion (e.g. a presidential debate)
            were formatted in this manner.
            Where people could post questions and
            validate the logical transitions made between posts,
            voting on links to direct the flow of the conversation.
          </Box> 
          <Box sx={{
            marginTop:1,
            marginLeft: 2,
          }}>
            The weighting of the links helps you prioritize which links to follow, when
            there are many options available. Thus, it facilitates search.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 4,
          }}>
            Imagine that each post is a search query, and the 
            neighboring posts are search results. Ranked by the vote of
            the people. No blackbox ranking algorithm. Just raw demographic data.
          </Box>
          <Box sx={{
            marginTop: 1,
          }}>
            (3) Filter the voting on links by demographic
            to see the opinons of a specific groups of people.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 2,
          }}>
            For instance, view the subgraph where links are weighted
            only by the people you follow. This tailors the organization
            of the graph, and thus the search results, to your personal taste.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 2,
          }}>
            Or, view the subgraph where the weight of each person's vote is
            determined by the weight of their followers, whose weights are determined
            is determined by the weight of <i>their</i> followers, and so on--
            a sort of PageRank for users.
          </Box>
          <Box sx={{
            marginTop: 1,
          }}>
            (4) Weight votes not just with clicks, but with money.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 2,
          }}>
            In (2) and (3) we weight votes via direct democracy and via republic.
            Here we examine the weighting of votes with capital.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 2,
          }}>
            People purchase votes and viewership anyway. Instead of forcing them to hack
            around the system, give them an outlet to express themselves through the system.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 4,
          }}>
            (Like music streaming services giving people an alternative to pirating music.)
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 2,
          }}>
            This democratises advertising so that anyone can do it.
            It normalizes the behavior of marketing one's own material.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 4,
          }}>
            Choose a post as a platform, link from it to your content, 
            invest money to boost that link in the charts.
            Your advert is targeted directly to people who are viewing
            a specific piece of content.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 2,
          }}>
            In this model, each link is an advert to some post;
            each advert, is a link. It integrates advertisements
            into the data structure, rather than treating it 
            as a special class of content.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 4,
          }}>
            Good promotional content can become its own platform for further linkage of posts.
          </Box>
          <Box sx={{
            marginTop: 1,
          }}>
            (5) Allow users to withdraw money invested in a link.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 2,
          }}>
            If a user can withdraw their upvote after they've invested one, 
            then maybe they should be able to withdraw their money investment as well.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 2,
          }}>
            This transforms investing in links into a form of banking, where you put
            your money to work, creating literal interest in posts that you want viewed.
          </Box>
          <Box sx={{
            marginTop: 1,
          }}>
            (6) Pay the owner of a post when people use that post as platform for paid advertising,
            i.e. when people invest capital in a link pointing out from that post.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 2,
          }}>
            Reconcile this with the withdrawal of investment by decaying the amount of 
            withdrawable funds at a rate with a half-life of 100 days, compounded continually.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 4,
          }}>
            This means that .999 percent of the funds will be controlled by the platform post
            owners in 1000 days
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 2,
          }}>
            Funds can be withdrawn from the link by either the platform post owners or 
            the advertisers at any time, up to the permitted amount by this decay formula.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 2,
          }}>
            This helps to sunset a capital-based boosting of a link. The owners of 
            the platform post is incentivized to withdraw the funds and apply them 
            where they want interest to flow.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 2,
          }}>
            If the money used to advertise off of a post is eventually 
            paid to the post owner, then the post owner can regulate the linkage 
            pointing out from his/her post.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 4,
          }}>
            The post owner must store capital on the link
            in upvotes and/or downvotes to do this at scale, so 
            their capacity to determine the linkage out from their 
            post will be limited.
          </Box>
          <Box sx={{
            marginTop: 1,
          }}>
            (7) Allow shareable ownership of a post.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 2,
          }}>
            This further incentivizes the creation of quality post
            (On top of being able to receive payments for advertising), 
            because if the value of shares can rise as post gains popularity.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 4,
          }}>
            This rewards people who recognize and discover quality
            earlier, as they can buy into a post before share prices rise. 
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 2 ,
          }}>
            The initial owners of a post will be incentivized to spread
            the shares of ownership to some degree to facilitate linkage 
            into that post so that it becomes a strong platform for 
            outbound linkage.
          </Box>
          <Box sx={{
            marginTop: 1,
          }}>
            (8) Fix the token supply of posts and users at 1 token per post.
            Sell shares as fractions of the total supply, 
            e.g. milli-tokens and nano-tokens
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 2,
          }}>
            Choosing the right unit facilitates stoichiometry and makes calculating
            market caps easier.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 4,
          }}>
            How much will I be willing to pay for a share of the post's token?
            The total projected profit of the post via advertising, multiplied by
            the size of the share
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 2,
          }}>
            This prevents inflation of the supply, which dilutes the value of shares,
            taxing the purchasers to benefit the post controller.
          </Box>
          <Box sx={{
            marginTop: 1,
          }}>
            (9) Write the ownership and transaction records to a distributed ledger.
            So that these assets are truly owned by the creators and not a 
            centralized corporation.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 2,
          }}>
            Decentralization, ftw!
          </Box>
          <Box sx={{
            marginTop: 1,
          }}>
            (10) Maintain a hybrid web2/web3 app so that people can still post 
            and link for free.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 2,
          }}>
            Allow users to "commit" posts to the blockchain.
            Only committed posts and cryptographically verified user can 
            participate in the capital economy (Investing in links,
            buying shares, etc)
          </Box>
          <Box sx={{
            marginTop: 1,
          }}>
            (11) Use maps as a jumping off point for AR integration.
          </Box>
          <Box sx={{
            marginTop: 1,
          }}>
            (12) Implement a flowchart view in 3D AR/VR to see
            subgraphs of posts and links.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 2,
          }}>
            Use tree structure to subordinate groups of post under 
            individual posts.
          </Box>
          <Box sx={{
            marginTop: 1,
            marginLeft: 4,
          }}>
            When you drag and drop a post, the whole subtree moves with it.
            Collapse subtrees from view. Maximize subtrees.
          </Box>
          <Box sx={{
            marginTop: 1,
          }}>
            (13) Build browser extensions to integrate linkage and web3 with
            existing web2 posts
          </Box>
          <Box sx={{
            marginTop: 1,
          }}>
            (14) Display each user's avatar next to their currently selected post.
          </Box>
          <Box sx={{
            marginTop: 1,
          }}>
            (15) ???
          </Box>
          <Box sx={{
            marginTop: 1,
          }}>
            (16) Profit
          </Box>
          <Box sx={{
            marginTop: 1,
          }}>
            -weihz, March 7, 2022
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