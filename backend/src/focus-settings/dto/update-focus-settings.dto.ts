import { IsBoolean } from 'class-validator';

export class UpdateFocusSettingsDto {
  @IsBoolean({
    message: 'isEnabled deve ser true ou false.',
  })
  isEnabled: boolean;
}
