import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Produto } from '../../produtos/entities/produto.entity';
import { PedidoVenda } from '../../pedidos-venda/entities/pedido-venda.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  cnpj: string;

  @Column()
  name: string;

  @Column({ unique: true })
  token: string;

  @Column({ default: true })
  isActive: boolean;

  // Dados adicionais da consulta CNPJ
  @Column({ nullable: true })
  founded: string;

  @Column({ nullable: true })
  nature: string;

  @Column({ nullable: true })
  size: string;

  @Column({ nullable: true })
  status: string;

  @Column({ type: 'json', nullable: true })
  address: {
    street: string;
    number: string;
    district: string;
    city: string;
    state: string;
    zip: string;
  };

  @Column({ nullable: true })
  mainActivity: string;

  @Column({ type: 'json', nullable: true })
  phones: Array<{
    type: string;
    area: string;
    number: string;
  }>;

  @Column({ type: 'json', nullable: true })
  emails: Array<{
    ownership: string;
    address: string;
  }>;

  @Column({ type: 'json', nullable: true })
  members: Array<{
    name: string;
    role: string;
    type: string;
  }>;

  @ManyToMany(() => User, (user) => user.companies)
  users: User[];

  @OneToMany(() => Produto, (produto) => produto.company)
  produtos: Produto[];

  @OneToMany(() => PedidoVenda, (pedidoVenda) => pedidoVenda.company)
  pedidosVenda: PedidoVenda[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
