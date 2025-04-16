import { catchError, of } from 'rxjs';

import { AccountService } from '@app/_services';

export function appInitializer(accountService: AccountService) {
    return () => {
        // Only attempt to refresh token if we have a stored account
        if (accountService.accountValue) {
            return accountService.refreshToken()
                .pipe(
                    catchError(() => {
                        // If refresh fails, clear the account and return
                        accountService.logout();
                        return of();
                    })
                );
        }
        return of();
    };
}