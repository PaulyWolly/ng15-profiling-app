import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';

import { AccountService } from '@app/_services';
import { Account } from '@app/_models';
import { Router } from '@angular/router';
import { UserInterface } from '@app/types/user.interface';

@Component({
  templateUrl: 'list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
    dataSource = new MatTableDataSource<Account>([]);
    displayedColumns: string[] = ['image', 'name', 'email', 'role', 'actions'];
    defaultImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2NjYyIgZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgM2MyLjY3IDAgNC44NCAyLjE3IDQuODQgNC44NCAwIDIuNjctMi4xNyA0Ljg0LTQuODQgNC44NC0yLjY3IDAtNC44NC0yLjE3LTQuODQtNC44NCAwLTIuNjcgMi4xNy00Ljg0IDQuODQtNC44NHptMCAxMmE5LjkgOS45IDAgMCAxLTcuOTItMy41QzYuMTUgMTQuNzUgOC4xMyAxNCAxMiAxNHMzLjk1Ljc1IDUuOTIgMi4wNUE5LjkgOS45IDAgMCAxIDEyIDE3eiIvPjwvc3ZnPg==';
    user!: UserInterface;

    constructor(
      private accountService: AccountService,
      private route: Router
    ) { }

    ngOnInit() {
      this.accountService.getAll()
        .pipe(first())
        .subscribe(accounts => {
            this.dataSource.data = accounts;
        });
    }

    onDelete(id: string, firstName: string, lastName: string) {
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
      const account = this.dataSource.data.find(x => x.id === id);
      if (!account) return;
      
      account.isDeleting = true;
      this.accountService.delete(id)
        .pipe(first())
        .subscribe(() => {
            this.dataSource.data = this.dataSource.data.filter(x => x.id !== id);
        });
    }

    onImageError(event: any) {
        event.target.src = this.defaultImage;
    }
}

