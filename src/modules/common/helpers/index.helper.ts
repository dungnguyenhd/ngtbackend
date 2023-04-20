/**
 * Throw custom exception
 *
 * @param condition
 * @param error
 */
export const throwIf = (condition, error) => {
  if (condition) {
    throw error;
  }
  return true;
};

/**
 * Check data is null, undefined or empty array
 *
 * @param data
 */
export const isEmpty = (data) => {
  return !data || (Array.isArray(data) && !data.length);
};
