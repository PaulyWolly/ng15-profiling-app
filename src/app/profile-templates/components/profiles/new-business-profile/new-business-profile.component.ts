import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Account } from '@app/_models';
import { MatDialog } from '@angular/material/dialog';
import { MapDialogComponent } from '@app/profile/components/map-dialog/map-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule, MatTabChangeEvent } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BusinessPostsComponent } from '../../posts/business-posts/business-posts.component';
import { StarRatingComponent } from '../../star-rating/star-rating.component';
import { AccountService } from '@app/_services/account.service';
import { CreatePostDialogComponent } from '../../posts/create-post-dialog/create-post-dialog.component';
import { PostService } from '@app/_services/post.service';
import { ChatService, OnlineUser } from '@app/_services/chat.service';
import { ChatDialogComponent } from '../../chat/chat-dialog/chat-dialog.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-new-business-profile',
  templateUrl: './new-business-profile.component.html',
  styleUrls: ['./new-business-profile.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatSnackBarModule,
    BusinessPostsComponent,
    StarRatingComponent,
    ChatDialogComponent
  ]
})
export class NewBusinessProfileComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() profile!: Account;
  @Input() isOwnProfile: boolean = false;
  
  imageLoading: boolean = true;
  selectedTabIndex = 0;
  syncedTabHeight: string | null = null;
  posts: any[] = [];
  isLoadingPosts: boolean = false;
  showChatList: boolean = false;
  onlineUsers: OnlineUser[] = [];
  onlineUsersCount: number = 0;
  
  @ViewChild('timelineContent') timelineContentRef!: ElementRef;
  @ViewChild('aboutContent') aboutContentRef!: ElementRef;
  
  profileRating: number = 4.5;
  users: any[] = [];
  
  activeChats$: Observable<any[]>;

  constructor(
    private dialog: MatDialog,
    private accountService: AccountService,
    private postService: PostService,
    private chatService: ChatService,
    private cdr: ChangeDetectorRef
  ) {
    this.activeChats$ = this.chatService.getActiveChats();
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['profile'] && this.profile?.id) {
      this.loadPosts();
    }
  }
  
  ngOnInit() {
    this.imageLoading = !!this.profile?.profileImage;
    this.loadUsers();
    if (this.profile?.id) {
      this.loadPosts();
      // Subscribe to online users after we have the profile
      this.chatService.getOnlineUsers().subscribe((users: OnlineUser[]) => {
        this.onlineUsers = users.filter(u => u.id !== this.profile.id);
        this.onlineUsersCount = this.onlineUsers.length;
        this.cdr.detectChanges();
      });
    }
  }
  
  ngAfterViewInit() {
    setTimeout(() => this.syncTabHeights(), 0);
  }
  
  @HostListener('window:resize')
  onResize() {
    this.syncTabHeights();
  }
  
  onTabChange(event: MatTabChangeEvent) {
    this.selectedTabIndex = event.index;
    console.log('Tab changed to:', event.index);
    
    // If switching to Timeline tab, ensure posts are loaded
    if (event.index === 0 && this.profile?.id) {
      this.loadPosts();
    }
    
    setTimeout(() => this.syncTabHeights(), 0);
  }
  
  syncTabHeights() {
    if (this.timelineContentRef && this.timelineContentRef.nativeElement && this.aboutContentRef && this.aboutContentRef.nativeElement) {
      const timelineHeight = this.timelineContentRef.nativeElement.scrollHeight;
      const aboutHeight = this.aboutContentRef.nativeElement.scrollHeight;
      const maxHeight = Math.max(timelineHeight, aboutHeight);
      this.syncedTabHeight = maxHeight + 'px';
      this.timelineContentRef.nativeElement.style.height = this.syncedTabHeight;
      this.aboutContentRef.nativeElement.style.height = this.syncedTabHeight;
    }
  }
  
  onImageLoaded() {
    this.imageLoading = false;
    console.log('[BusinessCard] Profile image loaded successfully');
  }
  
  onImageError() {
    this.imageLoading = false;
    // Clear the profile image URL in case of error
    if (this.profile) {
      console.error('[BusinessCard] Error loading profile image');
      this.profile.profileImage = undefined;
    }
  }
  
  // Open the map dialog with the profile address
  openMapDialog(): void {
    this.dialog.open(MapDialogComponent, {
      width: '600px',
      data: {
        address: this.profile?.address || '',
        city: this.profile?.city || '',
        state: this.profile?.state || '',
        zipCode: this.profile?.zipCode || ''
      }
    });
  }
  
  openCreatePostDialog(postToRespondTo?: any) {
    const senderId = this.profile?.id;
    if (!this.users || this.users.length === 0) {
      this.loadUsers();
      this._openCreatePostDialogWithUsers(senderId, postToRespondTo);
    } else {
      this._openCreatePostDialogWithUsers(senderId, postToRespondTo);
    }
  }

  private loadUsers() {
    this.accountService.getAll().subscribe({
      next: (users) => {
        this.users = users.map((u: any) => ({ 
          id: u.id, 
          name: u.firstName + ' ' + u.lastName, 
          profileImage: u.profileImage || '' 
        }));
        console.log('Users for post dialog:', this.users);
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  private loadPosts() {
    if (!this.profile?.id) return;
    
    console.log('Loading posts for user:', this.profile.id);
    this.isLoadingPosts = true;
    this.postService.getPostsForUser(this.profile.id).subscribe({
      next: (posts) => {
        this.posts = posts;
        console.log('Posts loaded:', posts);
        this.isLoadingPosts = false;
        // Force change detection
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.isLoadingPosts = false;
        this.cdr.detectChanges();
      }
    });
  }

  private _openCreatePostDialogWithUsers(senderId: string, postToRespondTo?: any) {
    const dialogRef = this.dialog.open(CreatePostDialogComponent, {
      data: {
        users: this.users.filter(u => u.id !== senderId),
        senderId,
        respondingTo: postToRespondTo
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Find full recipient user data
        const recipientUser = this.users.find(u => u.id === result.recipientId);
        
        const newPost = {
          id: Date.now().toString(), // Temporary ID until server response
          sender: {
            id: this.profile.id,
            firstName: this.profile.firstName,
            lastName: this.profile.lastName,
            profileImage: this.profile.profileImage
          },
          recipient: {
            id: recipientUser?.id,
            firstName: recipientUser?.firstName,
            lastName: recipientUser?.lastName,
            profileImage: recipientUser?.profileImage
          },
          content: result.content,
          createdAt: new Date().toISOString(),
          respondingTo: result.respondingTo?.id,
          likes: 0,
          shares: 0
        };
        
        // Add the post immediately
        this.posts = [newPost, ...this.posts];
        this.cdr.detectChanges();

        // Then send to server
        this.postService.createPost({ 
          sender: senderId, 
          recipient: result.recipientId, 
          content: result.content,
          respondingTo: result.respondingTo?.id
        }).subscribe({
          next: (serverPost) => {
            // Update the post with server data while preserving local data if server doesn't provide it
            const index = this.posts.findIndex(p => p.id === newPost.id);
            if (index !== -1) {
              this.posts[index] = { 
                ...newPost,
                ...serverPost,
                sender: { ...newPost.sender, ...serverPost.sender },
                recipient: { ...newPost.recipient, ...serverPost.recipient }
              };
              this.cdr.detectChanges();
            }
          },
          error: (error) => {
            console.error('Error creating post:', error);
            // Remove the temporary post if server request fails
            this.posts = this.posts.filter(p => p.id !== newPost.id);
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  startChat(user: OnlineUser) {
    this.showChatList = false;
    this.chatService.startChat(user.id);

    // Open the chat dialog for the sender immediately
    this.dialog.open(ChatDialogComponent, {
      width: '400px',
      height: '600px',
      position: { bottom: '24px', right: '24px' },
      hasBackdrop: false,
      panelClass: 'chat-dialog-container',
      data: { user }
    });
  }

  closeChat(userId: string) {
    this.chatService.closeChat(userId);
  }

  toggleChatList() {
    this.showChatList = !this.showChatList;
  }

  private loadOnlineUsers() {
    // Instead of loading all users, we'll use the already subscribed online users
    // The list is already filtered to exclude current user in the constructor
    this.showChatList = true;
    this.cdr.detectChanges();
  }
} 