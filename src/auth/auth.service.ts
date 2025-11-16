import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Email not found');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Password is not correct');
    return user;
  }

  async generateTokens(user: any, isLogin = true) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15s' });
    if (isLogin) {
      // On login, create a new refreshToken and save it to the database
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
      await this.saveRefreshToken(user.id, refreshToken);
      return { accessToken, refreshToken };
    } else {
      // On refresh, only create a new accessToken and keep the existing refreshToken
      return { accessToken };
    }
  }

  async saveRefreshToken(userId: number, refreshToken: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }

  async getUserByRefreshToken(refreshToken: string) {
    return this.prisma.user.findFirst({ where: { refreshToken } });
  }

  async removeRefreshToken(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }
}
