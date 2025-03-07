import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  AfterLoad,
} from 'typeorm';
import { User } from './user.entity';
import { BaseEntity } from '../common/entities/base.entity';

@Entity('ROLES', { schema: 'ECOMMERCE' })
export class Role extends BaseEntity<Role> {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @Column({ name: 'NAME', length: 50 })
  name: string;

  @Column({ name: 'DESCRIPTION', nullable: true })
  description?: string;

  @Column({ name: 'IS_ACTIVE', default: true })
  isActive: boolean;

  @OneToMany(() => User, (user) => user.role)
  users: User[];

  @AfterLoad()
  adjustTimezone() {
    super.adjustTimezone(); // Llamar al método de la clase padre
    // Aquí puedes añadir ajustes específicos para Role si los necesitas
  }
}
