import React from "react";
import { withStream } from "../src/withStream";

const ENDPOINT = "YOUR_STREAMING_ENDPOINT_HERE";
const Text = (props: { content: string }) => {
  return <div>{props.content}</div>;
};

export default withStream(Text, {
  request: ENDPOINT,
  options: { method: "GET", keepalive: true },
});
