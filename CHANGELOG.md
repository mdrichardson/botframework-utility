# Change Log

All notable changes to the "botframework-utility" extension will be documented in this file.

## Current Status

*Preview* - Use at your own risk.

## [Unreleased]

- Added code snippet for Adaptive Card construction

## [0.0.3] - 2019-07-31

### Changed

- Some terminal commands now open hidden (emulator, mostly)
- Emulator w/ appId/appPass now opens correctly
- Samples can be opened in the browser instead of downloaded

## [0.0.2] - 2019-06-04

### Added

- Code Snippets for:
  - Storage:
    - Memory - `memoryStorage`
    - Azure Blob - `blobStorage`
    - Cosmos - `cosmosStorage`
  - Activity Handlers - `activityHandler`
  - Welcome Message - `welcomeMessage`

### Changed

- Fixed axios vulnerability
- Fixed webpack VSIX size (much smaller!)