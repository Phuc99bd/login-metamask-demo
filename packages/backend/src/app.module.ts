import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'
import { GraphQLModule } from '@nestjs/graphql';
import { AuthModule } from './modules/auth/auth.module';


@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      sortSchema: true,
      playground: true,
      debug: false,
      context: ({ req }) => ({ headers: req.headers })
    }),
    MongooseModule.forRoot('mongodb://localhost/nest'),
    AuthModule,
  ],
})
export class AppModule { }
