import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
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
        DEV_CLIENT_URI: Joi.string(),
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
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configServce: ConfigService) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,
        installSubscriptionHandlers: true,
        context: ({req, res}) => ({req, res}),
        cors: configServce.get('ENV') === 'production'
          ?  false
          : {
              origin: configServce.get('DEV_CLIENT_URI'),
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
