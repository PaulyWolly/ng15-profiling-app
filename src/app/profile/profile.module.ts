import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Directive, HostListener, ElementRef } from '@angular/core';

// Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

// Routing
import { ProfileRoutingModule } from './profile-routing.module';

// Container Components
import { ProfileComponent } from './containers/profile/profile.component';
import { LayoutComponent } from './containers/layout/layout.component';
import { DetailsComponent } from './containers/details/details.component';
import { EditComponent } from './containers/edit/edit.component';
import { UpdateComponent } from './containers/update/update.component';

// Presentational Components
import { StandardProfileComponent } from './components/standard-profile/standard-profile.component';
import { BusinessCardComponent } from './components/business-card/business-card.component';
import { SocialMediaComponent } from './components/social-media/social-media.component';

// Custom Directive to prevent wheel event propagation
@Directive({
    selector: '[preventWheelPropagation]'
})
export class PreventWheelPropagationDirective {
    constructor(private el: ElementRef) {}

    @HostListener('wheel', ['$event'])
    onWheel(event: WheelEvent) {
        const element = this.el.nativeElement;
        
        // Check if element is scrollable
        const isScrollable = element.scrollHeight > element.clientHeight;
        
        if (!isScrollable) {
            // Even if not scrollable, prevent propagation to body
            event.stopPropagation();
            event.preventDefault();
            return;
        }
        
        // Check if scroll is at top and scrolling up, or at bottom and scrolling down
        const atTop = element.scrollTop === 0;
        const atBottom = element.scrollHeight - element.clientHeight - element.scrollTop <= 1;
        
        if ((atTop && event.deltaY < 0) || (atBottom && event.deltaY > 0)) {
            // Even at boundary, prevent propagation to body
            event.stopPropagation();
            event.preventDefault();
            return;
        }
        
        // Otherwise, prevent propagation and default behavior
        event.stopPropagation();
        event.preventDefault();
        
        // Manually scroll the element
        element.scrollTop += event.deltaY;
    }
}

// @ts-ignore: This suppresses the static reference linting error
@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        ProfileRoutingModule,
        // Angular CDK
        DragDropModule,
        // Material modules
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatTabsModule,
        MatProgressSpinnerModule,
        MatBadgeModule,
        MatInputModule,
        MatFormFieldModule
    ],
    declarations: [
        // Container Components
        ProfileComponent,
        LayoutComponent,
        DetailsComponent,
        EditComponent,
        UpdateComponent,
        
        // Presentational Components
        StandardProfileComponent,
        BusinessCardComponent,
        SocialMediaComponent,
        
        // Directives
        PreventWheelPropagationDirective
    ],
    exports: [
        PreventWheelPropagationDirective
    ]
})
export class ProfileModule {
    constructor() {
        console.log('Profile module loaded!');
    }
}