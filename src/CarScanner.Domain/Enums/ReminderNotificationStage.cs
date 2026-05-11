namespace CarScanner.Domain.Enums;

public enum ReminderNotificationStage
{
    None = 0,
    T30Days = 1,
    T14Days = 2,
    T7Days = 3,
    T1Day = 4,
    Overdue = 5,
}
