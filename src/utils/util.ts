/*
 * @Version    : v1.00
 * @Author     : itchaox
 * @Date       : 2023-12-16 10:45
 * @LastAuthor : itchaox
 * @LastTime   : 2023-12-25 01:03
 * @desc       :
 */

// export function getGifUrl(name) {
//   return new URL(`../assets/gifs/${name}.jpg`, import.meta.url).href;
// }

// 获取演示动图
export async function getGifUrl(name) {
  const possibleExtensions = ['.gif', '.png', '.jpeg', '.jpg'];

  for (const extension of possibleExtensions) {
    const imageUrlAttempt = new URL(`../assets/gifs/${name}${extension}`, import.meta.url).href;

    if (await checkImageExists(imageUrlAttempt)) {
      // 在这里直接处理获取到的最终图片 URL
      return imageUrlAttempt;
    }
  }

  // console.error('Image not found for name:', name);
  return '';
}

// 获取图标
export async function getIconUrl(name) {
  const possibleExtensions = ['.png', '.jpeg', '.jpg'];

  for (const extension of possibleExtensions) {
    const imageUrlAttempt = new URL(`../assets/icons/${name}${extension}`, import.meta.url).href;

    if (await checkImageExists(imageUrlAttempt)) {
      // 在这里直接处理获取到的最终图片 URL
      return imageUrlAttempt;
    }
  }

  // console.error('Image not found for name:', name);
  return '';
}

// 检查图片是否存在
function checkImageExists(imageUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageUrl;

    img.onload = () => {
      resolve(true);
    };

    img.onerror = () => {
      resolve(false);
    };
  });
}
