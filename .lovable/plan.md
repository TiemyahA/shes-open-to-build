# Refine the share flow

## Changes
- Restore the profile preview’s previous default avatar exactly, while keeping the current ring styling and editor.
- Expand the second action into a compact “The post” panel containing the supplied default LinkedIn text and a copy button with clear copied feedback.
- Add a three-stage ring journey showing #OPENTOBUILD, #BUILDING, and #IMADETHAT with their specified colours and timing labels.
- Replace the closing area with the supplied application link and the “Built on Lovable…” line.

## Technical details
- Reuse the existing canvas drawing functions for the three ring examples so they visually match downloaded profile pictures.
- Use the browser clipboard API for copying, with a safe fallback when clipboard access is unavailable.
- Keep the page mobile-first and verify the complete page at phone and desktop widths, including the copy interaction.
