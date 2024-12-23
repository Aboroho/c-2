function filterSecret(data) {
  // const replaceValue = secret.replace(/[a-z]/g, "-");
  const filtered = data.replace(new RegExp("dfkjdf", "g"), (match) => {
    console.log(match);
    return match;
  });

  //   console.log(filtered);
}
console.log(filterSecret("i like big trains and i cant lie"));
