import { Router, Request, Response, NextFunction } from 'express';
import { findParticipantByIspb } from '../services/bcbClient';
import { isValidIspb, normalizeIspb } from '../utils/ispb';
import { logger } from '../utils/logger';
import { ApiError } from '../types';

const router = Router();

router.get('/participants/:ispb', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ispb } = req.params;

    if (!isValidIspb(ispb)) {
      const errorResponse: ApiError = {
        error: 'Invalid ISPB format',
        code: 'INVALID_ISPB',
        details: 'ISPB must be a numeric string with up to 8 digits',
      };
      logger.warn({ event: 'invalid_ispb', ispb }, 'Invalid ISPB provided');
      res.status(400).json(errorResponse);
      return;
    }

    const normalizedIspb = normalizeIspb(ispb);
    logger.info({ event: 'find_participant_request', ispb: normalizedIspb }, 'Finding participant by ISPB');

    const participant = await findParticipantByIspb(ispb);

    if (!participant) {
      const errorResponse: ApiError = {
        error: 'Participant not found',
        code: 'PARTICIPANT_NOT_FOUND',
      };
      logger.info({ event: 'participant_not_found', ispb: normalizedIspb }, 'Participant not found');
      res.status(404).json(errorResponse);
      return;
    }

    logger.info(
      { event: 'participant_found', ispb: normalizedIspb, nome: participant.nome_reduzido },
      'Participant found'
    );
    res.json(participant);
  } catch (error) {
    next(error);
  }
});

export { router as pixRouter };
