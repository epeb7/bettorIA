const DEVICE_SECRET_KEY = "bettoria_device_secret";
const CLIENT_NAME_KEY = "bettoria_client_name";

export function saveSession(deviceSecret: string, clientName: string) {
  try {
    localStorage.setItem(DEVICE_SECRET_KEY, deviceSecret);
    localStorage.setItem(CLIENT_NAME_KEY, clientName);
  } catch {
    // localStorage pode falhar (aba anônima, storage bloqueado) — a
    // sessão simplesmente não persiste; não é motivo pra quebrar a tela.
  }
}

export function readSession(): { deviceSecret: string; clientName: string } | null {
  try {
    const deviceSecret = localStorage.getItem(DEVICE_SECRET_KEY);
    const clientName = localStorage.getItem(CLIENT_NAME_KEY);
    if (!deviceSecret || !clientName) return null;
    return { deviceSecret, clientName };
  } catch {
    return null;
  }
}
