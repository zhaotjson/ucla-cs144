import { z } from 'zod';
import { t } from '../config.js';
import { TrailService } from '../services/trailService.js';
import { TrailStatus } from '../../models/Enum.js';

const router = t.router;
const publicProcedure = t.procedure;

// Status validator: rejects any value not in the TrailStatus enum.
const trailStatusValidator = z.nativeEnum(TrailStatus);

// Name validator: non-empty, length-bounded. Real trail names contain spaces,
// digits, and punctuation, so we don't restrict character set here.
const trailNameSchema = z.string().min(1).max(100);

export const trailRouter = router({
  // TODO: Implement a procedure that returns the latest trail batch.
  // Should return all trails in the current batch, or [] if none exists.
  getLatest: publicProcedure.query(async () => {
    // Student implementation here
    const latestTrailBatch = await TrailService.getLatestTrails();
    if (!latestTrailBatch) {
      return [];
    }

    return latestTrailBatch;
  }),

  // TODO: Implement a procedure that returns a single trail by name.
  // The input is validated by Zod; tighten the schema below if you wish.
  // Return the matching trail, or throw a tRPC NOT_FOUND error if it doesn't exist.
  getByName: publicProcedure
    .input(z.object({ name: trailNameSchema }))
    .query(async ({ input }) => {
      // TODO: Implement me!
        const trail = await TrailService.getTrailByName(input.name);
        if (!trail) {
          throw new Error("Trail not found");
        }
        else{
        return trail;
        }

    }),

  // TODO: Implement a procedure that updates a trail's status in Redis.
  // Zod will reject any status that isn't a valid TrailStatus value before
  // your resolver runs. Inside the resolver:
  //   1. read the cached batch
  //   2. find the named trail; if missing, throw a tRPC NOT_FOUND error
  //   3. update its status
  //   4. write the batch back to the cache
  //   5. return { success: true, message: '...' }
  updateStatus: publicProcedure
    .input(z.object({
      name:   trailNameSchema,
      status: trailStatusValidator,
    }))
    .mutation(async ({ input }) => {
      // TODO: Implement me!
      const {name, status} = input;
      const result = await TrailService.updateTrailStatus(name, status);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    }),
});
