import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver } from "@nestjs/apollo";
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { LinksModule } from './links/links.module';
import { VotesModule } from './votes/votes.module';
import { JamsModule } from './jams/jams.module';
import { SubsModule } from './subs/subs.module';
import { LeadsModule } from './leads/leads.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EmailModule } from './email/email.module';
import { RolesModule } from './roles/roles.module';
import { SearchModule } from './search/search.module';
import { ColsModule } from './cols/cols.module';
import { PubSubModule } from './pub-sub/pub-sub.module';
import * as Joi from 'joi';
import { Context } from "apollo-server-core";
import { AuthService } from "./auth/auth.service";
import { ExtractJwt } from "passport-jwt";
import { Request } from "express";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { UsersService } from "./users/users.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        DATABASE_URL: Joi.string().required(),
        REDIS_URL: Joi.string().required(),
        JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
        JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
        JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_CLIENT_SECRET: Joi.string().required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN: Joi.string().required(),
        ALGOLIA_APP_ID: Joi.string().required(),
        ALGOLIA_API_KEY: Joi.string().required(),
        ALGOLIA_INDEX_NAME: Joi.string().required(),
      })
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true,
        ssl: configService.get('ENV') === 'production'
          ? { rejectUnauthorized: false }
          : false,
      })
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client', 'build'),
    }),
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [
        ConfigModule,
        JwtModule.register({
          secret: process.env.JWT_ACCESS_TOKEN_SECRET,
        }),
        UsersModule,
      ],
      inject: [ConfigService, JwtService, UsersService],
      useFactory: async (configServce: ConfigService, jwtService: JwtService, usersService: UsersService) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,
        subscriptions: {
          'graphql-ws': {
            onConnect: async (context: Context<any>) => {
              const { connectionParams, extra } = context;
              if (connectionParams?.Authentication) {
                const payload: any = jwtService.decode(connectionParams.Authentication);
                const user = await usersService.getUserById(payload.userId);
                extra.user = user;
              }
            }
          }
        },
        //installSubscriptionHandlers: true,
        context: ({req, res, connection, extra}) => ({req, res, connection, extra}),
        cors: configServce.get('ENV') === 'production'
          ?  false
          : {
              origin: [
                'http://localhost:8081',
                'http://localhost:3000'
              ],
              credentials: true,
            }
      })
    }),
    UsersModule,
    PostsModule,
    LinksModule,
    VotesModule,
    JamsModule,
    SubsModule,
    LeadsModule,
    AuthModule,
    EmailModule,
    RolesModule,
    SearchModule,
    ColsModule,
    PubSubModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
