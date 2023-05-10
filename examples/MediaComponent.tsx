import React from "react";
import { withMediaStream } from "../src/withMediaStream";

const ENDPOINT = "YOUR_STREAMING_ENDPOINT_HERE";
const Media = (props) => {
  return <audio {...props} />;
};

export default withMediaStream(Media, {
  src: ENDPOINT,
  mimeType: "audio/webm",
});
