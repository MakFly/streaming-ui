import type { ChatTransport, UIMessage, UIMessageChunk } from 'ai';

/* A ChatTransport with no server behind it: the demo script writes the chunks a real /api/chat route would stream
 * (the AI SDK's UI message stream protocol), and useChat renders them like any other response. Swap it for
 * DefaultChatTransport({ api: '/api/chat' }) and the same templates render a live model. */

export interface Turn {
  /** Queues a chunk for useChat; false once the turn is closed (finished, stopped, or the chat was reset). */
  write(chunk: UIMessageChunk): boolean;
  close(): void;
  readonly open: boolean;
}

export class ScriptTransport implements ChatTransport<UIMessage> {
  private pending: ReadableStream<UIMessageChunk> | null = null;

  /** Opens the stream the next request reads: call it right before chat.sendMessage(). */
  turn(): Turn {
    let controller!: ReadableStreamDefaultController<UIMessageChunk>;
    let open = true;
    this.pending = new ReadableStream<UIMessageChunk>({
      start: (c) => void (controller = c),
      // useChat cancels the read when it is stopped: later writes are dropped.
      cancel: () => void (open = false),
    });
    return {
      write(chunk) {
        if (!open) return false;
        controller.enqueue(chunk);
        return true;
      },
      close() {
        if (!open) return;
        open = false;
        controller.close();
      },
      get open() {
        return open;
      },
    };
  }

  async sendMessages() {
    const stream = this.pending;
    this.pending = null;
    if (!stream) throw new Error('ScriptTransport: no turn was opened for this request');
    return stream;
  }

  async reconnectToStream() {
    return null;
  }
}
