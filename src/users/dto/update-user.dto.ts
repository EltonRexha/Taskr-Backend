import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
    @IsNotEmpty()
    @IsString()
    readonly clerkId: string;

    @IsNotEmpty()
    @IsEmail()
    readonly email: string;

    @IsNotEmpty()
    @IsString()
    readonly firstName: string;

    @IsString()
    readonly lastName?: string;

    @IsNotEmpty()
    @IsString()
    readonly profileImage: string;
}