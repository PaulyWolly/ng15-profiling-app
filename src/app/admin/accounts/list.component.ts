import { Component, OnInit } from '@angular/core';
import { first, catchError } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { NgIf } from '@angular/common';
import { of } from 'rxjs';

import { AccountService } from '@app/_services';
import { Router } from '@angular/router';
import { UserInterface } from '@app/types/user.interface';
import { Account } from '@app/_models';

@Component({
  templateUrl: 'list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
    displayedColumns: string[] = ['name', 'email', 'role', 'actions'];
    accounts: MatTableDataSource<Account>;
    user!: UserInterface;
    error: string = '';

    constructor(
      private accountService: AccountService,
      private route: Router
    ) {
      this.accounts = new MatTableDataSource<Account>();
    }

    ngOnInit() {
      this.accountService.getAll()
        .pipe(
          first(),
          catchError(err => {
            console.error('Error loading accounts:', err);
            this.error = 'Failed to load accounts. Please check your connection and try again.';
            return of([]);
          })
        )
        .subscribe(accounts => {
          console.log('Loaded accounts:', accounts);
          this.accounts.data = accounts;
        });
    }

    onDelete(id: any, firstName: string, lastName: string) {
      let userName = firstName + ' ' + lastName;
      let text = "Are you sure you want to DELETE user: " + userName + "?? \nOK or Cancel.";
      if (confirm(text) == true) {
        this.deleteAccount(id);
        this.route.navigate(['./admin/accounts']);
      } else {
        this.route.navigate(['./admin/accounts']);
      }
    }

    deleteAccount(id: string) {
      const account = this.accounts.data.find(x => x.id === id);
      if (account) {
        account.isDeleting = true;
        this.accountService.delete(id)
          .pipe(first())
          .subscribe(() => {
            this.accounts.data = this.accounts.data.filter(x => x.id !== id);
          });
      }
    }
}

