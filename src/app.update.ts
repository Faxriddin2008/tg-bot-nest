import {
  Ctx,
  Hears,
  InjectBot,
  Message,
  On,
  Start,
  Update,
} from 'nestjs-telegraf';
import { AppService } from './app.service';
import { Telegraf } from 'telegraf';
import { actionButtons } from './app.buttons';
import { Context } from './context.interface';
import { showList } from './app.utils';

@Update()
export class AppUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly appService: AppService,
  ) {}

  @Start()
  async startCommand(ctx: Context) {
    ctx.session.type = '';
    await ctx.reply(`👋 Hi, ${ctx.from.first_name || ctx.from.last_name}`);
    await ctx.reply('What do you want to do?', actionButtons());
  }

  @Hears(['📝 Task list'])
  async list(ctx: Context) {
    const todos = await this.appService.getAll();
    await ctx.reply(showList(todos), actionButtons());
  }

  @Hears(['🆕 Create task'])
  async createTask(ctx: Context) {
    ctx.session.type = 'create';
    await ctx.reply('Write new task:');
  }

  @Hears(['✅ Complete'])
  async doneTask(ctx: Context) {
    ctx.session.type = 'done';
    await ctx.reply('Your task ID:');
  }
  @Hears(['✏️ Edit'])
  async editTask(ctx: Context) {
    ctx.session.type = 'edit';
    await ctx.replyWithHTML(
      'Your task ID and new name of your task: \n\n' +
        '<i>Like this - <b>1 | New task name</b></i>',
    );
  }
  @Hears(['❌ Delete'])
  async deleteTask(ctx: Context) {
    ctx.session.type = 'remove';
    await ctx.reply('Your task ID:');
  }

  @On('text')
  async getMessage(@Message('text') message: string, @Ctx() ctx: Context) {
    if (!ctx.session.type) {
      await ctx.reply(
        "What's wrong with you, man? Do something meaningful or get outta here!!!",
        actionButtons(),
      );
    }

    if (ctx.session.type === 'create') {
      const todos = await this.appService.createTask(message);

      if (!todos) {
        await ctx.reply('Task not found with this ID!', actionButtons());
        return;
      }
      await ctx.reply(showList(todos), actionButtons());
      ctx.session.type = '';
    }

    if (ctx.session.type === 'done') {
      const todos = await this.appService.completeTask(Number(message));

      if (!todos) {
        await ctx.reply('Task not found with this ID!', actionButtons());
        return;
      }
      await ctx.reply(showList(todos), actionButtons());
      ctx.session.type = '';
    }

    if (ctx.session.type === 'edit') {
      const [taskId, taskName] = message.split(' | ');

      const todos = await this.appService.editTask(Number(taskId), taskName);

      if (!todos) {
        await ctx.reply('Task not found with this ID!', actionButtons());
        return;
      }
      await ctx.reply(showList(todos), actionButtons());
      ctx.session.type = '';
    }
    if (ctx.session.type === 'remove') {
      const todos = await this.appService.deleteTask(Number(message));

      if (!todos) {
        await ctx.reply('Task not found with this ID!', actionButtons());
        return;
      }
      await ctx.reply(showList(todos), actionButtons());
      ctx.session.type = '';
    }
  }
}
