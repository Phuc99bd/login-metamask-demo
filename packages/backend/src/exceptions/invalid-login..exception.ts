import { HttpException , HttpStatus } from '@nestjs/common'

export class InvalidLogin extends HttpException{
    constructor(){
        super(`Email or password incorrect` , HttpStatus.NOT_FOUND);
    }
}