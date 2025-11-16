import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async create(data: CreateUserDto & { confirmPassword?: string }) {
		// Kiểm tra xác nhận password
		if (data.confirmPassword !== undefined && data.password !== data.confirmPassword) {
			throw new BadRequestException('Passwords do not match');
		}
		// Kiểm tra email đã tồn tại chưa
		const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
		if (existingUser) {
			throw new BadRequestException('Email already exists');
		}
		const hashedPassword = await bcrypt.hash(data.password, 10);
		return this.prisma.user.create({
			data: {
				email: data.email,
				password: hashedPassword,
			},
		});
	}

	async findByEmail(email: string) {
		return this.prisma.user.findUnique({ where: { email } });
	}

	async findById(id: number) {
		if (typeof id !== "number" || isNaN(id)) {
			throw new BadRequestException("Invalid user id");
		}
		return this.prisma.user.findUnique({ where: { id } });
	}
}
