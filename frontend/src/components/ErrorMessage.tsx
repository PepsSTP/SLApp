interface ErrorMessageProps {
  message: string;
}

/**
 * Error Message Component
 * Displays error messages to the user
 */
export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="error-message">
      {message}
    </div>
  );
}
