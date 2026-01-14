export interface PixParticipant {
  ispb: string;
  nome: string;
  nome_reduzido: string;
  modalidade_participacao: string;
  tipo_participacao: string;
  inicio_operacao: string;
}

export interface PixParticipantRaw {
  ispb: string | number;
  nome?: string;
  nome_reduzido?: string;
  modalidade_participacao?: string;
  tipo_participacao?: string;
  inicio_operacao?: string;
}

export interface CacheData<T> {
  data: T;
  timestamp: number;
}

export interface CircuitBreakerState {
  failures: number;
  lastFailure: number | null;
  isOpen: boolean;
}

export interface ApiError {
  error: string;
  code: string;
  details?: string;
}
