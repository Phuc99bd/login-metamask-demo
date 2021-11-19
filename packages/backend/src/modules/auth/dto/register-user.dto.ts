import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, Min } from 'class-validator'

@InputType()
export class RegisterUserDto{
    @Field()
    @IsNotEmpty()
    @IsEmail()
    publicAddress: string;
}