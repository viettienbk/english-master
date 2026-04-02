import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PronunciationService } from './pronunciation.service';

@Controller('pronunciation')
export class PronunciationController {
  constructor(private readonly pronunciationService: PronunciationService) {}

  @Post('assess')
  @UseInterceptors(FileInterceptor('audio'))
  async assess(
    @UploadedFile() file: Express.Multer.File,
    @Body('referenceText') referenceText: string,
  ) {
    if (!file) throw new BadRequestException('Missing audio file');
    if (!referenceText?.trim()) throw new BadRequestException('Missing referenceText');

    try {
      return await this.pronunciationService.assess(file.buffer, referenceText.trim());
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
