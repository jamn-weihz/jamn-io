import { useReactiveVar } from '@apollo/client';
import { Box, Card, IconButton } from '@mui/material';
import { paletteVar, userVar } from '../cache';
import ColLink from '../Col/ColLink';
import { ColUnit } from '../types/Col';
import { User } from '../types/User';
import CheckCircleTwoToneIcon from '@mui/icons-material/CheckCircleTwoTone';
import CheckIcon from '@mui/icons-material/Check';
import React from 'react';
import { getColor } from '../utils';
import useFollowUser from './useFollowUser';
import useUnfollowUser from './useUnfollowUser';

interface UserLeadersProps {
  user: User;
  colUnit: ColUnit;
}
export default function UserLeaders(props: UserLeadersProps) {
  const userDetail = useReactiveVar(userVar);
  const paletteDetail = useReactiveVar(paletteVar);

  const { followUser } = useFollowUser();
  const { unfollowUser } = useUnfollowUser();

  const handleFollowClick = (userId: string) => (event:React.MouseEvent) => {
    event.stopPropagation()
    followUser(userId);
  }
  const handleUnfollowClick = (userId: string) => (event:React.MouseEvent) => {
    event.stopPropagation()
    unfollowUser(userId);
  }
  console.log('user')
  return (
    <Box sx={{
      height: userDetail?.id === props.user.id
        ? 'calc(100% - 150px)'
        : 'calc(100% - 110px)',
      overflow: 'scroll',
    }}>
      {
        (props.user.leaders || []).map(lead => {
          return (
            <Card elevation={5} key={`leader-${lead.id}-${props.colUnit.col.id}`} sx={{
              margin:1,
              padding:1,
              fontSize: 16,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
              <Box>
                <ColLink col={props.colUnit.col} pathname={`/u/${lead.leaderUser.name}`} sx={{
                  color: lead.leaderUser.color
                }}>
                  {lead.leaderUser.name}
                </ColLink>
                  {
                    !userDetail?.id || lead.leaderUserId === userDetail?.id
                      ? null
                      : <Box component='span'>
                          {
                            (userDetail?.leaders || []).some(l => {
                              return lead.leaderUserId === l.leaderUserId
                            })
                              ? <IconButton
                                  onClick={handleUnfollowClick(lead.leaderUserId)}
                                  title={`Unfollow u/${lead.leaderUser.name}`}
                                  size='small'
                                  sx={{
                                    marginTop: '-2px',
                                    marginLeft: '2px',
                                    padding: 0,
                                    fontSize: 16,
                                  }}
                                >
                                  <CheckCircleTwoToneIcon fontSize='inherit' sx={{
                                    color: userDetail?.color || getColor(paletteDetail.mode)
                                  }}/>
                                </IconButton>
                              : <IconButton 
                                  onClick={handleFollowClick(lead.leaderUserId)}
                                  title={`Follow u/${lead.leaderUser.name}`}
                                  size='small' 
                                  sx={{
                                    marginTop: '-2px',
                                    marginLeft: '2px',
                                    padding: 0,
                                    fontSize: 12,
                                  }}
                                >
                                  <CheckIcon fontSize='inherit' sx={{
                                    color: getColor(paletteDetail.mode)
                                  }}/>
                                </IconButton>
                          }
                        </Box>
                  }
              </Box>
            </Card>
          )
        })
      }
    </Box>
  );
}