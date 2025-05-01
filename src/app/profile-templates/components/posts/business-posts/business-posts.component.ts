import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Post } from '../../../models/post.interface';
import samplePosts from '../../../data/sample-posts.json';

@Component({
  selector: 'app-business-posts',
  templateUrl: './business-posts.component.html',
  styleUrls: ['./business-posts.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class BusinessPostsComponent implements OnInit {
  posts: Post[] = [];

  ngOnInit() {
    // For now, load from sample data
    this.posts = samplePosts.posts;
  }

  onLike(post: Post) {
    post.likes++;
  }

  onComment(post: Post) {
    // Implement comment functionality
    console.log('Comment clicked for post:', post.id);
  }

  onShare(post: Post) {
    post.shares++;
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    
    const years = Math.floor(months / 12);
    return `${years}y ago`;
  }
} 