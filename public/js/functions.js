export function checkIfImageExists(url, callback) {
    const img = new Image();
  
    img.onload = (e) => {
      return callback(true);
    };
  
    img.onerror = (e) => {
      return callback(false);
    };
  
    img.src = url;
  }