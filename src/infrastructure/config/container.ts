import 'reflect-metadata';
import { Container } from 'inversify';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { MySQLUserRepository } from '../persistence/mysql/MySQLUserRepository';
import { MongoDBUserRepository } from '../persistence/mongodb/MongoDBUserRepository';
import { UserService } from '../../application/services/UserService';
import { UserController } from '../../presentation/controllers/UserController';
import { TYPES } from '../../shared/types/Types';

const container = new Container();

// Bind BOTH repository implementations
container
  .bind<IUserRepository>(TYPES.MySQLUserRepository)
  .to(MySQLUserRepository)
  .inSingletonScope();

container
  .bind<IUserRepository>(TYPES.MongoDBUserRepository)
  .to(MongoDBUserRepository)
  .inSingletonScope();

console.log('Registered both MySQL and MongoDB repositories');

// Bind services
container.bind<UserService>(TYPES.UserService).to(UserService);

// Bind controllers
container.bind<UserController>(TYPES.UserController).to(UserController);

export { container };
