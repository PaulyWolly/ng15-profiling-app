import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { ProfileTemplateService } from '@app/_services';
import { ProfileTemplateType } from '@app/_models/profile-template';
import { TitleComponent } from '@app/shared/components/title/title.component';

@Component({
    selector: 'app-new-standard',
    templateUrl: './new-standard.component.html',
    styleUrls: ['./new-standard.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        TitleComponent
    ]
})
export class NewStandardComponent {
    constructor(
        private router: Router,
        private profileTemplateService: ProfileTemplateService
    ) {}

    useTemplate(): void {
        this.profileTemplateService.setTemplate(ProfileTemplateType.STANDARD);
        this.router.navigate(['/profile/new-standard']);
    }

    previewTemplate(): void {
        this.profileTemplateService.setTemplate(ProfileTemplateType.STANDARD);
        this.router.navigate(['/profile/new-standard'], { queryParams: { preview: 'true' } });
    }
} 