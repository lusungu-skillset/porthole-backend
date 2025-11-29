import { Body, Controller, Get, Param, Post, Put, ParseIntPipe } from '@nestjs/common';
import { PotholesService } from './potholes.service';
import { CreatePotholeDto } from './dto/create-pothole.dto';
import { UpdatePotholeDto } from './dto/update-pothole.dto';

@Controller('potholes')
export class PotholesController {
  constructor(private readonly service: PotholesService) {}

  @Post()
  async create(@Body() dto: CreatePotholeDto) {
    return this.service.create(dto);
  }

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePotholeDto) {
    return this.service.update(id, dto);
  }
}
