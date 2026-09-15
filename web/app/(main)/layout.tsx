import styles from "./layout.module.css";
import { TabBar } from "@/components/TabBar";

/**
 * Layout compartilhado por / e /historico — as duas "abas" principais.
 * /pagar e /ativar ficam de fora de propósito: são fluxos de uma tela só,
 * sem chrome de navegação.
 */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <div className={styles.content}>{children}</div>
      <TabBar />
    </div>
  );
}
