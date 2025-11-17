export const TYPES = {
  // Repository implementations
  MySQLUserRepository: Symbol.for('MySQLUserRepository'),
  MongoDBUserRepository: Symbol.for('MongoDBUserRepository'),
  // Services
  UserService: Symbol.for('UserService'),
  // Controllers
  UserController: Symbol.for('UserController'),
};
