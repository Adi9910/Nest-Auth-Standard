/**
 * Trim Pipe
 * Removes leading and trailing whitespace from string inputs
 * Useful for cleaning user input (emails, names, etc.)
 */
import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform {
  /**
   * Recursively trims all string values in objects
   */
  transform(value: any): any {
    if (typeof value === 'string') {
      return value.trim();
    }
    
    // If it's an object, trim all string properties
    if (typeof value === 'object' && value !== null) {
      Object.keys(value).forEach(key => {
        value[key] = this.transform(value[key]);
      });
    }
    
    return value;
  }
}

/**
 * Usage in controller:
 * @Post()
 * create(@Body(TrimPipe) createDto: CreateUserDto) {
 *   // All string fields in createDto are trimmed
 * }
 */
