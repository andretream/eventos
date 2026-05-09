export type UserRole = 'ADMIN' | 'STAFF';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type EventItem = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
};

export type LoginResponse = {
  token: string;
  user: User;
};

export type EventPayload = {
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
};

export type UserPayload = {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
};
