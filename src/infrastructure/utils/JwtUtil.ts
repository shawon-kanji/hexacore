import jwt from 'jsonwebtoken';
import { UserRole } from '../../domain/value-objects/Role';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class JwtUtil {
  private static readonly ACCESS_TOKEN_SECRET =
    process.env.JWT_ACCESS_SECRET || 'your-access-token-secret-change-in-production';
  private static readonly REFRESH_TOKEN_SECRET =
    process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret-change-in-production';
  private static readonly ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
  private static readonly REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

  /**
   * Generate access token (short-lived)
   */
  static generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
      algorithm: 'HS256',
    });
  }

  /**
   * Generate refresh token (long-lived)
   */
  static generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
      algorithm: 'HS256',
    });
  }

  /**
   * Generate both access and refresh tokens
   */
  static generateTokenPair(payload: JwtPayload): TokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.ACCESS_TOKEN_SECRET, {
        algorithms: ['HS256'],
      }) as JwtPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token');
      }
      throw error;
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.REFRESH_TOKEN_SECRET, {
        algorithms: ['HS256'],
      }) as JwtPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      }
      throw error;
    }
  }

  /**
   * Get refresh token expiry date
   */
  static getRefreshTokenExpiryDate(): Date {
    const expiryMs = this.parseExpiryToMs(this.REFRESH_TOKEN_EXPIRY);
    return new Date(Date.now() + expiryMs);
  }

  /**
   * Parse expiry string to milliseconds
   */
  private static parseExpiryToMs(expiry: string): number {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1), 10);

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        throw new Error(`Invalid expiry format: ${expiry}`);
    }
  }
}
