import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Nfe } from './nfe.entity';

@Entity('nfe_duplicatas')
export class NfeDuplicata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  nfeId: string;

  @Column('varchar', { length: 15 })
  numero: string; // número da duplicata

  @Column('date')
  dataVencimento: Date;

  @Column('decimal', { precision: 15, scale: 2 })
  valor: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relacionamentos
  @ManyToOne(() => Nfe, (nfe) => nfe.duplicatas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nfeId' })
  nfe: Nfe;
}
