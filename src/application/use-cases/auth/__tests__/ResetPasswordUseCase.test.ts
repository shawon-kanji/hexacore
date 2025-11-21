import { ResetPasswordUseCase } from '../ResetPasswordUseCase';
import { MockUserRepository } from '../../../../__tests__/mocks/MockUserRepository';
import { MockPasswordResetTokenRepository } from '../../../../__tests__/mocks/MockPasswordResetTokenRepository';
import { UserFactory } from '../../../../__tests__/factories/UserFactory';
import { hashPasswordResetToken } from '../../../utils/passwordResetToken';
import { PasswordResetToken } from '../../../../domain/entities/PasswordResetToken';
import { UnauthorizedError, NotFoundError } from '../../../../shared/errors';

const inFuture = () => new Date(Date.now() + 60 * 60 * 1000);

const inPast = () => new Date(Date.now() - 60 * 60 * 1000);

describe('ResetPasswordUseCase', () => {
  let mysqlUserRepository: MockUserRepository;
  let mongoUserRepository: MockUserRepository;
  let mysqlTokenRepository: MockPasswordResetTokenRepository;
  let mongoTokenRepository: MockPasswordResetTokenRepository;
  let useCase: ResetPasswordUseCase;

  beforeEach(() => {
    mysqlUserRepository = new MockUserRepository();
    mongoUserRepository = new MockUserRepository();
    mysqlTokenRepository = new MockPasswordResetTokenRepository();
    mongoTokenRepository = new MockPasswordResetTokenRepository();
    useCase = new ResetPasswordUseCase(
      mysqlUserRepository,
      mongoUserRepository,
      mysqlTokenRepository,
      mongoTokenRepository
    );
  });

  afterEach(() => {
    mysqlTokenRepository.clear();
    mongoTokenRepository.clear();
  });

  it('should reset password when token is valid', async () => {
    const user = await UserFactory.createValidUser({ email: 'valid@example.com' });
    await mysqlUserRepository.save(user);
    await mongoUserRepository.save(user);

    const token = 'valid-reset-token';
    const tokenHash = hashPasswordResetToken(token);
    const resetToken = PasswordResetToken.create({
      tokenHash,
      userId: user.getId(),
      expiresAt: inFuture(),
    });

    await mysqlTokenRepository.save(resetToken);
    await mongoTokenRepository.save(resetToken);

    await useCase.execute({ token, password: 'NewPassword123!' });

    const updatedUser = await mongoUserRepository.findById(user.getId());
    expect(updatedUser).not.toBeNull();
    expect(await updatedUser!.verifyPassword('NewPassword123!')).toBe(true);
    expect(mysqlTokenRepository.count()).toBe(0);
    expect(mongoTokenRepository.count()).toBe(0);
  });

  it('should throw unauthorized error for invalid token', async () => {
    await expect(
      useCase.execute({ token: 'unknown-token', password: 'Password123!' })
    ).rejects.toThrow(UnauthorizedError);
  });

  it('should throw unauthorized error when token is expired', async () => {
    const user = await UserFactory.createValidUser({ email: 'expired@example.com' });
    await mysqlUserRepository.save(user);
    await mongoUserRepository.save(user);

    const token = 'expired-token';
    const tokenHash = hashPasswordResetToken(token);
    const expiredToken = PasswordResetToken.create({
      tokenHash,
      userId: user.getId(),
      expiresAt: inPast(),
    });

    await mysqlTokenRepository.save(expiredToken);
    await mongoTokenRepository.save(expiredToken);

    await expect(
      useCase.execute({ token, password: 'AnotherPassword123!' })
    ).rejects.toThrow(UnauthorizedError);

    expect(mysqlTokenRepository.count()).toBe(0);
    expect(mongoTokenRepository.count()).toBe(0);
  });

  it('should throw not found error when user no longer exists', async () => {
    const user = await UserFactory.createValidUser({ email: 'missing@example.com' });

    const token = 'missing-user-token';
    const tokenHash = hashPasswordResetToken(token);
    const resetToken = PasswordResetToken.create({
      tokenHash,
      userId: user.getId(),
      expiresAt: inFuture(),
    });

    await mysqlTokenRepository.save(resetToken);
    await mongoTokenRepository.save(resetToken);

    await expect(
      useCase.execute({ token, password: 'Password123!' })
    ).rejects.toThrow(NotFoundError);

    expect(mysqlTokenRepository.count()).toBe(0);
    expect(mongoTokenRepository.count()).toBe(0);
  });
});
