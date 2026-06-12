import type { BuildRequest, BuildResponse } from "./protocol";

export type BuildInput = Omit<BuildRequest, "id">;
export type { BuildResponse } from "./protocol";

const DEBOUNCE_MS = 150;

/** Build worker handle: leading+trailing debounce, latest-wins delivery. */
export class BuildClient {
  private worker: Worker;
  private nextId = 1;
  private lastSentId = 0;
  private lastSentAt = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private pending: BuildInput | null = null;

  constructor(private onResult: (result: BuildResponse) => void) {
    this.worker = new Worker(new URL("./build.worker.ts", import.meta.url), {
      type: "module",
    });
    this.worker.onmessage = (event: MessageEvent<BuildResponse>) => {
      // Only the most recent request matters; drop stale responses.
      if (event.data.id === this.lastSentId) this.onResult(event.data);
    };
  }

  request(input: BuildInput): void {
    this.pending = input;
    if (this.timer) return;
    const wait = DEBOUNCE_MS - (Date.now() - this.lastSentAt);
    if (wait <= 0) {
      this.flush();
    } else {
      this.timer = setTimeout(() => {
        this.timer = null;
        this.flush();
      }, wait);
    }
  }

  private flush(): void {
    if (!this.pending) return;
    this.lastSentId = this.nextId++;
    this.lastSentAt = Date.now();
    const message: BuildRequest = { ...this.pending, id: this.lastSentId };
    this.pending = null;
    this.worker.postMessage(message);
  }

  dispose(): void {
    if (this.timer) clearTimeout(this.timer);
    this.worker.terminate();
  }
}
