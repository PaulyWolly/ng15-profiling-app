import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-new-business-preview',
    templateUrl: './new-business-preview.component.html',
    styleUrls: ['./new-business-preview.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        RouterModule
    ]
})
export class NewBusinessPreviewComponent {
    title = 'Business Card Template';
} 