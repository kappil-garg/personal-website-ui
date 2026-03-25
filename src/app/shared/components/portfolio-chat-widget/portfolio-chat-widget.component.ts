import { ChangeDetectionStrategy, Component, DestroyRef, WritableSignal, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import {
  AiChatService,
  PortfolioChatRateLimitError,
  PortfolioChatResponse,
  PortfolioChatSource,
} from '../../../services/ai-chat.service';
import { finalize } from 'rxjs/operators';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

const OWL_ICON_PATH = 'assets/icons/owl-icon.png';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: PortfolioChatSource[];
}

@Component({
  selector: 'app-portfolio-chat-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio-chat-widget.component.html',
  styleUrl: './portfolio-chat-widget.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioChatWidgetComponent {

  readonly owlIconPath = OWL_ICON_PATH;

  /** When set, the API scopes retrieval to this project (plus personal info). */
  readonly projectContextId = input<string | null>(null);

  private readonly aiChatService = inject(AiChatService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sanitizer = inject<DomSanitizer>(DomSanitizer);

  isOpen: WritableSignal<boolean> = signal(false);
  isLoading: WritableSignal<boolean> = signal(false);
  inputValue: WritableSignal<string> = signal('');
  messages: WritableSignal<ChatMessage[]> = signal<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm Kapil's portfolio assistant. Ask me about his experience, skills, projects, education, or what he's written about on his blog. For more detail on a specific post, go to Blogs and open that post. You can use the chat there too.",
    },
  ]);

  toggleOpen(): void {
    this.isOpen.update(value => !value);
  }

  close(): void {
    this.isOpen.set(false);
  }

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement | null;
    if (!target) {
      return;
    }
    this.inputValue.set(target.value);
  }

  send(): void {
    const text = this.inputValue().trim();
    if (!text || this.isLoading()) {
      return;
    }
    this.appendMessage({ role: 'user', content: text });
    this.inputValue.set('');
    this.isLoading.set(true);
    const pid = this.projectContextId();
    this.aiChatService
      .sendMessage(text, pid && pid.length > 0 ? pid : null)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: (response: PortfolioChatResponse | null) => {
          const reply = response?.reply?.trim()
            || "Sorry, I couldn't answer that right now. Please try again in a moment.";
          const sources = response?.sources?.filter(s => s != null) ?? [];
          this.appendMessage({
            role: 'assistant',
            content: reply,
            sources: sources.length > 0 ? sources : undefined,
          });
        },
        error: (err: unknown) => {
          const message =
            err instanceof PortfolioChatRateLimitError
              ? err.message
              : "Something went wrong while contacting the assistant. Please try again.";
          this.appendMessage({
            role: 'assistant',
            content: message,
          });
        },
      });
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  getMessageHtml(message: ChatMessage): SafeHtml {
    const rendered = marked.parseInline(message.content) as string | Promise<string>;
    const rawHtml = typeof rendered === 'string' ? rendered : '';
    return this.sanitizer.bypassSecurityTrustHtml(rawHtml);
  }

  private appendMessage(message: ChatMessage): void {
    this.messages.update(current => [...current, message]);
  }

}
