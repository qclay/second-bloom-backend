import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { FileService } from './file.service';
import { FileQueryDto } from './dto/file-query.dto';
import { FileResponseDto } from './dto/file-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FileValidationInterceptor } from './interceptors/file-validation.interceptor';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../common/decorators/api-error-responses.decorator';
import { ApiPaginatedResponse } from '../../common/decorators/api-success-responses.decorator';
import { ApiErrorResponseDto } from '../../common/dto/api-error-response.dto';

@ApiTags('Files')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ short: { ttl: 60000, limit: 10 } })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 100 * 1024 * 1024,
      },
    }),
    FileValidationInterceptor,
  )
  @ApiOperation({ summary: 'Upload a file' })
  @ApiCommonErrorResponses({ notFound: false, conflict: false })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (images, documents, videos, etc.)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: FileResponseDto,
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { id: string },
  ): Promise<FileResponseDto> {
    return this.fileService.uploadFile(file, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all files' })
  @ApiCommonErrorResponses({ notFound: false, conflict: false })
  @ApiPaginatedResponse(
    FileResponseDto,
    'Paginated list of files (data + meta.pagination)',
  )
  async findAll(
    @Query() query: FileQueryDto,
    @CurrentUser() user?: { id: string },
  ) {
    return this.fileService.findAll(query, user?.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file by ID' })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiResponse({
    status: 200,
    description: 'File details',
    type: FileResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
    type: ApiErrorResponseDto,
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user?: { id: string },
  ): Promise<FileResponseDto> {
    return this.fileService.findById(id, user?.id);
  }

  @Get(':id/signed-url')
  @ApiOperation({
    summary: 'Get signed URL for file access',
    description:
      'Generates a temporary signed URL for accessing a private file. The URL expires after the specified time (default: 1 hour).',
  })
  @ApiResponse({
    status: 200,
    description: 'Signed URL generated successfully',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example:
            'https://your-space.nyc3.cdn.digitaloceanspaces.com/file.jpg?signature=...',
        },
      },
    },
  })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiResponse({
    status: 403,
    description: 'Access denied to this file',
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
    type: ApiErrorResponseDto,
  })
  async getSignedUrl(
    @Param('id') id: string,
    @Query('expiresIn') expiresIn?: string,
    @CurrentUser() user?: { id: string },
  ): Promise<{ url: string }> {
    const expiresInSeconds = expiresIn ? parseInt(expiresIn, 10) : 3600;
    const url = await this.fileService.getSignedUrl(
      id,
      user?.id,
      expiresInSeconds,
    );
    return { url };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a file' })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiResponse({ status: 204, description: 'File deleted' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ): Promise<void> {
    return this.fileService.deleteFile(id, user.id);
  }
}
