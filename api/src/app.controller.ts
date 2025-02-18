import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Response,
  Patch,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthService } from './services/auth/index.service';
import { TaskRepository } from './modules/task/repository/task.repository';
import { UserRepository } from './modules/user/repository/user.repository';

@Controller()
export class AppController {
  constructor(
    private readonly authService: JwtAuthService,
    private readonly taskRepository: TaskRepository,
    private readonly userRepository: UserRepository,
  ) {}

  @Post('login')
  async login(@Request() req, @Response() res): Promise<Response> {
    const { email, password } = req.body;
    const user = await this.userRepository.findByEmail(email);

    console.log('USER: ', user);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    /*
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    */

    const token = await this.authService.generateToken({ userId: user.id });

    return res.status(200).json({ token });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('task')
  async addTask(
    @Body() task: any,
    @Request() req,
    @Response() res,
  ): Promise<Response> {
    console.log('🚀 ~ AppController ~ task:', task);
    const result = await this.taskRepository.create({
      name: task.name,
      scheduled_for: task.scheduled_for ? new Date(task.scheduled_for) : null,
      createdBy: req.user.userId,
    });
    console.log('🚀 ~ AppController ~ result:', result);

    return res.status(200).json(result);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('tasks')
  async getTasks(@Response() res): Promise<Response> {
    const result = await this.taskRepository.get();
    return res.status(200).json(result);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('task/:id')
  async updateTask(
    @Body() task: any,
    @Request() req,
    @Response() res,
    @Param('id') taskId: string,
  ): Promise<Response> {
    console.log("🚀 ~ AppController ~ taskId:", taskId)
    console.log('🚀 ~ AppController ~ task:', task);
    const { userId: id } = req.user;

    console.log('🚀 ~ AppController ~ id:', id);

    const taskExists = await this.taskRepository.findById(parseInt(taskId));
    console.log("🚀 ~ AppController ~ taskExists:", taskExists)

    if (!taskExists) {
      return res.status(404).json({ message: 'Tarefa nao encontrada' });
    }

    const result = await this.taskRepository.update(parseInt(id), {
      ...task,
    });
    console.log('🚀 ~ AppController ~ result ~ result:', result);

    return res.json(result).status(200);
  }
}
