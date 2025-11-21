import { RequestPasswordResetUseCase } from '../RequestPasswordResetUseCase';
import { MockUserRepository } from '../../../../__tests__/mocks/MockUserRepository';
import { MockPasswordResetTokenRepository } from '../../../../__tests__/mocks/MockPasswordResetTokenRepository';
import { UserFactory } from '../../../../__tests__/factories/UserFactory';
import { RequestPasswordResetDTO } from '../../../dto/PasswordResetDTO';

describe('RequestPasswordResetUseCase', () => {
  let userRepository: MockUserRepository;
  let mysqlTokenRepository: MockPasswordResetTokenRepository;
  let mongoTokenRepository: MockPasswordResetTokenRepository;
  let useCase: RequestPasswordResetUseCase;

  beforeEach(() => {
    userRepository = new MockUserRepository();
    mysqlTokenRepository = new MockPasswordResetTokenRepository();
    mongoTokenRepository = new MockPasswordResetTokenRepository();
    useCase = new RequestPasswordResetUseCase(
      userRepository,
      mysqlTokenRepository,
      mongoTokenRepository
    );
  });

  afterEach(() => {
    mysqlTokenRepository.clear();
    mongoTokenRepository.clear();
  });

  it('should generate a reset token for an existing user', async () => {
    const user = await UserFactory.createValidUser({ email: 'reset.user@example.com' });
    await userRepository.save(user);

    const dto: RequestPasswordResetDTO = { email: 'reset.user@example.com' };
    const result = await useCase.execute(dto);

    expect(result.resetToken).toBeTruthy();
    expect(result.expiresAt).toBeInstanceOf(Date);
    expect(mysqlTokenRepository.count()).toBe(1);
    expect(mongoTokenRepository.count()).toBe(1);
  });

  it('should not reveal when user does not exist', async () => {
    const dto: RequestPasswordResetDTO = { email: 'unknown@example.com' };
    const result = await useCase.execute(dto);

    expect(result.resetToken).toBeNull();
    expect(result.expiresAt).toBeNull();
    expect(mysqlTokenRepository.count()).toBe(0);
    expect(mongoTokenRepository.count()).toBe(0);
  });

  it('should replace previous reset tokens for a user', async () => {
    const user = await UserFactory.createValidUser({ email: 'multiple@example.com' });
    await userRepository.save(user);

    await useCase.execute({ email: 'multiple@example.com' });
    const firstTokenId = mongoTokenRepository.findAllByUserId(user.getId())[0]?.getId().getValue();

    const result = await useCase.execute({ email: 'multiple@example.com' });

    expect(result.resetToken).toBeTruthy();
    expect(mongoTokenRepository.count()).toBe(1);
    expect(mysqlTokenRepository.count()).toBe(1);

    const newTokenId = mongoTokenRepository.findAllByUserId(user.getId())[0]?.getId().getValue();
    expect(newTokenId).not.toBe(firstTokenId);
  });
});
