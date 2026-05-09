import { Router } from 'express';

import { createUser, deleteUser, listUsers, updateUser } from '../controllers/users.controller.js';

export const usersRouter = Router();

usersRouter.get('/', listUsers);
usersRouter.post('/', createUser);
usersRouter.put('/:id', updateUser);
usersRouter.delete('/:id', deleteUser);
