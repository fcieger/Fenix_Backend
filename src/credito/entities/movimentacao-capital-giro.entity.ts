import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CapitalGiro } from './capital-giro.entity';

@Entity('movimentacoes_capital_giro')
export class MovimentacaoCapitalGiro {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'capital_giro_id', type: 'uuid' })
  capitalGiroId: string;

  // Movimentação
  @Column({ type: 'varchar', length: 50 })
  tipo: string; // 'utilizacao', 'pagamento', 'juros'

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  valor: number;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  // Saldo após movimentação
  @Column({ name: 'saldo_anterior', type: 'decimal', precision: 15, scale: 2, nullable: true })
  saldoAnterior: number;

  @Column({ name: 'saldo_posterior', type: 'decimal', precision: 15, scale: 2, nullable: true })
  saldoPosterior: number;

  // Relacionamento
  @ManyToOne(() => CapitalGiro, (capital) => capital.movimentacoes)
  @JoinColumn({ name: 'capital_giro_id' })
  capitalGiro: CapitalGiro;

  // Auditoria
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Métodos auxiliares
  ehUtilizacao(): boolean {
    return this.tipo === 'utilizacao';
  }

  ehPagamento(): boolean {
    return this.tipo === 'pagamento';
  }

  ehJuros(): boolean {
    return this.tipo === 'juros';
  }
}




