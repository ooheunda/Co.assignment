import { UserType } from './user-type.enum';

export type UserPayload = {
  sub: string; // email
  type: UserType;
};
