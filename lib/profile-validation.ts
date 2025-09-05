// lib/profile-validation.ts
export class ProfileValidation {
  static canChangeName(
    nameChangeCount: number,
    lastChangeDate: Date | null
  ): boolean {
    // Allow first 2 changes without restrictions
    if (nameChangeCount < 2) return true;

    // If no previous change date, allow change
    if (!lastChangeDate) return true;

    // Calculate 90 days ago
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Allow change only if last change was more than 90 days ago
    return lastChangeDate <= ninetyDaysAgo;
  }

  static canChangeUsername(
    usernameChangeCount: number,
    lastChangeDate: Date | null
  ): boolean {
    // Allow first 3 changes without restrictions
    if (usernameChangeCount < 3) return true;

    // If no previous change date, don't allow change (shouldn't happen)
    if (!lastChangeDate) return false;

    // Calculate 1 year ago
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Allow change only if the first of the 3 changes was more than 1 year ago
    return lastChangeDate <= oneYearAgo;
  }

  static getNameChangeCooldown(lastChangeDate: Date | null): number {
    if (!lastChangeDate) return 0;

    const nextChangeDate = new Date(lastChangeDate);
    nextChangeDate.setDate(nextChangeDate.getDate() + 90);

    const now = new Date();
    const daysRemaining = Math.ceil(
      (nextChangeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return Math.max(0, daysRemaining);
  }

  static getUsernameChangeCooldown(lastChangeDate: Date | null): number {
    if (!lastChangeDate) return 0;

    const nextChangeDate = new Date(lastChangeDate);
    nextChangeDate.setFullYear(nextChangeDate.getFullYear() + 1);

    const now = new Date();
    const daysRemaining = Math.ceil(
      (nextChangeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return Math.max(0, daysRemaining);
  }
}
