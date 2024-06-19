import { TaskEntity } from './task.entity';

export const showList = (todos) =>
  `Your task list ${!todos.length ? 'is empty' : `: \n\n ${todos.map((todo: TaskEntity) => `${todo.id}) ` + (todo.isCompleted ? '✅' : '⏺️') + ' ' + todo.name + '\n\n').join(' ')}`} `;
