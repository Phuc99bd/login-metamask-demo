import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, Min } from 'class-validator'

@InputType()
export class LoginUserDto{
    @Field()
    @IsNotEmpty()
    @IsEmail()
    publicAddress: string;

    @Field()
    @IsNotEmpty()
    signature: string;
}