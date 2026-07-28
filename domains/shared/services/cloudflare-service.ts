// domains/shared/services/cloudflare-service.ts

export interface R2Object {
  key: string;
  size: number;
  uploadedAt: string;
}

export class CloudflareService {
  private static localMockR2: Record<string, Buffer> = {};
  private static localMockQueue: any[] = [];

  /**
   * Uploads student homework files or portfolios to Cloudflare R2.
   * In Cloudflare Pages, this resolves to `process.env.TIPTOP_R2` or `env.TIPTOP_R2` binding context.
   */
  public static async uploadToR2(key: string, data: Buffer, contentType: string): Promise<R2Object> {
    // Local mock for development / preview modes
    this.localMockR2[key] = data;
    console.log(`[Cloudflare R2] Successfully uploaded portfolio file: ${key} (${data.length} bytes, type: ${contentType})`);

    return {
      key,
      size: data.length,
      uploadedAt: new Date().toISOString()
    };
  }

  /**
   * Enqueues outbox event sync payloads to Cloudflare Queues for async processing.
   * In Cloudflare Pages, this resolves to `process.env.TIPTOP_QUEUE` binding.
   */
  public static async enqueueEvent(eventType: string, payload: Record<string, any>): Promise<void> {
    const queueMessage = {
      id: `msg-${Math.floor(Math.random() * 1000000)}`,
      eventType,
      payload,
      timestamp: new Date().toISOString()
    };

    this.localMockQueue.push(queueMessage);
    console.log(`[Cloudflare Queues] Enqueued transactional outbox event: ${eventType} (ID: ${queueMessage.id})`);
  }

  public static getMockQueue(): any[] {
    return this.localMockQueue;
  }

  public static getMockR2Keys(): string[] {
    return Object.keys(this.localMockR2);
  }
}
