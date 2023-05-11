# NextJS Streaming Helpers

## Getting started
Install the library

`$ npm i next-genai-streaming`

Use the library (visit `examples/` for more)

```
import { withStream } from "next-genai-streaming";

const Text = (props) => (<div>{props.content}</div>)
export default withStream(Text, {
  request: YOUR_URL_ENDPOINT,
  options: { method: "GET" },
});
```
![Example Component](./examples/output.gif)

`withStream` takes a React component and an `endpoint`. It continually streams the response from `endpoint` and updates the component's `props.content` value. When unmounted, `withStream` will automatically send an abort signal and close the connection.

The `request` and `options` fields of `withStream` come directly from the `fetch` API. `timeoutMs` is an optional parameter that will close the connection after waiting for that many milliseconds.

<br/>

## Media
The library contains HOCs for both text and audio. `withMediaStream` wraps an `<audio>` or `<media>` element and streams from a source URL. This lets you stream text-to-speech to users with Eleven Labs or Coqui without having to deal with your own chunking and decoding.

```
import { withMediaStream} from "next-genai-streaming";

const Media = (props) => (<audio {...props} />)
withMediaStream(Media, {
  src: YOUR_URL_ENDPOINT,
  mimeType: "audio/webm",
});
```

<br/>

## OpenAI API
Included is an API helper for streaming OpenAI completions. Currently, the endpoint uses SSE on a POST request, which is not supported by the native browser `EventSource`. Also, you'd have to expose your API key on the browser. Instead, you can use `OAIStreamingCompletion` to create a NextJS serverless endpoint and send that as a default ReadableStream instead.

Create the endpoint at `/pages/api` and plug directly into `withStream` - you'll be up and running immediately!

```
import { OAIStreamingCompletion } from "next-genai-streaming";

export async function GET(req: Request): Promise<Response> {
    const stream = await OAIStreamingCompletion(
        {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Hello world!" }],
        },
        process.env.OPENAI_API_KEY
    );
    return new Response(stream);
}
```

