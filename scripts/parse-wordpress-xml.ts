/**
 * Script per parsare il file XML di WordPress ed estrarre:
 * - Tutte le immagini (wp:attachment_url)
 * - Tutti gli articoli (post/page con status publish)
 */

import { parseString } from 'xml2js';
import fs from 'fs';
import path from 'path';

interface WordPressPost {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  date: string;
  featuredImage?: string;
  status: string;
  type: string;
}

interface WordPressImage {
  url: string;
  title: string;
  date: string;
}

async function parseWordPressXML(xmlPath: string) {
  const xmlContent = fs.readFileSync(xmlPath, 'utf-8');
  
  const images: WordPressImage[] = [];
  const posts: WordPressPost[] = [];
  
  // Parse con regex per estrarre immagini
  const imageUrlPattern = /<wp:attachment_url><!\[CDATA\[(.*?)\]\]><\/wp:attachment_url>/g;
  let match;
  
  while ((match = imageUrlPattern.exec(xmlContent)) !== null) {
    if (match[1]) {
      images.push({
        url: match[1],
        title: '',
        date: ''
      });
    }
  }
  
  // Parse con xml2js per estrarre post strutturati
  parseString(xmlContent, { 
    trim: true,
    explicitArray: false,
    tagNameProcessors: [(name) => name.replace('wp:', '').replace('content:', '').replace('excerpt:', '')]
  }, (err, result) => {
    if (err) {
      console.error('Errore parsing XML:', err);
      return;
    }
    
    const items = result.rss.channel.item;
    
    if (Array.isArray(items)) {
      items.forEach((item: any) => {
        const postType = item.post_type?._text || item.post_type || '';
        const status = item.status?._text || item.status || '';
        
        // Estrai solo post pubblicati (non attachment, non draft)
        if ((postType === 'post' || postType === 'page') && status === 'publish') {
          const title = item.title?._text || item.title || 'Senza titolo';
          const content = item.encoded?._text || item.encoded || '';
          const excerpt = item.encoded?._text || item.encoded || '';
          const slug = item.post_name?._text || item.post_name || '';
          const date = item.post_date?._text || item.post_date || '';
          
          posts.push({
            title: cleanContent(title),
            slug,
            content: cleanContent(content),
            excerpt: excerpt.substring(0, 300),
            date,
            status,
            type: postType
          });
        }
      });
    }
  });
  
  return { images, posts };
}

function cleanContent(html: string): string {
  // Rimuove HTML tags ma mantiene struttura testuale
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Esegui parsing
const xmlFilePath = path.join(process.cwd(), 'user-uploads://francescocitino.WordPress.2025-11-27.xml');
parseWordPressXML(xmlFilePath).then(({ images, posts }) => {
  console.log(`\n✅ Immagini trovate: ${images.length}`);
  console.log(`✅ Articoli trovati: ${posts.length}\n`);
  
  console.log('--- IMMAGINI ---');
  images.slice(0, 10).forEach((img, i) => {
    console.log(`${i + 1}. ${img.url}`);
  });
  
  console.log('\n--- ARTICOLI ---');
  posts.forEach((post, i) => {
    console.log(`${i + 1}. ${post.title} (${post.date})`);
  });
  
  // Salva risultati in JSON
  fs.writeFileSync('extracted-content.json', JSON.stringify({ images, posts }, null, 2));
  console.log('\n✅ Contenuti salvati in extracted-content.json');
});
