import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

@Controller()
export class AuthController {
	constructor(
		private authService: AuthService,
		private jwtService: JwtService,
	) {}

		@Post('user/login')
		async login(@Body() data: { email: string; password: string }) {
			const user = await this.authService.validateUser(data.email, data.password);
			const tokens = await this.authService.generateTokens(user);
			return {
				email: user.email,
				accessToken: tokens.accessToken,
				refreshToken: tokens.refreshToken,
			};
		}

	@Post('user/refresh')
	async refresh(@Body('refreshToken') refreshToken: string) {
		const user = await this.authService.getUserByRefreshToken(refreshToken);
		if (!user) throw new UnauthorizedException('Invalid refresh token');
		try {
			this.jwtService.verify(refreshToken);
		} catch (e) {
			throw new UnauthorizedException('Refresh token expired');
		}
		const tokens = await this.authService.generateTokens(user, false);
		return tokens;
	}

	@Post('user/logout')
	async logout(@Body('userId') userId: number) {
		await this.authService.removeRefreshToken(userId);
		return { message: 'Logged out' };
	}
}
