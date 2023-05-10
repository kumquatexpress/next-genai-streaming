export interface StreamingRequest {
  // Basic request types from fetch()
  request: RequestInfo | URL;
  options: RequestInit;
  // the request value will be streamed to this function
  // if process returns true then the stream will terminate
  process: (v: string) => boolean;
  timeoutMs?: number; // optional milliseconds to wait before canceling the request
}
