import {
  CancellationToken,
  ChatContext,
  ChatRequest,
  ChatResponseStream,
  ExtensionContext,
  LanguageModelChat,
  ProviderResult,
  Uri,
  workspace,
} from 'vscode';
import { Logger } from '../helpers/logger.helper';

interface IChatResult {
  metadata: {
    command: string;
  };
}

export class ChatProvider {
  private readonly context: ExtensionContext;
  private readonly handler: (
    request: ChatRequest,
    context: ChatContext,
    stream: ChatResponseStream,
    token: CancellationToken,
  ) => ProviderResult<IChatResult>;

  constructor(context: ExtensionContext) {
    this.context = context;
    this.handler = this._handleRequest.bind(this);
  }

  private async _handleRequest(
    request: ChatRequest,
    _context: ChatContext,
    stream: ChatResponseStream,
    _token: CancellationToken,
  ): Promise<IChatResult> {
    const { command } = request;

    if (command === 'teach') {
      stream.progress('Picking the right topic to teach...');
      const response = await this._callDeepSeekAPI(
        'Teach me a random computer science concept.',
        'YOUR_API_KEY', // Replace with your actual API key
        'deepseek-chat',
      );
      stream.markdown(response);
      return { metadata: { command: 'teach' } };
    } else {
      const response = await this._callDeepSeekAPI(
        request.prompt,
        'YOUR_API_KEY', // Replace with your actual API key
        'deepseek-chat',
      );
      stream.markdown(response);
      return { metadata: { command: '' } };
    }
  }

  private async _callDeepSeekAPI(
    message: string,
    apiKey: string,
    model: string,
  ): Promise<string> {
    Logger.info('Calling DeepSeek API...');
    const config = workspace.getConfiguration('kino');
    const timeout = config.get<number>('llm.requestTimeout', 30000);

    const response = await fetch(
      'https://api.deepseek.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content:
                'You are a helpful AI assistant integrated into VS Code. Provide concise, accurate responses to help with development tasks.',
            },
            {
              role: 'user',
              content: message,
            },
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(timeout),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      Logger.error(`API Error ${response.status}: ${errorText}`);
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as {
      choices: { message: { content: string } }[];
    };
    Logger.info('Successfully fetched data from DeepSeek API.');

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      Logger.error('Invalid API response format:', data);
      throw new Error('Invalid API response format');
    }

    return data.choices[0].message.content;
  }
}
