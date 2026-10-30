import { IsBoolean } from 'class-validator';

export class UpdateBlockedAppDto {
  @IsBoolean({
    message: 'isEnabled deve ser true ou false.',
  })
  isEnabled: boolean;
}
