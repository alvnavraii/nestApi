import { CreateDateColumn, UpdateDateColumn, Column, AfterLoad } from 'typeorm';

export abstract class BaseEntity {
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

  @Column({
    name: 'CREATED_BY',
    type: 'number',
    nullable: true,
  })
  createdById: number;

  @Column({
    name: 'UPDATED_BY',
    type: 'number',
    nullable: true,
  })
  updatedById: number;

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
