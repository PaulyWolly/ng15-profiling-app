import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Role } from '@app/_models';
import { MustMatch } from '@app/_helpers/must-match.validator';

@Component({
  selector: 'app-new-account-edit',
  templateUrl: './new-account-edit.component.html',
  styleUrls: ['./new-account-edit.component.scss']
})
export class NewAccountEditComponent implements OnInit, OnChanges {
  @Input() account: any = null;
  @Input() loading = false;
  @Input() submitted = false;
  @Input() submitting = false;
  @Input() isAdmin = false; // Whether the current user is an admin
  @Input() isAdminView = false; // Whether we're in the admin section
  @Input() currentUserRole: Role = Role.User; // Add this line

  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();
  @Output() imageChange = new EventEmitter<{file: File, dataUrl: string}>();
  @Output() imageRemove = new EventEmitter<void>();

  form!: FormGroup;
  imageUrl: string | null = null;
  profileImageFile: File | null = null;
  error = '';
  Role = Role;
  availableRoles = [Role.Admin, Role.User]; // Only Admin and User can be assigned

  constructor(
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    if (this.account) {
      this.patchForm(this.account);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.account && changes.account.currentValue && this.form) {
      this.patchForm(changes.account.currentValue);
    }
    
    if (changes.submitted && changes.submitted.currentValue) {
      this.validateForm();
    }
  }

  private initForm(): void {
    // Password validations are different for new vs existing accounts
    const passwordValidators = this.account?.id 
      ? [Validators.minLength(6)] // Existing account - password optional but must be valid if provided
      : [Validators.required, Validators.minLength(6)]; // New account - password required
    
    this.form = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: [Role.User, Validators.required],
      password: ['', passwordValidators],
      confirmPassword: ['']
    }, {
      validators: this.mustMatch('password', 'confirmPassword')
    });
  }

  private patchForm(account: any): void {
    // Patch all fields from account object
    this.form.patchValue({
      firstName: account.firstName || '',
      lastName: account.lastName || '',
      email: account.email || '',
      role: account.role || Role.User
    });
    
    // Update image if available
    if (account.profileImage) {
      this.imageUrl = account.profileImage;
    }
  }

  private validateForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
    }
  }

  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (matchingControl.errors && !matchingControl.errors.mustMatch) {
        return;
      }
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  get f() { return this.form.controls; }

  onImageChange(event: any): void {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      this.profileImageFile = file;
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result as string;
        this.imageChange.emit({file, dataUrl: this.imageUrl});
      };
      
      reader.readAsDataURL(file);
    }
  }

  onImageRemove(): void {
    this.imageUrl = null;
    this.profileImageFile = null;
    this.imageRemove.emit();
  }

  onSubmit(): void {
    // Gather form data including possible profile image
    const formData = { ...this.form.getRawValue() };
    
    // Remove role if not admin
    if (!this.isAdmin && !this.isAdminView) {
      delete formData.role;
    }
    
    // Emit save event with form data
    this.save.emit(formData);
  }

  onCancel(): void {
    this.cancel.emit();
  }
  
  // Method to get CSS class for role badge
  getRoleBadgeClass(): string {
    const role = this.form?.get('role')?.value;
    if (role === Role.SuperAdmin) {
      return 'bg-gold'; // Gold badge for Super-Admin
    } else if (role === Role.Admin) {
      return 'bg-danger'; // Red badge for Admin
    } else if (role === Role.User) {
      return 'bg-success'; // Green badge for User
    }
    return 'bg-secondary'; // Default gray badge
  }

  // Update the role from the select element
  updateRole(event: Event): void {
    const select = event.target as HTMLSelectElement;
    if (select && this.form) {
      this.form.get('role')?.setValue(select.value);
    }
  }
} 