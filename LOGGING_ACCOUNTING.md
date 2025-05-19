# Logging and User Activity Tracking Documentation

## Overview
This document outlines all user activities and system events that are logged in the application. The logging system is designed to provide comprehensive tracking of user actions, system events, security incidents, and performance metrics.

## Log Types

### 1. User Activity Logs
- **Authentication Events**
  - Login attempts (successful/failed)
  - Logout events
  - Password reset requests
  - Email verification events
  - Session creation and termination

- **Navigation Events**
  - Page visits
  - Time spent on pages
  - Referrer information
  - Navigation paths

- **Profile Management**
  - Profile updates
  - Avatar/image changes
  - Settings modifications
  - Role changes

### 2. Inactivity Events
- **Warning Events**
  - Initial inactivity warning (after 5 minutes)
  - Warning dialog display
  - User response to warning

- **Timeout Events**
  - Automatic logout due to inactivity
  - Session termination
  - Duration of inactivity

### 3. Security Logs
- **Authentication Security**
  - Failed login attempts
  - Password reset requests
  - Email verification status
  - Session hijacking attempts

- **Access Control**
  - Role-based access attempts
  - Permission violations
  - Admin action tracking
  - Super-admin activities

### 4. System Logs
- **Application Events**
  - Server startup/shutdown
  - Configuration changes
  - System errors
  - Performance metrics

- **Error Logs**
  - Application errors
  - API failures
  - Database connection issues
  - Validation errors

### 5. Audit Logs
- **Data Modifications**
  - Record creation
  - Record updates
  - Record deletion
  - Bulk operations

- **User Management**
  - User creation
  - Role changes
  - Permission modifications
  - Account status changes

## Log Data Structure

Each log entry contains the following information:

### Common Fields
- Timestamp
- Log type
- Action performed
- Status (success/failure)
- IP address
- User agent
- Geo-location (when available)

### User-Specific Fields
- User email
- User role
- Session ID
- Response time
- Page URL
- Referrer URL

### Security-Specific Fields
- Security event type
- Severity level
- Related user accounts
- System components affected

## Log Storage and Retention

- Logs are stored in MongoDB
- Each log type has its own collection
- Logs are indexed for efficient querying
- Retention policies can be configured per log type

## Log Access and Management

### Access Levels
- Regular users can view their own logs
- Admins can view all user logs
- Super-admins have full access to all logs

### Management Features
- Log filtering by date, type, user
- Log export capabilities
- Log rotation and archival
- Log analysis tools

## API Endpoints

### Log Creation
- POST `/logs/user` - User activity logs
- POST `/logs/system` - System event logs
- POST `/logs/error` - Error logs
- POST `/logs/audit` - Audit logs
- POST `/logs/inactivity` - Inactivity events

### Log Retrieval
- GET `/logs` - Query logs with filters
- GET `/logs/user-activity/:userId` - User activity summary

## Best Practices

1. **Logging Guidelines**
   - Log all security-relevant events
   - Include sufficient context in log messages
   - Use appropriate log levels
   - Sanitize sensitive data

2. **Performance Considerations**
   - Use asynchronous logging
   - Implement log batching
   - Monitor log storage usage
   - Regular log rotation

3. **Security Measures**
   - Encrypt sensitive log data
   - Implement access controls
   - Regular log analysis
   - Alert on suspicious patterns

## Monitoring and Alerts

The system monitors for:
- Unusual login patterns
- Multiple failed attempts
- Suspicious IP addresses
- System resource usage
- Error rate thresholds

## Future Enhancements

Planned improvements include:
1. Real-time log analysis
2. Advanced pattern detection
3. Automated log reporting
4. Enhanced visualization tools
5. Integration with external monitoring systems 
