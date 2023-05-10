import { StreamingRequest } from "./types";

const processStream = async (req: StreamingRequest): Promise<void> => {
  const controller = new AbortController();
  const response = await fetch(req.request, {
    ...req.options,
    signal: controller.signal,
  });

  const contentType = response.headers.get("Content-Type");
  const transferEncoding = response.headers.get("Transfer-Encoding");

  try {
    await new Promise<void>(async (resolve, reject) => {
      if (req.timeoutMs) {
        setTimeout(() => {
          reject("Request timed out");
        }, req.timeoutMs);
      }
      const decoder = new TextDecoder();
      if (contentType === "text/event-stream") {
        // This is an SSE event stream
        const eventSource = new EventSource(response.url);
        eventSource.onmessage = (event) => {
          if (req.process(event.data)) {
            resolve();
          }
        };
        eventSource.onerror = (error) => {
          reject(error);
        };
      } else if (transferEncoding === "chunked") {
        // This is a traditional ReadableStream
        if (response.body) {
          const reader = response.body.getReader();
          while (true) {
            const { value, done } = await reader.read();
            const text = decoder.decode(value);
            if (done || req.process(text)) {
              break;
            }
          }
          resolve();
        } else {
          reject("Unable to find a streaming response");
        }
      }
    });
  } catch (rejection: any) {
    throw new Error(JSON.stringify(rejection));
  } finally {
    controller.abort();
  }
};

export { processStream };
