import { useRef } from "react";
import { StreamingRequest } from "./types";
import { processStream } from "./streamer";

function useStream(
  req: Omit<StreamingRequest, "process">,
  onContentUpdate: (content: string) => void
) {
  const contentRef = useRef("");

  const fetchData = async () => {
    await processStream({
      ...req,
      process: (v: string): boolean => {
        if (v) {
          contentRef.current += v;
          onContentUpdate(contentRef.current);
        }
        return false;
      },
    });
  };

  return fetchData;
}

export { useStream };
