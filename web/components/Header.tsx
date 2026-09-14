import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <span className={styles.wordmark}>bettorIA</span>
      <button className={styles.avatar} aria-label="Perfil e configurações" type="button">
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="oklch(0.4 0.01 90)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </button>
    </header>
  );
}
