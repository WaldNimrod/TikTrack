# TikTrack Preferences User Guide

## Overview

The TikTrack Preferences page allows you to customize your trading interface, set default values, and configure system settings to match your trading style and preferences.

## Recent Updates (Version 2.4.0)

### Auto-Save System
- **Automatic Saving**: All settings now save automatically when you change them
- **No Manual Save Required**: You no longer need to click "Save" buttons
- **Instant Feedback**: Changes are applied immediately across the application

### New Settings
- **Default Commission**: Set your default commission rate for trades
- **Console Cleanup Interval**: Configure how often the console is cleaned up
- **Enhanced Account Filter**: Account filter now shows all your available accounts

## Accessing Preferences

1. Open TikTrack application in your web browser
2. Navigate to the Preferences page from the main menu
3. The preferences page will load with all your current settings

## Page Layout

The preferences page is organized into collapsible sections:

### Main Controls
- **Toggle All Sections**: Opens or closes all sections simultaneously
- **Auto-Save**: All settings save automatically when changed (no manual save required)

### Sections Overview
1. **System Settings**: Core system configuration
2. **Personal Settings**: Individual trading preferences  
3. **Security Settings**: Security and privacy options
4. **Display Settings**: Interface customization options
5. **Testing Management**: Development and testing tools

## System Settings

Configure core system parameters that affect the entire application.

### Primary Currency
- **Current Setting**: USD (United States Dollar)
- **Restriction**: Cannot be changed - system supports USD only
- **Purpose**: Determines the base currency for all calculations

### System Timezone
- **Default**: Asia/Jerusalem
- **Options**: Select from available timezone list
- **Purpose**: Controls how dates and times are displayed throughout the application

### Actions Available
- **Auto-Save**: Settings save automatically when changed
- **Reset to Defaults**: Restore original system settings

## Personal Settings

Customize your individual trading preferences and default values.

### Default Stop Loss
- **Range**: 0% to 100%
- **Default**: 5%
- **Purpose**: Automatically fills this percentage when creating new trades
- **Example**: Setting 5% means new trades will default to 5% stop loss

### Default Target Price
- **Range**: 0% to 1000%
- **Default**: 10%
- **Purpose**: Automatically fills this percentage when creating new trades
- **Example**: Setting 10% means new trades will default to 10% target price

### Default Commission
- **Range**: 0.0 to 100.0
- **Default**: 0.0
- **Purpose**: Sets the default commission rate for new trades
- **Example**: Setting 2.5 means new trades will default to 2.5% commission

### Console Cleanup Interval
- **Range**: 60 to 3600 seconds
- **Default**: 300 seconds (5 minutes)
- **Purpose**: Controls how often the browser console is automatically cleaned
- **Example**: Setting 600 means console will be cleaned every 10 minutes

### Actions Available
- **Auto-Save**: Settings save automatically when changed
- **Reset to Defaults**: Restore original personal settings

## Security Settings

Configure security and privacy options for your account.

### Current Status
- **Status**: Coming Soon
- **Description**: Security features will be available in future updates
- **Planned Features**: 
  - Two-factor authentication
  - Session timeout settings
  - Login notifications
  - Data encryption options

## Display Settings

Customize how information is displayed and filtered throughout the application.

### Default Filters

These settings control the initial filter values when you open different pages:

#### Status Filter
- **Options**: All, Active, Closed, Cancelled
- **Default**: All
- **Purpose**: Default status filter for trade lists

#### Type Filter
- **Options**: All, Buy, Sell
- **Default**: All
- **Purpose**: Default transaction type filter

#### Account Filter
- **Options**: All, [Your Account Names]
- **Default**: All
- **Purpose**: Default account filter for multi-account users

#### Date Range Filter
- **Options**: All, Today, Last 7 Days, Last 30 Days, Custom
- **Default**: All
- **Purpose**: Default date range for historical data

#### Search Filter
- **Type**: Text input
- **Default**: Empty
- **Purpose**: Default search term for filtering results

### Actions Available
- **Save Settings**: Apply display setting changes
- **Reset to Defaults**: Restore original display settings

## Testing Management

Configure development and testing options (for advanced users).

### Test Categories

#### Database Tests
- **Create Test Database Copy**: Creates backup for testing
- **Auto Backup Before Tests**: Automatically saves data before testing
- **Clean Temp Files**: Removes temporary files after testing

#### Performance Tests
- **Run Tests in Parallel**: Improves test execution speed
- **Show Progress During Tests**: Displays test progress
- **Stop on First Error**: Halts testing when error occurs

#### Reporting Options
- **Detailed Reports**: Creates comprehensive test reports
- **Save Reports to Files**: Stores reports for later review
- **Generate HTML Reports**: Creates web-viewable reports

#### Notifications
- **Show Error Alerts**: Displays alerts when tests fail
- **Show Success Alerts**: Shows confirmation when tests pass

#### Monitoring
- **Measure Execution Time**: Tracks how long tests take
- **Monitor Memory Usage**: Tracks memory consumption during tests

#### Security Testing
- **Run Security Tests**: Performs security vulnerability checks
- **Basic Penetration Testing**: Runs basic security penetration tests

#### Development Options
- **Enable Debug Mode**: Provides detailed debugging information
- **Run Dry Tests**: Performs test runs without making changes
- **Isolate Test Environment**: Runs tests in isolated environment

### Actions Available
- **Save Test Settings**: Apply testing configuration changes
- **Reset to Defaults**: Restore original testing settings
- **Run Selected Tests**: Execute tests based on current configuration

## Using the Interface

### Opening and Closing Sections

1. **Toggle All Sections**: Click the toggle button next to "Preferences and Settings" to open or close all sections at once
2. **Individual Sections**: Click the toggle button (▼/▶) next to each section title to open or close that specific section
3. **State Memory**: The system remembers which sections you had open and restores them when you return to the page

### Making Changes

1. **Individual Changes**: Modify any setting and it will be automatically tracked
2. **Saving**: Click "Save" buttons for individual sections or "Save All Settings" for everything at once
3. **Resetting**: Use "Reset to Defaults" buttons to restore original values for each section

### Unsaved Changes Protection

The system protects you from accidentally losing changes:

1. **Change Tracking**: The page title shows "⚠️" when you have unsaved changes
2. **Navigation Warning**: If you try to leave the page with unsaved changes, you'll get a warning
3. **Options**: You can choose to stay and save your changes, or leave without saving

### Notifications

The system provides feedback for all actions:

- **Success Messages**: Green notifications for successful operations
- **Error Messages**: Red notifications for problems or restrictions
- **Information**: Blue notifications for general information

## Tips and Best Practices

### Getting Started
1. **Review Defaults**: Check all default values when first using the system
2. **Test Settings**: Make small changes first to see how they affect your workflow
3. **Auto-Save**: All changes save automatically - no manual saving required

### Optimization
1. **Personal Defaults**: Set stop loss and target price defaults based on your trading strategy
2. **Filter Preferences**: Configure display filters to match your most common view preferences
3. **Section Organization**: Keep frequently used sections expanded and others collapsed

### Troubleshooting
1. **Changes Not Saving**: Check for error messages and ensure all values are valid
2. **Page Not Loading**: Refresh the browser and check your internet connection
3. **Settings Reset**: If settings disappear, check if you accidentally clicked "Reset to Defaults"

## Keyboard Shortcuts

Currently, the preferences page uses mouse/touch interaction. Keyboard shortcuts may be added in future updates.

## Mobile Usage

The preferences page is responsive and works on mobile devices:

- **Touch Friendly**: All buttons and controls work with touch
- **Responsive Layout**: Sections adapt to smaller screens
- **Scroll Navigation**: Use vertical scrolling to access all sections

## Data Privacy

Your preference data is:
- **Stored Locally**: Preferences are saved on the server you're using
- **Not Shared**: Your settings are private to your session
- **Backed Up**: The system creates backups before making changes
- **Recoverable**: Settings can be restored if needed

## Getting Help

If you need assistance with preferences:

1. **Check This Guide**: Review the relevant section above
2. **Try Default Values**: Use "Reset to Defaults" to restore working settings
3. **Contact Support**: Reach out to your system administrator for technical issues

## Future Enhancements

Planned improvements to the preferences system:

### Short Term
- **Keyboard Shortcuts**: Quick access to common functions
- **Import/Export**: Save and restore preference sets
- **Themes**: Multiple visual themes to choose from

### Long Term
- **Advanced Security**: Two-factor authentication and encryption
- **Cloud Sync**: Synchronize preferences across devices
- **Profile Management**: Multiple preference profiles for different trading strategies

## Troubleshooting Common Issues

### Issue: Currency Cannot Be Changed
- **Cause**: System restriction - only USD is supported
- **Solution**: This is intentional - the system is designed for USD trading only

### Issue: Stop Loss/Target Price Not Accepting Values
- **Cause**: Value outside valid range
- **Solution**: Ensure stop loss is 0-100% and target price is 0-1000%

### Issue: Changes Not Saved
- **Cause**: Network error or validation failure
- **Solution**: Check error messages, verify internet connection, try again

### Issue: Page Shows Unsaved Changes Warning
- **Cause**: You have modified settings but not saved them
- **Solution**: Settings now save automatically - this warning should not appear in normal operation

### Issue: Sections Won't Open/Close
- **Cause**: JavaScript error or browser compatibility issue
- **Solution**: Refresh the page, try a different browser, clear cache

---

**Document Version**: 1.0  
**Last Updated**: August 2025  
**Author**: TikTrack Development Team
