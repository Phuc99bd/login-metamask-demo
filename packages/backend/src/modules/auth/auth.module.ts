import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { EXPIRED_JWT, SECRET } from './constant/auth.constant';

@Module({
  providers: [AuthService, AuthResolver],
  imports: [JwtModule.register({
    secret: SECRET,
    signOptions: { expiresIn: EXPIRED_JWT },
  }),MongooseModule.forFeature([{ name: User.name , schema: UserSchema }])],
  exports: [AuthService]
})
export class AuthModule {}
