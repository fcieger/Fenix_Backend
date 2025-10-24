import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class ConfiguracaoNfeCryptoService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;
  private readonly ivLength = 16;

  constructor() {
    const encryptionKey = process.env.ENCRYPTION_KEY;
    
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY não está definida nas variáveis de ambiente');
    }

    // Garantir que a chave tenha 32 bytes
    this.key = Buffer.from(encryptionKey.padEnd(32, '0').substring(0, 32));
  }

  /**
   * Criptografa um texto usando AES-256-CBC
   */
  encrypt(text: string): string {
    if (!text) {
      return text;
    }

    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Retorna IV + texto criptografado
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Descriptografa um texto criptografado
   */
  decrypt(text: string): string {
    if (!text) {
      return text;
    }

    try {
      const parts = text.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encryptedText = parts[1];
      
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Erro ao descriptografar:', error);
      return text; // Retorna o texto original em caso de erro
    }
  }
}



