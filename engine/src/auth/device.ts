/**
 * Segredo de dispositivo — o que fica gravado no navegador do cliente
 * depois que ele consome o token de ativação (ver token.ts). É isso que
 * autentica as visitas seguintes, sem senha.
 */
import { randomBytes } from "node:crypto";

export function generateDeviceSecret(): string {
  return randomBytes(32).toString("base64url"); // 256 bits
}
