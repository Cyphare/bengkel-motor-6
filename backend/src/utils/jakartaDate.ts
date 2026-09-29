export const jakartaDate = (date: Date): string => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(date);

export const previousJakartaDay = (day: string): string =>
  jakartaDate(new Date(new Date(`${day}T00:00:00+07:00`).getTime() - 86400000));
