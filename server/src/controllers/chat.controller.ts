import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '#src/types/authRequest.type.ts';
import { ChatServiceError, answerChatMessage } from '#src/services/chat.service.ts';

// ── Schemas ────────────────────────────────────────────────────────────────────
// Validation schemas for chat requests and conversation history

const chatHistorySchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(4000),
});

const chatRequestSchema = z.object({
  message: z.string().trim().min(1, 'Message is required').max(4000, 'Message is too long'),
  conversationId: z.string().trim().min(1).max(200).optional(),
  history: z.array(chatHistorySchema).max(8).optional(),
});

// ── Controllers ────────────────────────────────────────────────────────────────
/**
 * POST /chat
 * Answers a user's chat message using the AI server, with optional conversation context.
 * Requires authentication. Supports conversation history for context-aware responses.
 */
export const postChat = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const { message, conversationId, history } = chatRequestSchema.parse(req.body);
    const reply = await answerChatMessage({
      userId: req.userId,
      message,
      conversationId,
      history,
    });

    res.status(200).json({ reply });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0]?.message ?? 'Invalid chat request';
      res.status(400).json({ message: firstIssue });
      return;
    }

    if (error instanceof ChatServiceError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    console.error('[chat/post]', error);
    res.status(500).json({ message: 'Failed to answer chat request' });
  }
};
