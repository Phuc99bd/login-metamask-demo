import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';
import { EXPIRED_JWT, SALT, SECRET } from './constant/auth.constant';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { AccessToken } from './types/access-token.type';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
    constructor(@InjectModel(User.name) private readonly model: Model<UserDocument>, private jwtService : JwtService){}

    async create(user: RegisterUserDto){
        let userF = await this.model.findOne({ publicAddress: user.publicAddress});
        if(userF){
            return userF;
        }
        userF = await this.model.create({
            publicAddress: user.publicAddress,
            createdAt: new Date(),
            nonce: Math.floor(Math.random() * 10000)
        });
        return userF;
    }

    async findByPublicAddress(publicAddress: string){
        const user = await this.model.findOne({ publicAddress: publicAddress });
       return user;
    }

    async compare(password: string , hash: string){
        return bcrypt.compare(password , hash);
    }

    async signJwt(userId: string): Promise<AccessToken>{
        return {
            access_token: this.jwtService.sign({userId}, { secret: SECRET })
        }
    }

    async findById(_id: string){
        return await this.model.findById(_id);
    }
}
