export function filterNotifications(notifications, filter) {
  switch (filter) {
    case 'unread':
      return notifications.filter((notification) => !notification.read)
    case 'adoption':
      return notifications.filter((notification) => Boolean(notification.adoption))
    case 'pet':
      return notifications.filter((notification) => Boolean(notification.pet))
    default:
      return notifications
  }
}