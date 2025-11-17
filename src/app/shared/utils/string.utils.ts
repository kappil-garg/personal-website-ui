export class StringUtils {
  static contains(text: string, searchTerm: string): boolean {
    return text.toLowerCase().includes(searchTerm.toLowerCase());
  }
}
