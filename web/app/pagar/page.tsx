import QRCode from "qrcode";
import styles from "./page.module.css";
import { CopyPixButton } from "@/components/CopyPixButton";
import { buildPixPayload } from "../../../engine/src/pix/brcode";

/**
 * Tela minimalista de pagamento — mostra o QR Pix e nada mais.
 *
 * A chave Pix, nome e cidade do recebedor vêm de variável de ambiente
 * (nunca fabricadas aqui — ver web/.env.example). Sem elas configuradas,
 * a tela mostra o que falta em vez de fingir um QR falso.
 *
 * Valor opcional via query string: /pagar?valor=4937 (em centavos) — é o
 * "centavo único" (ver CLAUDE.md § Cobrança) já embutido no próprio QR,
 * então o app do banco do cliente já mostra o valor certo sem ele digitar
 * nada.
 */
export default async function PagarPage({
  searchParams,
}: {
  searchParams: Promise<{ valor?: string }>;
}) {
  const { valor } = await searchParams;
  const amountCents = valor ? Number(valor) : undefined;

  const pixKey = process.env.PIX_KEY;
  const merchantName = process.env.PIX_MERCHANT_NAME;
  const merchantCity = process.env.PIX_MERCHANT_CITY;

  if (!pixKey || !merchantName || !merchantCity) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <span className={styles.wordmark}>bettorIA</span>
          <div className={styles.missingConfig}>
            Faltam variáveis de ambiente pra gerar o QR real:
            <br />
            <code>PIX_KEY</code>, <code>PIX_MERCHANT_NAME</code>, <code>PIX_MERCHANT_CITY</code>
            <br />
            <br />
            Ver <code>web/.env.example</code>.
          </div>
        </div>
      </main>
    );
  }

  const payload = buildPixPayload({
    key: pixKey,
    merchantName,
    merchantCity,
    amountCents,
  });

  const svg = await QRCode.toString(payload, {
    type: "svg",
    margin: 0,
    color: { dark: "#22221c", light: "#ffffff00" },
  });

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <span className={styles.wordmark}>bettorIA</span>

        {amountCents !== undefined && (
          <div className={styles.amount}>
            <span className={styles.amountLabel}>valor a pagar</span>
            <span className={`${styles.amountValue} mono`}>
              R$ {(amountCents / 100).toFixed(2).replace(".", ",")}
            </span>
          </div>
        )}

        <div className={styles.qrFrame} dangerouslySetInnerHTML={{ __html: svg }} />

        <p className={styles.instruction}>Aponte a câmera do seu banco pra pagar via Pix.</p>

        <CopyPixButton payload={payload} />
      </div>
    </main>
  );
}
