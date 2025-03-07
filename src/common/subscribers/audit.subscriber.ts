/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  DataSource,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { BaseEntity } from '../entities/base.entity';
import { REQUEST_USER_KEY } from '../constants';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class AuditSubscriber implements EntitySubscriberInterface {
  constructor(
    dataSource: DataSource,
    private readonly cls: ClsService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return BaseEntity;
  }

  beforeInsert(event: InsertEvent<any>): void {
    const userId = this.cls.get(REQUEST_USER_KEY);
    if (userId) {
      event.entity.createdBy = userId;
      event.entity.updatedBy = userId;
    }
  }

  beforeUpdate(event: UpdateEvent<any>): void {
    const userId = this.cls.get(REQUEST_USER_KEY);
    if (userId) {
      event.entity!.updatedBy = userId;
    }
  }
}
