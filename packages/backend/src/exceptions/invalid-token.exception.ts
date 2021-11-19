import { HttpException , HttpStatus } from '@nestjs/common'

export class InvalidToken extends HttpException{
    constructor(){
        super(`Invalid Token` , HttpStatus.UNAUTHORIZED);
    }
}