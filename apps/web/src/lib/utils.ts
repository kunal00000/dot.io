import { Metadata } from 'next';
import parse from 'node-html-parser';

export function constructMetadata({
  title = 'Dot.io - Link shortener',
  description = 'Dot.io is a link management tool to create, share, and track short links.',
  image = 'https://dub.co/_static/thumbnail.png',
  icons = '/favicon.ico',
  noIndex = false
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@kunalvermax'
    },
    icons,
    metadataBase: new URL('https://dub.co'),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false
      }
    })
  };
}

const getHtml = async (url: string) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // timeout if it takes longer than 5 seconds
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'dub-bot/1.0'
      }
    });
    clearTimeout(timeoutId);
    return await response.text();
  } catch (error: any) {
    if (error.name === 'AbortError') {
      // Handle fetch request abort (e.g., due to timeout)
      console.error('Fetch request aborted due to timeout.');
    } else {
      // Handle other fetch errors
      console.error('Fetch request failed:', error);
    }
    return null;
  }
};

const getHeadChildNodes = (html: string) => {
  const ast = parse(html); // parse the html into AST format with node-html-parser
  const metaTags = ast.querySelectorAll('meta').map(({ attributes }) => {
    const property = attributes.property || attributes.name || attributes.href;
    return {
      property,
      content: attributes.content
    };
  });
  const title = ast.querySelector('title')?.innerText;
  const linkTags = ast.querySelectorAll('link').map(({ attributes }) => {
    const { rel, href } = attributes;
    return {
      rel,
      href
    };
  });

  return { metaTags, title, linkTags };
};

const getRelativeUrl = (url: string, imageUrl: string) => {
  if (!imageUrl) {
    return '';
  }
  if (isValidUrl(imageUrl)) {
    return imageUrl;
  }
  const { protocol, host } = new URL(url);
  const baseURL = `${protocol}//${host}`;
  return new URL(imageUrl, baseURL).toString();
};

export const getMetaTags = async (url: string) => {
  const html = await getHtml(url);
  const domain = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\?/]+)/)![1];
  if (!html) {
    return {
      title: domain || url,
      description: 'No description',
      image: ''
    };
  }
  const { metaTags, title: titleTag, linkTags } = getHeadChildNodes(html);

  let object: any = {};

  for (let k in metaTags) {
    let { property, content } = metaTags[k];

    property && (object[property] = content);
  }

  for (let m in linkTags) {
    let { rel, href } = linkTags[m];

    rel && (object[rel] = href);
  }

  const title = object['og:title'] || object['twitter:title'] || titleTag;

  const description =
    object['description'] ||
    object['og:description'] ||
    object['twitter:description'];

  const image =
    object['og:image'] ||
    object['twitter:image'] ||
    object['image_src'] ||
    object['icon'] ||
    object['shortcut icon'];

  return {
    title: title || domain || url,
    description: description || 'No description',
    image: getRelativeUrl(url, image)
  };
};

export const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};
