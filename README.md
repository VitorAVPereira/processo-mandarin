# Erros que encontrei e ajustes que realizei

## Correções no processo de login

Identifiquei que o erro estava ocorrendo por 3 fatores

1. Problema: A verificação de senha estava incorreta no controller:

    Código incorreto:  
  
      ```Javascript
        if (password === user.password) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }
      ```

    Ajuste realizado:

      ```Javascript
        if (password !== user.password) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }
      ```

2. Problema: O login não funcionava corretamente porque o token era removido do localStorage sempre que o layout era renderizado:

    Código incorreto:

      ```Javascript
        useEffect(()=> {
          localStorage.removeItem('token')
        }, [])
      ```

    Ajuste realizado:
      Remover o useEffect.

3. Problema: O valor de userId no payload estava sempre como undefined.

    Código incorreto:

      ```Javascript
        async validate(payload: any) {
          return { userId: payload.sub, username: payload.username };
        }
      ```

    Ajuste realizado:
      Alterar o valor utilizado do payload de sub para userId.

4. Aqui adicionei uma verificação para o formato do token de authentication.

    ```Javascript
    @Injectable()
    export class JwtMiddleware implements NestMiddleware {
      constructor(private readonly jwtService: JwtService) {}

      async use(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          throw new UnauthorizedException('Authorization header is missing');
        }

        const tokenParts = authHeader.split(' ');
        if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
          throw new UnauthorizedException('Invalid token format');
        }
        const token = tokenParts[1];

        try {
          const decoded = this.jwtService.verify(token, { secret: 'secretKey' });
          req.user = decoded;
          next();
        } catch (err) {
          throw new UnauthorizedException('Invalid token');
        }
      }
    }
    ```

## Correção de listagem e atualização de status das tarefas

A listagem de tarefas estava apresentando dois problemas principais:

As tarefas exibidas não estavam sendo filtradas pelo ID do usuário que as criou.

As tarefas concluídas desapareciam da interface, pois o filtro estava considerando apenas solved: false.

Código incorreto:
    ```Javascript
      async get() {
        return this.prisma.task.findMany({
          where: {
            solved: false,
          },
          include: {
            created_by: {
              omit: {
                password: true,
              },
            },
          },
        });
      }
    ```

Solução aplicada:

Adicionei o filtro pelo ID do usuário no controller e no task repository:

  ```Javascript
    @UseGuards(AuthGuard('jwt'))
    @Get('tasks')
    async getTasks(@Request() req, @Response() res): Promise<Response> {
      const userId = req.user.userId;
      const result = await this.taskRepository.get(userId);
      return res.status(200).json(result);
    }
  ```
  
  ```Javascript
    async get(userId: number) {
      return this.prisma.task.findMany(
        {
          where: {
            createdBy: userId,
          },
          include: {
            created_by: {
              omit: {
                password: true,
              },
            },
          },
        }
      );
    }
  ```

## Correção na criação e atualização da lista de tarefas

Foram identificados dois problemas:

Era possível criar tarefas vazias.

A lista de tarefas não era recarregada automaticamente após a criação de uma nova tarefa.

Solução aplicada:

- Adicionei uma validação para garantir que os campos estejam preenchidos.

- Utilize window.location.reload(); para garantir que a lista de tarefas seja atualizada após uma nova inclusão.
  
  ```Javascript
    if (task.name.trim() === "" || task.scheduled_for.trim() === "") {
        alert('Preencha todos  os campos da nova tarefa!')
      } else {
        await fetch('http://localhost:3001/task', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(task),
        })

        alert('Tarefa adicionada com sucesso!')
        window.location.reload();
      }
  ```

## Correção na edição de tarefas

Problema: O ID da tarefa passado para o repositório era o ID do usuário, e não o da tarefa, o que impedia a edição correta.

Código incorreto:

  ```Javascript
    @UseGuards(AuthGuard('jwt'))
    @Patch('task/:id')
    async updateTask(
      @Body() task: any,
      @Request() req,
      @Response() res,
      @Param('id') taskId: string,
    ): Promise<Response> {
      const { userId: id } = req.user;

      const taskExists = await this.taskRepository.findById(parseInt(taskId));

      if (!taskExists) {
        return res.status(404).json({ message: 'Tarefa nao encontrada' });
      }

      const result = await this.taskRepository.update(parseInt(id), {
        ...task,
      });

      return res.json(result).status(200);
    }
  ```

  Ajuste realizado:

  ```Javascript
    @UseGuards(AuthGuard('jwt'))
    @Patch('task/:id')
    async updateTask(
      @Body() task: any,
      @Request() req,
      @Response() res,
      @Param('id') taskId: string,
    ): Promise<Response> {
      const taskExists = await this.taskRepository.findById(parseInt(taskId));

      if (!taskExists) {
        return res.status(404).json({ message: 'Tarefa nao encontrada' });
      }

      const result = await this.taskRepository.update(parseInt(taskId), {
        ...task,
      });

      return res.json(result).status(200);
    }
  ```

## Novas funcionalidades e melhorias

- Validação da existência da tarefa ao editar

    ```Javascript
      async update(id: number, data: any) {
        const task = await this.prisma.task.findUnique({ where: { id } });
        if (!task) {
          throw new Error(`Task with id ${id} not found.`);
        }
        return this.prisma.task.update({
          where: { id },
          data: { ...data },
          include: {
            created_by: {
              omit: {
                password: true,
              },
            },
          },
        });
      }
    ```

### Melhorias na interface e usabilidade

- Melhoria visual para tarefas concluídas.

- Novo método de conclusão de tarefas: Agora é necessário selecionar uma tarefa para que um botão de conclusão apareça acima, tornando o fluxo mais intuitivo.

- Comecei a exibir na interface o nome da task.

- Melhoria no input de edição de tarefas:
  - Adicionado um placeholder para indicar claramente sua função.
  - Agora não é mais possível salvar uma tarefa com nome vazio.
