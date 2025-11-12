import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationsTable1731277000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        mensagem TEXT NOT NULL,
        link TEXT,
        lida BOOLEAN DEFAULT false,
        lida_em TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        
        CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    await queryRunner.query(`CREATE INDEX idx_notifications_user ON notifications(user_id)`);
    await queryRunner.query(`CREATE INDEX idx_notifications_lida ON notifications(lida)`);
    await queryRunner.query(`CREATE INDEX idx_notifications_created ON notifications(created_at)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_notifications_created`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_notifications_lida`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_notifications_user`);
    await queryRunner.query(`DROP TABLE IF EXISTS notifications`);
  }
}



