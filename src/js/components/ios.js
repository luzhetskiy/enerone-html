function iOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

if (iOS()) {
  const viewportMetaTag = document.head.querySelector("meta[name=\"viewport\"]");
  if (viewportMetaTag) {
    viewportMetaTag.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0";
  } else {
    const newMetaTag = document.createElement("meta");
    newMetaTag.name = "viewport";
    newMetaTag.content = "width=device-width, initial-scale=1";
    document.head.appendChild(newMetaTag);
  }
}
