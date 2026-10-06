/** Espejo de SessionResponseDTO: una sesión activa del usuario en un dispositivo (RF-AUTH-10). */
export interface ActiveSession {
  id: string;
  /** Descripción legible del dispositivo, por ejemplo "Chrome en Windows". */
  deviceInfo: string;
  ipAddress: string;
  /** Fechas ISO-8601 con zona (Instant del backend). */
  createdAt: string;
  lastActiveAt: string;
  /** true en la sesión desde la que se hace la consulta ("este dispositivo"). */
  current: boolean;
}
