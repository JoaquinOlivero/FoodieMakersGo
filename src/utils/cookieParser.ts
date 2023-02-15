const cookieParser = (str: any) => {
  const cookies = str
    .split(';')
    .map((v: any) => v.split('='))
    .reduce((acc: any, v: any) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(`${v[0].trim()}=${v[1].trim()}`);
      return acc;
    }, {});

  return cookies
}

export default cookieParser