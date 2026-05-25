import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Request a signed upload URL and create document record' })
  requestUpload(
    @CurrentUser('id') userId: string,
    @Body() dto: UploadDocumentDto,
  ) {
    return this.documentsService.requestUpload(userId, dto);
  }

  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Get documents for a property' })
  findByProperty(
    @Param('propertyId') propertyId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.documentsService.findByProperty(propertyId, page, limit);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get documents for an order' })
  findByOrder(@Param('orderId') orderId: string) {
    return this.documentsService.findByOrder(orderId);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get a signed download URL for a document' })
  getDownloadUrl(@Param('id') id: string) {
    return this.documentsService.getDownloadUrl(id);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a document (admin only)' })
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
}
