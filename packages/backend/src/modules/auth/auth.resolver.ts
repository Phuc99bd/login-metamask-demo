import { HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { bufferToHex } from 'ethereumjs-util';
import { Schema } from 'mongoose';
import { InvalidLogin } from 'src/exceptions/invalid-login..exception';
import { InvalidToken } from 'src/exceptions/invalid-token.exception';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './schema/user.schema';
import { AccessToken } from './types/access-token.type';
import { recoverPersonalSignature } from 'eth-sig-util';
import { RegisterUserDto } from './dto/register-user.dto';

@Resolver()
export class AuthResolver {
    constructor(private authService: AuthService) { }

    @Mutation(() => AccessToken)
    async signIn(@Args('payload') { publicAddress, signature }: LoginUserDto) {
        let user = await this.authService.findByPublicAddress(publicAddress);
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        const msg = `I am signing my one-time nonce: ${user.nonce}`;

        // We now are in possession of msg, publicAddress and signature. We
        // will use a helper from eth-sig-util to extract the address from the signature
        const msgBufferHex = bufferToHex(Buffer.from(msg, 'utf8'));
        const address = recoverPersonalSignature({
            data: msgBufferHex,
            sig: signature,
        });
        
        if(address !== user.publicAddress){
            throw new HttpException('Signature verification failed', HttpStatus.UNAUTHORIZED);
        }
        user.nonce = Math.floor(Math.random() * 10000);
        await user.save();
        return this.authService.signJwt(user._id);
    }

    @Mutation(() => User)
    async findOrCreate(@Args('payload') payload: RegisterUserDto) {
        return this.authService.create(payload);
    }

    @Query(() => User)
    @UseGuards(AuthGuard)
    async me(@Context('userId') userId: string) {
        if (!userId) {
            throw new InvalidToken()
        }
        const user = await this.authService.findById(userId);
        return user;
    }
}
