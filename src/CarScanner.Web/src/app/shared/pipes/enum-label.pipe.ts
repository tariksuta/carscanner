import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'enumLabel', standalone: true })
export class EnumLabelPipe implements PipeTransform {
  transform(value: string | number, labels: Record<string | number, string>): string {
    return labels[value] ?? String(value);
  }
}
