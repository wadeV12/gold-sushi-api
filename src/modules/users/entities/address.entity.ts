import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('addresses')
export class AddressEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'varchar', length: 100 })
  address: string;
  @Column({ type: 'varchar', length: 100 })
  city: string;

  constructor(entity: Partial<AddressEntity>) {
    Object.assign(this, entity);
  }
}
