import {
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  AfterLoad,
} from 'typeorm';
import { User } from '../../user/user.entity';

export abstract class BaseEntity<UserType = User> {
  @CreateDateColumn({
    name: 'CREATED_AT',
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'UPDATED_AT',
    type: 'timestamp',
  })
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'CREATED_BY' })
  createdBy: UserType;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'UPDATED_BY' })
  updatedBy: UserType;

  @AfterLoad()
  adjustTimezone() {
    if (this.createdAt) {
      this.createdAt = new Date(
        new Date(this.createdAt).toLocaleString('en-US', {
          timeZone: 'Europe/Madrid',
        }),
      );
    }
    if (this.updatedAt) {
      this.updatedAt = new Date(
        new Date(this.updatedAt).toLocaleString('en-US', {
          timeZone: 'Europe/Madrid',
        }),
      );
    }
  }
}
