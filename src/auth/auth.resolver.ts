import { UseGuards } from '@nestjs/common';
import { Args, Context, GraphQLExecutionContext, Mutation, Resolver } from '@nestjs/graphql';
import { User } from 'src/users/user.model';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { CurrentUser, GqlAuthGuard } from './gql-auth.guard';
import { GqlRefreshGuard } from './gql-refresh.guard';
import JwtRefreshGuard from './jwt-refresh.guard';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Mutation(() => User, {name: 'registerUser'})
  async registerUser(
    @Context() context: any,
    @Args('email') email: string,
    @Args('pass') pass: string,
    @Args('pathnames', {type: () => [String]}) pathnames: string[],
  ) {
    const {
      user,
      accessTokenCookie,
      refreshTokenCookie,
    } = await this.authService.registerUser(email, pass, pathnames);

    context.res.cookie(accessTokenCookie.name, accessTokenCookie.value, accessTokenCookie.options);
    context.res.cookie(refreshTokenCookie.name, refreshTokenCookie.value, refreshTokenCookie.options);

    return user;
  }

  @Mutation(() => User, {name: 'loginUser'})
  async loginUser(
    @Context() context: any,
    @Args('email') email: string,
    @Args('pass') pass: string,
  ) {
    console.log(email, pass);
    const {
      user,
      accessTokenCookie,
      refreshTokenCookie,
    } = await this.authService.loginUser(email, pass);

    context.res.cookie(accessTokenCookie.name, accessTokenCookie.value, accessTokenCookie.options);
    context.res.cookie(refreshTokenCookie.name, refreshTokenCookie.value, refreshTokenCookie.options);
    
    return user;
  }

  @Mutation(() => User, {name: 'loginGoogleUser'})
  async loginGoogleUser(
    @Context() context: any,
    @Args('token') token: string,
    @Args('pathnames', {type: () => [String]}) pathnames: string[],
  ) {
    const {
      user,
      accessTokenCookie,
      refreshTokenCookie,
    } = await this.authService.loginGoogleUser(token, pathnames);

    context.res.cookie(accessTokenCookie.name, accessTokenCookie.value, accessTokenCookie.options);
    context.res.cookie(refreshTokenCookie.name, refreshTokenCookie.value, refreshTokenCookie.options);

    return user;
  }

  @UseGuards(GqlRefreshGuard)
  @Mutation(() => User, {name: 'refreshToken'})
  async refreshToken(
    @Context() context: any,
    @CurrentUser() user: User,
  ) {
    const { name, value, options } = this.authService.getAccessTokenCookie(user.id);
    context.res.cookie(name, value, options);
    return user;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'logoutUser'})
  async logoutUser (
    @Context() context: any,
    @CurrentUser() user: User,
  ) {
    const {
      accessTokenCookie,
      refreshTokenCookie,
    } = await this.authService.logoutUser(user.id);
    
    context.res.cookie(accessTokenCookie.name, accessTokenCookie.value, accessTokenCookie.options);
    context.res.cookie(refreshTokenCookie.name, refreshTokenCookie.value, refreshTokenCookie.options);

    return user;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'verifyUser'})
  async verifyUser (
    @CurrentUser() user: User,
    @Args('code') code: string,
  ) {
    return this.authService.verifyUser(user.id, code)
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, {name: 'resendUserVerification'})
  async resendUserVerification (
    @CurrentUser() user: User,
  ) {
    return this.authService.resendUserVerification(user.id);
  }
}
