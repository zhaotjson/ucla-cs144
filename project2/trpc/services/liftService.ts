import { getLatestBatch } from '../../utils/mongodb.js';
import { Lift } from '../types/lift.js';
import { fetchFromCache, cacheResult } from '../../utils/redis.js';
import { BatchType } from '../../models/Enum.js';
import { getLocalTimestamp } from '../../utils/dates.js';
import { get } from 'mongoose';

export const LiftService = {
  // TODO: Implement a method that returns the latest lift array.
  // This should fetch the latest LiftBatch and return its `lifts` field,
  // or [] if no batch exists.
  async getLatestLifts(): Promise<Lift[]> {


    const cacheValue = await fetchFromCache("lift");
    if (cacheValue) {
      return (cacheValue as any).lifts || [];
    }
    const latestBatch = await getLatestBatch(BatchType.LiftBatch);

    if (!latestBatch) {
      return [];
    }

    await cacheResult("lift", latestBatch, 300);
    return latestBatch.lifts || [];
  },

  // TODO: Implement a method that returns a single lift by name.
  // Search the latest batch for a matching name. Return null if not found.
  async getLiftByName(name: string): Promise<Lift | null> {

    for (const lift of await this.getLatestLifts()) {
      if (lift.name === name) {
        return lift;
      }
    }

    return null;
  },

  // TODO: Implement a method that updates a lift's status in the cache.
  //
  // The pattern is read–mutate–write against the cached batch:
  //   1. fetchFromCache for the lift batch
  //   2. find the matching lift (return failure if missing)
  //   3. update its status and lastUpdated timestamp
  //   4. cacheResult to write the batch back
  //
  // Hint: you'll need a helper to produce a current timestamp string.
  // Check utils/ for something useful — you may need to add an import.
  async updateLiftStatus(name: string, status: string): Promise<{ success: boolean, message: string }> {
    
    try {
      let cacheValue = await fetchFromCache("lift");
      if (!cacheValue) {
        const latestBatch = await getLatestBatch(BatchType.LiftBatch);

        if (!latestBatch) {
          return { success: false, message: "Lift batch not found" };
        }

        await cacheResult("lift", latestBatch, 300);
        cacheValue = latestBatch;
      }

      const liftBatch = cacheValue as any;
      const lifts = liftBatch.lifts as Lift[];

      const lift = lifts.find(l => l.name === name);
      if (!lift) {
        return { success: false, message: "Lift not found in batch" };
      }

      lift.status = status as any;
      lift.lastUpdated = new Date(getLocalTimestamp());

      await cacheResult("lift", liftBatch, 300);

      return { success: true, message: "Lift date status updated successfully" };

    } catch (err) {
      console.error("Error updating lift status:", err);
      return { success: false, message: "Lift status update failed" };
    }
  }

};
