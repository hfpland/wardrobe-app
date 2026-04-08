# Design Document: Wardrobe Manager

## Overview

The Wardrobe Manager is a React web application with a mobile-first design for managing a personal clothing wardrobe. The app uses Firebase (Firestore + Storage) as its backend, enabling cross-device access through any browser.

The core architectural principle is a **field-driven data model**: every piece of item data is defined by configurable `Field_Definition` records. The app ships with rich defaults (categories, subcategories, fields like name, colors, material, measurements, fit type, etc.), but these are simply pre-configured entries in the same customizable system — there are no hardcoded "standard" fields. Users can add, edit, or delete any category, subcategory, or field through Settings.

Key capabilities include:
- Dynamic form generation from field configurations
- Measurement fields supporting single values or min–max ranges with units (cm/inches)
- Fit comparison: items vs. similar items in the same category/subcategory, and items vs. the user's body measurements
- Fit confidence (Exact, Approximate, Flexible) and material stretch tracking
- Image capture/upload via Firebase Storage
- Five-tab bottom navigation: Wardrobe, Presets, Dashboard (default), Wishlist, Settings

## Architecture

The application follows a component-based React architecture with a clear separation between UI, state management, data access, and configuration layers.

```mermaid
graph TD
    subgraph UI Layer
        SP[Splash Screen]
        BN[Bottom Nav]
        DP[Dashboard Page]
        ACP[Add Clothing Page]
        WP[Wardrobe Page]
        PP[Preset Page]
        WLP[Wishlist Page]
        SEP[Settings Page]
        IF[Item Form - Dynamic]
        IU[Image Uploader]
    end

    subgraph State Layer
        IS[Item Store]
        CS[Config Store - Categories/Fields]
        PS[Person Measurements Store]
        WLS[Wishlist Store]
    end

    subgraph Services Layer
        FCS[Firestore Service]
        FSS[Firebase Storage Service]
        FC[Fit Comparator]
        SER[Serializer]
    end

    subgraph Firebase
        FS[(Firestore DB)]
        FST[(Firebase Storage)]
    end

    DP --> IS
    ACP --> IF
    IF --> CS
    IF --> IS
    IF --> IU
    WP --> IS
    WP --> FC
    PP --> IS
    WLP --> WLS
    SEP --> CS
    SEP --> PS

    IS --> FCS
    CS --> FCS
    PS --> FCS
    WLS --> FCS
    IU --> FSS

    FCS --> SER
    SER --> FS
    FSS --> FST
    FC --> IS
    FC --> PS
end
```

### Technology Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 18+ with TypeScript |
| Routing | React Router v6 |
| State Management | React Context + useReducer (or Zustand for simplicity) |
| Styling | Tailwind CSS (mobile-first) |
| Backend | Firebase (Firestore, Storage, optional Auth) |
| Native Wrapper | Capacitor (for iOS/Android app store deployment) |
| Build Tool | Vite |
| Testing | Vitest + fast-check (property-based testing) |

### Data Flow

1. **App Launch**: Splash screen → load config (categories, fields) from Firestore → navigate to Dashboard
2. **Add Item**: User selects category/subcategory → Item_Form dynamically renders fields from config → user fills fields → serialize → persist to Firestore
3. **View/Filter Items**: Load items from Firestore → deserialize → display with filters/search
4. **Fit Comparison**: Load items in same category/subcategory → extract measurement fields → compare against target item or person measurements → display comparison results
5. **Settings Changes**: User edits categories/fields/person measurements → persist config to Firestore → all forms and displays update reactively

## Components and Interfaces

### Core UI Components

**SplashScreen**: Displays app logo and name, auto-navigates to Dashboard after a brief delay.

**BottomNav**: Fixed bottom navigation bar with 5 tabs. Highlights active tab. Always visible on main pages.

**DashboardPage**: Shows wardrobe summary (total items, breakdown by category), quick links to Add, Presets, and Wardrobe pages.

**ItemForm**: The central dynamic form component. Given a category and subcategory, it reads the associated `Field_Definition[]` from config and renders the appropriate input for each field type. Handles validation (required fields), fit confidence, material stretch, and measurement inputs. Displays a heart icon in the bottom-right corner below the image uploader that can be tapped to toggle favorite status (filled heart when favorited, outline when not). The "Name" field is always required and cannot be removed from the field configuration.

**ItemFormField**: Renders a single field based on its `Field_Type`:
- `short_text` → text input
- `long_text` → textarea
- `number` → number input
- `color` → color picker with eyedropper API + square swatch preview
- `dropdown` → select element
- `multi_select` → multi-select chips/checkboxes
- `boolean` → toggle switch
- `date` → date picker
- `measurement` → measurement input (single value or min–max range toggle, unit selector)

**MeasurementInput**: Specialized input for measurement fields. Supports:
- Single value mode: one numeric input + unit dropdown (cm, inches)
- Range mode: min and max numeric inputs + unit dropdown
- Toggle between single and range mode

**ColorPicker**: Color input with eyedropper API support (where available) and a square color swatch preview. Supports selecting multiple colors.

**ImageUploader**: Handles photo capture (camera) and gallery selection. Shows upload progress. Returns the Cloud_Storage URL on success.

**WardrobePage**: Lists all items with thumbnail, name, category, colors, material. Supports category filter dropdown, text search, favorite filter, and sorting options. Clicking an item shows full details. Includes multi-select mode with "Select All" / "Deselect All" buttons. When items are selected, displays BulkOperationsToolbar with bulk action options.

**Browse Mode Toggle**: Switch between two navigation modes:
1. **Show All** (default): Flat list of all items with filters and search
2. **Show Categories**: Hierarchical category/subcategory browse mode

**Show Categories Mode**:
- Displays 2-column grid of category cards (2 per row, continues vertically)
- Each card shows: representative item thumbnail + category name
- Clicking a category navigates to subcategory grid for that category
- Subcategory grid shows 2-column layout with:
  - First card (top-left position): "All {CategoryName}" (shows all items in category regardless of subcategory)
  - Remaining cards: subcategory cards with thumbnail + subcategory name
- Clicking a subcategory (or "All {CategoryName}") navigates to item list filtered to that selection
- Breadcrumb navigation: Home > Category > Subcategory

**Filter Options**:
- Category filter dropdown (in Show All mode)
- Favorite filter toggle: All Items / Favorites Only

**Sort Options** (dropdown):
- Newest First (default): Sort by createdAt descending
- Oldest First: Sort by createdAt ascending
- Most Used: Sort by usageCount descending (tracks how many times item has been worn/used)
- Least Used: Sort by usageCount ascending
- Random: Shuffles items on page load, order persists when navigating to/from item detail view (stored in component state)

**ItemDetailView**: Full item detail display including all field values and full-size image. Displays a heart icon in the bottom-right corner below the image that can be tapped to toggle favorite status (filled heart when favorited, outline when not). Provides edit and delete actions.

**PresetPage**: Lists preset item templates. One-click add to wardrobe, with option to edit before/after saving.

**WishlistPage**: Lists wishlist items. Supports add, delete, and "mark as purchased" (which optionally creates a wardrobe item).

**SettingsPage**: Sections for:
- Profile & statistics
- Person measurements (body measurement profile)
- Category management (add/edit/delete categories and subcategories)
- Field management (add/edit/delete field definitions per category/subcategory)
- Theme selector (Light / Dark / True Dark)
- Auth (sign out, if enabled)

**PersonMeasurementsEditor**: Form for entering/editing the user's body measurements. Each measurement is a labeled value with a unit. Measurements are stored in the user's profile.

**CategoryManager**: UI for managing categories and subcategories. Supports add, edit, delete, reorder. Before editing or deleting a category/subcategory that has items using it, displays a warning dialog showing the number of affected items and asking for confirmation. When a category is deleted, all items in that category are moved to a special "Uncategorized" category (auto-created if needed). When a subcategory is deleted, items are moved to an "Uncategorized {CategoryName}" subcategory within the same parent category (auto-created if needed).

**FieldDefinitionEditor**: UI for managing field definitions on a category or subcategory. Supports configuring label, field type, required flag, default value, dropdown options, display order. Before editing or deleting a field definition that has items using it, displays a warning dialog showing the number of affected items and asking for confirmation. When a field definition is deleted, the field values are removed from all items' fieldValues map, but items remain intact. The "Name", "Image", "Favorite", and "Ownership Status" fields are system fields and cannot be edited or deleted.

**Optional Field Templates**: When adding a new field, users can choose from preset field templates (not added by default, only available as quick-add options):
- Occasion (dropdown: Casual/Formal/Business/Sport/Party/Wedding/Travel)
- Time Made (date: when the item was manufactured)
- Value Bought (number: purchase price)
- Bought In (short_text: store/shop name where purchased)
- Bought At (short_text: location/city where purchased)

Users can select a template to auto-fill the field configuration, or create a completely custom field from scratch.

**BulkOperationsToolbar**: Action bar displayed on WardrobePage when items are selected. Shows count of selected items and provides bulk action buttons: Bulk Delete and Bulk Move. Appears above the item list when selection mode is active.

**Bulk Move Field Handling**: When items are moved to a different category/subcategory with different field definitions, all existing field values are preserved in the item's fieldValues map. Fields that don't exist in the target category/subcategory are hidden in the UI but data is retained. If an item is moved back to a category that has those fields, the hidden data reappears. This prevents data loss and makes moves reversible.

**ItemCard**: Individual item card component with optional checkbox for multi-select mode. Displays thumbnail, name, category, colors, and material. Checkbox appears in top-left corner when selection mode is active. Heart icon appears in bottom-right corner below thumbnail to toggle favorite status (filled when favorited, outline when not).

**FitComparisonView**: Displays comparison results between an item's measurements and either the user's body measurements or other items in the same category/subcategory. Shows per-measurement deltas and an overall fit assessment.

**ImageLightbox**: Full-screen modal for viewing item images. Supports pinch-to-zoom, swipe left/right to navigate between adjacent items' images, and tap-to-close. Displays on top of all other content with dark overlay background.

**DuplicateItemButton**: Action button on ItemDetailView that creates a copy of the current item. Opens ItemForm pre-filled with all field values from the original item, allowing user to edit before saving. Useful for adding similar items quickly.

**RecentlyViewedWidget**: Dashboard component displaying the last 5 recently viewed items with thumbnails and names. Clicking an item navigates to its detail view. Tracks view history in component state or local storage.

**CountBadge**: Small circular badge displaying a number, used on category cards and filter options to show item counts. Positioned in top-right corner of cards or inline with filter labels.

**QuickActionsMenu**: Context menu triggered by long-press or swipe gesture on item cards. Displays quick action buttons for: toggle favorite (heart icon), mark as worn (checkmark icon), and delete (trash icon). Closes on action or tap outside.

**UndoToast**: Temporary notification displayed at bottom of screen after item deletion. Shows message "Item deleted" with an "Undo" button. Visible for 5 seconds, then auto-dismisses. If user taps "Undo" within 5 seconds, restores the deleted item.

**EmptyState**: Placeholder component displayed when a page or list has no items. Shows friendly icon, message, and helpful suggestions. Examples: "No items in your wardrobe yet. Add your first item!" or "No favorites yet. Tap the heart icon on items you love."

**SkeletonLoader**: Loading placeholder component that displays while data is being fetched from Firestore. Shows gray animated rectangles in the shape of item cards, matching the current view mode (list/grid). Improves perceived performance.

**DragDropManager**: Utility component for handling drag-and-drop reordering of categories, subcategories, and fields. Uses HTML5 drag-and-drop API or touch-friendly library. Updates displayOrder values and persists changes to Firestore.

**QuickFiltersBar**: Horizontal scrollable bar with filter chips displayed at top of WardrobePage. Includes preset filters: New (last 7 days), Favorites, Recently Worn (last 30 days), Needs Cleaning (60+ days). Chips toggle on/off, multiple can be active simultaneously (AND logic).

**ColorPaletteFilter**: Visual color filter showing all colors present in wardrobe as swatches. Colors sorted by frequency. Clicking swatches filters items containing those colors (OR logic for multiple selections). Displays color hex codes on hover.

**ItemHistoryTimeline**: Timeline component on ItemDetailView showing chronological history of item actions: created, edited (with field change details), worn, favorited/unfavorited, moved between categories. Events displayed in reverse chronological order with timestamps and icons.

**WeatherWidget**: Dashboard component displaying current weather (temperature, conditions, forecast) and suggesting appropriate items based on weather. Integrates with weather API (OpenWeatherMap or similar). User configures location in Settings.

**PackingListManager**: Page component for creating and managing packing lists. Lists contain references to wardrobe items (not moves). Each item has packed/unpacked checkbox. Lists can be created, edited, deleted. Items remain in wardrobe when list is deleted.

**StorageToggle**: Toggle control on ItemDetailView to mark items as "In Storage". Stored items hidden from default wardrobe view unless "Show Storage Items" filter is enabled. Dashboard shows count of items in storage.

**BackupExportImport**: Settings section with Export/Import buttons. Export generates JSON file with all wardrobe data (items, categories, fields, measurements, settings, images as URLs). Import reads JSON and restores data with confirmation warning. Syncs to Firestore after import.

**StatisticsPanel**: Comprehensive statistics display on Dashboard or Settings. Shows: total wardrobe value, cost per wear, most/least worn items (top/bottom 10), color distribution chart, items per category, average item age, items added per month trend, storage vs active ratio. Clicking stats navigates to filtered views.

**DuplicateDetectionDialog**: Warning dialog shown when adding items similar to existing ones. Compares category, subcategory, colors, brand, name (fuzzy matching). Shows thumbnails of similar items. Options: "Add Anyway", "View Similar Item", "Cancel".

**RecentlyDeletedPage**: Settings page showing all soft-deleted items with deletion timestamps. Displays items in grid/list view with "Deleted X days ago" labels. Provides per-item actions: "Restore" (unmarks as deleted, returns to wardrobe) and "Delete Permanently" (shows warning about statistics impact, then hard deletes). Includes "Empty Recently Deleted" button for bulk permanent deletion with warning dialog. Soft-deleted items are excluded from all normal wardrobe views but included in historical statistics calculations.

### Service Interfaces

```typescript
// --- Field & Config Types ---

type FieldType =
  | "short_text"
  | "long_text"
  | "number"
  | "color"
  | "dropdown"
  | "multi_select"
  | "boolean"
  | "date"
  | "measurement";

interface FieldDefinition {
  id: string;
  label: string;
  fieldType: FieldType;
  required: boolean;
  defaultValue?: FieldValue;
  options?: string[];          // for dropdown / multi_select
  displayOrder: number;
  unit?: string;               // default unit for measurement fields
}

interface Category {
  id: string;
  name: string;
  displayOrder: number;
  fields: FieldDefinition[];   // fields that apply to all items in this category
  subcategories: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  displayOrder: number;
  fields: FieldDefinition[];   // additional fields specific to this subcategory
}

// --- Field Values ---

interface MeasurementValue {
  type: "single" | "range";
  value?: number;              // for single
  min?: number;                // for range
  max?: number;                // for range
  unit: "cm" | "inches";
}

type FieldValue =
  | string
  | number
  | boolean
  | string[]                   // multi_select or multiple colors
  | MeasurementValue
  | null;

// --- Item ---

interface Item {
  id: string;
  categoryId: string;
  subcategoryId?: string;
  imageUrl?: string;
  fieldValues: Record<string, FieldValue>;  // fieldDefinitionId → value
  isFavorite: boolean;                      // favorite status, toggled via heart icon
  usageCount: number;                       // tracks how many times item has been worn/used
  fitConfidence: "exact" | "approximate" | "flexible";
  materialStretch: boolean;
  inStorage: boolean;                       // true if item is in seasonal storage
  isDeleted: boolean;                       // true if item is soft-deleted (in Recently Deleted)
  deletedAt?: Date;                         // timestamp when item was soft-deleted
  createdAt: Date;
  updatedAt: Date;
  lastWornAt?: Date;                        // timestamp of last time item was worn
}

// --- Item History ---

type ItemActionType = 
  | "created"
  | "edited"
  | "worn"
  | "favorited"
  | "unfavorited"
  | "moved"
  | "storage_in"
  | "storage_out";

interface ItemAction {
  type: ItemActionType;
  timestamp: Date;
  details?: Record<string, unknown>;  // e.g., { changedFields: ["color", "brand"], fromCategory: "tops", toCategory: "bottoms" }
}

interface ItemHistoryEvent {
  id: string;
  itemId: string;
  action: ItemAction;
}

// --- Packing Lists ---

interface PackingListItem {
  itemId: string;
  isPacked: boolean;
}

interface PackingList {
  id: string;
  name: string;
  items: PackingListItem[];
  createdAt: Date;
  updatedAt: Date;
}

// --- Backup ---

interface WardrobeBackup {
  version: string;
  exportedAt: Date;
  items: Item[];
  categories: Category[];
  personProfile: PersonProfile;
  wishlistItems: WishlistItem[];
  presetItems: PresetItem[];
  settings: Record<string, unknown>;
}

// --- Wishlist Item ---

interface WishlistItem {
  id: string;
  categoryId: string;
  subcategoryId?: string;
  imageUrl?: string;
  fieldValues: Record<string, FieldValue>;
  createdAt: Date;
}

// --- Preset Item ---

interface PresetItem {
  id: string;
  name: string;
  categoryId: string;
  subcategoryId?: string;
  imageUrl?: string;
  fieldValues: Record<string, FieldValue>;
}

// --- Person Measurements ---

interface PersonMeasurement {
  id: string;
  label: string;               // e.g., "Chest", "Waist", "Wrist"
  value: MeasurementValue;
}

interface PersonProfile {
  measurements: PersonMeasurement[];
  updatedAt: Date;
}

// --- Fit Comparison ---

interface MeasurementComparison {
  fieldLabel: string;
  itemValue: MeasurementValue;
  referenceValue: MeasurementValue;
  deltaMin: number;            // difference at the low end
  deltaMax: number;            // difference at the high end
  withinRange: boolean;
}

interface FitComparisonResult {
  comparisons: MeasurementComparison[];
  overallFit: "too_small" | "good_fit" | "too_large" | "mixed";
}

// --- Services ---

interface FirestoreService {
  getItems(): Promise<Item[]>;
  getItem(id: string): Promise<Item | null>;
  createItem(item: Omit<Item, "id" | "createdAt" | "updatedAt">): Promise<Item>;
  updateItem(id: string, updates: Partial<Item>): Promise<Item>;
  deleteItem(id: string): Promise<void>;
  toggleFavorite(id: string): Promise<Item>;  // toggles isFavorite and returns updated item
  bulkDeleteItems(ids: string[]): Promise<void>;
  bulkMoveItems(ids: string[], categoryId: string, subcategoryId?: string): Promise<void>;

  getWishlistItems(): Promise<WishlistItem[]>;
  createWishlistItem(item: Omit<WishlistItem, "id" | "createdAt">): Promise<WishlistItem>;
  deleteWishlistItem(id: string): Promise<void>;

  getCategories(): Promise<Category[]>;
  saveCategories(categories: Category[]): Promise<void>;
  ensureUncategorizedCategory(): Promise<string>;  // returns categoryId
  ensureUncategorizedSubcategory(categoryId: string, categoryName: string): Promise<string>;  // returns subcategoryId

  getPersonProfile(): Promise<PersonProfile>;
  savePersonProfile(profile: PersonProfile): Promise<void>;

  getPresetItems(): Promise<PresetItem[]>;
  createPresetItem(item: Omit<PresetItem, "id">): Promise<PresetItem>;

  // Impact detection for safety warnings
  countItemsByCategory(categoryId: string): Promise<number>;
  countItemsBySubcategory(categoryId: string, subcategoryId: string): Promise<number>;
  countItemsUsingField(fieldId: string): Promise<number>;
  countSubcategoriesByCategory(categoryId: string): Promise<number>;

  // Item history tracking
  logItemAction(itemId: string, action: ItemAction): Promise<void>;
  getItemHistory(itemId: string): Promise<ItemHistoryEvent[]>;

  // Packing lists
  getPackingLists(): Promise<PackingList[]>;
  createPackingList(list: Omit<PackingList, "id" | "createdAt">): Promise<PackingList>;
  updatePackingList(id: string, updates: Partial<PackingList>): Promise<PackingList>;
  deletePackingList(id: string): Promise<void>;

  // Storage management
  toggleStorage(id: string): Promise<Item>;  // toggles inStorage and returns updated item

  // Soft delete and recovery
  softDeleteItem(id: string): Promise<Item>;  // marks item as deleted, sets deletedAt
  restoreItem(id: string): Promise<Item>;     // unmarks item as deleted, clears deletedAt
  getDeletedItems(): Promise<Item[]>;         // returns all soft-deleted items
  permanentlyDeleteItem(id: string): Promise<void>;  // hard delete from database
  bulkPermanentlyDeleteItems(ids: string[]): Promise<void>;  // hard delete multiple items
  emptyRecentlyDeleted(): Promise<void>;      // permanently delete all soft-deleted items

  // Backup/restore
  exportWardrobe(): Promise<WardrobeBackup>;
  importWardrobe(backup: WardrobeBackup): Promise<void>;

  // Duplicate detection
  findSimilarItems(item: Partial<Item>): Promise<Item[]>;
}

interface StorageService {
  uploadImage(file: File, path: string): Promise<string>;  // returns URL
  deleteImage(url: string): Promise<void>;
}

interface FitComparator {
  compareToPersonMeasurements(
    item: Item,
    personProfile: PersonProfile,
    fieldDefinitions: FieldDefinition[]
  ): FitComparisonResult;

  compareToItem(
    item: Item,
    referenceItem: Item,
    fieldDefinitions: FieldDefinition[]
  ): FitComparisonResult;

  findSimilarItems(
    item: Item,
    allItems: Item[],
    fieldDefinitions: FieldDefinition[]
  ): Item[];
}

interface ItemSerializer {
  serialize(item: Item): Record<string, unknown>;
  deserialize(doc: Record<string, unknown>): Item;
  serializeFieldValue(value: FieldValue, fieldType: FieldType): unknown;
  deserializeFieldValue(raw: unknown, fieldType: FieldType): FieldValue;
}
```

### Default Categories and Fields

The app ships with these pre-configured categories, subcategories, and fields. All are editable/deletable by the user.

| Category | Subcategories | Default Fields (in addition to global) |
|----------|--------------|---------------------------------------|
| Tops | T-Shirts, Shirts, Polos, Sweaters, Hoodies, Jackets, Coats, Vests, Tank Tops | Sleeve Length (measurement), Chest (measurement), Shoulder Width (measurement) |
| Bottoms | Jeans, Trousers, Shorts, Skirts, Joggers, Leggings | Waist (measurement), Inseam (measurement), Hip (measurement) |
| Dresses | Casual, Formal, Maxi, Mini, Midi | Length (measurement), Bust (measurement), Waist (measurement) |
| Footwear | Sneakers, Boots, Sandals, Formal Shoes, Heels, Flats | Shoe Size (short_text), Foot Length (measurement), Width (dropdown: Narrow/Regular/Wide) |
| Accessories | Watches, Jewelry, Bags, Belts, Hats, Scarves, Sunglasses, Ties | Accessory Size (short_text) |
| Underwear | Boxers, Briefs, Bras, Socks, Undershirts | Waist (measurement), Band Size (measurement) |
| Sportswear | Gym Tops, Gym Bottoms, Sports Bras, Compression Wear, Swimwear | Activity Type (dropdown) |

**Global default fields** (applied to all categories): Name (short_text, required), Ownership Status (dropdown: Owned/Rented/Borrowed/Sold/Given-Donated, default: Owned, permanent), Colors (color, multi), Material (short_text), Brand (short_text), Size Label (short_text), Condition (dropdown: New/Like New/Good/Fair/Worn), Fit Type (dropdown: Slim/Regular/Relaxed/Oversized), Fit Confidence (dropdown: Exact/Approximate/Flexible), Material Stretch (boolean), Purchase Date (date), Price (number), Description (long_text), Notes (long_text).


## Data Models

### Firestore Collections

```
/users/{userId}/
  profile/
    personMeasurements    → PersonProfile document
    settings              → { darkMode: boolean }
  items/{itemId}          → Item documents
  wishlist/{itemId}       → WishlistItem documents
  config/
    categories            → { categories: Category[] }
  presets/{presetId}      → PresetItem documents
```

### Item Document Schema (Firestore)

```json
{
  "id": "auto-generated",
  "categoryId": "cat_tops",
  "subcategoryId": "sub_tshirts",
  "imageUrl": "https://firebasestorage.googleapis.com/...",
  "fitConfidence": "exact",
  "materialStretch": false,
  "fieldValues": {
    "field_name": "Blue Oxford Shirt",
    "field_colors": ["#1E3A5F", "#FFFFFF"],
    "field_material": "Cotton",
    "field_brand": "Uniqlo",
    "field_size_label": "M",
    "field_fit_type": "Regular",
    "field_chest": { "type": "range", "min": 96, "max": 102, "unit": "cm" },
    "field_sleeve": { "type": "single", "value": 64, "unit": "cm" },
    "field_price": 39.90,
    "field_purchase_date": "2024-03-15",
    "field_description": "Everyday office shirt"
  },
  "createdAt": "2024-03-15T10:30:00Z",
  "updatedAt": "2024-03-15T10:30:00Z"
}
```

### Category Configuration Document

```json
{
  "categories": [
    {
      "id": "cat_tops",
      "name": "Tops",
      "displayOrder": 0,
      "fields": [
        {
          "id": "field_sleeve",
          "label": "Sleeve Length",
          "fieldType": "measurement",
          "required": false,
          "displayOrder": 0,
          "unit": "cm"
        },
        {
          "id": "field_chest",
          "label": "Chest",
          "fieldType": "measurement",
          "required": false,
          "displayOrder": 1,
          "unit": "cm"
        }
      ],
      "subcategories": [
        {
          "id": "sub_tshirts",
          "name": "T-Shirts",
          "displayOrder": 0,
          "fields": []
        }
      ]
    }
  ]
}
```

### Person Profile Document

```json
{
  "measurements": [
    { "id": "pm_chest", "label": "Chest", "value": { "type": "single", "value": 98, "unit": "cm" } },
    { "id": "pm_waist", "label": "Waist", "value": { "type": "single", "value": 82, "unit": "cm" } },
    { "id": "pm_hip", "label": "Hip", "value": { "type": "single", "value": 96, "unit": "cm" } },
    { "id": "pm_inseam", "label": "Inseam", "value": { "type": "single", "value": 80, "unit": "cm" } },
    { "id": "pm_shoulder", "label": "Shoulder Width", "value": { "type": "single", "value": 44, "unit": "cm" } },
    { "id": "pm_wrist", "label": "Wrist", "value": { "type": "single", "value": 17, "unit": "cm" } }
  ],
  "updatedAt": "2024-03-15T10:00:00Z"
}
```

### Serialization Strategy

The `ItemSerializer` handles conversion between in-app TypeScript objects and Firestore documents:

- **Dates**: Stored as ISO 8601 strings in Firestore, parsed to `Date` objects in-app
- **MeasurementValue**: Stored as JSON objects `{ type, value?, min?, max?, unit }`
- **FieldValues map**: Keys are field definition IDs, values are the serialized field values
- **Colors**: Stored as arrays of hex strings
- **Booleans, numbers, strings**: Stored as-is (Firestore native types)

The serializer must support round-trip consistency: `deserialize(serialize(item))` must produce an equivalent item.

### Fit Comparison Algorithm

The `FitComparator` works as follows:

1. **Extract measurement fields**: From the item's field values, identify all fields with `fieldType === "measurement"`.
2. **Match by label**: For person-to-item comparison, match item measurement fields to person measurements by label (e.g., item's "Chest" field matches person's "Chest" measurement). For item-to-item comparison, match by field definition ID.
3. **Unit normalization**: Convert all values to the same unit before comparison (cm as canonical).
4. **Range comparison**: 
   - If item has a range (min–max) and reference is a single value: check if reference falls within [min, max]
   - If both are single values: compute delta
   - If both are ranges: compare overlap
   - If item is single and reference is range: check if item falls within reference range
5. **Overall fit**: Aggregate per-measurement results:
   - `good_fit`: all measurements within range or delta ≤ threshold (e.g., 2cm)
   - `too_small`: majority of measurements show item is smaller
   - `too_large`: majority of measurements show item is larger
   - `mixed`: some too small, some too large

**Finding similar items**: Filter all items to those sharing the same `categoryId` (and optionally `subcategoryId`), excluding the target item itself.

### Unit Conversion

| From | To | Factor |
|------|----|--------|
| inches | cm | × 2.54 |
| cm | inches | × 0.3937 |

Conversion is applied during comparison only; stored values retain their original unit.


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

The following properties were derived from the acceptance criteria through systematic analysis. Each property is universally quantified and suitable for property-based testing.

### Property 1: Item count and category breakdown

*For any* list of items with arbitrary categories, the computed total count shall equal the list length, and the per-category breakdown shall sum to the total, with each category count matching the number of items having that categoryId.

**Validates: Requirements 1.1, 1.3, 10.3**

### Property 2: Dynamic form renders correct fields from configuration

*For any* category configuration with a set of field definitions (and optional subcategory fields), the dynamically generated Item_Form shall render exactly the fields defined for that category plus the selected subcategory, in the correct display order and with the correct field types.

**Validates: Requirements 2.1**

### Property 3: Form validation rejects missing required fields

*For any* field configuration containing required fields and any item data that omits or leaves blank at least one required field, the validation function shall return an error and prevent submission. Conversely, for any item data that provides all required fields, validation shall pass.

**Validates: Requirements 2.3, 6.3**

### Property 4: Category filter returns only matching items

*For any* list of items and any selected category, the filtered result shall contain exactly those items whose categoryId matches the selected category, and no others.

**Validates: Requirements 4.4**

### Property 5: Text search returns only matching items

*For any* list of items and any non-empty search query string, every item in the filtered result shall contain the query text (case-insensitive) in at least one field value (name, brand, colors, material, tags, ownership status, condition, notes, description, or any custom field). No item matching the query shall be excluded. When searching within a specific category or subcategory context, only items from that category/subcategory shall be searched.

**Validates: Requirements 4.5, 4.6**

### Property 6: Preset-to-item conversion preserves field values

*For any* PresetItem, converting it to an Item shall produce an Item whose categoryId, subcategoryId, and fieldValues are identical to the PresetItem's values.

**Validates: Requirements 5.2**

### Property 7: Item deletion removes item from collection

*For any* list of items and any item in that list, after deleting that item, the resulting list shall not contain an item with the deleted item's id, and the list length shall be one less than before.

**Validates: Requirements 7.2, 7.3**

### Property 8: Wishlist purchased transition

*For any* wishlist item marked as purchased, the item shall be removed from the wishlist collection. If the user opts to create a wardrobe item, the created Item shall carry over the wishlist item's field values.

**Validates: Requirements 9.3**

### Property 9: Item serialization round-trip

*For any* valid Item object (with any combination of field types including measurements, colors, dates, booleans, and nested values), serializing then deserializing shall produce an object equivalent to the original.

**Validates: Requirements 12.1, 12.2, 12.3**

### Property 10: Fit comparison symmetry and correctness

*For any* two items with measurement fields in the same category, comparing item A to item B shall produce deltas that are the negation of comparing item B to item A. For any item compared against person measurements, if the item's measurement range contains the person's value, the comparison shall report `withinRange: true` for that measurement.

**Validates: Requirements (fit comparison logic, implied by Fit_Comparison glossary and design)**

### Property 11: Measurement unit conversion round-trip

*For any* numeric measurement value, converting from cm to inches and back to cm (or vice versa) shall produce a value within 0.01 of the original.

**Validates: Requirements (unit conversion correctness, supporting fit comparison)**

### Property 12: Field value type consistency

*For any* FieldDefinition and any FieldValue stored for that field, the value's runtime type shall match the expected type for the field's FieldType (e.g., a `measurement` field always has a MeasurementValue, a `boolean` field always has a boolean, a `color` field always has a string array).

**Validates: Requirements 2.2, 9.2**

### Property 13: Category deletion moves items to Uncategorized

*For any* category with items, deleting that category shall result in all items with that categoryId being moved to the "Uncategorized" category, with all field values preserved.

**Validates: Requirements (deletion behavior)**

### Property 14: Subcategory deletion moves items to Uncategorized subcategory

*For any* subcategory with items, deleting that subcategory shall result in all items with that subcategoryId being moved to an "Uncategorized {CategoryName}" subcategory within the same parent category, with all field values preserved.

**Validates: Requirements (deletion behavior)**

### Property 15: Field deletion removes field values from items

*For any* field definition with items using it, deleting that field shall result in the field being removed from all items' fieldValues map, while all other field values remain intact.

**Validates: Requirements (deletion behavior)**

### Property 16: Bulk delete removes all selected items

*For any* list of items and any subset of selected item IDs, bulk deleting those items shall result in none of the selected items remaining in the collection, and the collection length decreasing by the number of selected items.

**Validates: Requirements (bulk operations)**

### Property 17: Bulk move updates all selected items

*For any* list of items, any subset of selected item IDs, and any target category/subcategory, bulk moving those items shall result in all selected items having their categoryId and subcategoryId updated to the target values, with all field values preserved.

**Validates: Requirements (bulk operations)**

### Property 18: Favorite filter returns only favorited items

*For any* list of items, filtering by "Favorites Only" shall return exactly those items where isFavorite is true, and no others.

**Validates: Requirements (filtering)**

### Property 19: Sort by newest returns items in descending createdAt order

*For any* list of items, sorting by "Newest First" shall return items ordered by createdAt in descending order (most recent first).

**Validates: Requirements (sorting)**

### Property 20: Sort by most used returns items in descending usageCount order

*For any* list of items, sorting by "Most Used" shall return items ordered by usageCount in descending order (highest usage first).

**Validates: Requirements (sorting)**

### Property 21: Image lightbox navigation

*For any* item with an image in a list of items, opening the image in lightbox mode and swiping left/right shall navigate to the adjacent items' images in the same order as the list.

**Validates: Requirements 13.2**

### Property 22: Duplicate item preserves all field values

*For any* item, duplicating it shall create a new item with identical field values (except id, createdAt, updatedAt) that can be edited before saving.

**Validates: Requirements 13.3**

### Property 23: Recently viewed tracks last 5 items

*For any* sequence of item detail views, the recently viewed list shall contain the last 5 unique items viewed, in reverse chronological order (most recent first).

**Validates: Requirements 13.4**

### Property 24: Undo delete restores item within 5 seconds

*For any* deleted item, if the user taps "Undo" within 5 seconds, the item shall be restored with all original field values and image URL intact.

**Validates: Requirements 13.7, 13.8**

### Property 25: Drag and drop preserves order

*For any* list of categories, subcategories, or fields, after dragging an item from position A to position B, the displayOrder values shall be updated such that the item appears at position B and all other items maintain their relative order.

**Validates: Requirements 14.1, 14.2, 14.3**

### Property 26: Quick filters apply AND logic

*For any* set of active quick filter chips and any list of items, the filtered result shall contain only items that match ALL active filters simultaneously.

**Validates: Requirements 15.4**

### Property 27: Color filter applies OR logic

*For any* set of selected color swatches and any list of items, the filtered result shall contain items that have AT LEAST ONE of the selected colors.

**Validates: Requirements 16.3**

### Property 28: Item history completeness

*For any* item, the history timeline shall contain an entry for every action performed on that item (create, edit, worn, favorite toggle, category move) with accurate timestamps.

**Validates: Requirements 17.1, 17.2, 17.3, 17.4**

### Property 29: Packing list independence

*For any* packing list and any item in that list, deleting the packing list shall not affect the item in the wardrobe, and deleting the item from the wardrobe shall remove it from all packing lists.

**Validates: Requirements 19.4, 19.5**

### Property 30: Storage filter correctness

*For any* list of items with some marked as in storage, filtering by "Show Storage Items" shall return only items where inStorage is true, and the default view shall return only items where inStorage is false.

**Validates: Requirements 20.2, 20.3**

### Property 31: Backup round-trip integrity

*For any* complete wardrobe state (items, categories, fields, measurements, settings), exporting to JSON then importing shall produce an equivalent state with all data preserved.

**Validates: Requirements 21.2, 21.5**

### Property 32: Cost per wear calculation

*For any* item with a price and usageCount > 0, the cost per wear shall equal price / usageCount. For items with usageCount = 0, cost per wear shall be undefined or display as "Not worn yet".

**Validates: Requirements 22.2**

### Property 33: Duplicate detection accuracy

*For any* new item being added and any existing item in the same category/subcategory with matching colors and similar name (Levenshtein distance < 3), the duplicate detection shall flag the existing item as a potential duplicate.

**Validates: Requirements 23.2, 23.3**

### Property 34: Soft delete preserves statistics

*For any* item that is soft-deleted (isDeleted = true), the item shall be excluded from active wardrobe views but included in historical statistics calculations (items added per month, total wardrobe value over time, cost per wear history).

**Validates: Requirements 24.2, 24.6**

### Property 35: Restore reverses soft delete

*For any* soft-deleted item, restoring it shall set isDeleted to false, clear deletedAt, and make the item visible in all normal wardrobe views again with all original data intact.

**Validates: Requirements 24.5**

### Property 36: Ownership status filter correctness

*For any* list of items with various ownership statuses, the default wardrobe view shall exclude items with status "Sold" or "Given/Donated", and enabling "Show Sold/Donated" filter shall include all items regardless of ownership status.

**Validates: Requirements 25.4, 25.5**

## Error Handling

### Form Validation Errors
- Missing required fields: display inline error messages next to each invalid field
- Invalid measurement values (e.g., min > max in range mode): display specific error
- Invalid number fields (non-numeric input): display type error

### Image Upload Errors
- Network failure during upload: show error toast with retry button
- File too large: show size limit error before attempting upload
- Unsupported format: show format error

### Firebase Errors
- Firestore read/write failures: show error toast, retry with exponential backoff
- Authentication errors (if auth enabled): redirect to login
- Offline mode: queue writes and sync when connection restored (Firestore handles this natively)

### Data Integrity Errors
- Deserialization failures (corrupted data): log error, skip item, show warning
- Missing category/field config: fall back to raw field values display
- Orphaned images (item deleted but image remains): cleanup on delete, periodic sweep

### Navigation Errors
- Invalid routes: redirect to Dashboard
- Deep link to deleted item: show "item not found" message

### Safety Warnings for Configuration Changes

When users attempt to edit or delete categories, subcategories, or field definitions that are currently in use by wardrobe items, the system displays warning dialogs to prevent accidental data loss:

**Category Edit Warning**:
- Triggered when: User attempts to edit a category that has items using it
- Message: "X items use this category. Editing may affect existing data. Continue?"
- Actions: Cancel (default) or Confirm
- Implementation: Call `countItemsByCategory(categoryId)` before showing edit form

**Category Delete Warning**:
- Triggered when: User attempts to delete a category that has items or subcategories
- Message: "X subcategories and Y items use this category. Deleting will move all items to 'Uncategorized'. Continue?"
- Additional option: Checkbox "Also delete all items in this category" (unchecked by default)
- Actions: Cancel (default) or Confirm
- Implementation: Call `countSubcategoriesByCategory(categoryId)` and `countItemsByCategory(categoryId)` before deletion
- Behavior after confirmation:
  - If checkbox is unchecked (default): All items with this categoryId are moved to the "Uncategorized" category (auto-created if it doesn't exist), preserving all field values
  - If checkbox is checked: All items with this categoryId are permanently deleted along with their images from Storage

**Subcategory Edit Warning**:
- Triggered when: User attempts to edit a subcategory that has items using it
- Message: "X items use this subcategory. Editing may affect existing data. Continue?"
- Actions: Cancel (default) or Confirm
- Implementation: Call `countItemsBySubcategory(categoryId, subcategoryId)` before showing edit form

**Subcategory Delete Warning**:
- Triggered when: User attempts to delete a subcategory that has items using it
- Message: "X items use this subcategory. Deleting will move all items to 'Uncategorized {CategoryName}'. Continue?"
- Additional option: Checkbox "Also delete all items in this subcategory" (unchecked by default)
- Actions: Cancel (default) or Confirm
- Implementation: Call `countItemsBySubcategory(categoryId, subcategoryId)` before deletion
- Behavior after confirmation:
  - If checkbox is unchecked (default): All items with this subcategoryId are moved to an "Uncategorized {CategoryName}" subcategory within the same parent category (auto-created if it doesn't exist), preserving all field values
  - If checkbox is checked: All items with this subcategoryId are permanently deleted along with their images from Storage

**Field Definition Edit Warning**:
- Triggered when: User attempts to edit a field definition that has items with values for that field
- Message: "X items use this field. Editing may affect existing data. Continue?"
- Actions: Cancel (default) or Confirm
- Implementation: Call `countItemsUsingField(fieldId)` before showing edit form

**Field Definition Delete Warning**:
- Triggered when: User attempts to delete a field definition that has items with values for that field
- Message: "X items use this field. Deleting will remove this data from those items. Continue?"
- Actions: Cancel (default) or Confirm
- Implementation: Call `countItemsUsingField(fieldId)` before deletion
- Behavior after confirmation: The field is removed from all items' fieldValues map, but items remain intact

**Warning Dialog Behavior**:
- Warnings are modal dialogs that block the action until user responds
- If count is 0 (no items affected), no warning is shown and action proceeds immediately
- Cancel button is styled as the default/safe action
- Confirm button is styled with warning colors (e.g., red for delete, yellow for edit)
- After confirmation, the action proceeds normally

### Bulk Operations

The WardrobePage supports multi-selecting items and performing bulk operations:

**Multi-Select Mode**:
- Each item card displays a checkbox in the top-left corner when selection mode is active
- "Select All" button selects all currently visible items (respecting active filters)
- "Deselect All" button clears all selections
- Selected item count is displayed in the BulkOperationsToolbar

**Bulk Delete**:
- Confirmation dialog: "Delete X selected items? This cannot be undone."
- Actions: Cancel (default) or Confirm
- On confirmation: All selected items are deleted from Firestore, associated images are removed from Storage
- After deletion: Selection mode is cleared, item list refreshes

**Bulk Move**:
- Opens a dialog with category dropdown and optional subcategory dropdown
- Confirmation dialog: "Move X selected items to {Category} > {Subcategory}?"
- Actions: Cancel (default) or Confirm
- On confirmation: All selected items have their categoryId and subcategoryId updated
- Field values are preserved; if the target category/subcategory has different field definitions, existing field values remain in the fieldValues map
- After move: Selection mode is cleared, item list refreshes

**Selection State Management**:
- Selection state is maintained in WardrobePage component state
- Clearing filters or search does not clear selections
- Navigating away from WardrobePage clears selections

## Testing Strategy

### Testing Framework

- **Unit & Integration Tests**: Vitest
- **Property-Based Tests**: fast-check (with Vitest as runner)
- **Component Tests**: React Testing Library
- **Minimum iterations**: 100 per property-based test

### Unit Tests

Unit tests cover specific examples, edge cases, and error conditions:

- Form validation with specific valid/invalid inputs
- Serializer with specific item shapes (empty fields, all fields, edge values)
- Fit comparison with known measurement values and expected results
- Category/field CRUD operations
- Color picker value handling
- Measurement input mode toggling (single ↔ range)
- Dashboard statistics with empty wardrobe, single item, many items
- Search with empty query, special characters, case variations
- Image upload error scenarios (mock Firebase Storage)

### Property-Based Tests

Each correctness property from the design document is implemented as a single property-based test using fast-check. Each test runs a minimum of 100 iterations with randomly generated inputs.

Tests are tagged with the format: `Feature: wardrobe-manager, Property {number}: {title}`

Key generators needed:
- `arbitraryFieldDefinition()`: generates random field definitions with valid types
- `arbitraryCategory()`: generates categories with subcategories and field definitions
- `arbitraryItem(categoryConfig)`: generates items with field values matching a category's field configuration
- `arbitraryMeasurementValue()`: generates single or range measurements with valid units
- `arbitraryPersonProfile()`: generates person measurement profiles
- `arbitraryFieldValue(fieldType)`: generates a valid field value for a given field type

### Test Organization

```
src/
  __tests__/
    properties/
      item-count.property.test.ts          # Property 1
      dynamic-form.property.test.ts        # Property 2
      form-validation.property.test.ts     # Property 3
      category-filter.property.test.ts     # Property 4
      text-search.property.test.ts         # Property 5
      preset-conversion.property.test.ts   # Property 6
      item-deletion.property.test.ts       # Property 7
      wishlist-transition.property.test.ts # Property 8
      serialization.property.test.ts       # Property 9
      fit-comparison.property.test.ts      # Property 10
      unit-conversion.property.test.ts     # Property 11
      field-type-consistency.property.test.ts # Property 12
      category-deletion.property.test.ts   # Property 13
      subcategory-deletion.property.test.ts # Property 14
      field-deletion.property.test.ts      # Property 15
      bulk-delete.property.test.ts         # Property 16
      bulk-move.property.test.ts           # Property 17
    unit/
      form-validation.test.ts
      serializer.test.ts
      fit-comparator.test.ts
      category-manager.test.ts
      search-filter.test.ts
      bulk-operations.test.ts
      deletion-behavior.test.ts
    generators/
      field-generators.ts
      item-generators.ts
      measurement-generators.ts
```
