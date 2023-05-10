import React, { useState, useEffect } from "react";
import { useStream } from "./useStream";
import { StreamingRequest } from "./types";

interface WithStreamProps {
  content: string;
}

const withStream = <P extends object>(
  WrappedComponent: React.ComponentType<P & WithStreamProps>,
  req: Omit<StreamingRequest, "process">
) => {
  return (props: P) => {
    const [content, setContent] = useState("");
    const fetchData = useStream(req, (newContent: string) => {
      setContent(newContent);
    });

    useEffect(() => {
      fetchData();
    }, []);

    return <WrappedComponent {...(props as P)} content={content} />;
  };
};

export { withStream };
