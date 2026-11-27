import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  ParseIntPipe,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseIdPipe implements PipeTransform<string, Promise<number>> {
  private readonly integerPipe = new ParseIntPipe();

  async transform(value: string, metadata: ArgumentMetadata): Promise<number> {
    const id = await this.integerPipe.transform(value, metadata);
    if (typeof id !== 'number' || id < 1 || id > 2147483647) {
      throw new BadRequestException(
        'ID должен быть целым числом от 1 до 2147483647',
      );
    }
    return id;
  }
}
