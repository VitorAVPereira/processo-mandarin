import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/services/prisma/index.service";

@Injectable()
export class TaskRepository {
    constructor(
        private readonly prisma: PrismaService
    ) {}

    async create(data: any) {
        return this.prisma.task.create({
            data
        });
    }
}