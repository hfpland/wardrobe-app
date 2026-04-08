# Requirements Document

## Introduction

A React web application for managing a personal wardrobe. The app features a mobile-first layout with a bottom navigation bar containing five items: Wardrobe, Presets, Dashboard (center, default), Wishlist, and Settings. A splash screen displays on app launch. Users can photograph or upload images of their clothing items, store them in the cloud via Firebase, and access their wardrobe from any device with a browser.

The entire data model is field-driven and fully customizable. The app ships with a rich set of default categories, subcategories, and fields (name, colors, material, measurements, fit type, etc.), but every field is a configurable column — users can edit, add, or delete any category, subcategory, or field at any time through Settings. There are no hardcoded "standard" fields; the defaults are simply pre-configured entries in the same customizable system.

Each field has a configurable value type: short text, long text/description, number, color (with eyedropper picker and square preview), dropdown select, boolean toggle, date, measurement (single value or min–max range with unit), and multi-select. Fields can be marked as required or optional.

When adding items, users can specify fit confidence (exact, approximate, or flexible/stretchy) and material stretch properties. Items can be compared against similar items in the same category/subcategory and against the user's own body measurements.

## Glossary

- **Wardrobe_App**: The React web application for managing clothing items
- **Bottom_Nav**: The bottom navigation bar with five items: Wardrobe_Page (left), Preset_Clothing_Page (left-center), Dashboard_Page (center), Wishlist_Page (right-center), Settings_Page (right)
- **Splash_Screen**: The initial loading screen displayed when the app launches
- **Item**: A single clothing article stored in the system. Its data is a collection of field values determined by the Category/Subcategory field configuration, plus an optional image.
- **Dashboard_Page**: The main landing page (center nav item, default on open) showing a summary/overview of the wardrobe
- **Add_Clothing_Page**: The page containing the dynamically generated form to add a new clothing item
- **Preset_Clothing_Page**: The page displaying a list of preset/template clothing items that users can quickly add to their wardrobe
- **Wardrobe_Page**: The page listing all clothing items in the user's wardrobe
- **Wishlist_Page**: The page displaying clothing items the user wants to acquire in the future
- **Wishlist_Item**: A clothing item added to the wishlist with user-configured fields plus optional image
- **Settings_Page**: The page for app configuration, preferences, user profile, body measurements, and category/field customization
- **Item_Form**: The UI component for creating or editing an Item, dynamically rendered from the field configuration of the selected Category/Subcategory
- **Image_Uploader**: The component responsible for capturing or selecting photos and uploading them to cloud storage
- **Cloud_Storage**: Firebase Storage service used to store item images
- **Cloud_Database**: Firestore database used to persist item data, category/field configurations, and user settings
- **Category**: A top-level classification for clothing items. Ships with defaults but is fully user-customizable (add, edit, delete).
- **Subcategory**: A second-level classification under a Category. Ships with defaults but is fully user-customizable.
- **Field_Definition**: A configurable column/property attached to a Category or Subcategory (or globally). Defines: label, value type, required flag, default value, dropdown choices, display order. This is the core building block — ALL item data columns are Field_Definitions.
- **Field_Type**: The value type of a Field_Definition. Supported types: short_text, long_text, number, color (eyedropper), dropdown, multi_select, boolean, date, measurement (single or range with unit).
- **Measurement_Value**: A field value for a measurement-type field. Can be a single numeric value or a range (min–max) with a unit (cm or inches).
- **Fit_Type**: A dropdown field classifying how an item fits. Default options: Slim, Regular, Relaxed, Oversized. Users can add custom options.
- **Fit_Confidence**: A dropdown field indicating sizing accuracy. Options: Exact, Approximate, Flexible.
- **Material_Stretch**: A boolean field indicating whether the item material is stretchy, affecting fit accuracy.
- **Size_Label**: A short_text field for the commercial size designation (e.g., S, M, L, XL, 32, 42).
- **Person_Measurement**: The user's own body measurements stored in their profile, used for fit comparison.
- **Fit_Comparison**: The result of comparing an Item's measurement fields against the user's Person_Measurements or against other Items in the same Category/Subcategory.
- **Preset_Item**: A predefined clothing template that users can add to their wardrobe with one click.
- **Auth_Module**: The optional Firebase Authentication module for user identity.

## Requirements
### Requirement 1: Dashboard Page

**User Story:** As a user, I want to see a dashboard when I open the app, so that I can get an overview of my wardrobe at a glance.

#### Acceptance Criteria

1. WHEN a user opens the Wardrobe_App, THEN THE Dashboard_Page SHALL display a summary of total clothing items in the wardrobe
2. WHEN a user opens the Dashboard_Page, THEN THE Dashboard_Page SHALL display navigation links to the Add_Clothing_Page, Preset_Clothing_Page, and Wardrobe_Page
3. WHEN the wardrobe contains items, THEN THE Dashboard_Page SHALL display a breakdown of items by Category

### Requirement 2: Add Clothing Items

**User Story:** As a user, I want to add new clothing items with detailed information, so that I can keep a thorough digital record of what I own.

#### Acceptance Criteria

1. WHEN a user navigates to the Add_Clothing_Page, THEN THE Wardrobe_App SHALL display the Item_Form with fields for name, category, multiple colors, material, brand, size, purchase date, price, description, and notes
2. WHEN a user fills out the Item_Form with valid data and submits it, THEN THE Wardrobe_App SHALL create a new Item and persist it to the Cloud_Database
3. WHEN a user submits the Item_Form without a required field (name or category), THEN THE Wardrobe_App SHALL display a validation error and prevent submission
4. WHEN a user selects multiple colors for an Item, THEN THE Item_Form SHALL store all selected colors as part of the Item record
5. WHEN a new Item is successfully created, THEN THE Wardrobe_App SHALL navigate the user to the Wardrobe_Page and display the new Item

### Requirement 3: Upload Item Images

**User Story:** As a user, I want to upload photos of my clothing items, so that I can visually identify them in my wardrobe.

#### Acceptance Criteria

1. WHEN a user selects a photo from their device gallery, THEN THE Image_Uploader SHALL upload the image to Cloud_Storage and return a URL
2. WHEN a user captures a photo using their device camera, THEN THE Image_Uploader SHALL upload the captured image to Cloud_Storage and return a URL
3. WHEN an image is successfully uploaded, THEN THE Wardrobe_App SHALL store the returned URL as part of the Item record in the Cloud_Database
4. IF an image upload fails, THEN THE Wardrobe_App SHALL display an error message and allow the user to retry
5. WHILE an image is uploading, THEN THE Image_Uploader SHALL display a progress indicator

### Requirement 4: Wardrobe Listing Page

**User Story:** As a user, I want to view all my clothing items in a list, so that I can browse my wardrobe digitally.

#### Acceptance Criteria

1. WHEN a user navigates to the Wardrobe_Page, THEN THE Wardrobe_Page SHALL load and display all Items from the Cloud_Database
2. WHEN displaying an Item, THEN THE Wardrobe_Page SHALL show the item name, category, colors, material, and image thumbnail
3. WHEN a user selects an Item from the Wardrobe_Page, THEN THE Wardrobe_App SHALL display the full Item details including name, category, colors, material, brand, size, purchase date, price, description, notes, and full-size image
4. WHEN a user selects a Category filter on the Wardrobe_Page, THEN THE Wardrobe_Page SHALL display only Items matching the selected Category
5. WHEN a user types a search query on the Wardrobe_Page, THEN THE Wardrobe_Page SHALL search across all field values (name, brand, colors, material, tags, ownership status, condition, notes, description, and all custom fields) and display matching items
6. WHEN a user is viewing a specific category or subcategory and performs a search, THEN THE search SHALL be scoped to only items within that category or subcategory
7. WHEN a user clears all filters on the Wardrobe_Page, THEN THE Wardrobe_Page SHALL display all Items

### Requirement 5: Preset Clothing Page

**User Story:** As a user, I want to browse preset clothing templates, so that I can quickly add common items to my wardrobe without filling out all details manually.

#### Acceptance Criteria

1. WHEN a user navigates to the Preset_Clothing_Page, THEN THE Wardrobe_App SHALL display a list of Preset_Items with name, category, and image
2. WHEN a user clicks the add button on a Preset_Item, THEN THE Wardrobe_App SHALL create a new Item in the Cloud_Database based on the Preset_Item template
3. WHEN a Preset_Item is added to the wardrobe, THEN THE Wardrobe_App SHALL allow the user to edit the details before or after saving
4. THE Wardrobe_App SHALL provide a way to add new Preset_Items to the preset list

### Requirement 6: Edit Wardrobe Items

**User Story:** As a user, I want to edit my clothing items, so that I can keep item details accurate and up to date.

#### Acceptance Criteria

1. WHEN a user edits an Item and submits the changes, THEN THE Wardrobe_App SHALL update the Item record in the Cloud_Database
2. WHEN a user replaces an Item image during editing, THEN THE Image_Uploader SHALL upload the new image to Cloud_Storage and update the URL in the Cloud_Database
3. WHEN a user submits an edit with invalid data, THEN THE Wardrobe_App SHALL display a validation error and prevent the update

### Requirement 7: Delete Wardrobe Items

**User Story:** As a user, I want to delete clothing items from my wardrobe, so that I can remove items I no longer own.

#### Acceptance Criteria

1. WHEN a user requests deletion of an Item, THEN THE Wardrobe_App SHALL prompt for confirmation before proceeding
2. WHEN a user confirms deletion, THEN THE Wardrobe_App SHALL remove the Item record from the Cloud_Database and remove the associated image from Cloud_Storage
3. WHEN an Item is deleted, THEN THE Wardrobe_Page SHALL update to no longer display the removed Item

### Requirement 8: Splash Screen and Navigation

**User Story:** As a user, I want to see a splash screen on launch and navigate the app using a bottom navigation bar, so that the app feels polished and I can easily switch between pages.

#### Acceptance Criteria

1. WHEN the Wardrobe_App is launched, THEN THE Splash_Screen SHALL display the app logo and name for a brief duration before navigating to the Dashboard_Page
2. THE Bottom_Nav SHALL be visible on all main pages of the Wardrobe_App
3. THE Bottom_Nav SHALL contain five items in this order from left to right: Wardrobe_Page, Preset_Clothing_Page, Dashboard_Page, Wishlist_Page, Settings_Page
4. WHEN the Wardrobe_App is opened, THEN THE Bottom_Nav SHALL highlight the Dashboard_Page as the active item by default
5. WHEN a user taps a Bottom_Nav item, THEN THE Wardrobe_App SHALL navigate to the corresponding page

### Requirement 9: Wishlist Page

**User Story:** As a user, I want to maintain a wishlist of clothing items I want to acquire, so that I can plan future purchases and keep track of items I like.

#### Acceptance Criteria

1. WHEN a user navigates to the Wishlist_Page, THEN THE Wardrobe_App SHALL display all Wishlist_Items from the Cloud_Database
2. WHEN a user adds a new Wishlist_Item, THEN THE Wardrobe_App SHALL persist the Wishlist_Item with name, category, color, brand, estimated price, and optional image URL to the Cloud_Database
3. WHEN a user marks a Wishlist_Item as purchased, THEN THE Wardrobe_App SHALL remove the Wishlist_Item from the wishlist and optionally create a new Item in the wardrobe
4. WHEN a user deletes a Wishlist_Item, THEN THE Wardrobe_App SHALL remove the Wishlist_Item from the Cloud_Database
5. WHEN displaying a Wishlist_Item, THEN THE Wishlist_Page SHALL show the item name, category, brand, estimated price, and image if available

### Requirement 10: Settings Page

**User Story:** As a user, I want to configure app settings and view my profile, so that I can customize the app behavior and see my account information in one place.

#### Acceptance Criteria

1. WHEN a user navigates to the Settings_Page, THEN THE Wardrobe_App SHALL display available configuration options
2. THE Settings_Page SHALL provide a theme selector with three options: Light, Dark, and True Dark
3. WHEN a user selects a theme, THEN THE Wardrobe_App SHALL apply the theme immediately and persist the preference
4. THE Settings_Page SHALL display a profile section showing wardrobe statistics (total items, items per category)
4. WHERE Firebase Authentication is enabled, THEN THE Settings_Page SHALL display the authenticated user name and email in the profile section
5. WHERE Firebase Authentication is enabled, THEN THE Settings_Page SHALL provide a sign-out option

### Requirement 11: Cross-Device Access and Firebase Configuration

**User Story:** As a user, I want to access my wardrobe from any device with a browser, so that I can check my wardrobe anywhere.

#### Acceptance Criteria

1. THE Wardrobe_App SHALL store all Item data in the Cloud_Database so it is accessible from any device
2. THE Wardrobe_App SHALL store all images in Cloud_Storage so they are accessible from any device
3. THE Wardrobe_App SHALL initialize Firebase with project credentials on startup
4. THE Wardrobe_App SHALL connect to Firestore for Item data persistence
5. THE Wardrobe_App SHALL connect to Firebase Storage for image storage
6. WHERE Firebase Authentication is enabled, THE Wardrobe_App SHALL require user login before accessing wardrobe data

### Requirement 12: Item Data Serialization

**User Story:** As a developer, I want Item data to be reliably serialized and deserialized, so that data integrity is maintained between the app and the Cloud_Database.

#### Acceptance Criteria

1. WHEN an Item is saved to the Cloud_Database, THEN THE Wardrobe_App SHALL serialize the Item into a Firestore-compatible document format
2. WHEN an Item is loaded from the Cloud_Database, THEN THE Wardrobe_App SHALL deserialize the document back into a valid Item object
3. FOR ALL valid Item objects, serializing then deserializing SHALL produce an equivalent Item object (round-trip property)


### Requirement 13: UX Enhancements

**User Story:** As a user, I want polished interactions and helpful feedback, so that the app feels smooth and intuitive to use.

#### Acceptance Criteria

1. WHEN a user clicks an item image, THEN THE Wardrobe_App SHALL display the image in full-screen lightbox mode with zoom capability
2. WHEN viewing an image in lightbox mode, THEN THE user SHALL be able to swipe left/right to view adjacent items' images
3. WHEN a user selects "Duplicate Item" on an Item detail view, THEN THE Wardrobe_App SHALL pre-fill the Item_Form with all field values from the original item and allow editing before saving
4. WHEN a user views the Dashboard_Page, THEN THE Dashboard_Page SHALL display the last 5 recently viewed items with thumbnails
5. WHEN displaying category cards or filter options, THEN THE Wardrobe_App SHALL show item count badges on each option
6. WHEN a user long-presses or swipes an item card, THEN THE Wardrobe_App SHALL display quick action buttons for favorite, worn, and delete
7. WHEN a user deletes an item, THEN THE Wardrobe_App SHALL display a toast notification with an "Undo" button for 5 seconds
8. WHEN a user clicks "Undo" within 5 seconds of deletion, THEN THE Wardrobe_App SHALL restore the deleted item
9. WHEN a page has no items to display, THEN THE Wardrobe_App SHALL show an empty state with a friendly message and suggestions
10. WHEN loading items from the Cloud_Database, THEN THE Wardrobe_App SHALL display skeleton loading placeholders until data is loaded

### Requirement 14: Drag and Drop Reordering

**User Story:** As a user, I want to reorder categories, subcategories, and fields by dragging them, so that I can organize my wardrobe structure intuitively.

#### Acceptance Criteria

1. WHEN a user drags a category card in the CategoryManager, THEN THE Wardrobe_App SHALL allow reordering and update the displayOrder values
2. WHEN a user drags a subcategory in the CategoryManager, THEN THE Wardrobe_App SHALL allow reordering within that category and update displayOrder values
3. WHEN a user drags a field in the FieldDefinitionEditor, THEN THE Wardrobe_App SHALL allow reordering and update displayOrder values
4. WHEN reordering is complete, THEN THE Wardrobe_App SHALL persist the new order to the Cloud_Database
5. WHEN displaying items, THEN THE Wardrobe_App SHALL respect the user-defined order for categories, subcategories, and fields

### Requirement 15: Quick Filters Bar

**User Story:** As a user, I want quick access to common filters via swipeable chips, so that I can rapidly filter my wardrobe without opening menus.

#### Acceptance Criteria

1. WHEN a user views the Wardrobe_Page, THEN THE Wardrobe_App SHALL display a horizontal scrollable quick filters bar with filter chips
2. THE quick filters bar SHALL include chips for: New (added in last 7 days), Favorites, Recently Worn (worn in last 30 days), Needs Cleaning (not cleaned in 60+ days)
3. WHEN a user taps a filter chip, THEN THE chip SHALL toggle active state and filter the item list accordingly
4. WHEN multiple filter chips are active, THEN THE Wardrobe_App SHALL apply filters using AND logic (items must match all active filters)
5. WHEN a user taps an active chip again, THEN THE filter SHALL deactivate and items SHALL refresh

### Requirement 16: Color-Based Filtering

**User Story:** As a user, I want to filter items by color, so that I can quickly find all items in a specific color.

#### Acceptance Criteria

1. WHEN a user views the Wardrobe_Page, THEN THE Wardrobe_App SHALL display a color palette filter showing all colors present in the wardrobe
2. WHEN a user taps a color swatch, THEN THE Wardrobe_App SHALL filter to show only items containing that color
3. WHEN a user taps multiple color swatches, THEN THE Wardrobe_App SHALL show items containing ANY of the selected colors (OR logic)
4. WHEN a user taps an active color swatch again, THEN THE color filter SHALL deactivate
5. THE color palette SHALL display colors sorted by frequency (most common colors first)

### Requirement 17: Item History Timeline

**User Story:** As a user, I want to see a history of actions performed on each item, so that I can track when I added, edited, or wore items.

#### Acceptance Criteria

1. WHEN a user views an Item detail page, THEN THE Wardrobe_App SHALL display a timeline of all actions performed on that item
2. THE timeline SHALL include events: item created, item edited (with field changes), marked as worn, favorited/unfavorited, moved to different category
3. WHEN an item is edited, THEN THE Wardrobe_App SHALL log the timestamp and which fields were changed
4. WHEN an item is marked as worn, THEN THE Wardrobe_App SHALL log the timestamp in the item history
5. THE timeline SHALL display events in reverse chronological order (most recent first)

### Requirement 18: Weather Integration

**User Story:** As a user, I want outfit suggestions based on current weather, so that I can dress appropriately for the conditions.

#### Acceptance Criteria

1. WHEN a user views the Dashboard_Page, THEN THE Wardrobe_App SHALL display current weather conditions (temperature, conditions, forecast)
2. WHEN weather data is available, THEN THE Wardrobe_App SHALL suggest appropriate items based on temperature ranges and conditions
3. FOR temperatures below 10°C, THE Wardrobe_App SHALL suggest items tagged as warm/winter
4. FOR rainy conditions, THE Wardrobe_App SHALL suggest items tagged as waterproof/rain-appropriate
5. THE user SHALL be able to configure their location for weather data in Settings

### Requirement 19: Packing Lists

**User Story:** As a user, I want to create packing lists for trips, so that I can plan what to bring and track what's packed.

#### Acceptance Criteria

1. WHEN a user navigates to a Packing Lists page, THEN THE Wardrobe_App SHALL display all saved packing lists
2. WHEN a user creates a new packing list, THEN THE Wardrobe_App SHALL allow naming the list and adding items from the wardrobe
3. WHEN viewing a packing list, THEN THE user SHALL be able to mark items as packed/unpacked with checkboxes
4. WHEN a user adds an item to a packing list, THEN THE item SHALL remain in the main wardrobe (packing lists are references, not moves)
5. WHEN a user deletes a packing list, THEN THE items SHALL remain in the wardrobe (only the list is deleted)

### Requirement 20: Seasonal Storage

**User Story:** As a user, I want to mark items as in storage, so that I can hide seasonal items from my active wardrobe view.

#### Acceptance Criteria

1. WHEN a user views an Item detail page, THEN THE Wardrobe_App SHALL provide an option to mark the item as "In Storage"
2. WHEN an item is marked as in storage, THEN THE item SHALL be hidden from the default Wardrobe_Page view
3. WHEN a user enables "Show Storage Items" filter, THEN THE Wardrobe_App SHALL display items marked as in storage
4. WHEN a user marks an item as "Back in Rotation", THEN THE item SHALL return to the active wardrobe view
5. THE Dashboard_Page SHALL display a count of items currently in storage

### Requirement 21: Backup and Restore

**User Story:** As a user, I want to export and import my entire wardrobe data, so that I can backup my data or transfer it to another device.

#### Acceptance Criteria

1. WHEN a user navigates to Settings_Page backup section, THEN THE Wardrobe_App SHALL provide an "Export Wardrobe" button
2. WHEN a user taps "Export Wardrobe", THEN THE Wardrobe_App SHALL generate a JSON file containing all items, categories, fields, person measurements, and settings
3. WHEN a user taps "Import Wardrobe", THEN THE Wardrobe_App SHALL allow selecting a JSON backup file
4. WHEN importing a backup, THEN THE Wardrobe_App SHALL display a warning that existing data will be replaced and require confirmation
5. WHEN import is confirmed, THEN THE Wardrobe_App SHALL restore all data from the backup file and sync to Cloud_Database

### Requirement 22: Wardrobe Statistics

**User Story:** As a user, I want to see detailed statistics about my wardrobe, so that I can understand my clothing habits and make informed decisions.

#### Acceptance Criteria

1. WHEN a user views the Dashboard_Page or Settings_Page statistics section, THEN THE Wardrobe_App SHALL display comprehensive wardrobe statistics
2. THE statistics SHALL include: total wardrobe value (sum of all item prices), cost per wear (item price / usageCount), most worn items (top 10 by usageCount)
3. THE statistics SHALL include: least worn items (bottom 10 by usageCount), color distribution chart (pie chart or bar chart), items per category breakdown
4. THE statistics SHALL include: average item age (days since purchase), items added per month (trend chart), storage vs active items ratio
5. WHEN a user taps a statistic, THEN THE Wardrobe_App SHALL navigate to a filtered view showing relevant items

### Requirement 23: Duplicate Detection

**User Story:** As a user, I want to be warned when adding items similar to ones I already own, so that I can avoid buying duplicates.

#### Acceptance Criteria

1. WHEN a user submits the Item_Form to add a new item, THEN THE Wardrobe_App SHALL check for potential duplicates before saving
2. THE duplicate detection SHALL compare: category, subcategory, colors, brand, and name similarity (fuzzy matching)
3. WHEN a potential duplicate is found, THEN THE Wardrobe_App SHALL display a warning dialog showing the similar items with thumbnails
4. THE warning dialog SHALL include options: "Add Anyway", "View Similar Item", or "Cancel"
5. WHEN a user selects "Add Anyway", THEN THE new item SHALL be saved normally


### Requirement 24: Soft Delete and Recently Deleted

**User Story:** As a user, I want deleted items to be moved to a Recently Deleted folder instead of being permanently removed, so that I can recover items if I delete them by mistake and preserve my wardrobe statistics.

#### Acceptance Criteria

1. WHEN a user deletes an item from the wardrobe, THEN THE Wardrobe_App SHALL mark the item as deleted (soft delete) instead of permanently removing it
2. WHEN an item is soft deleted, THEN THE item SHALL be hidden from all normal wardrobe views but remain in the database
3. WHEN a user navigates to Settings_Page, THEN THE Wardrobe_App SHALL display a "Recently Deleted" menu option
4. WHEN a user opens the Recently Deleted page, THEN THE Wardrobe_App SHALL display all soft-deleted items with their deletion dates
5. WHEN a user selects "Restore" on a deleted item, THEN THE Wardrobe_App SHALL unmark the item as deleted and return it to the active wardrobe
6. WHEN a user selects "Delete Permanently" on a deleted item, THEN THE Wardrobe_App SHALL display a warning: "Permanently deleting this item will affect your wardrobe statistics (cost per wear, items added history, etc.). This cannot be undone. Continue?"
7. WHEN a user confirms permanent deletion, THEN THE Wardrobe_App SHALL permanently remove the item from the database and delete the associated image from Cloud_Storage
8. WHEN a user selects multiple items in Recently Deleted and chooses "Delete Permanently", THEN THE Wardrobe_App SHALL display a warning: "Permanently deleting X items will affect your wardrobe statistics. This cannot be undone. Continue?"
9. WHEN a user selects "Empty Recently Deleted", THEN THE Wardrobe_App SHALL display a warning and permanently delete all items in Recently Deleted
10. THE Recently Deleted page SHALL show how long ago each item was deleted (e.g., "Deleted 3 days ago")


### Requirement 25: Ownership Status Tracking

**User Story:** As a user, I want to track the ownership status of my items (owned, rented, borrowed, sold, donated), so that I can manage temporary items and keep a record of items I've parted with.

#### Acceptance Criteria

1. THE Wardrobe_App SHALL include a permanent "Ownership Status" field on all items that cannot be removed
2. THE Ownership Status field SHALL be a dropdown with options: Owned (default), Rented, Borrowed, Sold, Given/Donated
3. WHEN a new item is created, THEN THE Ownership Status SHALL default to "Owned"
4. WHEN displaying items on the Wardrobe_Page, THEN THE Wardrobe_App SHALL hide items with status "Sold" or "Given/Donated" by default
5. WHEN a user enables the "Show Sold/Donated" filter, THEN THE Wardrobe_App SHALL display items with all ownership statuses
6. WHEN calculating wardrobe statistics, THEN THE Wardrobe_App SHALL include sold/donated items in historical data but exclude them from current wardrobe value
7. WHEN an item is marked as Sold or Given/Donated, THEN THE item SHALL remain in the database for statistics but be hidden from active wardrobe views
8. THE Wardrobe_Page filters SHALL include a toggle: "Hide Sold/Donated Items" (enabled by default)


### Requirement 26: Native App Deployment

**User Story:** As a user, I want to download the app from the App Store or Google Play Store, so that I can install it like any other mobile app.

#### Acceptance Criteria

1. THE Wardrobe_App SHALL be packaged as a native iOS app using Capacitor
2. THE Wardrobe_App SHALL be packaged as a native Android app using Capacitor
3. THE native apps SHALL have access to device camera for photo capture
4. THE native apps SHALL have access to device photo gallery for image selection
5. THE native apps SHALL support offline functionality with data sync when online
6. THE native apps SHALL include proper app icons, splash screens, and metadata for app stores
7. THE iOS app SHALL be submitted to Apple App Store with all required assets and compliance
8. THE Android app SHALL be submitted to Google Play Store with all required assets and compliance
