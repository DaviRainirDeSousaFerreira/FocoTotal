import { PartialType } from '@nestjs/mapped-types';

import { CreateTaskDto } from './create-task.dto';

// Reutiliza as validações do cadastro,
// tornando todos os campos opcionais na atualização.
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
