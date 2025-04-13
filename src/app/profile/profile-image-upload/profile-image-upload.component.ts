import { Component, EventEmitter, Output } from '@angular/core';
import { UploadService } from '@app/_services/upload.service';
import { Account } from '@app/_models';

@Component({
    selector: 'app-profile-image-upload',
    template: `
        <div class="profile-image-upload">
            <input type="file" 
                   accept="image/*" 
                   (change)="onFileSelected($event)"
                   style="display: none"
                   #fileInput>
            <button class="btn btn-primary" (click)="fileInput.click()">
                Choose Image
            </button>
            <div *ngIf="selectedFile" class="mt-2">
                <p>Selected file: {{selectedFile?.name}}</p>
                <button class="btn btn-success" (click)="uploadImage()">
                    Upload Image
                </button>
            </div>
        </div>
    `,
    styles: [`
        .profile-image-upload {
            margin: 20px 0;
        }
    `]
})
export class ProfileImageUploadComponent {
    @Output() imageUploaded = new EventEmitter<Account>();
    selectedFile: File | null = null;

    constructor(private uploadService: UploadService) { }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
        }
    }

    uploadImage() {
        if (!this.selectedFile) return;

        this.uploadService.uploadProfileImage(this.selectedFile)
            .subscribe({
                next: (account: Account) => {
                    this.imageUploaded.emit(account);
                    this.selectedFile = null;
                },
                error: (error: any) => {
                    console.error('Error uploading image:', error);
                }
            });
    }
} 