# Implementation Plan: Wardrobe Manager Advanced Features

## Overview

This implementation plan extends the existing Wardrobe Manager application with advanced features. All tasks build on top of the existing architecture from the wardrobe-manager spec. The implementation follows an incremental approach, adding features in logical groups and validating each addition before proceeding.

## Tasks

- [ ] 1. Extend data models and add permanent fields
  - [ ] 1.1 Extend Item interface with tags, usageCount, and lastWornDate
    - Add tags: string[] field to Item interface
    - Add usageCount: number field (default 0)
    - Add lastWornDate: Date | null field (default null)
    - _Requirements: 1.4, 3.3, 3.5_
  
  - [ ] 1.2 Create Tag and Outfit interfaces
    - Define Tag interface with name, isPreset, createdAt
    - Define Outfit interface with id, name, itemIds, tags, usageCount, lastWornDate, timestamps
    - _Requirements: 1.3, 8.2_
  
  - [ ] 1.3 Add permanent fields to global field configuration
    - Add Value_Bought (number, optional) to global fields
    - Add Care_Instructions (long_text, optional) to global fields
    - Add Notes (long_text, optional) to global fields
    - Mark all three as permanent (cannot be deleted)
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ]* 1.4 Write property test for new item initialization
    - **Property 5: New items initialize usage tracking**
    - **Validates: Requirements 3.3**

- [ ] 2. Implement Tag System
  - [ ] 2.1 Create TagService with CRUD operations
    - Implement getAllTags, getPresetTags, createCustomTag
    - Implement getItemsByTag, getItemsByTags (OR logic)
    - Add preset tags: sport, office, casual, formal, summer, winter, rain, travel, party, comfortable, vacation
    - _Requirements: 1.2, 1.3, 1.5_
  
  - [ ] 2.2 Create TagInput component
    - Multi-select input with autocomplete
    - Display preset and custom tags
    - Allow creating new tags by typing
    - Show selected tags as removable chips
    - _Requirements: 1.1, 1.3_
  
  - [ ] 2.3 Create TagFilter component for WardrobePage
    - Display all available tags with counts
    - Support multi-select with OR logic
    - Integrate with existing filter system
    - _Requirements: 1.5, 9.1_
  
  - [ ]* 2.4 Write property test for custom tag creation
    - **Property 1: Custom tag creation and availability**
    - **Validates: Requirements 1.3**
  
  - [ ]* 2.5 Write property test for tag storage
    - **Property 2: Tag storage completeness**
    - **Validates: Requirements 1.4**
  
  - [ ]* 2.6 Write property test for tag filtering
    - **Property 3: Tag filter returns matching items**
    - **Validates: Requirements 1.5, 9.3**

- [ ] 3. Extend ItemForm and ItemDetailView with tags
  - [ ] 3.1 Add TagInput to ItemForm
    - Integrate TagInput component into form
    - Handle tag selection and creation
    - Persist tags with item data
    - _Requirements: 1.1, 1.4_
  
  - [ ] 3.2 Display tags on WardrobePage item cards
    - Show tags as chips on item cards
    - Style tags consistently with design
    - _Requirements: 1.6_
  
  - [ ] 3.3 Display tags on ItemDetailView
    - Show tags prominently in detail view
    - Allow editing tags from detail view
    - _Requirements: 1.6_

- [ ] 4. Implement Usage Tracking
  - [ ] 4.1 Create WornThisWeekButton component
    - Button with visual feedback (checkmark animation)
    - Debounce to prevent duplicate clicks
    - Display current usageCount and lastWornDate
    - _Requirements: 3.1, 3.2_
  
  - [ ] 4.2 Add markItemWorn method to FirestoreService
    - Increment usageCount by 1
    - Update lastWornDate to current date
    - Return updated item
    - _Requirements: 3.2, 3.5_
  
  - [ ] 4.3 Integrate WornThisWeekButton into ItemDetailView
    - Add button below item image
    - Wire up to markItemWorn service method
    - Update UI after successful update
    - _Requirements: 3.1, 3.4_
  
  - [ ]* 4.4 Write property test for usage tracking increment
    - **Property 4: Usage tracking increments correctly**
    - **Validates: Requirements 3.2**
  
  - [ ]* 4.5 Write property test for usage tracking persistence
    - **Property 6: Usage tracking persistence**
    - **Validates: Requirements 3.5**

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement Analytics Service and Dashboard Insights
  - [ ] 6.1 Create AnalyticsService
    - Implement calculateWardrobeStatistics
    - Implement getUsageInsights (most worn, least worn, unworn)
    - Implement getMostWornItems with tiebreaker logic
    - Implement getLeastWornItems with tiebreaker logic
    - Implement getUnwornItems with date threshold
    - Implement calculateCostPerWear
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
  
  - [ ] 6.2 Create DashboardInsightsWidget component
    - Display total wardrobe value
    - Display wardrobe statistics (total items, avg cost per item, avg cost per wear)
    - Display most worn items (top 5)
    - Display least worn items (bottom 5)
    - Display unworn items (not worn in 6 months)
    - Handle edge cases (zero items, no values, all unworn)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ] 6.3 Integrate DashboardInsightsWidget into DashboardPage
    - Add widget to dashboard layout
    - Load items and compute statistics
    - Update on item changes
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ]* 6.4 Write property test for wardrobe value calculation
    - **Property 7: Wardrobe value calculation**
    - **Validates: Requirements 4.1**
  
  - [ ]* 6.5 Write property test for most worn items sorting
    - **Property 8: Most worn items sorting**
    - **Validates: Requirements 4.2, 11.5**
  
  - [ ]* 6.6 Write property test for least worn items sorting
    - **Property 9: Least worn items sorting**
    - **Validates: Requirements 4.3**
  
  - [ ]* 6.7 Write property test for unworn items filtering
    - **Property 10: Unworn items filtering**
    - **Validates: Requirements 4.4**
  
  - [ ]* 6.8 Write property test for wardrobe statistics calculation
    - **Property 11: Wardrobe statistics calculation**
    - **Validates: Requirements 4.5, 4.6, 4.7**

- [ ] 7. Implement Notification and Reminder System
  - [ ] 7.1 Create NotificationService
    - Implement getActiveReminders
    - Implement createUnwornReminder, createSeasonalReminder, createMaintenanceReminder
    - Implement dismissReminder with 30-day duration
    - Implement sendBrowserNotification
    - Implement requestNotificationPermission
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ] 7.2 Create RemindersWidget component
    - Display unworn items reminder
    - Display seasonal rotation suggestions
    - Display maintenance reminders
    - Support dismissing reminders
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ] 7.3 Integrate RemindersWidget into DashboardPage
    - Add widget to dashboard layout
    - Load and display active reminders
    - Handle reminder dismissal
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ] 7.4 Implement browser notification support
    - Request permission on app load
    - Send notifications for unworn items and maintenance
    - Handle permission denied gracefully
    - _Requirements: 5.4_
  
  - [ ]* 7.5 Write property test for reminder dismissal duration
    - **Property 12: Reminder dismissal duration**
    - **Validates: Requirements 5.5**
  
  - [ ]* 7.6 Write property test for seasonal reminder filtering
    - **Property 13: Seasonal reminder filtering**
    - **Validates: Requirements 5.2**
  
  - [ ]* 7.7 Write property test for maintenance reminder filtering
    - **Property 14: Maintenance reminder filtering**
    - **Validates: Requirements 5.3, 7.5**

- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement Export Service
  - [ ] 9.1 Create ExportService with JSON export
    - Implement exportToJSON with all item fields
    - Include tags, usageCount, lastWornDate, all field values
    - Generate structured JSON with metadata
    - _Requirements: 6.4, 12.1_
  
  - [ ] 9.2 Implement CSV export
    - Generate CSV with column per field definition
    - Include tags as comma-separated values in cell
    - Handle special characters and encoding
    - _Requirements: 6.5, 12.2_
  
  - [ ] 9.3 Implement PDF export
    - Use jsPDF library
    - Include item images and all field values
    - Add header with wardrobe statistics
    - Handle page breaks
    - _Requirements: 6.2, 12.3_
  
  - [ ] 9.4 Implement images export
    - Use HTML Canvas API
    - Create grid layout (3 columns)
    - Include only items with images
    - Export as PNG
    - _Requirements: 6.3, 12.4_
  
  - [ ] 9.5 Implement shareItem function
    - Generate composite image with photo and text
    - Include item name, category, tags, key fields
    - Export as PNG with item name as filename
    - _Requirements: 6.1_
  
  - [ ] 9.6 Implement triggerDownload utility
    - Create blob URL and trigger download
    - Set appropriate filename and extension
    - Clean up blob URL after download
    - _Requirements: 6.6_
  
  - [ ]* 9.7 Write property test for JSON export completeness
    - **Property 15: JSON export completeness**
    - **Validates: Requirements 6.4, 12.1**
  
  - [ ]* 9.8 Write property test for CSV export structure
    - **Property 16: CSV export structure**
    - **Validates: Requirements 6.5, 12.2**
  
  - [ ]* 9.9 Write property test for image export filtering
    - **Property 17: Image export filtering**
    - **Validates: Requirements 12.4**
  
  - [ ]* 9.10 Write property test for JSON export/import round-trip
    - **Property 26: JSON export/import round-trip**
    - **Validates: Requirements 12.5**

- [ ] 10. Create Export UI Components
  - [ ] 10.1 Create ExportMenu component
    - Dropdown menu with export options
    - Options: PDF, Images, JSON, CSV
    - Trigger appropriate export function
    - Show loading state during export
    - _Requirements: 6.2, 6.3, 6.4, 6.5_
  
  - [ ] 10.2 Create ShareItemDialog component
    - Modal dialog for sharing item
    - Generate composite image
    - Trigger download
    - Show preview before download
    - _Requirements: 6.1_
  
  - [ ] 10.3 Integrate ExportMenu into SettingsPage
    - Add export section to settings
    - Wire up to ExportService
    - Handle export errors
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [ ] 10.4 Integrate ShareItemDialog into ItemDetailView
    - Add share button to detail view
    - Open dialog on click
    - Handle share errors
    - _Requirements: 6.1_

- [ ] 11. Implement Outfit System
  - [ ] 11.1 Create OutfitService
    - Implement getOutfits, getOutfit, createOutfit, updateOutfit, deleteOutfit
    - Implement markOutfitWorn (increments outfit and item usageCounts)
    - Implement removeItemFromOutfits (removes item reference)
    - Implement deleteEmptyOutfits (cleanup)
    - Implement getOutfitItems (resolves item references)
    - _Requirements: 8.2, 8.6, 8.7, 8.8, 8.9_
  
  - [ ] 11.2 Create OutfitCreator component
    - Multi-step form for creating outfits
    - Item selection with thumbnails (multi-select)
    - Outfit name input
    - Optional outfit-level tags
    - Save to Presets
    - _Requirements: 8.1, 8.2_
  
  - [ ] 11.3 Create OutfitView component
    - Display all items in outfit with thumbnails
    - Show outfit usageCount and lastWornDate
    - Add WornThisWeekButton for outfits
    - Handle missing items gracefully
    - _Requirements: 8.4, 8.5, 8.6_
  
  - [ ] 11.4 Extend PresetPage to display outfits
    - Show both individual presets and outfit presets
    - Outfit cards show multiple item thumbnails
    - Clicking outfit opens OutfitView
    - _Requirements: 8.3, 8.4_
  
  - [ ] 11.5 Implement outfit item deletion cascade
    - Hook into item deletion to call removeItemFromOutfits
    - Call deleteEmptyOutfits after removal
    - _Requirements: 8.8, 8.9_
  
  - [ ]* 11.6 Write property test for outfit creation
    - **Property 18: Outfit creation with item references**
    - **Validates: Requirements 8.2**
  
  - [ ]* 11.7 Write property test for outfit worn cascade
    - **Property 19: Outfit worn cascades to items**
    - **Validates: Requirements 8.6, 8.7**
  
  - [ ]* 11.8 Write property test for item deletion from outfits
    - **Property 20: Item deletion removes from outfits**
    - **Validates: Requirements 8.8**
  
  - [ ]* 11.9 Write property test for empty outfit deletion
    - **Property 21: Empty outfits are deleted**
    - **Validates: Requirements 8.9**

- [ ] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement Combined Filtering
  - [ ] 13.1 Extend WardrobePage filter logic
    - Combine tag filters with category and favorite filters (AND logic)
    - Combine tag filters with text search (AND logic)
    - Multiple selected tags use OR logic
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [ ] 13.2 Add clear all filters functionality
    - Clear button that resets all filters
    - Show all items when cleared
    - _Requirements: 9.4_
  
  - [ ]* 13.3 Write property test for combined filter logic
    - **Property 22: Combined filter logic**
    - **Validates: Requirements 9.1, 9.2**
  
  - [ ]* 13.4 Write property test for clear all filters
    - **Property 23: Clear all filters shows all items**
    - **Validates: Requirements 9.4**

- [ ] 14. Extend Serialization for New Data Models
  - [ ] 14.1 Extend ItemSerializer for tags
    - Implement serializeTags and deserializeTags
    - Validate tags are non-empty strings
    - Handle missing tags field (default to empty array)
    - _Requirements: 10.1, 10.2_
  
  - [ ] 14.2 Extend ItemSerializer for usage tracking
    - Serialize usageCount as number
    - Serialize lastWornDate as ISO string or null
    - Deserialize with defaults (0 and null)
    - _Requirements: 3.5, 10.1, 10.2_
  
  - [ ] 14.3 Implement Outfit serialization
    - Implement serializeOutfit and deserializeOutfit
    - Handle itemIds array
    - Handle outfit tags and usage tracking
    - _Requirements: 10.3, 10.4_
  
  - [ ]* 14.4 Write property test for item tags round-trip
    - **Property 24: Item serialization round-trip with tags**
    - **Validates: Requirements 10.1, 10.2, 10.5**
  
  - [ ]* 14.5 Write property test for outfit round-trip
    - **Property 25: Outfit serialization round-trip**
    - **Validates: Requirements 10.3, 10.4, 10.6**

- [ ] 15. Add Optional Field Templates
  - [ ] 15.1 Add Last_Cleaned_Date field template
    - Add to optional field templates list
    - Configure as date field type
    - Make available in field configuration UI
    - _Requirements: 7.1, 7.2_
  
  - [ ] 15.2 Update FieldDefinitionEditor to show permanent fields
    - Display "Permanent" badge on permanent fields
    - Disable delete button for permanent fields
    - Show permanent fields at top of list
    - _Requirements: 2.4_

- [ ] 16. Update Settings Page
  - [ ] 16.1 Add notification preferences section
    - Toggle for enabling/disabling browser notifications
    - Show current permission status
    - Request permission button if not granted
    - _Requirements: 5.4_
  
  - [ ] 16.2 Integrate ExportMenu into Settings
    - Add export section with all export options
    - Wire up to ExportService
    - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 17. Final Integration and Polish
  - [ ] 17.1 Update Firestore collections structure
    - Add /outfits collection
    - Add /tags collection
    - Add /reminders collection
    - Update /items documents with new fields
    - _Requirements: All_
  
  - [ ] 17.2 Add loading states and error handling
    - Loading spinners for exports
    - Error toasts for failed operations
    - Retry buttons for failed exports
    - Graceful degradation for missing data
    - _Requirements: All_
  
  - [ ] 17.3 Update existing components to handle new fields
    - Ensure ItemForm displays permanent fields
    - Ensure ItemDetailView shows tags and usage data
    - Ensure WardrobePage filters work with tags
    - _Requirements: All_
  
  - [ ]* 17.4 Write integration tests
    - Test tag filtering with category filters
    - Test outfit creation and display flow
    - Test export functions end-to-end
    - Test reminder generation and dismissal

- [ ] 18. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- All features build on top of existing wardrobe-manager architecture
- Permanent fields (Value Bought, Care Instructions, Notes) cannot be removed but are optional to fill
- Tags are separate from categories and support multi-select with OR logic
- Outfits extend the Presets system and cascade usage tracking to individual items
