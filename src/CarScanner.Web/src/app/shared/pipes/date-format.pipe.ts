import { Pipe, PipeTransform } from '@angular/core';

type DateFormatType = 'date' | 'time' | 'datetime';

@Pipe({ name: 'dateFormat', standalone: true })
export class DateFormatPipe implements PipeTransform {
  transform(value: string | Date | null | undefined, format: DateFormatType = 'datetime'): string {
    if (!value) return '';
    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return '';

    switch (format) {
      case 'date':
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
      case 'time':
        return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      case 'datetime':
        return `${date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
    }
  }
}
