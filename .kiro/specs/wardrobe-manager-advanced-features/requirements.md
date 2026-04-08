# Requirements Document

## Introduction

This specification extends the existing Wardrobe Manager application with advanced features for enhanced wardrobe management. These features build on top of the existing Item, Category, Field, and component architecture established in the wardrobe-manager spec.

The advanced features include: a flexible tags system for contextual classification, permanent optional fields for value tracking and care instructions, usage tracking to monitor wear patterns, a comprehensive dashboard with insights and statistics, notification/reminder system for maintenance and rotation, sharing and export capabilities, laundry tracking, and outfit creation functionality that extends the existing Presets system.

This spec depends on the wardrobe-manager spec being fully implemented first. All data models, services, and components reference the existing architecture.

## Glossary

- **Tag**: A user-defined or preset label representing context, style, season, or occasion (e.g., #sport, #office, #summer). Items can have multiple tags.
- **Tag_System**: The flexible tagging mechanism allowing multi-select, user-defined tags separate from categories
- **Usage_Tracking**: System for recording when items are worn, tracking usageCount and lastWornDate
- **Dashboard_Insights**: Analytics and statistics displayed on Dashboard_Page showing wardrobe value, usage patterns, and reminders
- **Permanent_Field**: A field that cannot be removed from the field configuration but is optional to fill (Value Bought, Care Instructions, Notes)
- **Value_Bought**: Permanent optional number field storing the purchase price of an item
- **Care_Instructions**: Permanent optional long_text field storing washing/cleaning instructions
- **Notes**: Permanent optional long_text field for general item notes
- **Last_Cleaned_Date**: Optional field template that can be added to track when an item was last washed/cleaned
- **Worn_This_Week_Button**: UI control on item detail view that increments usageCount and updates lastWornDate
- **Usage_History**: Record of when an item was worn, derived from lastWornDate and usageCount
- **Wardrobe_Value**: Sum of all Value_Bought fields across all items
- **Most_Worn_Items**: Top 5 items sorted by usageCount descending
- **Least_Worn_Items**: Bottom 5 items sorted by usageCount ascending
- **Unworn_Items**: Items where lastWornDate is null or more than 6 months ago
- **Wardrobe_Statistics**: Aggregate metrics including total items, total value, average cost per item, cost per wear
- **Cost_Per_Wear**: Calculated as Value_Bought divided by usageCount (or infinity if never worn)
- **Seasonal_Rotation_Reminder**: Notification suggesting items to rotate based on current season and item tags
- **Maintenance_Reminder**: Notification for items needing dry cleaning or repairs based on care instructions and usage
- **Browser_Notification**: Native browser notification API for displaying reminders
- **Share_Item**: Feature to download an item's image and text description as a single image file
- **Export_PDF**: Feature to export entire wardrobe as a PDF document with images
- **Export_Images**: Feature to export wardrobe as a grid layout of images
- **Export_Data**: Feature to export wardrobe data as JSON or CSV text file
- **Outfit**: A combination of multiple items (e.g., shirt + pants + shoes) saved as a preset
- **Outfit_Preset**: An outfit saved to the Presets system, extending PresetItem to support multiple items
- **Outfit_Usage**: Tracking how many times an outfit has been worn
- **Worn_This_Week_Outfit**: Button on outfit detail view that increments outfit usageCount

## Requirements

### Requirement 1: Tags System

**User Story:** As a user, I want to add flexible tags to my clothing items, so that I can classify them by context, style, season, or occasion beyond just categories.

#### Acceptance Criteria

1. WHEN a user adds or edits an Item, THEN THE Item_Form SHALL display a tags field with multi-select capability
2. THE Wardrobe_App SHALL provide preset tags: #sport, #office, #casual, #formal, #summer, #winter, #rain, #travel, #party, #comfortable, #vacation
3. WHEN a user types a new tag name, THEN THE Tag_System SHALL create a custom tag and add it to the available tags list
4. WHEN a user selects multiple tags for an Item, THEN THE Wardrobe_App SHALL store all selected tags as part of the Item record
5. WHEN a user filters by tags on the Wardrobe_Page, THEN THE Wardrobe_Page SHALL display only Items that have at least one of the selected tags
6. WHEN displaying an Item, THEN THE Wardrobe_Page SHALL show the item's tags alongside other metadata

### Requirement 2: Permanent Optional Fields

**User Story:** As a user, I want certain fields to always be available but optional to fill, so that I can track value, care instructions, and notes without cluttering the interface.

#### Acceptance Criteria

1. THE Wardrobe_App SHALL include Value_Bought as a permanent number field that cannot be removed from field configuration
2. THE Wardrobe_App SHALL include Care_Instructions as a permanent long_text field that cannot be removed from field configuration
3. THE Wardrobe_App SHALL include Notes as a permanent long_text field that cannot be removed from field configuration
4. WHEN a user views the field configuration in Settings, THEN THE Settings_Page SHALL display permanent fields with a visual indicator that they cannot be deleted
5. WHEN a user adds or edits an Item, THEN THE Item_Form SHALL display all permanent fields but SHALL NOT require them to be filled

### Requirement 3: Usage Tracking

**User Story:** As a user, I want to track when I wear my clothing items, so that I can understand my usage patterns and identify underutilized items.

#### Acceptance Criteria

1. WHEN a user views an Item detail, THEN THE Item_Detail_View SHALL display a Worn_This_Week_Button
2. WHEN a user clicks the Worn_This_Week_Button, THEN THE Wardrobe_App SHALL increment the Item's usageCount by 1 and update lastWornDate to the current date
3. WHEN an Item is created, THEN THE Wardrobe_App SHALL initialize usageCount to 0 and lastWornDate to null
4. WHEN displaying an Item, THEN THE Item_Detail_View SHALL show the lastWornDate and usageCount
5. THE Wardrobe_App SHALL persist usageCount and lastWornDate to the Cloud_Database as part of the Item record

### Requirement 4: Dashboard Insights

**User Story:** As a user, I want to see insights and statistics about my wardrobe on the dashboard, so that I can understand my wardrobe value, usage patterns, and receive helpful reminders.

#### Acceptance Criteria

1. WHEN a user views the Dashboard_Page, THEN THE Dashboard_Page SHALL display the total Wardrobe_Value calculated as the sum of all Value_Bought fields
2. WHEN a user views the Dashboard_Page, THEN THE Dashboard_Page SHALL display the Most_Worn_Items list showing the top 5 items by usageCount
3. WHEN a user views the Dashboard_Page, THEN THE Dashboard_Page SHALL display the Least_Worn_Items list showing the bottom 5 items by usageCount
4. WHEN a user views the Dashboard_Page, THEN THE Dashboard_Page SHALL display Unworn_Items where lastWornDate is null or more than 6 months ago
5. WHEN a user views the Dashboard_Page, THEN THE Dashboard_Page SHALL display Wardrobe_Statistics including total items, total value, average cost per item, and average cost per wear
6. WHEN calculating average cost per wear, THEN THE Wardrobe_App SHALL compute the sum of all Cost_Per_Wear values divided by the number of items with non-zero usageCount
7. WHEN an Item has usageCount of 0, THEN THE Wardrobe_App SHALL exclude it from the average cost per wear calculation

### Requirement 5: Notifications and Reminders

**User Story:** As a user, I want to receive reminders about items I haven't worn, seasonal rotations, and maintenance needs, so that I can better utilize my wardrobe and keep items in good condition.

#### Acceptance Criteria

1. WHEN a user views the Dashboard_Page and has Unworn_Items, THEN THE Dashboard_Page SHALL display a reminder section showing items not worn in 6 months
2. WHEN the current season changes, THEN THE Dashboard_Page SHALL display a Seasonal_Rotation_Reminder suggesting items with relevant seasonal tags
3. WHEN items have Care_Instructions indicating dry cleaning or repairs, THEN THE Dashboard_Page SHALL display Maintenance_Reminders for those items
4. WHERE browser notifications are supported and enabled, THEN THE Wardrobe_App SHALL send Browser_Notifications for unworn items and maintenance reminders
5. WHEN a user dismisses a reminder, THEN THE Wardrobe_App SHALL not display that specific reminder again for 30 days

### Requirement 6: Sharing and Export Features

**User Story:** As a user, I want to share individual items and export my entire wardrobe in various formats, so that I can share with friends, backup my data, or use it in other applications.

#### Acceptance Criteria

1. WHEN a user selects Share_Item on an Item detail view, THEN THE Wardrobe_App SHALL generate an image file containing the item's photo and text description
2. WHEN a user selects Export_PDF, THEN THE Wardrobe_App SHALL generate a PDF document containing all wardrobe items with images and details
3. WHEN a user selects Export_Images, THEN THE Wardrobe_App SHALL generate a grid layout image containing all item photos
4. WHEN a user selects Export_Data with JSON format, THEN THE Wardrobe_App SHALL generate a JSON file containing all item data in a structured format
5. WHEN a user selects Export_Data with CSV format, THEN THE Wardrobe_App SHALL generate a CSV file containing all item data with columns for each field
6. WHEN an export is generated, THEN THE Wardrobe_App SHALL trigger a browser download with an appropriate filename and extension

### Requirement 7: Laundry and Cleaning Tracking

**User Story:** As a user, I want to track when I last cleaned my items and view care instructions, so that I can maintain my wardrobe properly.

#### Acceptance Criteria

1. THE Wardrobe_App SHALL provide Last_Cleaned_Date as an optional field template that users can add to categories
2. WHEN a user adds the Last_Cleaned_Date field to a category, THEN THE Item_Form SHALL display a date picker for that field
3. WHEN a user views an Item with Care_Instructions, THEN THE Item_Detail_View SHALL prominently display the care instructions
4. WHEN a user updates Last_Cleaned_Date, THEN THE Wardrobe_App SHALL persist the date to the Cloud_Database
5. WHEN calculating Maintenance_Reminders, THEN THE Wardrobe_App SHALL consider Last_Cleaned_Date and Care_Instructions together

### Requirement 8: Outfit Creation and Tracking

**User Story:** As a user, I want to create outfits by combining multiple items and track how often I wear them, so that I can plan coordinated looks and understand my outfit preferences.

#### Acceptance Criteria

1. WHEN a user creates an Outfit, THEN THE Wardrobe_App SHALL allow selection of multiple Items to combine
2. WHEN a user saves an Outfit, THEN THE Wardrobe_App SHALL create an Outfit_Preset in the Presets system with references to all selected Items
3. WHEN a user views the Preset_Clothing_Page, THEN THE Preset_Clothing_Page SHALL display both individual PresetItems and Outfit_Presets
4. WHEN displaying an Outfit_Preset, THEN THE Preset_Clothing_Page SHALL show thumbnails of all items in the outfit
5. WHEN a user views an Outfit detail, THEN THE Wardrobe_App SHALL display a Worn_This_Week_Outfit button
6. WHEN a user clicks Worn_This_Week_Outfit, THEN THE Wardrobe_App SHALL increment the Outfit's usageCount and update its lastWornDate
7. WHEN an Outfit is worn, THEN THE Wardrobe_App SHALL also increment the usageCount for each individual Item in the outfit
8. WHEN a user deletes an Item that is part of an Outfit, THEN THE Wardrobe_App SHALL remove that Item reference from the Outfit but keep the Outfit intact
9. WHEN an Outfit has zero Items remaining, THEN THE Wardrobe_App SHALL automatically delete the Outfit_Preset

### Requirement 9: Tag Filtering and Search Integration

**User Story:** As a user, I want to filter and search by tags alongside existing filters, so that I can quickly find items matching specific contexts or occasions.

#### Acceptance Criteria

1. WHEN a user applies a tag filter on Wardrobe_Page, THEN THE Wardrobe_Page SHALL combine tag filters with existing category and favorite filters using AND logic
2. WHEN a user searches with text and applies tag filters, THEN THE Wardrobe_Page SHALL return items matching both the text query AND at least one selected tag
3. WHEN a user selects multiple tags, THEN THE Wardrobe_Page SHALL return items that have at least one of the selected tags (OR logic between tags)
4. WHEN a user clears all filters including tags, THEN THE Wardrobe_Page SHALL display all items

### Requirement 10: Data Model Extensions

**User Story:** As a developer, I want the Item and Outfit data models to properly extend the existing architecture, so that data integrity is maintained and serialization works correctly.

#### Acceptance Criteria

1. WHEN an Item is serialized with tags, THEN THE ItemSerializer SHALL serialize tags as an array of strings
2. WHEN an Item is deserialized with tags, THEN THE ItemSerializer SHALL deserialize tags back to a string array
3. WHEN an Outfit_Preset is serialized, THEN THE Wardrobe_App SHALL serialize the outfit with an array of Item IDs and outfit-specific metadata
4. WHEN an Outfit_Preset is deserialized, THEN THE Wardrobe_App SHALL deserialize the outfit and resolve Item references
5. FOR ALL valid Item objects with tags, serializing then deserializing SHALL produce an equivalent Item object with identical tags (round-trip property)
6. FOR ALL valid Outfit_Preset objects, serializing then deserializing SHALL produce an equivalent Outfit_Preset with identical Item references (round-trip property)

### Requirement 11: Dashboard Insights Calculations

**User Story:** As a developer, I want dashboard calculations to be accurate and handle edge cases, so that users see reliable statistics.

#### Acceptance Criteria

1. WHEN calculating Wardrobe_Value with no items having Value_Bought, THEN THE Dashboard_Page SHALL display 0 as the total value
2. WHEN calculating average cost per item with no items having Value_Bought, THEN THE Dashboard_Page SHALL display 0 or "N/A"
3. WHEN calculating Cost_Per_Wear for an item with usageCount of 0, THEN THE Wardrobe_App SHALL treat it as undefined and exclude it from averages
4. WHEN calculating Most_Worn_Items with fewer than 5 items, THEN THE Dashboard_Page SHALL display all available items sorted by usageCount
5. WHEN multiple items have the same usageCount, THEN THE Dashboard_Page SHALL use lastWornDate as a tiebreaker (most recent first)

### Requirement 12: Export Data Integrity

**User Story:** As a user, I want exported data to be complete and accurate, so that I can reliably backup or migrate my wardrobe data.

#### Acceptance Criteria

1. WHEN exporting to JSON, THEN THE Wardrobe_App SHALL include all Item fields including tags, usageCount, lastWornDate, and all custom field values
2. WHEN exporting to CSV, THEN THE Wardrobe_App SHALL include a column for each field definition plus tags (as comma-separated values within the cell)
3. WHEN exporting to PDF, THEN THE Wardrobe_App SHALL include item images, all visible field values, and tags for each item
4. WHEN exporting images, THEN THE Wardrobe_App SHALL include all items with images and exclude items without images
5. FOR ALL items in the wardrobe, exporting to JSON then importing SHALL preserve all data including tags and usage tracking (round-trip property)
