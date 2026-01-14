import axios, { AxiosError } from 'axios';
import { config } from '../config';
import { PixParticipant, PixParticipantRaw } from '../types';
import { logger } from '../utils/logger';
import { normalizeIspb } from '../utils/ispb';
import { circuitBreaker } from '../utils/circuitBreaker';
import { withRetry } from '../utils/retry';
import { participantsCache } from './cache';

const normalizeParticipant = (raw: PixParticipantRaw): PixParticipant => ({
  ispb: normalizeIspb(raw.ispb),
  nome: raw.nome || '',
  nome_reduzido: raw.nome_reduzido || '',
  modalidade_participacao: raw.modalidade_participacao || '',
  tipo_participacao: raw.tipo_participacao || '',
  inicio_operacao: raw.inicio_operacao || '',
});

const fetchFromBcb = async (): Promise<PixParticipant[]> => {
  logger.info({ event: 'bcb_fetch_start', url: config.bcbPixUrl }, 'Fetching participants from BCB');

  const response = await axios.get<PixParticipantRaw[]>(config.bcbPixUrl, {
    timeout: config.requestTimeoutMs,
    headers: {
      Accept: 'application/json',
    },
  });

  const rawData = response.data;

  if (!Array.isArray(rawData)) {
    throw new Error('Invalid response format from BCB API');
  }

  const normalized = rawData.map(normalizeParticipant);

  logger.info(
    { event: 'bcb_fetch_success', count: normalized.length },
    'Successfully fetched participants from BCB'
  );

  return normalized;
};

export const getParticipants = async (): Promise<PixParticipant[]> => {
  const cached = await participantsCache.get();
  if (cached) {
    return cached;
  }

  if (circuitBreaker.isOpen()) {
    logger.warn({ event: 'circuit_breaker_rejection' }, 'Request rejected by circuit breaker');
    throw new Error('Service temporarily unavailable');
  }

  try {
    const participants = await withRetry(fetchFromBcb);
    await participantsCache.set(participants);
    circuitBreaker.recordSuccess();
    return participants;
  } catch (error) {
    circuitBreaker.recordFailure();
    const axiosError = error as AxiosError;
    logger.error(
      {
        event: 'bcb_fetch_error',
        error: axiosError.message,
        status: axiosError.response?.status,
      },
      'Failed to fetch participants from BCB'
    );
    throw error;
  }
};

export const findParticipantByIspb = async (ispb: string): Promise<PixParticipant | null> => {
  const normalizedIspb = normalizeIspb(ispb);
  const participants = await getParticipants();
  return participants.find((p) => p.ispb === normalizedIspb) || null;
};
