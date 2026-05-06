import express from 'express';
import crypto from 'crypto';
import { redisClient } from '../utils/dbconfig.js';

const router = express.Router();

// Token TTL in seconds. Configurable via .env (default: 3600 = 1 hour).
const TOKEN_TTL_SECONDS = parseInt(process.env.TOKEN_TTL_SECONDS || '3600', 10);

// POST /api/auth/token — anonymous bearer token issuance.
// No auth required. Anyone who hits this gets a token.
router.post('/token', async (req, res) => {
  try {
    // TODO: Implement me!
    // 1. Generate a cryptographically random token (32 bytes, hex-encoded).
    //    DO NOT use Math.random — it is not cryptographically secure.
    //    Hint: node has a built-in module for this.
    // 2. Store the token in Redis under `auth:token:<token>` with a TTL of
    //    TOKEN_TTL_SECONDS. The value can be a small JSON string containing
    //    { issuedAt, ip } for diagnostic purposes.
    // 3. Respond with { token, expiresIn: TOKEN_TTL_SECONDS }.

    const token = crypto.randomBytes(32).toString('hex');
    
    const tokenData = {
      issuedAt: new Date().toISOString(),
      ip: req.ip,
    };

    await redisClient.set(`auth:token:${token}`, JSON.stringify (tokenData), 'EX', TOKEN_TTL_SECONDS);
      
    return res.json({ token, expiresIn: TOKEN_TTL_SECONDS });

  } catch (error) {
    console.error("Error in POST /api/auth/token:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
