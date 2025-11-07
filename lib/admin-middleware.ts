export interface AdminUser {
  id: string
  email: string
  isAdmin: boolean
  isSuperAdmin: boolean
}

export function checkAdminAccess(user: AdminUser | null): boolean {
  return user?.isAdmin === true || user?.isSuperAdmin === true
}

export function checkSuperAdminAccess(user: AdminUser | null): boolean {
  return user?.isSuperAdmin === true
}

export function requireAdmin(user: AdminUser | null): void {
  if (!checkAdminAccess(user)) {
    throw new Error("Unauthorized: Admin access required")
  }
}

export function requireSuperAdmin(user: AdminUser | null): void {
  if (!checkSuperAdminAccess(user)) {
    throw new Error("Unauthorized: Super admin access required")
  }
}

export interface AdminActivity {
  id: string
  adminId: string
  adminName: string
  action: string
  details: string
  eventId?: string
  timestamp: Date
}

export class AdminActivityLogger {
  private static activities: AdminActivity[] = []

  static log(adminId: string, adminName: string, action: string, details: string, eventId?: string) {
    const activity: AdminActivity = {
      id: Math.random().toString(),
      adminId,
      adminName,
      action,
      details,
      eventId,
      timestamp: new Date(),
    }

    this.activities.unshift(activity)

    // Keep only last 100 activities in memory
    if (this.activities.length > 100) {
      this.activities = this.activities.slice(0, 100)
    }

    // In a real app, this would save to database
    return activity
  }

  static getActivities(eventId?: string): AdminActivity[] {
    if (eventId) {
      return this.activities.filter((a) => a.eventId === eventId)
    }
    return this.activities
  }

  static getRecentActivities(limit = 10): AdminActivity[] {
    return this.activities.slice(0, limit)
  }
}
