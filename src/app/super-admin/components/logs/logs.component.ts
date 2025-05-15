import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TitleComponent } from '@app/shared/components/title/title.component';
import { MatDialog } from '@angular/material/dialog';
import { LogOutputViewComponent } from '../../../super-admin/components/logs/log-output-view.component';
import { CreateLogDialogComponent } from './create-log-dialog.component';
import { LogsService, LogEntry as ServiceLogEntry } from '@app/_services/logs.service';
import { catchError, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
// Material Tree imports
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { TreeNode } from 'primeng/api';
import { TreeModule } from 'primeng/tree';
import { CheckboxModule } from 'primeng/checkbox';
import { LogDetailsDialogComponent } from './log-details-dialog.component';
import { ConfirmDialogComponent } from '@app/shared/components/confirm-dialog/confirm-dialog.component';
import { ActivatedRoute } from '@angular/router';

export interface LogEntry {
  id: string;
  type: 'User' | 'System' | 'Error' | 'Audit';
  timestamp: Date | null;
  user?: string;
  action: string;
  status: 'Success' | 'Warning' | 'Error' | 'Info';
  message: string;
  ipAddress?: string;
  geoLocation?: string;
}

interface LogFilters {
  type: string;
  status: string;
  user: string;
  action: string;
  fromDate: string;
  toDate: string;
  ipAddress: string;
}

interface UserActivity {
  userId: string;
  totalSessions: number;
  totalSessionTime: number;
  pageNavigations: number;
  uniquePagesVisited: number;
  topPages: { page: string; count: number }[];
  firstLogin: Date;
  lastLogin: Date;
}

// Tree node interfaces
export interface LogTreeNode {
  name: string;
  type: 'user' | 'category' | 'entry';
  children?: LogTreeNode[];
  logEntry?: LogEntry;
}

export interface LogTreeFlatNode {
  expandable: boolean;
  name: string;
  level: number;
  type: 'user' | 'category' | 'entry';
  logEntry?: LogEntry;
}

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TreeModule,
    CheckboxModule
  ],
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css']
})
export class LogsComponent implements OnInit, OnDestroy {
  logs: LogEntry[] = [];
  loading = false;
  error: string | null = null;

  selectedLogs = new Set<string>();

  // Pagination properties
  currentPage = 1;
  pageSize = 10;
  totalLogs = 0;
  totalPages = 1;

  // Filters
  filters: LogFilters = {
    type: '',
    status: '',
    user: '',
    action: '',
    fromDate: '',
    toDate: '',
    ipAddress: ''
  };

  // Material Tree control and data source
  treeControl: FlatTreeControl<LogTreeFlatNode>;
  treeFlattener: MatTreeFlattener<LogTreeNode, LogTreeFlatNode>;
  dataSource: MatTreeFlatDataSource<LogTreeNode, LogTreeFlatNode>;

  // Log type selector
  logTypes: string[] = ['User', 'System', 'Audit', 'Error'];
  selectedLogType: string = 'User';

  // For flat table view
  filteredLogs: LogEntry[] = [];

  // User activity properties
  selectedUserId: string = '';
  userActivity: UserActivity | null = null;
  loadingActivity: boolean = false;

  treeData: TreeNode[] = [
    {
      label: 'User Logs',
      key: '0',
      icon: 'pi pi-folder',
      children: [
        {
          label: 'pwelby@gmail.com',
          key: '0-0',
          icon: 'pi pi-user',
          children: [
            {
              label: 'Login',
              key: '0-0-0',
              icon: 'pi pi-sign-in',
              selectable: true
            },
            {
              label: 'Activity',
              key: '0-0-1',
              icon: 'pi pi-list',
              selectable: true
            }
          ]
        }
      ]
    }
  ];
  selectedNodes: TreeNode[] = [];

  // Add a flag to track if we're showing mock data
  showingMockData: boolean = false;

  // Add auto-refresh properties
  autoRefresh: boolean = false;
  refreshInterval: any = null;
  refreshRate: number = 10; // Seconds

  constructor(
    private dialog: MatDialog,
    private logsService: LogsService,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {
    // Tree setup
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      node => node.level,
      node => node.expandable,
      node => node.children
    );
    this.treeControl = new FlatTreeControl<LogTreeFlatNode>(
      node => node.level,
      node => node.expandable
    );
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  ngOnInit() {
    this.loadLogs();
    // If no logs loaded, use mock data
    setTimeout(() => {
      if (!this.logs || this.logs.length === 0) {
        this.generateMockLogs();
      }
    }, 1000);

    // Check for error log filter in URL
    if (this.route && this.route.snapshot && this.route.snapshot.queryParams) {
      const params = this.route.snapshot.queryParams;
      if (params['type'] === 'Error') {
        this.selectedLogType = 'Error';
        this.toggleAutoRefresh();
      }
    }
  }

  ngOnDestroy() {
    // Clear any auto-refresh interval
    this.stopAutoRefresh();
  }

  // Tree transformer
  transformer = (node: LogTreeNode, level: number): LogTreeFlatNode => {
    return {
      name: node.name,
      type: node.type,
      logEntry: node.logEntry,
      expandable: !!node.children && node.children.length > 0,
      level
    };
  };

  hasChild = (_: number, node: LogTreeFlatNode) => node.expandable;

  selectLogType(type: string) {
    this.selectedLogType = type;
    this.treeData = []; // Clear the tree data
    this.selectedNodes = []; // Clear selected nodes

    // Reload logs with the new type filter
    this.loadLogs();
  }

  loadLogs() {
    this.loading = true;
    this.error = null;
    // Reset mock data flag
    this.showingMockData = false;

    const queryParams = {
      page: this.currentPage,
      pageSize: this.pageSize,
      type: this.selectedLogType,
      ...this.getAppliedFilters()
    };

    this.logsService.getLogs(queryParams).pipe(
      catchError(err => {
        this.error = err.message || 'Failed to load logs';
        this.loading = false;
        return throwError(() => err);
      })
    ).subscribe(response => {
      console.log('Raw logs from backend:', response.logs);

      // Flatten the logs if they are grouped by action/user
      let flatLogs: any[] = [];
      for (const group of response.logs as any[]) {
        if (Array.isArray(group.entries)) {
          for (const entry of group.entries) {
            // Merge group-level fields (user, action, etc.) into each entry
            flatLogs.push({
              ...entry,
              user: group.user,
              action: group.action,
              type: group.type,
              _id: group._id // Make sure to include the parent log ID
            });
          }
        } else {
          flatLogs.push(group);
        }
      }

      this.logs = flatLogs.map(log => this.mapLogEntry(log));
      console.log('Loaded logs:', this.logs);
      this.totalLogs = response.total || this.logs.length;
      this.totalPages = Math.ceil(this.totalLogs / this.pageSize);
      this.loading = false;

      // Use the right tree-building method for the selected log type
      if (this.selectedLogType === 'User') {
        this.buildUserTree();
      } else if (this.selectedLogType === 'System') {
        this.buildSystemTree();
      } else if (this.selectedLogType === 'Error') {
        this.buildErrorTree();
      } else if (this.selectedLogType === 'Audit') {
        this.buildAuditTree();
      } else {
        this.filteredLogs = this.logs.filter(log => log.type === this.selectedLogType);
      }
    });
  }

  // Build the user tree structure
  buildUserTree() {
    // Group logs by user, then by category (action), then entries
    const userMap = new Map<string, Map<string, LogEntry[]>>();
    for (const log of this.logs.filter(l => l.type === 'User')) {
      const user = log.user || 'Anonymous';
      if (!userMap.has(user)) userMap.set(user, new Map());
      const catMap = userMap.get(user)!;
      const cat = log.action || 'Other';
      if (!catMap.has(cat)) catMap.set(cat, []);
      catMap.get(cat)!.push(log);
    }
    const tree: TreeNode[] = Array.from(userMap.entries()).map(([user, catMap]) => ({
      label: '👤 ' + user,
      key: user,
      icon: '', // Remove PrimeNG icon to avoid double icon
      children: Array.from(catMap.entries()).map(([cat, entries]) => ({
        label: '📁 ' + cat,
        key: user + '-' + cat,
        icon: '',
        children: entries.map(entry => ({
          label: `📄 ${entry.timestamp ? entry.timestamp.toLocaleString() : ''} - ${entry.message || ''}`,
          key: entry.id,
          icon: '',
          data: entry,
          selectable: true
        }))
      }))
    }));
    this.treeData = tree;
  }

  // Build the system log tree structure
  buildSystemTree() {
    // Group logs by action categories
    const categoryMap = new Map<string, LogEntry[]>();
    for (const log of this.logs.filter(l => l.type === 'System')) {
      const category = log.action || 'Other';
      if (!categoryMap.has(category)) categoryMap.set(category, []);
      categoryMap.get(category)!.push(log);
    }

    const tree: TreeNode[] = Array.from(categoryMap.entries()).map(([category, entries]) => ({
      label: '⚙️ ' + category,
      key: 'system-' + category,
      icon: '',
      children: entries.map(entry => ({
        label: `📄 ${entry.timestamp ? entry.timestamp.toLocaleString() : ''} - ${entry.message || ''}`,
        key: entry.id,
        icon: '',
        data: entry,
        selectable: true
      }))
    }));
    this.treeData = tree;
  }

  // Build the error log tree structure
  buildErrorTree() {
    // Group errors by action/source
    const sourceMap = new Map<string, LogEntry[]>();
    for (const log of this.logs.filter(l => l.type === 'Error')) {
      const source = log.action || 'Unknown Source';
      if (!sourceMap.has(source)) sourceMap.set(source, []);
      sourceMap.get(source)!.push(log);
    }

    const tree: TreeNode[] = Array.from(sourceMap.entries()).map(([source, entries]) => ({
      label: '❌ ' + source,
      key: 'error-' + source,
      icon: '',
      children: entries.map(entry => ({
        label: `📄 ${entry.timestamp ? entry.timestamp.toLocaleString() : ''} - ${entry.message || ''}`,
        key: entry.id,
        icon: '',
        data: entry,
        selectable: true
      }))
    }));
    this.treeData = tree;
  }

  // Build the audit log tree structure
  buildAuditTree() {
    // Group audit logs by user first, then by action
    const userMap = new Map<string, Map<string, LogEntry[]>>();
    for (const log of this.logs.filter(l => l.type === 'Audit')) {
      const user = log.user || 'System';
      if (!userMap.has(user)) userMap.set(user, new Map());
      const actionMap = userMap.get(user)!;
      const action = log.action || 'Other';
      if (!actionMap.has(action)) actionMap.set(action, []);
      actionMap.get(action)!.push(log);
    }

    const tree: TreeNode[] = Array.from(userMap.entries()).map(([user, actionMap]) => ({
      label: '👁️ ' + user,
      key: 'audit-' + user,
      icon: '',
      children: Array.from(actionMap.entries()).map(([action, entries]) => ({
        label: '📋 ' + action,
        key: `audit-${user}-${action}`,
        icon: '',
        children: entries.map(entry => ({
          label: `📄 ${entry.timestamp ? entry.timestamp.toLocaleString() : ''} - ${entry.message || ''}`,
          key: entry.id,
          icon: '',
          data: entry,
          selectable: true
        }))
      }))
    }));
    this.treeData = tree;
  }

  getSystemLogs(): LogEntry[] {
    return this.logs.filter(log => log.type === 'System' || (log.type === 'Error' && !log.user));
  }

  getUserLogs(user: string): LogEntry[] {
    return this.logs.filter(log => log.user === user);
  }

  getSystemLogCount(): number {
    return this.getSystemLogs().length;
  }

  getUserLogCount(user: string): number {
    return this.getUserLogs(user).length;
  }

  toggleSelectSystemLogs(event: any) {
    const systemLogs = this.getSystemLogs();
    if (event.target.checked) {
      systemLogs.forEach(log => this.selectedLogs.add(log.id));
    } else {
      systemLogs.forEach(log => this.selectedLogs.delete(log.id));
    }
  }

  toggleSelectUserLogs(event: any, user: string) {
    const userLogs = this.getUserLogs(user);
    if (event.target.checked) {
      userLogs.forEach(log => this.selectedLogs.add(log.id));
    } else {
      userLogs.forEach(log => this.selectedLogs.delete(log.id));
    }
  }

  getAppliedFilters() {
    const appliedFilters: any = {};
    if (this.filters.type) {
      appliedFilters.type = this.filters.type;
    }
    if (this.filters.status) {
      appliedFilters.status = this.filters.status;
    }
    if (this.filters.user) {
      appliedFilters.user = this.filters.user;
    }
    if (this.filters.action) {
      appliedFilters.action = this.filters.action;
    }
    if (this.filters.fromDate) {
      appliedFilters.fromDate = this.filters.fromDate;
    }
    if (this.filters.toDate) {
      appliedFilters.toDate = this.filters.toDate;
    }
    if (this.filters.ipAddress) {
      appliedFilters.ipAddress = this.filters.ipAddress;
    }
    return appliedFilters;
  }

  applyFilters() {
    this.currentPage = 1; // Reset to first page
    this.loadLogs();
  }

  mapLogEntry(log: ServiceLogEntry): LogEntry {
    let parsedTimestamp: Date | null = null;
    if (log.timestamp) {
      const date = new Date(log.timestamp);
      parsedTimestamp = isNaN(date.getTime()) ? null : date;
    }
    return {
      id: log._id || '',
      type: log.type || 'System',
      timestamp: parsedTimestamp,
      user: log.user || '',
      action: log.action || 'Unknown',
      status: log.status || 'Info',
      message: log.message || '',
      ipAddress: log.ipAddress || '',
      geoLocation: log.geoLocation || '',
      ...(log.userAgent && { userAgent: log.userAgent }),
      ...(log.responseTime && { responseTime: log.responseTime }),
      ...(log.pageUrl && { pageUrl: log.pageUrl }),
      ...(log.referrer && { referrer: log.referrer })
    };
  }

  createLog(type: 'System' | 'User' | 'Error' | 'Audit') {
    const dialogRef = this.dialog.open(CreateLogDialogComponent, {
      width: '500px',
      data: { logType: type }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.loading = true;

      let request;
      switch (type) {
        case 'System':
          request = this.logsService.createSystemLog(result);
          break;
        case 'User':
          request = this.logsService.createUserLog(result);
          break;
        case 'Error':
          request = this.logsService.createErrorLog(result);
          break;
        case 'Audit':
          request = this.logsService.createAuditLog(result);
          break;
      }

      request.pipe(
        catchError(err => {
          this.error = `Failed to create ${type.toLowerCase()} log: ${err.message}`;
          this.loading = false;
          return throwError(() => err);
        })
      ).subscribe(() => {
        this.loadLogs();
      });
    });
  }

  exportLogs() {
    // Stub for export functionality
    alert('Exporting logs (stub)');
  }

  async confirmDeleteSelected() {
    const count = this.selectedNodes ? this.selectedNodes.length : 0;
    const message = count === 1
      ? 'Are you sure you want to delete this log entry?'
      : 'Are you sure you want to delete these selected log entries?';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: '<b>Delete Log</b>',
        message,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      },
      width: '550px', // Set a fixed width
      disableClose: true
    });
    const result = await dialogRef.afterClosed().toPromise();
    if (result) {
      this.deleteSelected();
    }
  }

  deleteSelected() {
    if (!this.selectedNodes || this.selectedNodes.length === 0) return;

    // Get the IDs of selected log entries
    const selectedIds = this.selectedNodes.map(node => node.key);

    // Remove from logs
    this.logs = this.logs.filter(log => !selectedIds.includes(log.id));

    // Clear selection
    this.selectedNodes = [];

    // Reload logs to update the view
    this.loadLogs();
  }

  refresh() {
    this.loadLogs();
  }

  toggleSelectAll() {
    if (this.selectedLogs.size === this.logs.length) {
      this.selectedLogs.clear();
    } else {
      this.logs.forEach(log => this.selectedLogs.add(log.id));
    }
  }

  onLogSelect(event: any, logId: string) {
    if (event.target.checked) {
      this.selectedLogs.add(logId);
    } else {
      this.selectedLogs.delete(logId);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadLogs();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadLogs();
    }
  }

  // Handler for PrimeNG tree node selection
  onNodeSelect(event: any) {
    // Only open dialog if not a checkbox click
    if (event.originalEvent && event.originalEvent.target) {
      const target = event.originalEvent.target as HTMLElement;
      if (target.classList.contains('p-checkbox-box') || target.closest('.p-checkbox')) {
        // Checkbox click, do nothing
        return;
      }
    }
    // Only open dialog for log entry nodes (leaf nodes with data)
    if (event.node && event.node.data) {
      this.openLogDetailsDialog(event.node.data);
    }
  }

  openLogDetailsDialog(log: LogEntry) {
    this.dialog.open(LogDetailsDialogComponent, {
      width: '500px',
      data: log,
      disableClose: true
    });
  }

  viewDetails(log: LogEntry) {
    this.openLogDetailsDialog(log);
  }

  // User Activity Methods
  loadUserActivity() {
    if (!this.selectedUserId) return;

    this.loadingActivity = true;
    this.userActivity = null;

    this.http.get<UserActivity>(`${environment.apiUrl}/logs/user-activity/${this.selectedUserId}`)
      .pipe(
        catchError(err => {
          this.error = `Failed to load user activity: ${err.message || 'Unknown error'}`;
          this.loadingActivity = false;
          return throwError(() => err);
        })
      )
      .subscribe(activity => {
        this.userActivity = {
          ...activity,
          firstLogin: activity.firstLogin ? new Date(activity.firstLogin) : new Date(),
          lastLogin: activity.lastLogin ? new Date(activity.lastLogin) : new Date()
        };
        this.loadingActivity = false;
      });
  }

  formatDuration(ms: number): string {
    if (!ms) return '0s';

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  getPercentage(value: number, max: number): number {
    return max > 0 ? (value / max) * 100 : 0;
  }

  getMaxPageCount(): number {
    if (!this.userActivity || !this.userActivity.topPages || this.userActivity.topPages.length === 0) {
      return 0;
    }
    return Math.max(...this.userActivity.topPages.map(page => page.count));
  }

  // For the tree, show log details inline when an entry is expanded
  expandedEntry: LogEntry | null = null;
  toggleEntryDetails(node: LogTreeFlatNode) {
    if (this.expandedEntry === node.logEntry) {
      this.expandedEntry = null;
    } else {
      this.expandedEntry = node.logEntry || null;
    }
  }

  generateMockLogs() {
    // Set the mock data flag
    this.showingMockData = true;

    if (this.selectedLogType === 'User') {
      this.logs = [
        {
          id: '1',
          type: 'User',
          timestamp: new Date(),
          user: 'pwelby@gmail.com',
          action: 'Login',
          status: 'Success',
          message: '[MOCK DATA] User logged in successfully',
          ipAddress: '192.168.1.1',
          geoLocation: 'New York, USA'
        },
        {
          id: '2',
          type: 'User',
          timestamp: new Date(),
          user: 'pwelby@gmail.com',
          action: 'Page Navigation',
          status: 'Info',
          message: '[MOCK DATA] User navigated to dashboard',
          ipAddress: '192.168.1.1',
          geoLocation: 'New York, USA'
        },
        {
          id: '3',
          type: 'User',
          timestamp: new Date(),
          user: 'Anonymous',
          action: 'Token Refresh',
          status: 'Success',
          message: '[MOCK DATA] Token refreshed',
          ipAddress: '192.168.1.2',
          geoLocation: 'London, UK'
        }
      ];
      this.buildUserTree();
    } else if (this.selectedLogType === 'System') {
      this.logs = [
        {
          id: '4',
          type: 'System',
          timestamp: new Date(),
          action: 'Startup',
          status: 'Info',
          message: '[MOCK DATA] Application started successfully',
          ipAddress: '127.0.0.1'
        },
        {
          id: '5',
          type: 'System',
          timestamp: new Date(),
          action: 'Database',
          status: 'Info',
          message: '[MOCK DATA] Connected to database',
          ipAddress: '127.0.0.1'
        },
        {
          id: '6',
          type: 'System',
          timestamp: new Date(),
          action: 'Scheduled Task',
          status: 'Success',
          message: '[MOCK DATA] Completed daily backup',
          ipAddress: '127.0.0.1'
        }
      ];
      this.buildSystemTree();
    } else if (this.selectedLogType === 'Error') {
      this.logs = [
        {
          id: '7',
          type: 'Error',
          timestamp: new Date(),
          action: 'API Request',
          status: 'Error',
          message: '[MOCK DATA] Failed to retrieve data: 500 Internal Server Error',
          ipAddress: '192.168.1.1',
          user: 'pwelby@gmail.com'
        },
        {
          id: '8',
          type: 'Error',
          timestamp: new Date(),
          action: 'Image Upload',
          status: 'Error',
          message: '[MOCK DATA] Failed to upload image: File size too large',
          ipAddress: '192.168.1.1',
          user: 'pwelby@gmail.com'
        },
        {
          id: '9',
          type: 'Error',
          timestamp: new Date(),
          action: 'Database',
          status: 'Error',
          message: '[MOCK DATA] Connection timeout after 30 seconds',
          ipAddress: '127.0.0.1'
        }
      ];
      this.buildErrorTree();
    } else if (this.selectedLogType === 'Audit') {
      this.logs = [
        {
          id: '10',
          type: 'Audit',
          timestamp: new Date(),
          user: 'pwelby@gmail.com',
          action: 'Account Creation',
          status: 'Success',
          message: '[MOCK DATA] New user account created',
          ipAddress: '192.168.1.1'
        },
        {
          id: '11',
          type: 'Audit',
          timestamp: new Date(),
          user: 'pwelby@gmail.com',
          action: 'Permission Change',
          status: 'Success',
          message: '[MOCK DATA] User role changed to Admin',
          ipAddress: '192.168.1.1'
        },
        {
          id: '12',
          type: 'Audit',
          timestamp: new Date(),
          user: 'pwelby@gmail.com',
          action: 'Data Access',
          status: 'Info',
          message: '[MOCK DATA] Accessed sensitive information',
          ipAddress: '192.168.1.1'
        }
      ];
      this.buildAuditTree();
    }
  }

  toggleAutoRefresh() {
    if (this.autoRefresh) {
      this.stopAutoRefresh();
    } else {
      this.startAutoRefresh();
    }
  }

  startAutoRefresh() {
    this.autoRefresh = true;
    this.refreshInterval = setInterval(() => {
      this.refresh();
    }, this.refreshRate * 1000);
  }

  stopAutoRefresh() {
    this.autoRefresh = false;
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }
}
