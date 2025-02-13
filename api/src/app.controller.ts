import { Controller, Get, Post, Body, UseGuards, Request, Response } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthService } from './services/auth/index.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: JwtAuthService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  
  @Post('login')
  async login(@Request() req, @Response() res): Promise<Response> {
    const token = await this.authService.generateToken(req.body);

    console.log(token);
    return res.status(200).json({ token });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('task')
  async addTask(@Body() task: any, @Request() req, @Response() res): Promise<Response> {
    console.log(task);
    return res.status(200).json({ message: 'Task added' });
  }
}
