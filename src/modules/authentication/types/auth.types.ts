/** Roles que una persona puede elegir al registrarse o al cambiar de rol. */
export type SelectableRole = 'SEEKER' | 'PROVIDER';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: SelectableRole;
  acceptedTerms: boolean;
}
