import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  @Post('user/register')
  async register(@Body() data: CreateUserDto) {
    return this.userService.create(data);
  }

  @Get('user/me')
  @UseGuards(AuthGuard('jwt'))
  async me(@Req() req: Request) {
    // req.user được gắn bởi JwtStrategy
  return this.userService.findById(req['user']['sub']);
  }
}