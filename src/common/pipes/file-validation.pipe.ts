/**
 * File Validation Pipe
 * Validates uploaded files (size, type, etc.)
 * Use Case: Validating file uploads for profile pictures, documents, etc.
 * 
 * Note: This pipe is for demonstration purposes.
 * To use file uploads, you need to:
 * 1. Install multer types: npm install -D @types/multer
 * 2. Import FileInterceptor from @nestjs/platform-express
 */
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

interface FileValidationOptions {
  maxSize?: number; // Max size in bytes
  allowedMimeTypes?: string[]; // Allowed MIME types
}

interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(private readonly options: FileValidationOptions = {}) {
    // Default: 5MB max size
    this.options.maxSize = options.maxSize || 5 * 1024 * 1024;
    // Default: images only
    this.options.allowedMimeTypes = options.allowedMimeTypes || [
      'image/jpeg',
      'image/png',
      'image/gif',
    ];
  }

  transform(file: UploadedFile): UploadedFile {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Validate file size
    if (file.size > this.options.maxSize) {
      const maxSizeMB = this.options.maxSize / (1024 * 1024);
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
      );
    }

    // Validate MIME type
    if (!this.options.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${this.options.allowedMimeTypes.join(', ')}`,
      );
    }

    return file;
  }
}

/**
 * Usage with file upload:
 * First install: npm install -D @types/multer
 * 
 * @Post('upload')
 * @UseInterceptors(FileInterceptor('file'))
 * uploadFile(
 *   @UploadedFile(new FileValidationPipe({
 *     maxSize: 10 * 1024 * 1024, // 10MB
 *     allowedMimeTypes: ['image/jpeg', 'image/png'],
 *   }))
 *   file: Express.Multer.File,
 * ) {
 *   // File is validated
 * }
 */