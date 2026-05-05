import { BatchType } from '../../models/Enum.js';
import { getLatestBatch } from '../../utils/mongodb.js';
import { Trail } from '../types/trail.js';
import { fetchFromCache, cacheResult } from '../../utils/redis.js';

export const TrailService = {
  // TODO: Implement a method that returns the latest trail array.
  // This should fetch the latest TrailBatch and return its `trails` field,
  // or [] if no batch exists.
  async getLatestTrails(): Promise<Trail[]> {

    const cacheValue = await fetchFromCache("trail");
    if (cacheValue) {
      return (cacheValue as any).trails || [];
    }
    const latestBatch = await getLatestBatch(BatchType.TrailBatch);

    if (!latestBatch) {
      return [];
    }

    await cacheResult("trail", latestBatch, 300);
    return latestBatch.trails || [];
  },

  // TODO: Implement a method that returns a single trail by name.
  // Search the latest batch for a matching name. Return null if not found.
  async getTrailByName(name: string): Promise<Trail | null> {

    for (const trail of await this.getLatestTrails()) {
      if (trail.name === name) {
        return trail;
      }
    }

    return null;
  },

  // TODO: Implement a method that updates a trail's status in the cache.
  //
  // The pattern is read–mutate–write against the cached batch:
  //   1. fetchFromCache for the trail batch
  //   2. find the matching trail (return failure if missing)
  //   3. update its status
  //   4. cacheResult to write the batch back
  async updateTrailStatus(name: string, status: string): Promise<{ success: boolean, message: string }> {
    try {
      let cacheValue = await fetchFromCache("trail");
      if (!cacheValue) {
        const latestBatch = await getLatestBatch(BatchType.TrailBatch);

        if (!latestBatch) {
          return { success: false, message: "Trail batch not found" };
        }

        await cacheResult("trail", latestBatch, 300);
        cacheValue = latestBatch;
      }

      const trailBatch = cacheValue as any;
      const trails = trailBatch.trails as Trail[];

      const trail = trails.find(t => t.name === name);
      if (!trail) {
        return { success: false, message: "Trail not found in batch" };
      }

      trail.status = status as any;
  
      await cacheResult("trail", trailBatch, 300);

      return { success: true, message: "Trail status updated successfully" };

    } catch (err) {
      console.error("Error updating trail status:", err);
      return { success: false, message: "Trail status update failed" };
    }
  }

};
