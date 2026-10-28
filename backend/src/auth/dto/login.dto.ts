
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class LoginDto {
  // O e-mail precisa ter um formato válido.
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(254)
  email: string;

  // A senha deve ser uma string e não pode estar vazia.
  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  password: string;
}
