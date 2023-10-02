# Change Log

## Version 0.0.3
- Use a smarter algorithm that uses the indentation of the previous line where possible to guide the deletion
- Replace the use of 'deleteLeft' editor command with editorBuilder.delete, this gets rid of flickering on deletions
## Version 0.0.2
- Allow merging to work for any amount of tabs/spaces at the start of a line (its not exactly what it should be but for now its good enough)
## Version 0.0.1
- Merging line with previous line if a line only has a tab (or spaces) on it while deleting
