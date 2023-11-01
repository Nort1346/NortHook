export function checkIfImageExists(url, callback) {
  try {
    const img = new Image();

    img.onload = (e) => {
      return callback(true);
    };

    img.onerror = (e) => {
      return callback(false);
    };

    img.src = url;
  } catch (err) {
    return callback(false);
  }
}