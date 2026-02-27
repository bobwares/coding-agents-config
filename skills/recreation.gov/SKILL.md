---
name: recreation.gov
description: Search for campgrounds on recreation.gov with automated browser navigation and GIF recording. Use when you need to find campsite availability, search by location, or explore recreation areas.
argument-hint: "[campground-name]"
---

# Recreation.gov Search Skill

Search for campgrounds, recreation areas, and outdoor facilities on recreation.gov with automated navigation and recording.

## Usage

### Mode 1: Search Campgrounds

Search for a specific campground or location:

```
/recreation.gov Upper Pines
/recreation.gov Yosemite
/recreation.gov Moab
```

### Mode 2: Register Campground (Persistent Registry)

Register a campground from its recreation.gov URL:

```
add campsite https://www.recreation.gov/camps/1234567/
```

Register multiple campgrounds:

```
add campsite https://www.recreation.gov/camps/1234567/, https://www.recreation.gov/camps/2345678/, https://www.recreation.gov/camps/3456789/
```

### Mode 3: Check Availability (Using Registered Campsites)

Check availability for a registered campground:

```
check campsite "Upper Pines" from 2026-05-01 to 2026-05-07
```

## What This Skill Does

### Search Mode
When invoked with a campground name or location, this skill will:

1. **Navigate** to https://www.recreation.gov/
2. **Search** for the specified campground using the main search field
3. **Load Results** with map view and listings
4. **Record Interactions** with GIF recording for documentation
5. **Track Steps** as you navigate and explore results

### Registry Mode
When invoked with `add campsite {{url}}`, this skill will:

1. **Open** the provided recreation.gov campground URL
2. **Extract** the authoritative campground name from the live page:
   - Primary `<h1>` or `<title>` tag
   - `og:title` or JSON-LD structured metadata
   - Breadcrumb or page title as fallback
3. **Validate** that the name exists on the page (never infer from URL alone)
4. **Normalize** the name into a `lookup_key` (lowercase, trimmed, whitespace collapsed, punctuation stripped)
5. **Persist** the record into the Campground Registry with:
   - `lookup_key`: normalized identifier for matching
   - `display_name`: original campground name
   - `url`: recreation.gov campground URL
   - `source`: "recreation.gov"
   - `created_at`: registration timestamp
   - `last_verified_at`: null (set on first verification)
6. **Respond** with confirmation or error message

## Terminal Invocation Feedback

The recreation.gov skill provides explicit terminal signaling to indicate skill invocation, execution phase, and completion status. This enables clear observability in CLI workflows and multi-agent orchestration environments.

### Standard Invocation Banner

When a skill command is detected, the terminal immediately displays:

```
[SKILL INVOKED] recreation.gov
Command: <parsed command>
Handler: <handler_name>
Status: STARTED
```

### Completion Banners

After execution completes, the terminal displays:

**Success:**
```
[SKILL COMPLETE] recreation.gov
Handler: <handler_name>
Status: SUCCESS
<result summary>
```

**Failure:**
```
[SKILL COMPLETE] recreation.gov
Handler: <handler_name>
Status: FAILED
Reason: <explicit error reason>
```

### Handler-Specific Examples

#### Search Handler

**Input:**
```
/recreation.gov Upper Pines
```

**Invocation:**
```
[SKILL INVOKED] recreation.gov
Command: search campground
Handler: search_campgrounds
Status: STARTED
```

**Completion (Success):**
```
[SKILL COMPLETE] recreation.gov
Handler: search_campgrounds
Status: SUCCESS
Results: 12 campgrounds found
Top Result: Upper Pines Campground, Yosemite Valley, CA
```

#### Registration Handler

**Input:**
```
add campsite https://www.recreation.gov/camps/250001/campsites
```

**Invocation:**
```
[SKILL INVOKED] recreation.gov
Command: add campsite
Handler: register_campsite
Status: STARTED
```

**Completion (Success):**
```
[SKILL COMPLETE] recreation.gov
Handler: register_campsite
Status: SUCCESS
Campground Registered: Upper Pines Campground
Lookup Key: upper pines campground
Registry Entry: 1 campground(s) registered
```

**Completion (Failure):**
```
[SKILL COMPLETE] recreation.gov
Handler: register_campsite
Status: FAILED
Reason: Could not extract campground name from URL - page structure unexpected
URL: https://www.recreation.gov/camps/invalid/campsites
```

#### Batch Registration Handler

**Input:**
```
add campsite https://www.recreation.gov/camps/250001/, https://www.recreation.gov/camps/250002/, https://www.recreation.gov/camps/250003/
```

**Invocation:**
```
[SKILL INVOKED] recreation.gov
Command: add campsite (batch)
Handler: register_campsite_batch
Status: STARTED
Batch Size: 3 URLs
```

**Completion (Partial Success):**
```
[SKILL COMPLETE] recreation.gov
Handler: register_campsite_batch
Status: SUCCESS (2/3)
Registered: Upper Pines Campground, Lower Pines Campground
Failed: Invalid Site URL (page extraction failed)
Summary: 2 registered, 1 failed
```

#### Availability Lookup Handler

**Input:**
```
check campsite "Upper Pines" from 2026-05-10 to 2026-05-14
```

**Invocation:**
```
[SKILL INVOKED] recreation.gov
Command: check campsite
Handler: check_availability
Status: STARTED
Campground: Upper Pines
Date Range: 2026-05-10 to 2026-05-14
```

**Completion (Success):**
```
[SKILL COMPLETE] recreation.gov
Handler: check_availability
Status: SUCCESS
Available Sites: 4 sites found
Price Range: $27-$45 per night
Fetched: 2026-02-27T15:30:00Z
```

**Completion (Not Found):**
```
[SKILL COMPLETE] recreation.gov
Handler: check_availability
Status: FAILED
Reason: Campground not found in registry
Lookup Key: upper pines
Suggestion: Use 'add campsite <url>' to register first
```

### Design Constraints

1. **Invocation Banner Timing**
   - Banner must print **before** any web access or processing begins
   - Ensures immediate visibility of skill activation

2. **Completion Banner Guarantee**
   - Completion banner must **always** print, regardless of success or failure
   - Enables reliable workflow tracking

3. **Banner Suppression**
   - Banners are enabled by default
   - Only suppress when explicitly configured via `skill.verbose` flag
   - Never suppress FAILED banners (always visible)

4. **Banner Format Requirements**
   - Fixed bracket format: `[SKILL INVOKED]` and `[SKILL COMPLETE]`
   - Machine-parsable format (compatible with log parsing and monitoring)
   - Consistent indentation and field ordering

5. **Handler Naming**
   - Handler names must be descriptive (e.g., `search_campgrounds`, `register_campsite`)
   - Suffixes indicate operation type:
     - `_batch`: Batch operations (multiple items)
     - `_lookup`: Registry/database queries
     - `_batch`: Processing multiple items

### Configuration: Verbose Mode

The skill supports optional verbose mode configuration:

```json
{
  "skill": {
    "verbose": true
  }
}
```

#### Verbose Mode: true (Default)

Shows full lifecycle banners:

```
[SKILL INVOKED] recreation.gov
Command: add campsite
Handler: register_campsite
Status: STARTED

[SKILL COMPLETE] recreation.gov
Handler: register_campsite
Status: SUCCESS
Campground Registered: Upper Pines Campground
```

#### Verbose Mode: false

Only shows FAILED banners (suppresses SUCCESS):

```
[SKILL INVOKED] recreation.gov
Command: add campsite
Handler: register_campsite
Status: STARTED

(No completion banner on success)
```

But on failure, always shows:

```
[SKILL COMPLETE] recreation.gov
Handler: register_campsite
Status: FAILED
Reason: Could not extract campground name from page content
```

### Multi-Agent Orchestration

In multi-agent workflows, these banners enable:

1. **Skill Activation Tracking** - Know when skills are triggered
2. **Handler Routing** - Identify which handler processed the command
3. **Execution Monitoring** - Track STARTED → COMPLETE transitions
4. **Error Visibility** - Immediate detection of failed operations
5. **Log Aggregation** - Parse consistent bracket format across logs

### Banner Parsing Example

For log aggregation and monitoring:

```regex
^\[SKILL INVOKED\] recreation\.gov$
^\[SKILL COMPLETE\] recreation\.gov$
Handler: (\w+_\w+)
Status: (STARTED|SUCCESS|FAILED)
```

These regex patterns enable reliable extraction of skill execution state across logs and monitoring systems.

## Search Workflow

### Step 1: Navigate to recreation.gov
Opens the recreation.gov homepage with all available options.

### Step 2: Enter Location in Search Field
Uses the "Search for campsites, tours, and other recreation activities..." field to search for:
- Specific campground names (e.g., "Upper Pines")
- Geographic locations (e.g., "Yosemite")
- Recreation areas (e.g., "Moab")

### Step 3: Execute Search
Clicks the SEARCH button and waits for results to load.

### Step 4: Display Results
Shows:
- Map view with location markers
- Campground listings with details:
  - Rating and reviews
  - Price per night
  - Accessibility information
  - Distance from location
- Sort and filter options
- Date pickers for availability

### Step 5: Recording Active
GIF recording starts automatically, capturing:
- All clicks and interactions
- Navigation through results
- Map panning and zooming
- Filter applications

## Registration Workflow

### Single Campground Registration

When registering `add campsite {{url}}`:

1. **Navigate** to the provided URL
2. **Extract Name** from page content using priority order:
   - Extract text from `<h1>` tag
   - Fall back to `<title>` tag content
   - Check for `og:title` meta tag
   - Check for JSON-LD schema (name field)
   - Use breadcrumb text as last resort
3. **Validate** the extracted name:
   - Must not be empty or generic ("Campground", "Site", etc.)
   - Must exist on the actual page DOM (never infer from URL)
   - Return explicit error if validation fails
4. **Normalize** the name:
   - Convert to lowercase
   - Trim whitespace
   - Collapse multiple whitespaces to single space
   - Remove punctuation (except hyphens between words)
   - Use as `lookup_key` for registry matching
5. **Check Duplicates**:
   - Query registry for existing `lookup_key`
   - If found: prompt user before overwriting
   - Otherwise: proceed with registration
6. **Store Record** with timestamps:
   - `lookup_key`: normalized identifier
   - `display_name`: original campground name from page
   - `url`: full recreation.gov URL
   - `source`: "recreation.gov"
   - `created_at`: current timestamp
   - `last_verified_at`: null

### Response Format

**Success:**
```
Campground Registered
Name: Upper Pines Campground
URL: https://www.recreation.gov/camps/250001/campsites
```

**Failure:**
```
Registration Failed
URL: https://www.recreation.gov/camps/invalid/
Reason: Could not extract campground name from page content
```

### Batch Registration

When registering multiple URLs:

```
add campsite {{url1}}, {{url2}}, {{url3}}
```

Process each URL independently and return a table:

| Campground Name | URL | Status |
|---|---|---|
| Upper Pines | https://www.recreation.gov/camps/250001/ | ✓ Registered |
| Lower Pines | https://www.recreation.gov/camps/250002/ | ✓ Registered |
| Invalid Site | https://www.recreation.gov/camps/invalid/ | ✗ Failed |

## Availability Lookup Workflow

When checking `check campsite "{{name}}" from {{check_in}} to {{check_out}}`:

1. **Resolve Name**:
   - Normalize user input using same rules as registration
   - Query registry for matching `lookup_key`
   - Return error if campground not found in registry
2. **Retrieve URL**:
   - Get stored URL from registry record
   - Update `last_verified_at` timestamp
3. **Navigate & Extract**:
   - Open the campground URL
   - Navigate to availability section
   - Filter for date range
4. **Return Availability**:
   ```
   Site | Site Type | Max Occupancy | Price | Booking Link
   A1   | Tent      | 6             | $27   | [Book]
   B5   | RV        | 8             | $45   | [Book]
   ```

**Not Found Response:**
```
Campground not found in registry.
Use: add campsite https://www.recreation.gov/camps/xxx/
```

## Registry Storage

The Campground Registry persists across sessions as `recreation_gov_registry.json` in skill memory:

```json
{
  "upper pines": {
    "display_name": "Upper Pines Campground",
    "url": "https://www.recreation.gov/camps/250001/campsites",
    "source": "recreation.gov",
    "created_at": "2026-02-27T10:30:00Z",
    "last_verified_at": null
  },
  "lower pines": {
    "display_name": "Lower Pines Campground",
    "url": "https://www.recreation.gov/camps/250002/campsites",
    "source": "recreation.gov",
    "created_at": "2026-02-27T10:31:00Z",
    "last_verified_at": "2026-02-27T15:45:00Z"
  }
}
```

### Duplicate Detection

- Registry checks `lookup_key` before registration
- Duplicate keys trigger a confirmation prompt
- Overwriting requires explicit user approval
- Prevents silent data loss

### Durability

- Registry survives across skill invocations
- Stored in durable skill memory (persists between sessions)
- Registry backup created on each modification
- Manual registry access: `registry list` (future extension)

## Supported Search Types

### Specific Campgrounds
- Upper Pines (Yosemite)
- Lower Pines (Yosemite)
- Mariposa Grove
- And thousands of others

### Locations
- Yosemite National Park
- Moab, Utah
- Joshua Tree
- Big Sur
- Lake Tahoe

### Facilities
- Camping & Lodging
- Permits
- Tickets & Tours
- Activity Passes
- Day Use & Venues

## Tips

### Search Mode
1. **Use specific names** for better results (e.g., "Upper Pines" instead of "Pine")
2. **Location-based searches** return nearby campgrounds (e.g., search "Yosemite" to see all nearby options)
3. **Filter by dates** using the date pickers to check availability
4. **Use the map** to visualize locations and nearby facilities
5. **Check accessibility** icons for ADA-compliant campsites

### Registry Mode
1. **Register URLs directly** from recreation.gov campground pages for quick access
2. **Use display names** for easy recognition (names extracted from page content)
3. **Batch register** multiple campgrounds with comma-separated URLs
4. **Check availability** of registered campgrounds by name without needing the URL again
5. **Verify registrations** are correct by checking the extracted campground name before confirming

## Error Handling

### Registration Errors

| Error | Cause | Resolution |
|---|---|---|
| URL not accessible | Invalid URL or network issue | Verify URL is correct and recreation.gov is accessible |
| No campground name found | Page structure unexpected | Check that URL points to a valid campground page |
| Empty or generic name | Extracted text is too generic | Manually verify the campground name on the page |
| Duplicate key exists | Campground already registered | User prompted to confirm overwrite |
| Invalid URL format | URL doesn't match recreation.gov pattern | Use full campground URL (e.g., https://www.recreation.gov/camps/123/) |

### Availability Lookup Errors

| Error | Cause | Resolution |
|---|---|---|
| Campground not in registry | Name not registered yet | Use `add campsite {{url}}` to register first |
| Name matching failed | Normalized name doesn't match registry keys | Check exact campground name in registry |
| Date parsing error | Invalid date format | Use YYYY-MM-DD format (e.g., 2026-05-01) |
| Availability data unavailable | Recreation.gov page structure changed | Re-register campground with current page content |

## Browser Tools Used

- Navigation and page interaction
- Form input and button clicking
- Screenshot capture
- GIF recording of user interactions
- Dynamic element finding
- HTML content extraction (h1, title, meta tags)
- JSON-LD schema parsing
- Breadcrumb navigation extraction

## Next Steps After Search

Once results load, you can:
- Click on a campground to view details
- Check availability with date pickers
- Apply filters (accessible camping, site type, etc.)
- View the map and surrounding facilities
- Click "ENTER DATES FOR AVAILABILITY" to book
- Navigate to related recreation areas

## Current Capabilities

This skill now includes:
- ✓ Search campgrounds by name or location
- ✓ Persistent campground registry
- ✓ Batch registration of multiple campgrounds
- ✓ Availability lookup using registered names
- ✓ Duplicate detection and confirmation
- ✓ Cross-session registry persistence
- ✓ GIF recording of interactions

## Future Extensions

This skill can be extended to support:
- `registry list` - View all registered campgrounds
- `registry delete {{name}}` - Remove a registered campground
- `registry verify` - Check stored URLs are still valid
- Availability filtering by date range
- Price range filtering
- Accessibility-only searches
- Automated booking workflows
- Comparison of multiple campgrounds
- Email alerts for availability changes
- Export registry to CSV/JSON
