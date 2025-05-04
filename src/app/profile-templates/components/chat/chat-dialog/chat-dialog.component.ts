import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, AfterViewInit, Inject, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChatService, OnlineUser, ChatMessage } from '@app/_services/chat.service';
import { AccountService } from '@app/_services/account.service';
import { Subscription } from 'rxjs';
import { environment } from '@environments/environment';
import { CustomTooltipDirective } from '@app/shared/custom-tooltip/custom-tooltip.directive';

interface ChatDialogData {
  user: OnlineUser;
}

@Component({
  selector: 'app-chat-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatBadgeModule,
  ],
  template: `
    <div class="chat-window" [class.minimized]="isMinimized" [style.height]="isMinimized ? '64px' : '600px'">
      <div class="chat-header" (click)="toggleMinimize()">
        <div class="user-info">
          <img [src]="data.user.profileImage" [alt]="data.user.name" class="user-avatar">
          <span class="user-name">{{ data.user.name }}</span>
          <span class="online-status online"></span>
        </div>
        <div class="header-actions">
          
          <button class="icon-btn"
                  (click)="refreshMessages($event)"
                  [matBadge]="hasNewMessages ? '●' : ''"
                  [matBadgeColor]="'accent'"
                  [matBadgeSize]="'small'"
                  title="Refresh chat"
                >
            <span class="icon-circle"><i class="fa fa-sync"></i></span>
          </button>
          <button class="icon-btn" (click)="clearChatView($event)" title="Clear chat view">
            <span class="icon-circle"><i class="fa fa-ban"></i></span>
          </button>
          <button class="icon-btn" (click)="minimize($event)" [title]="isMinimized ? 'Maximize chat view' : 'Minimize chat view'">
            <span class="icon-circle">
              <i class="fa" [ngClass]="isMinimized ? 'fa-plus' : 'fa-minus'"></i>
            </span>
          </button>
          <button class="icon-btn" (click)="close($event)" title="Close chat">
            <span class="icon-circle"><i class="fa fa-times"></i></span>
          </button>
        </div>
      </div>
      
      <div class="chat-body" [class.hidden]="isMinimized">
        <div class="messages" #messageContainer>
          <div *ngFor="let message of messages" 
               class="message" 
               [class.sent]="message.senderId === currentUserId"
               [class.received]="message.senderId !== currentUserId">
            <ng-container *ngIf="message.senderId !== currentUserId; else sentMessage">
              <div class="message-grid received">
                <div class="avatar-cell">
                  <img [src]="data.user.profileImage" class="message-avatar avatar-received" alt="Sender" />
                </div>
                <div class="meta-cell received">
                  <div class="time-received">{{ message.timestamp | date:'shortTime' }}</div>
                  <div class="message-content text-received">{{ message.content }}</div>
                </div>
              </div>
            </ng-container>
            <ng-template #sentMessage>
              <div class="message-grid sent">
                <div class="meta-cell sent">
                  <div class="time-sent">{{ message.timestamp | date:'shortTime' }}</div>
                  <div class="message-content text-sent">{{ message.content }}</div>
                </div>
                <div class="avatar-cell sent">
                  <img [src]="currentUserProfileImage" class="message-avatar avatar-sent" alt="You" />
                </div>
              </div>
            </ng-template>
          </div>
        </div>
        
        <div class="chat-input">
          <mat-form-field appearance="outline">
            <input matInput 
                   [(ngModel)]="newMessage" 
                   placeholder="Type a message..."
                   (keyup.enter)="sendMessage()">
          </mat-form-field>
          <button mat-icon-button color="primary" (click)="sendMessage()" [disabled]="!newMessage.trim()">
            <mat-icon>send</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./chat-dialog.component.scss']
})
export class ChatDialogComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  currentUserId: string;
  messages: ChatMessage[] = [];
  newMessage: string = '';
  isMinimized: boolean = false;
  hasNewMessages: boolean = false;
  private messageSubscription?: Subscription;
  private lastSeenMessageId: string | null = null;
  private lastMessageCount: number = 0;
  currentUserProfileImage: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ChatDialogData,
    private dialogRef: MatDialogRef<ChatDialogComponent>,
    private chatService: ChatService,
    private accountService: AccountService,
    private renderer: Renderer2,
    private elRef: ElementRef
  ) {
    this.currentUserId = this.accountService.accountValue?.id || '';
  }

  ngOnInit() {
    console.log('[ChatDialog] Initializing with currentUserId:', this.currentUserId, 'recipient:', this.data.user);
    if (!this.currentUserId) {
      console.error('[ChatDialog] No current user ID available');
      return;
    }

    // Ensure profile image URL is properly formatted
    if (this.data.user.profileImage) {
      this.data.user.profileImage = this.data.user.profileImage.startsWith('http') 
        ? this.data.user.profileImage 
        : `${environment.apiUrl}/${this.data.user.profileImage}`;
    }

    const profileImage = this.accountService.accountValue?.profileImage;
    this.currentUserProfileImage = profileImage
      ? (profileImage.startsWith('http') ? profileImage : `${environment.apiUrl}/${profileImage}`)
      : 'assets/default-avatar.png'; // fallback

    this.subscribeToMessages();
    window.addEventListener('focus', this.onWindowFocus);
  }

  ngAfterViewInit() {
    this.updateDialogContainerClass();
    // Initial scroll to bottom
    this.scrollToBottom();
  }

  ngAfterViewChecked() {
    // Only scroll if we're at the bottom
    if (this.isScrolledToBottom()) {
      this.scrollToBottom();
    }
  }

  ngOnDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    if (this.messageContainer) {
      this.messageContainer.nativeElement.removeEventListener('scroll', this.onScroll.bind(this));
    }
    window.removeEventListener('focus', this.onWindowFocus);
  }

  private scrollToBottom(): void {
    if (!this.messageContainer?.nativeElement) {
      console.log('[ChatDebug] Message container not ready for scrolling');
      return;
    }

    try {
      const element = this.messageContainer.nativeElement;
      setTimeout(() => {
        element.scrollTop = element.scrollHeight;
      }, 0);
    } catch (err) {
      console.error('[ChatDebug] Error scrolling to bottom:', err);
    }
  }

  private isScrolledToBottom(): boolean {
    if (!this.messageContainer?.nativeElement) return true;
    
    const element = this.messageContainer.nativeElement;
    const threshold = 5; // Allow a small threshold for pixel rounding
    return element.scrollHeight - element.scrollTop - element.clientHeight < threshold;
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    this.updateDialogContainerClass();
    if (!this.isMinimized) {
      this.hasNewMessages = false;
      if (this.messages.length > 0) {
        this.lastSeenMessageId = this.messages[this.messages.length - 1].id || null;
      }
      // Scroll to bottom when restoring from minimized state
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  minimize(event: MouseEvent) {
    event.stopPropagation();
    this.isMinimized = !this.isMinimized;
    setTimeout(() => this.updateDialogContainerClass(), 0);
  }

  updateDialogContainerClass() {
    // Find the overlay pane for this dialog
    const panes = document.querySelectorAll('.cdk-overlay-pane.chat-dialog-container');
    panes.forEach(pane => {
      if (this.isMinimized) {
        pane.classList.add('minimized');
      } else {
        pane.classList.remove('minimized');
      }
    });
  }

  close(event: Event) {
    event.stopPropagation();
    this.dialogRef.close();
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    console.log(`[ChatDebug][Dialog] Sending message from ${this.currentUserId} to ${this.data.user.id}`);
    const message: ChatMessage = {
      content: this.newMessage.trim(),
      senderId: this.currentUserId,
      recipientId: this.data.user.id,
      timestamp: new Date()
    };

    console.log('[ChatDebug][Dialog] Message object:', message);
    this.chatService.sendMessage(message).subscribe({
      next: (sentMessage) => {
        console.log('[ChatDebug][Dialog] Message sent successfully:', sentMessage);
        this.newMessage = '';
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (error) => {
        console.error('[ChatDebug][Dialog] Error sending message:', error);
      }
    });
  }

  private onScroll() {
    if (this.isScrolledToBottom()) {
      this.hasNewMessages = false;
      if (this.messages.length > 0) {
        this.lastSeenMessageId = this.messages[this.messages.length - 1].id || null;
      }
    }
  }

  private subscribeToMessages() {
    if (!this.currentUserId || !this.data.user.id) {
      console.error('[ChatDebug][Dialog] Missing user IDs for chat');
      return;
    }

    const chatId = [this.currentUserId, this.data.user.id].sort().join('-');
    console.log(`[ChatDebug][Dialog] Subscribing to messages for chatId: ${chatId}`);
    this.messageSubscription = this.chatService
      .getMessages(this.currentUserId, this.data.user.id)
      .subscribe({
        next: (messages) => {
          console.log('[ChatDebug][Dialog] Received messages update:', messages);
          // Check if there are new messages from the other user
          const newMessagesFromOther = messages.filter(msg => 
            msg.senderId !== this.currentUserId && 
            !this.messages.some(existing => existing.id === msg.id)
          );
          // Update messages array
          this.messages = messages;
          // If there are new messages from the other user and not scrolled to bottom, set hasNewMessages
          setTimeout(() => {
            if (newMessagesFromOther.length > 0 && !this.isScrolledToBottom()) {
              this.hasNewMessages = true;
            }
            // If scrolled to bottom, reset hasNewMessages
            if (this.isScrolledToBottom()) {
              this.hasNewMessages = false;
              if (this.messages.length > 0) {
                this.lastSeenMessageId = this.messages[this.messages.length - 1].id || null;
              }
            }
          }, 100);
          setTimeout(() => this.scrollToBottom(), 100);
        },
        error: (error) => {
          console.error('[ChatDebug][Dialog] Error receiving messages:', error);
        }
      });
  }

  clearChatView(event: Event) {
    event.stopPropagation();
    console.log('[ChatDebug][Dialog] Clearing chat view for this session');
    this.messages = [];
  }

  refreshMessages(event: Event) {
    event.stopPropagation();
    this.hasNewMessages = false;
    if (this.messages.length > 0) {
      this.lastSeenMessageId = this.messages[this.messages.length - 1].id || null;
    }
    // Force a refresh of messages from the server
    this.chatService.refreshMessages(this.currentUserId, this.data.user.id).subscribe({
      next: (messages) => {
        this.messages = messages;
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  onWindowFocus = () => {
    this.refreshMessages({ stopPropagation: () => {} } as Event);
  }
} 