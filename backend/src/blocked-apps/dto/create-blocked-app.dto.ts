import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateBlockedAppDto {
  @IsString({
    message: 'O nome do aplicativo deve ser um texto.',
  })
  @IsNotEmpty({
    message: 'O nome do aplicativo é obrigatório.',
  })
  @MaxLength(100, {
    message: 'O nome do aplicativo deve ter no máximo 100 caracteres.',
  })
  appName: string;

  @IsString({
    message: 'O identificador do aplicativo deve ser um texto.',
  })
  @IsNotEmpty({
    message: 'O identificador do aplicativo é obrigatório.',
  })
  @MaxLength(255, {
    message: 'O identificador deve ter no máximo 255 caracteres.',
  })
  appIdentifier: string;
}
