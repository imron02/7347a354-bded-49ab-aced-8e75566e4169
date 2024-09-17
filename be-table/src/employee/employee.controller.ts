import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Employee } from './employee.entity';
import { EmployeeService } from './employee.service';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('sortField') sortField: string = 'updatedAt',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {
    return this.employeeService.findAll(page, limit, sortField, sortOrder);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.employeeService.findOne(id);
  }

  @Post()
  create(@Body() employee: Employee) {
    return this.employeeService.create(employee);
  }

  @Patch()
  async updateMultipleEmployees(
    @Body() employeesData: Record<string, UpdateEmployeeDto>,
  ) {
    const updatedEmployees = [];
    for (const key in employeesData) {
      const employeeData = employeesData[key];
      const updatedEmployee = await this.employeeService.update(
        employeeData.id,
        employeeData,
      );
      updatedEmployees.push(updatedEmployee);
    }
    return updatedEmployees;
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.employeeService.remove(id);
  }
}
