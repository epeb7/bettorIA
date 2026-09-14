/**
 * BR Code (Pix Copia e Cola) — o payload que vira QR code de pagamento.
 * Formato oficial do Banco Central (padrão EMV, ID/Length/Value).
 *
 * Não inventa nada: implementa o padrão real, pra o QR sair válido em
 * qualquer banco. A chave Pix em si NUNCA é fabricada aqui — vem de fora
 * (variável de ambiente, ver web/.env.example), porque é dado sensível seu.
 */

function tlv(id: string, value: string): string {
  const length = value.length.toString().padStart(2, "0");
  return `${id}${length}${value}`;
}

/**
 * CRC-16/CCITT-FALSE — algoritmo exigido pelo padrão Pix (poly 0x1021,
 * init 0xFFFF, sem reflect). Testado contra o vetor de teste padrão da
 * família CCITT ("123456789" -> 0x29B1).
 */
export function crc16ccitt(input: string): string {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) !== 0 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export interface PixPayloadInput {
  /** chave Pix (CPF, CNPJ, email, telefone ou chave aleatória) */
  key: string;
  /** nome do recebedor — máx 25 caracteres (o padrão corta, não é bug) */
  merchantName: string;
  /** cidade do recebedor — máx 15 caracteres */
  merchantCity: string;
  /** valor em CENTAVOS (evita erro de ponto flutuante) — omitir pra QR sem valor fixo */
  amountCents?: number;
  /** identificador da transação — "***" é o valor padrão quando não há controle de txid */
  txid?: string;
}

export function buildPixPayload(input: PixPayloadInput): string {
  const merchantAccountInfo = tlv("00", "br.gov.bcb.pix") + tlv("01", input.key);
  const additionalData = tlv("05", input.txid ?? "***");

  let payload = "";
  payload += tlv("00", "01"); // Payload Format Indicator
  payload += tlv("26", merchantAccountInfo); // Merchant Account Info (Pix)
  payload += tlv("52", "0000"); // Merchant Category Code
  payload += tlv("53", "986"); // Moeda: BRL
  if (input.amountCents !== undefined) {
    const amount = (input.amountCents / 100).toFixed(2);
    payload += tlv("54", amount);
  }
  payload += tlv("58", "BR"); // País
  payload += tlv("59", input.merchantName.slice(0, 25).trim());
  payload += tlv("60", input.merchantCity.slice(0, 15).trim());
  payload += tlv("62", additionalData);
  payload += "6304"; // tag+length do CRC, valor calculado a seguir

  return payload + crc16ccitt(payload);
}
