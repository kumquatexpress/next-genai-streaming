import React, { useEffect, useRef } from "react";

export function withMediaStream<T extends React.HTMLProps<HTMLMediaElement>>(
  WrappedComponent: React.ComponentType<T>,
  mediaData: {
    src: string;
    mimeType: string;
  }
) {
  return function MediaStreamWrapper(props: T) {
    const mediaRef = useRef<any>(null);
    const mediaSourceRef = useRef<MediaSource | null>(null);

    const chunkQueue: ArrayBuffer[] = [];
    let isAppending = false;

    const appendChunksFromQueue = async (sourceBuffer: SourceBuffer) => {
      // Append chunks from the queue if not already appending
      if (isAppending || chunkQueue.length === 0 || sourceBuffer.updating) {
        return;
      }

      isAppending = true;

      try {
        const chunk = chunkQueue.shift();
        if (chunk) {
          await appendBufferPromise(sourceBuffer, chunk);
        }
      } catch (error) {
        console.error("Error appending buffer:", error);
      } finally {
        isAppending = false;
      }

      // Recursively call the function to process the next chunk
      appendChunksFromQueue(sourceBuffer);
    };

    useEffect(() => {
      if (mediaData.src) {
        mediaSourceRef.current = new MediaSource();
        mediaRef.current!.src = URL.createObjectURL(mediaSourceRef.current);
        mediaRef.current!.autoplay = false;

        mediaSourceRef.current.addEventListener("sourceopen", async () => {
          const sourceBuffer = mediaSourceRef.current!.addSourceBuffer(
            mediaData.mimeType
          );
          sourceBuffer.mode = "sequence";

          const response = await fetch(mediaData.src, { keepalive: true });
          const stream = response.body!;
          const reader = stream.getReader();
          while (true) {
            const { value, done } = await reader.read();
            if (done) {
              mediaSourceRef.current!.endOfStream();
              break;
            }

            // Add the chunk to the queue
            chunkQueue.push(value);
            appendChunksFromQueue(sourceBuffer);
          }
        });

        // @ts-ignore
        mediaRef.current.src = URL.createObjectURL(mediaSourceRef.current);
      }
    }, [mediaData.src]);

    const appendBufferPromise = (
      sourceBuffer: SourceBuffer,
      buffer: ArrayBuffer
    ) => {
      return new Promise<void>((resolve, reject) => {
        const onBufferUpdateEnd = () => {
          sourceBuffer.removeEventListener("updateend", onBufferUpdateEnd);
          resolve();
        };

        sourceBuffer.addEventListener("updateend", onBufferUpdateEnd);
        sourceBuffer.appendBuffer(buffer);
      });
    };

    return <WrappedComponent ref={mediaRef} {...props} />;
  };
}
