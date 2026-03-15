import { ChangeDetectionStrategy, Component, DestroyRef, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { AiChatService, PortfolioChatRateLimitError, PortfolioChatResponse } from '../../../services/ai-chat.service';

const OWL_ICON_PATH = 'assets/icons/owl-icon.png';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
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
  private readonly aiChatService = inject(AiChatService);
  private readonly destroyRef = inject(DestroyRef);

  isOpen: WritableSignal<boolean> = signal(false);
  isLoading: WritableSignal<boolean> = signal(false);
  inputValue: WritableSignal<string> = signal('');
  messages: WritableSignal<ChatMessage[]> = signal<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm Kapil's portfolio assistant. Ask me about his experience, skills, projects, education, or what he's written about on his blog. For more detail on a specific post, go to Blogs and open that post—you can use the chat there too.",
    },
  ]);

  readonly hasMessages: Signal<boolean> = computed(() => this.messages().length > 0);

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
    this.aiChatService
      .sendMessage(text)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: PortfolioChatResponse | null) => {
          const reply = response?.reply?.trim()
            || "Sorry, I couldn't answer that right now. Please try again in a moment.";
          this.appendMessage({ role: 'assistant', content: reply });
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
        complete: () => {
          this.isLoading.set(false);
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

  private appendMessage(message: ChatMessage): void {
    this.messages.update(current => [...current, message]);
  }

}
