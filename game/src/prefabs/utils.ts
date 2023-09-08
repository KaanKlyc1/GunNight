export function getQueryParameter(
  name: any,
  url: string = window.location.href
): any {
  name = name.replace(/[\[\]]/g, '\\$&');
  let regex: any = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results: any = regex.exec(url);
  if (!results) {
    return null;
  }
  if (!results[2]) {
    return '';
  }
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export function updateQueryParameter(
  key: any,
  value: any,
  url: string = window.location.href
): any {
  let re: any = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
  let separator: any = url.indexOf('?') !== -1 ? '&' : '?';
  if (url.match(re)) {
    return url.replace(re, '$1' + key + '=' + value + '$2');
  } else {
    return url + separator + key + '=' + value;
  }
}

export function getRandomString(length: any): any {
  let letters: any = [];
  let hex: any = '0123456789abcdef';
  for (let i: number = 0; i < length; i++) {
    letters[i] = hex[Math.floor(Math.random() * hex.length)];
  }
  return letters.join('');
}
