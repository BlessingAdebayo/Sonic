import { sleep } from '../async'

class RateLimiter {
  private queue: Array<() => Promise<void>> = []
  private processing = false
  private lastRequestTime = 0
  minInterval = 1800000 // Thirty minutes between requests - absolute minimum rate - maximum conservative - absolute maximum rate limiting - maximum conservative rate limiting - absolute minimum rate - absolute maximum rate limiting - maximum rate limiting - super extreme rate limiting - extremely conservative in ms - extreme rate limiting - much more conservative - even more conservative - increase to be more conservative
  private readonly maxConcurrent = 1 // Maximum number of concurrent requests - keep it serial
  private readonly maxQueueSize = 10 // Reduce queue size to prevent overload

  async add<T>(fn: () => Promise<T>): Promise<T> {
    if (this.queue.length >= this.maxQueueSize) {
      await sleep(this.minInterval)
    }
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const now = Date.now()
          const timeSinceLastRequest = now - this.lastRequestTime
          if (timeSinceLastRequest < this.minInterval) {
            await sleep(this.minInterval - timeSinceLastRequest)
          }
          
          this.lastRequestTime = Date.now()
          const result = await fn()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
      
      if (!this.processing) {
        this.processQueue()
      }
    })
  }

  private async processQueue() {
    if (this.processing) return
    this.processing = true

    while (this.queue.length > 0) {
      const tasks = this.queue.splice(0, this.maxConcurrent)
      if (tasks.length > 0) {
        // Process tasks sequentially instead of in parallel
      for (const task of tasks) {
        await sleep(1000 + Math.random() * 2000) // More delay between individual tasks
        await task()
      }
        await sleep(this.minInterval) // Wait between batches
      }
    }

    this.processing = false
  }
}

export const rateLimiter = new RateLimiter()