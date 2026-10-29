import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

// Define e valida os dados recebidos para criar uma tarefa.
export class CreateTaskDto {
  // O título é obrigatório, deve ser texto e ter no máximo 150 caracteres.
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  // A descrição é opcional. Quando informada, deve ser texto.
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  // A data planejada deve ser uma data válida no formato ISO 8601.
  // Exemplo: 2026-10-30T14:00:00.000Z
  @IsDateString()
  @IsNotEmpty()
  scheduledFor: string;

  // Indica se a tarefa é obrigatória.
  // Se não for enviado, o banco aplicará o padrão true.
  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;
}
