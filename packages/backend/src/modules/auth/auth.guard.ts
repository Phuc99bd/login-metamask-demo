import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { JwtService } from "@nestjs/jwt";
import { Model, Schema } from "mongoose";
import { InvalidToken } from "src/exceptions/invalid-token.exception";
import { AuthService } from "./auth.service";
import { SECRET } from "./constant/auth.constant";
import { User, UserDocument, UserSchema } from "./schema/user.schema";

@Injectable()
export class AuthGuard implements CanActivate{
    private jwtService: JwtService
    constructor(){
        this.jwtService = new JwtService({ secret: SECRET })
    }
    async canActivate(context: ExecutionContext){
        const ctx = GqlExecutionContext.create(context).getContext();
        if(!ctx.headers.authorization){
            return false;
        }
        const { userId } = await this.validateToken(ctx.headers.authorization);
        
        ctx.userId = userId;
        
        return true;
    }

    async validateToken(auth: string){
        if(auth.split(' ')[0] !== 'Bearer'){
            throw new InvalidToken();
        }
        const token = auth.split(' ')[1];
        try {
            return this.jwtService.verify(token , { secret: SECRET })
        } catch (error) {
            throw new InvalidToken();
        }
    }
}