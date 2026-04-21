namespace CarScanner.Domain.Enums;

public enum DamageReportStatus
{
    Pending = 0,
    Analyzing = 1,
    Completed = 2,
    NoDamageFound = 3,
    DamageDetected = 4,
    Failed = 5
}
