export function enumToLabel(value: string | number, enumLabels: Record<string | number, string>): string {
  return enumLabels[value] ?? String(value);
}

export function enumToOptions<T extends Record<string, string | number>>(
  enumObj: T,
  labels: Record<string | number, string>,
): { value: T[keyof T]; label: string }[] {
  return Object.values(enumObj)
    .filter((v) => typeof v === 'number')
    .map((value) => ({
      value: value as T[keyof T],
      label: labels[value as number] ?? String(value),
    }));
}
