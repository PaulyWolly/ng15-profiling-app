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
            <div *ngIf="selectedFile && !imageConflict" class="mt-2">
                <p>Selected file: {{selectedFile?.name}}</p>
                <button class="btn btn-success" 
                        (click)="uploadImage()"
                        [disabled]="uploading">
                    {{uploading ? 'Uploading...' : 'Upload Image'}}
                </button>
            </div>
            <div *ngIf="error" class="alert alert-danger mt-3">
                {{error}}
            </div>
            <div *ngIf="imageConflict" class="alert alert-warning mt-3">
                <p>{{imageConflictMessage}}</p>
                <div class="mt-3">
                    <button class="btn btn-danger me-2" 
                            (click)="confirmOverwrite()"
                            [disabled]="uploading">
                        {{uploading ? 'Overwriting...' : 'Overwrite Image'}}
                    </button>
                    <button class="btn btn-secondary" 
                            (click)="cancelOverwrite()">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .profile-image-upload {
            margin: 20px 0;
        }
        .alert {
            padding: 1rem;
            border-radius: 4px;
            margin-top: 1rem;
        }
        .alert-warning {
            background-color: #fff3cd;
            border-color: #ffecb5;
            color: #664d03;
        }
        .alert-danger {
            background-color: #f8d7da;
            border-color: #f5c2c7;
            color: #842029;
        }
        .btn {
            padding: 0.375rem 0.75rem;
            border-radius: 4px;
            cursor: pointer;
        }
        .btn:disabled {
            cursor: not-allowed;
            opacity: 0.65;
        }
    `]
})
export class ProfileImageUploadComponent {
    @Output() imageUploaded = new EventEmitter<Account>();
    selectedFile: File | null = null;
    uploading = false;
    error = '';
    imageConflict = false;
    imageConflictMessage = '';
    pendingFormData: FormData | null = null;

    constructor(private uploadService: UploadService) { }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
            this.error = '';
            this.imageConflict = false;
            this.imageConflictMessage = '';
        }
    }

    uploadImage() {
        if (!this.selectedFile) return;

        this.uploading = true;
        this.error = '';
        
        const formData = new FormData();
        formData.append('profileImage', this.selectedFile);
        this.pendingFormData = formData;

        this.uploadService.uploadProfileImage(this.selectedFile)
            .subscribe({
                next: (account: Account) => {
                    this.handleUploadSuccess(account);
                },
                error: (error: any) => {
                    if (error.exists) {
                        this.imageConflict = true;
                        this.imageConflictMessage = error.message;
                        this.uploading = false;
                    } else {
                        this.error = error.message || 'Failed to upload image';
                        this.uploading = false;
                        this.selectedFile = null;
                    }
                }
            });
    }

    confirmOverwrite() {
        if (!this.pendingFormData) return;

        this.uploading = true;
        this.pendingFormData.append('confirmed', 'true');

        this.uploadService.uploadProfileImage(this.selectedFile!, this.pendingFormData)
            .subscribe({
                next: (account: Account) => {
                    this.handleUploadSuccess(account);
                },
                error: (error: any) => {
                    this.error = error.message || 'Failed to overwrite image';
                    this.uploading = false;
                }
            });
    }

    cancelOverwrite() {
        this.imageConflict = false;
        this.imageConflictMessage = '';
        this.pendingFormData = null;
        this.selectedFile = null;
        this.error = '';
    }

    private handleUploadSuccess(account: Account) {
        this.imageUploaded.emit(account);
        this.selectedFile = null;
        this.uploading = false;
        this.imageConflict = false;
        this.imageConflictMessage = '';
        this.pendingFormData = null;
        this.error = '';
    }
} 