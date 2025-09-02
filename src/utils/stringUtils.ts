export const Strings = {
  /**
   * Function that checks if the given string is empty (undefined, null, '')
   * @param str string to check
   * @returns true if empty else false
   */
  isEmpty(str: string | null | undefined) {
    return !str || str.length === 0;
  },

  /**
   * Function that checks if the given string is not empty (not -> undefined, null, '')
   * @param str string to check
   * @returns true if not empty else false
   */
  isNotEmpty(str: string | null | undefined) {
    return !Strings.isEmpty(str);
  },

  /**
   * Function that checks if the given string is empty and blank (undefined, null, '', ' ')
   * @param str string to check
   * @returns true if empty and blank else false
   */
  isBlank(str: string | null | undefined) {
    return !str || str.trim().length === 0;
  },

  /**
   * Function that checks if the given string is not empty and blank (not -> undefined, null, '', ' ')
   * @param str string to check
   * @returns true if not empty and blank else false
   */
  isNotBlank(str: string | null | undefined) {
    return !Strings.isBlank(str);
  },
};
