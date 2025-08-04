# Code Style Steering

## TypeScript Guidelines

- Use strict type checking
- Prefer interfaces over types for object shapes
- Use meaningful variable names
- Add JSDoc comments for public APIs

## Testing Requirements

- Write unit tests for all business logic
- Use descriptive test names
- Mock external dependencies
- Maintain test coverage above 80%

## Error Handling

- Always handle errors gracefully
- Provide user-friendly error messages
- Log errors with appropriate detail level
- Never expose sensitive information in errors

## Performance Considerations

- Avoid synchronous file operations in main thread
- Use VS Code APIs appropriately
- Minimize memory usage in large workspaces
- Implement proper cleanup and disposal
