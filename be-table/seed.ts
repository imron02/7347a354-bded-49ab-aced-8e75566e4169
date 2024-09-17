import { faker } from '@faker-js/faker';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { Employee } from './src/employee/employee.entity';
import { EmployeeService } from './src/employee/employee.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const employeeService = app.get(EmployeeService);

  // Seed 100 mock employees
  for (let i = 0; i < 100; i++) {
    const employee = new Employee();
    employee.firstName = faker.name.firstName();
    employee.lastName = faker.name.lastName();
    employee.position = faker.name.jobTitle();
    employee.phone = faker.phone.number({ style: 'human' });
    employee.email = faker.internet.email();

    await employeeService.create(employee);
  }

  console.log('Seed data created');
  await app.close();
}

bootstrap();
