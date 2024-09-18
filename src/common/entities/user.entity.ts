import { Column, Entity } from 'typeorm';

import { UserType } from '../types/user-type.enum';

import { BaseModel } from './base-model.entity';

@Entity('users')
export class User extends BaseModel {
  @Column('varchar', { unique: true, nullable: false })
  email: string;

  @Column('varchar', { select: false, nullable: false })
  password: string;

  @Column('varchar', { nullable: false })
  name: string;

  @Column('enum', { enum: UserType, nullable: false })
  userType: UserType;
}
