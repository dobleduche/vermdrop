import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    
    // Clean up expired entries every minute
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (now > entry.resetTime) {
          this.store.delete(key);
        }
      }
    }, 60000);
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = this.getKey(req);
      const now = Date.now();
      
      let entry = this.store.get(key);
      
      if (!entry || now > entry.resetTime) {
        entry = {
          count: 0,
          resetTime: now + this.windowMs
        };
        this.store.set(key, entry);
      }
      
      entry.count++;
      
      if (entry.count > this.maxRequests) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
        
        res.status(429).json({
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
          retryAfter
        });
        return;
      }
      
      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': this.maxRequests.toString(),
        'X-RateLimit-Remaining': (this.maxRequests - entry.count).toString(),
        'X-RateLimit-Reset': Math.ceil(entry.resetTime / 1000).toString()
      });
      
      next();
    };
  }

  private getKey(req: Request): string {
    // Use IP address as key, but could also use user ID or wallet address
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
}

// Create different rate limiters for different endpoints
export const registrationLimiter = new RateLimiter(
  15 * 60 * 1000, // 15 minutes
  5 // max 5 registration attempts per 15 minutes
);

export const verificationLimiter = new RateLimiter(
  5 * 60 * 1000, // 5 minutes
  10 // max 10 verification attempts per 5 minutes
);

export const generalLimiter = new RateLimiter(
  60 * 1000, // 1 minute
  30 // max 30 requests per minute
);
