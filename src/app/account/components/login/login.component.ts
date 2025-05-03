import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';

@Component({
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
    form!: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string = '/';

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) { 
        // redirect to home if already logged in
        if (this.accountService.accountValue) {
            this.router.navigate(['/']);
        }
    }

    ngOnInit() {
        // Add login-page class to body for special styling
        document.body.classList.add('login-page');
        
        // Check for stored rememberMe data to pre-fill email
        let savedEmail = '';
        try {
            const rememberedData = localStorage.getItem('rememberMe');
            if (rememberedData) {
                const data = JSON.parse(rememberedData);
                if (data && data.email) {
                    savedEmail = data.email;
                }
            }
        } catch (error) {
            console.error('Error reading remembered user:', error);
        }
        
        this.form = this.formBuilder.group({
            email: [savedEmail, [Validators.required, Validators.email]],
            password: ['', Validators.required],
            rememberMe: [!!savedEmail] // Pre-check if we loaded an email
        });

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    ngOnDestroy() {
        // Remove login-page class when component is destroyed
        document.body.classList.remove('login-page');
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        this.accountService.login(
            this.f.email.value, 
            this.f.password.value,
            this.f.rememberMe.value // Pass the remember me checkbox value
        )
            .pipe(first())
            .subscribe({
                next: () => {
                    // Should navigate away or hide login form
                    this.router.navigate([this.returnUrl || '/']);
                    this.loading = false; // Hide spinner
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }
} 