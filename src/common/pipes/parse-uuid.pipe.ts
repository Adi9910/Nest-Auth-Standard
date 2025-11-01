/**
 * Custom UUID Validation Pipe
 * Validates and transforms string parameters to valid UUIDs
 * Pipes transform/validate input data before it reaches the route handler
 * Use Case: Validating URL parameters like /users/:id where id must be UUID
 */
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { validate as isValidUUID } from 'uuid';

@Injectable()
export class ParseUUIDPipe implements PipeTransform<string, string> {
  /**
   * transform() method is called with the input value
   * @param value - The input value to transform/validate
   * @param metadata - Metadata about the parameter
   * @returns Validated value or throws exception
   */
  transform(value: string): string {
    // Check if value is a valid UUID v4
    if (!isValidUUID(value)) {
      throw new BadRequestException(`Invalid UUID format: ${value}`);
    }
    return value;
  }
}

/**
 * Usage in controller:
 * @Get(':id')
 * findOne(@Param('id', ParseUUIDPipe) id: string) {
 *   // id is guaranteed to be a valid UUID
 * }
 */
